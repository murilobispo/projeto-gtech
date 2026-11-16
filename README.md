Nível: Projeto B

# GTech — encurtador de links

API de domínio único do projeto final do Full Cycle (Módulo 4, nível B): um fluxo principal funcionando de ponta a ponta — **cria** um link curto, **redireciona** com contagem de cliques e **consulta** estatísticas.

## Como subir

Pré-requisito: Docker.

```bash
cp .env.example .env
docker compose up -d --build
```

Um comando sobe tudo: PostgreSQL (com usuário de menor privilégio), a API (aplicando migrations no boot) e o pgAdmin. Primeira requisição:

```bash
curl http://localhost:3000/health
```

| Serviço                   | Endereço                                              |
| ------------------------- | ----------------------------------------------------- |
| API                       | http://localhost:3000                                 |
| Swagger UI (OpenAPI viva) | http://localhost:3000/docs                            |
| Métricas (Prometheus)     | http://localhost:3000/metrics                         |
| pgAdmin                   | http://localhost:5050 (credenciais no `.env.example`) |

## Como testar

Fluxo na mão (cria → redireciona → consulta):

```bash
# 1. cria (responde code, shortUrl, url, expiresAt)
curl -s -X POST localhost:3000/links \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com"}'

# 2. redireciona — 302 + Location, soma 1 clique (404 se inexistente/expirado)
curl -sI localhost:3000/l/CODE_AQUI

# 3. estatísticas — cliques sem incrementar nada
curl -s localhost:3000/links/CODE_AQUI
```

Suíte de testes (45 testes · cobertura 100%, mínimo declarado 90% no pipeline):

```bash
docker compose up -d database   # os testes de integração usam o banco real
cp .env.example .env            # se ainda não fez
npm ci
npm run db:generate
npm run test:coverage
```

Smoke test de carga (k6 — serviço com perfil `smoke`, **não** sobe no `up` normal):

```bash
docker compose --profile smoke up
docker compose logs k6
```

Último resultado medido: **p95 = 16,47ms** com 20 VUs por 30s (SLO < 100ms) — detalhes em [docs/desempenho.md](docs/desempenho.md).

## Endpoints

| Método | Rota         | O que faz                                       |
| ------ | ------------ | ----------------------------------------------- |
| GET    | /health      | healthcheck                                     |
| POST   | /links       | cria o link curto (zod · 422 em corpo inválido) |
| GET    | /l/:code     | **302** para a URL original e conta o clique    |
| GET    | /links/:code | metadados + cliques (leitura pura)              |
| GET    | /metrics     | métricas RED no formato Prometheus              |
| GET    | /docs        | Swagger UI renderizando a OpenAPI 3.1           |

## Arquitetura

```text
src/
├─ config/        requiredEnv — fail-fast na boot (PORT, DATABASE_URL)
├─ controllers/   roteadores Express (health, links, docs, metrics)
├─ middlewares/   validate · errorHandler · not-found · metrics
├─ models/        schemas zod (validação de entrada)
├─ services/      regra de negócio (link.service · code-generator)
├─ lib/           prisma · logger · metrics — singletons
└─ utils/         AppError (erro de domínio com status)
```

`app.ts` é a raiz de composição: monta tudo na ordem — helmet → json → metrics → roteadores → notFound → errorHandler. O controller é magro (rota + delega); a regra vive no service; o Prisma é chamado direto no service (sem repository — decisão registrada no histórico).

**Pattern aplicado e justificado — Singleton + Composition Root:** `prisma`, `logger` e `metrics` são instanciados uma única vez em `lib/` e montados em `app.ts`. Motivo: conexão de banco, logger e registrador de métricas são estados globais por natureza — instanciar por requisição multiplicaria pools de conexão e zeraria os contadores de métricas. A alternativa (instanciação espalhada por rota) foi descartada: adiciona verbosidade sem nenhum consumidor que precise de uma segunda instância.

## Decisões

- **ADR formal**: [docs/adr/0001-decisao.md](docs/adr/0001-decisao.md) — redirect 302 em vez de 301 (e a alternativa descartada)
- `code` é a primary key da tabela (o índice único obrigatório virou a chave)
- Banco com usuário de menor privilégio (`gtech_app` só tem SELECT/INSERT/UPDATE)
- `shortUrl` derivada de `PORT` (uma fonte de verdade, sem variável `BASE_URL` para divergir)

## Observabilidade

- **Logs estruturados** (pino): erro inesperado (500) loga em JSON com stack; erro de domínio (404/422) é esperado e não loga
- **Métricas RED** (prom-client): histograma de duração por rota/método/status em `/metrics` — o placar vive na memória do processo por design
- **SLO**: p95 < 100ms no redirect — declarado em `src/lib/metrics.ts`, medido pelo k6, confrontado em `docs/desempenho.md`

## CI (GitHub Actions)

A cada push/PR em `main`: gitleaks (segredos) → lint (Biome) → typecheck → banco real + migrations → testes com cobertura (relatório como artefato) → build da imagem Docker → scan de vulnerabilidades (Trivy, report).

## Stack

| Camada            | Ferramenta                                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| Linguagem/runtime | TypeScript 7 (tsgo) · Node 26 · tsx                                        |
| Web/API           | Express 5 · Helmet                                                         |
| Banco             | PostgreSQL 18 · Prisma 7 (adapter pg)                                      |
| Validação         | Zod 4                                                                      |
| Testes            | Vitest 5 · Supertest · coverage v8 (mínimo 90%)                            |
| Observabilidade   | pino · prom-client                                                         |
| Carga             | k6 v2.4.0 (perfil smoke no compose)                                        |
| Qualidade         | Biome (lint + format)                                                      |
| Segurança         | Gitleaks · Trivy · menor privilégio no banco                               |
| Documentação      | OpenAPI 3.1 · Swagger UI · ADR (MADR)                                      |
| CI                | GitHub Actions                                                             |
| Infra             | Docker Compose (IaC local) · pgAdmin                                       |
| Práticas          | trunk-based (main) · conventional commits · arquitetura em camadas (SOLID) |
