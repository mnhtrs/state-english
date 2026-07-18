<div align="center">
  <img src="./public/favicon.svg" alt="Statelish Logo" width="120" height="120" />
  
  # Statelish
  
  **Understand English. Don't Translate It.**
</div>

---

## 🌟 Giới thiệu

**Statelish** là công cụ học tiếng Anh thế hệ mới giúp bạn học từ vựng dựa trên ngữ cảnh thực tế, cảm giác từ (state) thay vì dịch từng từ sang tiếng Việt một cách máy móc. 

Hệ thống được tích hợp **AI (Google Gemini)** để phân tích tự động, sinh các ví dụ thực tế và tạo ra các bài tập dịch thuật, giúp người học ghi nhớ sâu và áp dụng một cách tự nhiên.

## ✨ Tính năng nổi bật

- 🤖 **Phân tích bằng AI**: Tự động giải nghĩa, chỉ ra các cách dùng phổ biến và những trường hợp dễ bị hiểu sai nhất của từ vựng.
- 🎯 **Bài tập thực hành**: AI sinh ra bài tập dịch thuật tương tác chấm điểm ngay lập tức.
- 📚 **Sổ tay từ vựng**: Lưu trữ từ vựng theo ngày tháng (IndexedDB).
- 🔗 **Tra cứu nhanh**: Kết nối trực tiếp với YouGlish, Cambridge, Oxford và Dictionary.com.

## 🚀 Cài đặt & Chạy dự án

1. Clone repository về máy.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Tạo file `.env` ở thư mục gốc và thêm API key của Google Gemini:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Khởi động server phát triển:
   ```bash
   npm run dev
   ```
