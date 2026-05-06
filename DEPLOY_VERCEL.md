# Hướng Dẫn Deploy Lên Vercel

## Bước 1: Chuẩn Bị

### 1.1. Đăng ký tài khoản Vercel
- Truy cập: https://vercel.com/signup
- Đăng ký bằng GitHub, GitLab, hoặc Email

### 1.2. Cài đặt Vercel CLI (đã xong)
```bash
npm install -g vercel
```

## Bước 2: Deploy Lên Vercel

### 2.1. Đăng nhập Vercel CLI
Mở terminal và chạy:
```bash
vercel login
```
- Chọn phương thức đăng nhập (Email hoặc GitHub)
- Xác nhận trong email hoặc trình duyệt

### 2.2. Deploy Project
Trong thư mục project (c:/Users/Tuantx/Downloads/tuantx/vibe-shopee), chạy:
```bash
vercel
```

Trả lời các câu hỏi:
1. **Set up and deploy?** → Nhấn `Y` (Yes)
2. **Which scope?** → Chọn tài khoản của bạn
3. **Link to existing project?** → Nhấn `N` (No)
4. **What's your project's name?** → `vibe-shopee` (hoặc tên bạn muốn)
5. **In which directory is your code located?** → Nhấn Enter (thư mục hiện tại)
6. **Want to override the settings?** → Nhấn `N` (No)

Vercel sẽ tự động:
- Phát hiện Node.js project
- Build và deploy
- Cung cấp URL production (ví dụ: https://vibe-shopee.vercel.app)

### 2.3. Thêm Environment Variables
Sau khi deploy, cần thêm biến môi trường cho database:

**Cách 1: Qua Dashboard**
1. Truy cập: https://vercel.com/dashboard
2. Chọn project `vibe-shopee`
3. Vào tab **Settings** → **Environment Variables**
4. Thêm các biến sau:

```
DB_HOST = sql12.freesqldatabase.com
DB_USER = sql12762959
DB_PASSWORD = 9Vu1Nt9Yjz
DB_NAME = sql12762959
DB_PORT = 3306
```

5. Nhấn **Save**
6. Vào tab **Deployments** → Chọn deployment mới nhất → Nhấn **Redeploy**

**Cách 2: Qua CLI**
```bash
vercel env add DB_HOST
# Nhập: sql12.freesqldatabase.com
# Chọn: Production, Preview, Development (chọn cả 3)

vercel env add DB_USER
# Nhập: sql12762959

vercel env add DB_PASSWORD
# Nhập: 9Vu1Nt9Yjz

vercel env add DB_NAME
# Nhập: sql12762959

vercel env add DB_PORT
# Nhập: 3306
```

Sau đó redeploy:
```bash
vercel --prod
```

## Bước 3: Kiểm Tra

### 3.1. Truy cập website
- URL sẽ có dạng: `https://vibe-shopee.vercel.app`
- Hoặc: `https://vibe-shopee-[random].vercel.app`

### 3.2. Test các chức năng
1. **Trang chủ**: Xem danh sách đơn hàng
2. **Thêm đơn hàng**: Thử tạo đơn hàng mới
3. **Sửa đơn hàng**: Double-click vào ô để sửa
4. **Xóa đơn hàng**: Nhấn nút Xóa
5. **Import**: Thử import dữ liệu từ Excel
6. **Sản phẩm**: Chuyển sang tab Sản phẩm và test tương tự
7. **Auto-update**: Đợi 30 phút để kiểm tra tự động cập nhật trạng thái

## Bước 4: Cập Nhật Code (Sau Này)

Khi bạn sửa code và muốn deploy lại:

### 4.1. Deploy phiên bản mới
```bash
vercel --prod
```

### 4.2. Hoặc deploy để test trước (Preview)
```bash
vercel
```
Vercel sẽ tạo URL preview để bạn test trước khi deploy production.

## Bước 5: Custom Domain (Tùy Chọn)

Nếu bạn có tên miền riêng (ví dụ: shopee.tuantx.com):

1. Vào **Settings** → **Domains**
2. Nhấn **Add Domain**
3. Nhập tên miền của bạn
4. Làm theo hướng dẫn để cấu hình DNS

## Lưu Ý Quan Trọng

### ⚠️ Giới Hạn Free Plan
- **Bandwidth**: 100GB/tháng
- **Serverless Function Execution**: 100 giờ/tháng
- **Deployments**: Không giới hạn
- **Team Members**: 1 người

Nếu vượt quá, cần nâng cấp lên Pro ($20/tháng).

### 🔒 Bảo Mật
- **KHÔNG** commit file `.env` lên Git
- Đã có `.gitignore` để bảo vệ
- Chỉ thêm environment variables qua Vercel Dashboard

### 🐛 Troubleshooting

**Lỗi: "Cannot connect to database"**
- Kiểm tra environment variables đã thêm đúng chưa
- Redeploy sau khi thêm env vars

**Lỗi: "Function execution timeout"**
- Free plan có giới hạn 10s cho mỗi request
- Nếu import quá nhiều dữ liệu, chia nhỏ ra

**Lỗi: "Module not found"**
- Chạy `npm install` để đảm bảo tất cả dependencies đã cài
- Commit `package-lock.json` lên Git

**Website không load được**
- Kiểm tra logs: `vercel logs [deployment-url]`
- Hoặc xem logs trên Dashboard → Deployments → View Function Logs

## Các Lệnh Hữu Ích

```bash
# Xem danh sách deployments
vercel ls

# Xem logs của deployment
vercel logs [deployment-url]

# Xóa deployment
vercel rm [deployment-name]

# Xem thông tin project
vercel inspect

# Deploy production
vercel --prod

# Deploy preview (test)
vercel
```

## Kết Luận

Sau khi hoàn thành các bước trên, website của bạn sẽ:
- ✅ Chạy trên Vercel với HTTPS miễn phí
- ✅ Tự động cập nhật khi bạn push code mới
- ✅ Có URL công khai để truy cập từ mọi nơi
- ✅ Tự động scale khi có nhiều người dùng
- ✅ Có CDN toàn cầu (load nhanh)

**URL của bạn sẽ là**: https://vibe-shopee.vercel.app (hoặc tương tự)

Chúc bạn deploy thành công! 🚀