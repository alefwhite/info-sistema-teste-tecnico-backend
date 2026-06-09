---
name: testing
description: >
  Testing strategy and code coverage goals using Jest for unit, integration, and E2E testing.
---

# Testing Skill

## Objetivo

Garantir cobertura mínima de 80% utilizando Jest.

---

# Regras

Toda funcionalidade deve possuir testes.

Obrigatório testar:

* Use Cases
* Controllers
* Services
* Repositories
* Guards

---

# Estrutura

```txt
test/
├── unit
├── integration
└── e2e
```

---

# Unit Tests

Testar:

* regras de negócio
* cenários de sucesso
* cenários de erro

Exemplo:

CreateVehicleUseCase

Deve validar:

* placa duplicada
* chassi duplicado
* renavam duplicado
* modelo inexistente
* criação com sucesso

---

# Integration Tests

Validar:

* integração entre camadas
* persistência de dados
* cache redis

---

# E2E Tests

Validar:

* login
* criação de veículo
* atualização
* remoção
* listagem

---

# Regras

Nunca mockar regras de negócio.

Mockar apenas:

* banco
* redis
* rabbitmq
* serviços externos

---

# Cobertura

Mínimo:

80%

Ideal:

90%+

Falhar build quando cobertura for inferior.
