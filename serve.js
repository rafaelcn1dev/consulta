const express = require('express');
const app = express();
const port = 3001;

app.use(express.json()); // Middleware para processar JSON no corpo da requisição

const routes = [
  '/servicos',
  '/servicos_sem_paginacao',
  '/data',
  '/users',
  '/bpm-hem-diarias-busca-conselheiros',
  '/bpm-hem-diarias-busca-calculos',
  '/bpm-hem-diarias-tipos-conselheiros',
  '/saveJson'
];

app.get('/', (req, res) => {
  let html = '<h1>API Routes</h1><ul>';
  routes.forEach(route => {
    html += `<li><a href="${route}">${route}</a></li>`;
  });
  html += '</ul>';
  res.send(html);
});

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
              data2: '07/18/2023',
              data3: '2022/06/30',
              data4: '2022-06-30'
          }
      ]
  );
});

let users = [
    {
        "name": "João da Silva",
        "contacts": [
            {
                "email": "joao@gmail.com",
                "phone": "81999887766"
            }
        ],
        "id": "1"
    },
    {
        "name": "Fulado de Tal",
        "contacts": [
            {
                "email": "fulano@gmail.com",
                "phone": "81988776655"
            },
            {
                "email": "fulano.tal@empresarial.com.br",
                "phone": "81992939495"
            },
            {
                "email": "tal@outlook.com",
                "phone": "8130302020"
            }
        ],
        "id": "2"
    }
];

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    const newUser = req.body;

    // Verifica se o contato já existe com qualquer campo igual
    const contactExists = users.some(user => 
        user.contacts.some(contact => 
            contact.email === newUser.contacts[0].email || 
            contact.phone === newUser.contacts[0].phone || 
            user.name === newUser.name
        )
    );

    if (contactExists) {
        console.log(`Tentativa de inserção de contato já existente: 
        Nome: ${newUser.name}, 
        Email: ${newUser.contacts[0].email}, 
        Telefone: ${newUser.contacts[0].phone}`);
        return res.status(400).json({ error: 'Contato já existe' });
    }

    newUser.id = Math.random().toString(36).substr(2, 9); // Gera um ID aleatório
    users.push(newUser);

    // Log do novo contato inserido
    console.log(`Novo contato inserido: 
    Nome: ${newUser.name}, 
    Email: ${newUser.contacts[0].email}, 
    Telefone: ${newUser.contacts[0].phone}, 
    ID: ${newUser.id}`);

    res.status(201).json(newUser);
});

app.get('/bpm-hem-diarias-busca-conselheiros', (req, res) => {
  const { NumEmp, NomCad, NomEmp, TitCar, CodCar, NumCadFilter, TipCol, NomFun, $top = 10, $skip = 0 } = req.query;

  const conselheiros = [];
  for (let i = 1; i <= 50; i++) {
    conselheiros.push({
      NumEmp: i,
      NomCad: `Nome do Cadastro ${i}`,
      NomEmp: `Nome da Empresa ${i}`,
      TitCar: `Título do Cargo ${i}`,
      CodCar: `Código do Cargo ${i}`,
      NumCad: 67890 + i,
      TipCol: i % 5 + 1,
      NomFun: `Nome da Função ${i}`
    });
  }

  let filteredConselheiros = conselheiros;

  if (NumEmp) {
    const NumEmpArray = NumEmp.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => NumEmpArray.includes(conselheiro.NumEmp.toString()));
  }

  if (NomCad) {
    const NomCadArray = NomCad.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => NomCadArray.includes(conselheiro.NomCad));
  }

  if (NomEmp) {
    const NomEmpArray = NomEmp.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => NomEmpArray.includes(conselheiro.NomEmp));
  }

  if (TitCar) {
    const TitCarArray = TitCar.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => TitCarArray.includes(conselheiro.TitCar));
  }

  if (CodCar) {
    const CodCarArray = CodCar.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => CodCarArray.includes(conselheiro.CodCar));
  }

  if (NumCadFilter) {
    const NumCadArray = NumCadFilter.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => NumCadArray.includes(conselheiro.NumCad.toString()));
  }

  if (TipCol) {
    const TipColArray = TipCol.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => TipColArray.includes(conselheiro.TipCol.toString()));
  }

  if (NomFun) {
    const NomFunArray = NomFun.split(',');
    filteredConselheiros = filteredConselheiros.filter(conselheiro => NomFunArray.includes(conselheiro.NomFun));
  }

  const top = parseInt($top);
  const skip = parseInt($skip);
  const paginatedConselheiros = filteredConselheiros.slice(skip, skip + top);

  res.json({
    totalItems: filteredConselheiros.length,
    totalPages: Math.ceil(filteredConselheiros.length / top),
    currentPage: Math.floor(skip / top) + 1,
    itemsPerPage: top,
    data: paginatedConselheiros
  });
});

app.get('/bpm-hem-diarias-busca-calculos', (req, res) => {
  const { CodCal, IniCmp, $top = 10, $skip = 0 } = req.query;

  const calculos = [];
  for (let i = 1; i <= 50; i++) {
    calculos.push({
      CodCal: i,
      IniCmp: `Mês ${i}`
    });
  }

  let filteredCalculos = calculos;

  if (CodCal) {
    const CodCalArray = CodCal.split(',');
    filteredCalculos = filteredCalculos.filter(calculo => CodCalArray.includes(calculo.CodCal.toString()));
  }

  if (IniCmp) {
    const IniCmpArray = IniCmp.split(',');
    filteredCalculos = filteredCalculos.filter(calculo => IniCmpArray.includes(calculo.IniCmp));
  }

  const top = parseInt($top);
  const skip = parseInt($skip);
  const paginatedCalculos = filteredCalculos.slice(skip, skip + top);

  res.json({
    totalItems: filteredCalculos.length,
    totalPages: Math.ceil(filteredCalculos.length / top),
    currentPage: Math.floor(skip / top) + 1,
    itemsPerPage: top,
    data: paginatedCalculos
  });
});

app.get('/bpm-hem-diarias-tipos-conselheiros', (req, res) => {
  const { tipCon, valDia, codEve, tabEve, $top = 10, $skip = 0 } = req.query;

  const tiposConselheiros = [];
  for (let i = 1; i <= 50; i++) {
    tiposConselheiros.push({
      tipCon: `Conselheiro ${String.fromCharCode(64 + (i % 26))}`,
      valDia: (Math.random() * 100 + i).toFixed(2),
      codEve: i,
      tabEve: i % 5 + 1
    });
  }

  let filteredTiposConselheiros = tiposConselheiros;

  if (tipCon) {
    const tipConArray = tipCon.split(',');
    filteredTiposConselheiros = filteredTiposConselheiros.filter(tipo => tipConArray.includes(tipo.tipCon));
  }

  if (valDia) {
    const valDiaArray = valDia.split(',');
    filteredTiposConselheiros = filteredTiposConselheiros.filter(tipo => valDiaArray.includes(tipo.valDia.toString()));
  }

  if (codEve) {
    const codEveArray = codEve.split(',');
    filteredTiposConselheiros = filteredTiposConselheiros.filter(tipo => codEveArray.includes(tipo.codEve.toString()));
  }

  if (tabEve) {
    const tabEveArray = tabEve.split(',');
    filteredTiposConselheiros = filteredTiposConselheiros.filter(tipo => tabEveArray.includes(tipo.tabEve.toString()));
  }

  const top = parseInt($top);
  const skip = parseInt($skip);
  const paginatedTiposConselheiros = filteredTiposConselheiros.slice(skip, skip + top);

  res.json({
    totalItems: filteredTiposConselheiros.length,
    totalPages: Math.ceil(filteredTiposConselheiros.length / top),
    currentPage: Math.floor(skip / top) + 1,
    itemsPerPage: top,
    data: paginatedTiposConselheiros
  });
});

// Array para armazenar os dados JSON
let jsonData = [];

// Endpoint POST para salvar JSON no array
app.post('/saveJson', (req, res) => {
  const data = req.body;

  // Verifica se o corpo da requisição contém dados
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'JSON inválido ou vazio' });
  }

  // Adiciona o JSON ao array
  jsonData.push(data);
  res.status(201).json({ message: 'JSON salvo com sucesso', data });
});

// Endpoint GET para obter todos os JSONs salvos
app.get('/saveJson', (req, res) => {
  res.json(jsonData);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
