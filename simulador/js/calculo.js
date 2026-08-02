/* ═══════════════════════════════════════════════════════════════════
   CALCULO.JS — A MATEMÁTICA DO FINANCIAMENTO

   Aqui não tem nada de interface. São só funções puras: entra número,
   sai número. Isso facilita testar e reaproveitar em outros projetos.

   Dois sistemas de amortização são calculados:

   PRICE → parcela FIXA do começo ao fim.
           Começa mais barata, mas paga mais juros no total.

   SAC   → parcela DECRESCENTE.
           Começa mais cara, mas o saldo cai mais rápido e o total
           de juros é menor. É o mais usado pela Caixa.
   ═══════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────
   Converte taxa anual EFETIVA em taxa mensal equivalente.

   Não se divide por 12! Juros compostos exigem a raiz décima
   segunda. Dividir por 12 é o erro mais comum em simulador
   caseiro — e faz a parcela sair errada para menos.

   Ex: 11,49% ao ano  →  0,9105% ao mês (e não 0,9575%)
   ─────────────────────────────────────────────────────────────── */
function taxaMensal(taxaAnualPercent) {
  return Math.pow(1 + taxaAnualPercent / 100, 1 / 12) - 1;
}


/* ───────────────────────────────────────────────────────────────
   TABELA PRICE — parcela fixa

               i × (1 + i)^n
   PMT = PV × ─────────────────
               (1 + i)^n − 1

   PV = valor financiado | i = taxa mensal | n = número de parcelas
   ─────────────────────────────────────────────────────────────── */
function calcularPrice(valorFinanciado, taxaMes, numeroParcelas) {
  // taxa zero seria divisão por zero — trata o caso à parte
  if (taxaMes === 0) {
    const p = valorFinanciado / numeroParcelas;
    return { parcelaBase: p, totalJuros: 0, primeira: p, ultima: p };
  }

  const fator = Math.pow(1 + taxaMes, numeroParcelas);
  const parcela = valorFinanciado * (taxaMes * fator) / (fator - 1);

  return {
    parcelaBase: parcela,
    primeira:    parcela,
    ultima:      parcela,
    totalJuros:  parcela * numeroParcelas - valorFinanciado
  };
}


/* ───────────────────────────────────────────────────────────────
   SISTEMA SAC — amortização constante

   A amortização é sempre a mesma: valorFinanciado ÷ n
   Os juros incidem sobre o saldo devedor, que vai caindo.
   Por isso a parcela diminui todo mês.
   ─────────────────────────────────────────────────────────────── */
function calcularSac(valorFinanciado, taxaMes, numeroParcelas) {
  const amortizacao = valorFinanciado / numeroParcelas;

  const primeira = amortizacao + valorFinanciado * taxaMes;
  const ultima   = amortizacao + amortizacao * taxaMes;

  // Soma dos juros: o saldo cai em progressão aritmética, então
  // dá para somar direto sem varrer as 420 parcelas.
  const totalJuros = taxaMes * amortizacao * (numeroParcelas + 1) * numeroParcelas / 2;

  return { amortizacao, primeira, ultima, totalJuros };
}


/* ───────────────────────────────────────────────────────────────
   ENCARGOS MENSAIS — seguros e tarifa

   Todo financiamento imobiliário no Brasil embute:
   · MIP → seguro de morte e invalidez, sobre o SALDO DEVEDOR
   · DFI → seguro do imóvel, sobre o VALOR DO IMÓVEL
   · Tarifa de administração do contrato

   Simulador que ignora isso mostra parcela menor do que a real.
   O cliente descobre no banco e perde a confiança no corretor.
   ─────────────────────────────────────────────────────────────── */
function encargosMensais(saldoDevedor, valorImovel, custos) {
  const mip = saldoDevedor * (custos.seguroMipPercentMensal / 100);
  const dfi = valorImovel  * (custos.seguroDfiPercentMensal / 100);
  return mip + dfi + custos.taxaAdministracaoMensal;
}


/* ───────────────────────────────────────────────────────────────
   CUSTOS DE AQUISIÇÃO — o que se paga à vista, fora da entrada

   É aqui que a maioria dos compradores se surpreende: além da
   entrada, ainda tem ITBI e cartório. Costuma dar 4% a 5% do valor.
   ─────────────────────────────────────────────────────────────── */
function custosAquisicao(valorImovel, custos) {
  const itbi     = valorImovel * (custos.itbiPercent / 100);
  const cartorio = valorImovel * (custos.cartorioPercent / 100);
  return { itbi, cartorio, total: itbi + cartorio };
}


/* ───────────────────────────────────────────────────────────────
   RENDA MÍNIMA EXIGIDA

   O banco não deixa a parcela passar de ~30% da renda bruta
   familiar. Esta é a pergunta que qualifica o lead antes mesmo
   da primeira visita.
   ─────────────────────────────────────────────────────────────── */
function rendaMinima(parcelaTotal, comprometimentoPercent) {
  return parcelaTotal / (comprometimentoPercent / 100);
}


/* ───────────────────────────────────────────────────────────────
   SIMULAÇÃO COMPLETA — junta tudo

   Recebe o que o usuário digitou e devolve o objeto que a
   interface vai exibir.
   ─────────────────────────────────────────────────────────────── */
function simular(entrada) {
  const { valorImovel, valorEntrada, prazoAnos, taxaAnual, config } = entrada;

  const valorFinanciado = valorImovel - valorEntrada;
  const n = prazoAnos * 12;
  const i = taxaMensal(taxaAnual);

  const price = calcularPrice(valorFinanciado, i, n);
  const sac   = calcularSac(valorFinanciado, i, n);

  // Encargos da PRIMEIRA parcela (saldo devedor ainda cheio)
  const encargosInicio = encargosMensais(valorFinanciado, valorImovel, config.custos);

  // Encargos da ÚLTIMA parcela: no SAC o saldo chega a uma amortização
  const encargosFimSac   = encargosMensais(sac.amortizacao, valorImovel, config.custos);
  const encargosFimPrice = encargosMensais(0, valorImovel, config.custos);

  const parcelaSacInicial   = sac.primeira   + encargosInicio;
  const parcelaSacFinal     = sac.ultima     + encargosFimSac;
  const parcelaPriceInicial = price.primeira + encargosInicio;
  const parcelaPriceFinal   = price.ultima   + encargosFimPrice;

  const aquisicao = custosAquisicao(valorImovel, config.custos);

  return {
    valorFinanciado,
    numeroParcelas: n,
    taxaMensalPercent: i * 100,

    sac: {
      parcelaInicial: parcelaSacInicial,
      parcelaFinal:   parcelaSacFinal,
      totalJuros:     sac.totalJuros,
      totalPago:      valorFinanciado + sac.totalJuros,
      amortizacao:    sac.amortizacao
    },

    price: {
      parcelaInicial: parcelaPriceInicial,
      parcelaFinal:   parcelaPriceFinal,
      totalJuros:     price.totalJuros,
      totalPago:      valorFinanciado + price.totalJuros,
      parcelaBase:    price.parcelaBase
    },

    aquisicao,

    // O SAC começa mais caro, então é ele que define a renda exigida.
    rendaMinimaSac:   rendaMinima(parcelaSacInicial,   config.financiamento.comprometimentoRendaPercent),
    rendaMinimaPrice: rendaMinima(parcelaPriceInicial, config.financiamento.comprometimentoRendaPercent),

    // Total desembolsado à vista na assinatura
    totalNaAssinatura: valorEntrada + aquisicao.total
  };
}


/* ───────────────────────────────────────────────────────────────
   SÉRIE PARA O GRÁFICO

   Devolve alguns pontos da evolução da parcela ao longo do
   contrato. Não precisa dos 420 meses — 40 pontos desenham
   a curva com precisão suficiente e mantêm o SVG leve.
   ─────────────────────────────────────────────────────────────── */
function serieParcelas(entrada, quantidadePontos = 40) {
  const { valorImovel, valorEntrada, prazoAnos, taxaAnual, config } = entrada;

  const valorFinanciado = valorImovel - valorEntrada;
  const n = prazoAnos * 12;
  const i = taxaMensal(taxaAnual);

  const amortizacao = valorFinanciado / n;
  const price = calcularPrice(valorFinanciado, i, n);

  const passo = Math.max(1, Math.floor(n / quantidadePontos));
  const pontos = [];

  for (let mes = 1; mes <= n; mes += passo) {
    const saldoAnterior = valorFinanciado - amortizacao * (mes - 1);
    const encargos = encargosMensais(saldoAnterior, valorImovel, config.custos);

    pontos.push({
      mes,
      sac:   amortizacao + saldoAnterior * i + encargos,
      price: price.parcelaBase + encargos
    });
  }

  return pontos;
}
