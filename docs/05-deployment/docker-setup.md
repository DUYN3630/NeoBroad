# 🚢 Docker Setup — NeoBoard EDU-AMS

## Docker Compose Structure

Dự án được đóng gói thành các containers để đảm bảo tính nhất quán giữa môi trường Dev và Production.

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: NeoBoardDb
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  backend:
    build: ./source/backend
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - redis
    environment:
      DATABASE_URL: mysql://root:password@mysql:3306/NeoBoardDb
      REDIS_URL: redis://redis:6379

  frontend:
    build: ./source/frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://backend:3000/api/v1
```

## Các lệnh chính

- **Chạy môi trường:** `docker-compose up -d`
- **Tạo Migration:** `docker-compose exec backend npx prisma migrate dev`
- **Xem logs:** `docker-compose logs -f`
