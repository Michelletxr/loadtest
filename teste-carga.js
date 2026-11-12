import http from 'k6/http';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { check, sleep } from 'k6';

// 1. CONFIGURAÇÃO (Workload Model)
// Aqui definimos a força e a duração do teste
export const options = {
  vus: 5,          // Injeta 5 usuários virtuais simultâneos
  duration: '15s', // O teste ficará rodando por 15 segundos
};

// 2. COMPORTAMENTO (O que cada usuário vai fazer)
export default function () {
  // Faz uma requisição GET para o site de testes do k6
  const resposta = http.get('https://test.k6.io');

  // 3. VALIDAÇÃO (Assertion)
  // Verifica se o site carregou corretamente (Status 200 OK)
  check(resposta, {
    'site carregou com sucesso (status 200)': (r) => r.status === 200,
  });

  // 4. THINK TIME
  // Pausa de 1 segundo para simular o tempo que um usuário real 
  // leva lendo a tela antes de clicar em outra coisa
  sleep(1);
}
export function handleSummary(data) {
  return {
    "dashboard-resultado.html": htmlReport(data),
  };
}