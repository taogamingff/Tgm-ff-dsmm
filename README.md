# Free Fire Wishlist Manager v2.0

Hệ thống quản lý Wishlist Free Fire cho Server Việt Nam
Phiên bản: OB54 - OB90 | Năm 2026 - 2030

## 🎮 Tính năng chính
- ✅ Đăng nhập với thông tin người chơi
- ✅ Quản lý Wishlist (tối đa 100 vật phẩm)
- ✅ Thêm/xóa vật phẩm theo ID
- ✅ **Tự động nhận dạng item từ API** (ff-item.netlify.app)
- ✅ Hiển thị hình ảnh và tên item
- ✅ Preview item trước khi thêm
- ✅ Lưu cache để tối ưu hiệu suất
- ✅ Giao diện chuyên nghiệp theo phong cách Free Fire

## 🔌 API Integration
- **API Endpoint**: `https://ff-item.netlify.app/?iid=IDITEM`
- **Parameters**: `iid` (ID item), `iname` (tên item), `iicon` (icon item)
- **Cache**: Lưu cache local để tăng tốc độ

## 🚀 Cài đặt

### Yêu cầu
- Node.js
- Vercel CLI
- GitHub Account

### Bước 1: Tạo Repository trên GitHub
1. Tạo repository mới trên GitHub
2. Upload tất cả files
3. Commit và push

### Bước 2: Deploy lên Vercel
1. Truy cập vercel.com
2. Kết nối GitHub
3. Import repository
4. Deploy

## 📱 Hướng dẫn sử dụng
1. Nhập thông tin đăng nhập
2. Nhập ID item (9 số) để xem preview
3. Click "+" để thêm vào wishlist
4. Click "🗑" để xóa item
5. Click "🗑 Xóa Tất Cả" để xóa toàn bộ

## 🔒 Bảo mật
- Dữ liệu được lưu trữ local
- Không gửi thông tin ra ngoài
- Session tự động hết hạn sau 24 giờ

## 📊 Thông số
- Tối đa: 100 vật phẩm
- Hiển thị: 4x4 grid
- Server: Việt Nam
- API: ff-item.netlify.app