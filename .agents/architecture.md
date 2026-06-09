# Architecture Document

## Visão Geral

A API de Gestão de Frota será desenvolvida utilizando NestJS seguindo os princípios de Clean Architecture, SOLID e Domain Driven Design (DDD Light).

Objetivos:

* Alta manutenibilidade
* Baixo acoplamento
* Alta testabilidade
* Escalabilidade
* Facilidade para inclusão de novas funcionalidades

---

# Stack Tecnológica

## Backend

* Node.js 18+
* NestJS 11+
* TypeScript 5.7+

## Banco de Dados

* SQL Server
* TypeORM

## Cache

* Redis

## Autenticação

* JWT
* Passport

## Testes

* Jest

## Documentação

* Swagger OpenAPI

## Containerização

* Docker
* Docker Compose

## Mensageria (Bônus)

* RabbitMQ

## Auditoria (Bônus)

* MongoDB

---

# Arquitetura de Camadas

Cada módulo deverá seguir a estrutura:

```txt
module/

├── application
│   ├── dto
│   ├── interfaces
│   └── use-cases
│
├── domain
│   ├── entities
│   ├── repositories
│   └── errors
│
├── infrastructure
│   ├── database
│   ├── repositories
│   ├── cache
│   └── messaging
│
└── presentation
    ├── controllers
    └── presenters
```

---

# Responsabilidades

## Domain

Contém:

* entidades
* regras de domínio
* contratos de repositórios
* exceções de domínio

Não depende de nenhuma tecnologia.

---

## Application

Contém:

* casos de uso
* DTOs
* contratos externos

Toda regra de negócio deve ficar aqui.

---

## Infrastructure

Contém:

* TypeORM
* Redis
* RabbitMQ
* MongoDB

Implementa contratos definidos no domínio.

---

## Presentation

Contém:

* controllers
* guards
* filtros
* interceptors

Não deve conter regra de negócio.

---

# Fluxo

Controller
→ Use Case
→ Repository Interface
→ Repository Implementation
→ Database

---

# Padrão de Resposta

Sucesso:

```json
{
  "data": {}
}
```

Erro:

```json
{
  "message": "Erro",
  "statusCode": 400
}
```

---

# Segurança

Obrigatório:

* JWT
* bcrypt
* Helmet
* Rate Limit
* ValidationPipe global

Todas as rotas protegidas.

Exceção:

POST /auth/login

---

# Cache

Endpoints:

* GET /vehicles
* GET /vehicles/:id

TTL configurável por variável de ambiente.

Invalidação:

* create vehicle
* update vehicle
* delete vehicle

---

# Logging

Formato estruturado:

```json
{
  "action": "vehicle.created",
  "entity": "vehicle",
  "entityId": "uuid",
  "userId": "uuid"
}
```

---

# Testes

Obrigatório:

* Unitários
* Integração
* E2E

Cobertura mínima:

80%
