
import http from 'k6/http';
import { sleep } from 'k6';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';

// 1. Extração de variáveis (Fácil manutenção)
const BASE_URL = 'https://quickpizza.grafana.com/api';
// Permite injetar o token pelo terminal via variável de ambiente ou usa o padrão
const API_TOKEN = 'abcdef0123456789'; 

export const options = {
  thresholds: {
    // 100% dos checks/expects devem passar
    checks: ['rate == 1.00'], 
    // 2. Acordo de Nível de Serviço (SLA) de Performance
    // 95% das requisições devem ser respondidas em menos de 500ms
    http_req_duration: ['p(95)<500'], 
  },
   stages: [
    { duration: '2m', target: 100 }, // fast ramp-up to a high point
    // No plateau
    { duration: '1m', target: 0 }, // quick ramp-down to 0 users
  ],
  cloud: {
    projectID: '8501380',
    name: "spick.js",
  },
};


export default function () {
  // 3. Nomenclatura descritiva em vez de 'Hello world!'
  describe('Fetch User Ratings', () => { 
    const response = http.get(`${BASE_URL}/ratings`, {
      headers: { Authorization: `Token ${API_TOKEN}` },
      // 4. Timeout de segurança para evitar requests pendurados para sempre
      timeout: '10s', 
    });

    expect(response.status, 'response status').to.equal(200);
    expect(response).to.have.validJsonBody();
    expect(response.json('ratings'), 'ratings list').to.be.an('array');
  });

  // 5. Think Time (Tempo de pensamento do usuário)
  sleep(1); 
}