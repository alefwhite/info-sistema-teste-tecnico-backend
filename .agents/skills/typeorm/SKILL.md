---
name: typeorm
description: >
  Database persistence strategy and migration management guidelines using SQL Server and TypeORM.
---

# TypeORM Skill

## Objetivo

Garantir uso correto do TypeORM com SQL Server.

---

# Regras

Nunca utilizar:

```ts
synchronize: true
```

Sempre utilizar migrations.

---

# Estrutura

```txt
infra/database/typeorm/
├── migrations
├── entities
└── repositories
```

---

# Entidades

Devem representar apenas persistência.

Nunca conter:

* regras de negócio
* validações
* lógica de domínio

---

# Repositórios

Implementar interfaces do domínio.

Exemplo:

```ts
IVehicleRepository
```

Implementação:

```ts
TypeOrmVehicleRepository
```

---

# Queries

Utilizar:

* QueryBuilder
* índices
* paginação

Evitar:

* consultas N+1
* joins desnecessários

---

# Migrations

Toda alteração deve gerar migration.

Obrigatório:

* up()
* down()

---

# Soft Delete

Se utilizado:

```ts
deletedAt
```

Utilizar DeleteDateColumn.
