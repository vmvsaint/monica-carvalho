/* ═══════════════════════════════════════════════════════════════════
   APP.JS — A INTERFACE

   Liga os controles da tela ao motor de cálculo (calculo.js), aplica a
   identidade do config.js e monta o link do WhatsApp. Não tem nenhuma
   conta financeira aqui — para mexer na matemática, veja calculo.js.

   Vértice node · vertice-node.com.br
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* ─── formatadores brasileiros ─── */
  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0
  });
  const moneyCent = new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  const brl     = (v) => money.format(Math.round(v));
  const brlCent = (v) => moneyCent.format(v);

  /* escapa texto vindo do config antes de ir para innerHTML */
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");


  /* ═════════════════════════════════════════════════════════════
     1. APLICA A IDENTIDADE DO CLIENTE (vinda do config.js)
     ═════════════════════════════════════════════════════════════ */
  function aplicarMarca() {
    const raiz = document.documentElement.style;
    const m = CONFIG.marca;

    raiz.setProperty("--primary",      m.corPrincipal);
    raiz.setProperty("--primary-dark", m.corEscura);
    raiz.setProperty("--gold",         m.corDourada);
    raiz.setProperty("--gold-soft",    hexParaRgba(m.corDourada, 0.14));
    // versão clara do dourado, usada sobre o verde escuro do topo.
    // Derivada automaticamente: se o cliente trocar a cor dourada,
    // esta acompanha e o contraste continua garantido.
    raiz.setProperty("--gold-claro",   clarear(m.corDourada, 0.45));
    raiz.setProperty("--bg",           m.corFundo);
    raiz.setProperty("--bg-tinted",    m.corFundoAlt);
    raiz.setProperty("--text",         m.corTexto);
    raiz.setProperty("--muted",        m.corApagada);
    raiz.setProperty("--border",       hexParaRgba(m.corPrincipal, 0.12));

    aplicarFundo();
    montarLogo();

    const p = CONFIG.profissional;
    const t = CONFIG.textos;

    $("etiquetaPagina").textContent  = t.etiqueta || "";
    $("tituloPagina").innerHTML =
      esc(t.titulo) + (t.tituloDestaque ? ` <em>${esc(t.tituloDestaque)}</em>` : "");
    $("subtituloPagina").textContent = t.subtitulo;

    $("rodapeProf").innerHTML =
      `<strong>${esc(p.nome)}</strong>${p.registro ? " · " + esc(p.registro) : ""}`;

    montarAssinatura();

    $("percComprometimento").textContent =
      CONFIG.financiamento.comprometimentoRendaPercent + "%";
    $("rotuloItbi").textContent = `(${fmtPercent(CONFIG.custos.itbiPercent)})`;
  }


  /* ─── imagem de fundo do topo ───
     A foto entra como variável CSS. A camada escura por cima é
     desenhada pelo próprio CSS (.abertura::before), então aqui só
     precisamos passar a imagem, a posição e a intensidade. */
  function aplicarFundo() {
    const f = CONFIG.fundo || {};
    const raiz = document.documentElement.style;

    if (f.imagemUrl) {
      // ATENÇÃO A ESTA LINHA: caminho relativo dentro de uma variável CSS
      // é resolvido a partir do arquivo .css, não do HTML. Sem o
      // new URL() abaixo, "assets/foto.jpg" viraria "css/assets/foto.jpg"
      // e daria 404. Resolvemos aqui para caminho absoluto.
      const url = new URL(f.imagemUrl, document.baseURI).href;
      raiz.setProperty("--fundo-imagem", `url("${url}")`);
    }
    raiz.setProperty("--fundo-posicao", f.posicao || "center");

    // trava entre 0.55 e 0.97: abaixo disso o texto branco some,
    // acima disso a foto vira um bloco preto
    const nivel = Math.min(0.97, Math.max(0.55,
      typeof f.escurecimento === "number" ? f.escurecimento : 0.86));
    raiz.setProperty("--fundo-escuro", nivel);
  }


  /* ─── logo do topo ───
     Se houver logoUrl, exibe a imagem. Senão, monta o badge com as
     iniciais, no mesmo estilo do site. Se logoLink existir, o bloco
     inteiro vira link. */
  function montarLogo() {
    const p = CONFIG.profissional;
    const L = CONFIG.logo || {};

    const marca = L.logoUrl
      ? `<img src="${esc(L.logoUrl)}" alt="${esc(p.nome)}"
              height="${L.logoAltura || 42}"
              style="height:${L.logoAltura || 42}px"
              onerror="this.outerHTML='<div class=&quot;prof-sigla&quot;>${iniciais(p.nome)}</div>'">`
      : `<div class="prof-sigla">${iniciais(p.nome)}</div>`;

    const linhaSub = [p.cargo, p.registro, p.cidade].filter(Boolean).join(" · ");

    const miolo = `
      ${marca}
      <div class="prof-txt">
        <span class="prof-nome">${esc(p.nome)}</span>
        <span class="prof-sub">${esc(linhaSub)}</span>
      </div>`;

    $("profBloco").outerHTML = L.logoLink
      ? `<a class="prof" id="profBloco" href="${esc(L.logoLink)}"
            target="_blank" rel="noopener"
            aria-label="${esc(p.nome)} — abrir site">${miolo}</a>`
      : `<div class="prof" id="profBloco">${miolo}</div>`;
  }


  /* ─── assinatura da Vértice node no rodapé ───
     Se o SVG não carregar, o onerror troca pelo nome em texto —
     o crédito nunca some. */
  function montarAssinatura() {
    if (!CONFIG.rodape.mostrarCreditoVerticeNode) return;
    const r = CONFIG.rodape;

    const marca = r.logoUrl
      ? `<img src="${esc(r.logoUrl)}" alt="${esc(r.nomeAgencia)}"
              height="${r.logoAltura}" style="height:${r.logoAltura}px"
              onerror="this.outerHTML='<span class=&quot;credito-texto&quot;>${esc(r.nomeAgencia)}</span>'">`
      : `<span class="credito-texto">${esc(r.nomeAgencia)}</span>`;

    $("rodapeCredito").innerHTML = `
      <a class="assinatura" href="${esc(r.urlAgencia)}" target="_blank" rel="noopener"
         aria-label="${esc(r.textoCredito)} ${esc(r.nomeAgencia)} — abre o site em nova aba">
        <span class="assinatura-texto">${esc(r.textoCredito)}</span>
        ${marca}
      </a>`;
  }


  function iniciais(nome) {
    return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
  }

  function fmtPercent(v) {
    return v.toString().replace(".", ",") + "%";
  }

  /* converte #RRGGBB em rgba(r,g,b,alpha) */
  function hexParaRgba(hex, alpha) {
    const h = String(hex).replace("#", "");
    const n = parseInt(h.length === 3
      ? h.split("").map(c => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  /* clareia uma cor em direção ao branco. fator 0 = igual, 1 = branco */
  function clarear(hex, fator) {
    const h = String(hex).replace("#", "");
    const n = parseInt(h.length === 3
      ? h.split("").map(c => c + c).join("") : h, 16);
    const canal = (d) => {
      const v = (n >> d) & 255;
      return Math.round(v + (255 - v) * fator).toString(16).padStart(2, "0");
    };
    return "#" + [16, 8, 0].map(canal).join("").toUpperCase();
  }


  /* ═════════════════════════════════════════════════════════════
     2. PREPARA OS CONTROLES COM OS LIMITES DO CONFIG
     ═════════════════════════════════════════════════════════════ */
  function prepararControles() {
    const f = CONFIG.financiamento;

    const sliderValor = $("valorImovel");
    sliderValor.min   = f.valorMinimoImovel;
    sliderValor.max   = f.valorMaximoImovel;
    sliderValor.value = f.valorPadraoImovel;

    $("faixaValorMin").textContent = brl(f.valorMinimoImovel);
    $("faixaValorMax").textContent = brl(f.valorMaximoImovel);

    const sliderPrazo = $("prazo");
    sliderPrazo.max   = f.prazoMaximoAnos;
    sliderPrazo.value = f.prazoPadraoAnos;
    $("faixaPrazoMax").textContent = f.prazoMaximoAnos + " anos";

    $("taxa").value = f.taxaJurosAnual;

    ajustarSliderEntrada();
  }

  /* A entrada mínima é um percentual do imóvel, então o slider de
     entrada precisa ser reconfigurado toda vez que o valor muda. */
  function ajustarSliderEntrada() {
    const f = CONFIG.financiamento;
    const valorImovel = Number($("valorImovel").value);
    const minimo = Math.round(valorImovel * f.entradaMinimaPercent / 100);
    const maximo = Math.round(valorImovel * 0.90);

    const slider = $("entrada");
    const anterior = Number(slider.value) || minimo;

    slider.min = minimo;
    slider.max = maximo;
    slider.value = Math.min(Math.max(anterior, minimo), maximo);
  }


  /* ═════════════════════════════════════════════════════════════
     3. GRÁFICO — SVG desenhado na mão, sem biblioteca
     ═════════════════════════════════════════════════════════════ */
  function desenharGrafico(pontos) {
    const L = 640, A = 200;
    const m = { t: 12, r: 8, b: 26, l: 62 };

    const larg = L - m.l - m.r;
    const alt  = A - m.t - m.b;

    const todos = pontos.flatMap(p => [p.sac, p.price]);
    const maxY = Math.max(...todos) * 1.06;

    const nMeses = pontos[pontos.length - 1].mes;
    const x = (mes) => m.l + (mes / nMeses) * larg;
    const y = (val) => m.t + alt - (val / maxY) * alt;

    const linhaDe = (chave) =>
      pontos.map((p, i) => `${i ? "L" : "M"}${x(p.mes).toFixed(1)},${y(p[chave]).toFixed(1)}`).join(" ");

    const areaSac = linhaDe("sac") +
      ` L${x(nMeses).toFixed(1)},${y(0).toFixed(1)} L${x(pontos[0].mes).toFixed(1)},${y(0).toFixed(1)} Z`;

    let grade = "";
    for (let k = 0; k <= 3; k++) {
      const v = (maxY / 3) * k;
      const py = y(v);
      grade += `<line x1="${m.l}" y1="${py.toFixed(1)}" x2="${L - m.r}" y2="${py.toFixed(1)}"
                      stroke="var(--border)" stroke-width="1"/>
                <text x="${m.l - 9}" y="${(py + 4).toFixed(1)}" text-anchor="end"
                      font-size="10.5" fill="var(--muted)"
                      font-family="Plus Jakarta Sans, sans-serif">${brl(v)}</text>`;
    }

    let eixoX = "";
    const anos = Math.round(nMeses / 12);
    [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
      const mes = Math.round(nMeses * frac) || 1;
      const rotulo = frac === 0 ? "início" : Math.round(anos * frac) + " anos";
      eixoX += `<text x="${x(mes).toFixed(1)}" y="${A - 7}"
                      text-anchor="${frac === 0 ? "start" : frac === 1 ? "end" : "middle"}"
                      font-size="10.5" fill="var(--muted)"
                      font-family="Plus Jakarta Sans, sans-serif">${rotulo}</text>`;
    });

    $("areaGrafico").innerHTML = `
      <svg viewBox="0 0 ${L} ${A}" role="img"
           aria-label="Gráfico comparando a evolução da parcela nos sistemas SAC e Price">
        <defs>
          <linearGradient id="gradSac" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="var(--primary)" stop-opacity=".18"/>
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grade}
        <path d="${areaSac}" fill="url(#gradSac)"/>
        <path d="${linhaDe("price")}" fill="none" stroke="var(--gold)"
              stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 5"/>
        <path d="${linhaDe("sac")}" fill="none" stroke="var(--primary)"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${eixoX}
      </svg>`;
  }


  /* ═════════════════════════════════════════════════════════════
     4. RECALCULA E PINTA A TELA
     ═════════════════════════════════════════════════════════════ */
  let ultimaSimulacao = null;
  let ultimaEntrada   = null;

  function atualizar() {
    const f = CONFIG.financiamento;

    const valorImovel  = Number($("valorImovel").value);
    const valorEntrada = Number($("entrada").value);
    const prazoAnos    = Number($("prazo").value);

    // taxa: aceita vírgula e protege contra campo vazio
    let taxaAnual = parseFloat(String($("taxa").value).replace(",", "."));
    if (!isFinite(taxaAnual) || taxaAnual < 0) taxaAnual = f.taxaJurosAnual;

    const entrada = { valorImovel, valorEntrada, prazoAnos, taxaAnual, config: CONFIG };
    const r = simular(entrada);

    ultimaSimulacao = r;
    ultimaEntrada   = entrada;

    /* — controles — */
    $("saidaValor").textContent   = brl(valorImovel);
    $("saidaEntrada").textContent = brl(valorEntrada);
    $("saidaPrazo").textContent   = prazoAnos + " anos";

    const percEntrada = (valorEntrada / valorImovel) * 100;
    $("entradaPercent").textContent = percEntrada.toFixed(0) + "% do imóvel";
    $("avisoEntrada").textContent =
      percEntrada < f.entradaMinimaPercent - 0.5
        ? `mínimo ${f.entradaMinimaPercent}%` : "";

    /* — comparativo — */
    $("sacInicial").textContent = brlCent(r.sac.parcelaInicial);
    $("sacFinal").textContent   = brlCent(r.sac.parcelaFinal);
    $("sacJuros").textContent   = brl(r.sac.totalJuros);
    $("sacTotal").textContent   = brl(r.sac.totalPago);

    $("priceInicial").textContent = brlCent(r.price.parcelaInicial);
    $("priceJuros").textContent   = brl(r.price.totalJuros);
    $("priceTotal").textContent   = brl(r.price.totalPago);

    /* — economia — */
    const economia = r.price.totalJuros - r.sac.totalJuros;
    $("valorEconomia").textContent = brl(economia);
    $("blocoEconomia").style.display = economia > 0 ? "" : "none";

    /* — renda — */
    $("rendaMinima").textContent = brlCent(r.rendaMinimaSac);

    /* — custos à vista — */
    $("custoEntrada").textContent  = brl(valorEntrada);
    $("custoItbi").textContent     = brl(r.aquisicao.itbi);
    $("custoCartorio").textContent = brl(r.aquisicao.cartorio);
    $("custoTotal").textContent    = brl(r.totalNaAssinatura);

    desenharGrafico(serieParcelas(entrada));
    atualizarLinksZap();
  }


  /* ═════════════════════════════════════════════════════════════
     5. LINK DO WHATSAPP (wa.me — gratuito, sem API)
     ═════════════════════════════════════════════════════════════ */
  function montarMensagem() {
    const r = ultimaSimulacao;
    const e = ultimaEntrada;
    const nome = ($("nomeCliente").value || "").trim();

    return CONFIG.textos.mensagemWhatsapp
      .replace("{nomeProfissional}", CONFIG.profissional.nome)
      .replace("{nomeCliente}",      nome || "(não informado)")
      .replace("{valorImovel}",      brl(e.valorImovel))
      .replace("{entrada}",          brl(e.valorEntrada))
      .replace("{prazo}",            e.prazoAnos)
      .replace("{parcelaSac}",       brlCent(r.sac.parcelaInicial))
      .replace("{parcelaPrice}",     brlCent(r.price.parcelaInicial))
      .replace("{rendaMinima}",      brlCent(r.rendaMinimaSac));
  }

  function atualizarLinksZap() {
    const numero = CONFIG.profissional.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(montarMensagem())}`;
    $("botaoZap").href = url;
    $("topoZap").href  = url;
  }


  /* ═════════════════════════════════════════════════════════════
     6. INTERAÇÕES DE PÁGINA (mesmas do site da Monica)
     ═════════════════════════════════════════════════════════════ */

  /* topo ganha borda e fundo sólido ao rolar */
  function ligarTopoAoScroll() {
    const topo = $("topo");
    const aoRolar = () => topo.classList.toggle("rolou", window.scrollY > 20);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
  }

  /* blocos surgem conforme entram na tela */
  function ligarRevelacao() {
    const menosMovimento =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alvos = document.querySelectorAll(".reveal");

    if (menosMovimento || !("IntersectionObserver" in window)) {
      alvos.forEach(el => el.classList.add("visivel"));
      return;
    }

    const obs = new IntersectionObserver((entradas, observador) => {
      entradas.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          observador.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    alvos.forEach(el => obs.observe(el));
  }


  /* ═════════════════════════════════════════════════════════════
     7. LIGA TUDO
     ═════════════════════════════════════════════════════════════ */
  function iniciar() {
    aplicarMarca();
    prepararControles();

    $("valorImovel").addEventListener("input", () => {
      ajustarSliderEntrada();
      atualizar();
    });

    ["entrada", "prazo", "taxa"].forEach(id =>
      $(id).addEventListener("input", atualizar)
    );

    // o nome não altera os cálculos, só a mensagem do WhatsApp
    $("nomeCliente").addEventListener("input", atualizarLinksZap);

    atualizar();
    ligarTopoAoScroll();
    ligarRevelacao();
  }

  document.addEventListener("DOMContentLoaded", iniciar);

})();
