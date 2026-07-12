import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  PatientDiagnosticModel,
  AnalysisResponse,
  ConfirmSampleResponse,
  TrainModelResponse,
} from './models/patient.model';
import { ErrorHandler } from './error.handler';
import { patient_data } from '../mocks/patient_data';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private baseEndpoint = 'http://localhost:8000';

  constructor(private api: ApiService, private http: HttpClient) {
    // If ApiService exposes baseUrl, keep baseEndpoint empty; otherwise can set here
  }

  analyzeImage(file: File, patientName: string, patientId: string): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_name', patientName);
    formData.append('patient_id', patientId);

      return this.http.post<AnalysisResponse>(`${this.baseEndpoint}/analyze`, formData);
  }

    /**
     * Returns a mocked AnalysisResponse observable for local testing.
     */
    analyzeImageMock(file: File, patientName: string, patientId: string): Observable<AnalysisResponse> {
      const mockValue = patient_data(patientName, patientId, file);

      // simulate network latency
      return of(mockValue).pipe(delay(800));
    }

  confirmSample(patientData: PatientDiagnosticModel): Observable<ConfirmSampleResponse> {
    return this.http.post<ConfirmSampleResponse>(`${this.baseEndpoint}/confirm`, patientData).pipe(
      tap((res) => console.log('[PatientService] confirmSample', res)),
      catchError((err) => {
        const apiError = ErrorHandler.handle(err);
        console.error('[PatientService] confirmSample error:', apiError);
        return throwError(() => apiError);
      })
    );
  }

  trainModel(): Observable<TrainModelResponse> {
    return this.http.post<TrainModelResponse>(`${this.baseEndpoint}/model`, {}).pipe(
      tap((res) => console.log('[PatientService] trainModel', res)),
      catchError((err) => {
        const apiError = ErrorHandler.handle(err);
        console.error('[PatientService] trainModel error:', apiError);
        return throwError(() => apiError);
      })
    );
  }

  generateReports(): Observable<{ status: string }> {
    return this.api.post<{ status: string }>('/reports', {}).pipe(
      tap((res) => console.log('[PatientService] generateReports', res)),
      catchError((err) => {
        const apiError = ErrorHandler.handle(err);
        console.error('[PatientService] generateReports error:', apiError);
        return throwError(() => apiError);
      })
    );
  }

  /**
   * Solicita ao backend uma explicação gerada por LLM para o diagnóstico
   */
  // LLM explanation is returned inside the analyze response; no separate endpoint required.
}
