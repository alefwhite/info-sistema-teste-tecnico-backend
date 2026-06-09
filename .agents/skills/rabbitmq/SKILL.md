---
name: rabbitmq
description: >
  Integration guidelines for decoupling events and microservices communication using RabbitMQ.
---

# RabbitMQ Skill

## Objetivo

Desacoplar integrações através de eventos.

---

# Eventos

VehicleCreated

```txt
vehicle.created
```

VehicleUpdated

```txt
vehicle.updated
```

VehicleDeleted

```txt
vehicle.deleted
```

---

# Estrutura

```txt
infra/messaging/
├── publishers
├── consumers
├── events
└── rabbitmq.module.ts
```

---

# Regras

Use Cases publicam eventos.

Consumers nunca executam regras de negócio críticas.

---

# Payload

Exemplo:

```json
{
  "vehicleId": "uuid",
  "licensePlate": "ABC1234",
  "createdBy": "uuid",
  "timestamp": "2026-01-01T10:00:00Z"
}
```

---

# Resiliência

Implementar:

* retry
* dead letter queue
* logs estruturados

---

# Falhas

A indisponibilidade do RabbitMQ não pode impedir a operação principal do sistema.
