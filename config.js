/**
 * CẤU HÌNH HỆ THỐNG KẾT NỐI VÀ LƯU TRỮ DỮ LIỆU
 * Dự án: Tri ân & Chia tay Cha Phụ tá Thái
 * 
 * HƯỚNG DẪN DÀNH CHO BẠN (Rất dễ - chỉ mất 2 phút):
 * Vì bạn đăng lên GitHub Pages (trang tĩnh), để khi người này chụp ảnh và viết thư ở máy họ
 * mà Cha phụ tá mở ở máy của Cha có thể xem được, bạn cần dùng cơ sở dữ liệu đám mây miễn phí Google Firebase.
 * 
 * CÁC BƯỚC THỰC HIỆN:
 * 1. Truy cập https://console.firebase.google.com/ và đăng nhập bằng tài khoản Google (Gmail).
 * 2. Nhấn "Thêm dự án" (Add project), đặt tên (ví dụ: tri-an-cha-thai) rồi bấm Tiếp tục -> Tạo dự án.
 * 3. Vào dự án vừa tạo:
 *    - Nhấn vào biểu tượng Web (hình </>) để tạo ứng dụng web.
 *    - Đặt tên app, rồi copy đoạn firebaseConfig dán đè vào phần bên dưới.
 *    - Ở menu bên trái, vào "Build" -> "Firestore Database" -> bấm "Create database" (Tạo cơ sở dữ liệu),
 *      chọn chế độ "Start in test mode" (Bắt đầu ở chế độ thử nghiệm) -> Bấm Tiếp tục -> Xong!
 * 
 * LƯU Ý: Nếu bạn chưa điền thông tin bên dưới, hệ thống sẽ TỰ ĐỘNG chạy ở chế độ "Thử nghiệm cục bộ" (Demo / LocalStorage)
 * để bạn có thể mở web lên test ngay lập tức trên máy tính của bạn!
 */

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Cấu hình danh sách Giáo họ / Giáo xứ
window.PARISH_OPTIONS = [
  "Gx Yên thịnh",
  "Gh Nông Tiến",
  "Gh công đa",
  "Gh Phú thịnh",
  "Gh Vinh Sơn",
  "Gh Tân Lập",
  "Gh Chuộng",
  "Gh Tràng Đà",
  "Khác"
];

// Danh sách các sticker mưa
window.STICKER_FILES = [
  "assets/stickers/sticker_0.png",
  "assets/stickers/sticker_1.png",
  "assets/stickers/sticker_2.png",
  "assets/stickers/sticker_3.png",
  "assets/stickers/sticker_4.png",
  "assets/stickers/sticker_5.png",
  "assets/stickers/sticker_6.png"
];

