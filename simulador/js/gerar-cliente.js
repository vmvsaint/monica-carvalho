#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   GERAR-CLIENTE.JS — cria uma cópia personalizada do simulador

   Isto é o que transforma prospecção fria em algo escalável: em vez
   de mandar "olá, faço sites", você manda a ferramenta JÁ PRONTA,
   com o nome e a cor do corretor, funcionando num link.

   COMO USAR
   ─────────
   node gerar-cliente.js \
     --nome "Ricardo Almeida" \
     --creci "CRECI-RJ 12345" \
     --cidade "Rio de Janeiro" \
     --whatsapp "5521999998888" \
     --cor "#0F5C4A" \
     --pasta "ricardo-almeida"

   Sai uma pasta em ./clientes/ricardo-almeida pronta para publicar.

   Vértice node · vertice-node.com.br
   ═══════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

/* ─── lê os argumentos da linha de comando ─── */
function lerArgumentos() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith("--")) out[args[i].slice(2)] = args[i + 1];
  }
  return out;
}

/* ─── gera um "slug" seguro para nome de pasta ─── */
function slug(texto) {
  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // tira acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ─── escurece / clareia um hex, para derivar a paleta ─── */
function ajustarCor(hex, fator) {
  const n = parseInt(hex.replace("#", ""), 16);
  const canal = (deslocamento) => {
    let v = (n >> deslocamento) & 0xff;
    v = fator < 0
      ? Math.round(v * (1 + fator))                 // escurece
      : Math.round(v + (255 - v) * fator);          // clareia
    return Math.max(0, Math.min(255, v));
  };
  const [r, g, b] = [16, 8, 0].map(canal);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/* ─── copia uma pasta inteira ─── */
function copiarPasta(origem, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const item of fs.readdirSync(origem, { withFileTypes: true })) {
    // não leva para o cliente: o gerador, as cópias e a documentação interna
    if (["clientes", "gerar-cliente.js", "node_modules", ".git"].includes(item.name)) continue;
    if (item.name.endsWith(".md")) continue;

    const de = path.join(origem, item.name);
    const para = path.join(destino, item.name);
    if (item.isDirectory()) copiarPasta(de, para);
    else fs.copyFileSync(de, para);
  }
}


/* ═══════════════════════════════════════════════════════════════
   EXECUÇÃO
   ═══════════════════════════════════════════════════════════════ */
const a = lerArgumentos();

if (!a.nome || !a.whatsapp) {
  console.log(`
  Faltou informação obrigatória.

  Uso mínimo:
    node gerar-cliente.js --nome "Nome do Corretor" --whatsapp "5521999998888"

  Opcionais:
    --creci "CRECI-RJ 12345"
    --cidade "Rio de Janeiro"
    --cargo "Corretor de Imóveis"
    --cor "#0F5C4A"          cor principal da marca
    --taxa "11.49"           taxa de juros anual
    --itbi "3.0"             alíquota do ITBI da cidade
    --pasta "nome-da-pasta"  padrão: gerado a partir do nome
`);
  process.exit(1);
}

const corPrincipal = (a.cor || "#0F5C4A").toUpperCase();
const pastaDestino = path.join(__dirname, "clientes", a.pasta || slug(a.nome));

/* 1. copia os arquivos base */
copiarPasta(__dirname, pastaDestino);

/* 2. reescreve o config.js com os dados do cliente */
const caminhoConfig = path.join(pastaDestino, "js", "config.js");
let config = fs.readFileSync(caminhoConfig, "utf8");

const trocas = [
  [/nome:\s*"[^"]*"/,         `nome:     "${a.nome}"`],
  [/cargo:\s*"[^"]*"/,        `cargo:    "${a.cargo || "Corretor de Imóveis"}"`],
  [/registro:\s*"[^"]*"/,     `registro: "${a.creci || ""}"`],
  [/cidade:\s*"[^"]*"/,       `cidade:   "${a.cidade || ""}"`],
  [/whatsapp:\s*"[^"]*"/,     `whatsapp: "${String(a.whatsapp).replace(/\D/g, "")}"`],
  [/corPrincipal:\s*"[^"]*"/, `corPrincipal: "${corPrincipal}"`],
  [/corEscura:\s*"[^"]*"/,    `corEscura:    "${ajustarCor(corPrincipal, -0.35)}"`],
  [/corClara:\s*"[^"]*"/,     `corClara:     "${ajustarCor(corPrincipal, 0.90)}"`]
];

if (a.taxa) trocas.push([/taxaJurosAnual:\s*[\d.]+/, `taxaJurosAnual: ${a.taxa}`]);
if (a.itbi) trocas.push([/itbiPercent:\s*[\d.]+/,    `itbiPercent: ${a.itbi}`]);

trocas.forEach(([de, para]) => { config = config.replace(de, para); });
fs.writeFileSync(caminhoConfig, config);

/* 3. relatório */
console.log(`
  ✓ Simulador gerado para ${a.nome}

    pasta ....... ${path.relative(process.cwd(), pastaDestino)}
    whatsapp .... ${String(a.whatsapp).replace(/\D/g, "")}
    cor ......... ${corPrincipal}
                  escura: ${ajustarCor(corPrincipal, -0.35)}
                  clara:  ${ajustarCor(corPrincipal, 0.90)}

  PARA PUBLICAR:
    cd ${path.relative(process.cwd(), pastaDestino)}
    npx vercel --prod

  Depois mande o link para o corretor. Ele vê o próprio nome
  na tela antes de você ter pedido qualquer coisa.
`);
