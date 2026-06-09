---
name: redis
description: >
  Caching strategies and configuration guidelines for performance optimization using Redis cache.
---

# Redis Cache Skill

## Objetivo

Garantir performance através de cache distribuído.

---

# Aplicação

Endpoints:

```txt
GET /vehicles
GET /vehicles/:id
```

---

# TTL

Utilizar:

```env
CACHE_TTL
```

Nunca hardcode.

---

# Chaves

Listagem:

```txt
vehicles:list
```

Individual:

```txt
vehicles:{id}
```

---

# Invalidação

Obrigatório invalidar em:

* create vehicle
* update vehicle
* delete vehicle

---

# Abstração

Criar:

```ts
ICacheProvider
```

Implementação:

```ts
RedisCacheProvider
```

---

# Regras

Use Cases não podem depender diretamente do Redis.

Devem depender apenas de:

```ts
ICacheProvider
```

---

# Tratamento de Falhas

Se Redis estiver indisponível:

* aplicação continua funcionando
* cache é ignorado
* erro é logado
