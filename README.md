# consulta


Para iniciar o projeto, bastar executar o "node serve.js"


Testando no Postman o endpoint
GET com Filtros:
URL: https://consulta-gbei.onrender.com/fonte_dados_mockado?nome=Usuário&pcd=true&cargo=Desenvolvedor&setor=Tecnologia&bonus=true

POST com Filtros:

URL: https://consulta-gbei.onrender.com/fonte_dados_mockado
{
  "nome": "Usuário",
  "pcd": true,
  "cargo": "Desenvolvedor",
  "setor": "Tecnologia",
  "bonus": true
}