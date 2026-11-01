/**
 * Module quản lý dữ liệu: Hỗ trợ Supabase Cloud, Firebase Firestore, và LocalStorage Fallback
 */

const DB_SERVICE = {
  activeBackend: 'local', // 'supabase' | 'firebase' | 'local'
  supabaseClient: null,
  firestore: null,

  // Khởi tạo
  async init() {
    // 1. Kiểm tra cấu hình Supabase (Ưu tiên số 1)
    const supa = window.SUPABASE_CONFIG;
    const isSupaValid = supa && 
                        supa.url && 
                        supa.anonKey && 
                        supa.url !== "YOUR_SUPABASE_URL" && 
                        !supa.url.includes("YOUR_");

    if (isSupaValid) {
      // Đợi tối đa 2.5 giây nếu thư viện Supabase JS từ CDN đang tải về
      let supaLib = (typeof window !== 'undefined' && window.supabase) || (typeof supabase !== 'undefined' ? supabase : null);
      if (!supaLib || !supaLib.createClient) {
        for (let i = 0; i < 25; i++) {
          await new Promise(res => setTimeout(res, 100));
          supaLib = (typeof window !== 'undefined' && window.supabase) || (typeof supabase !== 'undefined' ? supabase : null);
          if (supaLib && supaLib.createClient) break;
        }
      }

      if (supaLib && supaLib.createClient) {
        try {
          const cleanUrl = supa.url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
          this.supabaseClient = supaLib.createClient(cleanUrl, supa.anonKey);
          this.activeBackend = 'supabase';
          console.log("✅ Đã kết nối thành công với Supabase Cloud Database:", cleanUrl);

          // Tự động đẩy các bức thư đã viết trước đó trên thiết bị này lên Supabase
          await this.syncLocalLettersToSupabase();
          return;
        } catch (err) {
          console.warn("⚠️ Không thể kết nối Supabase, thử fallback:", err);
        }
      }
    }

    // 2. Kiểm tra cấu hình Firebase
    const config = window.FIREBASE_CONFIG;
    const isFirebaseValid = config && 
                            config.apiKey && 
                            config.apiKey !== "YOUR_API_KEY" && 
                            !config.apiKey.includes("YOUR_");

    if (isFirebaseValid && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        this.firestore = firebase.firestore();
        this.activeBackend = 'firebase';
        console.log("✅ Đã kết nối thành công với Google Firebase Firestore!");
        return;
      } catch (err) {
        console.warn("⚠️ Không thể kết nối Firebase, chuyển sang LocalStorage:", err);
      }
    }

    // 3. Fallback LocalStorage (Chế độ chạy tạm trên máy)
    this.activeBackend = 'local';
    console.log("ℹ️ Đang hoạt động ở chế độ Demo / Bộ nhớ cục bộ (LocalStorage).");
    this.initSampleDataIfEmpty();
  },

  initSampleDataIfEmpty() {
    const existing = localStorage.getItem("cta_cha_thai_letters");
    if (!existing) {
      localStorage.setItem("cta_cha_thai_letters", JSON.stringify([]));
    }
  },

  // Tự động đồng bộ các thư đã viết trong chế độ Demo (LocalStorage) lên Supabase
  async syncLocalLettersToSupabase() {
    if (this.activeBackend !== 'supabase' || !this.supabaseClient) return;

    try {
      const localLetters = this.getLocalStorageLetters();
      const mySent = this.getMySentLetters();

      // Thu thập tất cả thư được tạo trước đó trên máy này (bắt đầu bằng 'local-')
      const letterMap = new Map();
      [...localLetters, ...mySent].forEach(l => {
        if (l && l.id && String(l.id).startsWith('local-')) {
          letterMap.set(String(l.id), l);
        }
      });

      const lettersToSync = Array.from(letterMap.values());
      if (lettersToSync.length === 0) return;

      console.log(`Đang tự động đồng bộ ${lettersToSync.length} bức thư đã viết trước đó lên Supabase...`);

      for (const letter of lettersToSync) {
        const record = {
          saintName: (letter.saintName || "").trim(),
          fullName: (letter.fullName || "").trim(),
          parish: (letter.parish || "").trim(),
          otherParish: (letter.otherParish || "").trim(),
          content: (letter.content || "").trim(),
          photoData: letter.photoData || "",
          createdAt: letter.createdAt || new Date().toISOString()
        };

        // Bỏ qua nếu là bản ghi rỗng
        if (!record.fullName && !record.content) continue;

        let res = await this.supabaseClient.from('letters').insert([{
          saintName: record.saintName,
          fullName: record.fullName,
          parish: record.parish,
          otherParish: record.otherParish,
          content: record.content,
          photoData: record.photoData,
          createdAt: record.createdAt
        }]).select();

        if (res.error) {
          res = await this.supabaseClient.from('letters').insert([{
            saint_name: record.saintName,
            full_name: record.fullName,
            parish: record.parish,
            other_parish: record.otherParish,
            content: record.content,
            photo_data: record.photoData,
            created_at: record.createdAt
          }]).select();
        }

        if (!res.error && res.data && res.data[0]) {
          const newId = String(res.data[0].id);
          const oldId = letter.id;

          // Cập nhật lại ID mới trong local storage để không gửi trùng lặp
          const mySentItem = mySent.find(s => s && s.id === oldId);
          if (mySentItem) mySentItem.id = newId;

          const localItem = localLetters.find(l => l && l.id === oldId);
          if (localItem) localItem.id = newId;
        }
      }

      localStorage.setItem("cta_cha_thai_letters", JSON.stringify(localLetters));
      localStorage.setItem("cta_my_sent_letters", JSON.stringify(mySent));
      console.log("✅ Đã đồng bộ thành công các thư đã viết lên Supabase!");
    } catch (e) {
      console.warn("Lỗi tự động đồng bộ thư cũ lên Supabase:", e);
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
      photoData: letterData.photoData || "", // Ảnh đã lồng khung (base64)
      createdAt: new Date().toISOString()
    };

    if (this.activeBackend === 'supabase' && this.supabaseClient) {
      try {
        // Thử insert camelCase
        let res = await this.supabaseClient.from('letters').insert([{
          saintName: record.saintName,
          fullName: record.fullName,
          parish: record.parish,
          otherParish: record.otherParish,
          content: record.content,
          photoData: record.photoData,
          createdAt: record.createdAt
        }]).select();

        // Nếu bảng SQL được tạo theo snake_case (saint_name, full_name, photo_data...)
        if (res.error) {
          res = await this.supabaseClient.from('letters').insert([{
            saint_name: record.saintName,
            full_name: record.fullName,
            parish: record.parish,
            other_parish: record.otherParish,
            content: record.content,
            photo_data: record.photoData,
            created_at: record.createdAt
          }]).select();
        }

        if (res.error) {
          throw res.error;
        }

        const insertedId = (res.data && res.data[0] && res.data[0].id) 
          ? String(res.data[0].id) 
          : 'supa-' + Date.now();

        return { success: true, id: insertedId };
      } catch (err) {
        console.error("Lỗi khi lưu vào Supabase:", err);
        const id = this.saveToLocalStorage(record);
        return { success: true, id: id, warning: "Lỗi kết nối Supabase, đã lưu tạm vào máy" };
      }
    } else if (this.activeBackend === 'firebase' && this.firestore) {
      try {
        const docRef = await this.firestore.collection("letters").add(record);
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error("Lỗi lưu lên Firebase Firestore:", error);
        const id = this.saveToLocalStorage(record);
        return { success: true, id: id, warning: "Đã lưu tạm vào máy" };
      }
    } else {
      const id = this.saveToLocalStorage(record);
      return { success: true, id: id };
    }
  },

  // Xóa một bức thư theo ID
  async deleteLetter(id) {
    this.removeMySentLetter(id);

    if (this.activeBackend === 'supabase' && this.supabaseClient) {
      try {
        if (!String(id).startsWith('local-')) {
          await this.supabaseClient.from('letters').delete().eq('id', id);
        }
        this.removeFromLocalList(id);
        return { success: true };
      } catch (err) {
        console.error("Lỗi xóa thư trên Supabase:", err);
        this.removeFromLocalList(id);
        return { success: false, error: err.message };
      }
    } else if (this.activeBackend === 'firebase' && this.firestore) {
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

  // Đăng ký nhận danh sách thư (Realtime)
  subscribeLetters(callback) {
    if (this.activeBackend === 'supabase' && this.supabaseClient) {
      const normalize = (rows) => {
        return (rows || []).map(r => ({
          id: String(r.id),
          saintName: r.saintName || r.saint_name || '',
          fullName: r.fullName || r.full_name || '',
          parish: r.parish || '',
          otherParish: r.otherParish || r.other_parish || '',
          content: r.content || '',
          photoData: r.photoData || r.photo_data || '',
          createdAt: r.createdAt || r.created_at || new Date().toISOString()
        })).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      };

      const loadLetters = async () => {
        try {
          const { data, error } = await this.supabaseClient.from('letters').select('*');
          if (!error && data) {
            callback(normalize(data));
          } else {
            console.warn("Lỗi tải thư Supabase:", error);
            callback(this.getLocalStorageLetters());
          }
        } catch (e) {
          console.warn("Lỗi gọi Supabase:", e);
          callback(this.getLocalStorageLetters());
        }
      };

      loadLetters();

      // Lắng nghe Realtime khi có thư mới hoặc xóa thư
      try {
        const channel = this.supabaseClient
          .channel('public:letters')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, () => {
            loadLetters();
          })
          .subscribe();

        return () => {
          this.supabaseClient.removeChannel(channel);
        };
      } catch (e) {
        console.warn("Lỗi subscribe channel Supabase:", e);
      }
      return () => {};
    }

    if (this.activeBackend === 'firebase' && this.firestore) {
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
        console.warn("Lỗi onSnapshot Firebase:", err);
      }
    }

    // Chế độ LocalStorage
    const loadLocal = () => {
      const letters = this.getLocalStorageLetters();
      letters.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      callback(letters);
    };

    loadLocal();
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

  // Lưu vào LocalStorage
  saveToLocalStorage(record) {
    const letters = this.getLocalStorageLetters();
    const id = "local-" + Date.now();
    letters.push({ ...record, id });
    localStorage.setItem("cta_cha_thai_letters", JSON.stringify(letters));
    return id;
  },

  removeFromLocalList(id) {
    let letters = this.getLocalStorageLetters();
    letters = letters.filter(l => l.id !== id);
    localStorage.setItem("cta_cha_thai_letters", JSON.stringify(letters));

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

  getMySentLetters() {
    try {
      const data = localStorage.getItem("cta_my_sent_letters");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMySentLetter(letterRecord) {
    const list = this.getMySentLetters();
    list.unshift(letterRecord);
    localStorage.setItem("cta_my_sent_letters", JSON.stringify(list));
  },

  removeMySentLetter(id) {
    let list = this.getMySentLetters();
    list = list.filter(item => item.id !== id);
    localStorage.setItem("cta_my_sent_letters", JSON.stringify(list));
  },

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
