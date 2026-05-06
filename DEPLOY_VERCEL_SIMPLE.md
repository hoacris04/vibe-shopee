# Hướng Dẫn Deploy Lên Vercel - Đơn Giản

## Bước 1: Đăng Ký và Đăng Nhập Vercel

### 1.1. Đăng ký tài khoản
1. Truy cập: https://vercel.com/signup
2. Chọn **Continue with GitHub** (khuyến nghị) hoặc Email
3. Xác nhận tài khoản

### 1.2. Đăng nhập CLI
Mở terminal trong VS Code và chạy:
```bash
vercel login
```
- Chọn phương thức đăng nhập (GitHub hoặc Email)
- Xác nhận trong trình duyệt
- Đợi thông báo "Success! Authentication complete"

## Bước 2: Deploy Project

### 2.1. Chạy lệnh deploy
Trong thư mục project, chạy:
```bash
vercel
```

### 2.2. Trả lời các câu hỏi
```
? Set up and deploy "c:\Users\Tuantx\Downloads\tuantx\vibe-shopee"? [Y/n]
→ Nhấn Y (hoặc Enter)

? Which scope do you want to deploy to?
→ Chọn tài khoản của bạn (dùng mũi tên ↑↓ và Enter)

? Link to existing project? [y/N]
→ Nhấn N (tạo project mới)

? What's your project's name? (vibe-shopee)
→ Nhấn Enter (hoặc đặt tên khác)

? In which directory is your code located? ./
→ Nhấn Enter

? Want to override the settings? [y/N]
→ Nhấn N
```

### 2.3. Đợi deploy
Vercel sẽ:
- Upload code
- Build project
- Deploy lên server
- Hiển thị URL (ví dụ: https://vibe-shopee.vercel.app)

**Lưu ý**: Lần đầu deploy sẽ BỊ LỖI vì chưa có environment variables. Đây là bình thường!

## Bước 3: Thêm Environment Variables

### 3.1. Truy cập Vercel Dashboard
1. Mở trình duyệt: https://vercel.com/dashboard
2. Đăng nhập (nếu chưa)
3. Click vào project **vibe-shopee**

### 3.2. Thêm biến môi trường
1. Click tab **Settings** (ở menu trên)
2. Click **Environment Variables** (menu bên trái)
3. Thêm từng biến sau:

**Biến 1: DB_HOST**
- Key: `DB_HOST`
- Value: `sql12.freesqldatabase.com`
- Environment: Chọn cả 3 (Production, Preview, Development)
- Click **Save**

**Biến 2: DB_USER**
- Key: `DB_USER`
- Value: `sql12762959`
- Environment: Chọn cả 3
- Click **Save**

**Biến 3: DB_PASSWORD**
- Key: `DB_PASSWORD`
- Value: `9Vu1Nt9Yjz`
- Environment: Chọn cả 3
- Click **Save**

**Biến 4: DB_NAME**
- Key: `DB_NAME`
- Value: `sql12762959`
- Environment: Chọn cả 3
- Click **Save**

**Biến 5: DB_PORT**
- Key: `DB_PORT`
- Value: `3306`
- Environment: Chọn cả 3
- Click **Save**

### 3.3. Redeploy
Sau khi thêm xong tất cả biến:
1. Click tab **Deployments**
2. Click vào deployment mới nhất (dòng đầu tiên)
3. Click nút **⋯** (3 chấm) ở góc phải
4. Click **Redeploy**
5. Click **Redeploy** để xác nhận

Đợi 1-2 phút để Vercel build lại.

## Bước 4: Kiểm Tra Website

### 4.1. Mở website
- URL có dạng: `https://vibe-shopee.vercel.app`
- Hoặc: `https://vibe-shopee-[random].vercel.app`
- Copy URL từ Vercel Dashboard

### 4.2. Test các chức năng
✅ Trang chủ hiển thị danh sách đơn hàng
✅ Thêm đơn hàng mới
✅ Sửa đơn hàng (double-click vào ô)
✅ Xóa đơn hàng
✅ Import từ Excel
✅ Tab Sản phẩm hoạt động
✅ Tự động cập nhật trạng thái (đợi 30 phút)

### 4.3. Nếu có lỗi
1. Vào **Deployments** → Click deployment mới nhất
2. Click **View Function Logs** để xem lỗi
3. Kiểm tra lại environment variables đã đúng chưa

## Bước 5: Deploy Lại Khi Sửa Code

Khi bạn sửa code và muốn deploy phiên bản mới:

### Cách 1: Deploy Production
```bash
vercel --prod
```

### Cách 2: Deploy Preview (test trước)
```bash
vercel
```
Vercel sẽ tạo URL preview riêng để test.

## Các Lệnh Hữu Ích

```bash
# Xem danh sách deployments
vercel ls

# Xem logs
vercel logs

# Xem thông tin project
vercel inspect

# Deploy production
vercel --prod

# Xóa project
vercel remove vibe-shopee
```

## Lưu Ý Quan Trọng

### ⚠️ Giới Hạn Free Plan
- **Bandwidth**: 100GB/tháng
- **Function Execution**: 100 giờ/tháng
- **Deployments**: Không giới hạn

### 🔒 Bảo Mật
- **KHÔNG** commit file `.env` lên Git
- Chỉ thêm environment variables qua Vercel Dashboard
- Không chia sẻ thông tin database

### 🐛 Troubleshooting

**Lỗi: "Cannot connect to database"**
→ Kiểm tra environment variables, redeploy

**Lỗi: "Function execution timeout"**
→ Import ít dữ liệu hơn (free plan giới hạn 10s/request)

**Website không load**
→ Xem logs: Deployments → View Function Logs

**Lỗi 404**
→ Kiểm tra file `vercel.json` đã đúng chưa

## Kết Quả

Sau khi hoàn thành:
- ✅ Website chạy trên Vercel với HTTPS miễn phí
- ✅ URL công khai: https://vibe-shopee.vercel.app
- ✅ Tự động scale khi có nhiều người dùng
- ✅ CDN toàn cầu (load nhanh)
- ✅ Tự động deploy khi push code mới (nếu kết nối Git)

**Chúc bạn deploy thành công! 🚀**

---

## Hỗ Trợ

Nếu gặp vấn đề:
1. Xem logs trên Vercel Dashboard
2. Kiểm tra lại các bước trong hướng dẫn
3. Đọc file `DEPLOY_VERCEL.md` để biết thêm chi tiết