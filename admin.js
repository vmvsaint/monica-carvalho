/* ================================================================
   MONICA CARVALHO — admin.js
   ================================================================
   Cérebro do painel (admin.html). Está dividido em 10 partes:

     1. Configurações de imagem  ← é aqui que você muda 1000x1000
     2. Ajudantes (avisos, datas, textos seguros)
     3. Login e logout
     4. Buscar e listar os imóveis
     5. Fotos: redimensionar, converter para .webp e enviar
     6. Formulário: preencher, ler e salvar
     7. Apagar imóvel
     8. Leads (as duas tabelas) e exportação em CSV
     9. Abas
    10. Ligar tudo quando a página abre

   Nada aqui precisa ser editado no dia a dia, com exceção da
   PARTE 1 (se quiser mudar o tamanho ou a qualidade das fotos).
   ================================================================ */

(function () {
  "use strict";

  /* ==============================================================
     PARTE 1 — CONFIGURAÇÕES DE IMAGEM  ★ EDITE AQUI SE QUISER ★
     ==============================================================
     modo: "cortar"    → devolve EXATAMENTE 1000 x 1000.
                         A foto é centralizada e as sobras das
                         laterais (ou de cima/baixo) são cortadas.
           "encaixar"  → a foto inteira cabe dentro de 1000 x 1000,
                         sem cortar nada. O que sobra vira fundo
                         branco. Use se não quiser perder as pontas
                         das fotos horizontais.

     qualidade: de 0 a 1. 0.82 costuma ser o ponto em que a foto
                fica leve sem perder nitidez visível.
     ============================================================== */
  const CONFIG_IMAGEM = {
    largura: 1000,
    altura: 1000,
    modo: "cortar",
    qualidade: 0.82,
    formato: "image/webp",
    corDeFundo: "#ffffff",      // usado só no modo "encaixar"
    tamanhoMaximoMB: 25,        // recusa arquivos maiores que isso
  };

  /* Etiquetas mostradas na tela para cada tipo/objetivo/status */
  const ROTULO_TIPO = { venda: "Venda", locacao: "Locação", lancamento: "Lançamento" };
  const ROTULO_INTERESSE = { comprar: "Comprar", alugar: "Alugar", investir: "Investir" };
  const ROTULO_OBJETIVO = { vender: "Vender", alugar: "Alugar", permuta: "Permuta", avaliar: "Avaliar" };

  const STATUS_INTERESSADO = [
    ["novo", "Novo"], ["em_contato", "Em contato"],
    ["convertido", "Convertido"], ["arquivado", "Arquivado"],
  ];
  const STATUS_PROPRIETARIO = [
    ["novo", "Novo"], ["em_contato", "Em contato"], ["avaliado", "Avaliado"],
    ["captado", "Captado"], ["arquivado", "Arquivado"],
  ];

  /* Memória do painel enquanto ele está aberto */
  let imoveisCarregados = [];   // tudo que veio do banco
  let filtroAtual = "todos";
  let fotosAtuais = [];         // fotos do imóvel que está sendo editado
  let usuarioLogado = null;

  /* Atalho para procurar elementos na página */
  const $ = (id) => document.getElementById(id);


  /* ==============================================================
     PARTE 2 — AJUDANTES
     ============================================================== */

  /* Mostra o avisinho preto no rodapé da tela */
  let toastTimer;
  function aviso(mensagem, ehErro) {
    const el = $("toast");
    el.textContent = mensagem;
    el.classList.toggle("eh-erro", !!ehErro);
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("is-visible"));

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => { el.hidden = true; }, 600);
    }, 3600);
  }

  /* Mostra a faixa de erro/sucesso dentro de um formulário */
  function mostrarAvisoForm(idElemento, mensagem, ehSucesso) {
    const el = $(idElemento);
    if (!el) return;
    if (!mensagem) { el.hidden = true; return; }
    el.textContent = mensagem;
    el.classList.toggle("is-ok", !!ehSucesso);
    el.hidden = false;
  }

  /* Transforma < > & em código, para que um texto digitado nunca
     seja interpretado como HTML (proteção contra injeção) */
  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* 2026-07-26T13:00:00Z → 26/07/2026 13:00 */
  function formatarData(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " +
           d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  /* "Suíte master" → "suite-master" (para usar em nome de arquivo) */
  function paraNomeDeArquivo(texto) {
    return String(texto || "foto")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // tira acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "foto";
  }

  /* Só dígitos: (21) 98258-0223 → 5521982580223 */
  function whatsappLink(telefone) {
    const numeros = String(telefone || "").replace(/\D/g, "");
    if (!numeros) return null;
    const completo = numeros.length <= 11 ? "55" + numeros : numeros;
    return "https://wa.me/" + completo;
  }


  /* ==============================================================
     PARTE 3 — LOGIN E LOGOUT
     ============================================================== */

  /* Confere se já existe uma sessão aberta (a pessoa fechou a aba e
     voltou depois) e se essa pessoa está na tabela "admins". */
  async function verificarSessao() {
    if (!sb) {
      document.body.innerHTML =
        '<div style="padding:4rem 1.5rem;text-align:center;font-family:sans-serif">' +
        "<h1>Supabase não configurado</h1>" +
        "<p>Preencha a URL e a chave pública no arquivo <b>supabase-config.js</b>.</p></div>";
      return;
    }

    const { data } = await sb.auth.getSession();

    if (!data.session) { mostrarLogin(); return; }

    /* Está logado — mas é admin mesmo? */
    const ehAdmin = await conferirSeEhAdmin(data.session.user.id);

    if (!ehAdmin) {
      await sb.auth.signOut();
      mostrarLogin();
      mostrarAvisoForm("loginAviso", "Esta conta não tem permissão de administrador. Fale com o desenvolvedor para incluí-la na tabela admins.");
      return;
    }

    usuarioLogado = data.session.user;
    mostrarPainel();
  }

  /* Consulta a tabela admins. As regras de RLS fazem esta consulta
     devolver 1 linha se a pessoa for admin, e 0 linhas se não for. */
  async function conferirSeEhAdmin(userId) {
    const { data, error } = await sb
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[admin] Erro ao conferir permissão:", error.message);
      return false;
    }
    return !!data;
  }

  function mostrarLogin() {
    $("telaLogin").hidden = false;
    $("painel").hidden = true;
  }

  function mostrarPainel() {
    $("telaLogin").hidden = true;
    $("painel").hidden = false;
    $("emailLogado").textContent = usuarioLogado ? usuarioLogado.email : "";

    carregarImoveis();
    carregarLeadsInteressados();
    carregarLeadsProprietarios();
  }

  async function fazerLogin(evento) {
    evento.preventDefault();
    mostrarAvisoForm("loginAviso", "");

    const botao = $("btnEntrar");
    botao.disabled = true;
    botao.querySelector("span").textContent = "Entrando…";

    const { data, error } = await sb.auth.signInWithPassword({
      email: $("loginEmail").value.trim(),
      password: $("loginSenha").value,
    });

    botao.disabled = false;
    botao.querySelector("span").textContent = "Entrar no painel";

    if (error) {
      mostrarAvisoForm("loginAviso", "E-mail ou senha incorretos. Confira e tente novamente.");
      return;
    }

    const ehAdmin = await conferirSeEhAdmin(data.user.id);
    if (!ehAdmin) {
      await sb.auth.signOut();
      mostrarAvisoForm("loginAviso", "Esta conta existe, mas não está autorizada a usar o painel.");
      return;
    }

    usuarioLogado = data.user;
    $("formLogin").reset();
    mostrarPainel();
  }

  async function fazerLogout() {
    await sb.auth.signOut();
    usuarioLogado = null;
    imoveisCarregados = [];
    mostrarLogin();
  }


  /* ==============================================================
     PARTE 4 — BUSCAR E LISTAR OS IMÓVEIS
     ============================================================== */

  async function carregarImoveis() {
    const lista = $("listaImoveis");
    lista.innerHTML = '<p class="admin-vazio">Carregando imóveis…</p>';

    const { data, error } = await sb
      .from("imoveis")
      .select("*")
      .order("ordem", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      lista.innerHTML = '<p class="admin-vazio">Não consegui carregar os imóveis: ' + esc(error.message) + "</p>";
      return;
    }

    imoveisCarregados = data || [];
    desenharListaImoveis();
  }

  function desenharListaImoveis() {
    const lista = $("listaImoveis");

    const visiveis = filtroAtual === "todos"
      ? imoveisCarregados
      : imoveisCarregados.filter((i) => i.tipo === filtroAtual);

    const publicados = imoveisCarregados.filter((i) => i.ativo).length;
    $("resumoImoveis").textContent =
      imoveisCarregados.length + " cadastrado(s) · " + publicados + " publicado(s) no site";

    if (!visiveis.length) {
      lista.innerHTML = '<p class="admin-vazio">Nenhum imóvel nesta categoria ainda.</p>';
      return;
    }

    lista.innerHTML = visiveis.map(cartaoDoImovel).join("");

    /* Os cartões entram na tela com um fade suave, conforme aparecem */
    revelarCartoes();

    /* Liga os botões de cada cartão */
    lista.querySelectorAll("[data-editar]").forEach((b) =>
      b.addEventListener("click", () => abrirFormulario(Number(b.dataset.editar))));

    lista.querySelectorAll("[data-publicar]").forEach((b) =>
      b.addEventListener("click", () => alternarPublicacao(Number(b.dataset.publicar))));

    lista.querySelectorAll("[data-apagar]").forEach((b) =>
      b.addEventListener("click", () => apagarImovel(Number(b.dataset.apagar))));
  }

  function cartaoDoImovel(imovel) {
    const capa = imovel.imagem || "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Sem+foto";
    const qtdFotos = Array.isArray(imovel.fotos) ? imovel.fotos.length : 0;
    const classeEtiqueta = imovel.tipo === "lancamento"
      ? "admin-card__etiqueta admin-card__etiqueta--gold"
      : "admin-card__etiqueta";

    return (
      '<article class="admin-card' + (imovel.ativo ? "" : " esta-oculto") + '">' +
        '<div class="admin-card__miolo">' +
          '<div class="admin-card__foto">' +
            '<img src="' + esc(capa) + '" alt="Capa de ' + esc(imovel.titulo) + '" loading="lazy" />' +
            '<span class="' + classeEtiqueta + '">' + esc(ROTULO_TIPO[imovel.tipo] || imovel.tipo) + "</span>" +
            (imovel.ativo ? "" : '<span class="admin-card__rascunho">Fora do ar</span>') +
          "</div>" +
          '<div class="admin-card__corpo">' +
            '<span class="admin-card__local">' + esc(imovel.bairro) + "</span>" +
            '<h3 class="admin-card__titulo">' + esc(imovel.titulo) + "</h3>" +
            '<p class="admin-card__preco">' + esc(imovel.preco) + "</p>" +
            '<p class="admin-card__meta">' + esc(imovel.quartos) + " · " + esc(imovel.area) +
              " · " + qtdFotos + " foto(s) · id " + imovel.id + "</p>" +
            '<div class="admin-card__acoes">' +
              '<button class="pill pill--primary pill--sm" data-editar="' + imovel.id + '" type="button"><span>Editar</span></button>' +
              '<button class="pill pill--ghost pill--sm" data-publicar="' + imovel.id + '" type="button"><span>' +
                (imovel.ativo ? "Tirar do ar" : "Publicar") + "</span></button>" +
              '<button class="pill pill--perigo pill--sm" data-apagar="' + imovel.id + '" type="button"><span>Apagar</span></button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /* Faz os cartões surgirem conforme entram na tela.
     Usamos IntersectionObserver e NÃO o evento de scroll — o evento
     de scroll dispara centenas de vezes e trava o celular. */
  function revelarCartoes() {
    const cartoes = document.querySelectorAll(".admin-card:not(.is-visible)");
    const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (semAnimacao || !("IntersectionObserver" in window)) {
      cartoes.forEach((c) => c.classList.add("is-visible"));
      return;
    }

    const observador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((e, i) => {
        if (!e.isIntersecting) return;
        /* atraso em cascata: um cartão aparece logo depois do outro */
        setTimeout(() => e.target.classList.add("is-visible"), i * 70);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });

    cartoes.forEach((c) => observador.observe(c));
  }

  async function alternarPublicacao(id) {
    const imovel = imoveisCarregados.find((i) => i.id === id);
    if (!imovel) return;

    const { error } = await sb.from("imoveis").update({ ativo: !imovel.ativo }).eq("id", id);

    if (error) { aviso("Erro ao alterar: " + error.message, true); return; }

    imovel.ativo = !imovel.ativo;
    desenharListaImoveis();
    aviso(imovel.ativo ? "Imóvel publicado no site." : "Imóvel retirado do site.");
  }


  /* ==============================================================
     PARTE 5 — FOTOS: REDIMENSIONAR, CONVERTER E ENVIAR
     ============================================================== */

  /* 5.1 Abre o arquivo escolhido como imagem, respeitando a
         orientação gravada pela câmera (senão fotos de celular
         chegam deitadas). */
  async function abrirImagem(arquivo) {
    if ("createImageBitmap" in window) {
      try {
        return await createImageBitmap(arquivo, { imageOrientation: "from-image" });
      } catch (e) { /* cai no plano B abaixo */ }
    }

    /* Plano B para navegadores antigos */
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(arquivo);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não consegui ler a imagem")); };
      img.src = url;
    });
  }

  /* 5.2 Recebe o arquivo original e devolve um .webp de 1000x1000 */
  async function processarImagem(arquivo) {
    const fonte = await abrirImagem(arquivo);
    const L = CONFIG_IMAGEM.largura;
    const A = CONFIG_IMAGEM.altura;

    const canvas = document.createElement("canvas");
    canvas.width = L;
    canvas.height = A;
    const ctx = canvas.getContext("2d");

    /* Melhora a qualidade ao reduzir fotos grandes */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const lo = fonte.width;   // largura original
    const ao = fonte.height;  // altura original

    if (CONFIG_IMAGEM.modo === "encaixar") {
      /* A foto inteira cabe dentro do quadrado; sobra vira fundo */
      ctx.fillStyle = CONFIG_IMAGEM.corDeFundo;
      ctx.fillRect(0, 0, L, A);

      const escala = Math.min(L / lo, A / ao);
      const nl = lo * escala;
      const na = ao * escala;
      ctx.drawImage(fonte, (L - nl) / 2, (A - na) / 2, nl, na);
    } else {
      /* "cortar": preenche todo o quadrado e corta a sobra,
         mantendo o centro da foto */
      const escala = Math.max(L / lo, A / ao);
      const nl = lo * escala;
      const na = ao * escala;
      ctx.drawImage(fonte, (L - nl) / 2, (A - na) / 2, nl, na);
    }

    if (fonte.close) fonte.close();   // libera a memória

    /* canvas.toBlob usa callback; aqui viramos ele em Promise */
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, CONFIG_IMAGEM.formato, CONFIG_IMAGEM.qualidade));

    if (!blob) throw new Error("Não consegui converter esta imagem.");
    return blob;
  }

  /* 5.3 Envia o .webp para o Storage do Supabase e devolve o link */
  async function enviarParaStorage(blob, pasta, nomeBase, indice) {
    const caminho = pasta + "/" + indice + "-" + nomeBase + ".webp";

    const { error } = await sb.storage
      .from(SUPABASE.BUCKET_FOTOS)
      .upload(caminho, blob, {
        contentType: "image/webp",
        upsert: true,          // se já existir um arquivo igual, substitui
        cacheControl: "31536000",
      });

    if (error) throw new Error("Falha ao enviar a foto: " + error.message);

    const { data } = sb.storage.from(SUPABASE.BUCKET_FOTOS).getPublicUrl(caminho);
    return { url: data.publicUrl, caminho: caminho };
  }

  /* 5.4 Quando a Monica escolhe arquivos */
  async function receberArquivos(arquivos) {
    const lista = Array.from(arquivos).filter((a) => a.type.startsWith("image/"));
    if (!lista.length) { aviso("Selecione arquivos de imagem.", true); return; }

    const pasta = garantirPasta();
    const barra = $("progressoFotos");
    barra.hidden = false;

    for (let i = 0; i < lista.length; i++) {
      const arquivo = lista[i];
      barra.textContent = "Processando foto " + (i + 1) + " de " + lista.length + "…";

      if (arquivo.size > CONFIG_IMAGEM.tamanhoMaximoMB * 1024 * 1024) {
        aviso('A foto "' + arquivo.name + '" é muito grande e foi ignorada.', true);
        continue;
      }

      try {
        const blob = await processarImagem(arquivo);

        /* Nome inicial: "foto". Depois a Monica escolhe o cômodo e o
           arquivo é renomeado no próximo envio, se ela trocar. */
        const indice = Date.now().toString(36) + "-" + i;
        const enviado = await enviarParaStorage(blob, pasta, "foto", indice);

        fotosAtuais.push({
          url: enviado.url,
          caminho: enviado.caminho,
          tipo: "",                       // ainda sem cômodo escolhido
        });
        desenharFotos();
      } catch (e) {
        console.error(e);
        aviso('Erro na foto "' + arquivo.name + '": ' + e.message, true);
      }
    }

    barra.hidden = true;
    aviso("Fotos prontas: 1000×1000 em .webp.");
  }

  /* Cada imóvel guarda as fotos numa pasta própria dentro do bucket */
  function garantirPasta() {
    let pasta = $("imovelPasta").value;
    if (!pasta) {
      pasta = "imovel-" + Date.now().toString(36) + "-" +
              Math.random().toString(36).slice(2, 7);
      $("imovelPasta").value = pasta;
    }
    return pasta;
  }

  /* 5.5 Desenha as miniaturas com o seletor de cômodo */
  function desenharFotos() {
    const area = $("listaFotos");

    if (!fotosAtuais.length) {
      area.innerHTML = "";
      return;
    }

    const opcoes = (selecionado) =>
      '<option value="">— Que cômodo é? —</option>' +
      TIPOS_DE_FOTO.map((t) =>
        '<option value="' + esc(t) + '"' + (t === selecionado ? " selected" : "") + ">" + esc(t) + "</option>"
      ).join("");

    area.innerHTML = fotosAtuais.map((foto, i) =>
      '<div class="foto-card' + (i === 0 ? " is-capa" : "") + '">' +
        '<div class="foto-card__miolo">' +
          '<div class="foto-card__img">' +
            '<img src="' + esc(foto.url) + '" alt="' + esc(foto.tipo || "Foto do imóvel") + '" loading="lazy" />' +
            (i === 0 ? '<span class="foto-card__tag">Capa</span>' : "") +
          "</div>" +
          '<div class="foto-card__corpo">' +
            '<select data-tipo-foto="' + i + '" aria-label="Cômodo da foto ' + (i + 1) + '">' +
              opcoes(foto.tipo) +
            "</select>" +
            '<div class="foto-card__acoes">' +
              '<button type="button" data-capa="' + i + '" title="Usar como capa">Capa</button>' +
              '<button type="button" data-subir="' + i + '" title="Mover para trás">←</button>' +
              '<button type="button" data-descer="' + i + '" title="Mover para frente">→</button>' +
              '<button type="button" class="eh-remover" data-remover="' + i + '" title="Remover">✕</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    ).join("");

    /* Liga os controles */
    area.querySelectorAll("[data-tipo-foto]").forEach((s) =>
      s.addEventListener("change", () => {
        fotosAtuais[Number(s.dataset.tipoFoto)].tipo = s.value;
      }));

    area.querySelectorAll("[data-capa]").forEach((b) =>
      b.addEventListener("click", () => moverFoto(Number(b.dataset.capa), 0)));

    area.querySelectorAll("[data-subir]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.subir);
        if (i > 0) moverFoto(i, i - 1);
      }));

    area.querySelectorAll("[data-descer]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.descer);
        if (i < fotosAtuais.length - 1) moverFoto(i, i + 1);
      }));

    area.querySelectorAll("[data-remover]").forEach((b) =>
      b.addEventListener("click", () => removerFoto(Number(b.dataset.remover))));
  }

  function moverFoto(de, para) {
    const item = fotosAtuais.splice(de, 1)[0];
    fotosAtuais.splice(para, 0, item);
    desenharFotos();
  }

  async function removerFoto(indice) {
    const foto = fotosAtuais[indice];
    if (!confirm("Remover esta foto do imóvel?")) return;

    /* Apaga o arquivo lá do Storage também, para não acumular lixo */
    if (foto.caminho) {
      await sb.storage.from(SUPABASE.BUCKET_FOTOS).remove([foto.caminho]);
    }

    fotosAtuais.splice(indice, 1);
    desenharFotos();
    aviso("Foto removida.");
  }
  /* ==============================================================
     PARTE 5.C — MÁSCARA DE DINHEIRO
     --------------------------------------------------------------
     Formata os campos de valor enquanto a Monica digita:
       560000    →  R$ 560.000
       5163,63   →  R$ 5.163,63
       13000/mês →  R$ 13.000/mês

     REGRA DE LEITURA (importante entender):
       • Se tiver VÍRGULA, ela é o separador de centavos e os pontos
         são separadores de milhar.  "5.163,63" = cinco mil e cento
         e sessenta e três reais e sessenta e três centavos.
       • Se NÃO tiver vírgula, os pontos também são de milhar.
         "1.490.000" = um milhão, quatrocentos e noventa mil.
       Ou seja: para colocar centavos, use vírgula. Sem vírgula, o
       valor é lido como reais inteiros.

     O que vier DEPOIS do número é preservado como está — é assim
     que o "/mês" da locação continua funcionando.
     ============================================================== */

  /* Quais campos recebem a máscara. Para incluir outro, basta
     acrescentar o id dele nesta lista. */
  const CAMPOS_DE_DINHEIRO = ["preco", "condominio", "iptu"];

  function formatarMoeda(bruto) {
    let texto = String(bruto == null ? "" : bruto);

    /* Tira o "R$" que já estava lá — ele é recolocado no final */
    texto = texto.replace(/R\$/gi, "").replace(/^\s+/, "");

    /* Separa a parte numérica do resto.
       "13.000/mês"  →  numero: "13.000"   sufixo: "/mês" */
    const casamento = texto.match(/^([\d.,]*)([\s\S]*)$/);
    const numero = casamento[1];
    const sufixo = casamento[2];

    /* Ainda não digitou nenhum número: devolve como está */
    if (!/\d/.test(numero)) return texto.trim() ? texto.trim() : "";

    let inteiros;
    let centavos = "";
    const temVirgula = numero.indexOf(",") !== -1;

    if (temVirgula) {
      const partes = numero.split(",");
      inteiros = partes[0].replace(/\D/g, "");
      centavos = (partes[1] || "").replace(/\D/g, "").slice(0, 2);
    } else {
      inteiros = numero.replace(/\D/g, "");
    }

    /* Tira zeros à esquerda: "000560000" vira "560000" */
    inteiros = inteiros.replace(/^0+(?=\d)/, "");
    if (!inteiros) inteiros = "0";

    /* Coloca um ponto a cada 3 dígitos, da direita para a esquerda */
    const comPontos = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    let saida = "R$ " + comPontos;
    if (temVirgula) saida += "," + centavos;
    return saida + sufixo;
  }

  /* Conta dígitos e vírgulas de um trecho — serve para saber onde
     recolocar o cursor depois de reformatar o campo */
  function contarDigitos(texto) {
    const achados = String(texto).match(/[\d,]/g);
    return achados ? achados.length : 0;
  }

  function ligarMascaraDinheiro() {
    CAMPOS_DE_DINHEIRO.forEach(function (id) {
      const campo = $(id);
      if (!campo) return;

      /* Abre o teclado numérico no celular */
      campo.setAttribute("inputmode", "decimal");

      campo.addEventListener("input", function () {
        const antes = campo.value;
        const posicao = campo.selectionStart;

        /* Quantos dígitos existiam ANTES do cursor */
        const digitosAntes = contarDigitos(antes.slice(0, posicao));

        const depois = formatarMoeda(antes);
        if (depois === antes) return;   // nada mudou, não mexe no cursor

        campo.value = depois;

        /* Recoloca o cursor depois da mesma quantidade de dígitos.
           Sem isso o cursor pularia para o fim a cada tecla, e não
           daria para corrigir um número no meio. */
        let i = 0;
        let contados = 0;
        while (i < depois.length && contados < digitosAntes) {
          if (/[\d,]/.test(depois[i])) contados++;
          i++;
        }
        campo.setSelectionRange(i, i);
      });
    });
  }

/* ==============================================================
     PARTE 5.D — UNIDADE AUTOMÁTICA (m² e vaga/vagas)
     --------------------------------------------------------------
     A Monica digita só o número e o campo completa sozinho:
        92  →  92 m²
         1  →  1 vaga
         3  →  3 vagas

     A formatação acontece quando ela SAI do campo (evento "blur"),
     e não a cada tecla. Se fosse a cada tecla, digitar "9" viraria
     "9 m²" e o "2" seguinte cairia no lugar errado.

     REGRA DE SEGURANÇA: se ela já escreveu alguma letra no campo,
     o texto é respeitado como está. É isso que protege os imóveis
     já cadastrados ("92 m²", "3 vagas") de virarem "92 m² m²", e
     permite escrever coisas como "Sob consulta".
     ============================================================== */

  /* Para incluir outro campo, acrescente uma linha nesta lista.
     • unidade           → sempre acrescenta o mesmo texto
     • singular/plural   → escolhe conforme o número (1 = singular) */
  const CAMPOS_COM_UNIDADE = [
    { id: "area",  unidade: "m²" },
    { id: "vagas", singular: "vaga", plural: "vagas" },

    /* Descomente a linha abaixo se quiser o mesmo nos quartos */
    { id: "quartos", singular: "quarto", plural: "quartos" },
  ];

  function formatarComUnidade(bruto, regra) {
    const texto = String(bruto == null ? "" : bruto).trim();
    if (!texto) return "";

    /* Procura o primeiro número (aceita vírgula: 92,5) */
    const achado = texto.match(/\d+(?:[.,]\d+)?/);
    if (!achado) return texto;   // não tem número: deixa como está

    /* Já tem letra? Então ela mesma escreveu a unidade — não mexe */
    if (/[a-zA-ZçÇáàâãéêíóôõúÁÀÂÃÉÊÍÓÔÕÚ²³]/.test(texto)) return texto;

    const numeroTexto = achado[0];

    /* Caso 1: unidade fixa, como m² */
    if (regra.unidade) return numeroTexto + " " + regra.unidade;

    /* Caso 2: singular ou plural conforme o número */
    const valor = parseFloat(numeroTexto.replace(",", "."));
    return numeroTexto + " " + (valor === 1 ? regra.singular : regra.plural);
  }

  function ligarCamposComUnidade() {
    CAMPOS_COM_UNIDADE.forEach(function (regra) {
      const campo = $(regra.id);
      if (!campo) return;

      /* Abre o teclado numérico no celular */
      campo.setAttribute("inputmode", "numeric");

      /* "blur" = a pessoa saiu do campo (clicou fora ou deu Tab) */
      campo.addEventListener("blur", function () {
        campo.value = formatarComUnidade(campo.value, regra);
      });
    });
  }

  /* ==============================================================
     PARTE 6 — FORMULÁRIO: PREENCHER, LER E SALVAR
     ============================================================== */

  /* Abre o formulário. Sem id = cadastro novo. Com id = edição. */
  function abrirFormulario(id) {
    mostrarAvisoForm("formAviso", "");
    $("areaLista").hidden = true;
    $("areaFormulario").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!id) {
      $("formImovel").reset();
      $("imovelId").value = "";
      $("imovelPasta").value = "";
      $("ativo").checked = true;
      $("ordem").value = 0;
      fotosAtuais = [];
      desenharFotos();
      $("formEtiqueta").textContent = "Novo cadastro";
      $("formTitulo").textContent = "Cadastrar imóvel";
      return;
    }

    const imovel = imoveisCarregados.find((i) => i.id === id);
    if (!imovel) return;

    $("formEtiqueta").textContent = "Edição · id " + imovel.id;
    $("formTitulo").textContent = imovel.titulo;

    $("imovelId").value = imovel.id;
    $("imovelPasta").value = imovel.pasta_fotos || "";

    const radio = document.querySelector('input[name="tipo"][value="' + imovel.tipo + '"]');
    if (radio) radio.checked = true;

    $("titulo").value = imovel.titulo || "";
    $("bairro").value = imovel.bairro || "";
    $("preco").value = formatarMoeda(imovel.preco || "");
    $("quartos").value = imovel.quartos || "";
    $("banheiros").value = imovel.banheiros || "";
    $("area").value = imovel.area || "";
    $("vagas").value = imovel.vagas || "";
    $("condominio").value = formatarMoeda(imovel.condominio || "");
    $("iptu").value = formatarMoeda(imovel.iptu || "");
    $("descricao").value = imovel.descricao || "";
    $("descricaoCompleta").value = imovel.descricao_completa || "";
    $("caracteristicas").value = (imovel.caracteristicas || []).join("\n");
    $("ordem").value = imovel.ordem || 0;
    $("ativo").checked = !!imovel.ativo;

    /* Cópia das fotos, para poder cancelar sem bagunçar a original */
    fotosAtuais = (imovel.fotos || []).map((f) => ({
      url: f.url, tipo: f.tipo || "", caminho: f.caminho || "",
    }));
    desenharFotos();
  }

  function fecharFormulario() {
    $("areaFormulario").hidden = true;
    $("areaLista").hidden = false;
    fotosAtuais = [];
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarImovel(evento) {
    evento.preventDefault();
    mostrarAvisoForm("formAviso", "");

    /* Conferências antes de mandar para o banco */
    if (!fotosAtuais.length) {
      mostrarAvisoForm("formAviso", "Adicione pelo menos uma foto — a primeira vira a capa do anúncio.");
      return;
    }

    const semTipo = fotosAtuais.filter((f) => !f.tipo).length;
    if (semTipo) {
      mostrarAvisoForm("formAviso", "Falta escolher o cômodo de " + semTipo + " foto(s). Use o seletor abaixo de cada imagem.");
      return;
    }

    const botao = $("btnSalvar");
    botao.disabled = true;
    botao.querySelector("span").textContent = "Salvando…";

    /* Monta o objeto exatamente com os nomes das colunas do banco */
    const registro = {
      tipo: document.querySelector('input[name="tipo"]:checked').value,
      titulo: $("titulo").value.trim(),
      bairro: $("bairro").value.trim(),
      preco: $("preco").value.trim(),
      quartos: $("quartos").value.trim(),
      banheiros: $("banheiros").value.trim(),
      /* Passam pela unidade automática também aqui, por garantia */
      area: formatarComUnidade($("area").value, { unidade: "m²" }),
      vagas: formatarComUnidade($("vagas").value, { singular: "vaga", plural: "vagas" }),
      descricao: $("descricao").value.trim(),
      descricao_completa: $("descricaoCompleta").value.trim(),

      /* uma linha do textarea = um item da lista */
      caracteristicas: $("caracteristicas").value
        .split("\n").map((l) => l.trim()).filter(Boolean),

      condominio: $("condominio").value.trim(),
      iptu: $("iptu").value.trim(),

      /* a primeira foto é a capa */
      imagem: fotosAtuais[0].url,
      fotos: fotosAtuais.map((f) => ({ url: f.url, tipo: f.tipo, caminho: f.caminho })),

      pasta_fotos: $("imovelPasta").value || null,
      ordem: parseInt($("ordem").value, 10) || 0,
      ativo: $("ativo").checked,
    };

    const id = $("imovelId").value;
    let resultado;

    if (id) {
      resultado = await sb.from("imoveis").update(registro).eq("id", Number(id));
    } else {
      resultado = await sb.from("imoveis").insert(registro);
    }

    botao.disabled = false;
    botao.querySelector("span").textContent = "Salvar imóvel";

    if (resultado.error) {
      mostrarAvisoForm("formAviso", "Não consegui salvar: " + resultado.error.message);
      return;
    }

    aviso(id ? "Imóvel atualizado." : "Imóvel cadastrado.");
    await carregarImoveis();
    fecharFormulario();
  }


  /* ==============================================================
     PARTE 7 — APAGAR IMÓVEL
     ============================================================== */
  async function apagarImovel(id) {
    const imovel = imoveisCarregados.find((i) => i.id === id);
    if (!imovel) return;

    const certeza = confirm(
      'Apagar "' + imovel.titulo + '" definitivamente?\n\n' +
      "As fotos também serão excluídas e não há como desfazer.\n" +
      'Se quiser apenas tirar do site, use o botão "Tirar do ar".'
    );
    if (!certeza) return;

    /* 1) apaga as fotos do Storage */
    const caminhos = (imovel.fotos || []).map((f) => f.caminho).filter(Boolean);
    if (caminhos.length) {
      await sb.storage.from(SUPABASE.BUCKET_FOTOS).remove(caminhos);
    }

    /* 2) varre a pasta, caso tenha sobrado algum arquivo solto */
    if (imovel.pasta_fotos) {
      const { data: arquivos } = await sb.storage
        .from(SUPABASE.BUCKET_FOTOS).list(imovel.pasta_fotos);

      if (arquivos && arquivos.length) {
        await sb.storage.from(SUPABASE.BUCKET_FOTOS)
          .remove(arquivos.map((a) => imovel.pasta_fotos + "/" + a.name));
      }
    }

    /* 3) apaga a linha do banco */
    const { error } = await sb.from("imoveis").delete().eq("id", id);

    if (error) { aviso("Erro ao apagar: " + error.message, true); return; }

    aviso("Imóvel apagado.");
    carregarImoveis();
  }


  /* ==============================================================
     PARTE 8 — LEADS
     ============================================================== */

  /* 8.1 Interessados em comprar / alugar */
  async function carregarLeadsInteressados() {
    const corpo = $("tabelaInteressados").querySelector("tbody");
    corpo.innerHTML = '<tr><td colspan="8">Carregando…</td></tr>';

    const { data, error } = await sb
      .from("leads_interessados")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      corpo.innerHTML = '<tr><td colspan="8">Erro: ' + esc(error.message) + "</td></tr>";
      return;
    }

    $("contInteressados").textContent = (data || []).filter((l) => l.status === "novo").length;

    if (!data.length) {
      corpo.innerHTML = '<tr><td colspan="8">Nenhum contato recebido ainda.</td></tr>';
      return;
    }

    corpo.innerHTML = data.map((l) => {
      const wa = whatsappLink(l.telefone);
      return (
        "<tr>" +
          '<td class="td-data">' + formatarData(l.criado_em) + "</td>" +
          "<td><strong>" + esc(l.nome) + "</strong></td>" +
          "<td>" +
            (wa ? '<a href="' + wa + '" target="_blank" rel="noopener">' + esc(l.telefone) + "</a>" : esc(l.telefone)) +
            (l.email ? '<br><a href="mailto:' + esc(l.email) + '">' + esc(l.email) + "</a>" : "") +
          "</td>" +
          "<td>" + esc(ROTULO_INTERESSE[l.interesse] || l.interesse || "—") +
            (l.imovel_titulo ? "<br><small>" + esc(l.imovel_titulo) + "</small>" : "") + "</td>" +
          "<td>" + esc(l.bairro_desejado || "—") +
            (l.faixa_preco ? "<br><small>" + esc(l.faixa_preco) + "</small>" : "") + "</td>" +
          '<td class="td-msg">' + esc(l.mensagem || "—") + "</td>" +
          "<td>" + seletorStatus(l.id, l.status, STATUS_INTERESSADO, "leads_interessados") + "</td>" +
          '<td><button class="btn-lixeira" data-apagar-lead="' + l.id + '" data-tabela="leads_interessados" type="button">Apagar</button></td>' +
        "</tr>"
      );
    }).join("");

    ligarAcoesDeLead(corpo, carregarLeadsInteressados);
  }

  /* 8.2 Proprietários que querem anunciar */
  async function carregarLeadsProprietarios() {
    const corpo = $("tabelaProprietarios").querySelector("tbody");
    corpo.innerHTML = '<tr><td colspan="9">Carregando…</td></tr>';

    const { data, error } = await sb
      .from("leads_proprietarios")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      corpo.innerHTML = '<tr><td colspan="9">Erro: ' + esc(error.message) + "</td></tr>";
      return;
    }

    $("contProprietarios").textContent = (data || []).filter((l) => l.status === "novo").length;

    if (!data.length) {
      corpo.innerHTML = '<tr><td colspan="9">Nenhum proprietário se cadastrou ainda.</td></tr>';
      return;
    }

    corpo.innerHTML = data.map((l) => {
      const wa = whatsappLink(l.telefone);
      const imovel = [l.tipo_imovel, l.quartos, l.area, l.vagas].filter(Boolean).join(" · ");
      return (
        "<tr>" +
          '<td class="td-data">' + formatarData(l.criado_em) + "</td>" +
          "<td><strong>" + esc(l.nome) + "</strong></td>" +
          "<td>" +
            (wa ? '<a href="' + wa + '" target="_blank" rel="noopener">' + esc(l.telefone) + "</a>" : esc(l.telefone)) +
            (l.email ? '<br><a href="mailto:' + esc(l.email) + '">' + esc(l.email) + "</a>" : "") +
          "</td>" +
          "<td>" + esc(ROTULO_OBJETIVO[l.objetivo] || l.objetivo) + "</td>" +
          "<td>" + esc(imovel || "—") +
            (l.endereco ? "<br><small>" + esc(l.endereco) + "</small>" : "") +
            (l.bairro ? "<br><small>" + esc(l.bairro) + "</small>" : "") + "</td>" +
          "<td>" + esc(l.valor_desejado || "—") + "</td>" +
          '<td class="td-msg">' + esc(l.mensagem || "—") + "</td>" +
          "<td>" + seletorStatus(l.id, l.status, STATUS_PROPRIETARIO, "leads_proprietarios") + "</td>" +
          '<td><button class="btn-lixeira" data-apagar-lead="' + l.id + '" data-tabela="leads_proprietarios" type="button">Apagar</button></td>' +
        "</tr>"
      );
    }).join("");

    ligarAcoesDeLead(corpo, carregarLeadsProprietarios);
  }

  function seletorStatus(id, atual, opcoes, tabela) {
    return '<select data-status-lead="' + id + '" data-tabela="' + tabela + '">' +
      opcoes.map(([v, r]) =>
        '<option value="' + v + '"' + (v === atual ? " selected" : "") + ">" + r + "</option>"
      ).join("") + "</select>";
  }

  function ligarAcoesDeLead(corpo, recarregar) {
    corpo.querySelectorAll("[data-status-lead]").forEach((s) =>
      s.addEventListener("change", async () => {
        const { error } = await sb.from(s.dataset.tabela)
          .update({ status: s.value })
          .eq("id", Number(s.dataset.statusLead));
        aviso(error ? "Erro: " + error.message : "Situação atualizada.", !!error);
      }));

    corpo.querySelectorAll("[data-apagar-lead]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (!confirm("Apagar este contato? Não há como desfazer.")) return;
        const { error } = await sb.from(b.dataset.tabela)
          .delete().eq("id", Number(b.dataset.apagarLead));
        if (error) { aviso("Erro: " + error.message, true); return; }
        aviso("Contato apagado.");
        recarregar();
      }));
  }

  /* 8.3 Baixar a lista em CSV (abre no Excel / Google Planilhas) */
  async function baixarCsv(tabela, nomeArquivo) {
    const { data, error } = await sb.from(tabela).select("*").order("criado_em", { ascending: false });

    if (error || !data || !data.length) {
      aviso("Nada para exportar.", true);
      return;
    }

    const colunas = Object.keys(data[0]);

    /* Aspas duplas dentro do texto viram duas aspas (padrão CSV) */
    const celula = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';

    const linhas = [colunas.join(";")].concat(
      data.map((linha) => colunas.map((c) => celula(linha[c])).join(";"))
    );

    /* O \uFEFF no começo faz o Excel entender os acentos */
    const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo + "-" + new Date().toISOString().slice(0, 10) + ".csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }


  /* ==============================================================
     PARTE 9 — ABAS
     ============================================================== */
  function trocarAba(nome) {
    document.querySelectorAll(".admin-tab").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.aba === nome));

    const mapa = {
      imoveis: "abaImoveis",
      interessados: "abaInteressados",
      proprietarios: "abaProprietarios",
    };

    Object.entries(mapa).forEach(([chave, id]) => {
      const secao = $(id);
      secao.hidden = chave !== nome;
      secao.classList.toggle("is-active", chave === nome);
    });
  }


  /* ==============================================================
     PARTE 10 — LIGAR TUDO
     ============================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    /* Login */
    $("formLogin").addEventListener("submit", fazerLogin);
    $("btnSair").addEventListener("click", fazerLogout);

    /* Abas */
    document.querySelectorAll(".admin-tab").forEach((b) =>
      b.addEventListener("click", () => trocarAba(b.dataset.aba)));

    /* Filtros da lista de imóveis */
    document.querySelectorAll("#filtrosImoveis .chip").forEach((b) =>
      b.addEventListener("click", () => {
        filtroAtual = b.dataset.filtro;
        document.querySelectorAll("#filtrosImoveis .chip")
          .forEach((c) => c.classList.toggle("is-active", c === b));
        desenharListaImoveis();
      }));

    /* Máscara dos campos de valor (R$) */
    ligarMascaraDinheiro();
    
    /* Unidade automática nos campos de área e vagas */
    ligarCamposComUnidade();

    /* Formulário */
    $("btnNovoImovel").addEventListener("click", () => abrirFormulario(null));
    $("btnVoltarLista").addEventListener("click", fecharFormulario);
    $("btnCancelar").addEventListener("click", fecharFormulario);
    $("formImovel").addEventListener("submit", salvarImovel);

    /* Botão que monta a linha "Cond. X · IPTU Y" sozinho */
    $("btnGerarResumo").addEventListener("click", () => {
      const partes = [];
      if ($("condominio").value.trim()) partes.push("Cond. " + $("condominio").value.trim().replace("/mês", ""));
      if ($("iptu").value.trim()) partes.push("IPTU " + $("iptu").value.trim().replace("/mês", ""));
      $("descricao").value = partes.join(" · ");
    });

    /* Envio de fotos: clique */
    $("inputFotos").addEventListener("change", (e) => {
      receberArquivos(e.target.files);
      e.target.value = "";     // permite escolher o mesmo arquivo de novo
    });

    /* Envio de fotos: arrastar e soltar */
    const zona = $("dropzone");
    ["dragenter", "dragover"].forEach((ev) =>
      zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach((ev) =>
      zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove("is-over"); }));
    zona.addEventListener("drop", (e) => {
      if (e.dataTransfer && e.dataTransfer.files) receberArquivos(e.dataTransfer.files);
    });

    /* Exportação */
    $("btnCsvInteressados").addEventListener("click", () =>
      baixarCsv("leads_interessados", "leads-compradores"));
    $("btnCsvProprietarios").addEventListener("click", () =>
      baixarCsv("leads_proprietarios", "leads-proprietarios"));

    /* Aviso ao sair com o formulário aberto sem salvar */
    window.addEventListener("beforeunload", (e) => {
      if (!$("areaFormulario").hidden) { e.preventDefault(); e.returnValue = ""; }
    });

    /* Por último: confere se já existe alguém logado */
    verificarSessao();
  });
})();
