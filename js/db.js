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
      localStorage.setItem("cta_cha_thai_letters", JSON.stringify([]));
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

  // Xóa một bức thư theo ID
  async deleteLetter(id) {
    if (this.isFirebaseActive && this.firestore) {
      try {
        await this.firestore.collection("letters").doc(id).delete();
        this.removeFromLocalList(id);
        return { success: true };
      } catch (err) {
        console.error("Lỗi xóa thư trên Firebase:", err);
        return { success: false, error: err.message };
      }
    } else {
      this.removeFromLocalList(id);
      return { success: true };
    }
  },

  removeFromLocalList(id) {
    let letters = this.getLocalStorageLetters();
    letters = letters.filter(l => l.id !== id);
    localStorage.setItem("cta_cha_thai_letters", JSON.stringify(letters));

    // Xóa cả trong danh sách đã mở nếu có
    let opened = this.getOpenedLetterIds();
    opened = opened.filter(oId => oId !== id);
    localStorage.setItem("cta_opened_letters", JSON.stringify(opened));
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

