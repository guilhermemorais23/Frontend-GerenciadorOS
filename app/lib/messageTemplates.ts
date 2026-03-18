export function buildClienteEmailConclusao(osNumero: string, tituloServico: string) {
  return `Prezado cliente, a Ordem de Serviço ${osNumero} - ${tituloServico} foi finalizada com sucesso. Obrigado pela confiança na equipe SERTECH Soluções.`;
}

export function buildClienteWhatsappConclusao(osNumero: string, tituloServico: string) {
  return `Notícia boa, finalizamos a Ordem de Serviço ${osNumero} - ${tituloServico}. Parabéns para todos nós.\nSertech Soluções`;
}

export function buildTecnicoWhatsappNovaOs() {
  return "Vamos produzir? Tem uma OS esperando pela sua atuação, centroavante matador!!!!";
}
