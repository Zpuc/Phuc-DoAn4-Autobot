import ExcelJS from 'exceljs';

const FONT_FAMILY = 'Arial';

// Helper tạo border mỏng thanh lịch
const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

const headerBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'medium', color: { argb: 'FF991B1B' } },
  left: { style: 'thin', color: { argb: 'FFB91C1C' } },
  bottom: { style: 'medium', color: { argb: 'FF991B1B' } },
  right: { style: 'thin', color: { argb: 'FFB91C1C' } },
};

const totalBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'double', color: { argb: 'FF1F2937' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

// Hàm download buffer về trình duyệt
async function saveWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// 1. XUẤT BÁO CÁO DOANH THU & HIỆU QUẢ KINH DOANH
// -------------------------------------------------------------
export async function exportRevenueReportExcel(data: {
  totalProducts: number;
  totalOrders: number;
  statusCounts: Record<string, number>;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  dailyRevenue?: { date: string; label: string; revenue: number; profit: number; ordersCount: number }[];
  monthlyRevenue?: { month: string; label: string; revenue: number; profit: number; ordersCount: number }[];
  lowStockProducts?: { id: string; name: string; sku: string; grade: string | null; quantity: number }[];
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hệ Thống Gundam Autobot Store';
  wb.lastModifiedBy = 'Admin Autobot';
  wb.created = new Date();

  // === SHEET 1: TỔNG QUAN TÀI CHÍNH ===
  const wsKpi = wb.addWorksheet('Tổng Quan Tài Chính', {
    views: [{ showGridLines: true }],
  });

  // Banner Header
  wsKpi.mergeCells('A1:E1');
  const titleCell = wsKpi.getCell('A1');
  titleCell.value = 'HỆ THỐNG CỬA HÀNG GUNDAM AUTOBOT STORE';
  titleCell.font = { name: FONT_FAMILY, size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
  wsKpi.getRow(1).height = 36;

  wsKpi.mergeCells('A2:E2');
  const subTitle = wsKpi.getCell('A2');
  subTitle.value = 'BÁO CÁO HIỆU QUẢ KINH DOANH & TỔNG QUAN DOANH THU TỒN KHO';
  subTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FF1F2937' } };
  subTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  subTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  wsKpi.getRow(2).height = 26;

  wsKpi.mergeCells('A3:E3');
  const metaCell = wsKpi.getCell('A3');
  metaCell.value = `Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Đơn vị tiền tệ: VNĐ (Việt Nam Đồng)`;
  metaCell.font = { name: FONT_FAMILY, size: 9, italic: true, color: { argb: 'FF6B7280' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsKpi.getRow(3).height = 20;

  // Bảng Chỉ số tài chính
  wsKpi.addRow([]);
  const kpiHeaderRow = wsKpi.addRow(['STT', 'CHỈ SỐ TÀI CHÍNH / VẬN HÀNH', 'GIÁ TRỊ THỰC TẾ', 'ĐƠN VỊ TÍNH', 'GHI CHÚ']);
  kpiHeaderRow.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  kpiHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  kpiHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
  kpiHeaderRow.height = 26;

  const profitMargin = data.totalRevenue > 0 ? (data.grossProfit / data.totalRevenue) * 100 : 0;
  const completedOrders = data.statusCounts?.COMPLETED || 0;

  const kpiRows = [
    [1, 'Tổng doanh thu thực tế', data.totalRevenue, 'VNĐ', `Từ ${completedOrders} đơn hàng giao thành công`],
    [2, 'Tổng giá vốn hàng bán (COGS)', data.totalCost, 'VNĐ', 'Chi phí nhập khẩu kit Gunpla'],
    [3, 'Lợi nhuận gộp (Gross Profit)', data.grossProfit, 'VNĐ', 'Doanh thu trừ giá vốn kit'],
    [4, 'Tỉ suất lợi nhuận gộp', profitMargin / 100, '%', 'Hiệu suất sinh lời trên mỗi hộp'],
    [5, 'Tổng số đơn hàng phát sinh', data.totalOrders, 'Đơn', 'Toàn bộ đơn hàng trên hệ thống'],
    [6, 'Số đơn giao thành công (COMPLETED)', completedOrders, 'Đơn', 'Đã nhận tiền và giao hoàn tất'],
    [7, 'Số đơn chờ duyệt (PENDING)', data.statusCounts?.PENDING || 0, 'Đơn', 'Cần gọi điện/Zalo xác nhận'],
    [8, 'Số đơn đang giao (SHIPPING / PACKING)', (data.statusCounts?.SHIPPING || 0) + (data.statusCounts?.PACKING || 0), 'Đơn', 'Đang vận chuyển'],
    [9, 'Số đơn đã hủy (CANCELLED)', data.statusCounts?.CANCELLED || 0, 'Đơn', 'Đã hoàn lại kho'],
    [10, 'Tổng số mã mô hình quản lý', data.totalProducts, 'Mã kit', 'Bandai, Daban, Motor Nuclear, SNAA...'],
  ];

  kpiRows.forEach((r, idx) => {
    const row = wsKpi.addRow(r);
    row.height = 22;
    row.font = { name: FONT_FAMILY, size: 10 };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(2).font = { name: FONT_FAMILY, size: 10, bold: true };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };

    // Format tiền và %
    if (idx === 0 || idx === 1 || idx === 2) {
      row.getCell(3).numFmt = '#,##0 "đ"';
      row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(3).font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: idx === 2 ? 'FF16A34A' : 'FF1F2937' } };
    } else if (idx === 3) {
      row.getCell(3).numFmt = '0.0%';
      row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(3).font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FF7C3AED' } };
    } else {
      row.getCell(3).numFmt = '#,##0';
      row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    }

    const isEven = idx % 2 === 1;
    row.eachCell((cell) => {
      cell.border = thinBorder;
      if (isEven && !cell.fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
    });
  });

  wsKpi.columns = [
    { width: 8 },
    { width: 38 },
    { width: 22 },
    { width: 14 },
    { width: 42 },
  ];

  // === SHEET 2: DOANH THU THEO NGÀY & THÁNG ===
  const wsTimeline = wb.addWorksheet('Doanh Thu Ngày & Tháng', {
    views: [{ showGridLines: true }],
  });

  wsTimeline.mergeCells('A1:E1');
  const tHeader = wsTimeline.getCell('A1');
  tHeader.value = 'THỐNG KÊ DOANH THU & LỢI NHUẬN GỘP THEO THỜI GIAN';
  tHeader.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  tHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  tHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  wsTimeline.getRow(1).height = 30;

  // Bảng theo Ngày
  wsTimeline.addRow([]);
  const secDayRow = wsTimeline.addRow(['I. CHI TIẾT DOANH THU THEO CÁC NGÀY GẦN NHẤT']);
  secDayRow.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FFB91C1C' } };
  wsTimeline.mergeCells(`A${secDayRow.number}:E${secDayRow.number}`);

  const dayHeader = wsTimeline.addRow(['STT', 'NGÀY / THỜI ĐIỂM', 'SỐ ĐƠN HOÀN THÀNH', 'DOANH THU (VNĐ)', 'LỢI NHUẬN GỘP (VNĐ)']);
  dayHeader.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  dayHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  dayHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  dayHeader.height = 24;

  let totalDailyRev = 0;
  let totalDailyProf = 0;
  let totalDailyOrders = 0;

  (data.dailyRevenue || []).forEach((d, idx) => {
    totalDailyRev += d.revenue;
    totalDailyProf += d.profit;
    totalDailyOrders += d.ordersCount;

    const row = wsTimeline.addRow([idx + 1, d.label, d.ordersCount, d.revenue, d.profit]);
    row.height = 20;
    row.font = { name: FONT_FAMILY, size: 10 };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(4).numFmt = '#,##0 "đ"';
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(5).numFmt = '#,##0 "đ"';
    row.getCell(5).font = { name: FONT_FAMILY, size: 10, color: { argb: d.profit >= 0 ? 'FF16A34A' : 'FFDC2626' } };

    row.eachCell((cell) => (cell.border = thinBorder));
  });

  const dailyTotalRow = wsTimeline.addRow(['', 'TỔNG CỘNG THEO NGÀY', totalDailyOrders, totalDailyRev, totalDailyProf]);
  dailyTotalRow.font = { name: FONT_FAMILY, size: 10, bold: true };
  dailyTotalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  dailyTotalRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  dailyTotalRow.getCell(3).numFmt = '#,##0';
  dailyTotalRow.getCell(4).numFmt = '#,##0 "đ"';
  dailyTotalRow.getCell(5).numFmt = '#,##0 "đ"';
  dailyTotalRow.eachCell((cell) => (cell.border = totalBorder));

  // Bảng theo Tháng
  wsTimeline.addRow([]);
  const secMonthRow = wsTimeline.addRow(['II. CHI TIẾT DOANH THU THEO CÁC THÁNG']);
  secMonthRow.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FFB91C1C' } };
  wsTimeline.mergeCells(`A${secMonthRow.number}:E${secMonthRow.number}`);

  const monthHeader = wsTimeline.addRow(['STT', 'THÁNG / NĂM', 'SỐ ĐƠN HOÀN THÀNH', 'DOANH THU (VNĐ)', 'LỢI NHUẬN GỘP (VNĐ)']);
  monthHeader.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  monthHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
  monthHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  monthHeader.height = 24;

  let totalMonthlyRev = 0;
  let totalMonthlyProf = 0;
  let totalMonthlyOrders = 0;

  (data.monthlyRevenue || []).forEach((m, idx) => {
    totalMonthlyRev += m.revenue;
    totalMonthlyProf += m.profit;
    totalMonthlyOrders += m.ordersCount;

    const row = wsTimeline.addRow([idx + 1, m.label, m.ordersCount, m.revenue, m.profit]);
    row.height = 20;
    row.font = { name: FONT_FAMILY, size: 10 };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(3).numFmt = '#,##0';
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(4).numFmt = '#,##0 "đ"';
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(5).numFmt = '#,##0 "đ"';
    row.getCell(5).font = { name: FONT_FAMILY, size: 10, color: { argb: m.profit >= 0 ? 'FF16A34A' : 'FFDC2626' } };

    row.eachCell((cell) => (cell.border = thinBorder));
  });

  const monthTotalRow = wsTimeline.addRow(['', 'TỔNG CỘNG THEO THÁNG', totalMonthlyOrders, totalMonthlyRev, totalMonthlyProf]);
  monthTotalRow.font = { name: FONT_FAMILY, size: 10, bold: true };
  monthTotalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  monthTotalRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  monthTotalRow.getCell(3).numFmt = '#,##0';
  monthTotalRow.getCell(4).numFmt = '#,##0 "đ"';
  monthTotalRow.getCell(5).numFmt = '#,##0 "đ"';
  monthTotalRow.eachCell((cell) => (cell.border = totalBorder));

  wsTimeline.columns = [
    { width: 8 },
    { width: 24 },
    { width: 22 },
    { width: 26 },
    { width: 26 },
  ];

  // === SHEET 3: CẢNH BÁO TỒN KHO THẤP ===
  const wsStock = wb.addWorksheet('Cảnh Báo Tồn Kho', {
    views: [{ showGridLines: true }],
  });

  wsStock.mergeCells('A1:E1');
  const sTitle = wsStock.getCell('A1');
  sTitle.value = 'DANH SÁCH MÔ HÌNH CẦN NHẬP BỔ SUNG (TỒN KHO ≤ 2 HỘP)';
  sTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB45309' } };
  sTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsStock.getRow(1).height = 30;

  wsStock.addRow([]);
  const stockHeader = wsStock.addRow(['STT', 'TÊN MÔ HÌNH GUNDAM', 'MÃ SKU', 'PHÂN KHÚC (GRADE)', 'SỐ LƯỢNG CÒN LẠI']);
  stockHeader.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  stockHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
  stockHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  stockHeader.height = 24;

  (data.lowStockProducts || []).forEach((p, idx) => {
    const row = wsStock.addRow([
      idx + 1,
      p.name,
      p.sku,
      p.grade || 'N/A',
      p.quantity <= 0 ? 'Hết hàng (0 hộp)' : `${p.quantity} hộp`,
    ]);
    row.height = 22;
    row.font = { name: FONT_FAMILY, size: 10 };
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).font = {
      name: FONT_FAMILY,
      size: 10,
      bold: true,
      color: { argb: p.quantity <= 0 ? 'FFDC2626' : 'FFD97706' },
    };

    row.eachCell((cell) => (cell.border = thinBorder));
  });

  wsStock.columns = [
    { width: 8 },
    { width: 44 },
    { width: 22 },
    { width: 20 },
    { width: 24 },
  ];

  await saveWorkbook(wb, `BaoCaoDoanhThu_AUTOBOT_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// -------------------------------------------------------------
// 2. XUẤT DANH SÁCH ĐƠN HÀNG (ORDER MANAGEMENT)
// -------------------------------------------------------------
export async function exportOrdersExcel(orders: Array<{
  code: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  trackingCode?: string;
  note?: string;
  createdAt: string;
  items?: Array<{ productName: string; quantity: number; unitPrice: number }>;
}>) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Gundam Autobot Store';
  wb.created = new Date();

  const ws = wb.addWorksheet('Danh Sách Đơn Hàng', {
    views: [{ showGridLines: true }],
  });

  // Header Tiêu đề
  ws.mergeCells('A1:L1');
  const title = ws.getCell('A1');
  title.value = 'HỆ THỐNG GUNDAM AUTOBOT - BẢNG KÊ QUẢN LÝ ĐƠN ĐẶT HÀNG';
  title.font = { name: FONT_FAMILY, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 34;

  ws.mergeCells('A2:L2');
  const subTitle = ws.getCell('A2');
  subTitle.value = `Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Tổng số đơn: ${orders.length}`;
  subTitle.font = { name: FONT_FAMILY, size: 9, italic: true, color: { argb: 'FF4B5563' } };
  subTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  ws.addRow([]);

  // Header cột
  const headers = [
    'STT',
    'MÃ ĐƠN HÀNG',
    'NGÀY ĐẶT HÀNG',
    'TÊN KHÁCH HÀNG',
    'SỐ ĐIỆN THOẠI',
    'ĐỊA CHỈ GIAO HÀNG',
    'CHI TIẾT SẢN PHẨM',
    'HÌNH THỨC TT',
    'PHÍ SHIP (VNĐ)',
    'TỔNG THANH TOÁN (VNĐ)',
    'TRẠNG THÁI ĐƠN',
    'MÃ VẬN ĐƠN',
  ];

  const headerRow = ws.addRow(headers);
  headerRow.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 26;
  headerRow.eachCell((c) => (c.border = headerBorder));

  const statusLabelMap: Record<string, { label: string; fg: string; bg: string }> = {
    PENDING: { label: 'Chờ xác nhận', fg: 'FFB45309', bg: 'FFFEF3C7' },
    CONFIRMED: { label: 'Đang vận chuyển', fg: 'FF6D28D9', bg: 'FFF3E8FF' },
    PACKING: { label: 'Đang đóng gói', fg: 'FF0369A1', bg: 'FFE0F2FE' },
    SHIPPING: { label: 'Đang giao hàng', fg: 'FF6D28D9', bg: 'FFF3E8FF' },
    COMPLETED: { label: 'Giao hoàn tất', fg: 'FF15803D', bg: 'FFDCFCE7' },
    CANCELLED: { label: 'Đã hủy đơn', fg: 'FFB91C1C', bg: 'FFFEE2E2' },
    RETURNED: { label: 'Hoàn trả', fg: 'FF4B5563', bg: 'FFF3F4F6' },
  };

  let totalSum = 0;
  let totalShipping = 0;

  orders.forEach((o, idx) => {
    totalSum += Number(o.total) || 0;
    totalShipping += Number(o.shippingFee) || 0;

    const itemsSummary = (o.items || [])
      .map((it) => `${it.productName} (x${it.quantity})`)
      .join('; ');

    const stInfo = statusLabelMap[o.status] || { label: o.status, fg: 'FF1F2937', bg: 'FFFFFFFF' };

    const row = ws.addRow([
      idx + 1,
      o.code,
      new Date(o.createdAt).toLocaleDateString('vi-VN'),
      o.customerName,
      o.customerPhone,
      o.shippingAddress,
      itemsSummary || 'Mô hình Gundam',
      o.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản',
      Number(o.shippingFee) || 0,
      Number(o.total) || 0,
      stInfo.label,
      o.trackingCode || '---',
    ]);

    row.height = 22;
    row.font = { name: FONT_FAMILY, size: 9.5 };

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: 'FF1D4ED8' } };
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(4).font = { name: FONT_FAMILY, size: 9.5, bold: true };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    row.getCell(7).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

    row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(9).numFmt = '#,##0 "đ"';

    row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(10).numFmt = '#,##0 "đ"';
    row.getCell(10).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: 'FFB91C1C' } };

    // Badge màu trạng thái
    row.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(11).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: stInfo.fg } };
    row.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: stInfo.bg } };

    row.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };

    const isEven = idx % 2 === 1;
    row.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      if (isEven && colNum !== 11 && !cell.fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
    });
  });

  // Hàng tổng kết
  const summaryRow = ws.addRow([
    '',
    'TỔNG CỘNG',
    `${orders.length} đơn`,
    '',
    '',
    '',
    '',
    '',
    totalShipping,
    totalSum,
    '',
    '',
  ]);
  summaryRow.height = 26;
  summaryRow.font = { name: FONT_FAMILY, size: 10, bold: true };
  summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  summaryRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  summaryRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
  summaryRow.getCell(9).numFmt = '#,##0 "đ"';
  summaryRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
  summaryRow.getCell(10).numFmt = '#,##0 "đ"';
  summaryRow.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
  summaryRow.getCell(10).font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FFB91C1C' } };
  summaryRow.eachCell((c) => (c.border = totalBorder));

  ws.columns = [
    { width: 6 },
    { width: 17 },
    { width: 14 },
    { width: 22 },
    { width: 15 },
    { width: 34 },
    { width: 34 },
    { width: 17 },
    { width: 16 },
    { width: 24 },
    { width: 18 },
    { width: 18 },
  ];

  await saveWorkbook(wb, `DanhSachDonHang_AUTOBOT_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// -------------------------------------------------------------
// 3. XUẤT KIỂM KÊ TỒN KHO & LỊCH SỬ KHO (INVENTORY MANAGEMENT)
// -------------------------------------------------------------
export async function exportInventoryExcel(
  items: Array<{
    name: string;
    sku: string;
    grade?: string | null;
    scale?: string | null;
    brand?: string;
    category?: string;
    quantity: number;
    minStock: number;
    currentPrice: number;
    costPrice: number;
    stockStatus: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    updatedAt?: string;
  }>,
  logs?: Array<{
    createdAt: string;
    product?: { name: string; sku: string; grade?: string | null };
    change: number;
    reason: string;
    refId?: string | null;
  }>,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Gundam Autobot Store';
  wb.created = new Date();

  // === SHEET 1: BẢNG KIỂM KÊ TỒN KHO ===
  const wsInv = wb.addWorksheet('Kiểm Kê Tồn Kho', {
    views: [{ showGridLines: true }],
  });

  wsInv.mergeCells('A1:L1');
  const invTitle = wsInv.getCell('A1');
  invTitle.value = 'HỆ THỐNG GUNDAM AUTOBOT - BẢNG KIỂM KÊ & ĐỊNH GIÁ TỒN KHO';
  invTitle.font = { name: FONT_FAMILY, size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  invTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  invTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsInv.getRow(1).height = 34;

  wsInv.mergeCells('A2:L2');
  const invSub = wsInv.getCell('A2');
  invSub.value = `Thời gian kết xuất: ${new Date().toLocaleString('vi-VN')} | Tổng mã quản lý: ${items.length} kit`;
  invSub.font = { name: FONT_FAMILY, size: 9, italic: true, color: { argb: 'FF4B5563' } };
  invSub.alignment = { horizontal: 'center', vertical: 'middle' };
  wsInv.getRow(2).height = 20;

  wsInv.addRow([]);

  const invHeaders = [
    'STT',
    'TÊN MÔ HÌNH GUNPLA',
    'MÃ SKU',
    'GRADE',
    'TỈ LỆ',
    'HÃNG SX',
    'TỒN KHO (HỘP)',
    'TỒN TỐI THIỂU',
    'TRẠNG THÁI',
    'GIÁ VỐN (VNĐ)',
    'GIÁ BÁN (VNĐ)',
    'TỔNG GIÁ TRỊ VỐN TỒN',
  ];

  const invHeaderRow = wsInv.addRow(invHeaders);
  invHeaderRow.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  invHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  invHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  invHeaderRow.height = 26;
  invHeaderRow.eachCell((c) => (c.border = headerBorder));

  let totalQty = 0;
  let totalCostValue = 0;

  items.forEach((it, idx) => {
    totalQty += it.quantity || 0;
    const itemCostTotal = (it.quantity || 0) * (it.costPrice || 0);
    totalCostValue += itemCostTotal;

    const statusText =
      it.stockStatus === 'OUT_OF_STOCK'
        ? 'HẾT HÀNG'
        : it.stockStatus === 'LOW_STOCK'
        ? 'SẮP HẾT'
        : 'ĐỦ HÀNG';

    const row = wsInv.addRow([
      idx + 1,
      it.name,
      it.sku,
      it.grade || 'Gunpla',
      it.scale || 'N/A',
      it.brand || 'Bandai',
      it.quantity,
      it.minStock,
      statusText,
      it.costPrice || 0,
      it.currentPrice || 0,
      itemCostTotal,
    ]);

    row.height = 22;
    row.font = { name: FONT_FAMILY, size: 9.5 };

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(2).font = { name: FONT_FAMILY, size: 9.5, bold: true };
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };

    row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(7).numFmt = '#,##0';
    row.getCell(7).font = {
      name: FONT_FAMILY,
      size: 9.5,
      bold: true,
      color: { argb: it.quantity <= 0 ? 'FFDC2626' : it.quantity <= it.minStock ? 'FFD97706' : 'FF15803D' },
    };

    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(8).numFmt = '#,##0';

    row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(9).font = {
      name: FONT_FAMILY,
      size: 9,
      bold: true,
      color: { argb: it.stockStatus === 'OUT_OF_STOCK' ? 'FFDC2626' : it.stockStatus === 'LOW_STOCK' ? 'FFD97706' : 'FF16A34A' },
    };

    row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(10).numFmt = '#,##0 "đ"';

    row.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(11).numFmt = '#,##0 "đ"';
    row.getCell(11).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: 'FFDC2626' } };

    row.getCell(12).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(12).numFmt = '#,##0 "đ"';
    row.getCell(12).font = { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: 'FF1E40AF' } };

    const isEven = idx % 2 === 1;
    row.eachCell((cell) => {
      cell.border = thinBorder;
      if (isEven && !cell.fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
    });
  });

  // Hàng tổng kết tồn kho
  const invSummary = wsInv.addRow([
    '',
    'TỔNG GIÁ TRỊ TỒN KHO TOÀN CỬA HÀNG',
    '',
    '',
    '',
    '',
    totalQty,
    '',
    '',
    '',
    '',
    totalCostValue,
  ]);
  invSummary.height = 26;
  invSummary.font = { name: FONT_FAMILY, size: 10, bold: true };
  invSummary.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  invSummary.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  invSummary.getCell(7).numFmt = '#,##0';
  invSummary.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
  invSummary.getCell(12).numFmt = '#,##0 "đ"';
  invSummary.getCell(12).alignment = { horizontal: 'right', vertical: 'middle' };
  invSummary.getCell(12).font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FF1E40AF' } };
  invSummary.eachCell((c) => (c.border = totalBorder));

  wsInv.columns = [
    { width: 6 },
    { width: 38 },
    { width: 20 },
    { width: 14 },
    { width: 12 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 24 },
  ];

  // === SHEET 2: LỊCH SỬ BIẾN ĐỘNG KHO (NẾU CÓ) ===
  if (logs && logs.length > 0) {
    const wsLogs = wb.addWorksheet('Lịch Sử Biến Động Kho', {
      views: [{ showGridLines: true }],
    });

    wsLogs.mergeCells('A1:F1');
    const logTitle = wsLogs.getCell('A1');
    logTitle.value = 'NHẬT KÝ BIẾN ĐỘNG XUẤT - NHẬP - KIỂM KÊ KHO GUNDAM';
    logTitle.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    logTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
    logTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    wsLogs.getRow(1).height = 30;

    wsLogs.addRow([]);

    const logHeaders = ['STT', 'THỜI GIAN', 'MÔ HÌNH GUNDAM', 'MÃ SKU', 'BIẾN ĐỘNG (HỘP)', 'LÝ DO / MÃ THAM CHIẾU'];
    const logHeaderRow = wsLogs.addRow(logHeaders);
    logHeaderRow.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    logHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } };
    logHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
    logHeaderRow.height = 24;
    logHeaderRow.eachCell((c) => (c.border = headerBorder));

    const reasonLabelMap: Record<string, string> = {
      IMPORT: 'Nhập hàng vào kho',
      SALE: 'Xuất bán theo đơn',
      ORDER_PLACED: 'Khách đặt đơn',
      RETURN: 'Hủy đơn hoàn trả kho',
      ADJUST: 'Kiểm kê kho định kỳ',
      DAMAGE: 'Hư hỏng / Hao hụt',
      INITIAL: 'Khởi tạo ban đầu',
    };

    logs.forEach((l, idx) => {
      const reasonLabel = reasonLabelMap[l.reason] || l.reason;
      const refText = l.refId ? ` [${l.refId}]` : '';

      const row = wsLogs.addRow([
        idx + 1,
        new Date(l.createdAt).toLocaleString('vi-VN'),
        l.product?.name || 'N/A',
        l.product?.sku || '---',
        l.change,
        `${reasonLabel}${refText}`,
      ]);

      row.height = 20;
      row.font = { name: FONT_FAMILY, size: 9.5 };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

      row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(5).numFmt = '+#,##0;-#,##0;0';
      row.getCell(5).font = {
        name: FONT_FAMILY,
        size: 10,
        bold: true,
        color: { argb: l.change > 0 ? 'FF16A34A' : 'FFDC2626' },
      };

      row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };

      row.eachCell((c) => (c.border = thinBorder));
    });

    wsLogs.columns = [
      { width: 6 },
      { width: 22 },
      { width: 38 },
      { width: 20 },
      { width: 18 },
      { width: 38 },
    ];
  }

  await saveWorkbook(wb, `KiemKeTonKho_AUTOBOT_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
