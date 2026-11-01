/**
 * CẤU HÌNH HỆ THỐNG KẾT NỐI VÀ LƯU TRỮ DỮ LIỆU
 * Dự án: Tri ân & Chia tay Cha Phụ tá Thái
 * 
 * --------------------------------------------------------------------------
 * 1. CẤU HÌNH SUPABASE (KHUYÊN DÙNG)
 * --------------------------------------------------------------------------
 * HƯỚNG DẪN LẤY LINK VÀ KEY TRÊN SUPABASE:
 * 1. Đăng nhập https://supabase.com/ và chọn dự án của bạn.
 * 2. Nhấn vào biểu tượng Bánh răng (Project Settings ⚙️) ở thanh menu bên trái.
 * 3. Chọn thẻ "Data API":
 *    - Copy "Project URL" dán vào ô `url` bên dưới.
 *    - Copy key "anon public" dán vào ô `anonKey` bên dưới.
 */
window.SUPABASE_CONFIG = {
  url: "https://alvnvinkwtmrzflckkyw.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdm52aW5rd3RtcnpmbGNra3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MDg3OTcsImV4cCI6MjEwOTA4NDc5N30.QBPV9BeHVQ5HRtrnu-o1JofhUO_QSxE7w1E0T-8q6Aw"
};

/**
 * --------------------------------------------------------------------------
 * 2. CẤU HÌNH GOOGLE FIREBASE (DỰ PHÒNG NẾU DÙNG FIREBASE)
 * --------------------------------------------------------------------------
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
