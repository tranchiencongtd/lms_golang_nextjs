# Migration Guide - Add Phone Number Support

## Tổng Quan Thay Đổi

---

## Cách Chạy Migration

### **Bước 1: Tạo Database (nếu chưa có)**

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE mathvn_db;

# Thoát
\q
```

### **Bước 2: Chạy Migration**

#### **Cách 1: Dùng golang-migrate CLI**

```bash
# Cài đặt golang-migrate (nếu chưa có)
brew install golang-migrate

# Chạy migration
migrate -database "postgres://postgres:123456@localhost:5432/mathvn_db?sslmode=disable" \
        -path backend/migrations up

# Kiểm tra version
migrate -database "postgres://postgres:123456@localhost:5432/mathvn_db?sslmode=disable" \
        -path backend/migrations version
```

#### **Cách 2: Chạy SQL Trực Tiếp**

```bash
# Migration 001 - Create users table
psql -U postgres -d mathvn_db -f backend/migrations/001_create_users_table.up.sql

# Migration 002 - Add phone_number, remove last_login_at
psql -U postgres -d mathvn_db -f backend/migrations/002_alter_users_table.up.sql
```

### **Bước 3: Verify Database Schema**

```bash
psql -U postgres -d mathvn_db

# Kiểm tra cấu trúc bảng users
\d users

# Expected output:
#                                            Table "public.users"
#    Column     |           Type           | Nullable |             Default              
# --------------+--------------------------+----------+----------------------------------
#  id           | uuid                     | not null | uuid_generate_v4()
#  email        | character varying(255)   | not null | 
#  password_hash| character varying(255)   | not null | 
#  full_name    | character varying(255)   | not null | 
#  avatar       | text                     |          | 
#  phone_number | character varying(20)    |          |    <-- NEW COLUMN
#  role         | user_role                | not null | 'student'::user_role
#  is_active    | boolean                  | not null | true
#  is_verified  | boolean                  | not null | false
#  created_at   | timestamp with time zone | not null | CURRENT_TIMESTAMP
#  updated_at   | timestamp with time zone | not null | CURRENT_TIMESTAMP

# Kiểm tra indexes
\d+ users

# Expected indexes:
# - idx_users_email
# - idx_users_phone_number  <-- NEW INDEX
# - idx_users_role
# - idx_users_is_active
```

### **Bước 4: Chạy Backend**

```bash
cd backend

# Tải dependencies
go mod download

# Chạy server
go run cmd/api/main.go

# Output:
# ✅ Connected to PostgreSQL database
# 🚀 Server starting on port 8080
# 📖 API docs: http://localhost:8080/api/v1
```

---

## Rollback Migration (Nếu Cần)

```bash
# Rollback migration 002
migrate -database "postgres://postgres:123456@localhost:5432/mathvn_db?sslmode=disable" \
        -path backend/migrations down 1

# Hoặc chạy SQL trực tiếp
psql -U postgres -d mathvn_db -f backend/migrations/002_alter_users_table.down.sql
```

---

---

## Troubleshooting

### Lỗi: `database "mathvn_db" does not exist`
**Giải pháp:** Tạo database trước khi chạy migration
```bash
psql -U postgres -c "CREATE DATABASE mathvn_db;"
```

### Lỗi: `relation "users" already exists`
**Giải pháp:** Database đã có table users, chỉ cần chạy migration 002
```bash
migrate -database "postgres://..." -path backend/migrations goto 2
```

### Lỗi: `column "last_login_at" does not exist`
**Giải pháp:** Migration 002 đã chạy thành công, rebuild project
```bash
go mod tidy
go build ./...
```
