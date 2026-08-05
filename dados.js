/* ================================================================
   MONICA CARVALHO — dados.js
   ================================================================
   ★★★ ESTE É O ÚNICO ARQUIVO QUE VOCÊ EDITA NO DIA A DIA ★★★

   Ele funciona como o "banco de dados" do site e é usado pelas
   3 páginas ao mesmo tempo:
     • index.html   → página principal
     • imoveis.html → lista completa de imóveis
     • imovel.html  → página de detalhes de cada imóvel

   Você adiciona/edita um imóvel AQUI e ele aparece automaticamente
   nas três páginas. Instruções completas no arquivo COMO-EDITAR.txt.
   ================================================================ */

/* ================================================================
   PARTE 1 — CONTATOS DA MONICA
   whatsappNumero  → DDI (55) + DDD + número, SÓ DÍGITOS
   whatsappMensagem → mensagem que chega pronta no WhatsApp
   instagramUrl    → link completo do perfil
   ================================================================ */
const CONFIG = {
  whatsappNumero: "5521982580223",
  whatsappMensagem: "Olá, Monica! Vi seu site e quero saber mais sobre os imóveis anunciados.",
  instagramUrl: "https://instagram.com/gestora.monica",

  /* Endereço do simulador de financiamento.
     O botão "Simular financiamento" da página de cada imóvel
     aponta para cá, já levando o valor do imóvel. */
  simuladorUrl: "simulador/index.html",
};

/* ================================================================
   PARTE 2 — LISTA DE IMÓVEIS
   ----------------------------------------------------------------
   COMO ADICIONAR UM IMÓVEL (resumo — detalhes no COMO-EDITAR.txt):
   1. Copie um bloco de exemplo inteiro, da { até a },
   2. Cole na seção do tipo certo (VENDA, LOCAÇÃO ou LANÇAMENTO)
      — as seções são só para SUA organização; o que define o tipo
      de verdade é o campo "tipo" dentro do bloco.
   3. Troque o id por um número NUNCA usado antes (o id vira o
      endereço da página do imóvel: imovel.html?id=7).
   4. Preencha os campos. Os marcados como (opcional) podem ser
      apagados ou deixados como "" — a página esconde o que
      estiver vazio.

   CAMPOS DE CADA IMÓVEL:
   id            → número ÚNICO (nunca repita, nem reutilize)
   tipo          → "venda", "locacao" ou "lancamento" (minúsculas,
                   locacao SEM cedilha e SEM acento)
   titulo        → nome do anúncio
   bairro        → localização resumida
   preco         → texto livre ("R$ 1.250.000" ou "R$ 4.500/mês")
   quartos, area, vagas → aparecem no card e nos detalhes
   banheiros     → (opcional) só aparece nos detalhes
   descricao     → frase curta (aparece no CARD)
   descricaoCompleta → texto longo (aparece na PÁGINA DE DETALHES;
                   use \n\n para separar parágrafos)
   caracteristicas → lista de diferenciais, entre colchetes,
                   cada item entre aspas e separado por vírgula
   condominio    → (opcional) valor do condomínio
   iptu          → (opcional) valor do IPTU
   imagem        → foto de CAPA (card e primeira foto dos detalhes)
   fotos         → fotos EXTRAS da galeria de detalhes, entre
                   colchetes. Pode deixar [] se só tiver a capa.

   FOTOS: crie uma pasta chamada "imagens" ao lado do index.html e
   use "imagens/nome-da-foto.jpg", ou cole um link https://...
   ================================================================ */
let IMOVEIS = [

  /* ==============================================================
     ▼▼▼ IMÓVEIS À VENDA ▼▼▼
     (blocos com tipo: "venda")
     ============================================================== */
  {
    id: 1,
    tipo: "venda",
    titulo: "Cielo Vitta",
    bairro: "Barra da Tijuca · Mundo Novo",
    preco: "R$ 1.490.000",
    quartos: "2 quartos",
    banheiros: "2 suítes",
    area: "92 m²",
    vagas: "1 vaga",
    descricao: "Cond. R$1.900 · IPTU R$350",
    descricaoCompleta:
      "Cielo Vitta.\n\n" +
      "Apartamento espetacular, para alugar no Mundo Novo. \n\n" +
      "Magnífico apartamento duplex disponível pra venda no Mundo Novo. Completamente reformado, Decorado por Arquiteto, armários planejados, splits novos instalados, blackouts. Primeiro pavimento composto por uma sala confortável em dois ambientes. Varandão com vista espetacular para o mar e reserva. Possui Cozinha planejada integrada a sala. Lavabo, área de serviço separada com banheiro de empregada. Segundo pavimento composto por dois quartos, sendo duas suítes. Condomínio com clube, academia da Companhia Atlética, várias atividades com profissionais especializados, bosque com quadras poliesportiva dentro da reserva, futebol, vôlei, tênis de saibro. Balsa para a praia. Ônibus até o metrô do Jardim Oceânico. Localização excelente, fica ao lado dos shoppings Vogue Square e Rio Design, podendo ir a pé. Próximo ao colégio Santo Agostinho, Escola Carolina Patrício, Escola americana. Supermercados, centro comercial do Mundo Novo. Venha morar com segurança e qualidade de vida, você vai se surpreender! Todo esse lazer e atividades, já inclusos no valor do condomínio. Não perca tempo, Agende sua visita!!!",
    caracteristicas: [
      "Frontal mar",
      "Sol da manhã",
      "Andar alto",
      "Balsa para praia",
      "Vista mar",
      "Clube",
      "Quadras de tênis de saibro",
      "Fino acabamento"
    ],
    condominio: "R$ 1.900/mês",
    iptu: "R$ 350/mês",
    imagem: "imagens/id1/sala5.webp",
    fotos: [
      "imagens/id1/varanda.webp",
      "imagens/id1/varanda2.webp",
      "imagens/id1/sala.webp",
      "imagens/id1/sala2.webp",
      "imagens/id1/lavabo.webp",
      "imagens/id1/banheiro.webp",
      "imagens/id1/banheiro2.webp",
      "imagens/id1/quarto.webp",
      "imagens/id1/quarto2.webp",
      "imagens/id1/cozinha.webp",
      "imagens/id1/vista.webp",
    ],
  },

   {
    id: 4,
    tipo: "venda",
    titulo: "Santa Monica Jardins",
    bairro: "Barra da Tijuca · Santa Monica Jardins",
    preco: "R$ 4.550.000",
    quartos: "3 quartos",
    banheiros: "3 suítes",
    area: "260 m²",
    vagas: "3 vagas",
    descricao: "Cond. R$5.163,63 · IPTU R$1.054,80",
    descricaoCompleta:
      "Santa Monica Jardins.\n\n" +
      "Apartamento espetacular, para comprar no Santa Monica Jardins. \n\n" +
      "Magnífico Apartamento para venda no Santa Mônica Jardins. Decorado por Arquiteto, armários planejado. Composto por uma sala confortável em três ambientes. Varanda com linda vista para a piscina, e toda área arborizada do condomínio. Possui um ótimo lavabo, transformado em 3 suítes. Sendo a suíte master com closet e banheira de hidromassagem. Copa cozinha super planejada. Dependência completa de empregada. Área de serviço separada. Condomínio clube, oferece segurança armada, e total infraestrutura, inclusive com academia da Companhia Atlética. Excelente localização, fica ao lado do supermercado Zona sul, podendo ir a pé, e em frente ao Shopping vogue Square. Bem pertinho do Shopping Rio Design, Novo Leblon. Fica próximo ás escolas Americana, britânica, Santo Agostinho, Carolina Patrício. Agende a sua visita, conheça seu novo imóvel, e venha morar com conforto, segurança e qualidade de vida!!! Não perca tempo!",
    caracteristicas: [
      "Maior planta do condomínio",
      "Vista interna piscina",
      "Planta circular",
      "Splits instalados",
      "Todo planejado",
      "Dependência completa de empregada"
    ],
    condominio: "R$ 5.163,63/mês",
    iptu: "R$ 1.054,80/mês",
    imagem: "imagens/id4/principal.webp",
    fotos: [
      "imagens/id4/varanda.webp",
      "imagens/id4/varanda2.webp",
      "imagens/id4/sala.webp",
      "imagens/id4/banheiro.webp",
      "imagens/id4/banheiro2.webp",
      "imagens/id4/lavabo.webp",
      "imagens/id4/quarto.webp",
      "imagens/id4/escritorio.webp",
      "imagens/id4/cozinha.webp",
      "imagens/id4/cozinha2.webp",
      "imagens/id4/vista.webp"
    ],
  },

    {
    id: 5,
      tipo: "venda",
      titulo: "Jardim Europa",
      bairro: "Barra da Tijuca · Jardim Europa",
      preco: "R$ 1.570.000",
      quartos: "3 quartos",
      banheiros: "3 suítes",
      area: "95 m²",
      vagas: "2 vagas",
      descricao: "Cond. R$2.200,99 · IPTU R$390,00",
      descricaoCompleta:
        "Jardim Europa.\n\n" +
        "Apartamento espetacular à venda no Jardim Europa. \n\n" +
        "Magnífico Apartamento Completamente reformado, inclusive hidráulica e elétrica. Splits novos instalados. Todo em porcelanato. Armários planejados serão colocados, todos novos. Voltado para o sol da manhã. Sendo a suíte master com closet e banheira de hidromassagem. Copa cozinha super planejada. Composto por uma bela sala integrada a varanda, com linda vista arborizada. Possui 3 quartos, 3 suítes. Copa cozinha e área de serviço, com entrada separada. Condomínio com segurança total, super silencioso e harmônico, balsa para a praia, churrasqueira, parquinho infantil. Box pra cada unidade, vaga dupla coberta. Localização mais que perfeita, fica em frente ao Barra shopping, podendo ir a pé tranquilamente. Agende a sua visita, conheça seu novo imóvel, e venha morar com conforto, segurança e qualidade de vida!!! PRONTO PARA ENTRAR E MORAR! Não perca tempo!",
      caracteristicas: [
        "Vaga dupla coberta",
        "Box Individual",
        "Balsa para Praia",
        "Sol da manhã"
        
      ],
      condominio: "R$ 2.200,99/mês",
      iptu: "R$ 390,00/mês",
      imagem: "imagens/id5/principal.webp",
      fotos: [
        "imagens/id5/varanda.webp",
        "imagens/id5/sala.webp",
        "imagens/id5/sala2.webp",
        "imagens/id5/banheiro.webp",
        "imagens/id5/banheiro2.webp",
        "imagens/id5/banheiro3.webp",
        "imagens/id5/quarto.webp",
        "imagens/id5/quarto2.webp",
        "imagens/id5/cozinha.webp",
        "imagens/id5/vista.webp",
        "imagens/id5/vista2.webp"
      ],
    },
  // ▼ Cole novos imóveis DE VENDA aqui embaixo

  /* ==============================================================
     ▼▼▼ IMÓVEIS PARA LOCAÇÃO ▼▼▼
     (blocos com tipo: "locacao")
     ============================================================== */
  {
    id: 2,
    tipo: "locacao",
    titulo: "Royal Blue",
    bairro: "Barra da Tijuca",
    preco: "R$ 13.000/mês",
    quartos: "3 quartos",
    banheiros: "3 banheiros",
    area: "169 m²",
    vagas: "3 vagas",
    descricao: "Cond. R$3.110 · IPTU R$693",
    descricaoCompleta:
      "Royal Blue.\n\n" +
      "Apartamento espetacular, para alugar no Blue das Américas. \n\n" +
      "Composto por uma sala espaçosa, varandão gourmet fechado com cortina de vidro, com vista deslumbrante para a reserva e piscina. Possui lavabo, 3 suítes, sendo duas suítes com varanda privativa. Suíte master com closet. Cozinha toda planejada, com cocktoop e exaustor. Tem direito ao Clube na praia com piscina(Beat Point). Adega, Quadras de tênis, futebol, piscinas com borda infinita, voltada pra reserva. Mini Golf, academia top, salão de beleza, Pet Care, salões de festas, churrasqueira, brinquedoteca, brinquedos variados para as crianças. Balsa para a praia, direito ao ônibus circular do Blue, que vai até o metrô do Jardim Oceânico. Localização excelente, fica em frente a Pedra de Itaúna, ao shopping Itaúna e Escola Parque. Em frente também ao Blue Square, Supermarket do Blue, hortifruti, podendo fazer tudo a pé! Agende sua visita e se surpreenda! Venha morar com qualidade de vida na Barra, e seja feliz!",
    caracteristicas: [
      "Varanda Gourmet",
      "Balsa para Praia",
      "Cozinha Planejada",
      "Splits instalados",
      "Vista para a Reserva",
      "Clube na praia"
    ],
    condominio: "R$ 3.110/mês",
    iptu: "R$ 693",
    imagem: "imagens/id2/varanda.webp",
    fotos: [
      "imagens/id2/sala.webp",
      "imagens/id2/varanda2.webp",
      "imagens/id2/quarto1.webp",
      "imagens/id2/banheiro2.webp",
      "imagens/id2/qarto.webp",
      "imagens/id2/banheiro.webp",
      "imagens/id2/quarto2.webp",
      "imagens/id2/cozinha2.webp",
      "imagens/id2/quadra.webp",
      "imagens/id2/vista3.webp",
      "imagens/id2/vista.webp"
    ],
  },
  // ▼ Cole novos imóveis DE LOCAÇÃO aqui embaixo

  /* ==============================================================
     ▼▼▼ LANÇAMENTOS ▼▼▼
     (blocos com tipo: "lancamento")
     ============================================================== */
  {
    id: 3,
    tipo: "lancamento",
    titulo: "",
    bairro: "",
    preco: "",
    quartos: "",
    banheiros: "",
    area: "",
    vagas: "",
    descricao: "....",
    descricaoCompleta:
      "...\n\n" +
      "....",
    caracteristicas: [
      "",
      "",
      "",
    ],
    condominio: "",
    iptu: "",
    imagem: "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Em+Breve",
    fotos: [],
  },
  // ▼ Cole novos LANÇAMENTOS aqui embaixo

];
