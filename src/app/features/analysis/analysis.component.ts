import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../core/services/patient.service';
import {
  AnalysisResponse,
  AssistantMessage,
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
