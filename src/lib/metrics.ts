import { collectDefaultMetrics, Histogram } from 'prom-client'

// metricas do runtime (memoria, event loop, cpu) — de graca, da propria lib
collectDefaultMetrics()

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['route', 'method', 'code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
})
