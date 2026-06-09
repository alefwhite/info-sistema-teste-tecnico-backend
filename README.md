# API de Gestão de Frota - Aivacol

Este projeto é uma API REST desenvolvida em **NestJS** com **TypeScript** para gerenciamento de frota de veículos (marcas, modelos e veículos). O sistema segue os padrões de **Clean Architecture**, **SOLID** e **DDD (Domain Driven Design)**.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: NestJS, TypeScript, Express, Helmet, Throttler
- **Persistência**: SQL Server (MSSQL), TypeORM (com Migrations)
- **Cache**: Redis Cache
- **Autenticação**: JWT, Passport, bcryptjs
- **Broker (Mensageria)**: RabbitMQ (mensagens de eventos de veículos)
- **Testes**: Jest (Unitários, Integração e E2E)
- **Containerização**: Docker, Docker Compose

---

## 🏗️ Estrutura do Projeto

O código-fonte está estruturado sob a pasta `src/` obedecendo às camadas do Clean Architecture:

```txt
src/
 ├── modules/
 │   ├── auth/          # Autenticação JWT
 │   ├── users/         # Usuários e Seed administrativo
 │   ├── brands/        # Gestão de Marcas (Brands)
 │   ├── models/        # Gestão de Modelos (Models)
 │   └── vehicles/      # Gestão de Veículos (Vehicles)
 ├── shared/            # Componentes e utilitários compartilhados
 └── config/            # Arquivos de configurações
```

Cada módulo é dividido internamente nas seguintes subpastas:
- **`application/`**: DTOs, interfaces e Casos de Uso (toda a regra de negócio do módulo).
- **`domain/`**: Entidades ricas de domínio, regras e exceções/erros específicos.
- **`infrastructure/`**: Entidades ORM (TypeORM), repositórios específicos e integrações externas (Redis, RabbitMQ).
- **`presentation/`**: Controllers e presenters.

---

## 🚀 Setup e Execução

### 1. Requisitos
- Node.js (v18+)
- PNPM (gerenciador de pacotes)
- Docker e Docker Compose

### 2. Variáveis de Ambiente
Copie o arquivo de exemplo e crie o `.env`:
```bash
cp .env.example .env
```
O projeto suporta dois modos de banco de dados e cache configuráveis via `.env` pela variável `DATABASE_PROVIDER`:
- `inmemory`: Executa em memória (ideal para testes locais e desenvolvimento leve sem Docker).
- `typeorm`: Executa integrado com o SQL Server e Redis (modo produção/homologação).

### 3. Subir Serviços Integrados (Docker Compose)
Se você estiver utilizando o modo `typeorm`, inicie os serviços do banco de dados, Redis, RabbitMQ e MongoDB executando:
```bash
docker-compose up -d
```

### 4. Instalar Dependências
```bash
pnpm install
```

### 5. Executar a Aplicação
```bash
# Modo de desenvolvimento (watch mode)
pnpm run start:dev

# Modo de produção
pnpm run build
pnpm run start:prod
```

---

## 🧪 Rodar Testes

O projeto vem com uma suite completa de testes automatizados com cobertura mínima de 80% das regras de negócio.

```bash
# Testes Unitários e de Integração
pnpm run test

# Testes E2E (End-to-End)
pnpm run test:e2e

# Verificar cobertura de testes (Coverage)
pnpm run test:cov
```

---

## 🗄️ Migrations (TypeORM)

Caso esteja no modo `typeorm`, utilize as migrations para gerenciar as atualizações do banco de dados:

```bash
# Executar migrations pendentes
pnpm run typeorm migration:run

# Reverter última migration
pnpm run typeorm migration:revert
```

---

## 📊 Endpoints Principais

A API possui as seguintes rotas principais protegidas por JWT (com exceção de `/auth/login`):

- `POST /auth/login` - Autenticação e obtenção do token JWT.
- `POST /brands` - Criar Marca.
- `GET /brands` - Listar Marcas.
- `PATCH /brands/:id` - Atualizar Marca.
- `DELETE /brands/:id` - Excluir Marca.
- `POST /models` - Criar Modelo.
- `GET /models` - Listar Modelos.
- `PATCH /models/:id` - Atualizar Modelo.
- `DELETE /models/:id` - Excluir Modelo.
- `POST /vehicles` - Criar Veículo.
- `GET /vehicles` - Listar Veículos.
- `GET /vehicles/:id` - Buscar Veículo por ID.
- `PATCH /vehicles/:id` - Atualizar Veículo.
- `DELETE /vehicles/:id` - Excluir Veículo.
