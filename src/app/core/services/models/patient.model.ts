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
