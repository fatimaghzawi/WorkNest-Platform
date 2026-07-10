export type LogLevel = 'info' | 'warning' | 'error';

export interface SystemLog {
  _id: string;
  level: LogLevel;
  message: string;
  source: string;
  category: string;
  statusCode: number | null;
  method: string | null;
  path: string | null;
  userId: string | null;
  actorEmail: string | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string | null;
}

export interface LogStats {
  total: number;
  info: number;
  warning: number;
  error: number;
  last24h: {
    total: number;
    warning: number;
    error: number;
  };
}

export type LogLevelFilter = LogLevel | 'all';

export interface ListLogsParams {
  page?: number;
  limit?: number;
  level?: LogLevelFilter;
  search?: string;
  source?: string;
}
