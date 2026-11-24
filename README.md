# ImageProcessWeb

Uma aplicação web de análise de imagens médicas utilizada para processamento e diagnóstico de imagens com suporte a IA/LLM. A aplicação foi desenvolvida com **Angular 21** e **TypeScript**, implementando funcionalidades de upload, análise de imagens, recorte, e previsões de risco com explicações geradas por modelos de linguagem.

## 📋 Visão Geral

**ImageProcessWeb** é uma aplicação web que permite:

- ✅ Upload e análise de imagens médicas
- ✅ Recorte (cropping) de imagens com interface intuitiva
- ✅ Análise em tempo real com feedback visual
- ✅ Suporte a modo mock/simulado para testes locais
- ✅ Explicações geradas por LLM para diagnósticos
- ✅ Scores de risco (sem risco, risco moderado, risco alto)
- ✅ Confirmação de amostras e treinamento de modelos
- ✅ Consulta e atualização de estado de alertas demonstrativos
- ✅ Análise local demonstrativa de elevação bilateral dos braços em vídeo
- ✅ Design responsivo com Angular Material 21

---

## 🏗️ Arquitetura

### Stack Técnico

```
Frontend:     Angular 21.2 + TypeScript 5.9
UI Framework: Angular Material 21
Styling:      SCSS
Test Runner:  Vitest 4.0
Build:        Angular CLI 21.2.16
Runtime:      Node.js 20 (desenvolvimento)
Containerização: Docker (Alpine Linux + Nginx)
```

### Estrutura do Projeto

```
src/
├── app/
│   ├── app.ts                              # Root component
│   ├── app.config.ts                       # Configuração de providers
│   ├── app.routes.ts                       # Rotas da aplicação
│   ├── app.html                            # Template root
│   ├── app.scss                            # Estilos root
│   │
│   ├── core/
│   │   └── services/
│   │       ├── api.interceptor.ts          # Interceptor HTTP (auth, logging)
│   │       ├── api.service.ts              # Serviço base para requisições
│   │       ├── error.handler.ts            # Tratamento centralizado de erros
│   │       ├── patient.service.ts          # Serviço de análise de pacientes
│   │       └── models/
│   │           ├── patient.model.ts        # Interfaces de dados do paciente
│   │           └── api-response.model.ts   # Interfaces de resposta API
│   │
│   ├── features/
│   │   ├── analysis/
│   │       ├── analysis.component.ts       # Componente principal de análise
│   │       ├── analysis.component.html     # Template de análise
│   │       └── analysis.component.scss     # Estilos do componente
│   │   └── alerts/
│   │       ├── alerts.component.ts         # Consulta manual e ações de alertas
│   │       ├── alerts.component.html       # Central de alertas
│   │       └── alerts.component.scss       # Estilos da central
│   │
│   └── core/
│       └── mocks/
│           └── patient_data.ts             # Dados mock para testes
│
├── styles.scss                              # Estilos globais (Material Theme)
└── main.ts                                  # Ponto de entrada da aplicação

angular.json                                 # Configuração do Angular CLI
tsconfig.json                               # Configuração TypeScript
tsconfig.app.json                           # Configuração TypeScript para app
tsconfig.spec.json                          # Configuração TypeScript para testes
package.json                                # Dependências e scripts
Dockerfile                                  # Containerização (build + nginx)
```

### Fluxo da Aplicação

```
[index.html] 
    ↓
[main.ts] - Bootstrap
    ↓
[app.config.ts] - Providers (Router, HttpClient, Interceptors, Markdown)
    ↓
[app.ts] - Root Component (RouterOutlet)
    ↓
[app.routes.ts] - Roteamento
    ↓
[AnalysisComponent] - Componente principal
    ├─→ [PatientService] - Requisições de análise
    │   ├─→ [ApiInterceptor] - Adiciona token de autenticação
    │   └─→ [ErrorHandler] - Trata e padroniza erros
    └─→ [UI] - Angular Material Components
        ├─ Sidenav (cards de resultados)
        ├─ Progress Spinner (loading)
        ├─ Image Cropper (recorte)
        └─ Markdown (explicações do LLM)
```

### Componentes Chave

#### **1. ApiInterceptor** (`src/app/core/services/api.interceptor.ts`)
- Injeta token Bearer na requisição (`Authorization: Bearer <token>`)
- Registra logs de HTTP (status, método, URL, tempo)
- Centraliza tratamento de erros HTTP

#### **2. PatientService** (`src/app/core/services/patient.service.ts`)
- `analyzeImage()` - Envia imagem para análise no backend
- `analyzeImageMock()` - Simula resposta da API (teste local)
- `analyzeAudio()` - Envia áudio para transcrição e análise textual no backend
- `analyzeVideo()` - Envia vídeo curto para análise geométrica demonstrativa de pose
- `getActiveAlerts()` e `updateAlertStatus()` - Consultam e atualizam alertas no backend
- `confirmSample()` - Confirma amostra no backend
- `trainModel()` - Treina modelo no backend

#### **3. AnalysisComponent** (`src/app/features/analysis/analysis.component.ts`)
- Upload de imagens
- Upload e análise textual de áudio
- Upload e análise de movimento em vídeo
- Recorte de imagens (ImageCropper)
- Análise com modo mock/real
- Exibição de resultados
- Confirmação de amostras
- Treinamento de modelos

#### **4. AlertsComponent** (`src/app/features/alerts/alerts.component.ts`)
- Rota `/alerts`, acessível pela navegação principal
- Consulta alertas ativos por `patient_id` quando solicitada pelo usuário
- Permite reconhecer alertas ativos e encerrar alertas reconhecidos
- Exibe modalidade, regra, evidências e indicação de dados sintéticos

#### **5. Models** (`src/app/core/services/models/`)
Interfaces TypeScript para tipagem:
- `PatientData` - Dados básicos do paciente
- `PatientDiagnosticModel` - Dados de diagnóstico com scores
- `AnalysisResponse` - Resposta da análise com explicação LLM
- `ConfirmSampleResponse`, `TrainModelResponse` - Respostas do backend
- `AlertRecord` - Alerta persistido, incluindo origem, evidência e estado

Na rota `/alerts`, informe o identificador do paciente para consultar a API. A tela usa apenas os endpoints já existentes (`GET /alerts/active` e `PATCH /alerts/{alert_id}/status`); a criação continua restrita aos módulos do backend. Utilize somente dados sintéticos, pois a API ainda não implementa autenticação/autorização.

Na análise de áudio, marque a opção de amostra sintética somente quando essa origem for conhecida. Menções afirmativas encontradas no texto geram um alerta demonstrativo no backend, visível na rota `/alerts`; negações e sentimento negativo isolado não criam alerta.

Na análise de vídeo, informe o mesmo identificador de paciente usado na Central de Alertas, selecione um MP4/AVI de até 20 MiB e 10 segundos e envie um clipe filmado de frente, com o corpo inteiro visível, durante a elevação bilateral dos braços. O backend usa MediaPipe Pose Landmarker Lite localmente, amostra até 10 quadros e apresenta ângulos geométricos; o limiar de 80° serve apenas à demonstração, não é clínico. Um alerta `REVIEW` é criado quando algum dos lados fica abaixo desse limiar. Marque a amostra como sintética apenas se o vídeo for comprovadamente sintético. Para carregar o modelo e iniciar a API, siga os passos do README de `image-process-api`; a rota retorna erro explícito se o modelo não estiver instalado.

---

## 🚀 Como Usar

### Pré-requisitos

- **Node.js**: 20.x ou superior
- **npm**: 11.11.0 (conforme declarado em `package.json`)
- **Docker** (opcional, apenas para containerização)

### Instalação e Setup Local

#### 1. Clonar o repositório

```bash
git clone https://github.com/cdaniaj/image-process-web.git
cd image-process-web
```

#### 2. Instalar dependências

```bash
npm install
```

#### 3. Iniciar servidor de desenvolvimento

```bash
npm start
# ou equivalente:
ng serve
```

A aplicação estará disponível em: **`http://localhost:4200/`**

O servidor será recarregado automaticamente ao modificar arquivos.

### Desenvolvimento

#### Gerar um novo componente

```bash
ng generate component novo-componente
# ou abreviado:
ng g c novo-componente
```

As opções de scaffolding padrão criarão componentes com SCSS.

#### Executar testes

```bash
npm test
# ou:
ng test
```

Testes são executados com **Vitest**.

#### Build para produção

```bash
npm run build
# ou:
ng build --configuration=production
```

Artefatos serão gerados em `dist/image-process-web/browser/`.

#### Modo de desenvolvimento (watch)

```bash
npm run watch
# ou:
ng build --watch --configuration development
```

Recompila automaticamente ao detectar mudanças.

---

## 🔌 Integração com Backend

### Endpoint de Análise

**Método**: `POST`  
**URL**: `http://localhost:8000/analyze`  
**Body**: `FormData`

```typescript
FormData fields:
  - file: File          // Arquivo de imagem
  - patient_name: string
  - patient_id: string
```

**Response**: `AnalysisResponse`

```json
{
  "name": "Patient Name",
  "id": "patient-123",
  "area": 150.5,
  "perimeter": 45.2,
  "circularity": 0.85,
  "solidity": 0.92,
  "risk_score": 0.65,
  "risk_label": "moderate_risk",
  "patient_data": {
    "name": "Patient Name",
    "id": "patient-123",
    "file_name": "image.jpg",
    "area_mean": 150.5,
    "perimeter_mean": 45.2,
    "compactness_mean": 0.18,
    "concavity_mean": 0.15,
    "radius_mean": 7.1,
    "risk_score": 0.65,
    "risk_label": "moderate_risk",
    "prediction": 0.72,
    "prediction_lr": 0.68,
    "risk_score_lr": 0.65,
    "finalConsensus": 0.70,
    "llm_explanation": "A análise indica características que sugerem... [explicação detalhada]",
    "llm_insights": "Insights adicionais sobre o diagnóstico"
  }
}
```

### Endpoint de Confirmação

**Método**: `POST`  
**URL**: `http://localhost:8000/confirm`  
**Body**: `PatientDiagnosticModel` (json)

### Endpoint de Treinamento

**Método**: `POST`  
**URL**: `http://localhost:8000/model`  
**Body**: `{}` (json vazio)

### Endpoint de Análise de Áudio

Na tela principal, informe o identificador do paciente, selecione **Selecionar áudio** e envie um arquivo WAV, MP3 ou OGG (até 25 MB). O frontend chama `POST http://localhost:8000/audio/analyze` com `multipart/form-data`:

```text
patient_id: identificador do paciente
audio_file: arquivo de áudio
```

A interface exibe a transcrição, sintomas mencionados no texto, sentimento e alertas retornados pelo backend. Essa etapa não analisa características acústicas da voz nem estabelece diagnóstico. Para usar o serviço, o backend deve estar configurado com as credenciais Azure documentadas no README do `image-process-api`.

### Endpoint de Análise de Vídeo

Na tela principal, informe o identificador do paciente, selecione **Selecionar vídeo** e envie um clipe MP4 ou AVI (até 20 MiB e 10 segundos). O frontend chama `POST http://localhost:8000/video/analyze` com `multipart/form-data`:

```text
patient_id: identificador do paciente
file: vídeo
is_synthetic: true ou false
```

O resultado mostra o número de quadros analisados, os ângulos máximos medidos por lado, eventos abaixo do limiar demonstrativo e alertas criados. Para consultar o alerta posteriormente, abra `/alerts` e repita a consulta sob demanda para o mesmo `patient_id`. Vídeos e quadros não são persistidos. A ausência de pose suficiente produz um erro em vez de um resultado normal. Esta análise não é validada clinicamente.

---

## 🧪 Modo Mock/Simulado

Para simular somente a análise de imagens sem backend:

1. Altere `useMock` para `true` no `AnalysisComponent` (o padrão atual é `false`)
2. Dados mock estão em `src/app/core/mocks/patient_data.ts`
3. O serviço retorna respostas com delay de 800ms para simular latência

Áudio e vídeo usam endpoints reais mesmo quando `useMock` está ativado; para esses fluxos, inicie a API e configure as credenciais Azure exigidas para áudio.

Para alternar o modo de análise de imagens, edite `src/app/features/analysis/analysis.component.ts`:

```typescript
// Linha ~46
useMock = false;  // Mude de true para false
```

---

## 🐳 Containerização com Docker

### Build da imagem Docker

```bash
docker build -t image-process-web:latest .
```

### Executar container

```bash
docker run -p 8080:80 image-process-web:latest
```

A aplicação estará disponível em: **`http://localhost:8080/`**

### Docker Compose (se houver)

```bash
docker compose up -d
```

---

## 🎨 Customização

### Tema Material

O tema Material é configurado em `src/styles.scss`:

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$blue-palette,
      tertiary: mat.$violet-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

Altere `$blue-palette` e `$violet-palette` para customizar cores.

### Variáveis de Ambiente

Crie um arquivo `.env` (não commitado) para configurações:

```env
API_BASE_URL=http://localhost:8000
AUTH_TOKEN=seu_token_aqui
```

Carregue em `src/app/core/services/api.service.ts`.

---

## 📦 Dependências Principais

| Dependência | Versão | Uso |
|---|---|---|
| `@angular/core` | 21.2 | Framework base |
| `@angular/material` | 21.2 | Componentes UI |
| `ngx-image-cropper` | 9.1.6 | Recorte de imagens |
| `ngx-markdown` | 21.3 | Renderização de markdown (explicações LLM) |
| `rxjs` | 7.8 | Programação reativa |
| `typescript` | 5.9 | Tipagem |
| `vitest` | 4.0 | Testes unitários |

---

## 🔐 Segurança

### Tratamento de Erros

Erros são centralizados em `src/app/core/services/error.handler.ts`:

- HTTP 400: Requisição inválida
- HTTP 401: Não autenticado
- HTTP 403: Acesso proibido
- HTTP 408, 429, 5xx: Retentáveis com backoff exponencial

### Sanitização

URLs de imagens cortadas são sanitizadas com `DomSanitizer`:

```typescript
this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || '');
```

---

## 📝 Convenções de Código

- **Componentes**: Standalone (não utilizam módulos)
- **Estilos**: SCSS com componentes auto-scopados
- **Serviços**: Injetados com `providedIn: 'root'`
- **Tipagem**: Interfaces em arquivos `.model.ts`
- **Roteamento**: Lazy loading de componentes

---

## 🛠️ Troubleshooting

### Porta 4200 já em uso

```bash
ng serve --port 4300
```

### Erro de CORS com backend

Configure CORS no backend ou use proxy (`proxy.conf.json`).

### Imagens não carregam no Docker

Verifique `angular.json` - `assets` deve incluir pasta `public/`.

### Tokens de autenticação expirados

O interceptor adiciona o token automaticamente de `localStorage`. Configure refresh token no interceptor se necessário.

---

## 📚 Recursos Adicionais

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.dev)
- [TypeScript](https://www.typescriptlang.org)
- [RxJS](https://rxjs.dev)
- [ngx-image-cropper](https://github.com/Mawi137/ngx-image-cropper)
- [ngx-markdown](https://github.com/jfcere/ngx-markdown)

---

## 👤 Autor

**Carlos Daniele** - [@cdaniaj](https://github.com/cdaniaj)

## 📄 Licença

Este projeto é licenciado sob a MIT License.

---

## 📞 Suporte

Para dúvidas ou reportar issues: [Abrir issue](https://github.com/cdaniaj/image-process-web/issues)
