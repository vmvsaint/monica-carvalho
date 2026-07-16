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
const IMOVEIS = [

  /* ==============================================================
     ▼▼▼ IMÓVEIS À VENDA ▼▼▼
     (blocos com tipo: "venda")
     ============================================================== */
  {
    id: 1,
    tipo: "venda",
    titulo: "Edite: Apartamento 3 quartos",
    bairro: "Barra da Tijuca · edite o condomínio",
    preco: "R$ 0.000.000",
    quartos: "3 quartos",
    banheiros: "2 banheiros",
    area: "000 m²",
    vagas: "2 vagas",
    descricao: "Edite: descrição curta do imóvel em uma ou duas linhas.",
    descricaoCompleta:
      "Edite: aqui vai a descrição completa do imóvel, que aparece na página de detalhes.\n\n" +
      "Use \\n\\n (como neste exemplo) para criar um novo parágrafo. Fale da planta, da vista, do condomínio, da região e do que torna este imóvel especial.",
    caracteristicas: [
      "Edite: Varanda gourmet",
      "Edite: Vista para a lagoa",
      "Edite: Condomínio com piscina e academia",
      "Edite: Portaria 24h",
    ],
    condominio: "R$ 0.000/mês",
    iptu: "R$ 000/mês",
    imagem: "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Foto+do+Imovel+1",
    fotos: [
      "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Sala",
      "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Quarto",
      "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Varanda",
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
    titulo: "Edite: Lançamento na planta",
    bairro: "Barra da Tijuca · edite a região",
    preco: "A partir de R$ 000.000",
    quartos: "2 a 4 quartos",
    banheiros: "",
    area: "00 a 000 m²",
    vagas: "1 a 3 vagas",
    descricao: "Edite: descrição curta do lançamento em uma ou duas linhas.",
    descricaoCompleta:
      "Edite: descrição completa do lançamento.\n\n" +
      "Fale da construtora, previsão de entrega, plantas disponíveis e condições de pagamento.",
    caracteristicas: [
      "Edite: Previsão de entrega 20XX",
      "Edite: Lazer completo",
      "Edite: Condições especiais na planta",
    ],
    condominio: "",
    iptu: "",
    imagem: "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Foto+do+Imovel+3",
    fotos: [],
  },
  // ▼ Cole novos LANÇAMENTOS aqui embaixo

];
