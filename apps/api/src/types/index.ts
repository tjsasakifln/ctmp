// Common types

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// WhatsApp types
export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  text?: {
    body: string;
  };
}

export interface WhatsAppTextMessage {
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

export interface WhatsAppTemplateMessage {
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

export type WhatsAppOutgoingMessage = WhatsAppTextMessage | WhatsAppTemplateMessage;

// Legal system types
export type EventOrigin = 'datajud' | 'djen';

export interface LegalEvent {
  codigo: string;
  titulo: string;
  descricao: string;
  data_evento: string; // ISO 8601
  origem: EventOrigin;
}

export interface DataJudMovement extends LegalEvent {
  origem: 'datajud';
}

export interface DJENPublicacao extends LegalEvent {
  origem: 'djen';
}

// Client/Case types
export interface Client {
  id: string;
  phoneE164: string;
  nome: string | null;
  cpf: string | null;
  createdAt: Date;
}

export interface Case {
  id: string;
  clientId: string;
  nup: string;
  tribunal: string | null;
  etiqueta: string | null;
  createdAt: Date;
}

export interface Event {
  id: string;
  caseId: string;
  origem: EventOrigin;
  codigo: string;
  titulo: string;
  descricao: string | null;
  dataEvento: Date;
  raw: unknown;
  createdAt: Date;
}

// Request context
export interface RequestContext {
  requestId: string;
  clientId?: string;
  caseId?: string;
}
