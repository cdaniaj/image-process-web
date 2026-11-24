import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AlertRecord } from '../../core/services/models/patient.model';
import { PatientService } from '../../core/services/patient.service';
import { AlertsComponent } from './alerts.component';

describe('AlertsComponent', () => {
  const alert: AlertRecord = {
    alert_id: 'alert-123',
    patient_id: 'SYNTHETIC-001',
    occurred_at: '2026-11-14T12:00:00Z',
    source_modality: 'vitals',
    event_type: 'STATISTICAL_DEVIATION',
    severity: 'REVIEW',
    message: 'Desvio estatístico demonstrativo.',
    evidence: { metric: 'spo2' },
    rule_id: 'demo-vitals-zscore-v1',
    is_synthetic: true,
    status: 'active',
    created_at: '2026-11-14T12:00:00Z',
    acknowledged_at: null,
    closed_at: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: PatientService,
          useValue: {
            getActiveAlerts: vi.fn(() => of([alert])),
            updateAlertStatus: vi.fn(() => of(alert)),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders alerts returned by the service', async () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.patientId = alert.patient_id;
    component.searchAlerts();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fixture.whenStable();

    const rendered = fixture.nativeElement as HTMLElement;
    expect(rendered.querySelector('.alert-card')?.textContent).toContain(
      'Desvio estatístico demonstrativo.'
    );
    expect(rendered.querySelector('.empty-state')).toBeNull();

    fixture.destroy();
  });
});
