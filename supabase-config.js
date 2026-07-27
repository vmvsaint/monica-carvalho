/* ================================================================
   MONICA CARVALHO — supabase-config.js
   ================================================================
   ★★★ ESTE É O ÚNICO ARQUIVO ONDE VOCÊ COLOCA AS CHAVES ★★★
 
   Este arquivo faz 3 coisas:
     1. Guarda o endereço e a chave pública do seu projeto Supabase
     2. Cria a "conexão" (cliente) usada por todas as páginas
     3. Traz os imóveis do banco já no formato que o script.js entende
 
   ORDEM DE CARREGAMENTO (importante!):
     1º  a biblioteca do Supabase (link do jsdelivr)
     2º  dados.js          → lista IMOVEIS que serve de reserva
     3º  supabase-config.js → este arquivo
     4º  script.js         → o "motor" do site
 
   ⚠ SEGURANÇA: a chave abaixo é a chave PÚBLICA (publishable /
   anon). Ela PODE ficar visível no navegador — é para isso que ela
   existe. O que protege os dados são as regras de RLS que você
   rodou no supabase-setup.sql.
   NUNCA cole aqui a chave "secret" / "service_role". Essa é a chave
   de administrador e daria acesso total ao seu banco para qualquer
   pessoa que abrisse o código-fonte do site.
   ================================================================ */
 
/* ================================================================
   PARTE 1 — SUAS CHAVES  ★ EDITE AQUI ★
   ----------------------------------------------------------------
   Onde encontrar:
     Painel do Supabase → Project Settings → API Keys
       • Project URL          → cole em URL
       • publishable key      → cole em CHAVE_PUBLICA
         (nos projetos mais antigos ela se chama "anon public")
   ================================================================ */
const SUPABASE = {
  URL: "https://tigsymypjgjkkfeuwtks.supabase.co",
  CHAVE_PUBLICA: "sb_publishable_RnWJdJOv1de1ohWIXMncqg_DdFP6PIn",
 
  /* Nome do "balde" onde as fotos ficam guardadas.
     Foi criado pelo supabase-setup.sql — não precisa mudar. */
  BUCKET_FOTOS: "imoveis",
};
 
/* ================================================================
   PARTE 2 — CRIA A CONEXÃO
   ----------------------------------------------------------------
   Se as chaves ainda não foram preenchidas, devolve null.
   Nesse caso o site continua funcionando com a lista IMOVEIS do
   dados.js (modo "reserva"), sem quebrar nada.
   ================================================================ */
function criarClienteSupabase() {
  /* A biblioteca do Supabase carregou? (o link do jsdelivr cria a
     variável global "supabase" com a função createClient dentro) */
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.warn("[Supabase] Biblioteca não carregou. Conferir o <script> do jsdelivr.");
    return null;
  }
 
  /* Limpa espaços, quebras de linha e barra no fim, que costumam vir
     junto no copiar-e-colar sem a gente perceber */
  const url = String(SUPABASE.URL || "").trim().replace(/\/+$/, "");
  const chave = String(SUPABASE.CHAVE_PUBLICA || "").trim();
 
  /* ⚠ IMPORTANTE: esta verificação confere o FORMATO do valor.
     A versão antiga procurava o texto de exemplo ("SEU-PROJETO") e
     quebrava se você usasse "Substituir tudo" no editor — o texto de
     exemplo era trocado aqui dentro também, e a verificação passava a
     recusar justamente a chave certa. Esta versão não tem esse risco:
     não existe nenhum texto de exemplo escrito abaixo. */
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url)) {
    console.warn("[Supabase] URL com formato inválido:", JSON.stringify(url),
      "\nEsperado algo como https://abcdefgh.supabase.co");
    return null;
  }
 
  const pareceChave =
    (chave.startsWith("sb_publishable_") || chave.startsWith("eyJ")) && chave.length > 30;
 
  if (!pareceChave) {
    console.warn("[Supabase] Chave pública com formato inválido.",
      "\nTamanho:", chave.length,
      "| Começo:", chave.slice(0, 15),
      "\nDeve começar com sb_publishable_ (ou com eyJ nos projetos antigos).");
    return null;
  }
 
  return window.supabase.createClient(url, chave);
}
 
/* A conexão fica disponível para todas as páginas na variável "sb".
   (sb = supabase, nome curto para não ficar repetitivo no código) */
/* Mudou de "const" para "let" porque agora ele pode ser recriado. */
let sb = criarClienteSupabase();
 
/* Rede de segurança: se a biblioteca do jsdelivr ainda estava
   carregando quando este arquivo rodou, sb ficou null. Aqui tentamos
   de novo quando a página termina de carregar.
   Como este arquivo é lido ANTES do admin.js e do formularios.js,
   esta tentativa sempre acontece primeiro. */
document.addEventListener("DOMContentLoaded", function () {
  if (!sb) {
    sb = criarClienteSupabase();
    if (sb) console.info("[Supabase] Conexão criada na segunda tentativa.");
  }
});
 
/* ================================================================
   PARTE 3 — TRADUTOR: LINHA DO BANCO → OBJETO DO SITE
   ----------------------------------------------------------------
   No banco as colunas são em minúsculo com underline
   (descricao_completa). No script.js do site elas já eram
   descricaoCompleta. Esta função faz a tradução, para que o site
   continue funcionando EXATAMENTE igual, sem mudar o visual.
   ================================================================ */
function linhaParaImovel(linha) {
  /* A coluna "fotos" no banco é uma lista de objetos:
       [{ url: "https://...", tipo: "Sala" }, ...]
     O script.js espera só uma lista de endereços (URLs).
     Então separamos as duas coisas. */
  const listaFotos = Array.isArray(linha.fotos) ? linha.fotos : [];
 
  return {
    id: linha.id,
    tipo: linha.tipo,
    titulo: linha.titulo || "",
    bairro: linha.bairro || "",
    preco: linha.preco || "",
    quartos: linha.quartos || "",
    banheiros: linha.banheiros || "",
    area: linha.area || "",
    vagas: linha.vagas || "",
    descricao: linha.descricao || "",
    descricaoCompleta: linha.descricao_completa || "",
    caracteristicas: linha.caracteristicas || [],
    condominio: linha.condominio || "",
    iptu: linha.iptu || "",
    imagem: linha.imagem || "https://placehold.co/800x550/e8e0d2/0f3d3e?text=Sem+foto",
 
    /* O site já mostra a capa (imovel.imagem) como primeira foto da
       galeria. Por isso mandamos aqui só as fotos EXTRAS — usando
       slice(1) para pular a primeira e não repetir a capa. */
    fotos: listaFotos.slice(1).map(function (f) { return f.url; }),
 
    /* extra: o nome do cômodo de cada foto extra, na mesma ordem */
    fotosLegendas: listaFotos.slice(1).map(function (f) { return f.tipo || ""; }),
  };
}
 
/* ================================================================
   PARTE 4 — BUSCA OS IMÓVEIS NO BANCO
   ----------------------------------------------------------------
   Devolve uma lista já no formato do dados.js.
   Se der qualquer erro (internet caiu, chave errada, banco fora do
   ar), devolve null e o site usa a lista IMOVEIS do dados.js.
   ================================================================ */
async function carregarImoveisDoSupabase() {
  if (!sb) return null;
 
  const { data, error } = await sb
    .from("imoveis")
    .select("*")
    .eq("ativo", true)          // só os imóveis publicados
    .order("ordem", { ascending: true })
    .order("id", { ascending: true });
 
  if (error) {
    console.error("[Supabase] Erro ao buscar imóveis:", error.message);
    return null;
  }
 
  return (data || []).map(linhaParaImovel);
}
 
/* ================================================================
   PARTE 5 — LISTA DE CÔMODOS / TIPOS DE FOTO
   ----------------------------------------------------------------
   É esta lista que aparece no painel quando a Monica anexa uma foto
   ("que foto é essa?"). Para incluir um cômodo novo, basta escrever
   mais uma linha aqui dentro, entre aspas e com vírgula no fim.
   ================================================================ */
const TIPOS_DE_FOTO = [
  "Fachada",
  "Portaria",
  "Hall",
  "Sala",
  "Sala de jantar",
  "Varanda",
  "Varanda gourmet",
  "Cozinha",
  "Área de serviço",
  "Lavabo",
  "Quarto",
  "Suíte",
  "Suíte master",
  "Closet",
  "Banheiro",
  "Escritório",
  "Dependência de empregada",
  "Vista",
  "Piscina",
  "Academia",
  "Salão de festas",
  "Churrasqueira",
  "Quadra",
  "Playground",
  "Espaço gourmet",
  "Garagem",
  "Planta baixa",
  "Outro",
];
 
/* ================================================================
   PARTE 6 — TIPOS DE ANÚNCIO
   Os valores da esquerda são os que vão para o banco (não mude).
   Os da direita são só o texto que aparece na tela.
   ================================================================ */
const TIPOS_DE_ANUNCIO = [
  { valor: "venda",      rotulo: "Venda" },
  { valor: "locacao",    rotulo: "Locação" },
  { valor: "lancamento", rotulo: "Lançamento" },
];