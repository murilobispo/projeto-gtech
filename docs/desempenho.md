# Desempenho — smoke test k6

> **Nível: Projeto B** · SLO declarado em `src/lib/metrics.ts`: **p95 < 100ms** no redirect (`GET /l/:code`).

## Como rodar

O k6 é um serviço do compose com perfil `smoke` — **não sobe no `up` normal**:

```bash
docker compose up -d --build        # 1. a API de pé (com migrations)
docker compose --profile smoke up   # 2. roda o smoke (20 VUs · 30s) e sai
docker compose logs k6              #    relatório completo (se rodou com -d)
```

O script (`k6/smoke.js`) cria 1 link no `setup` e redireciona em loop com 20 usuários virtuais por 30s. Os thresholds são o SLO virando código: **o teste falha se o p95 passar de 100ms** ou a taxa de erro passar de 1%.

## Resultado medido — 16/11/2026

| Indicador           | Valor            | Meta    |                              |
| ------------------- | ---------------- | ------- | ---------------------------- |
| **p95 do redirect** | **16,47ms**      | < 100ms | ✅ cumprido com ~6× de folga |
| duração média       | 10,14ms          | —       |                              |
| mediana             | 9,34ms           | —       |                              |
| pior caso           | 152,06ms         | —       | o azarão de 58 mil           |
| throughput          | **1.943 req/s**  | —       |                              |
| requisições (30s)   | 58.628           | —       | 58.627 redirects + 1 criação |
| erros               | 0,00% (0/58.628) | < 1%    | ✅                           |
| checks              | 100% (302 e 201) | —       | ✅                           |

Ambiente: Docker (Linux) · api em `node:26-alpine` · postgres 18-alpine (mesmo compose) · k6 v2.4.0 · 20 VUs · 30s · 1 link redirecionado em loop.

## Cruzamento: cliente (k6) × servidor (/metrics)

As duas medições contaram o mesmo evento de lados opostos — e fecharam a conta:

```text
k6 (de fora):          58.627 redirects
/metrics (de dentro):  http_request_duration_seconds_count{route="/l/:code",code="302"} = 58.627
balde do SLO:          _bucket{le="0.1",...} = 58.627   ← 100% dentro dos 100ms
```

Duração média vista de dentro: `555s ÷ 58.627 ≈ 9,5ms` — contra 10,14ms vista pelo k6. A diferença (~0,7ms) é a travessia da rede interna do Docker. **Nenhum dos 58.627 redirects caiu fora do balde do SLO.**

## Observações

- **Cold start pago 1× só:** a única requisição que caiu fora do balde de 100ms foi justamente o `POST /links` do setup (primeira query aquece o pool do Prisma). Os 58 mil redirects seguintes rodaram a ~10ms — comportamento de cache/pool quente.
- **O healthcheck do compose também aparece no placar** (`route="/health"`, ~117 chamadas) — as métricas enxergam tudo que passa, inclusive infraestrutura.

## O que faria diferente (nível A)

- Cache do `code → url` em memória/Redis para eliminar o `findUnique` do caminho quente do redirect
- Teste de carga em 3 estágios (smoke → load → stress) com busca de gargalo (clinic.js, `EXPLAIN ANALYZE` no `UPDATE` de cliques)
- Medição contínua no CI em vez de execução sob demanda
