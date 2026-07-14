/* ================================================================
   MONICA CARVALHO — CONSULTORA IMOBILIÁRIA | script.js
   ================================================================
   ESTE ARQUIVO TEM 2 PARTES QUE VOCÊ VAI EDITAR:

   PARTE 1 → CONFIG   (WhatsApp e Instagram da Monica)
   PARTE 2 → IMOVEIS  (lista de imóveis — funciona como um
                       "banco de dados" local)

   O resto do arquivo (PARTE 3 em diante) é o funcionamento do site
   e normalmente não precisa ser alterado.
   ================================================================ */

/* ================================================================
   ★ PARTE 1 — CONFIG: EDITE AQUI OS CONTATOS ★
   ----------------------------------------------------------------
   whatsappNumero → número com DDI (55) + DDD + número, SÓ DÍGITOS.
                    Exemplo: "5521999998888"
   whatsappMensagem → mensagem que já chega escrita no WhatsApp.
   instagramUrl → link completo do perfil da Monica.

   Todos os botões de WhatsApp do site (classe .js-whatsapp) e de
   Instagram (classe .js-instagram) são preenchidos automaticamente
   com estes valores. Edite UMA vez, muda em todo lugar.
   ================================================================ */
const CONFIG = {
  whatsappNumero: "5521982580223", // ← EDITE: WhatsApp da Monica (só números)
  whatsappMensagem: "Olá, Monica! Vi seu site e quero saber mais sobre os imóveis anunciados.",
  instagramUrl: "https://instagram.com/gestora.monica", // ← EDITE: Instagram da Monica
};

/* ================================================================
   ★ PARTE 2 — IMOVEIS: EDITE AQUI OS IMÓVEIS ★
   ----------------------------------------------------------------
   Cada imóvel é um bloco entre chaves { ... }. Para ADICIONAR um
   imóvel, copie um bloco inteiro (da { até a },) e cole abaixo do
   último. Para REMOVER, apague o bloco. Os cards aparecem sozinhos
   na seção "Imóveis" do site, na ordem desta lista.

   CAMPOS DE CADA IMÓVEL:
   id        → número único, só para organização (1, 2, 3...)
   tipo      → "venda", "locacao" ou "lancamento"
               (controla a etiqueta do card e os filtros)
   titulo    → nome do imóvel (ex.: "Apartamento 3 quartos — Península")
   bairro    → localização (ex.: "Barra da Tijuca · Península")
   preco     → texto livre (ex.: "R$ 1.250.000" ou "R$ 4.500/mês")
   quartos   → número de quartos (texto livre)
   area      → metragem (ex.: "120 m²")
   vagas     → vagas de garagem
   descricao → frase curta de apresentação (1 a 2 linhas)
   imagem    → endereço da foto. Pode ser:
               - arquivo local:  "imagens/apto-peninsula.jpg"
                 (crie uma pasta "imagens" junto do index.html)
               - ou um link:     "https://..."
   ----------------------------------------------------------------
   ★ PREPARADO PARA BANCO DE DADOS ★
   Quando o site tiver banco de dados, esta lista será substituída
   por uma busca em API (ex.: fetch("/api/imoveis")). A função
   renderizarImoveis() já foi feita para receber qualquer lista no
   mesmo formato — o HTML e o CSS não precisarão mudar nada.
   ================================================================ */
const IMOVEIS = [
  // ▼ EXEMPLO 1 — substitua pelos dados reais do imóvel
  {
    id: 1,
    tipo: "venda",
    titulo: "Edite: Apartamento 3 quartos",
    bairro: "Barra da Tijuca · edite o condomínio",
    preco: "R$ 0.000.000",
    quartos: "3 quartos",
    area: "000 m²",
    vagas: "2 vagas",
    descricao: "Edite: descrição curta do imóvel em uma ou duas linhas.",
    imagem: "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Foto+do+Imovel+1",
  },
  // ▼ EXEMPLO 2
  {
    id: 2,
    tipo: "locacao",
    titulo: "Edite: Cobertura para locação",
    bairro: "Barra da Tijuca · edite a região",
    preco: "R$ 0.000/mês",
    quartos: "4 quartos",
    area: "000 m²",
    vagas: "3 vagas",
    descricao: "Edite: descrição curta do imóvel em uma ou duas linhas.",
    imagem: "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Foto+do+Imovel+2",
  },
  // ▼ EXEMPLO 3
  {
    id: 3,
    tipo: "lancamento",
    titulo: "Edite: Lançamento na planta",
    bairro: "Barra da Tijuca · edite a região",
    preco: "A partir de R$ 000.000",
    quartos: "2 a 4 quartos",
    area: "00 a 000 m²",
    vagas: "1 a 3 vagas",
    descricao: "Edite: descrição curta do lançamento em uma ou duas linhas.",
    imagem: "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Foto+do+Imovel+3",
  },
  // ▼ Para adicionar mais imóveis, copie um bloco { ... }, acima
  //   (incluindo a vírgula no final) e cole aqui embaixo.
];

/* ================================================================
   PARTE 3 — FUNCIONAMENTO DO SITE
   (daqui para baixo normalmente não precisa editar)
   ================================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 3.1 Preenche links de WhatsApp e Instagram ---------- */
  const whatsappLink =
    "https://wa.me/" + CONFIG.whatsappNumero +
    "?text=" + encodeURIComponent(CONFIG.whatsappMensagem);

  document.querySelectorAll(".js-whatsapp").forEach((el) => (el.href = whatsappLink));
  document.querySelectorAll(".js-instagram").forEach((el) => (el.href = CONFIG.instagramUrl));

  /* ---------- 3.2 Renderiza os cards de imóveis ----------
     Recebe qualquer lista no formato de IMOVEIS. No futuro, com
     banco de dados, basta chamar:
       fetch("/api/imoveis").then(r => r.json()).then(renderizarImoveis)
  */
  const grid = document.getElementById("propertiesGrid");

  const ETIQUETAS = {
    venda: "Venda",
    locacao: "Locação",
    lancamento: "Lançamento",
  };

  function renderizarImoveis(lista) {
    if (!grid) return;
    grid.innerHTML = "";

    if (!lista.length) {
      grid.innerHTML =
        '<p class="properties-empty">Nenhum imóvel disponível nesta categoria no momento. ' +
        'Fale com Monica pelo WhatsApp para receber uma curadoria personalizada.</p>';
      return;
    }

    lista.forEach((imovel) => {
      const card = document.createElement("article");
      card.className = "property-card reveal is-visible";
      card.dataset.tipo = imovel.tipo;

      const etiqueta = ETIQUETAS[imovel.tipo] || imovel.tipo;
      const badgeClass = imovel.tipo === "lancamento"
        ? "property-card__badge property-card__badge--gold"
        : "property-card__badge";

      // Mensagem de WhatsApp específica deste imóvel
      const linkImovel =
        "https://wa.me/" + CONFIG.whatsappNumero +
        "?text=" + encodeURIComponent("Olá, Monica! Tenho interesse no imóvel: " + imovel.titulo);

      card.innerHTML =
        '<div class="property-card__media">' +
          '<img src="' + imovel.imagem + '" alt="Foto do imóvel: ' + imovel.titulo + '" loading="lazy" width="800" height="550" />' +
          '<span class="' + badgeClass + '">' + etiqueta + "</span>" +
        "</div>" +
        '<div class="property-card__body">' +
          '<span class="property-card__location">' + imovel.bairro + "</span>" +
          "<h3>" + imovel.titulo + "</h3>" +
          '<p class="property-card__desc">' + imovel.descricao + "</p>" +
          '<div class="property-card__features">' +
            "<span>🛏 " + imovel.quartos + "</span>" +
            "<span>📐 " + imovel.area + "</span>" +
            "<span>🚗 " + imovel.vagas + "</span>" +
          "</div>" +
          '<p class="property-card__price">' + imovel.preco + "</p>" +
          '<a href="' + linkImovel + '" class="btn btn--primary" target="_blank" rel="noopener" ' +
            'aria-label="Tenho interesse no imóvel ' + imovel.titulo + '">Tenho interesse</a>' +
        "</div>";

      grid.appendChild(card);
    });
  }

  renderizarImoveis(IMOVEIS);

  /* ---------- 3.3 Filtros de imóveis (Todos/Venda/Locação/Lançamentos) ---------- */
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      const filtro = btn.dataset.filter;
      const filtrados = filtro === "todos"
        ? IMOVEIS
        : IMOVEIS.filter((imovel) => imovel.tipo === filtro);

      renderizarImoveis(filtrados);
    });
  });

  /* ---------- 3.4 Menu mobile ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação");
    });

    nav.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 3.5 Sombra no cabeçalho ao rolar ---------- */
  const header = document.getElementById("header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 3.6 Aparecer suave ao rolar (scroll reveal) ---------- */
  const revealElements = document.querySelectorAll(".reveal:not(.is-visible)");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- 3.7 Números que aumentam (contadores do hero) ----------
     Para editar os números, mexa nos atributos data-count no
     index.html (seção "NÚMEROS ANIMADOS"). */
  const counters = document.querySelectorAll(".stats__item strong[data-count]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // desacelera no final
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (counters.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- 3.8 Ano automático no rodapé ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
