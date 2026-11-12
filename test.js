import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    // Cenário 1: Tráfego normal
    trafego_normal: {
      executor: 'constant-arrival-rate',
      duration: '20s',
      rate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 50, // Permite escalar se as respostas ficarem lentas
    },
    // Cenário 2: Pico agressivo para forçar lentidão no servidor
    pico_de_acessos: {
      executor: 'constant-arrival-rate',
      startTime: '5s',      // Começa aos 5 segundos de teste
      duration: '10s',
      rate: 1000,           // 1.000 req/s (mais realista para aula sem travar o seu PC)
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 500,          // Limite máximo de VUs caso a API engasgue
    },
  },
  
  // Limiares (Thresholds) focados em detectar LENTIDÃO
  thresholds: {
    // 1. Erros HTTP (incluindo timeouts estourados)
    http_req_failed: ['rate<0.01'], 

    // 2. Tempo médio geral (avg) não pode passar de 150ms
    http_req_duration: [
      'avg<150',            // Média de tempo de resposta
      'p(90)<200',          // 90% das requisições devem responder em menos de 200ms
      'p(95)<300',          // 95% das requisições devem responder em menos de 300ms
      'p(99)<800',          // 99% (pior caso tolerável) abaixo de 800ms
    ],

    // 3. Tempo de espera pelo servidor (TTFB - Time To First Byte)
    // Mede puramente o processamento do backend, descontando o download
    http_req_waiting: ['p(95)<250'], 
  },
};

export default function () {
  const payload = JSON.stringify({
    name: 'lorem',
    surname: 'ipsum',
  });
  const headers = { 'Content-Type': 'application/json' };

  // Se o servidor demorar mais de 1 segundo (1000ms), o k6 aborta e marca como falha
  const res = http.post('https://quickpizza.grafana.com/api/post', payload, { 
    headers,
    timeout: '1s', 
  });

  check(res, {
    'Status é 200 (Sucesso)': (r) => r.status === 200,
    'Respondeu rápido (< 300ms)': (r) => r.timings.duration < 300, // Check visual de lentidão
    'Resposta é formato JSON': (r) => r.headers['Content-Type'] === 'application/json',
    'Nome retornou corretamente': (r) => r.status === 200 && r.json().name === 'lorem',
  });

  sleep(1);
}