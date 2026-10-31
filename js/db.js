/**
 * Module quản lý dữ liệu: Hỗ trợ Firebase Firestore Cloud (đồng bộ nhiều máy) 
 * và LocalStorage Fallback (thử nghiệm trên máy)
 */

const DB_SERVICE = {
  isFirebaseActive: false,
  firestore: null,

  // Khởi tạo
  async init() {
    const config = window.FIREBASE_CONFIG;
    const isConfigValid = config && 
                          config.apiKey && 
                          config.apiKey !== "YOUR_API_KEY" && 
                          !config.apiKey.includes("YOUR_");

    if (isConfigValid && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        this.firestore = firebase.firestore();
        this.isFirebaseActive = true;
        console.log("✅ Đã kết nối thành công với Google Firebase Firestore!");
      } catch (err) {
        console.warn("⚠️ Không thể kết nối Firebase, chuyển sang chế độ LocalStorage:", err);
        this.isFirebaseActive = false;
      }
    } else {
      console.log("ℹ️ Đang hoạt động ở chế độ Demo / Bộ nhớ cục bộ (LocalStorage).");
      this.initSampleDataIfEmpty();
    }
  },

  // Khởi tạo dữ liệu mẫu nếu chưa có dữ liệu để xem thử nghiệm
  initSampleDataIfEmpty() {
    const existing = localStorage.getItem("cta_cha_thai_letters");
    if (!existing) {
      const sampleLetters = [
        {
          id: "demo-1",
          saintName: "Giuse",
          fullName: "Nguyễn Văn Hoan",
          parish: "Gx Yên thịnh",
          otherParish: "",
          content: "Kính thưa Cha phụ tá Thái thân yêu!\nChúng con xin hết lòng cảm tạ Cha vì những năm tháng Cha đã hết lòng phục vụ cộng đoàn chúng con với tình thương mục tử hiền lành và khiêm nhường. Từng thánh lễ Cha dâng, từng lời giảng và nụ cười ấm áp của Cha sẽ mãi in đậm trong tâm trí chúng con. Nguyện xin Thiên Chúa, Mẹ Maria và Thánh Cả Giuse luôn đồng hành, ban cho Cha muôn ơn lành hồn xác trong hành trình sứ vụ mới!",
          photoData: "assets/images/khung.png", // Ảnh mẫu kèm khung
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
        },
        {
          id: "demo-2",
          saintName: "Maria",
          fullName: "Trần Thị Mai & Ban Lễ Sinh",
          parish: "Gh Nông Tiến",
          otherParish: "",
          content: "Cha thân yêu,\nCảm ơn Cha vì đã luôn tận tình hướng dẫn, dạy bảo và nâng đỡ chúng con trong từng giờ kinh, từng thánh lễ. Cha đi rồi chúng con nhớ Cha nhiều lắm. Chúng con xin hứa sẽ tiếp tục siêng năng việc nhà Chúa như Cha đã dạy dỗ. Chúng con kính chúc Cha luôn bình an, mạnh khỏe và tràn đầy niềm vui của người môn đệ Chúa Kitô!",
          photoData: "assets/images/khung.png",
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
        },
        {
          id: "demo-3",
          saintName: "Phêrô",
          fullName: "Lê Đức Tuấn",
          parish: "Gh Chuộng",
          otherParish: "",
          content: "Kính gửi Cha Thái!\nTạ ơn Chúa đã gửi Cha đến với giáo xứ và các giáo họ chúng con. Dù thời gian trôi qua, hình ảnh vị mục tử nhân hậu, gần gũi với đoàn chiên sẽ luôn ở lại trong trái tim mỗi người chúng con. Xin Cha nhớ cầu nguyện cho chúng con, và chúng con cũng sẽ luôn nhớ đến Cha trong từng lời kinh mỗi ngày.",
          photoData: "assets/images/khung.png",
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ];
      localStorage.setItem("cta_cha_thai_letters", JSON.stringify(sampleLetters));
    }
  },

  // Lưu thư mới
  async saveLetter(letterData) {
    const record = {
      saintName: (letterData.saintName || "").trim(),
      fullName: (letterData.fullName || "").trim(),
      parish: (letterData.parish || "").trim(),
      otherParish: (letterData.otherParish || "").trim(),
      content: (letterData.content || "").trim(),
      photoData: letterData.photoData || "", // Ảnh đã lồng khung
      createdAt: new Date().toISOString()
    };

    if (this.isFirebaseActive && this.firestore) {
      try {
        const docRef = await this.firestore.collection("letters").add(record);
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error("Lỗi lưu lên Firebase Firestore:", error);
        // Fallback lưu local nếu Firebase gặp lỗi
        this.saveToLocalStorage(record);
        return { success: true, id: "local-" + Date.now(), warning: "Đã lưu tạm vào máy" };
      }
    } else {
      const id = this.saveToLocalStorage(record);
      return { success: true, id: id };
    }
  },

  // Lưu vào LocalStorage
  saveToLocalStorage(record) {
    const letters = this.getLocalStorageLetters();
    const id = "local-" + Date.now();
    letters.push({ ...record, id });
    localStorage.setItem("cta_cha_thai_letters", JSON.stringify(letters));
    return id;
  },

  getLocalStorageLetters() {
    try {
      const data = localStorage.getItem("cta_cha_thai_letters");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Lấy danh sách thư và đăng ký lắng nghe thời gian thực (Realtime Listener)
  // Theo thứ tự gửi trước hiện trước, gửi sau hiện sau (createdAt ASC)
  subscribeLetters(callback) {
    if (this.isFirebaseActive && this.firestore) {
      try {
        return this.firestore.collection("letters")
          .orderBy("createdAt", "asc")
          .onSnapshot(
            snapshot => {
              const letters = [];
              snapshot.forEach(doc => {
                letters.push({
                  id: doc.id,
                  ...doc.data()
                });
              });
              callback(letters);
            },
            error => {
              console.error("Lỗi khi tải thư từ Firebase:", error);
              callback(this.getLocalStorageLetters());
            }
          );
      } catch (err) {
        console.warn("Lỗi onSnapshot, fallback về LocalStorage", err);
      }
    }

    // Chế độ LocalStorage
    const loadLocal = () => {
      const letters = this.getLocalStorageLetters();
      // Sắp xếp gửi trước hiện trước
      letters.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      callback(letters);
    };

    loadLocal();
    // Lắng nghe sự kiện storage nếu mở nhiều tab trên cùng trình duyệt
    const handleStorageChange = (e) => {
      if (e.key === "cta_cha_thai_letters") {
        loadLocal();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  },

  // Quản lý trạng thái đã mở thư của Cha
  getOpenedLetterIds() {
    try {
      const ids = localStorage.getItem("cta_opened_letters");
      return ids ? JSON.parse(ids) : [];
    } catch (e) {
      return [];
    }
  },

  markLetterAsOpened(id) {
    const ids = this.getOpenedLetterIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem("cta_opened_letters", JSON.stringify(ids));
    }
  }
};

window.DB_SERVICE = DB_SERVICE;

