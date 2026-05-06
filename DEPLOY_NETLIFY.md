# 🚀 Hướng Dẫn Deploy Lên Netlify

## ⚠️ Lưu Ý Quan Trọng

Netlify chỉ host **frontend** (HTML, CSS, JS). Backend Node.js cần deploy riêng.

## 📋 Các Bước Deploy

### **Option 1: Deploy Frontend + Backend Riêng (Khuyến nghị)**

#### **Bước 1: Deploy Backend lên Render/Railway/Heroku**

**A. Sử dụng Render.com (Miễn phí):**

1. Tạo tài khoản tại https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository hoặc upload code
4. Cấu hình:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**:
     ```
     DB_HOST=sql12.freesqldatabase.com
     DB_USER=sql12753523
     DB_PASSWORD=your_password
     DB_NAME=sql12753523
     DB_PORT=3306
     ```
5. Click "Create Web Service"
6. Lấy URL backend (ví dụ: `https://your-app.onrender.com`)

**B. Hoặc sử dụng Railway.app:**

1. Tạo tài khoản tại https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Chọn repository
4. Railway tự động detect Node.js và deploy
5. Thêm environment variables như trên
6. Lấy URL backend

#### **Bước 2: Cập Nhật Frontend**

Sửa file `public/app.js`:

```javascript
// Thay đổi từ:
const API_URL = 'http://localhost:3000/api';

// Thành:
const API_URL = 'https://your-backend-url.onrender.com/api';
```

#### **Bước 3: Deploy Frontend lên Netlify**

**Cách 1: Drag & Drop (Đơn giản nhất)**

1. Truy cập https://app.netlify.com
2. Đăng nhập/Đăng ký
3. Kéo thả thư mục `public` vào Netlify
4. Netlify sẽ tự động deploy
5. Lấy URL (ví dụ: `https://your-app.netlify.app`)

**Cách 2: Deploy từ GitHub**

1. Push code lên GitHub
2. Vào Netlify → "Add new site" → "Import from Git"
3. Chọn repository
4. Cấu hình:
   - **Base directory**: `public`
   - **Build command**: (để trống)
   - **Publish directory**: `.`
5. Click "Deploy site"

---

### **Option 2: Deploy Full-Stack lên Vercel (Khuyến nghị hơn)**

Vercel hỗ trợ cả frontend và backend (serverless functions).

#### **Bước 1: Chuẩn Bị Code**

Tạo file `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

#### **Bước 2: Deploy**

1. Cài Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Thêm environment variables trên Vercel dashboard

---

### **Option 3: Deploy Toàn Bộ lên VPS (Nâng cao)**

Nếu có VPS (DigitalOcean, Vultr, AWS EC2):

1. SSH vào VPS
2. Cài Node.js và MySQL
3. Clone code
4. Chạy `npm install`
5. Cài PM2: `npm install -g pm2`
6. Chạy: `pm2 start server.js`
7. Cấu hình Nginx reverse proxy
8. Cài SSL certificate (Let's Encrypt)

---

## 🔧 Cấu Hình CORS

Nếu frontend và backend ở domain khác nhau, cần cấu hình CORS trong `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://your-frontend.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

Cài package:
```bash
npm install cors
```

---

## 📝 Checklist Deploy

- [ ] Backend deployed và có URL
- [ ] Database online và accessible
- [ ] Environment variables đã set
- [ ] Frontend đã update API_URL
- [ ] CORS đã cấu hình
- [ ] Test tất cả tính năng
- [ ] SSL certificate (HTTPS)

---

## 🎯 Khuyến Nghị

**Cho dự án này:**

1. **Backend**: Deploy lên **Render.com** (free tier)
2. **Frontend**: Deploy lên **Netlify** (free tier)
3. **Database**: Giữ nguyên MySQL online hiện tại

**Hoặc đơn giản hơn:**

Deploy toàn bộ lên **Vercel** (hỗ trợ cả frontend + backend)

---

## 🆘 Troubleshooting

**Lỗi CORS:**
- Thêm `cors` middleware trong server.js
- Kiểm tra origin trong CORS config

**Lỗi Database Connection:**
- Kiểm tra environment variables
- Đảm bảo database cho phép remote connection

**Lỗi 404 API:**
- Kiểm tra API_URL trong app.js
- Kiểm tra routes trong server.js

---

## 📞 Liên Hệ

Nếu cần hỗ trợ deploy, hãy cho tôi biết bạn chọn platform nào!