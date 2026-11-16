import { check } from 'k6'
import http from 'k6/http'

const BASE_URL = __ENV.BASE_URL || 'http://api:3000'

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    // SLO declarado em src/lib/metrics.ts, virando gate: o teste FALHA se o p95 passar de 100ms
    http_req_duration: ['p(95)<100'],
    http_req_failed: ['rate<0.01'],
  },
}

// roda UMA vez antes da carga: cria o link que sera redirecionado em loop
export function setup() {
  const res = http.post(
    `${BASE_URL}/links`,
    JSON.stringify({ url: 'https://example.com' }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  check(res, { 'link criado (201)': (r) => r.status === 201 })

  return { code: res.json('code') }
}

export default function (data) {
  // redirects: 0 garante que o k6 mede o 302 da API e NAO segue ate a example.com
  const res = http.get(`${BASE_URL}/l/${data.code}`, { redirects: 0 })

  check(res, { 'redirect (302)': (r) => r.status === 302 })
}
