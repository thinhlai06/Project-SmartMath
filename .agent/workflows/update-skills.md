# Workflow: Auto-Sync & Update Skills (`/update-skills`)

> **Mô tả:** Workflow này hướng dẫn AI tự động rà soát, đánh giá và CẬP NHẬT nội dung trực tiếp của các file `SKILL.md` nằm trong các thư mục `.agent`, `.agents`, `.github`. Mục đích là để giữ cho các kỹ năng của AI luôn bám sát với trạng thái kiến trúc và luật lệ (rules) mới nhất của dự án Smart-MathAI.

---

## 🛠 Cách Kích Hoạt

Trong khung chat (VSCode AI hoặc Antigravity), gõ: 
`/update-skills`

---

## 🤖 Các Bước Thực Thi (Dành cho AI)

Khi người dùng gõ `/update-skills`, AI phải thực thi NGHIÊM NGẶT các bước sau (Không được phép bỏ qua bước):

### Bước 1: Nắm bắt Trạng Thái & Đồng Bộ Hóa Luật (Single Source of Truth)
1. Đọc nội dung file `CLAUDE.md` để lấy thông tin về **Tech Stack**, **Domain Constraints (Luật bắt buộc)**.
2. **ĐỒNG BỘ VSCODE:** Dùng công cụ ghi đè toàn bộ nội dung của `CLAUDE.md` sang file `.github/copilot-instructions.md`. Điều này đảm bảo VSCode Copilot luôn được trói buộc vào cùng một bộ luật mới nhất.
3. Đọc file `ARCHITECTURE.md` hoặc `PROJECT_OVERVIEW.md` (nếu có) để hiểu sơ đồ hiện tại.
4. Quét tóm tắt thư mục `.agent/rules/` để cập nhật chuẩn coding mới nhất.

### Bước 2: Quét Toàn Bộ Danh Sách Skills
1. Sử dụng công cụ (như `list_dir`) để quét qua toàn bộ các thư mục:
   - `.agent/skills/`
   - `.agents/skills/`
   - `.github/skills/` (nếu có)
2. Lên danh sách tất cả các file có tên là `SKILL.md`.

### Bước 3: Kiểm Toán (Audit) và Nâng Cấp Từng Skill
Với mỗi file `SKILL.md` tìm được:
1. **Kiểm tra độ vênh lệch:** Nội dung hướng dẫn xử lý của Skill đó có đang vi phạm các Rule mới nhất ở Bước 1 không? (Ví dụ: Skill backend đang xúi dùng Flask thay vì FastAPI? Skill đang gợi ý tạo model AI khác thay vì `gemma3:12b` / `qwen2.5:3b` / `gemma4:31b`?)
2. **Cập nhật & Chinh phạt:** Nếu nội dung lạc hậu hoặc chung chung, AI **bắt buộc dùng công cụ chỉnh sửa file (ví dụ: `replace_file_content` hoặc `multi_replace_file_content`)** để viết lại `SKILL.md`. 
3. **Tiêu chuẩn viêt:** Phải đảm bảo nội dung mới của Skill đó chứa các từ khóa ràng buộc của dự án (Lớp 1-3 v.v.) để lúc AI dùng skill đạt hiệu suất cao nhất.

### Bước 4: Tạo Report Lịch Sử Nâng Cấp
Sau khi quét và cập nhật xong, AI sinh ra một bảng báo cáo markdown vào khung chat cho người dùng, bao gồm:
- Các bộ Skill đã được update.
- Những luật (Rule) mới nào vừa được nhồi vào các Skill đó.
- Lời khuyên cho người dùng.

---
// turbo-all
