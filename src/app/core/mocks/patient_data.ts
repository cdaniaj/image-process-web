import { AnalysisResponse } from "../services/models/patient.model";

  export function patient_data(patientName: string, patientId: string, file: any): AnalysisResponse {
    return {
        name: patientName || 'Mock Patient',
        id: patientId || 'mock-id-123',
        area: 123.45,
        perimeter: 67.89,
        circularity: 0.78,
        solidity: 0.92,
        risk_score: 0.34,
        risk_label: 'moderate_risk',
        patient_data: {
          name: patientName || 'Mock Patient',
          file_name: file?.name || 'mock.jpg',
          id: patientId || 'mock-id-123',
          area_mean: 12.3,
          perimeter_mean: 4.56,
          compactness_mean: 0.12,
          concavity_mean: 0.05,
          radius_mean: 6.7,
          risk_score: 0.34,
          risk_label: 'moderate_risk',
          prediction: 1,
          prediction_lr: 0.9,
          risk_score_lr: 0.3,
          finalConsensus: 1,
          llm_explanation: `Relatório de Análise de Lesão Mamográfica - Avaliação Assistida por IA

Data: [Inserir Data Atual]
Paciente: [Inserir Nome/ID do Paciente, se disponível]
Exame: Mamografia

---

**1. Análise Clínica Preliminar do Aspecto da Lesão:**

A análise geométrica da lesão revela características altamente suspeitas. A circularidade de 0 indica uma forma marcadamente irregular e não-ovalada, enquanto a solidez de 0 sugere margens espiculadas, lobuladas ou indefinidas, e uma estrutura interna heterogênea. Esses achados são atípicos para lesões benignas, que geralmente apresentam formas mais regulares e margens bem definidas, e são frequentemente associados a processos malignos. Com uma área de 1823.0 mm² e perímetro de 195.88 mm, a lesão é de tamanho considerável e apresenta uma morfologia complexa e desorganizada.

**2. Explicação do Score de Risco Apontado pela IA:**

O modelo de inteligência artificial calculou um score de risco de 94.0% para malignidade. Esta pontuação extremamente elevada classifica a lesão como de alto risco (high_risk), indicando uma probabilidade muito significativa de ser uma neoplasia maligna. A predição da IA corrobora fortemente a suspeita levantada pelas características morfológicas atípicas observadas.

**3. Próximos Passos Sugeridos:**

Considerando a alta probabilidade de malignidade e as características morfológicas suspeitas, a recomendação primária é a realização urgente de uma biópsia percutânea (core biopsy ou vácuo-assistida) guiada por imagem (mamografia, ultrassom ou ressonância magnética, conforme a melhor visibilidade da lesão) para obtenção de amostra histopatológica. Isso é essencial para um diagnóstico definitivo e para guiar o planejamento terapêutico. Adicionalmente, sugere-se a avaliação clínica complementar e a revisão das imagens por um radiologista especialista em mama.

---
À disposição para quaisquer esclarecimentos.`,
llm_insights: ""
        }
      };
  }
  
