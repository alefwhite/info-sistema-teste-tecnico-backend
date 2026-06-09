# 1. chore(agents)
Write-Host "Committing agent configs..."
git add .agents/
git add agents.md
git commit -m "chore(agents): update agents profile and rules configuration"

# 2. feat(auth)
Write-Host "Committing auth module..."
git add src/modules/auth/
git commit -m "feat(auth): decouple and restructure auth module into Clean Architecture layers"

# 3. feat(users)
Write-Host "Committing users module..."
git add src/modules/users/
git commit -m "feat(users): restructure users module and implement automatic database seeding"

# 4. feat(brands)
Write-Host "Committing brands module..."
git add src/modules/brands/
git commit -m "feat(brands): restructure brands module with clean architecture and repositories"

# 5. feat(models)
Write-Host "Committing models module..."
git add src/modules/models/
git commit -m "feat(models): restructure models module with validation and repository patterns"

# 6. feat(vehicles)
Write-Host "Committing vehicles module..."
git add src/modules/vehicles/
git commit -m "feat(vehicles): restructure vehicles module with validation rules and repositories"

# 7. feat(shared)
Write-Host "Committing shared layers and application entrypoints..."
git add src/shared/
git add src/main.ts
git add src/app.module.ts
git commit -m "feat(shared): implement database-backed TypeORM datasource, Redis cache, JWT guards, and custom exception filter"

# 8. test(core)
Write-Host "Committing test suites and local mock artifacts..."
git add test/
git add api.http
git add seed_vehicles.json
git commit -m "test(core): implement E2E flow tests and usecase unit tests with high coverage"

# 9. feat(docker)
Write-Host "Committing docker orchestration and project metadata..."
git add Dockerfile
git add docker-compose.yml
git add .dockerignore
git add .gitignore
git add package.json
git add pnpm-lock.yaml
git add README.md
git commit -m "feat(docker): add multi-stage Dockerfile and integrate API container in docker-compose"

# 10. docs(architecture)
Write-Host "Committing architectural documentation..."
git add docs/architecture-flow.md
git commit -m "docs(architecture): create request lifecycle and architecture flow documentation"

Write-Host "All commits created successfully!"
