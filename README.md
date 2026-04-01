# Exama Lite

**Exama Lite** là một nền tảng nhỏ hỗ trợ tạo và làm đề ôn tập cá nhân. Dự án ra đời nhằm cung cấp một phương án thay thế đơn giản, không quảng cáo và dễ tiếp cận cho học sinh trong các kỳ thi, khi mà các nền tảng hiện có thường quá phức tạp hoặc bị giới hạn tính năng.

**Trải nghiệm tại:** [examalite.pages.dev](https://examalite.pages.dev/)

---

## Điểm nổi bật

* **Đơn giản & Miễn phí:** Chỉ cần một địa chỉ email để bắt đầu.
* **Không quảng cáo:** Tập trung hoàn toàn vào việc ôn tập mà không bị xao nhãng.
* **Tự do:** Không cần tài khoản giáo viên, học sinh có thể tự tạo đề và chia sẻ link cho nhau.

---

## Công nghệ

Dự án ưu tiên sự tối giản trong mã nguồn để dễ dàng bảo trì và mở rộng:
* **Frontend:** Vanilla JS & Tailwind CSS.
* **Backend:** Supabase (Auth, Database, Storage, Edge Functions).
* **Lưu trữ:** Nội dung đề thi được đóng gói dạng file `.zip` (JSON + Media) để tiết kiệm tài nguyên.

---

## Các chức năng chính

### 1. Trình soạn đề (/editor)
* Hỗ trợ các loại câu hỏi cơ bản: Trắc nghiệm (đơn/đa đáp án), Đúng/Sai, Điền số, Điền từ, và Nhóm câu hỏi dùng chung dữ kiện.
* Thiết lập: Tên đề, thời gian làm bài, thời hạn truy cập, xáo trộn câu hỏi và đáp án.
* Hỗ trợ đọc nội dung từ file `.docx` ngay trên trình duyệt để tiết kiệm thời gian nhập liệu.

### 2. Chế độ luyện tập (/study)
* **Chế độ Học tập:** Trả lời theo dạng flashcard. Câu hỏi trả lời sai sẽ xuất hiện lại cho đến khi hoàn thành bài học.
* **Chế độ Kiểm tra:** Giao diện làm bài nghiêm túc với đồng hồ đếm ngược, danh sách câu hỏi điều hướng và chấm điểm sau khi nộp.

### 3. Dashboard quản lý (/app)
* Nơi lưu trữ và quản lý các đề thi đã tạo.
* Cho phép chỉnh sửa hoặc lấy link chia sẻ bài thi cho người khác làm mà không cần đăng nhập.

---


## Thông tin dự án

* **Tác giả:** Nguyen Huu Hoa ([nguyenhuuhoa@proton.me](mailto:nguyenhuuhoa@proton.me))
* **Giấy phép:** MIT

---

*Hy vọng Exama Lite sẽ giúp ích phần nào cho các bạn trong mùa thi cử.*
