const express = require('express');
const app = express();
const port = 3001;

app.get('/servicos', (req, res) => {
  const { codmp, codser, desser, codfam, desfam } = req.query;
  
  // Logando os parâmetros de consulta e a URL no console
  console.log('Parâmetros de consulta:', req.query);
  console.log('URL utilizada:', req.originalUrl);

  const servicos = [];
  for (let i = 1; i <= 41; i++) {
    servicos.push({
      codmp: (i).toString(),
      codser: (i < 10 ? '00' : '0') + i,
      desser: (i % 2 === 0 ? 'Privado' : 'Público'),
      codfam: (Math.floor(i * 10) + 1).toString(),
      desfam: 'Tabela ' + (i % 2 === 0 ? 'Serviço Privado' : 'Serviço Público')
    });
  }

  // Filtrando os serviços com base nos parâmetros de consulta
  let filteredServicos = servicos;

  if (codmp) {
    filteredServicos = filteredServicos.filter(servico => servico.codmp === codmp);
  }

  if (codser) {
    filteredServicos = filteredServicos.filter(servico => servico.codser === codser);
  }

  if (desser) {
    filteredServicos = filteredServicos.filter(servico => servico.desser.includes(desser));
  }

  if (codfam) {
    filteredServicos = filteredServicos.filter(servico => servico.codfam === codfam);
  }

  if (desfam) {
    filteredServicos = filteredServicos.filter(servico => servico.desfam.includes(desfam));
  }

  res.json(filteredServicos);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});