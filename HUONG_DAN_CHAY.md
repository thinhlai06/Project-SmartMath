# Hướng dẫn Chạy Dự án Smart-MathAI (MVP)

Dự án **Smart-MathAI** là hệ thống giáo dục toán học tiểu học giao diện tiếng Việt. Dưới đây là hướng dẫn chi tiết để thiết lập và chạy toàn bộ dự án trên môi trường Local.

## 🛠️ Yêu cầu Cài đặt Trạng thái Môi trường

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Python:** Phiên bản 3.10 trở lên.
- **Node.js:** Phiên bản 18+ (Kèm theo `npm` hoặc `yarn`).
- **PostgreSQL:** Server PostgreSQL đã được bật và tạo sẵn một cơ sở dữ liệu trống (Ví dụ: `smartmath`).
- **Ollama:** Dùng để chạy mô hình AI nội bộ theo co che on-demand.

---

## 🚀 Bước 1: Thiết lập và Khởi chạy Backend

Backend được xây dựng bằng **FastAPI** và **SQLAlchemy**.

1. **Đi đến thư mục backend:**
   ```bash
   cd backend
   ```

2. **Kích hoạt môi trường ảo (Virtual Environment):**
   *(Nếu bạn đang sử dụng biến môi trường Conda đã cung cấp trước đó, có thể bỏ qua bước tạo venv nhưng hãy đảm bảo bạn đang ở đúng môi trường)*
   
   Tạo môi trường mới (Nếu dùng venv chuẩn của Python):
   ```bash
   python -m venv venv
   ```
   Kích hoạt trên **Windows**:
   ```bash
   .\venv\Scripts\activate
   ```
   
3. **Cài đặt các gói thư viện phụ thuộc:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Thiết lập biến môi trường:**
   Tạo tệp `.env` trong thư mục `backend/` với nội dung tương tự `.env.example`:
   ```env
   # Chuỗi kết nối Database (thay đổi user, password tương ứng)
   DATABASE_URL=postgresql://quannn:quannn1123@localhost/smartmath
   
   # Khóa bảo mật JWT
   SECRET_KEY=yoursecretkey_hoac_random_chuoi_bat_ky
   ALGORITHM=HS256
   
   # Cấu hình AI thông qua Ollama
   OLLAMA_API_BASE=http://localhost:11434/api
   OLLAMA_TEXT_MODEL=qwen3:1.7b
   OLLAMA_VISION_MODEL=glm-ocr:latest
   OLLAMA_KEEP_ALIVE=3m
   ```

5. **Khởi chạy Server:**
   (SQLAlchemy sẽ tự động chạy các hàm tạo bảng thông qua `Base.metadata.create_all` lúc khởi động app)
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *Backend sẽ chạy trên: **`http://localhost:8000`***
   *Tài liệu Swagger API: **`http://localhost:8000/docs`***

---

## 🖥️ Bước 2: Thiết lập và Khởi chạy Frontend

Frontend được phát triển trên **React** cùng công cụ Build tool **Vite**.

1. **Đi đến thư mục frontend (Mở Command Prompt/Terminal mới):**
   ```bash
   cd frontend
   ```

2. **Cài đặt các dependency Node:**
   ```bash
   npm install
   ```
   *Lưu ý: Nếu bị gặp lỗi phân giải hãy thử lệnh `npm install --legacy-peer-deps`.*

3. **Cấu hình biến môi trường kết nối Backend:**
   Kiểm tra tệp `.env` ở gốc thư mục `frontend/` để chắc chắn React biết gọi API về đâu:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Biên dịch và Khởi chạy Web:**
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy trên: **`http://localhost:5173`***

---

## 🤖 Bước 3: Cấu hình Dịch vụ AI (Ollama)

Du an ket noi truc tiep voi **Ollama** de load model khi can va giai phong tai nguyen theo `keep_alive`.

1. Tải và cài đặt **[Ollama](https://ollama.com/download)**.
2. Tải 2 model đã phê duyệt:
   ```bash
   ollama pull qwen3:1.7b
   ollama pull glm-ocr:latest
   ```
3. Khởi chạy daemon Ollama (nếu chưa tự chạy nền):
   ```bash
   ollama serve
   ```
4. Kiểm tra daemon hoạt động:
   ```bash
   curl http://localhost:11434/api/tags
   ```

---

## 📝 Xác nhận Lỗi và Bảo trì

- **Import Errors (Lỗi báo biến đỏ IDE):** Gần đây chúng tôi đã thiết lập `.vscode/settings.json` và `pyrightconfig.json`. Nếu dùng VS Code, bạn cần sử dụng Ctrl+Shift+P -> `Python: Select Interpreter` để chọn trỏ đúng vào thư mục `backend\venv\Scripts\python.exe` hoặc môi trường Conda tương ứng để thoát khỏi lỗi cảnh báo nhập vòng lặp ảo. Mọi đoạn code thực tế lúc chạy Server (`uvicorn`) vẫn hoàn toàn bình thường.
- Ngôn ngữ mặc định cho các thành phần tạo đề tự động trong AI đã được ràng buộc bằng Prompts (Tiếng Việt lớp 1-3).
- AI text model dùng `qwen3:1.7b`, OCR model dùng `glm-ocr:latest` thông qua Ollama.

---

## ✅ Hướng dẫn Chạy Test

Phần này dùng để kiểm tra nhanh trạng thái backend/frontend sau khi thay đổi code.

### 1) Backend tests (Pytest)

Từ thư mục gốc dự án:

```bash
backend\venv\Scripts\python.exe -m pytest -q backend/tests
```

Kỳ vọng:
- Test pass: hiển thị `X passed`.
- Có thể có cảnh báo `PydanticDeprecatedSince20` (warning, không phải fail test).

### 2) Frontend unit tests (Vitest)

Từ thư mục gốc dự án:

```bash
npm --prefix frontend run test
```

Kỳ vọng:
- Hiển thị danh sách file test pass.

### 3) Frontend lint

Từ thư mục gốc dự án:

```bash
npm --prefix frontend run lint
```

Ý nghĩa:
- Dùng để kiểm tra quy chuẩn TypeScript/React hooks.
- Nếu có lỗi lint, CI nội bộ thường xem như chưa đạt chất lượng code.

### 4) Bộ lệnh kiểm tra nhanh (khuyến nghị)

```bash
backend\venv\Scripts\python.exe -m pytest -q backend/tests
npm --prefix frontend run test
npm --prefix frontend run lint
```

Nếu cả 3 lệnh đều ổn thì có thể xem thay đổi là an toàn ở mức MVP hiện tại.
