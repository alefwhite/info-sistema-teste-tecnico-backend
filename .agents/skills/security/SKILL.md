---
name: security
description: >
  Security best practices, validation, and authentication guidelines including JWT, Passport, and bcrypt.
---

# Security Skill

## Objetivo

Garantir segurança da API.

---

# Autenticação

Utilizar:

* JWT
* Passport
* bcrypt

---

# Rotas Públicas

Somente:

```txt
POST /auth/login
```

Todas as demais:

```txt
JwtAuthGuard
```

---

# Senhas

Obrigatório:

```ts
bcrypt.hash()
```

Nunca armazenar senha em texto puro.

---

# Variáveis Sensíveis

Utilizar:

```env
JWT_SECRET
JWT_EXPIRES_IN
```

Nunca commitar segredos.

---

# Validação

Utilizar:

* class-validator
* ValidationPipe

---

# Proteções

Obrigatório:

* Helmet
* CORS
* Rate Limiter

---

# Logs

Nunca registrar:

* senha
* token
* dados sensíveis

---

# Tokens

Nunca retornar:

* refresh token em logs
* jwt em exceptions
