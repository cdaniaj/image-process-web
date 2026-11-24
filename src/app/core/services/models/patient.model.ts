export interface PatientData {
  name: string;
  id: string;
  email?: string;
  date_of_birth?: string;
}

export interface PatientDiagnosticModel {
  name: string;
  file_name: string;
  id: string;
  area_mean: number;
  perimeter_mean: number;
  compactness_mean: number;
  concavity_mean: number;
  radius_mean: number;
  risk_score: number;
  risk_label: 'no_risk' | 'moderate_risk' | 'high_risk';
  prediction: number;
  prediction_lr: number;
  risk_score_lr: number;
  finalConsensus: number;
  llm_explanation: string;
  llm_insights?: string;
}

export interface AnalysisResponse {
  name: string;
  id: string;
  area: number;
  perimeter: number;
  circularity: number;
  solidity: number;
  risk_score: number;
  risk_label: 'no_risk' | 'moderate_risk' | 'high_risk';
  patient_data: PatientDiagnosticModel;
}

export interface ConfirmSampleRequest extends PatientDiagnosticModel {}

export interface ConfirmSampleResponse {
  status: 'success' | 'error';
  message?: string;
}

export interface TrainModelResponse {
  status: 'success' | 'error';
  message?: string;
  metrics?: {
    accuracy: number;
    f1_score: number;
  };
}

export interface AssistantResponse {
  response: string;
  sources: string[];
  disclaimer: string;
  session_id: string;
}

export interface AudioAnalysisResponse {
  patient_id: string;
  transcription: string;
  detected_symptoms: string[];
  sentiment_analysis: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence_scores: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  clinical_alerts: string[];
  alerts_created: AlertRecord[];
  disclaimer: string;
}

export interface VideoAnalysisResponse {
  patient_id: string;
  is_synthetic: boolean;
  exercise: 'bilateral_arm_raise_front';
  frames_analyzed: number;
  pose_frames: number;
  arm_elevation_threshold_deg: number;
  maximum_elevation_deg: {
    left: number;
    right: number;
  };
  deviation_score: number;
  anomalies_detected: boolean;
  measurements: Array<{
    timestamp_sec: number;
    left_elevation_deg: number;
    right_elevation_deg: number;
  }>;
  events: Array<{
    timestamp_sec: number;
    type: 'ARM_RAISE_BELOW_DEMO_THRESHOLD';
    side: 'left' | 'right';
    measured_elevation_deg: number;
    threshold_deg: number;
    description: string;
  }>;
  alerts_created: AlertRecord[];
  report_summary: string;
}

export interface PrescriptionItem {
  medication: string;
  dose: string;
  route: string;
  frequency: string;
}

export interface PrescriptionCompareRequest {
  patient_id: string;
  is_synthetic: true;
  previous_recorded_at: string;
  current_recorded_at: string;
  previous: PrescriptionItem[];
  current: PrescriptionItem[];
}

export interface PrescriptionChange {
  type: 'added' | 'removed' | 'modified';
  medication: string;
  previous: PrescriptionItem | null;
  current: PrescriptionItem | null;
  changed_fields: Array<'dose' | 'route' | 'frequency'>;
}

export interface PrescriptionCompareResponse {
  patient_id: string;
  is_synthetic: true;
  changes_detected: boolean;
  changes: PrescriptionChange[];
  alerts_created: AlertRecord[];
  explanation: string;
}

export type AlertStatus = 'active' | 'acknowledged' | 'closed';
export type AlertStatusUpdate = Exclude<AlertStatus, 'active'>;

export interface AlertRecord {
  alert_id: string;
  patient_id: string;
  occurred_at: string;
  source_modality: 'audio' | 'video' | 'vitals' | 'prescription' | 'movement' | 'image';
  event_type: string;
  severity: 'INFO' | 'REVIEW';
  message: string;
  evidence: Record<string, unknown>;
  rule_id: string;
  is_synthetic: boolean;
  status: AlertStatus;
  created_at: string;
  acknowledged_at: string | null;
  closed_at: string | null;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}
