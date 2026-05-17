/**
 * Central Mock Data for Yến Sào Vĩnh Hưng CRM
 */
const CRM_DATA = {
    customers: [
        { id: 1, name: "Nguyễn Thùy Linh", company: "TNHH Thực Phẩm Hương Việt", type: "Đại lý", products: ["Yến tinh chế", "Yến chưng"], value: 280000000, status: "Đang tư vấn", phone: "0901234567", email: "linh.nt@huongviet.vn" },
        { id: 2, name: "Trần Minh Quân", company: "CP TM & DV An Phát", type: "Đại lý", products: ["Yến thô", "Yến tinh chế"], value: 450000000, status: "Mới", phone: "0912345678", email: "quan.tm@anphat.com" },
        { id: 3, name: "Lê Bảo Anh", company: "Cá nhân (Khách VIP)", type: "VIP", products: ["Yến chưng cao cấp", "Yến tinh chế"], value: 650000000, status: "Báo giá", phone: "0988888888", email: "baoanh.le@gmail.com" },
        { id: 4, name: "Phạm Ngọc Hưng", company: "TNHH Du Lịch & Sự Kiện Sài Gòn Event", type: "Đại lý", products: ["Yến chưng", "Yến tinh chế"], value: 320000000, status: "Đàm phán", phone: "0933445566", email: "hung.pn@saigonevent.com" },
        { id: 5, name: "Vũ Thu Trang", company: "Đặc sản An Nhiên", type: "Đại lý", products: ["Yến thô", "Yến chưng"], value: 210000000, status: "Chốt đơn", phone: "0944556677", email: "trang.vt@annhien.vn" },
        { id: 6, name: "Đặng Quốc Khánh", company: "Cá nhân", type: "Khách lẻ", products: ["Yến chưng (set tháng)", "Yến tinh chế"], value: 35000000, status: "Thất bại", phone: "0955667788", email: "khanh.dq@outlook.com" }
    ],
    tasks: [
        { id: 1, title: "Gọi tư vấn gói đại lý Hương Việt", customer: "Nguyễn Thùy Linh", priority: "Cao", deadline: "16:00 Hôm nay", status: "Chưa làm" },
        { id: 2, title: "Gửi báo giá combo Sài Gòn Event", customer: "Phạm Ngọc Hưng", priority: "Cao", deadline: "11:00 Ngày mai", status: "Chưa làm" },
        { id: 3, title: "Hẹn gặp thử sản phẩm tại An Nhiên", customer: "Vũ Thu Trang", priority: "Trung bình", deadline: "15:00 18/05", status: "Đang làm" },
        { id: 4, title: "Gọi chăm sóc đơn lặp lại anh Khánh", customer: "Đặng Quốc Khánh", priority: "Trung bình", deadline: "10:00 25/05", status: "Đã xong" },
        { id: 5, title: "Gửi catalog sản phẩm mới chị Bảo Anh", customer: "Lê Bảo Anh", priority: "Thấp", deadline: "09:00 22/05", status: "Chưa làm" }
    ],
    payments: [
        { id: 1, customer: "Vũ Thu Trang", amount: 210000000, method: "Chuyển khoản", status: "Đã thanh toán", date: "15/05/2026" },
        { id: 2, customer: "Lê Bảo Anh", amount: 65000000, method: "Tiền mặt", status: "Chờ thanh toán", date: "14/05/2026" },
        { id: 3, customer: "Nguyễn Thùy Linh", amount: 50000000, method: "COD", status: "Đã cọc", date: "13/05/2026" }
    ],
    stats: {
        newLeads: 24,
        openOps: 15,
        pipelineValue: 1850000000,
        monthlyRevenue: 450000000,
        revenueTarget: 85
    }
};

window.CRM_DATA = CRM_DATA;
