# AGENTS.md

## Objetivo

Este documento define as regras obrigatórias para qualquer agente de IA (Claude Code, Cursor, GitHub Copilot, Windsurf ou ChatGPT) que participe do desenvolvimento deste projeto.

**Framework**: NestJS com TypeScript  
**Package Manager**: pnpm  
**Base de Dados**: SQL Server + TypeORM  
**Cache**: Redis  
**Autenticação**: JWT + Passport + bcrypt

---

## Documentação Obrigatória

Antes de qualquer implementação, consulte:

- `.agents/prd.md` - Requisitos funcionais e regras de negócio
- `.agents/architecture.md` - Design de camadas e responsabilidades
- `.agents/database.md` - Especificação de banco de dados (schemas, índices, constraints)
- `.agents/skills/backend-nest/SKILL.md` - Padrões de arquitetura NestJS
- `.agents/skills/testing/SKILL.md` - Estratégia de testes

---

# Desenvolvimento

## Setup Inicial

```bash
pnpm install
```

## Comandos

Desenvolvimento:
```bash
pnpm run start:dev      # modo watch
pnpm run start:debug    # debug mode
```

Produção:
```bash
pnpm run build          # compilar
pnpm run start:prod     # executar
```

## Testes

```bash
pnpm run test           # unitários
pnpm run test:watch    # mode watch
pnpm run test:cov      # cobertura (mínimo 80%)
pnpm run test:e2e      # end-to-end
```

## Qualidade de Código

```bash
pnpm run lint           # verificar e corrigir ESLint
pnpm run format         # formatar com Prettier
```

---

Obrigatório seguir:

* Clean Architecture
* SOLID
* DRY
* KISS
* Repository Pattern
* Dependency Injection

Não implementar regras de negócio em:

* Controllers
* DTOs
* Entities

Toda regra de negócio deve estar em:

```txt
application/use-cases
```

---

# Estrutura de Pastas

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
 │   ├── database/
 │   ├── cache/
 │   ├── config/
 │   └── exceptions/
 │
 ├── shared/
 │   ├── decorators/
 │   ├── guards/
 │   ├── filters/
 │   ├── pipes/
 │   ├── middleware/
 │   └── utils/
 │
 └── config/
```

**Organização de Módulos**

Cada módulo segue:

```txt
module-name/
├── application/
│   ├── dto/
│   ├── use-cases/
│   └── interfaces/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── errors/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   └── cache/
└── presentation/
    ├── controllers/
    └── presenters/
```

---

# Controllers

Responsabilidades:

* receber requisição
* validar DTO com ValidationPipe
* chamar use case
* retornar resposta com status correto

**Padrão NestJS**:

```ts
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehicleController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVehicleDto) {
    return await this.useCase.execute(dto);
  }
}
```

**Guards Obrigatórios**:

- `JwtAuthGuard` em todas rotas exceto `POST /auth/login`
- Implementar `IAuthGuard` com `canActivate()`

**Decoradores**:

- `@UseGuards()` para proteção
- `@HttpCode()` para status correto
- `@Body()`, `@Param()`, `@Query()` para validação automática

Nunca:

* acessar banco diretamente
* executar regra de negócio
* retornar status incorreto

---

# Use Cases

Responsáveis por:

* regras de negócio
* validações de domínio
* chamadas aos repositórios
* publicação de eventos

Cada use case deve possuir:

```ts
execute()
```

---

# Repositories

Devem ser abstrações.

Exemplo:

```ts
IVehicleRepository
```

Nunca depender diretamente do TypeORM dentro do domínio.

---

# Banco de Dados

Utilizar:

* SQL Server
* TypeORM
* Migrations

Nunca utilizar synchronize=true.

---

# Segurança

Obrigatório implementar **globalmente** em `main.ts`:

```ts
app.use(helmet());
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
app.useGlobalFilters(new AllExceptionsFilter());
```

**JWT**:
- Secret em env: `JWT_SECRET`
- Expiração em env: `JWT_EXPIRES_IN`
- Estratégia: `JwtStrategy` com `Passport`

**bcrypt**:
- Sempre hash de senha: `bcrypt.hash(password, 10)`
- Comparação: `bcrypt.compare(input, hashed)`

**Proteções**:
- Helmet para headers de segurança
- CORS configurado
- Rate Limiter para DOS protection

**Senhas**:
- Nunca em logs
- Nunca em exceptions
- Nunca em responses

**Validação**:
- DTOs com `class-validator`
- `ValidationPipe` global
- Rejeitar campos não esperados

---

# Cache

Utilizar Redis.

Aplicar cache em:

* findAllVehicles
* findVehicleById

Invalidar cache em:

* createVehicle
* updateVehicle
* deleteVehicle

---

# Logs

**Toda operação deve gerar log estruturado**.

Em Use Cases, injete `Logger`:

```ts
export class CreateVehicleUseCase {
  constructor(
    private logger: Logger,
    private repository: IVehicleRepository,
  ) {}

  async execute(input: CreateVehicleDto): Promise<void> {
    this.logger.log({
      action: 'vehicle.created',
      entity: 'vehicle',
      entityId: vehicleId,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Nunca registrar**:

- Senhas
- Tokens JWT
- Cookies
- Dados sensíveis

**Formato esperado**:

```json
{
  "action": "entity.action",
  "entity": "vehicle",
  "entityId": "uuid",
  "userId": "uuid",
  "timestamp": "ISO_DATE",
  "correlationId": "uuid (opcional)"
}
```

---

# Eventos

Quando existir RabbitMQ:

Publicar:

* vehicle.created
* vehicle.updated
* vehicle.deleted

Consumidores nunca devem alterar regras de negócio.

---

# Testes

**Cobertura Mínima**: 80%

**Obrigatório testar**:

* Use Cases (regras de negócio)
* Controllers (endpoints)
* Repositories (integração com banco)
* Guards (autenticação)

**Estrutura**:

```bash
src/modules/vehicles/
  ├── application/use-cases/
  │   ├── create-vehicle.use-case.spec.ts
  │   └── create-vehicle.use-case.ts
  ├── presentation/controllers/
  │   ├── vehicle.controller.spec.ts
  │   └── vehicle.controller.ts

test/
  ├── e2e/
  │   └── vehicles.e2e-spec.ts
```

**Padrão**:

- Arquivo `*.spec.ts` ao lado da implementação
- Use Cases: testar lógica sem mocks de regras
- Controllers: mockar use cases
- E2E: testar fluxos completos

**Mockar apenas**:

- Banco de dados
- Redis
- RabbitMQ  
- Serviços externos

**Não mockar**:

- Regras de negócio
- Validações
- Transformações

**Executar**:

```bash
pnpm run test:cov           # verificar 80%
pnpm run test --bail        # falhar na primeira
```

---

# DTOs

Utilizar:

* `class-validator` para validação
* `class-transformer` para transformação
* Tipos explícitos em TypeScript

**Validações obrigatórias** em Vehicle:

```ts
export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @IsNotEmpty()
  @IsString()
  chassis: string;

  @IsNotEmpty()
  @IsString()
  renavam: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1900)
  @Max(currentYear + 1)
  year: number;

  @IsNotEmpty()
  @IsUUID()
  modelId: string;
}
```

**Padrão**:

- Uma DTO por caso de uso (Create, Update, etc.)
- Herança quando compartilha campos
- Nunca lógica complexa em DTOs
- Sempre explicitar `?` para campos opcionais

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
  "message": "Descrição",
  "statusCode": 400
}
```

---

# Variáveis de Ambiente

Criar `.env` com:

```env
# Aplicação
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=fleet_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600

# RabbitMQ (se habilitado)
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Seed
DEFAULT_USER_PASSWORD=your_default_password
```

**Nunca commitar** `.env` (usar `.env.example`)

---

# NestJS Padrões

## Módulos

Padrão de módulo:

```ts
@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity])],
  controllers: [VehicleController],
  providers: [
    CreateVehicleUseCase,
    ListVehiclesUseCase,
    {
      provide: 'IVehicleRepository',
      useClass: VehicleRepository,
    },
  ],
  exports: ['IVehicleRepository'],
})
export class VehicleModule {}
```

## Providers

- Injetar dependências sempre
- Usar `@Inject()` para abstrações
- Nunca `new` (exceto no módulo)

```ts
@Injectable()
export class VehicleController {
  constructor(
    @Inject('IVehicleRepository')
    private repository: IVehicleRepository,
  ) {}
}
```

## Exception Filters

Criar `GlobalExceptionFilter` para tratar:

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // retornar formato padrão
  }
}
```

Registrar globalmente em `main.ts`:

```ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

# Qualidade de Código (TypeScript Strict)

Habilitar em `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true
  }
}
```

**Imports Absolutos**:

```ts
// ✅ Correto
import { IVehicleRepository } from '@modules/vehicles/domain/repositories';

// ❌ Errado
import { IVehicleRepository } from '../../../domain/repositories';
```

Configurar em `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@config/*": ["src/config/*"]
    }
  }
}
```

---

# Checklist Pré-Implementação

Antes de abrir PR, validar:

- [ ] Use Case criado com `execute()`
- [ ] Interface de Repository criada
- [ ] DTO com validadores `class-validator`
- [ ] Controller com `JwtAuthGuard`
- [ ] Tests cobrindo 80%+ (unit + e2e)
- [ ] Tratamento de erros com custom exceptions
- [ ] Logs estruturados em pontos críticos
- [ ] Migration executada (se houver mudança BD)
- [ ] Cache invalidado (se aplicável)
- [ ] ESLint e Prettier passando
- [ ] Sem `any` ou `console.log`
- [ ] Documentação Swagger atualizada

---

# Convenções

Classes:

```ts
CreateVehicleUseCase
```

Interfaces:

```ts
IVehicleRepository
```

DTOs:

```ts
CreateVehicleDto
```

Controllers:

```ts
VehicleController
```

---

