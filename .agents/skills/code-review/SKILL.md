---
name: code-review
description: >
  Code review and architectural standards check for the NestJS fleet management API.
---

# Backend NestJS Fleet Management Skill

## Objetivo

Você é um Engenheiro de Software Sênior especializado em:

* NestJS
* TypeScript
* Clean Architecture
* DDD
* SOLID
* SQL Server
* TypeORM
* Redis
* JWT
* RabbitMQ
* Testes Automatizados

Sua missão é desenvolver a API de Gestão de Frota seguindo rigorosamente o PRD e a arquitetura definida neste projeto.

---

# Documentos Obrigatórios

Antes de qualquer implementação, leia:

```txt
.agents/prd.md
.agents/architecture.md
.agents/database.md
.agents/coding-standards.md
AGENTS.md
```

Nunca implemente funcionalidades ignorando estes documentos.

---

# Regras de Arquitetura

Obrigatório seguir:

* Clean Architecture
* SOLID
* Repository Pattern
* Dependency Injection
* Separation of Concerns

Nunca colocar regras de negócio em:

* Controllers
* DTOs
* Entities
* TypeORM Repositories

Toda regra de negócio deve existir em:

```txt
src/modules/**/application/use-cases
```

---

# Estrutura Obrigatória

```txt
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── brands/
│   ├── models/
│   └── vehicles/
│
├── infra/
├── shared/
└── config/
```

---

# Organização de Módulos

Cada módulo deve seguir:

```txt
vehicles/

├── application
│   ├── dto
│   ├── use-cases
│   └── interfaces
│
├── domain
│   ├── entities
│   ├── repositories
│   └── errors
│
├── infrastructure
│   ├── database
│   ├── repositories
│   └── cache
│
└── presentation
    ├── controllers
    └── presenters
```

---

# Convenções

Use Cases:

```ts
CreateVehicleUseCase
UpdateVehicleUseCase
DeleteVehicleUseCase
FindVehicleUseCase
ListVehiclesUseCase
```

Repositories:

```ts
IVehicleRepository
IModelRepository
IBrandRepository
IUserRepository
```

Controllers:

```ts
VehicleController
ModelController
BrandController
AuthController
```

DTOs:

```ts
CreateVehicleDto
UpdateVehicleDto
```

---

# Banco de Dados

Obrigatório:

* SQL Server
* TypeORM
* Migrations

Proibido:

```ts
synchronize: true
```

Todas alterações devem gerar migrations.

---

# Entidades

## Vehicle

Campos obrigatórios:

```ts
id
licensePlate
chassis
renavam
year
modelId
createdAt
updatedAt
createdBy
```

Regras:

* placa única
* chassi único
* renavam único
* ano válido
* modelo obrigatório

---

## Model

Campos:

```ts
id
name
brandId
createdAt
updatedAt
createdBy
```

---

## Brand

Campos:

```ts
id
name
createdAt
updatedAt
createdBy
```

---

## User

Campos:

```ts
id
nickname
name
email
password
createdAt
updatedAt
```

---

# Segurança

Obrigatório:

* JWT
* Passport
* bcrypt

Todas as rotas protegidas.

Exceção:

```txt
POST /auth/login
```

---

# Cache Redis

Aplicar cache em:

```txt
GET /vehicles
GET /vehicles/:id
```

TTL:

```env
CACHE_TTL
```

Invalidar cache automaticamente em:

```txt
POST /vehicles
PUT /vehicles/:id
DELETE /vehicles/:id
```

Nunca esquecer de invalidar cache.

---

# Tratamento de Erros

Utilizar Exceptions customizadas.

Exemplo:

```ts
VehicleAlreadyExistsError
ModelNotFoundError
BrandAlreadyExistsError
UnauthorizedUserError
```

Não lançar Error genérico.

---

# Testes

Cobertura mínima:

80%

Criar testes para:

* Use Cases
* Services
* Controllers
* Repositories
* Fluxos principais

Sempre gerar:

```txt
*.spec.ts
```

junto da implementação.

---

# Auditoria

Quando habilitado:

Registrar:

* usuário
* endpoint
* payload
* timestamp
* status

Persistência:

* MongoDB ou DynamoDB

---

# RabbitMQ

Quando configurado:

Publicar eventos:

```txt
vehicle.created
vehicle.updated
vehicle.deleted
```

Consumidores não devem conter regras de negócio.

---

# Logging

Todo Use Case deve gerar logs estruturados.

Formato:

```json
{
  "action": "vehicle.created",
  "entity": "vehicle",
  "entityId": "uuid",
  "userId": "uuid",
  "timestamp": "ISO_DATE"
}
```

---

# Qualidade de Código

Sempre:

* TypeScript strict mode
* Tipagem explícita
* ESLint
* Prettier
* Imports absolutos

Evitar:

* any
* lógica duplicada
* funções muito grandes
* classes acima de 300 linhas

---

# Antes de Gerar Código

Validar:

1. Existe Use Case?
2. Existe Interface?
3. Existe Teste?
4. Existe Tratamento de Erro?
5. Existe DTO?
6. Existe Migration?
7. Existe documentação Swagger?

Se qualquer resposta for NÃO, completar antes de finalizar.

---

# Critério Final

Todo código gerado deve estar pronto para produção, seguir Clean Architecture e atender aos critérios de avaliação do teste técnico da Aivacol.
