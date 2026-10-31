/**
 * JAVASCRIPT: TRANG 2 - ĐỌC THƯ DÀNH RIÊNG CHO CHA PHỤ TÁ THÁI
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Khởi tạo Database
  await window.DB_SERVICE.init();

  // 2. Tham chiếu DOM
  // Audio & Turntable
  const bgAudio = document.getElementById('bgAudio');
  const introTurntableOverlay = document.getElementById('introTurntableOverlay');
  const btnStartTurntable = document.getElementById('btnStartTurntable');
  const vinylDisc = document.getElementById('vinylDisc');
  const tonearmImg = document.getElementById('tonearmImg');
  
  // Mini Player
  const miniPlayer = document.getElementById('miniPlayer');
  const miniVinyl = document.getElementById('miniVinyl');
  const btnMiniToggle = document.getElementById('btnMiniToggle');
  const miniIcon = document.getElementById('miniIcon');
  const miniStatusText = document.getElementById('miniStatusText');

  // Letter List & Toolbar
  const lettersGrid = document.getElementById('lettersGrid');
  const letterCounter = document.getElementById('letterCounter');

  // Reading Modal
  const letterReadingModal = document.getElementById('letterReadingModal');
  const btnExitLetter = document.getElementById('btnExitLetter');
  const btnDeleteCurrentLetter = document.getElementById('btnDeleteCurrentLetter');
  const readingSaintName = document.getElementById('readingSaintName');
  const readingFullName = document.getElementById('readingFullName');
  const readingParishTag = document.getElementById('readingParishTag');
  const readingDateSignature = document.getElementById('readingDateSignature');
  const readingLetterContent = document.getElementById('readingLetterContent');
  const readingPhotoSideBox = document.getElementById('readingPhotoSideBox');
  const readingPhotoWrapper = document.getElementById('readingPhotoWrapper');
  const readingPhotoImg = document.getElementById('readingPhotoImg');
  const btnViewPhotoFull = document.getElementById('btnViewPhotoFull');

  // Lightbox Modal
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  let allLetters = [];
  let currentReadingLetter = null;
  let isAudioPlaying = false;

  // HÌNH VẼ SVG PHONG BÌ ĐÓNG & MỞ
  const CLOSED_ENVELOPE_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150" class="envelope-svg">
      <defs>
        <linearGradient id="closedEnvBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff9ec"/>
          <stop offset="100%" stop-color="#ead4b4"/>
        </linearGradient>
        <linearGradient id="waxSealGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e74c3c"/>
          <stop offset="50%" stop-color="#b02a1b"/>
          <stop offset="100%" stop-color="#7d170c"/>
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="224" height="130" rx="8" fill="url(#closedEnvBg)" stroke="#cda45e" stroke-width="1.5"/>
      <path d="M 8 140 L 120 78 L 232 140 Z" fill="#edd9bb" stroke="#caa678" stroke-width="0.8"/>
      <path d="M 8 10 L 105 78 L 8 140 Z" fill="#f5e2c5" stroke="#caa678" stroke-width="0.8"/>
      <path d="M 232 10 L 135 78 L 232 140 Z" fill="#ecd3b0" stroke="#caa678" stroke-width="0.8"/>
      <path d="M 8 10 L 120 84 L 232 10 Z" fill="#fff3d9" stroke="#caa678" stroke-width="1"/>
      <path d="M 12 10 L 120 81 L 228 10" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="3,2"/>
      <circle cx="120" cy="84" r="18" fill="url(#waxSealGrad)" stroke="#ffd700" stroke-width="1.5"/>
      <circle cx="120" cy="84" r="14" fill="none" stroke="#f1a9a0" stroke-width="0.75" opacity="0.6"/>
      <text x="120" y="90" font-size="16" font-family="'Playfair Display', serif" fill="#fff2ce" font-weight="bold" text-anchor="middle">✝</text>
    </svg>
  `;

  const OPENED_ENVELOPE_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 165" class="envelope-svg">
      <defs>
        <linearGradient id="openEnvFlap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dfc59f"/>
          <stop offset="100%" stop-color="#ead4b4"/>
        </linearGradient>
        <linearGradient id="parchmentLetter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#fef8ea"/>
        </linearGradient>
      </defs>
      <path d="M 8 70 L 120 5 L 232 70 Z" fill="url(#openEnvFlap)" stroke="#c4a575" stroke-width="1.2"/>
      <path d="M 12 68 L 120 10 L 228 68 Z" fill="#bfa172" opacity="0.25"/>
      <g>
        <rect x="32" y="16" width="176" height="96" rx="5" fill="url(#parchmentLetter)" stroke="#d4af37" stroke-width="1.5"/>
        <g transform="translate(142, 24) rotate(10)">
          <rect x="0" y="0" width="56" height="20" rx="3" fill="#faf0e6" stroke="#c0392b" stroke-width="1.2"/>
          <text x="28" y="14" font-size="9.5" font-family="'Montserrat', sans-serif" font-weight="bold" fill="#c0392b" text-anchor="middle">ĐÃ MỞ</text>
        </g>
        <line x1="48" y1="38" x2="130" y2="38" stroke="#d4af37" stroke-width="2" stroke-linecap="round"/>
        <line x1="48" y1="52" x2="192" y2="52" stroke="#caa678" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="48" y1="64" x2="182" y2="64" stroke="#caa678" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="48" y1="76" x2="160" y2="76" stroke="#caa678" stroke-width="1.5" stroke-linecap="round"/>
        <text x="50" y="28" font-size="12" fill="#d4af37" font-weight="bold">✝</text>
      </g>
      <path d="M 8 70 L 120 125 L 232 70 L 232 155 L 8 155 Z" fill="#ead4b4" stroke="#cda45e" stroke-width="1.5"/>
      <path d="M 8 155 L 120 110 L 232 155 Z" fill="#f5e2c5" stroke="#caa678" stroke-width="0.8"/>
      <path d="M 8 70 L 88 116 L 8 155 Z" fill="#ebd2ae" opacity="0.6"/>
      <path d="M 232 70 L 152 116 L 232 155 Z" fill="#dfc49e" opacity="0.6"/>
    </svg>
  `;

  // 3. QUẢN LÝ MÁY PHÁT NHẠC ĐĨA THAN & THU NHỎ LÊN GÓC PHẢI
  function playAudio() {
    bgAudio.play().then(() => {
      isAudioPlaying = true;
      vinylDisc.classList.add('spinning');
      tonearmImg.classList.add('playing');
      miniVinyl.classList.add('spinning');
      miniIcon.textContent = '⏸';
      miniStatusText.textContent = 'Đang phát';
    }).catch(err => {
      console.warn("Autoplay audio blocked or error:", err);
    });
  }

  function pauseAudio() {
    bgAudio.pause();
    isAudioPlaying = false;
    vinylDisc.classList.remove('spinning');
    tonearmImg.classList.remove('playing');
    miniVinyl.classList.remove('spinning');
    miniIcon.textContent = '▶';
    miniStatusText.textContent = 'Tạm dừng';
  }

  // Khi bấm nút bắt đầu từ mâm đĩa than ban đầu (hoặc bấm vào thân đĩa than)
  const turntableBody = document.getElementById('turntableBody');
  let hasStartedTurntable = false;

  const startTurntableAction = () => {
    if (hasStartedTurntable) return;
    hasStartedTurntable = true;
    playAudio();

    // Sau 1.8 giây thưởng thức giai điệu và thấy đĩa than quay, cần gạt hạ xuống:
    // Thu nhỏ lại lên góc trên bên phải màn hình
    setTimeout(() => {
      introTurntableOverlay.classList.add('dismissed');
      miniPlayer.style.display = 'flex';
      // Bắt đầu hiệu ứng mưa sticker
      startStickerRain();
    }, 1800);
  };

  btnStartTurntable.addEventListener('click', startTurntableAction);
  if (turntableBody) {
    turntableBody.addEventListener('click', startTurntableAction);
  }

  // Bật/tắt nhạc từ Mini Player ở góc phải
  btnMiniToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });

  miniPlayer.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });

  // 5. HIỆU ỨNG MƯA STICKER (QUY TẮC: KHÔNG XOAY STICKER)
  const stickerFiles = window.STICKER_FILES || [
    "assets/stickers/sticker_0.png",
    "assets/stickers/sticker_1.png",
    "assets/stickers/sticker_2.png",
    "assets/stickers/sticker_3.png",
    "assets/stickers/sticker_4.png",
    "assets/stickers/sticker_5.png",
    "assets/stickers/sticker_6.png"
  ];

  let particles = [];
  let isRainActive = false;
  const rainContainer = document.getElementById('stickerRainContainer');

  function startStickerRain() {
    if (isRainActive) return;
    isRainActive = true;

    // Số lượng sticker rơi đồng thời (18 sticker tạo cảm giác nhẹ nhàng, không rối mắt)
    const PARTICLE_COUNT = 18;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      createParticle(true);
    }

    requestAnimationFrame(updateStickerRain);
  }

  function createParticle(randomInitialY = false) {
    const el = document.createElement('img');
    const randomSticker = stickerFiles[Math.floor(Math.random() * stickerFiles.length)];
    el.src = randomSticker;
    el.className = 'falling-sticker';

    // Kích thước sticker ngẫu nhiên (50px đến 85px)
    const size = Math.floor(Math.random() * 35) + 50;
    el.style.width = size + 'px';
    el.style.height = 'auto';

    const p = {
      el: el,
      x: Math.random() * (window.innerWidth - size),
      // Nếu là lần đầu thì rải đều màn hình, các lần sau rơi từ trên nóc (-120px)
      y: randomInitialY ? Math.random() * window.innerHeight : -120 - Math.random() * 80,
      speedY: 1.2 + Math.random() * 1.6, // Tốc độ rơi êm ái
      driftSpeed: 0.015 + Math.random() * 0.02,
      driftAmp: 20 + Math.random() * 30,
      driftPhase: Math.random() * Math.PI * 2,
      baseX: 0,
      opacity: 0.75 + Math.random() * 0.25
    };
    p.baseX = p.x;
    el.style.opacity = p.opacity;

    // QUY TẮC TUYỆT ĐỐI: KHÔNG XOAY STICKER (rotate: 0deg)
    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px)`;
    rainContainer.appendChild(el);
    particles.push(p);
  }

  function updateStickerRain() {
    const screenH = window.innerHeight;
    const screenW = window.innerWidth;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y += p.speedY;
      p.driftPhase += p.driftSpeed;
      p.x = p.baseX + Math.sin(p.driftPhase) * p.driftAmp;

      // Khi rơi quá đáy màn hình, đưa lên lại nóc
      if (p.y > screenH + 60) {
        p.y = -120;
        p.baseX = Math.random() * (screenW - 70);
        p.x = p.baseX;
      }

      // Render: dịch chuyển vị trí x, y - KHÔNG XOAY
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px)`;
    }

    if (isRainActive) {
      requestAnimationFrame(updateStickerRain);
    }
  }

  // 6. TẢI VÀ HIỂN THỊ DANH SÁCH THƯ (GỬI TRƯỚC HIỆN TRƯỚC)
  window.DB_SERVICE.subscribeLetters((letters) => {
    // Sắp xếp: Thư nào gửi trước hiện trước, gửi sau hiện sau (createdAt tăng dần)
    allLetters = letters.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });

    renderLetterList();
  });

  function renderLetterList() {
    const openedIds = window.DB_SERVICE.getOpenedLetterIds();

    letterCounter.textContent = `${allLetters.length}`;
    lettersGrid.innerHTML = '';

    if (allLetters.length === 0) {
      lettersGrid.innerHTML = `
        <div class="empty-letters-box" style="grid-column: 1 / -1;">
          <div class="empty-icon">✉️</div>
          <h3 class="empty-title">Chưa có bức thư nào trong hòm</h3>
          <p class="empty-desc">Các bức thư gửi đến Cha sẽ xuất hiện tại đây theo thứ tự thời gian gửi.</p>
        </div>
      `;
      return;
    }

    allLetters.forEach((letter, index) => {
      // Số thứ tự: gửi trước hiện trước, gửi sau hiện sau (1, 2, 3...)
      const orderNum = index + 1;
      const isOpened = openedIds.includes(letter.id);

      const card = document.createElement('div');
      card.className = `envelope-card ${isOpened ? 'is-opened' : 'is-closed'}`;
      card.dataset.id = letter.id;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      card.innerHTML = `
        <div class="envelope-card-header">
          <span class="envelope-number-badge">Thư số #${orderNum}</span>
          <span class="envelope-status-badge ${isOpened ? 'opened' : 'unread'}">
            ${isOpened ? '✓ Đã mở' : '● Chưa mở'}
          </span>
        </div>
        <div class="envelope-visual-box">
          ${isOpened ? OPENED_ENVELOPE_SVG : CLOSED_ENVELOPE_SVG}
        </div>
        <div class="envelope-action-text">
          ${isOpened ? '<span>📖</span> Đọc lại thư' : '<span>✉️</span> Nhấn để mở thư'}
        </div>
      `;

      card.addEventListener('click', () => openLetterModal(letter, orderNum));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLetterModal(letter, orderNum);
        }
      });
      lettersGrid.appendChild(card);
    });
  }

  // 7. MỞ VÀ ĐỌC THƯ (VỚI FONT CHỮ VIẾT HOA CÁCH ĐIỆU & ẢNH KÈM KHUNG)
  function openLetterModal(letter, orderNum) {
    currentReadingLetter = letter;

    readingSaintName.textContent = letter.saintName ? `Tên Thánh: ${letter.saintName}` : 'Tâm tình người tín hữu';
    readingFullName.textContent = letter.fullName || 'Một người con trong Chúa';
    readingParishTag.textContent = `⛪ ${letter.parish || 'Giáo họ / Giáo xứ'}`;
    readingDateSignature.textContent = `Gửi lúc: ${formatDate(letter.createdAt)}`;

    // FONT CHỮ VIẾT HOA CÁCH ĐIỆU THEO YÊU CẦU:
    // Hiển thị nội dung thư bằng font cách điệu Charm / Dancing Script
    readingLetterContent.textContent = letter.content || '';

    // Xử lý Ảnh kèm khung hiển thị bên cạnh bức thư:
    if (letter.photoData) {
      readingPhotoSideBox.style.display = 'flex';
      readingPhotoImg.src = letter.photoData;
      // Khi nhấn vào ảnh hoặc chữ "Nhấn để xem ảnh" bên dưới
      readingPhotoWrapper.onclick = () => openLightbox(letter.photoData);
      btnViewPhotoFull.onclick = () => openLightbox(letter.photoData);
    } else {
      // Nếu thư không có ảnh, ẩn khung ảnh cạnh thư
      readingPhotoSideBox.style.display = 'none';
    }

    letterReadingModal.classList.add('active');
  }

  // NÚT THOÁT CHUYỂN RA NGOÀI VÀ ĐÁNH DẤU LÀ "ĐÃ MỞ"
  btnExitLetter.addEventListener('click', () => {
    closeReadingModal();
  });

  // NÚT XÓA THƯ HIỆN TẠI (DÀNH CHO QUẢN TRỊ / CHA)
  if (btnDeleteCurrentLetter) {
    btnDeleteCurrentLetter.addEventListener('click', async () => {
      if (!currentReadingLetter || !currentReadingLetter.id) return;
      if (confirm(`Bạn có chắc chắn muốn xóa bức thư này của "${currentReadingLetter.fullName || 'người gửi'}" không?`)) {
        const idToDelete = currentReadingLetter.id;
        letterReadingModal.classList.remove('active');
        currentReadingLetter = null;
        
        await window.DB_SERVICE.deleteLetter(idToDelete);
        // Nếu dùng local, cập nhật lại danh sách ngay
        if (!window.DB_SERVICE.isFirebaseActive) {
          allLetters = allLetters.filter(l => l.id !== idToDelete);
          renderLetterList();
        }
      }
    });
  }

  function closeReadingModal() {
    if (currentReadingLetter && currentReadingLetter.id) {
      // Đánh dấu thư này là ĐÃ MỞ
      window.DB_SERVICE.markLetterAsOpened(currentReadingLetter.id);
      // Cập nhật lại giao diện danh sách
      renderLetterList();
    }
    letterReadingModal.classList.remove('active');
    currentReadingLetter = null;
  }

  // Đóng modal khi bấm ra ngoài phần xám
  letterReadingModal.addEventListener('click', (e) => {
    if (e.target === letterReadingModal) {
      closeReadingModal();
    }
  });

  // 8. PHÓNG TO XEM ẢNH LIGHTBOX
  function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
  }

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  // Helper định dạng ngày giờ
  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${mins} - ${day}/${month}/${year}`;
    } catch (e) {
      return isoStr;
    }
  }

  // Helper bảo vệ HTML
  function escapeHtml(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});

