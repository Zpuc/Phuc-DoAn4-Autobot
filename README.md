# 🤖 GUNDAM AUTOBOT STORE — Hệ Thống Phân Phối & Quản Trị Mô Hình Gunpla

Hệ thống thương mại điện tử và quản trị kho hàng mô hình lắp ráp **Gundam / Gunpla** (HG, RG, MG, PG, SD, Metal Build), phát triển theo kiến trúc Fullstack hiện đại phục vụ tuyến phân phối chuyên biệt **Hà Nội – Hưng Yên** và toàn quốc.

---

## 🛠️ Công Nghệ Sử Dụng

| Phân hệ | Công nghệ & Thư viện |
| :--- | :--- |
| **Backend API** | NestJS 11, TypeScript, Prisma ORM, JWT Passport, Class-Validator, Throttler, Swagger OpenAPI |
| **Frontend UI** | React 19, Vite 6, TypeScript, Ant Design v6 (`antd` + `@ant-design/icons`), Zustand, ExcelJS |
| **Cơ sở dữ liệu** | PostgreSQL 16+ (Hỗ trợ Atomic Transaction trừ/hoàn kho & ghi vết lịch sử biến động giá) |
| **Triển khai** | Docker & Docker Compose, Nginx Reverse Proxy, Cloudflare Quick Tunnel |

---

## ✨ Tính Năng Nổi Bật

### 1. Phân hệ Khách hàng (Storefront)
- **Danh mục & Bộ lọc chuyên sâu**: Tìm kiếm, lọc đa tiêu chí theo Phân khúc (`HG`, `RG`, `MG`, `PG`, `SD`, `MB`), Tỉ lệ (`1/144`, `1/100`, `1/60`), Hãng sản xuất, Khoảng giá và Trạng thái hàng có sẵn / Pre-order.
- **Chi tiết sản phẩm & Biến động giá**: Xem thông số kỹ thuật, lịch sử điều chỉnh giá theo từng đợt nhập hàng, đánh giá thực tế kèm hình ảnh từ người mua đã hoàn thành đơn.
- **Giỏ hàng, Sổ địa chỉ & Voucher**: Quản lý giỏ hàng, lưu nhiều địa chỉ nhận hàng, áp dụng mã giảm giá (`PERCENT` / `FIXED_AMOUNT`), tự động tính phí vận chuyển theo khu vực.
- **Tra cứu lộ trình & Thông báo**: Tra cứu tiến độ đơn hàng theo mã `AG-YYMMDD-XXX`, nhận thông báo tự động khi trạng thái đơn thay đổi và chủ động hủy đơn khi đang chờ xác nhận (tự động hoàn kho).
- **Tư vấn & Báo giá trực tiếp**: Hỗ trợ kết nối nhanh qua Zalo / Facebook / Hotline đối với các mẫu hiếm và hàng đặt trước.

### 2. Phân hệ Quản trị viên (Admin Dashboard)
- **Tổng quan & Chuông thông báo thời gian thực**: Theo dõi KPI doanh thu, lợi nhuận gộp, nhận cảnh báo tức thì khi có đơn mới chờ duyệt hoặc mô hình chạm ngưỡng sắp hết hàng (`≤ 3 hộp`).
- **Quản lý Khách hàng & Phân hạng VIP**: Tự động xếp hạng thành viên (*Thành Viên Mới*, *Thành Viên Bạc*, *VIP Vàng*, *VIP Kim Cương*) dựa trên chi tiêu tích lũy; phân quyền tài khoản.
- **Quản lý Sản phẩm & Tồn kho**: CRUD mô hình, nhập hàng bổ sung, kiểm kê kho định kỳ, lưu nhật ký xuất – nhập – hoàn kho chi tiết.
- **Quản lý Đơn hàng & Tiến độ giao**: Duyệt đơn, gắn mã vận đơn bưu cục, **In phiếu giao hàng / hóa đơn đóng gói** trực tiếp.
- **Xuất báo cáo Excel chuyên nghiệp**: Xuất báo cáo tài chính, danh sách đơn hàng, biên bản kiểm kê kho và danh sách thành viên chuẩn định dạng `.xlsx`.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Nhanh

### Cách 1: Chạy trực tiếp trên môi trường máy trạm (Local)

```bash
# 1. Cài đặt thư viện
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. Đồng bộ schema và nạp dữ liệu mẫu vào PostgreSQL
cd backend
npx prisma migrate dev
npm run seed
cd ..

# 3. Khởi chạy đồng thời cả Backend (Port 3000) và Frontend (Port 5173)
npm run dev
```

- **Trang cửa hàng**: `http://localhost:5173`
- **Trang quản trị Admin**: `http://localhost:5173/admin`
- **Tài liệu API Swagger**: `http://localhost:3000/api/docs`
- **Mở link công khai chia sẻ qua Internet**: `npm run public`

### Cách 2: Chạy đóng gói bằng Docker Compose

```bash
docker compose up -d --build
```

---

## 🔑 Tài Khoản Trải Nghiệm Mẫu (Seed Data)

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@autobot.vn` | `Admin123@` |
| **Khách hàng (Customer)** | `customer@autobot.vn` | `Customer123@` |

---

## 🧪 Kiểm Thử Tự Động

```bash
# Kiểm thử luồng Transaction Đặt hàng - Trừ kho - Hủy đơn hoàn kho
npm --prefix backend run test:flow
```
