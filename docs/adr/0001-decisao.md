# 0001. Redirect com 302 em vez de 301

- **Status:** aceito (2026-11-16)
- **Escopo:** `GET /l/:code` (`src/services/link.service.ts` · `src/controllers/links.controller.ts`)

## Contexto

O produto conta cliques no momento do redirect: cada `GET /l/:code` válido incrementa `clicks` (atômico) e é isso que o endpoint de estatísticas (`GET /links/:code`) vende. Browsers cacheam **301 (Moved Permanently)** de forma agressiva — depois do primeiro acesso, o browser pode responder o redirect sozinho, **sem consultar a API de novo**.

## Decisão

Responder **302 (Found)** — redirect temporário. O browser revalida a URL curta a cada acesso.

## Consequências

- ✅ Contagem de cliques exata: cada acesso vira um incremento. Provado no smoke test: 58.627 redirects contados pelo k6 (lado cliente) = 58.627 no histograma interno (lado servidor)
- ✅ Trocar a URL de destino de um `code` continua possível — nenhum cache de browser segura a resposta antiga
- ⚠️ Um round-trip extra por acesso para o visitante frequente — irrelevante na prática: p95 medido de 16,47ms (meta: 100ms)

## Alternativa descartada: 301

Redirecionamento permanente teria SEO marginalmente melhor e economizaria round-trips para quem acessa o mesmo link repetidamente. **Rejeitada porque o cache do browser engoliria os acessos**: cliques deixariam de ser contados, e a contagem é o coração do produto — sem ela, `GET /links/:code` não tem nada para reportar.
