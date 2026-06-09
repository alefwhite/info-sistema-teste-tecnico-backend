# Database Specification

## Banco Principal

SQL Server

---

# Tabela users

| Campo      | Tipo         |
| ---------- | ------------ |
| id         | uuid         |
| nickname   | varchar(100) |
| name       | varchar(255) |
| email      | varchar(255) |
| password   | varchar(255) |
| created_at | datetime     |
| updated_at | datetime     |

Restrições:

* email único

---

# Tabela brands

| Campo      | Tipo         |
| ---------- | ------------ |
| id         | uuid         |
| name       | varchar(150) |
| created_at | datetime     |
| updated_at | datetime     |
| created_by | uuid         |

Restrições:

* name único

---

# Tabela models

| Campo      | Tipo         |
| ---------- | ------------ |
| id         | uuid         |
| name       | varchar(150) |
| brand_id   | uuid         |
| created_at | datetime     |
| updated_at | datetime     |
| created_by | uuid         |

Restrições:

* name único por marca

Relacionamento:

Brand 1:N Models

---

# Tabela vehicles

| Campo         | Tipo        |
| ------------- | ----------- |
| id            | uuid        |
| license_plate | varchar(20) |
| chassis       | varchar(50) |
| renavam       | varchar(30) |
| year          | int         |
| model_id      | uuid        |
| created_at    | datetime    |
| updated_at    | datetime    |
| created_by    | uuid        |

Restrições:

* license_plate único
* chassis único
* renavam único

Relacionamento:

Model 1:N Vehicles

---

# Índices

Vehicles:

```sql
CREATE UNIQUE INDEX idx_vehicle_plate
ON vehicles(license_plate);

CREATE UNIQUE INDEX idx_vehicle_chassis
ON vehicles(chassis);

CREATE UNIQUE INDEX idx_vehicle_renavam
ON vehicles(renavam);
```

---

# Seed Inicial

Usuário:

```json
{
  "nickname": "aivacol",
  "name": "Administrador",
  "email": "admin@aivacol.com",
  "password": "via-env"
}
```

---

# Regras de Integridade

Model:

* não pode ser removido se possuir veículos

Brand:

* não pode ser removida se possuir modelos

Vehicle:

* deve possuir model válido

---

# Auditoria (Bônus)

Collection:

audit_logs

Campos:

```json
{
  "action": "",
  "entity": "",
  "entityId": "",
  "payload": {},
  "userId": "",
  "createdAt": ""
}
```

---

# Migrations

Obrigatório:

* uma migration por alteração
* rollback funcional

Proibido:

```ts
synchronize: true
```
