import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../core/services/patient.service';
import {
  AnalysisResponse,
  AudioAnalysisResponse,
  AssistantMessage,
  VideoAnalysisResponse,
  PrescriptionCompareResponse,
  PrescriptionItem,
} from '../../core/services/models/patient.model';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';
import { MarkdownModule } from 'ngx-markdown';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule,
    MarkdownModule,
    ImageCropperComponent,
    MatSidenavModule,
    MatIconModule
],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
})
export class AnalysisComponent {
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl  = '';

  selectedFile: File | null = null;
  croppedFile: File | null = null;
  patientName = '';
  patientId = '';
  imagePreviewUrl: string | null = null;
  imageCardId = '';
  loading = false;
  loadingMessage = 'IA está analisando...';
  useMock = false;
  result: AnalysisResponse | null = null;
  error: any = null;

  assistantSessionId = this.createSessionId();
  assistantQuery = '';
  assistantLoading = false;
  assistantError = '';
  assistantMessages: AssistantMessage[] = [];
  assistantSources: string[] = [];
  assistantDisclaimer = 'Sugestão de IA para auxílio médico. Validação humana obrigatória.';
  assistantOpen = false;

  stage: 'analysis' | 'result' | 'error' = 'analysis';

  audioFile: File | null = null;
  audioAnalysis: AudioAnalysisResponse | null = null;
  audioLoading = false;
  audioError = '';
  audioIsSynthetic = false;
  readonly maxAudioBytes = 25 * 1024 * 1024;
  private readonly supportedAudioExtensions = ['.wav', '.mp3', '.ogg'];
  videoFile: File | null = null;
  videoAnalysis: VideoAnalysisResponse | null = null;
  videoLoading = false;
  videoError = '';
  videoIsSynthetic = false;
  readonly maxVideoBytes = 20 * 1024 * 1024;
  private readonly supportedVideoExtensions = ['.mp4', '.avi'];

  previousPrescription: PrescriptionItem[] = [
    { medication: 'Medicamento A', dose: '10 mg', route: 'oral', frequency: '1 vez ao dia' },
    { medication: 'Medicamento B', dose: '5 mg', route: 'oral', frequency: '2 vezes ao dia' },
  ];
  currentPrescription: PrescriptionItem[] = [
    { medication: 'Medicamento A', dose: '20 mg', route: 'oral', frequency: '1 vez ao dia' },
    { medication: 'Medicamento C', dose: '2 mg', route: 'oral', frequency: '1 vez ao dia' },
  ];
  prescriptionComparison: PrescriptionCompareResponse | null = null;
  prescriptionLoading = false;
  prescriptionError = '';

  private preparingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private patientService: PatientService, 
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  onConfirmSample(): void {
    if (this.result?.patient_data) {
      this.patientService.confirmSample(this.result?.patient_data)
      .subscribe((response: any) => {
        console.log("confirm sample result::: ", response);
      });
    }
  }

  onTrainModel(): void {
    this.patientService.trainModel()
    .subscribe((result) => {
      console.log(result);
    });
  }

  onAskAssistant(): void {
    const query = this.assistantQuery.trim();

    if (!query || !this.patientId.trim() || this.assistantLoading) {
      return;
    }

    this.assistantMessages.push({ role: 'user', content: query });
    this.assistantQuery = '';
    this.assistantLoading = true;
    this.assistantError = '';

    this.patientService
      .chatWithAssistant(this.patientId, query, this.assistantSessionId)
      .pipe(
        finalize(() => {
          this.assistantLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.assistantMessages.push({
            role: 'assistant',
            content: response.response,
          });
          this.assistantSources = response.sources;
          this.assistantDisclaimer = response.disclaimer;
        },
        error: () => {
          this.assistantError = 'Não foi possível obter uma resposta do assistente.';
        },
      });
  }

  toggleAssistant(): void {
    this.assistantOpen = !this.assistantOpen;
  }

  onAudioFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.audioFile = null;
    this.audioAnalysis = null;
    this.audioError = '';

    if (!file) {
      return;
    }

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!this.supportedAudioExtensions.includes(extension)) {
      this.audioError = 'Formato não suportado. Selecione um arquivo WAV, MP3 ou OGG.';
      input.value = '';
      return;
    }

    if (file.size > this.maxAudioBytes) {
      this.audioError = 'O áudio excede o limite de 25 MB.';
      input.value = '';
      return;
    }

    this.audioFile = file;
  }

  onAnalyzeAudio(): void {
    if (!this.audioFile || !this.patientId.trim() || this.audioLoading) {
      return;
    }

    this.audioLoading = true;
    this.audioError = '';
    this.audioAnalysis = null;

    this.patientService
      .analyzeAudio(this.audioFile, this.patientId.trim(), this.audioIsSynthetic)
      .pipe(
        finalize(() => {
          this.audioLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.audioAnalysis = response;
        },
        error: (error: unknown) => {
          if (
            typeof error === 'object' &&
            error !== null &&
            'detail' in error &&
            typeof error.detail === 'string'
          ) {
            this.audioError = error.detail;
            return;
          }

          this.audioError = error instanceof Error
            ? error.message
            : 'Não foi possível analisar o áudio. Tente novamente.';
        },
      });
  }

  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.videoFile = null;
    this.videoAnalysis = null;
    this.videoError = '';

    if (!file) {
      return;
    }

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!this.supportedVideoExtensions.includes(extension)) {
      this.videoError = 'Formato não suportado. Selecione um arquivo MP4 ou AVI.';
      input.value = '';
      return;
    }

    if (file.size > this.maxVideoBytes) {
      this.videoError = 'O vídeo excede o limite de 20 MiB.';
      input.value = '';
      return;
    }

    this.videoFile = file;
  }

  onAnalyzeVideo(): void {
    if (!this.videoFile || !this.patientId.trim() || this.videoLoading) {
      return;
    }

    this.videoLoading = true;
    this.videoError = '';
    this.videoAnalysis = null;

    this.patientService
      .analyzeVideo(this.videoFile, this.patientId.trim(), this.videoIsSynthetic)
      .pipe(
        finalize(() => {
          this.videoLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.videoAnalysis = response;
        },
        error: (error: unknown) => {
          if (
            typeof error === 'object' &&
            error !== null &&
            'detail' in error &&
            typeof error.detail === 'string'
          ) {
            this.videoError = error.detail;
            return;
          }

          this.videoError =
            error instanceof Error
              ? error.message
              : 'Não foi possível analisar o vídeo. Tente novamente.';
        },
      });
  }

  onComparePrescriptions(): void {
    const patientId = this.patientId.trim();
    if (!patientId || this.prescriptionLoading) {
      return;
    }

    const currentRecordedAt = new Date();
    const previousRecordedAt = new Date(currentRecordedAt.getTime() - 60 * 60 * 1000);
    this.prescriptionLoading = true;
    this.prescriptionError = '';
    this.prescriptionComparison = null;

    this.patientService
      .comparePrescriptions({
        patient_id: patientId,
        is_synthetic: true,
        previous_recorded_at: previousRecordedAt.toISOString(),
        current_recorded_at: currentRecordedAt.toISOString(),
        previous: this.previousPrescription,
        current: this.currentPrescription,
      })
      .pipe(
        finalize(() => {
          this.prescriptionLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.prescriptionComparison = response;
        },
        error: (error: unknown) => {
          if (
            typeof error === 'object' &&
            error !== null &&
            'detail' in error &&
            typeof error.detail === 'string'
          ) {
            this.prescriptionError = error.detail;
            return;
          }

          this.prescriptionError =
            error instanceof Error
              ? error.message
              : 'Não foi possível comparar as prescrições. Tente novamente.';
        },
      });
  }

    onAssistantKeydown(event: KeyboardEvent): void {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.onAskAssistant();
      }
    }

  onAnalyze(): void {
    const fileToSend = this.croppedFile ?? this.selectedFile;

    if (!fileToSend) return;
    
    this.loading = true;
    this.loadingMessage = 'IA está analisando...';
    this.result = null;
    this.error = null;
    this.resetAssistant();

    if (this.preparingTimeout) {
      window.clearTimeout(this.preparingTimeout);
    }

    this.preparingTimeout = window.setTimeout(() => {
      if (this.loading) {
        this.loadingMessage = 'IA está preparando a resposta...';
        this.cd.detectChanges();
      }
    }, 1800);

    const obs = this.useMock
      ? this.patientService.analyzeImageMock(fileToSend, this.patientName, this.patientId)
      : this.patientService.analyzeImage(fileToSend, this.patientName, this.patientId);

    obs
      .pipe(
        finalize(() => {
          if (this.preparingTimeout) {
            window.clearTimeout(this.preparingTimeout);
            this.preparingTimeout = null;
          }
          this.loading = false;
          this.stage = 'result';
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.result = res;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.error = err;
        },
      });
  }

  clear(): void {
    this.selectedFile = null;
    this.croppedFile = null;
    this.croppedImage = '';
    this.imageChangedEvent = null;
    this.result = null;
    this.error = null;
  }

  fileChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;

    this.selectedFile = file;
    this.croppedFile = null;
    this.croppedImage = '';
    this.imageChangedEvent = event;
    this.result = null;
    this.error = null;
    this.stage = 'analysis';
    this.resetAssistant();
    this.cd.detectChanges();
  }

  private resetAssistant(): void {
    this.assistantSessionId = this.createSessionId();
    this.assistantQuery = '';
    this.assistantLoading = false;
    this.assistantError = '';
    this.assistantMessages = [];
    this.assistantSources = [];
    this.assistantDisclaimer = 'Sugestão de IA para auxílio médico. Validação humana obrigatória.';
    this.assistantOpen = false;
  }

  private createSessionId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || '');

    if (event.blob) {
      const fileName = this.selectedFile?.name ?? 'imagem-cropada.png';
      this.croppedFile = new File([event.blob], fileName, {
        type: event.blob.type || 'image/png',
      });
      return;
    }

    if (event.base64) {
      const fileName = this.selectedFile?.name ?? 'imagem-cropada.png';
      const blob = this.base64ToBlob(event.base64, 'image/png');
      this.croppedFile = new File([blob], fileName, { type: 'image/png' });
      return;
    }

    this.croppedFile = null;
  }

  private base64ToBlob(base64: string, type = 'image/png'): Blob {
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  imageLoaded(image: LoadedImage) {
      // show cropper
  }

  cropperReady() {
      // cropper ready
  }

  loadImageFailed() {
      // show message
  }
}
