import { AppError } from './errors.js';

export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  factor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  retries: 3,
  minTimeout: 1000,
  factor: 2,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > opts.retries) {
        throw error;
      }

      // Don't retry if it's a client error (4xx), unless it's a rate limit (429)
      // We assume AppError with status code is used, or standard Error
      if (error instanceof AppError) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      if (opts.onRetry) {
        opts.onRetry(error, attempt);
      }

      const timeout = opts.minTimeout * Math.pow(opts.factor, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }
}
