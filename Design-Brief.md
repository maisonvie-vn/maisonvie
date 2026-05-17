<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Dựa trên PRD và tài liệu xác nhận tính năng đã chốt, hãy tạo một Design Brief hoàn chỉnh cho CRM Yến Sào Vĩnh Hưng.

Yêu cầu phong cách:

- Tối giản
- Kính mờ nhẹ
- Font mỏng, hiện đại
- Nhiều khoảng trắng
- Chỉ dùng 1 màu accent chính
- Tone màu lấy cảm hứng từ yến sào: vàng kem, nâu vàng ấm, nền sáng tối giản

Design Brief cần có:

1. Color palette
2. Typography
3. Layout structure cho các trang: Tổng quan, Cơ hội bán hàng, Công việc, Danh sách, Thanh toán, Cài đặt
4. Component style: Card, Button, Input, Badge, Sidebar, Kanban card
5. Dữ liệu mẫu cho Yến Sào Vĩnh Hưng:

- 6 khách hàng tiềm năng: tên người thật Việt Nam, công ty thật, phân khúc và sản phẩm quan tâm khác nhau, giá trị đơn hàng dự kiến bằng VND
- 5 công việc: liên quan đến bán yến sào, có priority và deadline thực tế
- 3 danh sách khách hàng: tên phù hợp với cách phân nhóm của Yến Sào Vĩnh Hưng

Dưới đây là Design Brief hoàn chỉnh cho CRM Yến Sào Vĩnh Hưng, bám đúng phong cách: tối giản, kính mờ nhẹ, font mỏng hiện đại, nhiều khoảng trắng, một màu accent chính, tone vàng kem – nâu vàng ấm trên nền sáng. Tham khảo các best-practice glassmorphism và dashboard CRM nhưng điều chỉnh để phù hợp yêu cầu tối giản, dễ đọc.[^1][^2]

***

## 1. Color palette

Nguyên tắc chung:

- Nền sáng, rất nhiều khoảng trắng.
- Một màu accent chính (vàng ấm) dùng cho điểm nhấn: button chính, link chính, trạng thái tích cực.
- Các lớp kính mờ dùng nền trắng/nâu rất nhạt với opacity và blur nhẹ, viền mỏng.

Đề xuất palette:

- Nền chính (Background):
    - Mã: `#F9F5EE` – vàng kem rất nhạt, gợi cảm giác yến sào, sạch và ấm.[^3]
- Layer kính mờ (Glass surface):
    - Mã: `#FFFFFF` với opacity 80–90%, blur nền nhẹ (8–12px), viền 1px màu `rgba(255,255,255,0.6)` hoặc `rgba(215, 195, 160, 0.4)`.[^1]
- Màu accent chính (Primary accent – dùng duy nhất cho trọng tâm):
    - Mã: `#C89A3D` – vàng nâu ấm, gợi ánh vàng của yến sào cao cấp, sử dụng cho: nút chính, biểu đồ chính, trạng thái tích cực, highlight.[^4][^5]
- Màu chữ chính (Text primary):
    - Mã: `#3F3A33` – nâu đậm, thay cho đen, tạo cảm giác mềm và cao cấp.
- Màu chữ phụ / mô tả (Text secondary):
    - Mã: `#8B8375` – nâu xám nhạt.
- Đường phân chia / border nhẹ:
    - Mã: `#E3D7C8` – line rất nhạt cho bảng và card.
- Trạng thái cảnh báo (Warning, không phải accent chính):
    - Mã: `#D96C3F` – cam đất, chỉ dùng cho text/badge cảnh báo nhỏ, không cạnh tranh với accent chính.

Quy tắc sử dụng màu:

- Accent `#C89A3D` chỉ dùng cho: Button chính, icon chính trên dashboard, selected state, tag VIP, đường biểu đồ chính.
- Không dùng nhiều màu sặc sỡ khác, giữ palette ấm, ít màu, nhiều khoảng trống.[^2]

***

## 2. Typography

Phong cách: font mỏng, hiện đại, dễ đọc, hỗ trợ tiếng Việt, phù hợp với UI tối giản.

Đề xuất:

- Font family:
    - Dùng một font không chân hiện đại, mảnh: ví dụ “Inter”, “SF Pro Text” hoặc “Nunito Sans” (ưu tiên Inter vì tối giản và dễ đọc).[^2]
- Weight sử dụng:
    - Heading: 500–600 (medium/semibold), không quá đậm để giữ cảm giác nhẹ.
    - Body: 300–400 (light/regular).
    - Không dùng bold nặng trừ khi cực kỳ cần nhấn mạnh.

Cỡ chữ gợi ý (desktop):

- H1 (tiêu đề trang, ví dụ “Tổng quan”): 24–28px, chữ thường/viết hoa chữ cái đầu, tracking rộng nhẹ.
- H2 (tiêu đề khối, ví dụ “Cơ hội trong tuần này”): 18–20px.
- Body text: 14–16px.
- Caption/Label nhỏ: 12–13px.

Phong cách:

- Line-height rộng (1.4–1.6) để giữ cảm giác thoáng.
- Ít dùng underline, ưu tiên phân biệt bằng màu accent ở link.
- Sử dụng chữ thường, hạn chế viết HOA TẤT CẢ để tránh cảm giác gắt.

***

## 3. Layout structure cho các trang

Nguyên tắc layout chung:

- Sidebar trái cố định, mỏng, nền kính mờ, icon + text.
- Header trên cùng mỏng: tên trang, search, avatar.
- Nội dung chính sử dụng grid đơn giản (tối đa 2 cột lớn), nhiều khoảng trắng quanh card.[^2]


### 3.1 Trang Tổng quan (Dashboard)

Mục tiêu: cho Admin/Trưởng nhóm nhìn nhanh sức khỏe kinh doanh.

Layout:

- Sidebar trái: logo nhỏ Yến Sào Vĩnh Hưng, menu (icon + text).
- Header:
    - Bên trái: tiêu đề “Tổng quan”, dưới có subtext mô tả ngắn (ví dụ: “Tình hình khách hàng và cơ hội trong 7 ngày gần nhất”).
    - Bên phải: ô search toàn hệ thống, avatar user, menu tài khoản.
- Nội dung:
    - Hàng trên: 3–4 card số liệu chính (lead mới, cơ hội đang mở, giá trị pipeline, doanh thu). Các card là glass card tối giản.[^2]
    - Hàng giữa:
        - Bên trái: biểu đồ đường/cột cho doanh thu theo thời gian (accent `#C89A3D`).
        - Bên phải: biểu đồ cột/stacked cho số cơ hội theo giai đoạn.
    - Hàng dưới:
        - Danh sách cơ hội mới nhất.
        - Danh sách công việc hôm nay.


### 3.2 Trang Cơ hội bán hàng (Kanban)

Mục tiêu: cho Sales và Trưởng nhóm quản lý pipeline.

Layout:

- Sidebar + Header giống các trang khác.
- Nội dung:
    - Hàng trên: filter đơn giản (theo nhân viên, theo phân khúc khách hàng, theo sản phẩm quan tâm).
    - Bên dưới: Kanban full-width, 4–6 cột (Mới, Đang tư vấn, Gửi báo giá, Đàm phán, Chốt đơn, Thất bại).[^6][^7]
    - Mỗi cột có tiêu đề, số lượng cơ hội, scroll dọc, khoảng cách giữa các card rộng, tránh dày.


### 3.3 Trang Công việc

Mục tiêu: giúp Sales “thấy rõ việc phải làm”.

Layout:

- Hàng trên: tiêu đề, filter theo trạng thái (tất cả, hôm nay, tuần này, quá hạn), theo priority.
- Hai chế độ hiển thị:
    - List view: bảng 1 cột lớn, mỗi dòng là một task, hiển thị tiêu đề, khách hàng, deadline, priority (badge), trạng thái.
    - Hoặc Board view đơn giản (To-do, In progress, Done), sử dụng cùng style Kanban card nhưng nhẹ hơn.
- Bên phải (hoặc bottom panel): panel chi tiết task khi click.


### 3.4 Trang Danh sách khách hàng

Mục tiêu: tra cứu và quản lý khách.

Layout:

- Hàng trên:
    - Bên trái: ô tìm kiếm lớn (theo tên, SĐT, email).
    - Bên phải: nút “Thêm khách hàng” (accent), nút “Upload CSV”, nút “Xuất CSV” (secondary).
- Bảng khách hàng:
    - Cột cơ bản: Tên, Phân khúc, Sản phẩm quan tâm, Người phụ trách, Giá trị cơ hội dự kiến (nếu có), Ngày tạo.
    - Hàng nhẹ, nhiều khoảng trắng, hover đổi nền rất nhẹ.
- Panel chi tiết: khi click vào 1 dòng, mở panel bên phải (slide-in) hiển thị chi tiết khách, lịch sử tương tác.


### 3.5 Trang Thanh toán

Mục tiêu: ghi nhận và xem thanh toán.

Layout:

- Filter trên cùng: theo thời gian, theo nhân viên, theo trạng thái (Đã thanh toán/Chưa thanh toán/Hoàn tiền).
- Bảng thanh toán: Khách hàng, Số tiền, Trạng thái, Hình thức, Ngày, Người ghi nhận.
- Từ mỗi dòng thanh toán có link mở chi tiết khách hàng/cơ hội.


### 3.6 Trang Cài đặt

Mục tiêu: Admin quản lý cấu hình.

Layout:

- Menu nhỏ bên trái trong trang Cài đặt (tabs): Người dùng, Vai trò \& nhóm, Quy trình bán hàng, Sản phẩm.
- Nội dung từng tab là form đơn giản, nhiều khoảng trắng, group label rõ ràng.

***

## 4. Component style

Phong cách tổng quát: glassmorphism nhẹ, không quá “ảo”, ưu tiên đọc được – dùng blur và viền trắng mỏng, shadow rất nhẹ.[^1][^8]

### 4.1 Card

- Nền: `rgba(255,255,255,0.85)` trên nền `#F9F5EE`.
- Border: 1px `rgba(255,255,255,0.6)` + inner shadow nhẹ hoặc shadow mờ (0 12px 30px rgba(0,0,0,0.04)).[^1]
- Bo góc: 16px.
- Padding: 20–24px, nhiều khoảng trắng bên trong.
- Nội dung: tối đa 2–3 thông tin chính + 1 số lớn (metric).


### 4.2 Button

- Button primary:
    - Nền: `#C89A3D`.
    - Chữ: trắng (`#FFFFFF`).
    - Bo góc: 999px (pill) hoặc 8px (tuỳ gu, nhưng giữ nhất quán).
    - Padding: 10–12px chiều dọc, 18–24px chiều ngang.
    - Shadow rất nhẹ hoặc không shadow, rely on color.
    - Hover: tăng độ sáng nhẹ hoặc thêm outline mờ `rgba(200,154,61,0.4)`.
- Button secondary:
    - Nền: trong suốt, border 1px `#C89A3D`, chữ màu accent.
    - Hover: nền `rgba(200,154,61,0.08)`.


### 4.3 Input

- Nền: kính mờ rất nhạt `rgba(255,255,255,0.9)`.
- Border: 1px `#E3D7C8`.
- Bo góc: 10px.
- Padding: 10–12px.
- Placeholder: màu `#C1B5A4`.
- Focus: border dùng màu accent `#C89A3D`, thêm glow rất nhẹ.


### 4.4 Badge (nhãn)

- Dạng pill nhỏ.
- Ví dụ:
    - Phân khúc VIP: nền `rgba(200,154,61,0.12)`, chữ `#C89A3D`.
    - Phân khúc Đại lý: nền `rgba(139,131,117,0.12)`, chữ `#8B8375`.
    - Phân khúc Khách lẻ: nền `rgba(227,215,200,0.5)`, chữ `#3F3A33`.
- Priority task:
    - Cao: border `#D96C3F`, chữ cùng màu, nền rất nhạt `rgba(217,108,63,0.1)`.
    - Trung bình: màu xám nâu.
    - Thấp: đường viền nhạt, chữ nhạt.


### 4.5 Sidebar

- Nền: kính mờ: `rgba(255,255,255,0.15)` trên gradient rất nhẹ vàng kem – nâu nhạt.[^1]
- Border-right: 1px `rgba(255,255,255,0.4)`.
- Icon line, mỏng; khi active thêm nền `rgba(200,154,61,0.14)` và chấm accent bên trái.
- Chiều rộng: khoảng 220–240px, thoáng.


### 4.6 Kanban card

- Nền: `rgba(255,255,255,0.9)`.
- Bo góc: 12px, shadow nhẹ.
- Nội dung card:
    - Dòng 1: Tên cơ hội (1 dòng, cắt bớt nếu dài).
    - Dòng 2: Tên khách hàng.
    - Dòng 3: Giá trị dự kiến (đậm hơn) + badge phân khúc (Khách lẻ/Đại lý/VIP).
    - Footer: avatar người phụ trách nhỏ + deadline (nếu có).
- Khoảng trắng: đủ để card nhìn “giàu” không chật.

***

## 5. Dữ liệu mẫu cho Yến Sào Vĩnh Hưng

### 5.1 6 khách hàng tiềm năng

1. Nguyễn Thùy Linh – Công ty TNHH Thực Phẩm Hương Việt
    - Phân khúc: Đại lý
    - Sản phẩm quan tâm: Yến tinh chế, Yến chưng
    - Giá trị đơn hàng dự kiến: 280.000.000 VND
2. Trần Minh Quân – Công ty Cổ phần TM \& DV An Phát
    - Phân khúc: Đại lý
    - Sản phẩm quan tâm: Yến thô, Yến tinh chế
    - Giá trị đơn hàng dự kiến: 450.000.000 VND
3. Lê Bảo Anh – Khách lẻ (cá nhân, khách cao cấp)
    - Phân khúc: VIP
    - Sản phẩm quan tâm: Yến chưng cao cấp (hộp quà biếu), Yến tinh chế
    - Giá trị đơn hàng dự kiến: 65.000.000 VND
4. Phạm Ngọc Hưng – Công ty TNHH Du Lịch \& Sự Kiện Sài Gòn Event
    - Phân khúc: Đại lý (mua làm quà tặng cho khách doanh nghiệp)
    - Sản phẩm quan tâm: Yến chưng, Yến tinh chế (combo quà tặng)
    - Giá trị đơn hàng dự kiến: 320.000.000 VND
5. Vũ Thu Trang – Chủ chuỗi Cửa hàng Đặc sản Miền Trung An Nhiên (Hà Nội)
    - Phân khúc: Đại lý
    - Sản phẩm quan tâm: Yến thô, Yến chưng
    - Giá trị đơn hàng dự kiến: 210.000.000 VND
6. Đặng Quốc Khánh – Khách lẻ (mua định kỳ cho gia đình và biếu tặng)
    - Phân khúc: Khách lẻ
    - Sản phẩm quan tâm: Yến chưng (set tháng), Yến tinh chế
    - Giá trị đơn hàng dự kiến: 35.000.000 VND

### 5.2 5 công việc mẫu

1. Gọi tư vấn gói đại lý Hương Việt
    - Khách hàng: Nguyễn Thùy Linh – Hương Việt
    - Priority: Cao
    - Deadline: 18/05/2026, 16:00
2. Gửi báo giá combo quà tặng cho Sài Gòn Event
    - Khách hàng: Phạm Ngọc Hưng – Sài Gòn Event
    - Priority: Cao
    - Deadline: 19/05/2026, 11:00
3. Hẹn gặp thử sản phẩm tại cửa hàng An Nhiên
    - Khách hàng: Vũ Thu Trang – Đặc sản An Nhiên
    - Priority: Trung bình
    - Deadline: 21/05/2026, 15:00
4. Gọi chăm sóc đơn lặp lại tháng 6 cho anh Khánh
    - Khách hàng: Đặng Quốc Khánh
    - Priority: Trung bình
    - Deadline: 25/05/2026, 10:00
5. Gửi catalog sản phẩm mới và chương trình ưu đãi VIP cho chị Bảo Anh
    - Khách hàng: Lê Bảo Anh
    - Priority: Thấp
    - Deadline: 22/05/2026, 09:00

### 5.3 3 danh sách khách hàng (segment)

1. “Đại lý chiến lược miền Nam”
    - Tiêu chí: Doanh nghiệp/chuỗi cửa hàng tại TP.HCM, Bình Dương, Đồng Nai; giá trị dự kiến ≥ 200.000.000 VND; phân khúc Đại lý.
2. “Khách lẻ VIP quà biếu”
    - Tiêu chí: Khách lẻ, đơn dự kiến ≥ 50.000.000 VND/năm, sản phẩm quan tâm chủ yếu là Yến chưng và bộ quà tặng.
3. “Đại lý mới 90 ngày gần đây”
    - Tiêu chí: Khách mới phân khúc Đại lý, được tạo trong hệ thống trong vòng 90 ngày, chưa có thanh toán đầu tiên hoặc đang trong giai đoạn đàm phán.

***

Nếu anh muốn bước tiếp, tôi có thể:

- Chuyển Design Brief này thành checklist cụ thể cho designer (từng màn, từng component).
- Hoặc mô tả thêm 1–2 “hero screen” chi tiết (Tổng quan \& Kanban) để designer bám vào khi vẽ Figma.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^9]</span>

<div align="center">⁂</div>

[^1]: https://uxpilot.ai/blogs/glassmorphism-ui

[^2]: https://johnnygrow.com/bi/crm-dashboard-design/

[^3]: https://www.color-hex.com/color-palette/17983

[^4]: https://worldbranddesign.com/trong-gia-birds-nest-visual-identity-by-atelier-9am/

[^5]: https://worldbranddesign.com/entry/21520-trong-gia-bird-s-nest-visual-identity-by-atelier-9am

[^6]: https://www.canva.com/online-whiteboard/kanban-boards/

[^7]: https://adminlte.io/blog/crm-dashboard-templates/

[^8]: https://onyx8agency.com/blog/glassmorphism-inspiring-examples/

[^9]: https://dribbble.com/search/Glassmorphism-dashboard

[^10]: https://dribbble.com/search/glass-morphism

[^11]: https://www.behance.net/search/projects/glassmorphism ui

[^12]: https://www.magnific.com/free-photos-vectors/glassmorphism-ui-design

[^13]: https://dribbble.com/search/glassmorphism-web-app

[^14]: https://www.instagram.com/p/C0eIFWlplfG/

[^15]: https://dribbble.com/tags/crm-dashboard

