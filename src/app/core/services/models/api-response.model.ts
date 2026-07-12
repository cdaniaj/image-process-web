export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  detail?: string | T;
  message?: string;
}

export interface ApiError {
  status: number;
  detail: string;
  timestamp: string;
  path?: string;
}
