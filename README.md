# DỰ ÁN HỘP THƯ TRI ÂN & CHIA TAY CHA PHỤ TÁ THÁI

Dự án gồm **2 trang web độc lập** phục vụ dịp tri ân và chia tay Cha Phụ tá Thái:
1. **Trang 1 (`index.html`)**: Trang dành cho giáo dân, cộng đoàn viết thư, gửi lời chúc và chụp/tải ảnh lồng khung lưu niệm.
2. **Trang 2 (`doc-thu.html`)**: Trang dành riêng cho Cha phụ tá Thái mở quà, lắng nghe bài thánh ca "Chính Chúa Chọn Con" qua máy đĩa than cổ điển, ngắm mưa sticker chúc lành và thưởng lãm từng bức thư kèm ảnh kỷ niệm.

---

## 🌟 CÁC TÍNH NĂNG NỔI BẬT

### 1. Trang Viết Thư (`index.html`)
- **Điền thông tin trang trọng**:
  - Tên Thánh (gợi ý Giuse, Maria, Phêrô...).
  - Tên đệm và tên.
  - Giáo họ / Giáo xứ (chọn từ danh sách chuẩn: *Gx Yên thịnh, Gh Nông Tiến, Gh công đa, Gh Phú thịnh, Gh Vinh Sơn, Gh Tân Lập, Gh Chuộng, Gh Tràng Đà, Khác*). Khi chọn *Khác*, tự động mở ô nhập tên giáo họ/giáo xứ.
- **Viết thư tri ân**: Khung giấy thư cổ điển với dòng kẻ thanh tao, đếm ký tự.
- **Chụp ảnh & Tải ảnh lồng khung (`khung.png`)**:
  - Tùy chọn **Chụp ảnh trực tiếp từ Camera** hoặc **Tải ảnh từ máy**.
  - Tự động lồng vào khung ảnh lưu niệm trang trọng.
  - Hỗ trợ công cụ tương tác: **Kéo ảnh di chuyển (chuột / cảm ứng tay), Phóng to (+), Thu nhỏ (-), Xoay ảnh 90°** để khuôn mặt vừa vặn đẹp nhất trong khung.
- **Gửi thư**: Tự động xuất ảnh đã lồng khung, gửi lên hệ thống và hiển thị thông báo chúc lành ấm áp.

### 2. Trang Đọc Thư Của Cha (`doc-thu.html`)
- **Máy phát nhạc đĩa than cổ điển**:
  - Mâm đĩa than gỗ với đĩa than tròn (`assets/images/vinyl.png`) và cần gạt kim (`assets/images/tonearm.png`).
  - Khi Cha nhấn **"BẬT ĐĨA HÁT & MỞ HỘP THƯ"**:
    - Cần gạt kim từ từ hạ xuống đĩa.
    - Đĩa than quay tròn đều và phát bài thánh ca *"Chính Chúa Chọn Con"*.
    - Máy phát nhạc thu nhỏ lại di chuyển lên góc trên bên phải màn hình thành **Mini Player** nổi, Cha có thể chạm vào để tạm dừng/phát tiếp bất cứ lúc nào.
- **Hiệu ứng Mưa Sticker**:
  - 7 sticker đã được cắt tỉ mỉ từ ảnh gốc.
  - **Quy tắc tuyệt đối**: Mưa sticker rơi thẳng nhẹ nhàng từ trên xuống, **KHÔNG XOAY STICKER** theo đúng ý nguyện.
- **Danh sách thư tri ân**:
  - **Gửi trước hiện trước, gửi sau hiện sau** (sắp xếp tăng dần theo thời gian gửi - FIFO).
  - Đánh số thứ tự từng thư: *Thư số #1, Thư số #2...*
  - Bộ lọc nhanh theo từng Giáo họ / Giáo xứ và ô tìm kiếm theo tên.
- **Mở thư đọc**:
  - Khung giấy thư mở ra với **Font chữ viết hoa cách điệu** trang nhã.
  - **Bên cạnh bức thư**: Ảnh kỷ niệm kèm khung hiển thị trang trọng.
  - **Phía bên dưới ảnh**: Dòng chữ / nút **"Nhấn để xem ảnh"** -> Nhấn vào sẽ phóng to ảnh sắc nét toàn màn hình (Lightbox).
  - **Nút Thoát**: Nhấn thoát để trở về danh sách thư.
  - Ngay sau khi thoát: Thư đó được đánh dấu là **"ĐÃ MỞ"** (đổi tem sang màu xám đã đọc và lưu lại trên máy của Cha).

---

## ❓ GIẢI ĐÁP CÂU HỎI: CÓ CẦN GÌ ĐỂ LƯU ẢNH VÀ THƯ KHÔNG?

> **"Không biết tôi có cần thứ gì để lưu ảnh của mọi người chụp để khi cha phụ tá mở lên có thể xem được ảnh không?"**

**CÂU TRẢ LỜI: CÓ, RẤT CẦN THIẾT!**
- Vì bạn sẽ tải website lên **GitHub Pages**, mà GitHub Pages là dịch vụ web tĩnh (Static Web), **không có máy chủ hay cơ sở dữ liệu** để lưu lại ảnh và chữ mà người khác nhập.
- Nếu không có cơ sở dữ liệu đám mây kết nối, thư người ta viết sẽ chỉ nằm trên điện thoại của họ, Cha mở máy của Cha lên sẽ **không thấy được gì**.
- **Giải pháp tối ưu và miễn phí 100%:** Sử dụng **Google Firebase Firestore**:
  - Hoàn toàn miễn phí của Google.
  - Không cần cài đặt server hay backend phức tạp.
  - Thời gian thực (Real-time): Khi Cha đang mở web, ai gửi thư mới là màn hình của Cha tự động cập nhật ngay lập tức!

### HƯỚNG DẪN KẾT NỐI GOOGLE FIREBASE TRONG 2 PHÚT:
1. Mở trình duyệt vào trang: [https://console.firebase.google.com/](https://console.firebase.google.com/) (đăng nhập bằng Gmail).
2. Nhấn **"Add project" (Thêm dự án)** -> Đặt tên (ví dụ: `tri-an-cha-thai`) -> Nhấn Tiếp tục cho đến khi tạo xong.
3. Trong trang dự án:
   - Nhấn vào biểu tượng **Web (hình `</>`)** để tạo app.
   - Đặt tên app, nhấn **Register app**.
   - Copy đoạn mã `firebaseConfig = { apiKey: "...", ... }`.
   - Mở file **`config.js`** trong thư mục dự án và dán thông tin vào `window.FIREBASE_CONFIG`.
4. Bật cơ sở dữ liệu:
   - Ở cột menu bên trái, chọn **Build** -> **Firestore Database** -> Nhấn **Create database**.
   - Chọn vị trí (ví dụ: `asia-southeast1` hoặc mặc định) -> Chọn **Start in test mode (Bắt đầu ở chế độ thử nghiệm)** -> Nhấn **Enable**.
5. **Xong!** Bây giờ bất kỳ ai ở bất kỳ đâu quét mã viết thư và chụp ảnh thì Cha Thái ở máy khác đều nhận được đầy đủ ngay lập tức.

*(Lưu ý: Hiện tại hệ thống đã tích hợp sẵn chế độ **Thử nghiệm cục bộ (LocalStorage)** kèm sẵn 3 bức thư mẫu để bạn có thể mở web lên xem thử ngay trên máy tính mà không bị lỗi).*

---

## 🚀 HƯỚNG DẪN ĐƯA LÊN GITHUB PAGES & TẠO 2 MÃ QR

1. Tạo một repository mới trên GitHub (ví dụ: `tri-an-cha-thai`).
2. Tải toàn bộ thư mục dự án này lên repository đó.
3. Vào mục **Settings** của repository -> Chọn **Pages** (ở cột bên trái).
4. Tại mục **Branch**, chọn `main` (hoặc `master`) và thư mục `/ (root)` -> Nhấn **Save**.
5. Đợi 1 phút, GitHub Pages sẽ cấp link trang web cho bạn, ví dụ:
   - `https://ten-ban.github.io/tri-an-cha-thai/` (Đây chính là trang viết thư: `index.html`).
   - `https://ten-ban.github.io/tri-an-cha-thai/doc-thu.html` (Đây chính là trang đọc thư của Cha: `doc-thu.html`).
6. Tạo 2 mã QR riêng biệt:
   - Vào các trang tạo mã QR miễn phí (như [qr-code-generator.com](https://www.qr-code-generator.com/) hoặc [me-qr.com](https://me-qr.com/)).
   - **Mã QR 1**: Dán link `https://ten-ban.github.io/tri-an-cha-thai/` -> In ra để ở bàn tiệc / phát cho cộng đoàn quét viết thư.
   - **Mã QR 2**: Dán link `https://ten-ban.github.io/tri-an-cha-thai/doc-thu.html` -> In trang trọng vào thiệp hoặc phong bì riêng để gửi tặng Cha phụ tá Thái!

