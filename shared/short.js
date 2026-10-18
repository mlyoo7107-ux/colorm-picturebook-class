/* ===================================================================
   COLOR.M 마음색 그림책 — 캔바용 짧은 요청문 + 크게 보기 (2시간 특강용)
   ChatGPT를 못 쓰거나 카톡으로 요청문을 보내기 어려운 교실에서,
   선생님 화면(프로젝터)에 짧은 요청문을 크게 띄우고 학생이 보고 따라 쳐서 캔바에 넣어요.
   요청문 순서는 늘 같아요: 화풍 → 주인공 → 장면 → 장소 → 분위기·색감 → 글자 없이
   사용법: ColorMShort.mount(붙일 요소, 'story' | 'character' | 'scene' | 'cover', 'before' | 'after')
   =================================================================== */
const ColorMShort = (function () {
  const esc = function (s) { return ColorM.escapeHTML(s); };
  const pad = function (n) { return String(n).padStart(2, '0'); };

  // 화풍을 짧게 (04 캐릭터의 화풍 목록 기준, 그 밖의 것은 「스타일」만 떼어요)
  const STYLE_SHORT = {
    '부드러운 파스텔 톤의 수채화 그림책 스타일': '파스텔 수채화',
    '따뜻한 선과 포근한 색감의 동화책 일러스트 스타일': '포근한 동화책 일러스트',
    '선명한 색감의 디지털 일러스트 스타일': '선명한 디지털 일러스트',
    '손그림 느낌의 색연필 스타일': '색연필 손그림',
    '귀여운 플랫 벡터 스타일': '귀여운 플랫 일러스트',
    '따뜻한 톤의 동화책 유화 스타일': '따뜻한 동화책 유화'
  };
  function style(p) {
    const a = String((p.character || {}).artStyle || '').trim();
    return STYLE_SHORT[a] || a.replace(/\s*(그림책\s*)?스타일$/, '') || '파스텔 수채화';
  }
  // 긴 설명에서 앞부분 한 구절만: 첫 문장 → 쉼표·'와/과' 앞 → n자 이내
  function clip(s, n) {
    s = String(s || '').replace(/["“”'‘’「」『』]/g, '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    s = s.split(/[.!?。\n]/)[0].split(/,|，/)[0].trim();
    if (s.length > n) {
      const cut = s.slice(0, n), k = cut.lastIndexOf(' ');
      s = (k > n * 0.5 ? cut.slice(0, k) : cut).trim();
    }
    return s;
  }
  // 학생이 쓴 문장(기획·장면 설명)은 뜻이 잘리지 않게: 첫 문장만, 쉼표에서 자르지 않고, 너무 길 때만 낱말 단위로 줄여요
  function sentence(s, n) {
    s = String(s || '').replace(/["“”'‘’「」『』]/g, '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    s = s.split(/[.!?。\n]/)[0].trim().replace(/[,，\s]+$/, '');
    if (s.length > n) {
      const cut = s.slice(0, n), k = cut.lastIndexOf(' ');
      s = (k > n * 0.6 ? cut.slice(0, k) : cut).replace(/[,，\s]+$/, '') + '…';
    }
    return s;
  }
  function hero(p) {
    const c = p.character || {};
    const name = String(c.name || ColorM.heroName(p.plan || {}) || '주인공').trim();
    const feats = [clip(String(c.appearance || '').split(/와 |과 /)[0], 14), clip(String(c.outfit || '').split(/와 |과 /)[0], 14)].filter(Boolean);
    if (!feats.length && (p.plan || {}).hero) feats.push(clip(p.plan.hero, 16));
    return name + (feats.length ? '(' + feats.join(', ') + ')' : '');
  }
  function heroName(p) { return String((p.character || {}).name || ColorM.heroName(p.plan || {}) || '주인공').trim(); }
  function colorWord(p) {
    const m = p.mind || {};
    const c = String(m.colorLabel || m.colorName || '').replace(/\s*\(.*\)\s*$/, '').trim();
    return c ? c + ' 색감' : '따뜻한 색감';
  }
  function mood(p) {
    const m = String((p.plan || {}).mood || '').trim();
    return m.replace(/\s*(분위기|느낌)$/, '').trim();
  }
  function tail(p) { return [mood(p), colorWord(p)].filter(Boolean).join(' ') + ', 글자 없이'; }
  function scenesOf(p) { return ((p.storyboard || {}).scenes) || []; }

  // ---------- 단계별 짧은 요청문 ----------
  function story(p) {
    const pl = p.plan || {};
    const n = (p.story || {}).sceneCount || scenesOf(p).length || 6;
    const who = (pl.audience || '어린이') + ' 독자';
    // 줄을 나눠서 크게 보기에서 한 줄씩 따라 칠 수 있게 해요. 마지막 형식 예시는 답을 「장면 카드 채우기」가 읽는 모양 그대로예요.
    const lines = [
      who + '를 위한 그림책 이야기를 ' + n + '장면으로 써 줘.',
      '주인공: ' + (sentence(pl.hero, 60) || '주인공')
    ];
    if (pl.goal) lines.push('원하는 것: ' + sentence(pl.goal, 60));
    if (pl.problem) lines.push('문제: ' + sentence(pl.problem, 60));
    if (pl.message) lines.push('전하고 싶은 말: ' + sentence(pl.message, 60));
    lines.push('장면마다 아래 모양으로 써 줘.', '[장면 1]', '제목:', '본문: (2문장)', '대화: (1줄)');
    return [{ label: '이야기 받기 (캔바 Magic Write · 글쓰기 AI)', text: lines.join('\n') }];
  }
  function character(p) {
    const st = style(p), h = hero(p), nm = heroName(p);
    return [
      { label: '캐릭터 그림', text: st + ' 그림책 주인공 캐릭터. ' + h + '. 전신, 정면, 흰 배경, 글자 없이' },
      { label: '캐릭터 시트', text: '같은 캐릭터 ' + nm + '의 캐릭터 시트. 정면·옆모습·뒷모습과 여러 표정을 한 장에. ' + st + ', 흰 배경, 글자 없이' }
    ];
  }
  function scene(p) {
    const st = style(p), h = hero(p), sc = scenesOf(p);
    if (!sc.length) return [];
    return sc.map(function (s, i) {
      const act = sentence(s.memo || s.content || s.title, 45) || '이야기의 한 장면';
      const place = clip(s.conti, 16);
      return {
        label: '장면 ' + pad(s.no || i + 1) + (s.title && !/^장면\s*\d+$/.test(s.title) ? ' · ' + clip(s.title, 16) : ''),
        text: st + ' 그림책 그림. 주인공 ' + h + '. 장면: ' + act + '.' + (place ? ' 장소: ' + place + '.' : '') + ' ' + tail(p)
      };
    });
  }
  function cover(p) {
    const cv = p.cover || {};
    const title = p.bookTitle || (cv.title && cv.title !== '제목 미정' ? cv.title : '') || ((p.story || {}).titles || [])[0] || '';
    const what = sentence(cv.sceneDesc && cv.sceneDesc !== '표지 장면 미정' ? cv.sceneDesc : '', 45) || '이야기에서 가장 중요한 순간';
    return [{
      label: '표지 그림' + (title ? ' · 『' + title + '』' : ''),
      text: style(p) + ' 그림책 표지 그림. 주인공 ' + hero(p) + '. ' + what + '. ' + colorWord(p) + ', 위쪽에 제목 넣을 여백, 글자 없이'
    }];
  }
  const BUILD = { story: story, character: character, scene: scene, cover: cover };
  const HELP = {
    story: '받은 답을 위 「ChatGPT로 책에 실릴 글 받기」의 붙여넣기 칸에 넣고 「장면 카드 채우기」를 눌러요.',
    character: '캔바에서 그림 만들기(Magic Media 등)에 넣어요. 마음에 드는 그림은 꼭 저장해 두세요.',
    scene: '장면마다 하나씩 캔바 그림 만들기에 넣어요. 스타일은 매번 같은 것으로 골라야 그림체가 맞아요.',
    cover: '캔바 디자인 맨 앞 페이지에 넣고, 제목·지은이는 글자로 얹어요.'
  };
  const EMPTY = {
    story: '01 기획을 먼저 해 주세요.',
    character: '01 기획을 하면 주인공 이름으로 만들어져요. 아래에서 캐릭터를 정하면 더 정확해져요.',
    scene: '02 이야기에서 장면을 만들면 장면별 짧은 요청문이 나와요.',
    cover: ''
  };

  // ---------- 크게 보기 (프로젝터) ----------
  const ORDER_SLIDE = { label: '캔바 요청문 쓰는 순서', text: '화풍 → 주인공 → 장면 → 장소 → 분위기·색감 → 글자 없이', order: true };
  function present(items, start) {
    const slides = [ORDER_SLIDE].concat(items);
    let i = Math.min(Math.max(start || 0, 0), slides.length - 1);
    const ov = document.createElement('div');
    ov.className = 'short-present';
    ov.setAttribute('role', 'dialog');
    ov.innerHTML = '<div class="sp-top"><b class="sp-label"></b><span class="sp-count"></span><button type="button" data-act="close" aria-label="닫기">✕ 닫기</button></div>' +
      '<div class="sp-text"></div>' +
      '<div class="sp-nav"><button type="button" data-act="prev">← 이전</button><button type="button" data-act="smaller" aria-label="글자 작게">가−</button><button type="button" data-act="bigger" aria-label="글자 크게">가+</button><button type="button" data-act="next">다음 →</button></div>';
    document.body.appendChild(ov);
    document.body.classList.add('sp-open');
    let size = 1;
    function draw() {
      const s = slides[i];
      ov.querySelector('.sp-label').textContent = s.label;
      ov.querySelector('.sp-count').textContent = (i + 1) + ' / ' + slides.length;
      const t = ov.querySelector('.sp-text');
      t.classList.toggle('sp-order', !!s.order);
      t.style.fontSize = 'calc(' + size + ' * clamp(26px, 3.6vw, 58px))';
      t.textContent = s.text;
      ov.querySelector('[data-act="prev"]').disabled = i === 0;
      ov.querySelector('[data-act="next"]').disabled = i === slides.length - 1;
    }
    function close() { ov.remove(); document.body.classList.remove('sp-open'); document.removeEventListener('keydown', key); }
    function key(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { if (i < slides.length - 1) { i++; draw(); } e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { if (i > 0) { i--; draw(); } e.preventDefault(); }
    }
    ov.addEventListener('click', function (e) {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'close') close();
      else if (a === 'prev' && i > 0) { i--; draw(); }
      else if (a === 'next' && i < slides.length - 1) { i++; draw(); }
      else if (a === 'bigger') { size = Math.min(size + 0.15, 1.9); draw(); }
      else if (a === 'smaller') { size = Math.max(size - 0.15, 0.55); draw(); }
    });
    document.addEventListener('keydown', key);
    draw();
  }

  // ---------- 카드 ----------
  function mount(anchor, kind, where) {
    if (!anchor || !BUILD[kind]) return;
    const sec = document.createElement('section');
    sec.className = 'card short-card';
    if (where === 'after') anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    else anchor.parentNode.insertBefore(sec, anchor);
    let items = [];
    function render() {
      if (sec.contains(document.activeElement) && document.activeElement.tagName !== 'BUTTON') return;
      const p = ColorM.getProject();
      items = (kind === 'story' && !(p.plan || {}).hero) ? [] : BUILD[kind](p);
      sec.innerHTML =
        '<div class="step"><span>⌨ 캔바용 · 따라 치기</span><h2>짧은 요청문</h2></div>' +
        '<p class="help">ChatGPT를 못 쓰거나 요청문을 보내기 어려울 때, 선생님 화면에 <b>크게 띄워</b> 보고 따라 쳐요. 순서: <b>화풍 → 주인공 → 장면 → 장소 → 분위기·색감 → 글자 없이</b></p>' +
        (items.length
          ? '<ol class="short-list">' + items.map(function (it, k) {
              return '<li><b>' + esc(it.label) + '</b><div class="short-text">' + esc(it.text) + '</div>' +
                '<div class="short-btns"><button type="button" class="btn soft" data-big="' + k + '">크게 보기</button><button type="button" class="btn ghost" data-copy="' + k + '">복사</button>' +
                '<small>' + it.text.length + '자</small></div></li>';
            }).join('') + '</ol>' +
            '<p class="help">' + HELP[kind] + '</p>'
          : '<p class="help"><b>' + esc(EMPTY[kind] || '') + '</b></p>');
    }
    sec.addEventListener('click', function (e) {
      const b = e.target.closest('button'); if (!b) return;
      render();
      if (b.dataset.big != null) present(items, +b.dataset.big + 1);
      else if (b.dataset.copy != null) ColorM.copyText(items[+b.dataset.copy].text);
    });
    // 앞에서 내용을 바꾸면 요청문도 따라 바뀌어요
    let t = null;
    const later = function () { clearTimeout(t); t = setTimeout(render, 500); };
    ['change', 'click', 'storage'].forEach(function (ev) { (ev === 'storage' ? window : document).addEventListener(ev, function (e) { if (!(e.target instanceof Node) || !sec.contains(e.target)) later(); }); });
    render();
  }

  return { mount: mount, present: present, story: story, character: character, scene: scene, cover: cover };
})();
