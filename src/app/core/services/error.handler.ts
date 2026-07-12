import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models/api-response.model';
import { timer, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export class ErrorHandler {
  static handle(error: any): ApiError {
    if (error instanceof HttpErrorResponse) {
      return {
        status: error.status || 0,
        detail: (error.error && (error.error.detail || error.error.message)) || error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        //path: error.url,
      };
    }

    if (error && (error.status || error.detail)) {
      return {
        status: error.status || 500,
        detail: error.detail || error.message || 'Erro desconhecido',
        timestamp: new Date().toISOString(),
        path: error.path,
      };
    }

    return {
      status: 500,
      detail: error?.message || 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    };
  }

  static isRetryable(status: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  static getErrorMessage(status: number, detail?: string): string {
    const messages: { [key: number]: string } = {
      400: 'Requisição inválida',
      401: 'Não autenticado',
      403: 'Acesso proibido',
      404: 'Recurso não encontrado',
      408: 'Tempo de requisição esgotado',
      429: 'Muitas requisições',
      500: 'Erro interno do servidor',
      502: 'Gateway indisponível',
      503: 'Serviço indisponível',
      504: 'Tempo limite do gateway',
    };

    return messages[status] || detail || 'Erro desconhecido';
  }

  /**
   * Retry strategy for RxJS `retryWhen` operator with exponential backoff.
   */
  static retryWithBackoff(maxRetry = 3, initialDelay = 1000) {
    return (errors: any) =>
      errors.pipe(
        mergeMap((error: any, index: number) => {
          const attempt = index + 1;
          const status = error?.status ?? error?.statusCode ?? 0;

          if (!ErrorHandler.isRetryable(status) || attempt > maxRetry) {
            return throwError(() => error);
          }

          const delayMs = initialDelay * Math.pow(2, index);
          console.warn(`[Retry] tentativa ${attempt} em ${delayMs}ms para status ${status}`);
          return timer(delayMs);
        })
      );
  }
}
