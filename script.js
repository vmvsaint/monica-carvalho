/* ================================================================
   MONICA CARVALHO — script.js
   ================================================================
   ATENÇÃO: os dados que você edita (contatos e imóveis) NÃO ficam
   mais aqui — ficam no arquivo dados.js. Este arquivo é só o
   "motor" do site e vale para as 3 páginas ao mesmo tempo:

     index.html   (data-page="home")    → página principal
     imoveis.html (data-page="lista")   → lista de imóveis
     imovel.html  (data-page="detalhe") → detalhes de um imóvel

   O script descobre em qual página está pelo atributo data-page
   do <body> e ativa só o que aquela página precisa.
   Normalmente você NÃO precisa editar nada aqui.
   ================================================================ */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";

  /* ---------- Etiquetas exibidas para cada tipo de imóvel ---------- */
  const ETIQUETAS = {
    venda: "Venda",
    locacao: "Locação",
    lancamento: "Lançamento",
  };

  /* ================================================================
     1. COMUM A TODAS AS PÁGINAS
     ================================================================ */

  /* 1.1 Preenche todos os links de WhatsApp (.js-whatsapp) e
         Instagram (.js-instagram) com os valores do dados.js */
  const whatsappLink =
    "https://wa.me/" + CONFIG.whatsappNumero +
    "?text=" + encodeURIComponent(CONFIG.whatsappMensagem);

  document.querySelectorAll(".js-whatsapp").forEach((el) => (el.href = whatsappLink));
  document.querySelectorAll(".js-instagram").forEach((el) => (el.href = CONFIG.instagramUrl));

  /* 1.2 Menu mobile */
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

  /* 1.3 Sombra no cabeçalho ao rolar */
  const header = document.getElementById("header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 1.4 Ano automático no rodapé */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ================================================================
     2. FUNÇÕES DE IMÓVEIS (usadas pelas 3 páginas)
     ================================================================ */

  /* Link de WhatsApp já citando o imóvel na mensagem */
  function linkWhatsappImovel(imovel) {
    return (
      "https://wa.me/" + CONFIG.whatsappNumero +
      "?text=" + encodeURIComponent("Olá, Monica! Tenho interesse no imóvel: " + imovel.titulo)
    );
  }

  /* Monta UM card de imóvel. O card inteiro leva para a página de
     detalhes (imovel.html?id=N). */
  function criarCard(imovel) {
    const card = document.createElement("article");
    card.className = "property-card";
    card.dataset.tipo = imovel.tipo;

    const etiqueta = ETIQUETAS[imovel.tipo] || imovel.tipo;
    const badgeClass = imovel.tipo === "lancamento"
      ? "property-card__badge property-card__badge--gold"
      : "property-card__badge";

    const urlDetalhes = "imovel.html?id=" + imovel.id;

    card.innerHTML =
      '<a href="' + urlDetalhes + '" class="property-card__media" aria-label="Ver detalhes de ' + imovel.titulo + '">' +
        '<img src="' + imovel.imagem + '" alt="Foto do imóvel: ' + imovel.titulo + '" loading="lazy" width="800" height="550" />' +
        '<span class="' + badgeClass + '">' + etiqueta + "</span>" +
      "</a>" +
      '<div class="property-card__body">' +
        '<span class="property-card__location">' + imovel.bairro + "</span>" +
        '<h3><a href="' + urlDetalhes + '">' + imovel.titulo + "</a></h3>" +
        '<p class="property-card__desc">' + imovel.descricao + "</p>" +
        '<div class="property-card__features">' +
          "<span>🛏 " + imovel.quartos + "</span>" +
          "<span>📐 " + imovel.area + "</span>" +
          "<span>🚗 " + imovel.vagas + "</span>" +
        "</div>" +
        '<p class="property-card__price">' + imovel.preco + "</p>" +
        '<a href="' + urlDetalhes + '" class="btn btn--primary" ' +
          'aria-label="Ver detalhes do imóvel ' + imovel.titulo + '">Ver detalhes</a>' +
      "</div>";

    return card;
  }

  /* Renderiza uma lista de imóveis dentro de um elemento.
     ★ PREPARADO PARA BANCO DE DADOS: esta função aceita qualquer
     lista no formato do dados.js. No futuro, basta buscar os dados
     de uma API e chamar renderizarImoveis(elemento, dadosDaApi). */
  function renderizarImoveis(elemento, lista) {
    if (!elemento) return;
    elemento.innerHTML = "";

    if (!lista.length) {
      elemento.innerHTML =
        '<p class="properties-empty">Nenhum imóvel disponível nesta categoria no momento. ' +
        'Fale com Monica pelo WhatsApp para receber uma curadoria personalizada.</p>';
      return;
    }

    lista.forEach((imovel) => elemento.appendChild(criarCard(imovel)));
  }

  /* ================================================================
     3. PÁGINA PRINCIPAL (index.html)
     Mostra todos os imóveis. Os botões Venda/Locação/Lançamentos
     são LINKS para imoveis.html (não filtram aqui).
     ================================================================ */
  if (page === "home") {
    renderizarImoveis(document.getElementById("propertiesGrid"), IMOVEIS);
  }

  /* ================================================================
     4. PÁGINA DE LISTA (imoveis.html)
     Lê o filtro do endereço (?tipo=venda|locacao|lancamento),
     marca o botão certo e filtra os cards. Os botões filtram na
     hora e atualizam o endereço (para poder compartilhar o link).
     ================================================================ */
  if (page === "lista") {
    const grid = document.getElementById("propertiesGrid");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const tituloLista = document.getElementById("listaTitulo");

    const TITULOS = {
      todos: "Todos os imóveis",
      venda: "Imóveis à venda",
      locacao: "Imóveis para locação",
      lancamento: "Lançamentos",
    };

    function aplicarFiltro(filtro, atualizarUrl) {
      const valido = TITULOS[filtro] ? filtro : "todos";

      filterButtons.forEach((b) => {
        const ativo = b.dataset.filter === valido;
        b.classList.toggle("is-active", ativo);
        b.setAttribute("aria-pressed", String(ativo));
      });

      if (tituloLista) tituloLista.textContent = TITULOS[valido];

      const lista = valido === "todos"
        ? IMOVEIS
        : IMOVEIS.filter((imovel) => imovel.tipo === valido);

      renderizarImoveis(grid, lista);

      if (atualizarUrl && window.history && window.history.replaceState) {
        const novaUrl = valido === "todos" ? "imoveis.html" : "imoveis.html?tipo=" + valido;
        window.history.replaceState(null, "", novaUrl);
      }
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => aplicarFiltro(btn.dataset.filter, true));
    });

    // Filtro inicial vindo do endereço (ex.: imoveis.html?tipo=venda)
    const params = new URLSearchParams(window.location.search);
    aplicarFiltro(params.get("tipo") || "todos", false);
  }

  /* ================================================================
     5. PÁGINA DE DETALHES (imovel.html)
     Lê o id do endereço (?id=N), encontra o imóvel no dados.js e
     monta a página: galeria de fotos, descrição completa,
     características, custos e botões de contato.
     ================================================================ */
  if (page === "detalhe") {
    const container = document.getElementById("propertyDetail");
    const relatedSection = document.getElementById("relatedSection");
    const relatedGrid = document.getElementById("relatedGrid");

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"), 10);
    const imovel = IMOVEIS.find((item) => item.id === id);

    if (!imovel) {
      /* Imóvel não encontrado (id errado ou removido do dados.js) */
      if (container) {
        container.innerHTML =
          '<div class="detail-notfound">' +
            "<h1>Imóvel não encontrado</h1>" +
            "<p>Este imóvel pode ter sido vendido, alugado ou retirado do catálogo.</p>" +
            '<a href="imoveis.html" class="btn btn--primary">Ver imóveis disponíveis</a>' +
          "</div>";
      }
    } else {
      document.title = imovel.titulo + " | Monica Carvalho";

      const etiqueta = ETIQUETAS[imovel.tipo] || imovel.tipo;
      const badgeClass = imovel.tipo === "lancamento"
        ? "property-card__badge property-card__badge--gold"
        : "property-card__badge";

      /* Galeria: capa + fotos extras */
      const todasFotos = [imovel.imagem].concat(imovel.fotos || []);
      const thumbsHtml = todasFotos
        .map(function (foto, i) {
          return (
            '<button class="gallery__thumb' + (i === 0 ? " is-active" : "") + '" data-foto="' + foto + '" ' +
              'aria-label="Ver foto ' + (i + 1) + ' de ' + todasFotos.length + '">' +
              '<img src="' + foto + '" alt="Miniatura ' + (i + 1) + " do imóvel " + imovel.titulo + '" loading="lazy" width="200" height="140" />' +
            "</button>"
          );
        })
        .join("");

      /* Descrição completa: \n\n vira parágrafo */
      const paragrafos = (imovel.descricaoCompleta || imovel.descricao || "")
        .split("\n\n")
        .filter(function (t) { return t.trim(); })
        .map(function (t) { return "<p>" + t + "</p>"; })
        .join("");

      /* Características (se houver) */
      const caracteristicasHtml = (imovel.caracteristicas || []).length
        ? '<h2 class="detail__subtitle">Características</h2>' +
          '<ul class="detail__caracteristicas">' +
            imovel.caracteristicas.map(function (c) { return "<li>" + c + "</li>"; }).join("") +
          "</ul>"
        : "";

      /* Custos (só mostra o que estiver preenchido) */
      const custos = [];
      if (imovel.condominio) custos.push("<span><strong>Condomínio</strong> " + imovel.condominio + "</span>");
      if (imovel.iptu) custos.push("<span><strong>IPTU</strong> " + imovel.iptu + "</span>");
      const custosHtml = custos.length
        ? '<div class="detail__costs">' + custos.join("") + "</div>"
        : "";

      /* Ficha rápida (banheiros é opcional) */
      const fichas = ["🛏 " + imovel.quartos];
      if (imovel.banheiros) fichas.push("🛁 " + imovel.banheiros);
      fichas.push("📐 " + imovel.area, "🚗 " + imovel.vagas);

      container.innerHTML =
        '<nav class="breadcrumb" aria-label="Você está em">' +
          '<a href="index.html">Início</a> <span aria-hidden="true">›</span> ' +
          '<a href="imoveis.html?tipo=' + imovel.tipo + '">' + etiqueta + "</a> " +
          '<span aria-hidden="true">›</span> <span>' + imovel.titulo + "</span>" +
        "</nav>" +

        '<div class="detail__grid">' +
          '<div class="detail__gallery">' +
            '<div class="gallery__main">' +
              '<img id="galleryMain" src="' + todasFotos[0] + '" alt="Foto principal do imóvel ' + imovel.titulo + '" width="800" height="550" />' +
              '<span class="' + badgeClass + '">' + etiqueta + "</span>" +
            "</div>" +
            (todasFotos.length > 1 ? '<div class="gallery__thumbs">' + thumbsHtml + "</div>" : "") +
          "</div>" +

          '<div class="detail__info">' +
            '<span class="property-card__location">' + imovel.bairro + "</span>" +
            "<h1>" + imovel.titulo + "</h1>" +
            '<p class="detail__price">' + imovel.preco + "</p>" +
            '<div class="detail__features">' +
              fichas.map(function (f) { return "<span>" + f + "</span>"; }).join("") +
            "</div>" +
            custosHtml +
            '<div class="detail__actions">' +
              '<a href="' + linkWhatsappImovel(imovel) + '" class="btn btn--gold" target="_blank" rel="noopener" ' +
                'aria-label="Falar com Monica sobre este imóvel no WhatsApp">Tenho interesse neste imóvel</a>' +
              '<a href="#" class="btn btn--outline js-instagram-detalhe" target="_blank" rel="noopener" ' +
                'aria-label="Seguir Monica no Instagram">Seguir no Instagram</a>' +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="detail__body">' +
          '<h2 class="detail__subtitle">Sobre o imóvel</h2>' +
          paragrafos +
          caracteristicasHtml +
        "</div>";

      /* Instagram do bloco de detalhes (gerado depois do 1.1) */
      container.querySelectorAll(".js-instagram-detalhe").forEach(function (el) {
        el.href = CONFIG.instagramUrl;
      });

      /* Troca da foto principal ao clicar na miniatura */
      const mainImg = document.getElementById("galleryMain");
      container.querySelectorAll(".gallery__thumb").forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          if (mainImg) mainImg.src = thumb.dataset.foto;
          container.querySelectorAll(".gallery__thumb").forEach(function (t) {
            t.classList.toggle("is-active", t === thumb);
          });
        });
      });

      /* Imóveis semelhantes: mesmo tipo, até 3, sem repetir o atual */
      const semelhantes = IMOVEIS
        .filter(function (item) { return item.tipo === imovel.tipo && item.id !== imovel.id; })
        .slice(0, 3);

      if (semelhantes.length && relatedSection && relatedGrid) {
        relatedSection.hidden = false;
        renderizarImoveis(relatedGrid, semelhantes);
      }
    }
  }

  /* ================================================================
     6. EFEITOS VISUAIS (todas as páginas)
     ================================================================ */

  /* 6.1 Aparecer suave ao rolar */
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

  /* 6.2 Números que aumentam (só existem na página principal).
     Para editar os números, mexa nos atributos data-count do
     index.html. */
  const counters = document.querySelectorAll(".stats__item strong[data-count]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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
})();
