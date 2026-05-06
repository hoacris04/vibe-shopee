# 📖 Hướng Dẫn Sử Dụng - Quản Lý Đơn Hàng Shopee

## 🚀 Khởi Động Ứng Dụng

1. Cài đặt dependencies:
```bash
npm install
```

2. Khởi động server:
```bash
node server.js
```

3. Mở trình duyệt và truy cập: `http://localhost:3000`

---

## ✨ Tính Năng Mới

### 1. 📊 Sắp Xếp Theo Cột (Sortable Columns)

**Cách sử dụng:**
- Click vào **tiêu đề cột** bất kỳ để sắp xếp
- Click lần 1: Sắp xếp **tăng dần** (A→Z, 0→9) ▲
- Click lần 2: Sắp xếp **giảm dần** (Z→A, 9→0) ▼
- Click lần 3: Quay lại sắp xếp tăng dần

**Các cột có thể sắp xếp:**
- ✅ Tên Người Nhận
- ✅ Địa Chỉ
- ✅ Tên Sản Phẩm
- ✅ Phân Loại
- ✅ Số Lượng (sắp xếp theo số)
- ✅ Ngày Đặt (sắp xếp theo ngày)
- ✅ Trạng Thái
- ✅ Mã Vận Đơn
- ✅ Thanh Toán

**Lưu ý:**
- Biểu tượng ⇅ xuất hiện trên các cột có thể sắp xếp
- Cột đang được sắp xếp sẽ hiển thị mũi tên ▲ hoặc ▼

---

### 2. ✏️ Chỉnh Sửa Trực Tiếp (Inline Editing)

**Cách sử dụng:**
1. **Double-click** (nhấp đúp) vào ô cần chỉnh sửa
2. Ô sẽ chuyển thành:
   - **Input text** (cho các trường văn bản)
   - **Dropdown** (cho Trạng Thái và Thanh Toán)
3. Chỉnh sửa nội dung
4. Lưu thay đổi:
   - Nhấn **Enter** để lưu
   - Click ra ngoài (blur) để lưu
   - Nhấn **Escape** để hủy

**Các trường có thể chỉnh sửa trực tiếp:**
- ✅ Tên Người Nhận
- ✅ Địa Chỉ
- ✅ Tên Sản Phẩm
- ✅ Phân Loại
- ✅ Số Lượng
- ✅ Ngày Đặt
- ✅ Trạng Thái (dropdown: Chờ đặt, Đang giao hàng, Giao thành Công, Bị hủy)
- ✅ Mã Vận Đơn
- ✅ Thanh Toán (dropdown: Đã thanh toán, Chưa thanh toán, Tự đặt)

**Lưu ý:**
- Khi hover vào ô có thể chỉnh sửa, sẽ xuất hiện icon ✏️
- Dòng đang chỉnh sửa sẽ có màu nền xanh nhạt
- Thay đổi được lưu **tự động** vào database
- Nếu có lỗi, thay đổi sẽ bị hủy và hiển thị thông báo

---

## 🎯 Các Tính Năng Khác

### 3. 🔍 Tìm Kiếm và Lọc

**Tìm kiếm:**
- Nhập từ khóa vào ô "🔍 Tìm kiếm đơn hàng..."
- Tìm kiếm trong: Tên người nhận, Địa chỉ, Tên sản phẩm, Mã vận đơn

**Lọc:**
- **Lọc theo trạng thái:** Chọn trạng thái đơn hàng
- **Lọc thanh toán:** Chọn trạng thái thanh toán
- **Sắp xếp theo:** Chọn tiêu chí sắp xếp từ dropdown

**Đặt lại bộ lọc:**
- Click nút "🔄 Đặt lại" để xóa tất cả bộ lọc

---

### 4. 📥 Import Dữ Liệu

**Cách import từ Excel/Google Sheets:**
1. Copy dữ liệu từ Excel/Google Sheets (bao gồm cả tiêu đề)
2. Click nút "📥 Import Dữ Liệu"
3. Paste vào ô textarea
4. Click "Import"

**Format dữ liệu:**
```
Tên người nhận	Địa chỉ	Tên sản phẩm	Phân loại	Số lượng	Ngày đặt	Trạng thái	Mã vận đơn	Thông tin chi tiết đơn hàng	Thanh toán
bún bò tuan tu	50/40, Mễ Trì Thượng...	Thịt chua		2	14/04/2026	Giao thành Công	SPXVN063805010604	16:07:18 17 Apr 2026...	Đã thanh toán
```

**Lưu ý:**
- Dữ liệu phải được phân tách bằng **Tab** (TSV format)
- Dòng đầu tiên là tiêu đề (sẽ được bỏ qua)
- Hệ thống tự động phát hiện và bỏ qua dòng tiêu đề

---

### 5. 🔄 Cập Nhật Tracking

**Tự động:**
- Hệ thống tự động cập nhật tracking mỗi **30 phút**
- Chỉ cập nhật các đơn có mã vận đơn SPX

**Thủ công:**
- Click nút "🔄" bên cạnh mỗi đơn hàng để cập nhật riêng lẻ
- Click nút "🔄 Cập Nhật Tất Cả Tracking" để cập nhật tất cả

**Thông tin tracking:**
- Hiển thị trạng thái mới nhất từ SPX
- Format: `HH:mm:ss dd MMM yyyy Mô tả trạng thái`

---

### 6. ➕ Thêm/Sửa/Xóa Đơn Hàng

**Thêm đơn hàng:**
1. Click nút "➕ Thêm Đơn Hàng"
2. Điền thông tin vào form
3. Click "Lưu"

**Sửa đơn hàng:**
- **Cách 1:** Double-click vào ô cần sửa (inline editing)
- **Cách 2:** Click nút "✏️ Sửa" để mở form chỉnh sửa

**Xóa đơn hàng:**
- Click nút "🗑️" và xác nhận

---

## 💡 Tips & Tricks

### Phím tắt khi chỉnh sửa inline:
- **Enter**: Lưu thay đổi
- **Escape**: Hủy thay đổi
- **Tab**: Chuyển sang ô tiếp theo (sau khi lưu)

### Tối ưu hiệu suất:
- Sử dụng inline editing cho thay đổi nhanh
- Sử dụng form modal cho thay đổi nhiều trường cùng lúc
- Import hàng loạt cho dữ liệu lớn

### Sắp xếp thông minh:
- Kết hợp sắp xếp cột với bộ lọc để tìm đơn hàng nhanh hơn
- Ví dụ: Lọc "Chờ đặt" → Sắp xếp theo "Ngày đặt (cũ)" để xem đơn cũ nhất

---

## 🐛 Xử Lý Lỗi

### Lỗi kết nối database:
```
Error: connect ECONNREFUSED
```
**Giải pháp:** Kiểm tra thông tin kết nối MySQL trong `server.js`

### Lỗi port đã được sử dụng:
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Giải pháp:** 
- Tắt process đang chạy trên port 3000
- Hoặc đổi port trong `server.js`

### Lỗi inline editing không lưu:
**Giải pháp:**
- Kiểm tra console browser (F12)
- Đảm bảo server đang chạy
- Thử hard refresh (Ctrl+Shift+R)

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console browser (F12)
2. Kiểm tra log server
3. Đọc lại hướng dẫn này

---

## 🎉 Chúc Bạn Sử Dụng Hiệu Quả!