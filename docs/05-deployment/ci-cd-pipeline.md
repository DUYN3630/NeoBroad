# ⚙️ CI/CD Pipeline — NeoBoard

## GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: NeoBoard CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Backend Build & Test
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: NeoBoard_Test
          POSTGRES_PASSWORD: test_password
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
      - run: dotnet restore
        working-directory: source/backend
      - run: dotnet build --no-restore
        working-directory: source/backend
      - run: dotnet test --no-build --verbosity normal
        working-directory: source/backend

  # Frontend Build & Test
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: source/frontend/package-lock.json
      - run: npm ci
        working-directory: source/frontend
      - run: npm run lint
        working-directory: source/frontend
      - run: npm run test -- --run
        working-directory: source/frontend
      - run: npm run build
        working-directory: source/frontend
```

---

## Pipeline Stages

```
Code Push → Lint → Build → Test → (PR Review) → Merge → Deploy Staging → Deploy Production
```

| Stage | Backend | Frontend |
|---|---|---|
| Lint | `dotnet format --check` | `npm run lint` |
| Build | `dotnet build` | `npm run build` |
| Test | `dotnet test` | `npm run test` |
| Deploy | `dotnet publish` + Docker | `npm run build` + CDN upload |
