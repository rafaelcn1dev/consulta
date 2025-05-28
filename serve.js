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
  '/colaboradorXml/g5-senior-services/_Sync?wsdl',
  '/params',
  '/servicos-offset',
  '/data',
  '/lista',
  '/bpm-hcm-get-colaborador-ext-service',
  '/usuarios',
  '/cep',
  '/servicoexterno',
  '/fonte_dados_mockado',
  '/hora-atual'
];

// Lista para armazenar os dados recebidos via POST
let dataList = [];

// Função para validar e formatar datas
const parseDate = (dateString) => {
  const formats = [
    /^\d{2}\/\d{2}\/\d{4}$/, // dd/mm/yyyy
    /^\d{2}-\d{2}-\d{4}$/, // dd-mm-yyyy
    /^\d{4}\/\d{2}\/\d{2}$/, // yyyy/mm/dd
    /^\d{4}-\d{2}-\d{2}$/ // yyyy-mm-dd
  ];

  for (const format of formats) {
    if (format.test(dateString)) {
      return new Date(dateString.replace(/-/g, '/'));
    }
  }

  throw new Error('Invalid date format');
};

// Endpoint POST para receber e armazenar os dados
app.post('/data', (req, res) => {
  const { data_um, data_dois, data_tres, texto_um } = req.body;

  try {
    /*
    // Caso queira que seja convertido para data
    const parsedDataUm = parseDate(data_um);
    const parsedDataDois = parseDate(data_dois);
    const parsedDataTres = parseDate(data_tres);

    const newData = {
      data_um: parsedDataUm,
      data_dois: parsedDataDois,
      data_tres: parsedDataTres,
      texto_um
    };*/
    const newData = {
      data_um: data_um,
      data_dois: data_dois,
      data_tres: data_tres,
      texto_um
    };

    dataList.push(newData);
    
    console.log('Data added:', newData);

    res.status(201).json({ message: 'Data added successfully', data: newData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint GET para retornar os dados armazenados
app.get('/data', (req, res) => {
  res.json(dataList);
});

app.get('/', (req, res) => {
  let html = '<h1>API Routes</h1><ul>';
  routes.forEach(route => {
    html += `<li><a href="${route}">${route}</a></li>`;
  });
  html += '</ul>';
  res.send(html);
});

app.get('/params', (req, res) => {
  res.json({
    message: 'Parâmetros de consulta',
    params: req.query
  }); // Retorna os parâmetros de consulta como JSON
});

app.post('/params', (req, res) => {
  console.log('Corpo da requisição:', req.body); // Log para verificar o corpo da requisição
  res.json(req.body); // Retorna o corpo da requisição como JSON
});

app.post('/without-input', (req, res) => {
  res.json({
    message: 'Sem Parâmetros de entrada',
    lista: [{
      campo: 'valor',
    }]
  });
});

app.get('/servicos', (req, res) => {
  const { codmp, codser, desser, codfam, desfam, $top = 10, $skip = 0, offset = 0, size = 10 } = req.query;

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

  // Implementando a paginação usando offset, size, $top e $skip
  const offsetInt = offset ? parseInt(offset) : ($skip ? parseInt($skip) : 0);
  const sizeInt = size ? parseInt(size) : ($top ? parseInt($top) : 10);
  const topInt = $top ? parseInt($top) : sizeInt;

  const paginatedServicos = filteredServicos.slice(offsetInt, offsetInt + sizeInt);

  res.json({
    totalItems: filteredServicos.length,
    totalPages: Math.ceil(filteredServicos.length / sizeInt),
    currentPage: Math.floor(offsetInt / sizeInt) + 1,
    itemsPerPage: sizeInt,
    offset: offsetInt,
    size: sizeInt,
    top: topInt,
    data: paginatedServicos
  });
});

// Simulando um banco de dados de linhas (dados fictícios)
const data = Array.from({ length: 100 }, (_, index) => ({
  linha: `Linha ${index + 1}`,
  campo: `Campo ${index + 1}`,  // Adicionando o atributo 'campo'
}));

app.get('/data', (req, res) => {
  const offset = parseInt(req.query.offset) || 0;  // Valor default 0
  const size = parseInt(req.query.size) || 20;    // Valor default 30
  console.log('offset', req.query.offset);
  console.log('size', req.query.size);

  // Verificando se o tamanho solicitado não é maior que 30
  const validSize = Math.min(size, 30);

  // Validando o offset
  if (offset < 0) {
    return res.status(400).json({ error: 'Offset não pode ser negativo' });
  }

  // Calculando o slice da lista com base no offset e no size
  const startIndex = offset;
  const endIndex = startIndex + validSize;

  // Retornando as linhas solicitadas
  const result = data.slice(startIndex, endIndex);

  res.json({
    offset,
    size: validSize,
    data: result,
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
  const { $top = 1000, $skip = 0 } = req.query;
  const top = parseInt($top, 10);
  const skip = parseInt($skip, 10);
  const items = [];

  for (let i = 1; i <= 50000; i++) {
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
      cadastro: i, // Agora retorna um valor inteiro
      cadastro_novo: i, // Agora retorna um valor inteiro
      cargo: `Cargo ${i}`,
      empresa: `${Math.floor(Math.random() * 10) + 1}`,
      modalidade: `Modalidade ${i}`,
      nomeArea: `Área ${i}`,
      nomeColaborador: `Colaborador ${i}`,
      nomeGestor: `Gestor ${i}`,
      nome_usuario: nomeUsuario,
      unidade: `Unidade ${i}`,
      data_nascimento: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      salarioColaborador: Math.random() * 10000, // Agora retorna um valor decimal
      pcd: Math.random() > 0.5, // Agora retorna um valor booleano
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
  const { nome_usuario, pcd } = req.body;
  console.log('Dados recebidos:', { nome_usuario, pcd }); // Log para verificar os valores recebidos
 const colaboradores = [];

  for (let i = 1; i <= 10; i++) {
    const nomeUsuario = i % 2 === 0 ? 'jose' : 'maria';
    colaboradores.push({
      cadastro: i, // Agora retorna um valor inteiro
      cadastro_novo: i, // Agora retorna um valor inteiro
      cargo: `Cargo ${i}`,
      empresa: `${Math.floor(Math.random() * 10) + 1}`,
      modalidade: `Modalidade ${i}`,
      nomeArea: `Área ${i}`,
      nomeColaborador: `Colaborador ${i}`,
      nomeGestor: `Gestor ${i}`,
      nome_usuario: nomeUsuario,
      unidade: `Unidade ${i}`,
      data_nascimento: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('pt-BR'),
      salarioColaborador: Math.random() * 10000, // Agora retorna um valor decimal
      pcd: Math.random() > 0.5, // Agora retorna um valor booleano
      campoExtra: null
    });
  }

  // Filtrando os colaboradores com base no nome_usuario
  let filteredColaboradores = colaboradores;
  if (nome_usuario) {
    filteredColaboradores = filteredColaboradores.filter(colaborador => colaborador.nome_usuario === nome_usuario);
  }
  if (pcd !== undefined) {
    filteredColaboradores = filteredColaboradores.filter(colaborador => colaborador.pcd === pcd);
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

// Lista para armazenar os dados recebidos via POST
//let dataList = [];

// Endpoint POST para receber e armazenar os dados
app.post('/lista', (req, res) => {
  const data = req.body;
  console.log(data);
  // Adicionando os novos dados à lista principal
  dataList.push(data);

  res.status(201).json({ message: 'Dados adicionados com sucesso!', data });
});

// Endpoint GET para retornar os dados armazenados
app.get('/lista', (req, res) => {
  res.json(dataList);
});

// Endpoint GET para bpm-hcm-get-colaborador-ext-service
app.get('/bpm-hcm-get-colaborador-ext-service', (req, res) => {
  const { numcpf } = req.query;

  // Lista de retorno fake
  const fakeData = [
    {
      NomFil: "Filial Central",
      DatAdm: "2020-01-15",
      CodCcu: "CCU001",
      NomCcu: "Centro de Custo 1",
      ges_nomfun: "Gestor de Projetos",
      CodCar: "CAR001",
      TitCar: "Gerente de TI",
      NumCad: 12345,
      usu_useroffice: "user.office",
      DatNas: "1985-06-20",
      ges_numcpf: "05196131477",
      Usu_CentralDes: "Central de Desenvolvimento",
      NomFun: "Analista de Sistemas",
      NomEmp: "Empresa Fictícia",
      NumEmp: "001",
      CodFil: "FIL001",
      USU_EmpSau: "Plano Saúde Fictício",
      EmaCom: "email@empresa.com",
      CodEmp: "EMP001",
      NumCpf: "05196131477",
      is_gestor: true
    },
    {
      NomFil: "Filial Norte",
      DatAdm: "2019-03-10",
      CodCcu: "CCU002",
      NomCcu: "Centro de Custo 2",
      ges_nomfun: "Analista de Projetos",
      CodCar: "CAR002",
      TitCar: "Analista de TI",
      NumCad: 67890,
      usu_useroffice: "user.north",
      DatNas: "1990-08-15",
      ges_numcpf: "456",
      Usu_CentralDes: "Central de Suporte",
      NomFun: "Desenvolvedor",
      NomEmp: "Empresa Fictícia 2",
      NumEmp: "002",
      CodFil: "FIL002",
      USU_EmpSau: "Plano Saúde Premium",
      EmaCom: "email2@empresa.com",
      CodEmp: "EMP002",
      NumCpf: "456",
      is_gestor: false
    }
  ];

  // Se o parâmetro numcpf for fornecido, filtra os dados
  if (numcpf) {
    const result = fakeData.filter(item => item.NumCpf === numcpf);

    // Retorna os dados filtrados ou um erro 404 se não encontrar
    if (result.length > 0) {
      return res.json(result);
    } else {
      return res.status(404).json({ error: "Nenhum colaborador encontrado para o CPF informado." });
    }
  }

  // Se o parâmetro numcpf não for fornecido, retorna todos os dados
  res.json(fakeData);
});

// Lista para armazenar os usuários
let usuarios = [
  {
    cpf: "12345678901",
    idade: 30,
    nome: "João",
    sobrenome: "Silva",
    altura: 1.75,
    aniversario: "15-01-15",
    aniversario_iso: "2015/01/15", // Formato ISO com "/"
    aniversario_com_traco: "2015-01-15", // Formato ISO com "-"
    aniversario_normal: "15/01/2015", // Formato dd/MM/yyyy
    pcd: true,
  },
  {
    cpf: "98765432100",
    idade: 20,
    nome: "Maria",
    sobrenome: "Oliveira",
    altura: 1.68,
    aniversario: "1985-06-20",
    aniversario_iso: "1985/06/20", // Formato ISO com "/"
    aniversario_com_traco: "1985-06-20", // Formato ISO com "-"
    aniversario_normal: "20/06/1985", // Formato dd/MM/yyyy
    pcd: false,
  },
  {
    cpf: "4567891234567891011",
    idade: 15,
    nome: "Carlos",
    sobrenome: "Santos",
    altura: 1.80,
    aniversario: "1992-03-10",
    aniversario_iso: "1992/03/10", // Formato ISO com "/"
    aniversario_com_traco: "1992-03-10", // Formato ISO com "-"
    aniversario_normal: "10/03/1992", // Formato dd/MM/yyyy
    pcd: true, // Formato dd/MM/yyyy
  },
  {
    cpf: "7891234567891011",
    idade: 40,
    nome: "Ana",
    sobrenome: "Costa",
    altura: 1.60,
    aniversario: "1995-08-25",
    aniversario_iso: "1995/08/25", // Formato ISO com "/"
    aniversario_com_traco: "1995-08-25", // Formato ISO com "-"
    aniversario_normal: "25/08/1995", // Formato dd/MM/yyyy
    pcd: false, // Formato dd/MM/yyyy
  },
  {
    cpf: "32165498700",
    idade: 70,
    nome: "Paulo",
    sobrenome: "Souza",
    altura: 1.85,
    aniversario: "1988-12-05",
    aniversario_iso: "1988/12/05", // Formato ISO com "/"
    aniversario_com_traco: "1988-12-05", // Formato ISO com "-"
    aniversario_normal: "05/12/1988", // Formato dd/MM/yyyy
    pcd: true, // Formato dd/MM/yyyy
  }
];

// Endpoint GET para retornar todos os usuários ou filtrar pelo CPF
app.get('/usuarios', (req, res) => {
  const { cpf, pcd } = req.query;

  // Se o CPF for fornecido, filtra os usuários pelo CPF
  if (cpf) {
    const usuario = usuarios.find(user => user.cpf === cpf);
    if (usuario) {
      return res.json(usuario);
    } else {
      return res.status(404).json({ error: "Usuário não encontrado para o CPF informado." });
    }
  }

  // Se o PCD for fornecido, filtra os usuários pelo campo PCD
  if (pcd !== undefined) {
    const pcdBoolean = pcd === 'true'; // Converte o valor para booleano
    const usuariosFiltrados = usuarios.filter(user => user.pcd === pcdBoolean);
    return res.json(usuariosFiltrados);
  }

  // Se nenhum parâmetro for fornecido, retorna todos os usuários
  //res.json(usuarios);
  // Aguarda 3 minutos (180000 ms) antes de responder
  setTimeout(() => {
    res.json(usuarios);
  }, 45000);
});

// Endpoint POST para adicionar um novo usuário ou buscar pelo CPF
app.post('/usuarios', (req, res) => {
  const { cpf, nome, sobrenome, altura, aniversario } = req.body;

  // Validação dos campos obrigatórios
  if (!cpf || !nome || !sobrenome || !altura || !aniversario) {
    return res.status(400).json({ error: "Todos os campos (cpf, nome, sobrenome, altura, aniversario) são obrigatórios." });
  }

  // Verifica se o CPF já existe na lista
  const usuarioExistente = usuarios.find(user => user.cpf === cpf);
  if (usuarioExistente) {
    return res.status(400).json({ error: "Usuário com este CPF já existe." });
  }

  // Adiciona o novo usuário à lista
  const novoUsuario = { cpf, nome, sobrenome, altura, aniversario };
  usuarios.push(novoUsuario);

  res.status(201).json({ message: "Usuário adicionado com sucesso!", usuario: novoUsuario });
});

const axios = require('axios'); // Certifique-se de instalar o axios: npm install axios

// Endpoint GET para consultar o CEP usando query string
app.get('/cep', async (req, res) => {
  const { cep } = req.query; // Obtém o parâmetro 'cep' da query string

  if (!cep) {
    return res.status(400).json({ error: "O parâmetro 'cep' é obrigatório." });
  }

  try {
    // Fazendo a requisição para a API do ViaCEP
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    // Verificando se o CEP é válido
    if (response.data.erro) {
      return res.status(404).json({ error: "CEP não encontrado." });
    }

    // Formatando o retorno com os campos adicionais
    const formattedData = {
      cep: response.data.cep,
      logradouro: response.data.logradouro,
      complemento: response.data.complemento || "",
      unidade: response.data.unidade || "",
      bairro: response.data.bairro,
      localidade: response.data.localidade,
      uf: response.data.uf,
      estado: "Pernambuco", // Adicionando o estado manualmente
      regiao: "Nordeste", // Adicionando a região manualmente
      ibge: response.data.ibge,
      gia: response.data.gia || "",
      ddd: response.data.ddd,
      siafi: response.data.siafi
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Erro ao consultar o CEP:", error.message);
    res.status(500).json({ error: "Erro ao consultar o CEP. Tente novamente mais tarde." });
  }
});

// Endpoint GET para retornar dados do serviço externo
app.get('/servicoexterno', (req, res) => {
  const data = {
    nome: "Serviço Externo",
    quantidade: 5,
    valor: 12.34,
    lancamento: new Date().toISOString().split('T')[0], // Data atual no formato yyyy-mm-dd
    habilitado: false
  };

  res.json(data);
});

//novo endpoint
// Lista de usuários mockados
const usuariosMockados = Array.from({ length: 10 }, (_, i) => ({
  nome: `Usuário ${i + 1}`,
  idade: 20 + i,
  altura: 1.5 + i * 0.05,
  pcd: i < 5, // Os primeiros 5 usuários são PCD
  data_normal: "15/04/1993",
  data_iso: "1993/04/15",
  data_iso_com_traco: "1993-04-15",
  escolaridade: [
    {
      instituicao: "Escola Primária ABC",
      ano_termino: 2005
    },
    {
      instituicao: "Colégio XYZ",
      ano_termino: 2010
    },
    {
      instituicao: "Universidade Fictícia",
      ano_termino: 2015
    }
  ],
  dependentes: [
    {
      nome: `Dependente ${i + 1}`,
      idade: 5 + i,
      pcd: i % 2 === 0,
      data_nascimento: {
        data_normal: "10/05/2018",
        data_iso: "2018/05/10",
        data_iso_com_traco: "2018-05-10"
      },
      altura: 1.1 + i * 0.05
    }
  ],
  profissional: {
    nome_empresa: "Empresa Fictícia Ltda",
    salario: 5000 + i * 1000,
    setor: i < 5 ? "Tecnologia da Informação" : "Recursos Humanos", // 5 no mesmo setor
    cargo: i % 2 === 0 ? "Desenvolvedor Sênior" : "Analista de RH",
    bonus: i % 2 === 0 // 5 com bônus
  }
}));

// Endpoint GET para buscar usuários com filtros
app.get('/fonte_dados_mockado', (req, res) => {
  const { nome, pcd, cargo, setor, bonus } = req.query;

  let filteredUsuarios = usuariosMockados;

  // Aplicando filtros
  if (nome) {
    filteredUsuarios = filteredUsuarios.filter(user => user.nome.toLowerCase().includes(nome.toLowerCase()));
  }
  if (pcd !== undefined) {
    filteredUsuarios = filteredUsuarios.filter(user => user.pcd === (pcd === 'true'));
  }
  if (cargo) {
    filteredUsuarios = filteredUsuarios.filter(user => user.profissional.cargo.toLowerCase().includes(cargo.toLowerCase()));
  }
  if (setor) {
    filteredUsuarios = filteredUsuarios.filter(user => user.profissional.setor.toLowerCase().includes(setor.toLowerCase()));
  }
  if (bonus !== undefined) {
    filteredUsuarios = filteredUsuarios.filter(user => user.profissional.bonus === (bonus === 'true'));
  }

  //res.json(filteredUsuarios);
  // Aguarda 3 minutos (180000 ms) antes de responder
  setTimeout(() => {
    res.json(filteredUsuarios);
  }, 45000);
});

// Endpoint POST para buscar usuários com filtros
app.post('/fonte_dados_mockado', (req, res) => {
  const { nome, pcd, cargo, setor, bonus } = req.body;

  let filteredUsuarios = usuariosMockados;

  // Aplicando filtros
  if (nome) {
    filteredUsuarios = filteredUsuarios.filter(user => user.nome.toLowerCase().includes(nome.toLowerCase()));
  }
  if (pcd !== undefined) {
    filteredUsuarios = filteredUsuarios.filter(user => user.pcd === pcd);
  }
  if (cargo) {
    filteredUsuarios = filteredUsuarios.filter(user => user.profissional.cargo.toLowerCase().includes(cargo.toLowerCase()));
  }
  if (setor) {
    filteredUsuarios = filteredUsuarios.filter(user => user.profissional.setor.toLowerCase().includes(setor.toLowerCase()));
  }
  if (bonus !== undefined) {
    filteredUsuarios = filteredUsuarios.filter(user => user.profissional.bonus === bonus);
  }

  res.json(filteredUsuarios);
});

app.get('/hora-atual', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const intervalId = setInterval(() => {
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    res.write(`data: ${horaAtual}\n\n`);
  }, 10000); // 10 segundos

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


