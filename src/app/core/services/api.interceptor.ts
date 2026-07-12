import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ErrorHandler } from './error.handler';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    let cloned = req;

    if (token) {
      cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    const started = Date.now();

    return next.handle(cloned).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.log(`[HTTP] ${event.status} ${req.method} ${req.urlWithParams} (${elapsed}ms)`);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        const apiError = ErrorHandler.handle(err);
        console.error('[ApiInterceptor] API Error:', apiError);
        return throwError(() => apiError);
      })
    );
  }
}
