# Tài liệu Use Case Chi tiết Hệ thống Quản lý Công việc (Task Management)

Tài liệu này định nghĩa chi tiết các Use Case cho hệ thống Web Quản lý Công việc (Task Management) cá nhân tích hợp Lộ trình học tập, Phương pháp Pomodoro, Chuỗi làm việc (Streak), Nhật ký cá nhân và Quản lý tài khoản người dùng.

> **Ghi chú về Thứ tự Phát triển (Development Priority Order):**  
> Các Use Case bên dưới được sắp xếp theo thứ tự ưu tiên phát triển mã nguồn từ nền tảng xác thực tài khoản $\rightarrow$ quản lý dữ liệu cốt lõi (chủ đề, task) $\rightarrow$ giao diện tương tác nâng cao (lịch tuần, kéo thả) $\rightarrow$ tính năng mở rộng (Pomodoro, Streak, Nhật ký).

---

## Danh mục Use Cases (Theo Thứ tự Phát triển)

- [UC01: Đăng ký, Đăng nhập và Quản lý Hồ sơ người dùng](#uc01-đăng-ký-đăng-nhập-và-quản-lý-hồ-sơ-người-dùng)
- [UC02: Xem và quản lý công việc theo Khối chủ đề](#uc02-xem-và-quản-lý-công-việc-theo-khối-chủ-đề)
- [UC03: Tạo công việc mới](#uc03-tạo-công-việc-mới)
- [UC04: Chỉnh sửa và Xóa công việc](#uc04-chỉnh-sửa-và-xóa-công-việc)
- [UC05: Xem, điều hướng Lịch công việc theo tuần và Kéo-Thả (Time Grid Drag & Drop)](#uc05-xem-điều-hướng-lịch-công-việc-theo-tuần-và-kéo-thả-time-grid-drag--drop)
- [UC06: Thực hiện công việc bằng phương pháp Pomodoro](#uc06-thực-hiện-công-việc-bằng-phương-pháp-pomodoro)
- [UC07: Xem Chuỗi làm việc (Streak) và Thống kê hiệu suất](#uc07-xem-chuỗi-làm-việc-streak-và-thống-kê-hiệu-suất)
- [UC08: Ghi nhật ký học tập và xem tóm tắt ngày](#uc08-ghi-nhật-ký-học-tập-và-xem-tóm-tắt-ngày)

---

## UC01: Đăng ký, Đăng nhập và Quản lý Hồ sơ người dùng

**Tên use case**  
Đăng ký, Đăng nhập và Quản lý Hồ sơ người dùng

**Tác nhân chính**  
Người dùng / Người dùng chưa có tài khoản

**Điều kiện bắt đầu**  
Người dùng truy cập vào ứng dụng web.

**Luồng sự kiện chính**  
- **Phần 1: Đăng ký tài khoản**
  1. Người dùng chọn nút "Đăng ký".
  2. Hệ thống hiển thị form Đăng ký (Họ tên, Email, Mật khẩu, Xác nhận mật khẩu).
  3. Người dùng nhập thông tin và chọn "Tạo tài khoản".
  4. Hệ thống kiểm tra Email chưa tồn tại, mật khẩu hợp lệ.
  5. Hệ thống lưu tài khoản mới vào CSDL và tự động đăng nhập.
- **Phần 2: Đăng nhập hệ thống**
  1. Người dùng nhập Email và Mật khẩu tại màn hình Đăng nhập.
  2. Hệ thống xác thực thông tin tài khoản.
  3. Nếu hợp lệ, hệ thống cấp phiên đăng nhập (Session/Token) và chuyển hướng tới Trang chủ (Lịch tuần).
- **Phần 3: Quản lý & Chỉnh sửa hồ sơ cá nhân**
  1. Người dùng chọn biểu tượng Avatar/Tên tài khoản $\rightarrow$ chọn "Hồ sơ cá nhân".
  2. Hệ thống hiển thị thông tin hồ sơ: Họ tên, Email, Ảnh đại diện (Avatar), Mật khẩu hiện tại.
  3. Người dùng cập nhật thông tin mong muốn (Thay đổi họ tên, tải ảnh đại diện mới, hoặc đổi mật khẩu) và ấn "Lưu thay đổi".
  4. Hệ thống cập nhật thông tin trong CSDL và hiển thị thông báo "Cập nhật hồ sơ thành công".

**Luồng con**  
- **A-1: Đăng xuất khỏi hệ thống**
  1. Người dùng chọn "Đăng xuất" tại menu tài khoản.
  2. Hệ thống xóa phiên đăng nhập và chuyển người dùng về màn hình Đăng nhập.

**Luồng rẽ nhánh**  
- **E-1: Email đăng ký đã tồn tại**
  1. Hệ thống báo lỗi: "Email này đã được sử dụng. Vui lòng chọn Email khác hoặc Đăng nhập".
- **E-2: Sai email hoặc mật khẩu khi đăng nhập**
  1. Hệ thống báo lỗi: "Email hoặc mật khẩu không chính xác".
- **E-3: Mật khẩu mới không khớp khi đổi mật khẩu**
  1. Hệ thống báo lỗi: "Xác nhận mật khẩu mới không trùng khớp".

---

## UC02: Xem và quản lý công việc theo Khối chủ đề

**Tên use case**  
Xem và quản lý công việc theo Khối chủ đề

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng đã đăng nhập vào hệ thống và chọn mục "Khối chủ đề" trên thanh điều hướng.

**Luồng sự kiện chính**  
1. Người dùng chọn mục "Khối chủ đề".
2. Hệ thống truy vấn CSDL và hiển thị danh sách các thẻ Khối chủ đề (Machine Learning, Tiếng Anh, Kiến trúc phần mềm,...). Mỗi thẻ hiển thị Tên chủ đề, Số task và Tiến độ (%).
3. Người dùng chọn một Khối chủ đề cụ thể.
4. Hệ thống tải và hiển thị danh sách chi tiết các công việc thuộc chủ đề đó.
5. Với mỗi công việc trong danh sách chủ đề, hệ thống hiển thị: Tên công việc, Ngày/Giờ phân bổ, Số quả Pomodoro, Trạng thái, cùng **Nút Chỉnh sửa (Edit)** và **Nút Xóa (Delete)** ngay bên cạnh thẻ công việc.

**Luồng con**  
- **A-1: Thao tác Chỉnh sửa hoặc Xóa công việc từ trang Khối chủ đề**
  1. Người dùng chọn nút "Chỉnh sửa" hoặc "Xóa" tại thẻ công việc trong danh sách chủ đề.
  2. Hệ thống chuyển tiếp xử lý theo [UC04: Chỉnh sửa và Xóa công việc](#uc04-chỉnh-sửa-và-xóa-công-việc).
- **A-2: Lọc và tìm kiếm công việc trong chủ đề**
  1. Người dùng nhập từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái.
  2. Hệ thống cập nhật danh sách hiển thị khớp với điều kiện tìm kiếm/lọc.

**Luồng rẽ nhánh**  
- **E-1: Chủ đề chưa có công việc**
  1. Hệ thống xác định khối chủ đề chưa có công việc nào.
  2. Hệ thống hiển thị thông báo: "Chủ đề này chưa có công việc nào" kèm nút "Thêm công việc vào chủ đề".

---

## UC03: Tạo công việc mới

**Tên use case**  
Tạo công việc mới

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng chọn nút "Tạo công việc mới".

**Luồng sự kiện chính**  
1. Người dùng chọn nút "Tạo công việc mới".
2. Hệ thống hiển thị biểu mẫu (form) nhập thông tin: Tên công việc, Mô tả, Khối chủ đề, Ngày & Khung giờ thực hiện, Số quả Pomodoro dự kiến.
3. Người dùng nhập các thông tin cần thiết và ấn "Lưu".
4. Hệ thống kiểm tra tính hợp lệ của dữ liệu (Tên không trống, số quả Pomodoro > 0).
5. Nếu hợp lệ, hệ thống lưu công việc vào cơ sở dữ liệu.
6. Hệ thống hiển thị thông báo thành công và cập nhật công việc lên Lịch tuần và Trang khối chủ đề.

**Luồng con**  
- **A-1: Tạo chủ đề mới trực tiếp khi tạo công việc**
  1. Người dùng chọn "Thêm chủ đề mới" trong ô chọn chủ đề.
  2. Người dùng nhập tên chủ đề mới và xác nhận.
  3. Hệ thống lưu chủ đề mới và tự động gán vào công việc đang tạo.

**Luồng rẽ nhánh**  
- **E-1: Dữ liệu nhập không hợp lệ**
  1. Tên công việc bị trống hoặc số quả Pomodoro <= 0.
  2. Hệ thống báo lỗi ngay tại trường nhập và giữ nguyên biểu mẫu cho người dùng sửa.

---

## UC04: Chỉnh sửa và Xóa công việc

**Tên use case**  
Chỉnh sửa và Xóa công việc

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng chọn **Nút Chỉnh sửa** hoặc **Nút Xóa** tại một thẻ công việc ở **Trang Lịch tuần (UC05)** hoặc **Trang Khối chủ đề (UC02)**.

**Luồng sự kiện chính**  
- **Nhánh 1: Chỉnh sửa công việc**
  1. Người dùng chọn nút "Chỉnh sửa" (biểu tượng chiếc bút) tại thẻ công việc mong muốn.
  2. Hệ thống mở biểu mẫu Chỉnh sửa công việc chứa đầy đủ thông tin hiện tại của task (Tên, Mô tả, Khối chủ đề, Ngày/Giờ thực hiện, Số quả Pomodoro, Trạng thái).
  3. Người dùng thay đổi các thông tin cần thiết và chọn nút "Cập nhật".
  4. Hệ thống kiểm tra dữ liệu hợp lệ và lưu thông tin mới vào CSDL.
  5. Hệ thống thông báo "Cập nhật công việc thành công" và cập nhật hiển thị lập tức trên cả Trang Lịch tuần lẫn Trang Khối chủ đề.
- **Nhánh 2: Xóa công việc**
  1. Người dùng chọn nút "Xóa" (biểu tượng thùng rác) tại thẻ công việc.
  2. Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn xóa công việc '[Tên công việc]' này không? Thao tác này không thể hoàn tác.".
  3. Người dùng ấn nút "Xác nhận xóa".
  4. Hệ thống xóa công việc khỏi cơ sở dữ liệu.
  5. Hệ thống thông báo "Đã xóa công việc thành công" và gỡ bỏ thẻ công việc khỏi cả Trang Lịch tuần lẫn Trang Khối chủ đề.

**Luồng con**  
- **A-1: Hủy thao tác xóa công việc**
  1. Tại hộp thoại xác nhận xóa, người dùng chọn nút "Hủy" hoặc đóng popup.
  2. Hệ thống đóng hộp thoại và giữ nguyên công việc trong danh sách.

**Luồng rẽ nhánh**  
- **E-1: Lỗi khi lưu dữ liệu chỉnh sửa hoặc xóa**
  1. Hệ thống gặp lỗi CSDL khi ấn Cập nhật hoặc Xóa.
  2. Hệ thống báo lỗi: "Không thể xử lý yêu cầu. Vui lòng thử lại".
  3. Công việc được giữ nguyên trạng thái ban đầu.

---

## UC05: Xem, điều hướng Lịch công việc theo tuần và Kéo-Thả (Time Grid Drag & Drop)

**Tên use case**  
Xem, điều hướng Lịch công việc theo tuần và Kéo-Thả (Time Grid Drag & Drop)

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng đã đăng nhập vào hệ thống và đang ở trang chủ (Lịch tuần).

**Luồng sự kiện chính**  
1. Người dùng truy cập trang chủ của ứng dụng.
2. Hệ thống tự động xác định ngày hiện tại và khoảng thời gian 7 ngày của tuần hiện tại (từ Thứ Hai đến Chủ Nhật).
3. Hệ thống hiển thị Lịch tuần chiếm vị trí trung tâm màn hình với cấu trúc Lưới thời gian (Time Grid):
   - **Trục ngang (Cột)**: 7 cột tương ứng với các thứ trong tuần (Thứ 2 - Chủ Nhật, kèm ngày/tháng).
   - **Trục dọc (Hàng)**: Các mốc khung giờ trong ngày (từ 00:00 đến 23:00 hoặc 06:00 đến 22:00).
4. Hệ thống truy vấn CSDL để lấy danh sách công việc trong tuần và hiển thị các thẻ công việc (task cards) nằm chính xác tại ô mốc giờ và ngày đã phân bổ.
5. Mỗi thẻ công việc hiển thị: Tên công việc, Khối chủ đề (kèm màu phân loại), Thời gian thực hiện, Trạng thái và Nút thao tác nhanh (Chỉnh sửa, Xóa, Bắt đầu Pomodoro).
6. Hệ thống hiển thị 2 nút mũi tên chuyển tuần: Mũi tên trái (Xem tuần trước) và Mũi tên phải (Xem tuần sau).

**Luồng con**  
- **A-1: Chuyển tuần làm việc**
  1. Người dùng chọn nút mũi tên sang tuần trước hoặc tuần sau.
  2. Hệ thống tính toán lại 7 ngày của tuần được chọn và tải danh sách công việc lên khung Time Grid mới.
- **A-2: Kéo - Thả (Drag & Drop) để đổi thời gian/ngày làm việc của task**
  1. Người dùng nhấn giữ và kéo (drag) một thẻ công việc trên lưới lịch tuần.
  2. Người dùng di chuyển thẻ công việc đến ô mốc giờ hoặc cột ngày khác mong muốn trên Lưới lịch tuần.
  3. Người dùng thả (drop) thẻ công việc vào vị trí mới.
  4. Hệ thống tự động cập nhật ngày thực hiện và khung giờ mới của công việc vào cơ sở dữ liệu.
  5. Hệ thống hiển thị thông báo ngắn: "Đã cập nhật thời gian công việc thành công".
- **A-3: Đánh dấu hoàn thành nhanh hoặc bấm nút Chỉnh sửa / Xóa trực tiếp trên lịch**
  1. Tại thẻ công việc trên lưới lịch, người dùng tích chọn checkbox hoàn thành hoặc chọn biểu tượng Nút Chỉnh sửa / Nút Xóa.
  2. Nếu chọn hoàn thành: Hệ thống cập nhật trạng thái thành "Đã hoàn thành" và đổi màu thẻ.
  3. Nếu chọn Chỉnh sửa hoặc Xóa: Hệ thống kích hoạt luồng sự kiện [UC04: Chỉnh sửa và Xóa công việc](#uc04-chỉnh-sửa-và-xóa-công-việc).

**Luồng rẽ nhánh**  
- **E-1: Kéo thả công việc vào mốc thời gian không hợp lệ**
  1. Người dùng thả thẻ công việc vào vị trí ngoài vùng cho phép hoặc mốc thời gian đã quá hạn.
  2. Hệ thống hủy thao tác kéo thả, trả thẻ công việc về vị trí ban đầu và hiển thị cảnh báo: "Thời gian không hợp lệ".
- **E-2: Lỗi cập nhật thời gian khi kéo thả**
  1. Mất kết nối CSDL khi người dùng vừa thả thẻ công việc.
  2. Hệ thống khôi phục thẻ công việc về vị trí cũ và thông báo: "Không thể lưu thay đổi thời gian. Vui lòng thử lại".

---

## UC06: Thực hiện công việc bằng phương pháp Pomodoro

**Tên use case**  
Thực hiện công việc bằng phương pháp Pomodoro

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng chọn nút "Bắt đầu Pomodoro" tại một công việc trên Lịch tuần hoặc Khối chủ đề.

**Luồng sự kiện chính**  
1. Người dùng chọn nút "Bắt đầu Pomodoro".
2. Hệ thống chuyển sang giao diện Đồng hồ đếm ngược Pomodoro (25 phút làm việc, 5 phút nghỉ).
3. Người dùng bấm "Bắt đầu". Đồng hồ chạy từ 25:00 về 00:00.
4. Khi hết 25 phút, hệ thống phát thông báo âm thanh và cộng 1 quả cà chua đã hoàn thành vào CSDL.
5. Hệ thống chuyển sang chế độ Nghỉ ngắn 5 phút.
6. Khi hoàn thành đủ số quả cà chua mục tiêu, hệ thống tự động đánh dấu task thành "Đã hoàn thành".

**Luồng con**  
- **A-1: Tạm dừng / Tiếp tục phiên Pomodoro**
  1. Người dùng bấm "Tạm dừng" để ngưng đồng hồ và bấm "Tiếp tục" để chạy tiếp.

**Luồng rẽ nhánh**  
- **E-1: Hủy phiên giữa chừng**
  1. Người dùng bấm "Hủy phiên". Hệ thống cảnh báo phiên dở dang không được tính 1 quả cà chua. Người dùng xác nhận hủy và quay lại màn hình chính.

---

## UC07: Xem Chuỗi làm việc (Streak) và Thống kê hiệu suất

**Tên use case**  
Xem Chuỗi làm việc (Streak) và Thống kê hiệu suất

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng chọn mục "Chuỗi làm việc & Thống kê".

**Luồng sự kiện chính**  
1. Người dùng chọn trang "Chuỗi làm việc & Thống kê".
2. Hệ thống tổng hợp dữ liệu: Chuỗi ngày làm việc liên tục hiện tại (Current Streak), Chuỗi kỷ lục (Longest Streak), Tổng task & Pomodoro hoàn thành, và Biểu đồ năng suất.
3. Hệ thống hiển thị các chỉ số Streak nổi bật và biểu đồ tương tác.

**Luồng con**  
- **A-1: Lọc thời gian thống kê (Tuần/Tháng/Tất cả)**
  1. Người dùng chọn khoảng thời gian, hệ thống cập nhật biểu đồ tương ứng.

**Luồng rẽ nhánh**  
- **E-1: Người dùng mới chưa có dữ liệu**
  1. Hệ thống báo chỉ số Streak = 0 kèm thông điệp khuyến khích làm task đầu tiên.

---

## UC08: Ghi nhật ký học tập và xem tóm tắt ngày

**Tên use case**  
Ghi nhật ký học tập và xem tóm tắt ngày

**Tác nhân chính**  
Người dùng

**Điều kiện bắt đầu**  
Người dùng chọn mục "Nhật ký & Ghi chú".

**Luồng sự kiện chính**  
1. Người dùng chọn mục "Nhật ký & Ghi chú".
2. Hệ thống hiển thị **Khối Tóm tắt ngày (Phần trên)**: Các chủ đề đã học/làm trong ngày, số task và quả Pomodoro đã đạt được.
3. Hệ thống hiển thị **Khối Trình soạn thảo nhật ký Rich-text (Phần dưới)** với các công cụ định dạng chữ in đậm, in nghiêng, gạch chân, danh sách, trích dẫn,...
4. Người dùng nhập nội dung nhật ký và ấn nút "Lưu nhật ký".
5. Hệ thống lưu nhật ký vào CSDL và báo "Lưu nhật ký thành công".

**Luồng con**  
- **A-1: Xem/Sửa nhật ký ngày trước**
  1. Người dùng chọn ngày khác trên bộ chọn ngày, hệ thống tải tóm tắt và nội dung nhật ký ngày đó.
- **A-2: Tự động lưu bản nháp (Auto-save)**
  1. Hệ thống tự động lưu bản nháp sau mỗi 30 giây dừng gõ.

**Luồng rẽ nhánh**  
- **E-1: Mất kết nối mạng khi lưu**
  1. Hệ thống báo lỗi kết nối và lưu tạm bản sao vào Local Storage trên trình duyệt.
