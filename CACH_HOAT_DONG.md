# Cách Hoạt Động Của Hệ Thống

## 1. Kiến Trúc Hệ Thống

### Local (Development)
```
Frontend (Browser)
    ↓ http://localhost:3000/api
Backend (Node.js Server - Port 3000)
    ↓
Database (MySQL - sql12.freesqldatabase.com)
```

### Production (Vercel)
```
Browser
    ↓ https://vibe-shopee.vercel.app
Vercel Server (Frontend + Backend cùng domain)
    ├── /api/* → Backend (server.js)
    └── /* → Frontend (public/)
         ↓
Database (MySQL - sql12.freesqldatabase.com)
```

## 2. Cách Frontend Gọi Backend

### Trong file `public/app.js`:
```javascript
// Tự động detect môi trường
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'  // Local: gọi đến port 3000
    : '/api';                       // Production: gọi relative path
```

### Ví dụ:
- **Local**: `http://localhost:3000/api/orders` → Backend port 3000
- **Vercel**: `https://vibe-shopee.vercel.app/api/orders` → Vercel routing

## 3. Routing Trên Vercel

### File `vercel.json` định nghĩa:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",      // Tất cả request đến /api/*
      "dest": "/server.js"     // → Chuyển đến server.js (Backend)
    },
    {
      "src": "/(.*)",          // Tất cả request khác
      "dest": "/public/$1"     // → Chuyển đến thư mục public (Frontend)
    }
  ]
}
```

### Ví dụ routing:
- `GET /` → `public/index.html`
- `GET /app.js` → `public/app.js`
- `GET /styles.css` → `public/styles.css`
- `GET /api/orders` → `server.js` (xử lý API)
- `POST /api/orders` → `server.js` (xử lý API)

## 4. Flow Hoạt Động

### Khi người dùng truy cập website:

1. **Browser request**: `https://vibe-shopee.vercel.app`
2. **Vercel trả về**: `public/index.html`
3. **Browser load**: `app.js`, `styles.css`
4. **app.js chạy**: `loadOrders()` function
5. **Gọi API**: `fetch('/api/orders')`
6. **Vercel routing**: Chuyển request đến `server.js`
7. **server.js xử lý**: Query database MySQL
8. **Trả về JSON**: Danh sách đơn hàng
9. **app.js nhận data**: Hiển thị lên table

### Khi thêm đơn hàng mới:

1. **User click**: Nút "Thêm Đơn Hàng"
2. **app.js gọi**: `fetch('/api/orders', { method: 'POST', body: ... })`
3. **Vercel routing**: → `server.js`
4. **server.js**: `INSERT INTO orders ...`
5. **Database**: Lưu dữ liệu
6. **Trả về**: `{ success: true, id: 123 }`
7. **app.js**: Reload danh sách

## 5. Tự Động Cập Nhật Trạng Thái

### Cron Job trên Vercel:

```javascript
// Trong server.js
setInterval(async () => {
    // Chạy mỗi 30 phút
    await autoUpdateAllTracking();
}, 30 * 60 * 1000);
```

**Lưu ý**: Vercel Serverless Functions có giới hạn:
- Free plan: 10 giây timeout
- Cron job chỉ chạy khi có request
- Nếu không có traffic, cron sẽ không chạy

### Giải pháp:
1. **Uptime Monitor**: Dùng dịch vụ như UptimeRobot để ping website mỗi 5 phút
2. **Manual Update**: Thêm nút "Cập Nhật Trạng Thái" để user tự trigger
3. **Upgrade Vercel**: Pro plan có background jobs

## 6. Database Connection

### Kết nối từ Vercel đến MySQL:

```javascript
const connection = mysql.createConnection({
    host: process.env.DB_HOST,        // sql12.freesqldatabase.com
    user: process.env.DB_USER,        // sql12762959
    password: process.env.DB_PASSWORD, // 9Vu1Nt9Yjz
    database: process.env.DB_NAME,    // sql12762959
    port: process.env.DB_PORT,        // 3306
    charset: 'utf8mb4'
});
```

**Environment Variables** được set trên Vercel Dashboard, không lưu trong code.

## 7. Bảo Mật

### HTTPS:
- Vercel tự động cung cấp SSL certificate
- Tất cả traffic được mã hóa

### Environment Variables:
- Không commit vào Git
- Chỉ admin có quyền xem trên Vercel Dashboard

### Database:
- Kết nối qua SSL (nếu database hỗ trợ)
- Credentials lưu trong env vars

## 8. Performance

### CDN:
- Vercel có CDN toàn cầu
- Static files (HTML, CSS, JS) được cache
- API responses không cache (dynamic)

### Caching:
- Browser cache: `app.js?v=999999` để force reload
- Vercel Edge Cache: Tự động cho static files

### Optimization:
- Minify CSS/JS (có thể thêm build step)
- Compress images
- Lazy load data (pagination)

## 9. Monitoring

### Xem Logs:
```bash
vercel logs
```

Hoặc trên Dashboard:
- Deployments → Click deployment → View Function Logs

### Metrics:
- Bandwidth usage
- Function execution time
- Error rate
- Request count

## 10. Troubleshooting

### Lỗi "Cannot connect to database":
- Kiểm tra env vars trên Vercel
- Test connection từ local
- Kiểm tra firewall của database

### Lỗi "Function timeout":
- Giảm số lượng data xử lý
- Optimize queries
- Upgrade Vercel plan

### Lỗi 404:
- Kiểm tra `vercel.json` routing
- Kiểm tra file paths
- Clear browser cache

### API không hoạt động:
- Kiểm tra `API_URL` trong `app.js`
- Xem logs để debug
- Test API endpoint trực tiếp

## Tóm Tắt

**Local Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3000/api`
- Database: Remote MySQL

**Production (Vercel):**
- Frontend + Backend: `https://vibe-shopee.vercel.app`
- API: `https://vibe-shopee.vercel.app/api`
- Database: Remote MySQL (same)

**Key Points:**
✅ Frontend và Backend cùng domain trên Vercel
✅ Không cần CORS vì same-origin
✅ Routing tự động qua `vercel.json`
✅ Environment variables quản lý trên Dashboard
✅ Tự động HTTPS và CDN