import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpPaymentsProvider } from './http-provider.js';
import { env } from '../../config/env.js';
import { ExternalServiceError } from '../../utils/errors.js';

// Mock env
vi.mock('../../config/env.js', () => ({
    env: {
        PAYMENTS_API_URL: 'http://api.payments.com',
        PAYMENTS_API_KEY: 'secret-key',
    },
}));

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('HttpPaymentsProvider', () => {
    let provider: HttpPaymentsProvider;
    const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
        provider = new HttpPaymentsProvider(mockLogger);
    });

    it('should create payment successfully on first attempt', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'pay_123', url: 'http://pay.com/123' }),
        });

        const result = await provider.criarCobranca({
            clienteId: 'cust_1',
            valor: 100,
            descricao: 'Test payment',
        });

        expect(result).toEqual({
            paymentId: 'pay_123',
            paymentUrl: 'http://pay.com/123',
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx error and succeed', async () => {
        // Fail twice with 503, then succeed
        fetchMock
            .mockResolvedValueOnce({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 502,
                statusText: 'Bad Gateway',
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 'pay_456', url: 'http://pay.com/456' }),
            });

        const result = await provider.criarCobranca({
            clienteId: 'cust_2',
            valor: 200,
            descricao: 'Retry payment',
        });

        expect(result).toEqual({
            paymentId: 'pay_456',
            paymentUrl: 'http://pay.com/456',
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
        // Always fail with 500
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        });

        await expect(
            provider.criarCobranca({
                clienteId: 'cust_3',
                valor: 300,
                descricao: 'Fail payment',
            })
        ).rejects.toThrow(ExternalServiceError);

        // Initial + 3 retries = 4 attempts
        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(mockLogger.error).toHaveBeenCalled();
    }, 15000);

    it('should NOT retry on 400 error', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
        });

        await expect(
            provider.criarCobranca({
                clienteId: 'cust_4',
                valor: 400,
                descricao: 'Bad payment',
            })
        ).rejects.toThrow(ExternalServiceError);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });
});
