import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AlertRecord, AlertStatusUpdate } from '../../core/services/models/patient.model';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent {
  patientId = '';
  activePatientId = '';
  alerts: AlertRecord[] = [];
  loading = false;
  loaded = false;
  error = '';
  lastUpdatedAt: Date | null = null;
  updatingAlertIds = new Set<string>();

  private readonly patientIdSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly patientService: PatientService,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.patientIdSubject
      .pipe(
        switchMap((patientId) =>
          this.patientService.getActiveAlerts(patientId).pipe(
            catchError((error: unknown) => {
              this.error = this.getErrorMessage(error);
              this.loading = false;
              this.changeDetector.markForCheck();
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((alerts) => {
        this.alerts = alerts;
        this.error = '';
        this.loading = false;
        this.loaded = true;
        this.lastUpdatedAt = new Date();
        this.changeDetector.markForCheck();
      });
  }

  searchAlerts(): void {
    const patientId = this.patientId.trim();
    if (!patientId) {
      return;
    }

    this.activePatientId = patientId;
    this.alerts = [];
    this.error = '';
    this.loading = true;
    this.loaded = false;
    this.patientIdSubject.next(patientId);
  }

  refreshAlerts(): void {
    if (!this.activePatientId) {
      return;
    }

    this.error = '';
    this.loading = true;
    this.patientIdSubject.next(this.activePatientId);
  }

  updateStatus(alert: AlertRecord, status: AlertStatusUpdate): void {
    if (this.updatingAlertIds.has(alert.alert_id)) {
      return;
    }

    this.error = '';
    this.updatingAlertIds = new Set(this.updatingAlertIds).add(alert.alert_id);
    this.patientService.updateAlertStatus(alert.alert_id, status).subscribe({
      next: (updatedAlert) => {
        this.alerts =
          status === 'closed'
            ? this.alerts.filter((item) => item.alert_id !== updatedAlert.alert_id)
            : this.alerts.map((item) =>
                item.alert_id === updatedAlert.alert_id ? updatedAlert : item
              );
        this.updatingAlertIds = this.withoutUpdatingAlert(updatedAlert.alert_id);
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.getErrorMessage(error);
        this.updatingAlertIds = this.withoutUpdatingAlert(alert.alert_id);
        this.changeDetector.markForCheck();
      },
    });
  }

  private withoutUpdatingAlert(alertId: string): Set<string> {
    const updatingAlertIds = new Set(this.updatingAlertIds);
    updatingAlertIds.delete(alertId);
    return updatingAlertIds;
  }

  private getErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'detail' in error &&
      typeof error.detail === 'string'
    ) {
      return error.detail;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Não foi possível carregar ou atualizar os alertas.';
  }
}
