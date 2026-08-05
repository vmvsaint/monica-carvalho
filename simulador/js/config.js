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
    nome:     "Monica Carvalho",           // aparece no topo e no rodapé
    cargo:    "Consultora Imobiliária",    // atenção ao gênero
    registro: "CRECI-RJ 55641",            // deixe "" para esconder
    cidade:   "Rio de Janeiro",

    // Telefone do WhatsApp: só números, com 55 + DDD.
    // Ex: 5521999998888  (Brasil + Rio + número)
    whatsapp: "5521982580223"
  },


  /* ─────────────────────────────────────────────────────────────
     2. LOGO DO TOPO

     logoUrl ...... caminho da imagem. Aceita .svg, .png ou .webp.
                    Deixe null para exibir o badge com as iniciais.
     logoAltura ... altura em pixels (a largura se ajusta sozinha)
     logoLink ..... para onde o logo leva ao ser clicado. Coloque o
                    site do cliente. Se deixar null, não vira link.
     ───────────────────────────────────────────────────────────── */
  logo: {
    logoUrl:    "../imagens/main-site/logo.ico",                       // ex: "assets/logo-cliente.svg"
    logoAltura: 42,
    logoLink:   "https://monica-carvalho-psi.vercel.app/"
  },


  /* ─────────────────────────────────────────────────────────────
     3. IDENTIDADE VISUAL

     Paleta no padrão do site da Monica Carvalho: verde petróleo
     profundo, acento dourado e fundo areia.
     ───────────────────────────────────────────────────────────── */
  marca: {
    corPrincipal: "#0F3D3E",   // verde petróleo — botões e títulos
    corEscura:    "#0A2B2C",   // hover e áreas de destaque
    corDourada:   "#B98A44",   // acento premium (etiquetas, detalhes)
    corFundo:     "#FAF8F4",   // areia clara — fundo geral
    corFundoAlt:  "#F1EFE8",   // areia levemente mais escura
    corTexto:     "#1D2A28",   // texto principal
    corApagada:   "#5C6B67"    // texto secundário
  },


  /* ─────────────────────────────────────────────────────────────
     4. IMAGEM DE FUNDO DO TOPO

     imagemUrl ...... URL ou caminho da foto. Deixe null para usar
                      só o verde sólido da marca.
                      Ex: "assets/orla-barra.webp"
     escurecimento .. 0 a 1. Quanto maior, mais escura fica a foto.
                      Abaixo de 0.7 o texto branco começa a sumir em
                      fotos claras. O padrão 0.86 é seguro.
     posicao ........ que parte da foto fica visível ao recortar:
                      "center" | "top" | "bottom"
     ───────────────────────────────────────────────────────────── */
  fundo: {
    imagemUrl:     "assets/orla-barra.webp",
    escurecimento: 0.86,
    posicao:       "center"
  },


  /* ─────────────────────────────────────────────────────────────
     5. PARÂMETROS DO FINANCIAMENTO
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
     6. CUSTOS E SEGUROS
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
     7. TEXTOS DA PÁGINA
     ───────────────────────────────────────────────────────────── */
  textos: {
    etiqueta:       "Simulação gratuita",   // texto pequeno acima do título
    titulo:         "Descubra a parcela real do seu",
    tituloDestaque: "próximo imóvel.",      // sai em itálico serifado
    subtitulo:      "Cálculo com seguros, taxas e cartório já incluídos — " +
                    "os números que o banco só mostra no fim.",

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
     8. ASSINATURA DA VÉRTICE NODE NO RODAPÉ

     Mantenha ativo: é o que faz cada lead do seu cliente conhecer
     a sua agência. É a sua distribuição gratuita.
     ───────────────────────────────────────────────────────────── */
  rodape: {
    mostrarCreditoVerticeNode: true,
    textoCredito: "Ferramenta desenvolvida por",

    // Logo vetorizado — não depende de fonte instalada.
    //   assets/vertice-node.svg          → letras escuras (fundo claro)
    //   assets/vertice-node-branco.svg   → letras brancas (fundo escuro)
    logoUrl:    "assets/vertice-node.svg",
    logoAltura: 34,

    // Usado só se o SVG não carregar (caminho quebrado, por exemplo)
    nomeAgencia: "Vértice node",
    urlAgencia:  "https://vertice-node.com.br"
  }
};
