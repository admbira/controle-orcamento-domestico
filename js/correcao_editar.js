/*
CORREÇÃO DO BOTÃO EDITAR

Como aplicar:
1. Abra o arquivo js/app.js no GitHub.
2. Procure a função editarLancamento.
3. Substitua a função antiga por esta.
4. Se preferir, substitua o app.js inteiro pelo arquivo deste pacote.

Esta versão aceita id como número ou texto e rola automaticamente para o formulário.
*/

function editarLancamento(id){
  const idTexto = String(id);
  const l = lancamentos.find(x => String(x.id) === idTexto);

  if(!l){
    alert("Não foi possível localizar este lançamento para edição.");
    return;
  }

  document.getElementById("editandoId").value = l.id;
  document.getElementById("data").value = l.data;
  document.getElementById("descricao").value = l.descricao;
  document.getElementById("tipo").value = l.tipo;
  document.getElementById("categoria").value = l.categoria;
  document.getElementById("valor").value = l.valor;

  document.getElementById("tituloFormulario").textContent = "Editar lançamento";
  document.getElementById("btnSalvar").textContent = "Salvar alterações";

  const formulario = document.getElementById("lancamentos");
  if(formulario){
    formulario.scrollIntoView({behavior:"smooth", block:"start"});
  }
}

/*
Também confira se a função salvarLancamento está assim:
*/

function salvarLancamento(){
  const idEditando = document.getElementById("editandoId").value;
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value.trim();
  const tipo = document.getElementById("tipo").value;
  const categoria = document.getElementById("categoria").value.trim() || "Outros";
  const valor = parseFloat(document.getElementById("valor").value);

  if(!data || !descricao || !valor){
    alert("Preencha data, descrição e valor.");
    return;
  }

  if(idEditando){
    const idx = lancamentos.findIndex(l => String(l.id) === String(idEditando));

    if(idx >= 0){
      lancamentos[idx] = {
        id: lancamentos[idx].id,
        data,
        descricao,
        tipo,
        categoria,
        valor
      };
    } else {
      alert("Lançamento não encontrado para salvar alteração.");
      return;
    }
  } else {
    lancamentos.push({
      id: Date.now(),
      data,
      descricao,
      tipo,
      categoria,
      valor
    });
  }

  document.getElementById("editandoId").value = "";
  document.getElementById("tituloFormulario").textContent = "Novo lançamento";
  document.getElementById("btnSalvar").textContent = "Adicionar";

  document.getElementById("descricao").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("valor").value = "";

  salvar();
}
