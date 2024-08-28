const express = require('express');
const app = express();
const port = 3001;

app.get('/servicos', (req, res) => {
  const { codmp, codser, desser, codfam, desfam, $top = 10, $skip = 0 } = req.query;
  
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
    const codmpArray = codmp.split(',');
    filteredServicos = filteredServicos.filter(servico => codmpArray.includes(servico.codmp));
  }

  if (codser) {
    const codserArray = codser.split(',');
    filteredServicos = filteredServicos.filter(servico => codserArray.includes(servico.codser));
  }

  if (desser) {
    const desserArray = desser.split(',');
    filteredServicos = filteredServicos.filter(servico => desserArray.includes(servico.desser));
  }

  if (codfam) {
    const codfamArray = codfam.split(',');
    filteredServicos = filteredServicos.filter(servico => codfamArray.includes(servico.codfam));
  }

  if (desfam) {
    const desfamArray = desfam.split(',');
    filteredServicos = filteredServicos.filter(servico => desfamArray.includes(servico.desfam));
  }

  // Implementando a paginação usando $top e $skip
  const top = parseInt($top);
  const skip = parseInt($skip);
  const paginatedServicos = filteredServicos.slice(skip, skip + top);

  res.json({
    totalItems: filteredServicos.length,
    totalPages: Math.ceil(filteredServicos.length / top),
    currentPage: Math.floor(skip / top) + 1,
    itemsPerPage: top,
    data: paginatedServicos
  });
});


app.get('/servicos_sem_paginacao', (req, res) => {
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

app.get('/data', (req, res) => {
  res.json(
      [
          {
              data1: '28/08/2024',
              data2: '08/28/2024',
              data3: '2024/08/28'
          }
      ]
  );
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
