# 📘 Hướng Dẫn Sử Dụng Bộ Bí Kíp AI (Smart-MathAI)

Chào mừng bạn đến với hệ thống hỗ trợ lập trình thông minh được tối ưu riêng cho **Smart-MathAI**. Hệ thống này giúp AI hiểu sâu về dự án, tuân thủ đúng quy tắc giáo dục (Lớp 1-3) và sử dụng đúng các model AI đã cấu hình.

---

## 🚀 1. Cách Gọi Lệnh (Dành cho Antigravity)

Trong khung chat của Antigravity, bạn chỉ cần gõ ký tự đầu tiên là dấu gạch chéo `/`, một danh sách các "Workflow" sẽ hiện ra.

| Cú pháp lệnh | Tên Workflow | Công dụng chính |
| :--- | :--- | :--- |
| `/plan` | **Lập kế hoạch** | Phân tích yêu cầu và lên lộ trình code (Backend -> Frontend). |
| `/tdd` | **Quy trình TDD** | Hướng dẫn viết Test trước khi viết Code (Đảm bảo chất lượng). |
| `/python-review`| **Review Backend** | Soi lỗi bảo mật, logic và chuẩn FastAPI cho Python. |
| `/code-review` | **Review Frontend** | Kiểm tra Type Safety và giao diện cho React/TypeScript. |
| `/security-scan` | **Quét bảo mật** | Tìm kiếm lỗ hổng, rò rỉ API Key hoặc sai sót phân quyền. |

---

## 🔍 2. Chi Tiết Từng Công cụ & Trường hợp sử dụng

### 📋 `/plan` — Khi bắt đầu tính năng mới
*   **Dùng khi**: Bạn có một yêu cầu mới (VD: "Thêm trang Dashboard cho Phụ huynh").
*   **Cách hoạt động**: AI sẽ đọc file `agents/planner.md`, kiểm tra xem tính năng có vi phạm quy tắc Lớp 1-3 không, sau đó liệt kê các file cần sửa.

### 🧪 `/tdd` — Khi bắt đầu viết code thực tế
*   **Dùng khi**: Bạn muốn đảm bảo code chạy đúng ngay từ đầu và không bị lỗi sau này.
*   **Cách hoạt động**: AI sẽ hướng dẫn bạn viết 1 file test thất bại (RED), sau đó mới viết code để pass test (GREEN).

### 🐍 `/python-review` — Trước khi hoàn thành Backend
*   **Dùng khi**: Bạn vừa viết xong một API hoặc một Service trong `backend/`.
*   **Cách hoạt động**: AI đóng vai chuyên gia, kiểm tra xem bạn có quên `require_teacher` không, hoặc có đang dùng sai model AI không.

### ⚛️ `/code-review` — Trước khi hoàn thành Frontend
*   **Dùng khi**: Bạn vừa xong một Component hoặc Page trong `frontend/`.
*   **Cách hoạt động**: Kiểm tra xem giao diện có nút bấm cho đúng Role (Teacher/Parent) chưa, và tiếng Việt có chuẩn xác không.

---

## 🧠 3. Các "Skill" Tự Động (AI Tự Đọc)

Bạn không cần gõ lệnh cho các file này, AI sẽ tự động đọc chúng khi nhận thấy bạn đang làm việc liên quan:

*   **`ai-workflow`**: AI sẽ luôn nhớ dùng `qwen2.5:3b` để sinh câu hỏi + chấm bài text và `gemma4:31b` (Cloud OCR) để nhận diện chữ viết tay. Nó cũng nhớ quy tắc: AI output phải luôn là `Draft`.
*   **`backend-patterns`**: Giúp AI viết code FastAPI theo đúng cấu trúc: Controller -> Service -> Repository.
*   **`frontend-design`**: Đảm bảo giao diện hiện đại, cao cấp, không bị cảm giác "AI tạo ra".

---

## ⚠️ 4. Quy tắc "Bất di bất dịch" (Domain Constraints)

Hệ thống AI này đã được "khóa" các quy tắc sau, nếu bạn yêu cầu làm sai, AI sẽ cảnh báo:
1.  **Chỉ Toán Lớp 1, 2, 3**: Tuyệt đối không làm lớp 4 trở lên.
2.  **Quyền hạn (Role)**: Chỉ Giáo viên mới được tạo nội dung. Phụ huynh chỉ được xem và tải.
3.  **Duyệt nội dung**: Mọi thứ AI tạo ra phải ở trạng thái `Chờ duyệt`, Giáo viên phải bấm "Duyệt" thì Phụ huynh mới thấy.

---

## 💡 Mẹo nhỏ cho bạn:
Nếu bạn thấy AI đang tư vấn chung chung, hãy gõ: 
> *"Hãy áp dụng các quy tắc trong .agent/ để thực hiện yêu cầu này"* 

Lập tức AI sẽ trở nên cực kỳ thông thạo dự án của bạn!

---

## 💻 5. Cách dùng trong VS Code (GitHub Copilot/Codex)

Phần này dành riêng cho VS Code, tách biệt với Antigravity.

### 5.1 VS Code tự đọc gì?

Trong cấu hình hiện tại, VS Code sẽ tự áp dụng:

*   **`/.github/copilot-instructions.md`**: Luôn được áp dụng cho toàn workspace.
*   **`/.github/instructions/*.instructions.md`**: Áp dụng theo ngữ cảnh (theo `applyTo` hoặc khi nội dung yêu cầu phù hợp).

### 5.2 VS Code không tự gọi gì?

*   **`instructions` không phải slash command** nên sẽ không hiện khi gõ `/`.
*   Khi gõ `/` trong VS Code, bạn sẽ thấy chủ yếu là **prompt files** trong `/.github/prompts/`.

### 5.3 Cách gọi lệnh trong VS Code

Trong khung chat VS Code, gõ `/` và chọn prompt phù hợp:

*   `/Plan Smart-MathAI Feature`
*   `/TDD Workflow`
*   `/Backend Python Review`
*   `/Frontend Code Review`
*   `/Security Scan`

### 5.4 Về Skill trong VS Code

*   Skill chỉ xuất hiện khi có thư mục `/.github/skills/<ten-skill>/SKILL.md`.
*   Hiện tại bạn đang dùng bản tinh gọn theo hướng tự động, nên trọng tâm là `copilot-instructions` + `instructions` + `prompts`.
*   Nếu sau này muốn dùng Skill bằng slash command trong VS Code, chỉ cần tạo lại `/.github/skills/`.

### 5.5 Cấu trúc tối thiểu nên giữ cho VS Code

*   `/.github/copilot-instructions.md` (nên giữ)
*   `/.github/instructions/` (nên giữ)
*   `/.github/prompts/` (nên giữ để gọi nhanh bằng `/`)

