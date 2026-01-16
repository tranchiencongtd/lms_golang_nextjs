# MathVN Backend API

Backend API cho hệ thống học tập trực tuyến MathVN, được xây dựng bằng Go theo kiến trúc Clean Architecture.

## 📁 Cấu trúc thư mục

```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Entry point
├── config/
│   └── config.go             # Configuration management
├── internal/
│   ├── domain/               # Enterprise Business Rules
│   │   ├── user.go           # User entity
│   │   └── errors.go         # Domain errors
│   ├── repository/           # Interface Adapters (Data Layer)
│   │   ├── user_repository.go
│   │   └── postgres/
│   │       └── user_repository.go
│   ├── usecase/              # Application Business Rules
│   │   ├── auth_usecase.go
│   │   └── auth_usecase_impl.go
│   └── delivery/             # Frameworks & Drivers
│       └── http/
│           ├── handler/
│           │   └── auth_handler.go
│           ├── middleware/
│           │   ├── auth_middleware.go
│           │   └── middleware.go
│           ├── response/
│           │   └── response.go
│           └── router/
│               └── router.go
├── migrations/
│   ├── 001_create_users_table.up.sql
│   └── 001_create_users_table.down.sql
├── pkg/
│   └── database/
│       └── postgres.go
├── .env.example
├── .gitignore
├── go.mod
└── README.md
```

## 🚀 Bắt đầu

### Yêu cầu
- Go 1.21+
- PostgreSQL 14+

### Cài đặt

1. **Clone và di chuyển vào thư mục backend**
```bash
cd backend
```

2. **Cài đặt dependencies**
```bash
go mod tidy
```

3. **Tạo file .env**
```bash
cp .env.example .env
# Chỉnh sửa các biến môi trường
```

4. **Tạo database**
```bash
createdb mathvn_db
```

5. **Chạy migrations**
```bash
psql -d mathvn_db -f migrations/001_create_users_table.up.sql
```

6. **Chạy server**
```bash
go run cmd/api/main.go
```

Server sẽ chạy tại `http://localhost:8080`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/api/v1/auth/login` | Đăng nhập | ❌ |
| GET | `/api/v1/auth/profile` | Lấy thông tin profile | ✅ |

### Request/Response Examples

#### Đăng ký
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A"
}
```

Response:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "student",
      "is_verified": false
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400
  }
}
```

#### Đăng nhập
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Lấy Profile (Protected)
```bash
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

## 🔒 Security

- Mật khẩu được hash bằng bcrypt
- JWT token cho authentication
- Middleware bảo vệ các route cần xác thực
- CORS được cấu hình sẵn

## 🛠️ Development

### Build
```bash
go build -o bin/api cmd/api/main.go
```

### Run với hot reload (cần air)
```bash
go install github.com/cosmtrek/air@latest
air
```

## 📝 License

MIT
