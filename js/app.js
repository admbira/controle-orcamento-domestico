let lancamentos = JSON.parse(localStorage.getItem("lancamentos_orcamento")) || [];
let graficos = {};

const cores = [
  "#0057C8", "#D4AF37", "#1ABC9C", "#E67E22", "#9B59B6",
  "#E74C3C", "#3498DB", "#2ECC71", "#F1C40F", "#95A5A6",
  "#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#845EC2"
];

function salvar(){
  localStorage.setItem("lancamentos_orcamento", JSON.stringify(lancamentos));
  atualizar();
}

function moeda(v){
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function hoje(){
  return new Date().toISOString().slice(0, 10);
}

window.addEventListener("load", () => {
  document.getElementById("data").value = hoje();
  document.getElementById("mesReferencia").value = hoje().slice(0, 7);

  const nomeUsuario = document.getElementById("nomeUsuario");
  nomeUsuario.value = localStorage.getItem("nomeUsuario") || "";
  nomeUsuario.addEventListener("input", e => {
    localStorage.setItem("nomeUsuario", e.target.value);
  });

  cancelarEdicao(false);
  atualizar();
});

function limparFormulario(){
  document.getElementById("descricao").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("data").value = hoje();
}

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

  cancelarEdicao(false);
  limparFormulario();
  salvar();
}

function editarLancamento(id){
  const l = lancamentos.find(x => String(x.id) === String(id));

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
    formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function cancelarEdicao(limpar = true){
  document.getElementById("editandoId").value = "";
  document.getElementById("tituloFormulario").textContent = "Novo lançamento";
  document.getElementById("btnSalvar").textContent = "Adicionar";

  if(limpar){
    limparFormulario();
  }
}

function duplicarLancamento(id){
  const l = lancamentos.find(x => String(x.id) === String(id));

  if(!l){
    alert("Não foi possível duplicar este lançamento.");
    return;
  }

  lancamentos.push({
    ...l,
    id: Date.now(),
    descricao: l.descricao + " (cópia)"
  });

  salvar();
}

function prepararReceita(){
  cancelarEdicao();
  document.getElementById("tipo").value = "Receita";
  document.getElementById("descricao").focus();
}

function prepararDespesa(){
  cancelarEdicao();
  document.getElementById("tipo").value = "Despesa";
  document.getElementById("descricao").focus();
}

function remover(id){
  if(confirm("Remover lançamento?")){
    lancamentos = lancamentos.filter(l => String(l.id) !== String(id));
    salvar();
  }
}

function periodoFiltrado(){
  let ini = document.getElementById("dataInicial").value;
  let fim = document.getElementById("dataFinal").value;
  const mes = document.getElementById("mesReferencia").value;

  if(!ini && !fim && mes){
    ini = mes + "-01";
    fim = new Date(
      Number(mes.slice(0,4)),
      Number(mes.slice(5,7)),
      0
    ).toISOString().slice(0,10);
  }

  return lancamentos.filter(l =>
    (!ini || l.data >= ini) &&
    (!fim || l.data <= fim)
  );
}

function aplicarBuscaECategoria(lista){
  const pesquisa = document.getElementById("pesquisa");
  const filtroCategoria = document.getElementById("filtroCategoria");

  const termo = (pesquisa?.value || "").toLowerCase();
  const cat = filtroCategoria?.value || "";

  return lista.filter(l => {
    const texto = `${l.descricao} ${l.tipo} ${l.categoria} ${l.data}`.toLowerCase();
    return (!termo || texto.includes(termo)) && (!cat || l.categoria === cat);
  });
}

function filtrarPeriodo(){
  atualizar();
}

function mesAtual(){
  const d = new Date();
  document.getElementById("mesReferencia").value = d.toISOString().slice(0,7);
  document.getElementById("dataInicial").value = "";
  document.getElementById("dataFinal").value = "";
  atualizar();
}

function ultimosTresMeses(){
  const f = new Date();
  const i = new Date();

  i.setMonth(i.getMonth() - 2);
  i.setDate(1);

  document.getElementById("dataInicial").value = i.toISOString().slice(0,10);
  document.getElementById("dataFinal").value = f.toISOString().slice(0,10);
  document.getElementById("mesReferencia").value = "";
  atualizar();
}

function esteAno(){
  const y = new Date().getFullYear();
  document.getElementById("dataInicial").value = `${y}-01-01`;
  document.getElementById("dataFinal").value = `${y}-12-31`;
  document.getElementById("mesReferencia").value = "";
  atualizar();
}

function agrupar(lista, tipo){
  const obj = {};

  lista
    .filter(l => l.tipo === tipo)
    .forEach(l => {
      obj[l.categoria] = (obj[l.categoria] || 0) + Number(l.valor);
    });

  return obj;
}

function atualizarCategorias(){
  const select = document.getElementById("filtroCategoria");
  if(!select) return;

  const atual = select.value;
  const categorias = [...new Set(lancamentos.map(l => l.categoria).filter(Boolean))].sort();

  select.innerHTML = '<option value="">Todas as categorias</option>' +
    categorias.map(c => `<option value="${c}">${c}</option>`).join("");

  if(categorias.includes(atual)){
    select.value = atual;
  }
}

function atualizar(){
  atualizarCategorias();

  const lista = aplicarBuscaECategoria(periodoFiltrado());

  const receitas = lista
    .filter(l => l.tipo === "Receita")
    .reduce((s,l) => s + Number(l.valor), 0);

  const despesas = lista
    .filter(l => l.tipo === "Despesa")
    .reduce((s,l) => s + Number(l.valor), 0);

  const saldo = receitas - despesas;
  const total = receitas + despesas;

  document.getElementById("totalReceitas").textContent = moeda(receitas);
  document.getElementById("totalDespesas").textContent = moeda(despesas);
  document.getElementById("saldo").textContent = moeda(saldo);

  document.getElementById("percReceitas").textContent =
    total ? ((receitas / total) * 100).toFixed(1) + "% do total" : "0% do total";

  document.getElementById("percDespesas").textContent =
    total ? ((despesas / total) * 100).toFixed(1) + "% do total" : "0% do total";

  document.getElementById("percSaldo").textContent =
    receitas ? ((saldo / receitas) * 100).toFixed(1) + "% poupança/receita" : "0% poupança/receita";

  const maior = lista
    .filter(l => l.tipo === "Despesa")
    .sort((a,b) => b.valor - a.valor)[0];

  document.getElementById("maiorDespesa").textContent = maior ? moeda(maior.valor) : moeda(0);

  const tbody = document.getElementById("tabelaLancamentos");

  tbody.innerHTML = lista
    .slice()
    .sort((a,b) => b.data.localeCompare(a.data))
    .slice(0,150)
    .map(l => `
      <tr>
        <td>${l.data}</td>
        <td>${l.descricao}</td>
        <td>${l.tipo}</td>
        <td>${l.categoria}</td>
        <td class="${l.tipo === 'Receita' ? 'receita' : 'despesa'}">
          ${l.tipo === 'Receita' ? '+' : '-'} ${moeda(l.valor)}
        </td>
        <td class="acoes-tabela">
          <button onclick="editarLancamento(${l.id})">✏️ Editar</button>
          <button onclick="duplicarLancamento(${l.id})">📋 Duplicar</button>
          <button onclick="remover(${l.id})">🗑️ Excluir</button>
        </td>
      </tr>
    `).join("");

  desenharGraficos(lista, receitas, despesas);
}

function chart(id, config){
  if(graficos[id]){
    graficos[id].destroy();
  }

  graficos[id] = new Chart(document.getElementById(id), config);
}

function desenharGraficos(lista, receitas, despesas){
  Chart.defaults.color = "#eaf2ff";
  Chart.defaults.borderColor = "rgba(255,255,255,.12)";

  chart("graficoResumo", {
    type: "bar",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        label: "Valor",
        data: [receitas, despesas],
        backgroundColor: ["#0057C8", "#D4AF37"],
        borderColor: ["#2B8CFF", "#F5C542"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  const desp = agrupar(lista, "Despesa");

  chart("graficoDespesas", {
    type: "doughnut",
    data: {
      labels: Object.keys(desp),
      datasets: [{
        data: Object.values(desp),
        backgroundColor: cores,
        borderColor: "#00142f",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });

  const rec = agrupar(lista, "Receita");

  chart("graficoReceitas", {
    type: "pie",
    data: {
      labels: Object.keys(rec),
      datasets: [{
        data: Object.values(rec),
        backgroundColor: cores,
        borderColor: "#00142f",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });

  const meses = {};

  lista.forEach(l => {
    const m = l.data.slice(0,7);

    if(!meses[m]){
      meses[m] = { r: 0, d: 0 };
    }

    if(l.tipo === "Receita"){
      meses[m].r += Number(l.valor);
    } else {
      meses[m].d += Number(l.valor);
    }
  });

  const labels = Object.keys(meses).sort();

  chart("graficoEvolucao", {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Receitas",
          data: labels.map(m => meses[m].r),
          borderColor: "#0057C8",
          backgroundColor: "#0057C8",
          tension: .25
        },
        {
          label: "Despesas",
          data: labels.map(m => meses[m].d),
          borderColor: "#D4AF37",
          backgroundColor: "#D4AF37",
          tension: .25
        }
      ]
    },
    options: { responsive: true }
  });
}

function importarTexto(){
  const txt = document.getElementById("importTexto").value.trim();

  if(!txt){
    alert("Cole uma lista para importar.");
    return;
  }

  let importados = 0;

  txt.split(/\n/).forEach((linha, i) => {
    if(i === 0 && linha.toLowerCase().includes("data;")){
      return;
    }

    const p = linha.split(";");

    if(p.length < 5){
      return;
    }

    const valor = parseFloat(p[4].replace(".","").replace(",","."));
    const tipoLimpo = p[2].trim().toLowerCase().startsWith("r") ? "Receita" : "Despesa";

    if(!isNaN(valor)){
      lancamentos.push({
        id: Date.now() + Math.floor(Math.random() * 1000000),
        data: p[0].trim(),
        descricao: p[1].trim(),
        tipo: tipoLimpo,
        categoria: p[3].trim() || "Outros",
        valor
      });

      importados++;
    }
  });

  document.getElementById("importTexto").value = "";
  salvar();
  alert(importados + " lançamentos importados.");
}

function exportarCSV(){
  const linhas = [
    "data;descricao;tipo;categoria;valor",
    ...lancamentos.map(l => `${l.data};${l.descricao};${l.tipo};${l.categoria};${l.valor}`)
  ];

  const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "orcamento-domestico.csv";
  a.click();
}

function baixarBackup(){
  const blob = new Blob([JSON.stringify(lancamentos, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup-orcamento-domestico.json";
  a.click();
}

function limparDados(){
  if(confirm("Apagar todos os lançamentos deste navegador?")){
    lancamentos = [];
    salvar();
  }
}
