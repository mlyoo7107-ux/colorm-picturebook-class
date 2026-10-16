/* ===================================================================
   COLOR.M 마음색 그림책 메이커 — 화풍 카드 (그림으로 보고 고르기)
   같은 장면(해·언덕·나무·집)을 화풍별로 직접 그린 작은 예시 + 한 줄 설명.
   기존 화풍 선택 목록(select)과 값이 연결되어 있어서 프롬프트 생성 코드는 그대로입니다.
   =================================================================== */
const ColorMStyles = (function () {

  // 선택 목록의 값 → 카드 이름/설명
  const STYLES = [
    { value: '부드러운 파스텔 톤의 수채화 그림책 스타일', key: 'wc', label: '수채화 그림책', desc: '물감이 번진 듯 부드럽고 포근해요. 어린이 그림책에 잘 어울려요.' },
    { value: '따뜻한 선과 포근한 색감의 동화책 일러스트 스타일', key: 'sb', label: '동화책 일러스트', desc: '부드러운 선과 포근한 색으로 그린, 우리가 아는 그 동화책 그림이에요.' },
    { value: '선명한 색감의 디지털 일러스트 스타일', key: 'dg', label: '디지털 일러스트', desc: '또렷하고 선명한 색, 빛 표현이 살아 있는 웹툰·포스터 느낌이에요.' },
    { value: '손그림 느낌의 색연필 스타일', key: 'cp', label: '색연필 손그림', desc: '색연필로 쓱쓱 칠한 듯한 따뜻한 손맛이 나요.' },
    { value: '귀여운 플랫 벡터 스타일', key: 'fv', label: '플랫 벡터', desc: '단순한 도형과 깔끔한 색 면으로 만든 아이콘·캐릭터 느낌이에요.' },
    { value: '따뜻한 톤의 동화책 유화 스타일', key: 'oil', label: '유화 느낌', desc: '물감이 두툼하게 올라간 깊은 색감, 클래식한 명화 같은 분위기예요.' }
  ];

  // ---------- 예시 그림 (SVG) ----------
  const W = 160, H = 108;
  const wrap = function (inner, defs) {
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs>' + (defs || '') + '</defs>' + inner + '</svg>';
  };

  function thumbWC() {
    const defs =
      '<filter id="cmst-wc" x="-10%" y="-10%" width="120%" height="120%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" result="d"/><feGaussianBlur in="d" stdDeviation="0.7"/></filter>' +
      '<filter id="cmst-wcp"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0.55 -0.18"/></filter>';
    const shape = function (el, fill, op) { return el.replace('/>', ' fill="' + fill + '" fill-opacity="' + (op || 0.82) + '" stroke="' + fill + '" stroke-opacity="0.35" stroke-width="1.4"/>'); };
    const body =
      '<rect width="160" height="108" fill="#fbf5ea"/>' +
      '<g filter="url(#cmst-wc)">' +
        shape('<rect x="6" y="6" width="148" height="62" rx="6"/>', '#bfe0f0', 0.7) +
        shape('<circle cx="122" cy="30" r="14"/>', '#ffd58f', 0.85) +
        shape('<path d="M0 74 Q40 48 84 66 T160 60 V108 H0Z"/>', '#b8dba0', 0.8) +
        shape('<path d="M0 90 Q50 70 104 88 T160 84 V108 H0Z"/>', '#9ccf94', 0.85) +
        shape('<rect x="38" y="58" width="6" height="22"/>', '#c79a72', 0.9) +
        shape('<circle cx="41" cy="50" r="17"/>', '#8fcf9a', 0.85) +
        shape('<circle cx="52" cy="56" r="11"/>', '#a6d98a', 0.8) +
        shape('<rect x="96" y="66" width="32" height="22"/>', '#f6c4b8', 0.9) +
        shape('<path d="M92 67 L112 50 L132 67Z"/>', '#e89aa0', 0.9) +
        shape('<circle cx="64" cy="92" r="3"/>', '#f6a3c0', 0.9) + shape('<circle cx="76" cy="96" r="3"/>', '#f6a3c0', 0.9) +
      '</g>' +
      '<rect width="160" height="108" filter="url(#cmst-wcp)" opacity="0.5"/>';
    return wrap(body, defs);
  }

  function thumbDG() {
    const defs =
      '<linearGradient id="cmst-dgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c8dff"/><stop offset="1" stop-color="#ffd36b"/></linearGradient>' +
      '<radialGradient id="cmst-dgsun"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.45" stop-color="#ffd24a"/><stop offset="1" stop-color="#ffb02e" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="cmst-dgh1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fd37a"/><stop offset="1" stop-color="#0f9a5b"/></linearGradient>' +
      '<linearGradient id="cmst-dgh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fb86d"/><stop offset="1" stop-color="#0a6e48"/></linearGradient>' +
      '<linearGradient id="cmst-dgr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5d73"/><stop offset="1" stop-color="#c21f5b"/></linearGradient>' +
      '<filter id="cmst-dgsh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="1.5" dy="2.5" stdDeviation="2" flood-color="#052b2a" flood-opacity="0.35"/></filter>';
    const body =
      '<rect width="160" height="108" fill="url(#cmst-dgs)"/>' +
      '<circle cx="122" cy="30" r="30" fill="url(#cmst-dgsun)"/>' +
      '<circle cx="122" cy="30" r="12" fill="#fff3b0"/>' +
      '<path d="M0 72 Q40 44 84 64 T160 58 V108 H0Z" fill="url(#cmst-dgh1)"/>' +
      '<path d="M0 90 Q50 68 104 86 T160 82 V108 H0Z" fill="url(#cmst-dgh2)"/>' +
      '<g filter="url(#cmst-dgsh)">' +
        '<rect x="38" y="58" width="6" height="24" fill="#8a4b2a"/>' +
        '<circle cx="41" cy="48" r="17" fill="#1fc46a"/><circle cx="41" cy="48" r="17" fill="none" stroke="#a6ffcf" stroke-opacity="0.6" stroke-width="1.2"/>' +
        '<rect x="96" y="66" width="32" height="22" fill="#ffe6c9"/>' +
        '<path d="M92 67 L112 49 L132 67Z" fill="url(#cmst-dgr)"/>' +
        '<rect x="106" y="74" width="9" height="14" fill="#6b3fa0"/>' +
      '</g>' +
      '<path d="M16 16 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" opacity="0.9"/>';
    return wrap(body, defs);
  }

  function thumbCP() {
    const defs =
      '<filter id="cmst-cp" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>' +
      '<filter id="cmst-cpg"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.34  0 0 0 0 0.28  0 0 0 0.7 -0.28"/></filter>' +
      ['#6aa7d6', '#e0a13a', '#6fae5c', '#4f9a62', '#b0805a', '#d77a85', '#e5a0a0', '#7a5ab0'].map(function (c, i) {
        return '<pattern id="cmst-h' + i + '" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(' + (i % 2 ? 50 : 35) + ')"><line x1="0" y1="0" x2="0" y2="3.2" stroke="' + c + '" stroke-width="1.5" stroke-opacity="0.85"/></pattern>';
      }).join('');
    const sh = function (el, i, base) { return el.replace('/>', ' fill="' + base + '" fill-opacity="0.35" stroke="#6b5a4a" stroke-opacity="0.65" stroke-width="0.9"/>') + el.replace('/>', ' fill="url(#cmst-h' + i + ')"/>'); };
    const body =
      '<rect width="160" height="108" fill="#fbf7ee"/>' +
      '<g filter="url(#cmst-cp)">' +
        sh('<rect x="8" y="8" width="144" height="60"/>', 0, '#cfe4f2') +
        sh('<circle cx="122" cy="30" r="13"/>', 1, '#ffe29a') +
        sh('<path d="M0 74 Q40 48 84 66 T160 60 V108 H0Z"/>', 2, '#cfe6bd') +
        sh('<path d="M0 90 Q50 70 104 88 T160 84 V108 H0Z"/>', 3, '#b8dca8') +
        sh('<rect x="38" y="58" width="6" height="22"/>', 4, '#d9bb98') +
        sh('<circle cx="41" cy="50" r="17"/>', 3, '#c4e3b4') +
        sh('<rect x="96" y="66" width="32" height="22"/>', 5, '#fbe0d6') +
        sh('<path d="M92 67 L112 50 L132 67Z"/>', 6, '#f4c6c6') +
      '</g>' +
      '<rect width="160" height="108" filter="url(#cmst-cpg)" opacity="0.55"/>';
    return wrap(body, defs);
  }

  function thumbFV() {
    const body =
      '<rect width="160" height="108" fill="#bfe9f7"/>' +
      '<circle cx="122" cy="30" r="14" fill="#ffc83d"/>' +
      '<ellipse cx="38" cy="86" rx="76" ry="30" fill="#7fd08a"/>' +
      '<ellipse cx="124" cy="96" rx="70" ry="26" fill="#55b86d"/>' +
      '<rect x="37" y="56" width="7" height="26" rx="2" fill="#a86a43"/>' +
      '<circle cx="41" cy="48" r="17" fill="#35a86b"/><circle cx="48" cy="55" r="9" fill="#2b9660"/>' +
      '<rect x="96" y="66" width="32" height="24" rx="3" fill="#ffffff"/>' +
      '<path d="M91 68 L112 49 L133 68Z" fill="#ff7a6b"/>' +
      '<rect x="106" y="75" width="10" height="15" rx="2" fill="#4a7bd1"/>' +
      '<circle cx="66" cy="96" r="3.2" fill="#ff8fb0"/><circle cx="78" cy="99" r="3.2" fill="#ffd34d"/>';
    return wrap(body, '');
  }

  function thumbOil() {
    const defs =
      '<filter id="cmst-oil" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.018 0.16" numOctaves="2" seed="8" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="5" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.3 0.06" numOctaves="2" seed="3" result="b"/>' +
        '<feDiffuseLighting in="b" surfaceScale="1.2" lighting-color="#fff6e0" result="l"><feDistantLight azimuth="40" elevation="68"/></feDiffuseLighting>' +
        '<feComposite in="d" in2="l" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0"/></filter>';
    const body =
      '<rect width="160" height="108" fill="#5a4a6a"/>' +
      '<g filter="url(#cmst-oil)">' +
        '<rect x="0" y="0" width="160" height="70" fill="#d9a35a"/>' +
        '<rect x="0" y="0" width="160" height="34" fill="#7a6aa8"/>' +
        '<rect x="0" y="26" width="160" height="22" fill="#e58a62"/>' +
        '<circle cx="122" cy="32" r="14" fill="#ffe08a"/>' +
        '<path d="M0 74 Q40 48 84 66 T160 60 V108 H0Z" fill="#4e7f4a"/>' +
        '<path d="M0 90 Q50 70 104 88 T160 84 V108 H0Z" fill="#3a6a3e"/>' +
        '<rect x="37" y="58" width="8" height="24" fill="#5c3a22"/>' +
        '<circle cx="41" cy="50" r="18" fill="#2f6a3a"/><circle cx="50" cy="55" r="10" fill="#4a8a46"/>' +
        '<rect x="96" y="66" width="32" height="22" fill="#e8c8a0"/>' +
        '<path d="M91 67 L112 49 L133 67Z" fill="#a8452f"/>' +
        '<rect x="106" y="75" width="9" height="13" fill="#5a3a7a"/>' +
      '</g>';
    return wrap(body, defs);
  }

  // 동화책 일러스트: 가는 갈색 윤곽선 + 포근한 구아슈 색면 + 둥글둥글한 모양
  function thumbSB() {
    const defs =
      '<filter id="cmst-sbg"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="6" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.35 -0.1"/></filter>';
    const ln = ' stroke="#6b4a36" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
    const cloud = function (x, y, s) {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 12 Q-2 3 7 4 Q9 -4 18 2 Q26 -1 27 7 Q33 9 29 14 Z" fill="#fffaf0"' + ln + '/></g>';
    };
    const body =
      '<rect width="160" height="108" fill="#fde9c8"/>' +
      '<rect width="160" height="72" fill="#cfe9ee"/>' +
      cloud(14, 14, 1) + cloud(88, 8, 0.8) +
      '<circle cx="128" cy="28" r="12" fill="#ffd36e"' + ln + '/>' +
      '<path d="M0 78 Q40 56 86 72 T160 66 V108 H0Z" fill="#a9d28a"' + ln + '/>' +
      '<path d="M0 94 Q56 78 108 92 T160 88 V108 H0Z" fill="#8cc27e"' + ln + '/>' +
      '<rect x="36" y="58" width="7" height="24" rx="2" fill="#c68b5d"' + ln + '/>' +
      '<circle cx="39" cy="48" r="17" fill="#7cc58a"' + ln + '/><circle cx="48" cy="52" r="9" fill="#97d49a"' + ln + '/>' +
      '<circle cx="34" cy="46" r="2.2" fill="#ff8f8f"/><circle cx="44" cy="40" r="2.2" fill="#ff8f8f"/>' +
      '<rect x="96" y="68" width="32" height="22" rx="2" fill="#fff1dc"' + ln + '/>' +
      '<path d="M91 69 L112 50 L133 69Z" fill="#ef8a6f"' + ln + '/>' +
      '<rect x="120" y="52" width="6" height="11" fill="#d9775f"' + ln + '/>' +
      '<rect x="106" y="76" width="9" height="14" rx="4" fill="#8a6bb5"' + ln + '/>' +
      '<g' + ln + '><circle cx="64" cy="97" r="3" fill="#ff9fbd"/><circle cx="76" cy="100" r="3" fill="#ffd95e"/></g>' +
      '<rect width="160" height="108" filter="url(#cmst-sbg)" opacity="0.6"/>';
    return wrap(body, defs);
  }

  const THUMBS = { wc: thumbWC, sb: thumbSB, dg: thumbDG, cp: thumbCP, fv: thumbFV, oil: thumbOil };

  // ---------- 카드 화면 ----------
  // selId: 화풍 select의 id. (ColorM.selectOther로 「기타」가 붙은 뒤에 호출해주세요.)
  function mount(selId) {
    const sel = document.getElementById(selId);
    if (!sel || sel.dataset.cmStyles) return;
    sel.dataset.cmStyles = '1';
    const grid = document.createElement('div');
    grid.className = 'style-cards';
    grid.innerHTML = STYLES.map(function (s) {
      return '<button type="button" class="style-card" data-value="' + s.value + '">' +
        '<span class="style-thumb">' + THUMBS[s.key]() + '</span>' +
        '<b>' + s.label + '</b><small>' + s.desc + '</small></button>';
    }).join('') +
      '<button type="button" class="style-card style-card-other" data-other="1"><span class="style-thumb style-thumb-other">✏️</span><b>직접 입력</b><small>원하는 화풍을 직접 적어요.</small></button>';
    sel.parentNode.insertBefore(grid, sel);
    sel.style.display = 'none';
    const note = document.createElement('p');
    note.className = 'help style-note';
    note.textContent = '※ 예시 그림은 화풍의 느낌을 보여주는 그림이에요. 실제 결과는 사용하는 AI에 따라 조금씩 달라져요.';
    grid.after(note);

    function otherOption() { return [].slice.call(sel.options).find(function (o) { return o.value === '__other__'; }); }
    function sync() {
      const cur = sel.value;
      const isPreset = STYLES.some(function (s) { return s.value === cur; });
      [].slice.call(grid.children).forEach(function (c) {
        const on = c.dataset.other ? (!isPreset && !!cur) || (otherOption() && otherOption().selected) : c.dataset.value === cur;
        c.classList.toggle('on', !!on);
      });
    }
    grid.addEventListener('click', function (e) {
      const card = e.target.closest('.style-card');
      if (!card) return;
      if (card.dataset.other) {
        const o = otherOption();
        if (o) { o.selected = true; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        const inp = sel.nextElementSibling;
        if (inp && inp.classList.contains('cm-other')) inp.focus();
      } else {
        sel.value = card.dataset.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      sync();
    });
    sel.addEventListener('change', sync);
    document.addEventListener('cm-drop-sync', sync);
    document.addEventListener('input', function (e) { if (e.target && e.target.classList && e.target.classList.contains('cm-other') && e.target.previousElementSibling === sel) sync(); });
    sync();
    setTimeout(sync, 0);
    window.addEventListener('load', sync);
  }

  return { mount: mount, STYLES: STYLES };
})();
