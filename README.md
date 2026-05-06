# 🛍️ Vibe Shopee - Hệ Thống Quản Lý Đơn Hàng Shopee

Ứng dụng web quản lý đơn hàng Shopee với tính năng tự động cập nhật trạng thái vận chuyển từ SPX.

## ✨ Tính Năng

### 📦 Quản Lý Đơn Hàng
- Thêm, sửa, xóa đơn hàng
- Theo dõi trạng thái đơn hàng (Chờ đặt, Đang giao hàng, Giao thành công, Bị hủy)
- Quản lý thông tin người nhận, địa chỉ, sản phẩm
- Theo dõi mã vận đơn và trạng thái thanh toán
- Tìm kiếm và lọc đơn hàng nhanh chóng
- **✏️ Chỉnh sửa trực tiếp trên bảng (Inline Editing)** - Double-click vào ô để sửa
- **📊 Sắp xếp theo cột** - Click vào tiêu đề cột để sắp xếp tăng/giảm dần
- **📥 Import hàng loạt** - Import dữ liệu từ Excel/Google Sheets

### 📊 Quản Lý Sản Phẩm
- Thêm, sửa, xóa sản phẩm
- Quản lý phân loại, số lượng
- Lưu link sản phẩm và mã giảm giá
- Tìm kiếm sản phẩm

### 🔄 Tự Động Cập Nhật Tracking
- Tích hợp API SPX để lấy thông tin vận chuyển
- Cập nhật thủ công từng đơn hàng
- Cập nhật hàng loạt tất cả đơn hàng
- Tự động cập nhật mỗi 30 phút

## 🚀 Cài Đặt

### Yêu Cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Clone hoặc tải project**
```bash
cd vibe-shopee
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
npm start
```

Hoặc chạy ở chế độ development với auto-reload:
```bash
npm run dev
```

4. **Truy cập ứng dụng**
Mở trình duyệt và truy cập: `http://localhost:3000`

## 📁 Cấu Trúc Project

```
vibe-shopee/
├── server.js                  # Backend server (Express + MySQL)
├── package.json               # Dependencies
├── HUONG_DAN_SU_DUNG.md      # Hướng dẫn chi tiết
├── sample_import_data.txt     # Dữ liệu mẫu để import
├── public/
│   ├── index.html            # Giao diện chính
│   ├── styles.css            # CSS styling (với inline editing & sortable)
│   └── app.js                # Frontend JavaScript (với inline editing)
└── README.md                 # Tài liệu này
```

## 💾 Database Schema

### Bảng `orders`
- id (PRIMARY KEY)
- recipient_name (Tên người nhận)
- address (Địa chỉ)
- product_name (Tên sản phẩm)
- product_category (Phân loại)
- quantity (Số lượng)
- order_date (Ngày đặt)
- status (Trạng thái)
- tracking_number (Mã vận đơn)
- tracking_info (Thông tin chi tiết)
- payment_status (Thanh toán)
- created_at, updated_at (Timestamps)

### Bảng `products`
- id (PRIMARY KEY)
- name (Tên sản phẩm)
- category (Phân loại)
- quantity (Số lượng)
- link (Link sản phẩm)
- discount_code (Mã giảm giá)
- created_at (Timestamp)

## 🔌 API Endpoints

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `DELETE /api/orders/:id` - Xóa đơn hàng
- `POST /api/orders/:id/update-tracking` - Cập nhật tracking cho 1 đơn
- `POST /api/orders/update-all-tracking` - Cập nhật tracking cho tất cả

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

## 🎨 Giao Diện

- **Responsive Design**: Hoạt động tốt trên desktop và mobile
- **Modern UI**: Gradient màu đẹp mắt, animations mượt mà
- **User-Friendly**: Dễ sử dụng với các nút bấm trực quan
- **Inline Editing**: Double-click vào ô để chỉnh sửa trực tiếp
- **Sortable Columns**: Click vào tiêu đề cột để sắp xếp
- **Visual Feedback**: Hiệu ứng hover, icon gợi ý, màu sắc trực quan

## ⚙️ Cấu Hình

### Thay đổi Port
Mặc định server chạy trên port 3000. Để thay đổi, sửa trong `server.js`:
```javascript
const PORT = 3000; // Đổi thành port khác
```

### Thay đổi tần suất auto-update
Mặc định cập nhật mỗi 30 phút. Để thay đổi, sửa trong `server.js`:
```javascript
cron.schedule('*/30 * * * *', async () => { // Đổi */30 thành số phút khác
```

## 🐛 Xử Lý Lỗi

- Nếu không kết nối được database: Kiểm tra quyền ghi file trong thư mục
- Nếu không cập nhật được tracking: Kiểm tra kết nối internet và mã vận đơn
- Nếu lỗi CORS: Đảm bảo frontend và backend cùng domain hoặc đã cấu hình CORS

## 📝 Ghi Chú

- Database MySQL được kết nối qua online server
- Tracking info được lưu vào database để giảm số lần gọi API
- Auto-update chạy ngầm mỗi 30 phút
- Inline editing tự động lưu thay đổi vào database
- Sortable columns hoạt động với tất cả các cột có thể sắp xếp
- Hỗ trợ tiếng Việt với UTF-8 encoding

## 📖 Hướng Dẫn Sử Dụng Chi Tiết

Xem file [HUONG_DAN_SU_DUNG.md](HUONG_DAN_SU_DUNG.md) để biết:
- Cách sử dụng inline editing (double-click để sửa)
- Cách sắp xếp theo cột (click vào tiêu đề)
- Cách import dữ liệu từ Excel/Google Sheets
- Tips & tricks để sử dụng hiệu quả
- Xử lý lỗi thường gặp

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License

---

**Phát triển bởi Tuantx** 🚀