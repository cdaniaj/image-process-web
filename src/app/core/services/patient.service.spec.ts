import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PatientService } from './patient.service';
import { AlertRecord, PrescriptionCompareResponse } from './models/patient.model';

describe('PatientService audio analysis', () => {
  let service: PatientService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatientService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PatientService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sends patient id and audio as multipart form data to the audio endpoint', () => {
    const audio = new File(['audio contents'], 'consulta.wav', { type: 'audio/wav' });
    let responsePatientId = '';

    service.analyzeAudio(audio, 'patient-123').subscribe((response) => {
      responsePatientId = response.patient_id;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8000/audio/analyze'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get('patient_id')).toBe('patient-123');
    expect(request.request.body.get('audio_file')).toBeInstanceOf(File);
    expect(request.request.body.get('is_synthetic')).toBe('false');

    request.flush({
      patient_id: 'patient-123',
      transcription: 'Relato de cansaço.',
      detected_symptoms: ['cansaço'],
      sentiment_analysis: {
        overall: 'negative',
        confidence_scores: { positive: 0.05, neutral: 0.15, negative: 0.8 },
      },
      clinical_alerts: [],
      alerts_created: [],
      disclaimer: 'Sugestão de IA para auxílio médico. Validação humana obrigatória.',
    });

    expect(responsePatientId).toBe('patient-123');
  });

  it('fetches active alerts for a patient', () => {
    let response: AlertRecord[] = [];

    service.getActiveAlerts('SYNTHETIC-001').subscribe((alerts) => {
      response = alerts;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8000/alerts/active?patient_id=SYNTHETIC-001'
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);

    expect(response).toEqual([]);
  });

  it('sends video and patient metadata to the video-analysis endpoint', () => {
    const video = new File(['video bytes'], 'arm-raise.mp4', { type: 'video/mp4' });
    let responsePatientId = '';

    service.analyzeVideo(video, 'SYNTHETIC-001', true).subscribe((response) => {
      responsePatientId = response.patient_id;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8000/video/analyze'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get('patient_id')).toBe('SYNTHETIC-001');
    expect(request.request.body.get('file')).toBeInstanceOf(File);
    expect(request.request.body.get('is_synthetic')).toBe('true');
    request.flush({
      patient_id: 'SYNTHETIC-001',
      is_synthetic: true,
      exercise: 'bilateral_arm_raise_front',
      frames_analyzed: 4,
      pose_frames: 4,
      arm_elevation_threshold_deg: 80,
      maximum_elevation_deg: { left: 90, right: 90 },
      deviation_score: 0,
      anomalies_detected: false,
      measurements: [],
      events: [],
      alerts_created: [],
      report_summary: 'Resultado demonstrativo.',
    });

    expect(responsePatientId).toBe('SYNTHETIC-001');
  });

  it('sends synthetic prescription snapshots to the comparison endpoint', () => {
    const payload = {
      patient_id: 'SYNTHETIC-001',
      is_synthetic: true as const,
      previous_recorded_at: '2026-11-05T09:00:00Z',
      current_recorded_at: '2026-11-05T10:00:00Z',
      previous: [
        { medication: 'Medicamento A', dose: '10 mg', route: 'oral', frequency: '1 vez ao dia' },
      ],
      current: [
        { medication: 'Medicamento A', dose: '20 mg', route: 'oral', frequency: '1 vez ao dia' },
      ],
    };
    let response: PrescriptionCompareResponse | undefined;

    service.comparePrescriptions(payload).subscribe((result) => {
      response = result;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8000/prescriptions/compare'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      patient_id: 'SYNTHETIC-001',
      is_synthetic: true,
      changes_detected: true,
      changes: [
        {
          type: 'modified',
          medication: 'Medicamento A',
          previous: payload.previous[0],
          current: payload.current[0],
          changed_fields: ['dose'],
        },
      ],
      alerts_created: [],
      explanation: 'Comparação demonstrativa.',
    });

    expect(response?.changes_detected).toBe(true);
    expect(response?.changes[0].changed_fields).toEqual(['dose']);
  });

  it('updates an alert state', () => {
    let response: AlertRecord | undefined;

    service.updateAlertStatus('alert-123', 'acknowledged').subscribe((alert) => {
      response = alert;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8000/alerts/alert-123/status'
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'acknowledged' });
    request.flush({
      alert_id: 'alert-123',
      patient_id: 'SYNTHETIC-001',
      occurred_at: '2026-11-10T12:00:00Z',
      source_modality: 'vitals',
      event_type: 'STATISTICAL_DEVIATION',
      severity: 'REVIEW',
      message: 'Desvio demonstrativo.',
      evidence: {},
      rule_id: 'demo-vitals-zscore-v1',
      is_synthetic: true,
      status: 'acknowledged',
      created_at: '2026-11-10T12:00:00Z',
      acknowledged_at: '2026-11-10T12:01:00Z',
      closed_at: null,
    });

    expect(response?.status).toBe('acknowledged');
  });
});
