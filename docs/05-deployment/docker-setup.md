# 🐳 Docker Setup — NeoBoard

## docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    container_name: neoboard-db
    environment:
      POSTGRES_DB: NeoBoard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-neoboard_dev_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  api:
    build:
      context: ./source/backend
      dockerfile: Dockerfile
    container_name: neoboard-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=NeoBoard;Username=postgres;Password=${DB_PASSWORD:-neoboard_dev_password}
    ports:
      - "5001:8080"
    depends_on:
      db:
        condition: service_healthy

  # Frontend
  web:
    build:
      context: ./source/frontend
      dockerfile: Dockerfile
    container_name: neoboard-web
    ports:
      - "5173:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

---

## Dockerfile — Backend

```dockerfile
# source/backend/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore NeoBoard.Web/NeoBoard.Web.csproj
RUN dotnet publish NeoBoard.Web/NeoBoard.Web.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "NeoBoard.Web.dll"]
```

## Dockerfile — Frontend

```dockerfile
# source/frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Commands

```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f api

# Dừng
docker-compose down

# Rebuild sau khi thay đổi code
docker-compose up -d --build

# Chỉ chạy database (dev local không dùng Docker cho app)
docker-compose up -d db
```
