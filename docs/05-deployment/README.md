# 🚀 Chiến Lược Deployment — NeoBoard

## Môi Trường

| Môi trường | Mục đích | URL |
|---|---|---|
| **Development** | Local dev | `localhost:5173` / `localhost:5001` |
| **Staging** | Test trước production | `staging.neoboard.com` |
| **Production** | Live | `neoboard.com` |

---

## Deployment Options

### Option 1: Docker Compose (Recommend cho bắt đầu)
- Xem `docker-setup.md`

### Option 2: Cloud (Azure / AWS)
- **Backend**: Azure App Service hoặc AWS ECS
- **Frontend**: Azure Static Web Apps hoặc AWS S3 + CloudFront
- **Database**: Azure Database for PostgreSQL hoặc AWS RDS

### Option 3: VPS
- Nginx reverse proxy
- PM2 / systemd cho process management
- Let's Encrypt cho SSL

---

## Build Commands

```bash
# Backend - Build production
cd source/backend
dotnet publish -c Release -o ./publish

# Frontend - Build production
cd source/frontend
npm run build
# Output: dist/ folder
```

---

## Checklist Deploy Production

- [ ] Environment variables set đầy đủ
- [ ] Database migration đã chạy
- [ ] CORS config đúng production domain
- [ ] JWT secret key strong + unique
- [ ] HTTPS enabled
- [ ] Logging cấu hình đúng (không log sensitive data)
- [ ] Health check endpoint hoạt động
- [ ] Backup database trước khi deploy
- [ ] Rollback plan ready
