# Site — Monica Carvalho Imóveis

Site institucional e catálogo de imóveis da corretora **Monica Carvalho**, especialista em imóveis de alto padrão na Barra da Tijuca (RJ). Projeto desenvolvido pela [Vértice Node](https://vertice-node.com.br).

🔗 **Live:** [monica-carvalho-psi.vercel.app](https://monica-carvalho-psi.vercel.app)

![Status](https://img.shields.io/badge/status-ativo-38BDF8)
![Cliente](https://img.shields.io/badge/cliente-Monica%20Carvalho-A78BFA)

---

## 🧭 Sobre o projeto

Site desenvolvido para apresentar o portfólio de imóveis da corretora Monica Carvalho, com foco em captação de leads qualificados via WhatsApp e apresentação visual das propriedades disponíveis.

O projeto foi construído para crescer junto com o negócio: começou com listagem estática de imóveis e evoluiu para uma base de dados dinâmica, permitindo à cliente atualizar seu catálogo sem depender de código.

## ✨ Funcionalidades

- **Página inicial** com apresentação da corretora e destaques de imóveis
- **Listagem de imóveis** (`imoveis.html`) com filtros por características
- **Página individual do imóvel** (`imovel.html`) com galeria de fotos e detalhes completos
- **Contato direto via WhatsApp** em cada imóvel, já com mensagem pré-preenchida
- **Botão de compartilhar em cada imóvel** (nos cards, na página de detalhe e no painel ADM): no celular abre o menu do aparelho, no computador copia o link. O link compartilhado (`/imovel/7`) chega ao WhatsApp com foto, título e preço do imóvel — as etiquetas Open Graph são geradas no servidor pela função `api/imovel.js`, a partir do que a corretora cadastrou no painel
- **Simulador de financiamento imobiliário** (`/simulador`) — calcula parcelas pelas tabelas Price e SAC, já considerando ITBI e taxas de cartório, para o cliente simular o financiamento direto no site
- **Design responsivo**, pensado para acesso via mobile — canal onde a maior parte dos leads chega

## 🛠️ Tecnologias

- HTML5, CSS3 e JavaScript vanilla
- Base de dados de imóveis estruturada (`dados.js`)
- Integração com Supabase para gestão dinâmica do catálogo

## 📁 Estrutura

```
monica-carvalho/
├── index.html       # Página inicial
├── imoveis.html      # Listagem de imóveis
├── imovel.html        # Página de detalhe do imóvel
├── dados.js           # Dados/base dos imóveis
├── api/
│   └── imovel.js      # Função (Vercel) que gera a pré-visualização de /imovel/:id
├── vercel.json        # Rewrite /imovel/:id → api/imovel.js
├── script.js
├── style.css
├── logo-escuro.png
├── imagens/
└── simulador/          # Simulador de financiamento imobiliário
    └── index.html
```

## 🚀 Rodando localmente

```bash
npx serve .
```

O endereço `/imovel/:id` (usado nos links compartilhados) depende da função da Vercel.
Localmente ele só responde com `vercel dev`; com `npx serve` o botão de compartilhar
usa automaticamente o endereço tradicional `imovel.html?id=N`.

### Pré-visualização dos links (Open Graph)

`api/imovel.js` busca o imóvel no Supabase e injeta as etiquetas `og:*` no `imovel.html`
antes de entregar a página — por isso a foto e o preço da pré-visualização saem sempre do
cadastro feito no painel ADM, sem trabalho manual. As chaves usadas são as mesmas
(públicas) do `supabase-config.js`; opcionalmente podem ser definidas na Vercel como
`SUPABASE_URL` e `SUPABASE_CHAVE_PUBLICA`.

Depois de editar um imóvel, o WhatsApp e o Facebook podem manter a pré-visualização
antiga em cache. Para forçar a atualização, use o
[Sharing Debugger do Facebook](https://developers.facebook.com/tools/debug/).

## 💼 Desenvolvido por

**Vértice Node** — agência digital focada em soluções para o setor imobiliário e SMBs em geral: sites, CRM com automação de WhatsApp, gestão de tráfego pago e social media.

📩 [vertice-node.com.br](https://vertice-node.com.br) · [@verticenode](https://instagram.com/verticenode)
