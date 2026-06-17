export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

export function success<T>(data: T, msg = 'ok'): ApiResponse<T> {
  return { code: 0, msg, data };
}

export function error(msg: string, code = 1): ApiResponse {
  return { code, msg };
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}
