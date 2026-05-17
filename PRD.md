<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Ok, viết lại bản PRD cuối cùng sau khi chốt Features List giúp cho tôi

Dưới đây là bản PRD “chốt cuối” sau khi đã quyết toàn bộ Features List cho giai đoạn 1 CRM Yến Sào Vĩnh Hưng, viết lại mạch lạc để anh dùng làm tài liệu chuẩn cho team dev và các bên liên quan.[^1][^2]

***

## 1. Bối cảnh và mục tiêu sản phẩm

### 1.1 Bối cảnh

Yến Sào Vĩnh Hưng đang mở rộng hệ thống bán lẻ và đại lý, với nhiều kênh tiếp cận khách hàng khác nhau (cửa hàng, đại lý, đội thị trường, kênh online).
Thông tin khách hàng hiện phân tán ở nhiều nơi (file rời, điện thoại nhân viên, ứng dụng chat…) khiến việc quản lý và chăm sóc khách hàng gặp nhiều khó khăn, dễ bỏ sót cơ hội và khó đo lường hiệu quả đội ngũ.[^3][^4]

Trong bối cảnh ngành yến sào cạnh tranh, khách hàng có nhiều lựa chọn, việc quản lý tốt dữ liệu khách hàng, theo sát cơ hội bán hàng và chăm sóc lại khách mua rồi là yếu tố quan trọng để tăng doanh thu và giữ khách.[^4][^3]

### 1.2 Mục tiêu

Giai đoạn 1 của hệ thống CRM tập trung vào 4 mục tiêu chính:

1. Tập trung hóa dữ liệu khách hàng (Khách lẻ, Đại lý, VIP) tại một hệ thống duy nhất, kèm lịch sử tương tác.[^3][^4]
2. Quản lý cơ hội bán hàng theo quy trình rõ ràng, thể hiện bằng bảng kéo-thả (Kanban) để đội sales dễ theo dõi và không bỏ sót.[^5][^4]
3. Quản lý công việc bán hàng hàng ngày (gọi điện, gửi báo giá, chăm sóc lại…) để tăng tỷ lệ chốt đơn và chất lượng chăm sóc.[^3]
4. Ghi nhận thanh toán ở mức cơ bản, đủ để nhìn được doanh thu theo khách hàng và theo nhân viên, chuẩn bị nền tảng cho kết nối hệ thống khác sau này.[^5]

***

## 2. Chân dung người dùng

### 2.1 Admin (Ban giám đốc / Quản trị hệ thống)

- Mục tiêu:
    - Nắm bức tranh tổng thể về khách hàng, cơ hội, doanh thu.
    - Quản lý người dùng, phân quyền, cấu hình hệ thống (quy trình bán hàng, sản phẩm…).
- Nhu cầu:
    - Xem các chỉ số tổng quan nhanh.
    - Tạo và quản lý tài khoản cho Trưởng nhóm và Sales.[^3]


### 2.2 Trưởng nhóm bán hàng

- Mục tiêu:
    - Quản lý hiệu suất nhóm: ai đang phụ trách những khách nào, cơ hội ở giai đoạn nào.
    - Điều phối công việc trong nhóm, hỗ trợ chốt các cơ hội giá trị cao.
- Nhu cầu:
    - Xem toàn bộ khách hàng và cơ hội thuộc nhóm mình.
    - Reassign khách hàng/cơ hội giữa các nhân viên trong nhóm.[^5]


### 2.3 Nhân viên Sales

- Mục tiêu:
    - Quản lý khách hàng và cơ hội của riêng mình một cách rõ ràng.
    - Nắm được công việc phải làm trong ngày, không quên chăm sóc khách.
- Nhu cầu:
    - Giao diện đơn giản, thêm khách nhanh, cập nhật cơ hội bằng kéo-thả, theo dõi công việc gọn gàng.[^4]


### 2.4 CSKH / Hỗ trợ (tuỳ mức triển khai)

- Mục tiêu:
    - Xử lý yêu cầu hỗ trợ và khiếu nại, cập nhật ghi chú liên quan.
- Nhu cầu:
    - Xem lịch sử mua hàng, thanh toán và tương tác của khách.


### 2.5 Kế toán / Thu ngân

- Mục tiêu:
    - Đối soát các thanh toán đã ghi nhận trong CRM.
- Nhu cầu:
    - Xem và xuất danh sách thanh toán theo thời gian, theo khách, theo nhân viên.

***

## 3. Danh sách module (theo Features List đã chốt)

Hệ thống CRM giai đoạn 1 gồm 6 khu vực chính:

1. Tổng quan (Dashboard)
2. Cơ hội bán hàng (Kanban kéo-thả)
3. Công việc
4. Danh sách khách hàng
5. Thanh toán
6. Cài đặt

Kèm theo là hệ thống tài khoản, đăng nhập và phân quyền 3 lớp: Admin / Trưởng nhóm / Sales.[^6][^5]

***

## 4. User flow chính

### 4.1 Flow: Đăng ký / Đăng nhập và phân quyền

- Người dùng có thể:
    - Đăng ký tài khoản mới bằng email + mật khẩu.
    - Đăng nhập bằng email + mật khẩu.
    - Đăng nhập bằng tài khoản Google.[^7][^8]
- Nếu một người dùng dùng cùng một email cho hai cách đăng nhập (email/mật khẩu và Google), hệ thống sẽ nhận diện và gộp lại thành một tài khoản duy nhất, không tạo thêm tài khoản trùng.[^9]
- Chức năng “Quên mật khẩu” cho phép người dùng đặt lại mật khẩu qua email.[^7]
- Sau khi đăng nhập, hệ thống xác định vai trò (Admin / Trưởng nhóm / Sales) dựa trên hồ sơ người dùng, không dựa trên cách đăng nhập, và đưa người dùng vào màn hình phù hợp.


### 4.2 Flow: Quản lý khách hàng

1. Nhân viên Sales bấm “Thêm khách hàng” trong khu vực Danh sách khách hàng.
2. Điền thông tin khách: tên, số điện thoại, email, địa chỉ, phân khúc (Khách lẻ, Đại lý, VIP), sản phẩm quan tâm (Yến thô, Yến chưng, Yến tinh chế).[^3]
3. Hệ thống kiểm tra trùng theo email/số điện thoại, cảnh báo nếu đã có trong hệ thống để tránh tạo bản ghi trùng.
4. Khách hàng mới được gán cho nhân viên đang thao tác và thuộc nhóm của nhân viên đó.
5. Trưởng nhóm và Admin có thể xem danh sách khách của toàn nhóm/toàn công ty (theo quyền).

### 4.3 Flow: Quản lý cơ hội bán hàng (Kanban)

1. Từ hồ sơ khách hàng, nhân viên tạo cơ hội bán hàng mới (ví dụ: “Hợp đồng đại lý Quận 1”).
2. Cơ hội được khởi tạo ở cột đầu tiên của bảng Kanban (ví dụ: “Mới”).[^4][^5]
3. Khi có tiến triển (đã tư vấn, gửi báo giá, đàm phán…), nhân viên kéo thẻ cơ hội sang cột tương ứng.
4. Khi chốt đơn, cơ hội được chuyển sang cột “Chốt đơn” và có thể tạo bản ghi thanh toán liên quan.
5. Trưởng nhóm quan sát toàn bộ bảng Kanban của nhóm, lọc theo nhân viên để theo dõi tình hình và hỗ trợ.

### 4.4 Flow: Quản lý công việc

1. Nhân viên tạo công việc gắn với khách hàng hoặc cơ hội (ví dụ: gọi điện chăm sóc, gửi báo giá).
2. Chọn hạn chót, độ ưu tiên và trạng thái (mới/đang làm/hoàn thành/quá hạn).[^3]
3. Màn hình Công việc hiển thị danh sách việc cần làm trong ngày/tuần.
4. Trưởng nhóm có thể xem danh sách công việc của nhóm để theo dõi tiến độ.

### 4.5 Flow: Import / Export danh sách khách hàng

1. Admin hoặc Trưởng nhóm vào Danh sách khách hàng, chọn “Tải lên từ CSV”.
2. Tải file CSV theo mẫu chuẩn hệ thống (có các cột thông tin cơ bản).
3. Hệ thống kiểm tra và hiển thị preview, báo những dòng lỗi, những dòng trùng.[^10]
4. Người dùng quyết định cách xử lý trùng (bỏ qua hoặc cập nhật).
5. Sau khi xác nhận, hệ thống nhập dữ liệu vào CRM và báo kết quả.
6. Ngược lại, người dùng có thể lọc và “Xuất CSV” danh sách khách hàng theo điều kiện mong muốn.[^10]

### 4.6 Flow: Ghi nhận thanh toán

1. Khi cơ hội đã chốt, nhân viên mở phần Thanh toán và tạo bản ghi thanh toán mới, gắn với cơ hội và khách hàng đó.
2. Nhập số tiền, trạng thái (chưa thanh toán/đã thanh toán/hoàn tiền) và hình thức thanh toán (tiền mặt, chuyển khoản, COD…).
3. Dữ liệu thanh toán này được hiển thị trong hồ sơ khách hàng và báo cáo doanh thu cơ bản.

***

## 5. Danh sách data fields chính (mức kinh doanh)

Không đi sâu chi tiết kỹ thuật, chỉ nêu những trường quan trọng ở góc nhìn kinh doanh.

### 5.1 Thông tin người dùng (User)

- Email đăng nhập.
- Họ tên.
- Vai trò: Admin / Trưởng nhóm / Sales.
- Nhóm làm việc (team).
- Trạng thái hoạt động.


### 5.2 Thông tin khách hàng

- Tên khách hàng.
- Số điện thoại chính và phụ.
- Email.
- Địa chỉ, khu vực.
- Phân khúc: Khách lẻ, Đại lý, VIP.
- Sản phẩm quan tâm: Yến thô, Yến chưng, Yến tinh chế.
- Người phụ trách.
- Ghi chú quan trọng.


### 5.3 Thông tin cơ hội bán hàng

- Tên cơ hội (mô tả đơn hàng/cơ hội).
- Khách hàng liên quan.
- Giai đoạn trong quy trình bán hàng (Mới, Đang tư vấn, Gửi báo giá, Đàm phán, Chốt đơn, Thất bại).[^5]
- Giá trị dự kiến.
- Ngày dự kiến chốt.
- Người phụ trách.


### 5.4 Thông tin công việc

- Tiêu đề công việc.
- Nội dung.
- Khách hàng/cơ hội liên quan.
- Người phụ trách.
- Hạn chót.
- Trạng thái.


### 5.5 Thông tin thanh toán

- Khách hàng.
- Cơ hội/đơn hàng liên quan.
- Số tiền.
- Trạng thái: chưa thanh toán, đã thanh toán, hoàn tiền.
- Hình thức thanh toán.

***

## 6. Quy tắc phân quyền (3 lớp đã chốt)

### 6.1 Admin

- Xem và quản lý toàn bộ dữ liệu khách hàng, cơ hội, công việc, thanh toán.
- Tạo và quản lý tài khoản người dùng, gán vai trò và nhóm.
- Cấu hình quy trình bán hàng và danh mục sản phẩm.[^5]


### 6.2 Trưởng nhóm

- Xem và quản lý toàn bộ dữ liệu khách hàng, cơ hội, công việc, thanh toán thuộc nhóm mình.
- Phân công hoặc chuyển khách hàng/cơ hội giữa các nhân viên trong nhóm.


### 6.3 Nhân viên Sales

- Chỉ xem và quản lý dữ liệu khách hàng, cơ hội, công việc do mình phụ trách.
- Không xem dữ liệu khách hàng và cơ hội của nhân viên khác, trừ khi được Trưởng nhóm/Admin điều chỉnh cụ thể.

***

## 7. Yêu cầu giao diện và trải nghiệm

- Giao diện đơn giản, dễ hiểu, dùng ngôn ngữ kinh doanh, không dùng từ kỹ thuật.
- Menu trái gồm: Tổng quan – Cơ hội – Công việc – Khách hàng – Thanh toán – Cài đặt.
- Bảng Kanban rộng, dễ kéo-thả, hiển thị rõ nhãn giai đoạn.[^4][^5]
- Danh sách khách hàng và công việc có ô tìm kiếm và bộ lọc theo phân khúc, sản phẩm quan tâm, người phụ trách.
- Thiết kế màu sắc phù hợp hình ảnh cao cấp của ngành yến sào (tông đỏ – vàng – trắng – xám), tạo cảm giác tin cậy.

***

## 8. Yêu cầu kỹ thuật mức cao (diễn đạt theo business)

- Hệ thống lưu trữ dữ liệu thật, bảo mật, có phân quyền truy cập chặt chẽ.[^7]
- Đảm bảo mỗi người dùng chỉ truy cập được đúng phần dữ liệu theo vai trò đã nêu (Admin/Trưởng nhóm/Sales).[^5]
- Hệ thống tự động nhận diện và gộp tài khoản khi cùng một người dùng đăng nhập bằng nhiều cách nhưng dùng cùng một địa chỉ email, không để trùng hồ sơ.[^9]
- Có cơ chế sao lưu dữ liệu định kỳ để phòng rủi ro.

***

## 9. Tiêu chí nghiệm thu Giai đoạn 1

### 9.1 Nhóm chức năng tài khoản \& phân quyền

- Đăng ký, đăng nhập email + mật khẩu hoạt động ổn định.[^7]
- Đăng nhập bằng Google hoạt động, và nếu email trùng với email đã có, hệ thống không tạo tài khoản mới mà gộp vào tài khoản cũ.[^8][^9]
- Chức năng “Quên mật khẩu” và đặt lại mật khẩu qua email hoạt động đầy đủ.[^7]
- Phân quyền 3 lớp Admin/Trưởng nhóm/Sales hoạt động đúng như mô tả.


### 9.2 Nhóm chức năng nghiệp vụ

- Thêm/sửa/xóa khách hàng, phân khúc và sản phẩm quan tâm đúng yêu cầu.
- Import và export danh sách khách hàng bằng CSV không lỗi với dữ liệu mẫu thực tế.[^10]
- Bảng Kanban cơ hội cho phép thêm cơ hội mới và kéo-thả giữa các giai đoạn, hiển thị đúng theo người phụ trách.[^5]
- Hệ thống Công việc cho phép tạo, theo dõi, cập nhật trạng thái công việc.
- Ghi nhận thanh toán cho các cơ hội đã chốt và xem lại trong hồ sơ khách hàng.
- Dashboard hiển thị đúng số liệu cơ bản (khách mới, cơ hội, doanh thu) với dữ liệu mẫu.


### 9.3 Nhóm hiệu năng \& trải nghiệm

- Thời gian tải các màn hình chính ở mức chấp nhận được với dữ liệu thực tế.
- Giao diện rõ ràng, dễ hiểu với người dùng nội bộ (đội sales, trưởng nhóm, ban lãnh đạo).[^2][^1]

***

Nếu anh muốn bước tiếp, tôi có thể:

- Tách PRD “chốt cuối” này thành EPIC + user stories chi tiết để đưa thẳng vào backlog.
- Hoặc sinh thêm một bản “1 trang cho CEO” chỉ giữ: mục tiêu, phạm vi, timeline, và 5–7 bullet quan trọng nhất để chốt đầu tư.
<span style="display:none">[^11][^12][^13][^14][^15][^16][^17]</span>

<div align="center">⁂</div>

[^1]: https://edana.ch/en/2025/08/15/product-requirements-document-prd-complete-guide-templates-and-practical-examples/

[^2]: https://www.altexsoft.com/blog/product-requirements-document/

[^3]: https://viindoo.com/blog/business-management-3/crm-system-912

[^4]: https://capsulecrm.com/blog/crm-basics-key-features-for-business-success/

[^5]: https://www.creatio.com/glossary/crm-features

[^6]: https://www.salesforce.com/ap/crm/features/

[^7]: https://www.rocket.new/blog/supabase-auth-explained-setup-security-and-best-practices

[^8]: https://vibeappscanner.com/guide/add-auth-to-supabase

[^9]: https://supabase.com/docs/guides/auth/auth-identity-linking

[^10]: https://www.netsuite.com/portal/resource/articles/crm/crm-requirements.shtml

[^11]: https://www.scribd.com/document/987801336/SA-Project-Sign-Off

[^12]: https://www.prodpad.com/blog/prd-example/

[^13]: https://www.chatprd.ai/learn/product-requirements-document-example

[^14]: https://markmargolis.me/2013/03/18/a-sample-crm-project-scoping-initiation-document/

[^15]: https://supabase.com/blog/supabase-auth-identity-linking-hooks

[^16]: https://www.hellobonsai.com/blog/project-sign-off

[^17]: https://www.reddit.com/r/ProductManagement/comments/95w0rl/a_sample_prd_product_requirements_document_i_made/

