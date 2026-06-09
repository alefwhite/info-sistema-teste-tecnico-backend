# PRD — Plataforma de Gestão de Frota Aivacol

## Objetivo

Desenvolver uma API REST para gerenciamento de frota de veículos, permitindo o controle de marcas, modelos e veículos com autenticação JWT, cache Redis, testes automatizados e arquitetura escalável.

---

# Escopo

## Funcionalidades Obrigatórias

### Autenticação

* Login via JWT
* Usuário seed padrão:

    * login: aivacol
    * senha: definida por variável de ambiente

### Gestão de Modelos

* Criar modelo
* Atualizar modelo
* Buscar modelo
* Listar modelos
* Remover modelo

### Gestão de Veículos

* Criar veículo
* Atualizar veículo
* Buscar veículo
* Listar veículos
* Remover veículo

### Cache Redis

Aplicado em:

* Listagem de veículos
* Consulta individual de veículo

Regras:

* TTL configurável por variável de ambiente
* Invalidação automática após:

    * criação
    * atualização
    * remoção

---

## Funcionalidades Bônus

### Gestão de Marcas

* Criar marca
* Atualizar marca
* Buscar marca
* Listar marcas
* Remover marca

Relacionamento:

Brand 1:N Model

---

### Auditoria

Registrar:

* usuário
* endpoint
* método HTTP
* payload
* data/hora

Persistência:

* MongoDB ou DynamoDB

---

### Mensageria

Publicar eventos:

VehicleCreated
VehicleUpdated
VehicleDeleted

Broker:

* RabbitMQ (preferencial)

---

# Requisitos Não Funcionais

## Segurança

* JWT obrigatório
* Senha criptografada com bcrypt
* Helmet
* Rate Limiting
* Validation Pipe global
* Serialization
* Sanitização de entrada

---

## Performance

* Redis Cache
* Paginação
* Índices no banco

---

## Observabilidade

* Logs estruturados
* Correlation ID
* Request ID

---

## Qualidade

Cobertura mínima:

* 80%

Testes:

* Unitários
* Integração
* E2E

---

# Regras de Negócio

## Modelo

RN001

Nome do modelo deve ser único.

RN002

Não permitir exclusão de modelo associado a veículos.

---

## Marca

RN003

Nome da marca deve ser único.

RN004

Não permitir exclusão de marca associada a modelos.

---

## Veículo

RN005

Placa deve ser única.

RN006

Chassi deve ser único.

RN007

Renavam deve ser único.

RN008

Ano deve ser maior que 1900.

RN009

Ano não pode ser superior ao ano atual + 1.

RN010

Veículo deve obrigatoriamente possuir um modelo válido.

---

## Usuários

RN011

Email deve ser único.

RN012

Apenas usuários autenticados podem acessar recursos.

---

# Critérios de Aceitação

* Todas as rotas protegidas por JWT
* Migrations executando corretamente
* Cache Redis funcionando
* Testes passando
* Seed inicial criada
* Docker Compose funcional
* README completo

---

# Entidades

## Brand

* id
* name
* created_at
* updated_at
* created_by

## Model

* id
* name
* brand_id
* created_at
* updated_at
* created_by

## Vehicle

* id
* license_plate
* chassis
* renavam
* year
* model_id
* created_at
* updated_at
* created_by

## User

* id
* nickname
* name
* email
* password
* created_at
* updated_at
