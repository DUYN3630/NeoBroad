# 🚀 Chiến Lược Triển Khai (Deployment) — NeoBoard EDU-AMS

## 1. Môi Trường Triển Khai

| Môi trường | Hạ tầng | Phương thức |
|---|---|---|
| **Development** | Local Machine / Docker Compose | Chạy code trực tiếp |
| **Staging** | VPS (Ubuntu) / Docker | Docker Compose |
| **Production** | Cloud (AWS/Azure) / K8s | Docker Images + CI/CD |

---

## 2. Containerization (Docker)

Hệ thống được tách thành 4 container chính:
1. **Frontend:** Chạy Next.js (Node server hoặc static export).
2. **Backend:** Chạy NestJS API.
3. **Database:** MySQL 8.0 image.
4. **Cache/Queue:** Redis image.

---

## 3. Quy Trình CI/CD (GitHub Actions)

Mỗi khi code được push lên nhánh `main`:
1. **Lint & Test:** Chạy ESLint và Jest.
2. **Build Image:** Build Docker images cho FE và BE.
3. **Push Image:** Đẩy images lên Docker Hub hoặc Registry riêng.
4. **Deploy:** SSH vào server, chạy `docker-compose pull` và `docker-compose up -d`.

---

## 4. Bảo Mật & Tối Ưu

- **SSL/TLS:** Sử dụng Nginx làm Reverse Proxy và cấu hình **Let's Encrypt** để có HTTPS.
- **Firewall:** Chỉ mở các cổng cần thiết (80, 443). Cổng 3306 (MySQL) và 6379 (Redis) chỉ cho phép truy cập nội bộ.
- **Auto-scaling:** Với Backend NestJS, có thể sử dụng PM2 cluster mode hoặc Kubernetes để tự động tăng số lượng tiến trình khi tải cao.
