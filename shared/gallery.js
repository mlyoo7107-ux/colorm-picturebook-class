/* ===================================================================
   COLOR.M 마음색 그림책 교실 — 갤러리에 작품 자랑하기
   그림책이 완성되는 곳(4회 · 특강)의 마지막에만 붙여요.
   갤러리 등록 화면에 제목 · 한 줄 소개 · 태그 · 분류(마음색 묶음)를 미리 채워서 넘겨요.
   사용법: <script src="../shared/mind.js"></script><script src="../shared/gallery.js"></script>
          ColorMGallery.mount(붙일 요소, 'after' | 'before' | 'inside')
   =================================================================== */
const ColorMGallery = (function () {
  const GALLERY_URL = 'https://mlyoo7107-ux.github.io/PRODUCT-DESIGN-MAKER/gallery/index.html?product=PICTURE_BOOK_MAKER';
  const GALLERY_UPLOAD = 'https://mlyoo7107-ux.github.io/PRODUCT-DESIGN-MAKER/gallery/upload.html?product=PICTURE_BOOK_MAKER';
  const esc = function (s) { return ColorM.escapeHTML(s); };

  // 갤러리 분류: 마음색(16가지)을 비슷한 색끼리 8묶음으로. 색을 안 골랐으면 「기타」.
  // ※ 갤러리 upload.html의 PICTURE_BOOK_MAKER categories와 글자까지 똑같아야 자동 선택돼요. (키 PICTURE_BOOK_MAKER도 바꾸지 말 것)
  const COLOR_GROUPS = {
    '레드': '빨강·코랄', '코랄': '빨강·코랄',
    '오렌지': '주황·노랑', '옐로우': '주황·노랑',
    '그린': '초록·라임', '라임': '초록·라임',
    '민트': '민트·청록', '터콰이즈': '민트·청록',
    '블루': '파랑·네이비', '네이비': '파랑·네이비',
    '퍼플': '보라·라벤더', '라벤더': '보라·라벤더',
    '핑크': '분홍·마젠타', '마젠타': '분홍·마젠타',
    '브라운': '갈색·회색', '그레이': '갈색·회색'
  };
  const hasMind = function () { return typeof ColorMMind !== 'undefined' && ColorMMind.hasColor(); };
  function category() {
    return hasMind() ? (COLOR_GROUPS[ColorMMind.get().colorName] || '기타') : '기타';
  }

  // 등록 화면에 미리 채울 값 (제목 40자 · 소개 150자 · 태그 100자)
  function data() {
    const p = ColorM.getProject();
    const plan = p.plan || {}, story = p.story || {}, cover = p.cover || {}, pub = (p.publish && p.publish.fields) || {};
    const coverTitle = cover.title && cover.title !== '제목 미정' ? cover.title : '';
    const title = (p.bookTitle || pub.title || coverTitle || (story.titles && story.titles[0]) ||
      (p.projectName !== ColorM.DEFAULT_PROJECT_NAME ? p.projectName : '') || '').trim();
    const summary = (story.summary || '').trim().split(/(?<=[.!?])\s+/)[0] || '';
    const concept = (plan.oneLine || summary || [plan.hero, plan.goal].filter(Boolean).join(' — ')).trim();
    // 마음색에서 고른 감정(최대 2개)을 태그 맨 앞에 넣어 같은 마음의 작품을 찾기 쉽게 해요.
    const emos = hasMind() ? ColorMMind.get().emotions.slice(0, 2) : [];
    const base = [plan.genre, plan.mood, plan.topic, '마음색 그림책'].filter(Boolean);
    const tags = emos.concat(base.filter(function (t) { return emos.indexOf(t) < 0; }));
    return { title: title.slice(0, 40), concept: concept.slice(0, 150), tags: tags.join(', ').slice(0, 100), category: category() };
  }
  function uploadUrl() {
    const d = data(), q = new URLSearchParams();
    if (d.title) q.set('title', d.title);
    if (d.concept) q.set('concept', d.concept);
    q.set('category', d.category);
    if (d.tags) q.set('tags', d.tags);
    return GALLERY_UPLOAD + '&' + q.toString();
  }

  function mount(anchor, where) {
    if (!anchor || document.getElementById('cmGallery')) return;
    const sec = document.createElement('section');
    sec.id = 'cmGallery';
    sec.className = 'gallery-cta';
    sec.innerHTML =
      '<p><b>🖼 그림책이 완성됐나요? 갤러리에 자랑해 보세요</b></p>' +
      '<a class="btn primary big" data-role="go" target="_blank" rel="noopener">✨ 갤러리에 작품 자랑하기 →</a>' +
      '<p class="help" data-role="info"></p>' +
      '<p class="help gallery-note">원하는 사람만 올려요 · 갤러리는 <b>누구나 볼 수 있어요</b> · 실제 이름 대신 필명을 써도 돼요</p>' +
      '<p class="help"><a href="' + GALLERY_URL + '" target="_blank" rel="noopener">다른 사람들의 작품 구경하기 ↗</a></p>';
    if (where === 'inside') anchor.appendChild(sec);
    else if (where === 'before') anchor.parentNode.insertBefore(sec, anchor);
    else anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    const go = sec.querySelector('[data-role="go"]');
    function refresh() {
      const d = data();
      go.href = uploadUrl();
      sec.querySelector('[data-role="info"]').textContent = (d.title ? '제목 「' + d.title + '」' : '제목은 등록 화면에서 입력해요') +
        ' · 분류 「' + d.category + '」 · 한 줄 소개 · 태그가 등록 화면에 자동으로 들어가요';
    }
    refresh();
    // 누르기 직전에 제목이 바뀌었을 수 있어서, 누르는 순간의 값으로 다시 만들어요.
    ['mouseenter', 'focus', 'click'].forEach(function (ev) { go.addEventListener(ev, refresh); });
  }

  return { mount: mount, data: data, uploadUrl: uploadUrl, COLOR_GROUPS: COLOR_GROUPS };
})();
