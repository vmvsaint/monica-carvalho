/* ================================================================
   MONICA CARVALHO — formularios.js
   ================================================================
   Cuida do ENVIO dos dois formulários de contato do site:

     • #formProprietario  (anuncie-seu-imovel.html)
         → grava na tabela  leads_proprietarios
     • #formInteressado   (bloco novo do index.html)
         → grava na tabela  leads_interessados

   Como os leads ficam SEPARADOS: são duas tabelas diferentes no
   Supabase. Cada formulário grava só na sua. No painel (admin.html)
   elas aparecem em abas distintas.

   Segurança: o visitante do site tem permissão APENAS de inserir
   linhas nessas tabelas (regra RLS "visitante_envia_lead_*").
   Ele não consegue ler, editar nem apagar nada — nem os dados de
   outras pessoas, nem os imóveis.

   Este arquivo precisa carregar DEPOIS do supabase-config.js
   (é de lá que vem a conexão chamada "sb").
   ================================================================ */

(function () {
  "use strict";

  /* ==============================================================
     1. AJUDANTES
     ============================================================== */

  const $ = (id) => document.getElementById(id);

  /* Mostra ou esconde a faixa vermelha de erro */
  function avisar(idAviso, mensagem) {
    const el = $(idAviso);
    if (!el) return;
    if (!mensagem) { el.hidden = true; return; }
    el.textContent = mensagem;
    el.hidden = false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* Marca/desmarca o contorno vermelho de um campo */
  function marcarErro(campo, tem) {
    if (campo) campo.classList.toggle("tem-erro", !!tem);
  }

  /* Valida um telefone brasileiro de forma simples:
     precisa ter entre 10 e 13 dígitos (com ou sem DDI e DDD) */
  function telefoneValido(valor) {
    const digitos = String(valor || "").replace(/\D/g, "");
    return digitos.length >= 10 && digitos.length <= 13;
  }

  /* Valida e-mail só quando ele foi preenchido (é opcional) */
  function emailValido(valor) {
    if (!valor) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
  }

  /* Troca o formulário pela mensagem de "recebido!" */
  function mostrarSucesso(idForm, idSucesso) {
    const form = $(idForm);
    const sucesso = $(idSucesso);
    if (form) form.hidden = true;
    if (sucesso) {
      sucesso.hidden = false;
      sucesso.scrollIntoView({ behavior: "smooth", block: "center" });

      /* Os links de WhatsApp dentro da mensagem de sucesso são
         preenchidos pelo script.js, que já rodou antes. Como este
         bloco estava escondido, garantimos o link aqui também. */
      if (typeof CONFIG !== "undefined") {
        const link = "https://wa.me/" + CONFIG.whatsappNumero +
          "?text=" + encodeURIComponent(CONFIG.whatsappMensagem);
        sucesso.querySelectorAll(".js-whatsapp").forEach((a) => (a.href = link));
      }
    }
  }

  /* Plano B: se o Supabase estiver fora do ar, o contato não se
     perde — abrimos o WhatsApp com a mensagem já escrita. */
  function planoBWhatsapp(texto) {
    if (typeof CONFIG === "undefined") return null;
    return "https://wa.me/" + CONFIG.whatsappNumero + "?text=" + encodeURIComponent(texto);
  }

  /* Trava o botão enquanto o envio acontece, para não mandar duas
     vezes se a pessoa clicar rápido */
  function travarBotao(botao, travado, textoOriginal) {
    if (!botao) return;
    botao.disabled = travado;
    botao.textContent = travado ? "Enviando…" : textoOriginal;
  }


  /* ==============================================================
     2. FORMULÁRIO DE PROPRIETÁRIOS (anuncie-seu-imovel.html)
     ============================================================== */
  function ligarFormularioProprietario() {
    const form = $("formProprietario");
    if (!form) return;   // não estamos nessa página

    const botao = $("propEnviar");
    const textoBotao = botao ? botao.textContent : "";

    form.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      avisar("propAviso", "");

      /* --- Armadilha anti-robô: se o campo invisível veio
             preenchido, foi um robô. Fingimos que deu certo. --- */
      if ($("propSite") && $("propSite").value) {
        mostrarSucesso("formProprietario", "propSucesso");
        return;
      }

      /* --- Conferências --- */
      const nome = $("propNome").value.trim();
      const telefone = $("propTelefone").value.trim();
      const email = $("propEmail").value.trim();

      marcarErro($("propNome"), false);
      marcarErro($("propTelefone"), false);
      marcarErro($("propEmail"), false);

      if (nome.length < 3) {
        marcarErro($("propNome"), true);
        avisar("propAviso", "Escreva seu nome completo.");
        return;
      }
      if (!telefoneValido(telefone)) {
        marcarErro($("propTelefone"), true);
        avisar("propAviso", "Digite um WhatsApp válido, com DDD. Ex.: (21) 99999-9999");
        return;
      }
      if (!emailValido(email)) {
        marcarErro($("propEmail"), true);
        avisar("propAviso", "Confira o e-mail digitado.");
        return;
      }
      if (!$("propAceite").checked) {
        avisar("propAviso", "Para eu poder retornar, preciso da sua autorização de contato.");
        return;
      }

      /* --- Monta a linha que vai para o banco --- */
      const registro = {
        nome: nome,
        telefone: telefone,
        email: email || null,
        objetivo: form.querySelector('input[name="objetivo"]:checked').value,
        tipo_imovel: $("propTipoImovel").value || null,
        endereco: $("propEndereco").value.trim() || null,
        bairro: $("propBairro").value.trim() || null,
        quartos: $("propQuartos").value.trim() || null,
        vagas: $("propVagas").value.trim() || null,
        area: $("propArea").value.trim() || null,
        valor_desejado: $("propValor").value.trim() || null,
        ocupacao: $("propOcupacao").value || null,
        exclusividade: $("propExclusividade").value || null,
        mensagem: $("propMensagem").value.trim() || null,
        aceite_privacidade: true,
        origem: "anuncie-seu-imovel",
      };

      travarBotao(botao, true, textoBotao);

      /* --- Envia --- */
      /* Repare que NÃO usamos .select() depois do .insert():
         assim o visitante não precisa de permissão de leitura. */
      if (!sb) {
        travarBotao(botao, false, textoBotao);
        const link = planoBWhatsapp(
          "Olá, Monica! Quero anunciar meu imóvel.\n" +
          "Nome: " + nome + "\nTelefone: " + telefone +
          "\nObjetivo: " + registro.objetivo +
          (registro.bairro ? "\nBairro: " + registro.bairro : "")
        );
        avisar("propAviso", "O sistema está indisponível no momento. " +
          (link ? "Clique aqui para enviar pelo WhatsApp: " + link : "Tente novamente em instantes."));
        return;
      }

      const { error } = await sb.from("leads_proprietarios").insert(registro);

      travarBotao(botao, false, textoBotao);

      if (error) {
        console.error("[leads] ", error);
        avisar("propAviso", "Não consegui registrar seu contato agora. Tente de novo ou me chame no WhatsApp.");
        return;
      }

      mostrarSucesso("formProprietario", "propSucesso");
    });
  }


  /* ==============================================================
     3. FORMULÁRIO DE INTERESSADOS (bloco do index.html)
     ============================================================== */
  function ligarFormularioInteressado() {
    const form = $("formInteressado");
    if (!form) return;   // não estamos nessa página

    const botao = $("intEnviar");
    const textoBotao = botao ? botao.textContent : "";

    form.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      avisar("intAviso", "");

      if ($("intSite") && $("intSite").value) {
        mostrarSucesso("formInteressado", "intSucesso");
        return;
      }

      const nome = $("intNome").value.trim();
      const telefone = $("intTelefone").value.trim();
      const email = $("intEmail").value.trim();

      marcarErro($("intNome"), false);
      marcarErro($("intTelefone"), false);
      marcarErro($("intEmail"), false);

      if (nome.length < 3) {
        marcarErro($("intNome"), true);
        avisar("intAviso", "Escreva seu nome completo.");
        return;
      }
      if (!telefoneValido(telefone)) {
        marcarErro($("intTelefone"), true);
        avisar("intAviso", "Digite um WhatsApp válido, com DDD.");
        return;
      }
      if (!emailValido(email)) {
        marcarErro($("intEmail"), true);
        avisar("intAviso", "Confira o e-mail digitado.");
        return;
      }
      if (!$("intAceite").checked) {
        avisar("intAviso", "Preciso da sua autorização para entrar em contato.");
        return;
      }

      const registro = {
        nome: nome,
        telefone: telefone,
        email: email || null,
        interesse: form.querySelector('input[name="interesse"]:checked').value,
        bairro_desejado: $("intBairro").value.trim() || null,
        faixa_preco: $("intFaixa").value || null,
        mensagem: $("intMensagem").value.trim() || null,
        origem: "site",
      };

      /* Se o formulário estiver dentro da página de um imóvel,
         guarda também qual imóvel gerou o contato. */
      const idImovel = form.dataset.imovelId;
      if (idImovel) {
        registro.imovel_id = Number(idImovel);
        registro.imovel_titulo = form.dataset.imovelTitulo || null;
      }

      travarBotao(botao, true, textoBotao);

      if (!sb) {
        travarBotao(botao, false, textoBotao);
        const link = planoBWhatsapp(
          "Olá, Monica! Tenho interesse em " + registro.interesse + " um imóvel.\n" +
          "Nome: " + nome + "\nTelefone: " + telefone
        );
        avisar("intAviso", "O sistema está indisponível no momento. " +
          (link ? "Envie pelo WhatsApp: " + link : "Tente novamente em instantes."));
        return;
      }

      const { error } = await sb.from("leads_interessados").insert(registro);

      travarBotao(botao, false, textoBotao);

      if (error) {
        console.error("[leads] ", error);
        avisar("intAviso", "Não consegui registrar seu contato agora. Tente de novo ou me chame no WhatsApp.");
        return;
      }

      mostrarSucesso("formInteressado", "intSucesso");
    });
  }


  /* ==============================================================
     4. LIGA OS DOIS QUANDO A PÁGINA TERMINA DE CARREGAR
     ============================================================== */
  document.addEventListener("DOMContentLoaded", function () {
    ligarFormularioProprietario();
    ligarFormularioInteressado();
  });
})();
