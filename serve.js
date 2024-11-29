const express = require('express');
const { Builder } = require('xml2js');
const soap = require('soap');
const fs = require('fs');
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
  '/saveJson',
  '/returnUser',
  '/buscar-filias',
  '/fonteDadosMuitasColunas',
  '/colaborador',
  '/colaboradorXml',
  '/colaboradorXml/g5-senior-services/_Sync'
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


// Endpoint GET para retornar um usuário aleatório, para usar no processo do CAS | Desligamento
app.get('/returnUser', (req, res) => {
  const testData = {
    username: 'randomUser',
    email: 'randomUser@example.com',
    employerTradingName: 'Random Trading Co.',
    registerNumber: Math.floor(Math.random() * 1000000),
    employerNumemp: Math.floor(Math.random() * 1000)
  };

  res.json(testData);
});

// Função auxiliar para gerar uma data aleatória
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Endpoint GET para retornar uma lista de 5 objetos com valores aleatórios
app.get('/buscar-filias', (req, res) => {
  const { $top = 5, $skip = 0, codFil, cidFil, filMar, datFec1 } = req.query;
  const top = parseInt($top, 10);
  const skip = parseInt($skip, 10);
  const filias = [];

  for (let i = 0; i < 100; i++) { // Gerando 100 objetos para simular uma base de dados maior
    filias.push({
      codFil: Math.floor(Math.random() * 100000),
      cidFil: `City${Math.floor(Math.random() * 100)}`,
      filMar: `Market${Math.floor(Math.random() * 100)}`,
      datFec1: getRandomDate(new Date(2000, 0, 1), new Date()).toISOString().split('T')[0]
    });
  }

  // Aplicando filtros
  let filteredFilias = filias;
  if (codFil) {
    filteredFilias = filteredFilias.filter(filia => filia.codFil.toString().includes(codFil));
  }
  if (cidFil) {
    filteredFilias = filteredFilias.filter(filia => filia.cidFil.includes(cidFil));
  }
  if (filMar) {
    filteredFilias = filteredFilias.filter(filia => filia.filMar.includes(filMar));
  }
  if (datFec1) {
    filteredFilias = filteredFilias.filter(filia => filia.datFec1.includes(datFec1));
  }

  const paginatedFilias = filteredFilias.slice(skip, skip + top);
  res.json({
    totalItems: filteredFilias.length,
    totalPages: Math.ceil(filteredFilias.length / top),
    currentPage: Math.floor(skip / top) + 1,
    itemsPerPage: top,
    data: paginatedFilias
  });
});


app.get('/fonteDadosMuitasColunas', (req, res) => {
  const { $top = 10, $skip = 0 } = req.query;
  const top = parseInt($top, 10);
  const skip = parseInt($skip, 10);
  const items = [];

  for (let i = 1; i <= 100; i++) {
    items.push({
      id: i,
      name: `Item ${i}`,
      description: `This is the description for item ${i}`,
      price: (Math.random() * 100).toFixed(2),
      quantity: Math.floor(Math.random() * 100),
      available: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      category: `Category ${Math.floor(Math.random() * 10)}`,
      tags: [`Tag${Math.floor(Math.random() * 10)}`, `Tag${Math.floor(Math.random() * 10) + 10}`],
      rating: (Math.random() * 5).toFixed(1),
      releaseDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      manufacturer: `Manufacturer ${i}`,
      warranty: `${Math.floor(Math.random() * 5)} years`,
      color: `Color ${Math.floor(Math.random() * 10)}`,
      size: `${Math.floor(Math.random() * 50)} cm`,
      weight: `${(Math.random() * 10).toFixed(2)} kg`,
      stock: Math.floor(Math.random() * 1000),
      discount: `${Math.floor(Math.random() * 50)}%`,
      sku: `SKU${i}`,
      barcode: `BARCODE${i}`,
      supplier: `Supplier ${Math.floor(Math.random() * 10)}`,
      origin: `Country ${Math.floor(Math.random() * 10)}`,
      expiryDate: new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      batchNumber: `Batch ${Math.floor(Math.random() * 1000)}`,
      serialNumber: `Serial ${Math.floor(Math.random() * 1000)}`,
      model: `Model ${i}`,
      brand: `Brand ${Math.floor(Math.random() * 10)}`,
      material: `Material ${Math.floor(Math.random() * 10)}`,
      voltage: `${Math.floor(Math.random() * 240)}V`,
      power: `${Math.floor(Math.random() * 1000)}W`,
      energyRating: `${Math.floor(Math.random() * 5)} stars`,
      certification: `Certification ${Math.floor(Math.random() * 10)}`,
      teste1: `Teste ${Math.floor(Math.random() * 10)}`,
      teste2: `Teste ${Math.floor(Math.random() * 10)}`,
      teste3: `Teste ${Math.floor(Math.random() * 10)}`,
      teste4: `Teste ${Math.floor(Math.random() * 10)}`,
      teste5: `Teste ${Math.floor(Math.random() * 10)}`,
      teste6: `Teste ${Math.floor(Math.random() * 10)}`,
      teste7: `Teste ${Math.floor(Math.random() * 10)}`,
      teste8: `Teste ${Math.floor(Math.random() * 10)}`,
      teste9: `Teste ${Math.floor(Math.random() * 10)}`,
      teste10: `Teste ${Math.floor(Math.random() * 10)}`,
      teste11: `Teste ${Math.floor(Math.random() * 10)}`
    });
  }

  const paginatedItems = items.slice(skip, skip + top);

  res.json({
    totalItems: items.length,
    totalPages: Math.ceil(items.length / top),
    currentPage: Math.floor(skip / top) + 1,
    itemsPerPage: top,
    data: paginatedItems
  });
});


app.get('/colaborador', (req, res) => {
  const colaboradores = [];

  for (let i = 1; i <= 10; i++) {
    colaboradores.push({
      cadastro: `${i}`,
      cadastro_novo: `${i}`,
      cargo: `Cargo ${i}`,
      empresa: `${Math.floor(Math.random() * 10) + 1}`,
      modalidade: `Modalidade ${i}`,
      nomeArea: `Área ${i}`,
      nomeColaborador: `Colaborador ${i}`,
      nomeGestor: `Gestor ${i}`,
      nome_usuario: i % 2 === 0 ? 'jose' : 'maria',
      unidade: `Unidade ${i}`,
      data_nascimento: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      salarioColaborador: `${(Math.random() * 10000).toFixed(2).replace('.', ',')}`,
      pcd: `${Math.random() > 0.5}`,
      campoExtra: null
    });
  }

  res.json({
    contents: [
      {
        colaborador: colaboradores
      }
    ],
    responseCode: 200
  });
});

app.post('/colaborador', (req, res) => {
  const { nome_usuario } = req.body;
  console.log('Nome de usuário recebido:', nome_usuario); // Log para verificar o valor recebido
  const colaboradores = [];

  for (let i = 1; i <= 10; i++) {
    const nomeUsuario = i % 2 === 0 ? 'jose' : 'maria';
    colaboradores.push({
      cadastro: `${i}`,
      cadastro_novo: `${i}`,
      cargo: `Cargo ${i}`,
      empresa: `${Math.floor(Math.random() * 10) + 1}`,
      modalidade: `Modalidade ${i}`,
      nomeArea: `Área ${i}`,
      nomeColaborador: `Colaborador ${i}`,
      nomeGestor: `Gestor ${i}`,
      nome_usuario: nomeUsuario,
      unidade: `Unidade ${i}`,
      data_nascimento: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      salarioColaborador: `${(Math.random() * 10000).toFixed(2).replace('.', ',')}`,
      pcd: `${Math.random() > 0.5}`,
      campoExtra: null
    });
  }

  // Filtrando os colaboradores com base no nome_usuario
  let filteredColaboradores = colaboradores;
  if (nome_usuario) {
    filteredColaboradores = filteredColaboradores.filter(colaborador => colaborador.nome_usuario === nome_usuario);
  }

  console.log('Colaboradores filtrados:', filteredColaboradores); // Log para verificar os colaboradores filtrados
  res.json({
    contents: [
      {
        colaborador: filteredColaboradores
      }
    ],
    responseCode: 200
  });
});

app.post('/colaboradorXml', (req, res) => {
  const { nome_usuario } = req.body;
  console.log('Nome de usuário recebido:', nome_usuario); // Log para verificar o valor recebido
  const colaboradores = [];

  for (let i = 1; i <= 10; i++) {
    const nomeUsuario = i % 2 === 0 ? 'jose' : 'maria';
    colaboradores.push({
      cadastro: `${i}`,
      cadastro_novo: `${i}`,
      cargo: `Cargo ${i}`,
      empresa: `${Math.floor(Math.random() * 10) + 1}`,
      modalidade: `Modalidade ${i}`,
      nomeArea: `Área ${i}`,
      nomeColaborador: `Colaborador ${i}`,
      nomeGestor: `Gestor ${i}`,
      nome_usuario: nomeUsuario,
      unidade: `Unidade ${i}`,
      data_nascimento: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      salarioColaborador: `${(Math.random() * 10000).toFixed(2).replace('.', ',')}`,
      pcd: `${Math.random() > 0.5}`,
      campoExtra: null
    });
  }

  // Filtrando os colaboradores com base no nome_usuario
  let filteredColaboradores = colaboradores;
  if (nome_usuario) {
    filteredColaboradores = filteredColaboradores.filter(colaborador => colaborador.nome_usuario === nome_usuario);
  }

  // Convertendo o resultado para XML
  const builder = new Builder();
  const xml = builder.buildObject({
    contents: [
      {
        colaborador: filteredColaboradores
      }
    ],
    responseCode: 200
  });

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Definindo o serviço SOAP
const myService = {
  ColaboradorService: {
    ColaboradorPort: {
      getColaboradores: function (args, callback) {
        const colaboradores = [];
        for (let i = 1; i <= 10; i++) {
          const nomeUsuario = i % 2 === 0 ? 'José' : 'Maria';
          colaboradores.push({
            cadastro: `${i}`,
            cadastro_novo: `${i}`,
            cargo: `Cargo ${i}`,
            empresa: `${Math.floor(Math.random() * 10) + 1}`,
            modalidade: `Modalidade ${i}`,
            nomeArea: `Área ${i}`,
            nomeColaborador: `Colaborador ${i}`,
            nomeGestor: `Gestor ${i}`,
            nome_usuario: nomeUsuario,
            unidade: `Unidade ${i}`,
            data_nascimento: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
            salarioColaborador: `${(Math.random() * 10000).toFixed(2).replace('.', ',')}`,
            pcd: `${Math.random() > 0.5}`,
            campoExtra: null
          });
        }

        // Filtrando os colaboradores com base no nome_usuario
        let filteredColaboradores = colaboradores;
        if (args.nome_usuario) {
          filteredColaboradores = filteredColaboradores.filter(colaborador => colaborador.nome_usuario.toLowerCase() === args.nome_usuario.toLowerCase());
        }

        callback({
          colaborador: filteredColaboradores
        });
      }
    }
  }
};

// Carregando o WSDL
const xml = fs.readFileSync('colaborador.wsdl', 'utf8');

// Criando o servidor SOAP
soap.listen(app, '/colaboradorXml/g5-senior-services/_Sync', myService, xml);


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


