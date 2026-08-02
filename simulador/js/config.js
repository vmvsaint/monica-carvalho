/* ═══════════════════════════════════════════════════════════════════
   CONFIG.JS — O ÚNICO ARQUIVO QUE VOCÊ EDITA A CADA CLIENTE

   Troque os valores abaixo, salve, publique. Nada mais precisa mudar.
   Leva menos de 5 minutos por cliente.

   Vértice node · vertice-node.com.br
   ═══════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ─────────────────────────────────────────────────────────────
     1. QUEM É O PROFISSIONAL
     ───────────────────────────────────────────────────────────── */
  profissional: {
    nome:     "Monica Carvalho",          // aparece no topo e no rodapé
    cargo:    "Consultora Imobiliária",      // ex: "Consultor Imobiliário"
    registro: "CRECI-RJ 55641",           // deixe "" para esconder
    cidade:   "Rio de Janeiro",

    // Telefone do WhatsApp: só números, com 55 + DDD.
    // Ex: 5521982580223  (Brasil + Rio + número)
    whatsapp: "5521982580223"
  },


  /* ─────────────────────────────────────────────────────────────
     2. IDENTIDADE VISUAL
     Cole o hex da cor do cliente. O resto do layout se adapta.
     ───────────────────────────────────────────────────────────── */
  marca: {
    // Cores iguais às do site da Monica (style.css → --primary,
    // --primary-dark e um tom claro de areia da mesma paleta).
    corPrincipal: "#0F3D3E",   // botões, destaques, gráfico
    corEscura:    "#0A2B2C",   // hover e textos fortes
    corClara:     "#F1EFE8",   // fundos suaves (areia do site)

    // LOGO DO TOPO
    // Coloque o arquivo em  imagens/logo.png  e deixe a linha abaixo
    // assim. Para voltar ao círculo com as iniciais ("MC"), troque
    // por  logoUrl: null
    logoUrl: "imagens/logo.png",
    logoAltura: 38,           // altura em pixels (a largura se ajusta)

    // Para onde o logo leva quando alguém clica.
    // "../index.html"  → volta para a página principal do site
    //                    (quando o simulador está na pasta /simulador)
    // "https://..."    → endereço completo, se preferir
    // null             → logo sem link
    linkLogo: "../index.html"
  },


  /* ─────────────────────────────────────────────────────────────
     3. PARÂMETROS DO FINANCIAMENTO
     Ajuste conforme a praça e o banco com que o cliente trabalha.
     ───────────────────────────────────────────────────────────── */
  financiamento: {
    // Taxa EFETIVA anual. 11.49 significa 11,49% ao ano.
    // Consulte a tabela vigente do banco antes de publicar.
    taxaJurosAnual: 11.49,

    prazoMaximoAnos:  35,
    prazoPadraoAnos:  30,

    // Percentual mínimo de entrada exigido pelo banco
    entradaMinimaPercent: 20,

    // Faixa de valores aceita pelo simulador
    valorMinimoImovel: 100000,
    valorMaximoImovel: 3000000,
    valorPadraoImovel: 450000,

    // Quanto da renda o banco aceita comprometer (regra usual: 30%)
    comprometimentoRendaPercent: 30
  },


  /* ─────────────────────────────────────────────────────────────
     4. CUSTOS E SEGUROS
     Estes números variam MUITO por cidade e por banco.
     Confirme antes de entregar para o cliente.
     ───────────────────────────────────────────────────────────── */
  custos: {
    // ITBI — imposto municipal. Rio ~3%, SP ~3%, varia bastante.
    itbiPercent: 3.0,

    // Escritura + registro em cartório (aproximado)
    cartorioPercent: 1.2,

    // Seguros obrigatórios, cobrados dentro da parcela:
    // MIP  = morte e invalidez permanente (incide sobre o SALDO DEVEDOR)
    // DFI  = danos físicos ao imóvel      (incide sobre o VALOR DO IMÓVEL)
    seguroMipPercentMensal: 0.025,
    seguroDfiPercentMensal: 0.0035,

    // Tarifa mensal de administração do contrato (R$)
    taxaAdministracaoMensal: 25.00
  },


  /* ─────────────────────────────────────────────────────────────
     5. TEXTOS DA PÁGINA
     ───────────────────────────────────────────────────────────── */
  textos: {
    titulo:   "Simulador de Financiamento Imobiliário",
    subtitulo: "Descubra em 30 segundos quanto ficaria a parcela do seu imóvel — " +
               "com seguros e taxas já incluídos.",

    // Mensagem que vai pré-preenchida no WhatsApp.
    // As chaves {assim} são trocadas automaticamente pelos números.
    mensagemWhatsapp:
      "Olá, {nomeProfissional}! Fiz uma simulação no seu site e queria conversar.\n\n" +
      "*Meu nome:* {nomeCliente}\n" +
      "*Valor do imóvel:* {valorImovel}\n" +
      "*Entrada:* {entrada}\n" +
      "*Prazo:* {prazo} anos\n" +
      "*Parcela inicial (SAC):* {parcelaSac}\n" +
      "*Parcela fixa (Price):* {parcelaPrice}\n" +
      "*Renda necessária:* {rendaMinima}\n\n" +
      "Podemos falar sobre as opções?"
  },


  /* ─────────────────────────────────────────────────────────────
     6. ASSINATURA DA VÉRTICE NODE NO RODAPÉ

     Mantenha ativo: é o que faz cada lead do seu cliente conhecer
     a sua agência. É a sua distribuição gratuita.
     ───────────────────────────────────────────────────────────── */
  rodape: {
    mostrarCreditoVerticeNode: true,
    textoCredito: "Ferramenta desenvolvida por",

    // Logo em SVG vetorizado — não depende de fonte instalada,
    // renderiza igual em qualquer site.
    //   assets/vertice-node.svg          → letras escuras (fundo claro)
    //   assets/vertice-node-branco.svg   → letras brancas (fundo escuro)
    logoUrl:    "assets/vertice-node.svg",
    logoAltura: 34,                       // em pixels

    // Usado só se o SVG não carregar (caminho quebrado, por exemplo)
    nomeAgencia: "Vértice node",
    urlAgencia:  "https://vertice-node.com.br"
  }
};
