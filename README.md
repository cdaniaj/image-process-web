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
│   │   └── analysis/
│   │       ├── analysis.component.ts       # Componente principal de análise
│   │       ├── analysis.component.html     # Template de análise
│   │       └── analysis.component.scss     # Estilos do componente
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
- `confirmSample()` - Confirma amostra no backend
- `trainModel()` - Treina modelo no backend

#### **3. AnalysisComponent** (`src/app/features/analysis/analysis.component.ts`)
- Upload de imagens
- Recorte de imagens (ImageCropper)
- Análise com modo mock/real
- Exibição de resultados
- Confirmação de amostras
- Treinamento de modelos

#### **4. Models** (`src/app/core/services/models/`)
Interfaces TypeScript para tipagem:
- `PatientData` - Dados básicos do paciente
- `PatientDiagnosticModel` - Dados de diagnóstico com scores
- `AnalysisResponse` - Resposta da análise com explicação LLM
- `ConfirmSampleResponse`, `TrainModelResponse` - Respostas do backend

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

---

## 🧪 Modo Mock/Simulado

Para testar a aplicação sem backend:

1. A aplicação já vem configurada com `useMock = true` no `AnalysisComponent`
2. Dados mock estão em `src/app/core/mocks/patient_data.ts`
3. O serviço retorna respostas com delay de 800ms para simular latência

Para ativar o backend real, altere em `src/app/features/analysis/analysis.component.ts`:

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
