/* ═══════════════════════════════════════════════════════════════════
   APP.JS — A INTERFACE

   Liga os controles da tela ao motor de cálculo (calculo.js) e monta
   o link do WhatsApp. Não tem nenhuma conta financeira aqui — se
   precisar mexer na matemática, o arquivo é o calculo.js.

   Vértice node · vertice-node.com.br
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── atalho para pegar elementos ─── */
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


  /* ═════════════════════════════════════════════════════════════
     1. APLICA A IDENTIDADE DO CLIENTE (vinda do config.js)
     ═════════════════════════════════════════════════════════════ */
  function aplicarMarca() {
    const raiz = document.documentElement.style;
    raiz.setProperty("--marca",        CONFIG.marca.corPrincipal);
    raiz.setProperty("--marca-escura", CONFIG.marca.corEscura);
    raiz.setProperty("--marca-clara",  CONFIG.marca.corClara);

    const p = CONFIG.profissional;

    // logo se existir; senão, círculo com as iniciais
    const identidade = CONFIG.marca.logoUrl
      ? `<img src="${CONFIG.marca.logoUrl}" alt="${p.nome}"
              style="height:${CONFIG.marca.logoAltura}px">`
      : `<div class="prof-sigla">${iniciais(p.nome)}</div>`;

    // Se marca.linkLogo estiver preenchido no config.js, o logo (ou o
    // círculo de iniciais) vira um link — normalmente de volta para a
    // página principal do site.
    const identidadeFinal = CONFIG.marca.linkLogo
      ? `<a class="prof-link" href="${CONFIG.marca.linkLogo}"
            aria-label="Voltar para a página principal de ${p.nome}">${identidade}</a>`
      : identidade;

    const linhaSub = [p.cargo, p.registro, p.cidade].filter(Boolean).join(" · ");

    $("profBloco").innerHTML = `
      ${identidadeFinal}
      <div class="prof-txt">
        <div class="prof-nome">${p.nome}</div>
        <div class="prof-sub">${linhaSub}</div>
      </div>`;

    $("tituloPagina").textContent    = CONFIG.textos.titulo;
    $("subtituloPagina").textContent = CONFIG.textos.subtitulo;

    $("rodapeProf").innerHTML =
      `<strong>${p.nome}</strong>${p.registro ? " · " + p.registro : ""}`;

    // assinatura da Vértice node — a distribuição gratuita da agência
    if (CONFIG.rodape.mostrarCreditoVerticeNode) {
      const r = CONFIG.rodape;

      // O link envolve o logo inteiro e leva direto ao site.
      // Se o SVG não carregar (caminho quebrado, por exemplo), o
      // onerror troca a imagem pelo nome em texto — o crédito nunca
      // some, mesmo se alguém mover os arquivos de lugar.
      const marca = r.logoUrl
        ? `<img src="${r.logoUrl}" alt="${r.nomeAgencia}"
                height="${r.logoAltura}" style="height:${r.logoAltura}px"
                onerror="this.outerHTML='<span class=&quot;credito-texto&quot;>${r.nomeAgencia}</span>'">`
        : `<span class="credito-texto">${r.nomeAgencia}</span>`;

      $("rodapeCredito").innerHTML = `
        <a class="assinatura" href="${r.urlAgencia}" target="_blank" rel="noopener"
           aria-label="${r.textoCredito} ${r.nomeAgencia} — abre o site em nova aba">
          <span class="assinatura-texto">${r.textoCredito}</span>
          ${marca}
        </a>`;
    }

    $("percComprometimento").textContent =
      CONFIG.financiamento.comprometimentoRendaPercent + "%";
    $("rotuloItbi").textContent = `(${fmtPercent(CONFIG.custos.itbiPercent)})`;
  }

  function iniciais(nome) {
    return nome.trim().split(/\s+/).slice(0, 2)
               .map(p => p[0]).join("").toUpperCase();
  }

  function fmtPercent(v) {
    return v.toString().replace(".", ",") + "%";
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

    ajustarSliderEntrada();   // depende do valor do imóvel
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

    // mantém a proporção da entrada quando o imóvel muda de preço
    slider.value = Math.min(Math.max(anterior, minimo), maximo);
  }


  /* ═════════════════════════════════════════════════════════════
     3. GRÁFICO — SVG desenhado na mão, sem biblioteca
     ═════════════════════════════════════════════════════════════ */
  function desenharGrafico(pontos) {
    const L = 640, A = 200;                 // viewBox
    const m = { t: 12, r: 8, b: 26, l: 62 }; // margens internas

    const larg = L - m.l - m.r;
    const alt  = A - m.t - m.b;

    const todos = pontos.flatMap(p => [p.sac, p.price]);
    const maxY = Math.max(...todos) * 1.06;
    const minY = 0;

    const nMeses = pontos[pontos.length - 1].mes;
    const x = (mes) => m.l + (mes / nMeses) * larg;
    const y = (val) => m.t + alt - ((val - minY) / (maxY - minY)) * alt;

    const linhaDe = (chave) =>
      pontos.map((p, i) => `${i ? "L" : "M"}${x(p.mes).toFixed(1)},${y(p[chave]).toFixed(1)}`).join(" ");

    const areaSac = linhaDe("sac") +
      ` L${x(nMeses).toFixed(1)},${y(0).toFixed(1)} L${x(pontos[0].mes).toFixed(1)},${y(0).toFixed(1)} Z`;

    // linhas de grade horizontais + rótulos do eixo Y
    let grade = "";
    for (let k = 0; k <= 3; k++) {
      const v = (maxY / 3) * k;
      const py = y(v);
      grade += `<line x1="${m.l}" y1="${py.toFixed(1)}" x2="${L - m.r}" y2="${py.toFixed(1)}"
                      stroke="var(--linha)" stroke-width="1"/>
                <text x="${m.l - 9}" y="${(py + 4).toFixed(1)}" text-anchor="end"
                      font-size="10.5" fill="var(--apagado)"
                      font-family="Plus Jakarta Sans, sans-serif">${brl(v)}</text>`;
    }

    // rótulos do eixo X, em anos
    let eixoX = "";
    const anos = Math.round(nMeses / 12);
    [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
      const mes = Math.round(nMeses * frac) || 1;
      const rotulo = frac === 0 ? "início" : Math.round(anos * frac) + " anos";
      eixoX += `<text x="${x(mes).toFixed(1)}" y="${A - 7}"
                      text-anchor="${frac === 0 ? "start" : frac === 1 ? "end" : "middle"}"
                      font-size="10.5" fill="var(--apagado)"
                      font-family="Plus Jakarta Sans, sans-serif">${rotulo}</text>`;
    });

    $("areaGrafico").innerHTML = `
      <svg viewBox="0 0 ${L} ${A}" role="img"
           aria-label="Gráfico comparando a evolução da parcela nos sistemas SAC e Price">
        <defs>
          <linearGradient id="gradSac" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="var(--marca)" stop-opacity=".20"/>
            <stop offset="100%" stop-color="var(--marca)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grade}
        <path d="${areaSac}" fill="url(#gradSac)"/>
        <path d="${linhaDe("price")}" fill="none" stroke="#B9C2CC"
              stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 5"/>
        <path d="${linhaDe("sac")}" fill="none" stroke="var(--marca)"
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

    /* — gráfico — */
    desenharGrafico(serieParcelas(entrada));

    /* — links do WhatsApp — */
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
     6. LIGA TUDO
     ═════════════════════════════════════════════════════════════ */
  function iniciar() {
    aplicarMarca();
    prepararControles();

    // o slider de entrada precisa ser reajustado quando o imóvel muda
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
  }

  document.addEventListener("DOMContentLoaded", iniciar);

})();
