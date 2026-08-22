/* ================================================================
   MONICA CARVALHO — api/imovel.js   (função que roda na Vercel)
   ================================================================
   ★ O QUE ESTE ARQUIVO FAZ ★

   Quando alguém usa o botão "Compartilhar", o link enviado é:

       https://seusite.com.br/imovel/7

   Esse endereço NÃO é um arquivo do site: quem responde por ele é
   este arquivo, que roda no servidor da Vercel. Ele:

     1. lê o número do imóvel no endereço (o 7 do exemplo);
     2. busca esse imóvel no Supabase — ou seja, pega exatamente o
        que foi cadastrado na página ADM (admin.html);
     3. abre o mesmo imovel.html de sempre e escreve dentro dele as
        etiquetas de pré-visualização (Open Graph): título, descrição
        e a FOTO de capa daquele imóvel;
     4. devolve a página pronta.

   Resultado: ao colar o link no WhatsApp, Instagram, Facebook ou
   Telegram aparece a foto do imóvel com o título e o preço, em vez
   de um link seco. Quem abre o link vê a página normal do imóvel.

   O endereço antigo (imovel.html?id=7) continua funcionando como
   sempre — nada foi retirado do site.

   ★ VOCÊ NÃO PRECISA EDITAR ESTE ARQUIVO NO DIA A DIA ★
   Cadastrar o imóvel na página ADM já basta: a foto e o texto da
   pré-visualização saem sozinhos do banco.
   ================================================================ */

const fs = require("fs");
const path = require("path");

/* ----------------------------------------------------------------
   CHAVES DO SUPABASE
   São as MESMAS do supabase-config.js (chave pública/publishable —
   pode ficar visível). Se um dia você trocar as chaves lá, troque
   aqui também — ou cadastre as variáveis de ambiente SUPABASE_URL e
   SUPABASE_CHAVE_PUBLICA no painel da Vercel, que elas têm
   preferência sobre os valores abaixo.
   ---------------------------------------------------------------- */
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://tigsymypjgjkkfeuwtks.supabase.co";
const SUPABASE_CHAVE =
  process.env.SUPABASE_CHAVE_PUBLICA || "sb_publishable_RnWJdJOv1de1ohWIXMncqg_DdFP6PIn";

/* Textos fixos da pré-visualização */
const NOME_DO_SITE = "Monica Carvalho — Consultora Imobiliária";

/* Foto usada quando o imóvel não tem capa cadastrada */
const IMAGEM_PADRAO = "imagens/main-site/orla-barra.webp";

/* O modelo (imovel.html) é lido uma vez e fica guardado na memória
   do servidor, para as próximas visitas serem instantâneas. */
let modeloEmMemoria = null;

/* ----------------------------------------------------------------
   Funções auxiliares
   ---------------------------------------------------------------- */

/* Deixa o texto seguro para ficar dentro de uma etiqueta HTML */
function esc(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Transforma "imagens/id1/sala.webp" em
   "https://seusite.com.br/imagens/id1/sala.webp".
   Endereços que já começam com http continuam como estão (é o caso
   das fotos enviadas pela ADM, que ficam guardadas no Supabase). */
function enderecoCompleto(caminho, base) {
  if (!caminho) return "";
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return base + "/" + String(caminho).replace(/^\/+/, "");
}

/* Corta um texto longo sem partir palavra no meio */
function resumir(texto, limite) {
  const limpo = String(texto || "").replace(/\s+/g, " ").trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.lastIndexOf(" ", limite);
  return limpo.slice(0, corte > 0 ? corte : limite).trim() + "…";
}

/* Busca UM imóvel publicado no Supabase (o mesmo banco da ADM) */
async function buscarImovel(id) {
  const colunas = "id,tipo,titulo,bairro,preco,quartos,banheiros,area,vagas,descricao,imagem";
  const endereco =
    SUPABASE_URL.replace(/\/+$/, "") +
    "/rest/v1/imoveis?select=" + colunas +
    "&id=eq." + encodeURIComponent(id) +
    "&ativo=is.true&limit=1";

  const resposta = await fetch(endereco, {
    headers: {
      apikey: SUPABASE_CHAVE,
      Authorization: "Bearer " + SUPABASE_CHAVE,
    },
  });

  if (!resposta.ok) return null;

  const linhas = await resposta.json();
  return Array.isArray(linhas) && linhas.length ? linhas[0] : null;
}

/* Pega o imovel.html. Primeiro tenta ler o arquivo direto (é o
   caminho normal); se não conseguir, busca pelo próprio site. */
async function lerModelo(base) {
  if (modeloEmMemoria) return modeloEmMemoria;

  try {
    modeloEmMemoria = fs.readFileSync(path.join(process.cwd(), "imovel.html"), "utf8");
    return modeloEmMemoria;
  } catch (erro) {
    const resposta = await fetch(base + "/imovel.html");
    if (!resposta.ok) throw new Error("Não consegui ler o imovel.html");
    modeloEmMemoria = await resposta.text();
    return modeloEmMemoria;
  }
}

/* Monta as etiquetas de pré-visualização do imóvel */
function etiquetas(imovel, urlDaPagina, base) {
  const titulo = imovel
    ? imovel.titulo + (imovel.bairro ? " — " + imovel.bairro : "")
    : "Imóvel | Monica Carvalho";

  /* Descrição: preço e ficha rápida na frente, resumo do anúncio
     depois. É o texto cinza que aparece embaixo do título. */
  const ficha = imovel
    ? [imovel.preco, imovel.quartos, imovel.area, imovel.vagas]
        .filter(function (v) { return v; })
        .join(" · ")
    : "";

  const descricao = imovel
    ? resumir([ficha, imovel.descricao].filter(function (v) { return v; }).join(" · "), 180)
    : "Imóveis selecionados na Barra da Tijuca com Monica Carvalho.";

  const foto = enderecoCompleto((imovel && imovel.imagem) || IMAGEM_PADRAO, base);
  const alt = imovel ? "Foto do imóvel " + imovel.titulo : NOME_DO_SITE;

  return [
    '<link rel="canonical" href="' + esc(urlDaPagina) + '" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="' + esc(NOME_DO_SITE) + '" />',
    '<meta property="og:locale" content="pt_BR" />',
    '<meta property="og:url" content="' + esc(urlDaPagina) + '" />',
    '<meta property="og:title" content="' + esc(titulo) + '" />',
    '<meta property="og:description" content="' + esc(descricao) + '" />',
    '<meta property="og:image" content="' + esc(foto) + '" />',
    '<meta property="og:image:alt" content="' + esc(alt) + '" />',
    '<meta property="og:image:width" content="1000" />',
    '<meta property="og:image:height" content="1000" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' + esc(titulo) + '" />',
    '<meta name="twitter:description" content="' + esc(descricao) + '" />',
    '<meta name="twitter:image" content="' + esc(foto) + '" />',
  ].join("\n  ");
}

/* ----------------------------------------------------------------
   A FUNÇÃO EM SI
   ---------------------------------------------------------------- */
module.exports = async function (req, res) {
  /* Só dígitos: /imovel/7 → "7" (protege contra endereços estranhos) */
  const idBruto = (req.query && req.query.id) || "";
  const id = String(idBruto).replace(/\D/g, "");

  /* Sem número não há imóvel: manda para a lista */
  if (!id) {
    res.writeHead(302, { Location: "/imoveis.html" });
    res.end();
    return;
  }

  const protocolo = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const base = protocolo + "://" + req.headers.host;
  const urlDaPagina = base + "/imovel/" + id;

  try {
    /* Busca o imóvel e o modelo da página ao mesmo tempo.
       Se o banco falhar, seguimos assim mesmo: a página abre igual,
       só a pré-visualização fica genérica. */
    const resultado = await Promise.all([
      buscarImovel(id).catch(function () { return null; }),
      lerModelo(base),
    ]);

    const imovel = resultado[0];
    let html = resultado[1];

    /* <base> avisa o navegador que os arquivos do site (style.css,
       imagens/…) continuam saindo da raiz, mesmo a página estando
       em /imovel/7. Precisa vir logo no começo do <head>. */
    html = html.replace(/<head(\s[^>]*)?>/i, function (encontrado) {
      return encontrado + '\n  <base href="/" />';
    });

    /* Título da aba e descrição do buscador */
    if (imovel) {
      html = html.replace(
        /<title>[\s\S]*?<\/title>/i,
        "<title>" + esc(imovel.titulo) + " | Monica Carvalho</title>"
      );
      html = html.replace(
        /<meta\s+name="description"[^>]*>/i,
        '<meta name="description" content="' +
          esc(resumir(imovel.descricao || imovel.titulo, 180)) + '" />'
      );
    }

    /* Etiquetas de pré-visualização, no fim do <head> */
    html = html.replace(/<\/head>/i, "  " + etiquetas(imovel, urlDaPagina, base) + "\n</head>");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    /* A pré-visualização fica guardada por 5 minutos. O conteúdo da
       página (fotos, textos) continua vindo ao vivo do banco. */
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    res.status(200).send(html);
  } catch (erro) {
    /* Deu qualquer problema? A pessoa não pode ficar sem ver o
       imóvel: mandamos para a página de sempre. */
    console.error("[api/imovel] " + (erro && erro.message));
    res.writeHead(302, { Location: "/imovel.html?id=" + id });
    res.end();
  }
};
