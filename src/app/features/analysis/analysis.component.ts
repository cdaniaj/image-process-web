import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../core/services/patient.service';
import { AnalysisResponse } from '../../core/services/models/patient.model';
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
  patientName = '';
  patientId = '';
  imagePreviewUrl: string | null = null;
  imageCardId = '';
  loading = false;
  loadingMessage = 'IA está analisando...';
  useMock = true;
  result: AnalysisResponse | null = null;
  error: any = null;

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

  onAnalyze(): void {
    if (!this.selectedFile) return;
    
    this.loading = true;
    this.loadingMessage = 'IA está analisando...';
    this.result = null;
    this.error = null;

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
      ? this.patientService.analyzeImageMock(this.selectedFile!, this.patientName, this.patientId)
      : this.patientService.analyzeImage(this.selectedFile!, this.patientName, this.patientId);

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
    this.result = null;
    this.error = null;
  }

  fileChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;

    this.selectedFile = file;
    this.imageChangedEvent = event;
    this.result = null;
    this.error = null;
    this.stage = 'analysis';
    this.cd.detectChanges();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || '');
    this.croppedImage
    // event.blob can be used to upload the cropped image
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
