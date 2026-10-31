/**
 * JAVASCRIPT: TRANG 1 - VIẾT VÀ GỬI THƯ TRI ÂN
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Khởi tạo Database
  await window.DB_SERVICE.init();

  // 2. Tham chiếu các phần tử DOM
  const form = document.getElementById('letterForm');
  const saintNameInput = document.getElementById('saintName');
  const fullNameInput = document.getElementById('fullName');
  const parishSelect = document.getElementById('parishSelect');
  const otherParishGroup = document.getElementById('otherParishGroup');
  const otherParishInput = document.getElementById('otherParishInput');
  const contentInput = document.getElementById('letterContent');
  const charCounter = document.getElementById('charCounter');
  
  // Photo & Canvas elements
  const btnUpload = document.getElementById('btnUpload');
  const btnCamera = document.getElementById('btnCamera');
  const fileInput = document.getElementById('fileInput');
  const previewCanvas = document.getElementById('previewCanvas');
  const canvasCtx = previewCanvas.getContext('2d');
  const canvasControls = document.getElementById('canvasControls');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnRotate = document.getElementById('btnRotate');
  const btnResetPhoto = document.getElementById('btnResetPhoto');
  const canvasHint = document.getElementById('canvasHint');

  // Camera modal elements
  const cameraModal = document.getElementById('cameraModal');
  const cameraVideo = document.getElementById('cameraVideo');
  const btnSnap = document.getElementById('btnSnap');
  const btnCloseCamera = document.getElementById('btnCloseCamera');
  let cameraStream = null;

  // Feedback & Loading
  const loadingOverlay = document.getElementById('loadingOverlay');
  const successModal = document.getElementById('successModal');
  const btnWriteAnother = document.getElementById('btnWriteAnother');
  const btnDeleteJustSent = document.getElementById('btnDeleteJustSent');
  let lastSavedLetterId = null;

  // 3. Khởi tạo danh sách Giáo họ / Giáo xứ
  const parishOptions = window.PARISH_OPTIONS || [
    "Gx Yên thịnh", "Gh Nông Tiến", "Gh công đa", "Gh Phú thịnh",
    "Gh Vinh Sơn", "Gh Tân Lập", "Gh Chuộng", "Gh Tràng Đà", "Khác"
  ];
  parishSelect.innerHTML = '<option value="" disabled selected>-- Chọn Giáo họ / Giáo xứ --</option>';
  parishOptions.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt;
    el.textContent = opt;
    parishSelect.appendChild(el);
  });

  parishSelect.addEventListener('change', () => {
    if (parishSelect.value === 'Khác') {
      otherParishGroup.style.display = 'block';
      otherParishInput.required = true;
      otherParishInput.focus();
    } else {
      otherParishGroup.style.display = 'none';
      otherParishInput.required = false;
    }
  });

  // Đếm ký tự thư
  contentInput.addEventListener('input', () => {
    const len = contentInput.value.length;
    charCounter.textContent = `${len} ký tự`;
  });

  // 4. Quản lý Ảnh và Canvas Lồng Khung
  const frameImg = new Image();
  frameImg.src = 'assets/images/khung.png';
  let isFrameLoaded = false;
  frameImg.onload = () => {
    isFrameLoaded = true;
    renderCanvas();
  };

  let userImg = null;
  let imgState = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0 // góc theo độ (0, 90, 180, 270)
  };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  // Khởi tạo Canvas chuẩn 800x800
  const CANVAS_SIZE = 800;
  previewCanvas.width = CANVAS_SIZE;
  previewCanvas.height = CANVAS_SIZE;

  function renderCanvas() {
    canvasCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (userImg) {
      canvasCtx.save();
      // Di chuyển về tâm canvas
      canvasCtx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      canvasCtx.translate(imgState.x, imgState.y);
      canvasCtx.rotate((imgState.rotation * Math.PI) / 180);
      canvasCtx.scale(imgState.scale, imgState.scale);

      // Vẽ ảnh người dùng căn giữa
      const w = userImg.width;
      const h = userImg.height;
      canvasCtx.drawImage(userImg, -w / 2, -h / 2, w, h);
      canvasCtx.restore();
    } else {
      // Khi chưa có ảnh người dùng, vẽ nền placeholder nhẹ nhàng
      canvasCtx.fillStyle = '#26160d';
      canvasCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      canvasCtx.fillStyle = '#ecd3a8';
      canvasCtx.font = '24px Montserrat, sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('Chưa có ảnh (Chụp hoặc tải ảnh lên)', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }

    // Vẽ khung đè lên trên cùng
    if (isFrameLoaded) {
      canvasCtx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }

  function setUserImage(img) {
    userImg = img;
    // Tự động scale sao cho ảnh vừa khít hoặc hơi tràn nhẹ khung
    const maxDim = Math.max(img.width, img.height);
    const minDim = Math.min(img.width, img.height);
    imgState.scale = CANVAS_SIZE / minDim;
    imgState.x = 0;
    imgState.y = 0;
    imgState.rotation = 0;

    canvasControls.style.display = 'flex';
    canvasHint.style.display = 'block';
    renderCanvas();
    showToast("Đã lồng ảnh vào khung! Bạn có thể kéo ảnh hoặc dùng nút zoom.");
  }

  // Tải ảnh từ máy
  btnUpload.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setUserImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Chụp ảnh trực tiếp từ Camera
  btnCamera.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback nếu trình duyệt không hỗ trợ getUserMedia: mở input capture
      fileInput.setAttribute('capture', 'environment');
      fileInput.click();
      return;
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      cameraVideo.srcObject = cameraStream;
      cameraModal.classList.add('active');
    } catch (err) {
      console.warn("Không thể mở trực tiếp webcam, dùng file input camera fallback:", err);
      fileInput.setAttribute('capture', 'environment');
      fileInput.click();
    }
  });

  btnSnap.addEventListener('click', () => {
    if (!cameraStream) return;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = cameraVideo.videoWidth || 640;
    snapCanvas.height = cameraVideo.videoHeight || 640;
    const snapCtx = snapCanvas.getContext('2d');
    snapCtx.drawImage(cameraVideo, 0, 0, snapCanvas.width, snapCanvas.height);

    const img = new Image();
    img.onload = () => {
      setUserImage(img);
      closeCameraModal();
    };
    img.src = snapCanvas.toDataURL('image/jpeg', 0.9);
  });

  function closeCameraModal() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    cameraModal.classList.remove('active');
  }

  btnCloseCamera.addEventListener('click', closeCameraModal);

  // Điều khiển Canvas (Zoom, Rotate, Pan kéo ảnh)
  btnZoomIn.addEventListener('click', () => {
    if (!userImg) return;
    imgState.scale *= 1.15;
    renderCanvas();
  });

  btnZoomOut.addEventListener('click', () => {
    if (!userImg) return;
    imgState.scale = Math.max(0.2, imgState.scale * 0.87);
    renderCanvas();
  });

  btnRotate.addEventListener('click', () => {
    if (!userImg) return;
    imgState.rotation = (imgState.rotation + 90) % 360;
    renderCanvas();
  });

  btnResetPhoto.addEventListener('click', () => {
    userImg = null;
    canvasControls.style.display = 'none';
    canvasHint.style.display = 'none';
    fileInput.value = '';
    renderCanvas();
    showToast("Đã gỡ ảnh");
  });

  // Kéo di chuyển ảnh trong Canvas
  function getEventCoords(e) {
    const rect = previewCanvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  previewCanvas.addEventListener('mousedown', (e) => {
    if (!userImg) return;
    isDragging = true;
    const coords = getEventCoords(e);
    dragStart = { x: coords.x - imgState.x, y: coords.y - imgState.y };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const coords = getEventCoords(e);
    imgState.x = coords.x - dragStart.x;
    imgState.y = coords.y - dragStart.y;
    renderCanvas();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Hỗ trợ Touch trên di động
  previewCanvas.addEventListener('touchstart', (e) => {
    if (!userImg) return;
    isDragging = true;
    const coords = getEventCoords(e);
    dragStart = { x: coords.x - imgState.x, y: coords.y - imgState.y };
  }, { passive: false });

  previewCanvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const coords = getEventCoords(e);
    imgState.x = coords.x - dragStart.x;
    imgState.y = coords.y - dragStart.y;
    renderCanvas();
  }, { passive: false });

  previewCanvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  // 5. Gửi thư
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = fullNameInput.value.trim();
    const parish = parishSelect.value;
    const otherParish = otherParishInput.value.trim();
    const content = contentInput.value.trim();

    if (!fullName) {
      showToast("Vui lòng điền họ và tên của bạn!");
      fullNameInput.focus();
      return;
    }

    if (!parish) {
      showToast("Vui lòng chọn Giáo họ hoặc Giáo xứ!");
      parishSelect.focus();
      return;
    }

    if (parish === 'Khác' && !otherParish) {
      showToast("Vui lòng nhập tên Giáo họ / Giáo xứ của bạn!");
      otherParishInput.focus();
      return;
    }

    if (!content) {
      showToast("Vui lòng viết lời chúc hoặc tâm tình gửi đến Cha!");
      contentInput.focus();
      return;
    }

    // Hiển thị loading
    loadingOverlay.classList.add('active');

    try {
      // Xuất ảnh kèm khung từ Canvas (chất lượng JPEG 0.85 tối ưu)
      let photoData = "";
      if (userImg) {
        photoData = previewCanvas.toDataURL('image/jpeg', 0.85);
      }

      const letterRecord = {
        saintName: saintNameInput.value,
        fullName: fullName,
        parish: parish === 'Khác' ? otherParish : parish,
        otherParish: otherParish,
        content: content,
        photoData: photoData
      };

      const res = await window.DB_SERVICE.saveLetter(letterRecord);

      loadingOverlay.classList.remove('active');

      if (res && res.success) {
        lastSavedLetterId = res.id;
        successModal.classList.add('active');
      } else {
        showToast("Có lỗi xảy ra khi lưu thư, vui lòng thử lại!");
      }
    } catch (err) {
      loadingOverlay.classList.remove('active');
      console.error(err);
      showToast("Có lỗi xảy ra: " + err.message);
    }
  });

  // Xóa bức thư vừa gửi nếu gửi nhầm
  if (btnDeleteJustSent) {
    btnDeleteJustSent.addEventListener('click', async () => {
      if (!lastSavedLetterId) return;
      if (confirm("Bạn có chắc chắn muốn xóa bức thư vừa gửi không?")) {
        loadingOverlay.classList.add('active');
        await window.DB_SERVICE.deleteLetter(lastSavedLetterId);
        loadingOverlay.classList.remove('active');
        lastSavedLetterId = null;
        successModal.classList.remove('active');
        showToast("Đã xóa bức thư vừa gửi thành công!");
      }
    });
  }

  // Viết thư khác
  btnWriteAnother.addEventListener('click', () => {
    form.reset();
    userImg = null;
    lastSavedLetterId = null;
    canvasControls.style.display = 'none';
    canvasHint.style.display = 'none';
    otherParishGroup.style.display = 'none';
    charCounter.textContent = '0 ký tự';
    renderCanvas();
    successModal.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Toast Helper
  function showToast(msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
});

