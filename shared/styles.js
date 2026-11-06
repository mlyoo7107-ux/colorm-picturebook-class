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
    { value: '따뜻한 톤의 동화책 유화 스타일', key: 'oil', label: '유화 느낌', desc: '물감이 두툼하게 올라간 깊은 색감, 클래식한 명화 같은 분위기예요.' },
    { value: '맑고 선명한 색감의 2D 애니메이션 스타일', key: 'an', label: '애니메이션', desc: '맑은 하늘색과 또렷한 명암, 만화영화의 한 장면 같아요.' },
    { value: '말랑한 점토로 빚은 듯한 3D 클레이 스타일', key: 'clay', label: '클레이(점토)', desc: '손으로 조물조물 빚은 듯 말랑하고 입체적이에요.' },
    { value: '아이가 그린 듯한 크레파스 오일파스텔 스타일', key: 'cr', label: '크레파스', desc: '크레파스로 꾹꾹 눌러 칠한 듯 꾸밈없고 정겨워요.' },
    { value: '색종이를 오려 붙인 종이 콜라주 스타일', key: 'pc', label: '종이 콜라주', desc: '색종이를 오려 붙인 듯한 고전 그림책 느낌이에요.' },
    { value: '먹선과 은은한 채색의 한국 민화 수묵담채 스타일', key: 'mh', label: '민화 · 수묵담채', desc: '먹선에 은은한 색을 올린 한국적인 그림이에요. 옛이야기에 잘 어울려요.' },
    { value: '보송보송한 펠트 양모 인형 스타일', key: 'ft', label: '펠트 인형', desc: '털실을 뭉쳐 만든 인형처럼 보송보송하고 포근해요.' },
    { value: '차분한 색면의 과슈 그림책 스타일', key: 'gq', label: '과슈', desc: '불투명한 물감의 차분하고 세련된 색, 요즘 그림책에 많이 써요.' }
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

  // 애니메이션: 맑은 하늘 그라데이션 + 경계가 또렷한 셀 명암(밝은 면 · 그림자 면 두 단계)
  function thumbAN() {
    const defs =
      '<linearGradient id="cmst-ans" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9cff"/><stop offset="0.75" stop-color="#bfe4ff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient>' +
      '<radialGradient id="cmst-ansun"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#fff8d0"/><stop offset="1" stop-color="#fff8d0" stop-opacity="0"/></radialGradient>';
    const cloud = function (x, y, s) {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
        '<path d="M0 14 Q0 6 8 6 Q10 -2 20 0 Q28 -4 32 4 Q40 4 40 14 Z" fill="#ffffff"/>' +
        '<path d="M2 14 Q14 9 24 12 Q32 9 39 14 Z" fill="#d3e9ff"/></g>';
    };
    const body =
      '<rect width="160" height="108" fill="url(#cmst-ans)"/>' +
      '<circle cx="124" cy="26" r="26" fill="url(#cmst-ansun)"/><circle cx="124" cy="26" r="9" fill="#ffffff"/>' +
      cloud(12, 14, 1) + cloud(70, 30, 0.7) +
      '<path d="M0 72 Q40 48 84 64 T160 58 V108 H0Z" fill="#62cf6e"/>' +
      '<path d="M0 80 Q40 60 84 72 T160 66 V108 H0Z" fill="#45b25e"/>' +
      '<path d="M0 92 Q50 74 104 88 T160 84 V108 H0Z" fill="#2f9a50"/>' +
      '<path d="M0 98 Q50 84 104 96 T160 94 V108 H0Z" fill="#23803f"/>' +
      '<rect x="38" y="58" width="6" height="24" fill="#8a5232"/><rect x="41" y="58" width="3" height="24" fill="#6a3a22"/>' +
      '<circle cx="41" cy="48" r="17" fill="#2aa05a"/>' +
      '<path d="M26 44 A17 17 0 0 1 52 34 Q44 44 30 50 Z" fill="#5fd384"/>' +
      '<rect x="96" y="66" width="32" height="22" fill="#ffffff"/><rect x="116" y="66" width="12" height="22" fill="#cfe2f7"/>' +
      '<path d="M92 67 L112 49 L132 67Z" fill="#ff5f57"/><path d="M112 49 L132 67 L118 67Z" fill="#d93f46"/>' +
      '<rect x="102" y="72" width="9" height="8" fill="#7cc8ff"/><path d="M102 72 h9 l-9 6z" fill="#ffffff" opacity="0.7"/>' +
      '<path d="M18 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#ffffff"/>' +
      '<path d="M146 50 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" fill="#ffffff" opacity="0.85"/>';
    return wrap(body, defs);
  }

  // 클레이: 모양마다 볼록한 입체감(빛 반사 + 그림자)이 생기게 조명 필터를 씌워요
  function thumbClay() {
    const defs =
      '<filter id="cmst-cl" x="-15%" y="-15%" width="130%" height="140%">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>' +
        '<feDiffuseLighting in="b" surfaceScale="3.5" diffuseConstant="1" lighting-color="#ffffff" result="d"><feDistantLight azimuth="235" elevation="48"/></feDiffuseLighting>' +
        '<feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.32" k2="0" k3="0" k4="0" result="lit"/>' +
        '<feSpecularLighting in="b" surfaceScale="3.5" specularConstant="0.8" specularExponent="16" lighting-color="#ffffff" result="s"><feDistantLight azimuth="235" elevation="52"/></feSpecularLighting>' +
        '<feComposite in="lit" in2="s" operator="arithmetic" k2="1" k3="0.45" result="c"/>' +
        '<feComposite in="c" in2="SourceAlpha" operator="in" result="ci"/>' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="sh"/><feOffset in="sh" dx="1.5" dy="2.8" result="so"/>' +
        '<feColorMatrix in="so" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0.4 0" result="sc"/>' +
        '<feMerge><feMergeNode in="sc"/><feMergeNode in="ci"/></feMerge></filter>';
    const c = function (el) { return '<g filter="url(#cmst-cl)">' + el + '</g>'; };
    const body =
      '<rect width="160" height="108" fill="#cfeaf4"/>' +
      c('<circle cx="124" cy="28" r="13" fill="#ffcf4d"/>') +
      c('<path d="M-6 76 Q40 50 84 68 T166 62 V114 H-6Z" fill="#8fd08a"/>') +
      c('<path d="M-6 92 Q50 72 104 90 T166 86 V114 H-6Z" fill="#6cbf72"/>') +
      c('<rect x="37" y="58" width="8" height="24" rx="3" fill="#bf7d4f"/>') +
      c('<circle cx="41" cy="48" r="17" fill="#4fb36c"/>') +
      c('<rect x="96" y="66" width="32" height="22" rx="4" fill="#ffe8c4"/>') +
      c('<path d="M90 69 Q112 44 134 69 Z" fill="#ff8676"/>') +
      c('<rect x="106" y="74" width="10" height="14" rx="5" fill="#7d9ce6"/>') +
      c('<circle cx="64" cy="96" r="3.4" fill="#ff93b6"/>') + c('<circle cx="76" cy="99" r="3.4" fill="#ffd34d"/>');
    return wrap(body, defs);
  }

  // 크레파스: 아이 그림처럼 단순한 모양 + 종이가 비치는 거친 크레파스 질감 + 굵은 선
  function thumbCR() {
    const defs =
      '<filter id="cmst-cr" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.95 0.3" numOctaves="2" seed="11" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 1.95" result="m"/>' +
        '<feComposite in="SourceGraphic" in2="m" operator="in" result="w"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="n"/>' +
        '<feDisplacementMap in="w" in2="n" scale="3.5"/></filter>';
    const ln = ' stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
    const rays = [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
      const r = a * Math.PI / 180, x1 = 124 + Math.cos(r) * 15, y1 = 26 + Math.sin(r) * 15, x2 = 124 + Math.cos(r) * 22, y2 = 26 + Math.sin(r) * 22;
      return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#ff9d1c"' + ln + '/>';
    }).join('');
    const body =
      '<rect width="160" height="108" fill="#fffaf0"/>' +
      '<g filter="url(#cmst-cr)">' +
        '<rect x="0" y="0" width="160" height="70" fill="#7cc4ff"/>' +
        '<circle cx="124" cy="26" r="11" fill="#ffd21f" stroke="#ff9d1c"' + ln + '/>' + rays +
        '<path d="M0 76 Q40 56 84 70 T160 64 V108 H0Z" fill="#69c94f" stroke="#2f8f2a"' + ln + '/>' +
        '<path d="M0 94 Q56 80 108 92 T160 90 V108 H0Z" fill="#42ad3c"/>' +
        '<rect x="37" y="56" width="7" height="26" fill="#a0612e" stroke="#6b3a17"' + ln + '/>' +
        '<circle cx="40" cy="46" r="16" fill="#2fb34a" stroke="#1d7a2c"' + ln + '/>' +
        '<rect x="96" y="66" width="32" height="24" fill="#ffe35c" stroke="#c98a12"' + ln + '/>' +
        '<path d="M91 67 L112 48 L133 67Z" fill="#ff4b4b" stroke="#c22424"' + ln + '/>' +
        '<rect x="106" y="76" width="9" height="14" fill="#6c4ccf" stroke="#3f2a8a"' + ln + '/>' +
        '<circle cx="64" cy="98" r="3" fill="#ff6fb0"/><circle cx="76" cy="100" r="3" fill="#ff6fb0"/>' +
      '</g>';
    return wrap(body, defs);
  }

  // 종이 콜라주: 가장자리가 살짝 찢긴 색종이 조각 + 조각마다 얇은 그림자 + 무늬 종이
  function thumbPC() {
    const defs =
      '<filter id="cmst-pc" x="-10%" y="-10%" width="120%" height="125%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="2" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" result="d"/>' +
        '<feDropShadow in="d" dx="1.2" dy="1.8" stdDeviation="0.9" flood-color="#3a2a1a" flood-opacity="0.4"/></filter>' +
      '<pattern id="cmst-pcd" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#e8483f"/><circle cx="2.5" cy="2.5" r="1" fill="#ffd6cf"/></pattern>' +
      '<pattern id="cmst-pcs" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="4" height="4" fill="#3f9f58"/><rect width="2" height="4" fill="#55b56a"/></pattern>' +
      '<filter id="cmst-pcg"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="8" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.4 -0.12"/></filter>';
    const p = function (el) { return '<g filter="url(#cmst-pc)">' + el + '</g>'; };
    const body =
      '<rect width="160" height="108" fill="#efe1c6"/>' +
      p('<rect x="5" y="5" width="150" height="66" fill="#8fcde6"/>') +
      p('<circle cx="122" cy="29" r="13" fill="#f7a531"/>') +
      p('<path d="M0 76 Q40 52 84 70 T160 62 V108 H0Z" fill="#9ccf6a"/>') +
      p('<path d="M0 92 Q50 74 104 90 T160 86 V108 H0Z" fill="url(#cmst-pcs)"/>') +
      p('<rect x="37" y="58" width="7" height="24" fill="#8b5a36"/>') +
      p('<circle cx="34" cy="48" r="11" fill="#2f8f4e"/>') + p('<circle cx="47" cy="44" r="12" fill="#4fae5f"/>') + p('<circle cx="41" cy="55" r="10" fill="#6cc070"/>') +
      p('<rect x="96" y="66" width="32" height="22" fill="#fff4dc"/>') +
      p('<path d="M91 68 L112 48 L133 68Z" fill="url(#cmst-pcd)"/>') +
      p('<rect x="106" y="75" width="9" height="13" fill="#2f4f9a"/>') +
      '<rect width="160" height="108" filter="url(#cmst-pcg)" opacity="0.45"/>';
    return wrap(body, defs);
  }

  // 민화 · 수묵담채: 한지 바탕 + 먹선 + 옅은 채색. 해 · 다섯 봉우리 · 소나무 · 기와집
  function thumbMH() {
    const defs =
      '<filter id="cmst-mh" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>' +
      '<filter id="cmst-mhp"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed="12" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.45 -0.15"/></filter>';
    const ink = ' stroke="#2b2622" stroke-linejoin="round" stroke-linecap="round"';
    const body =
      '<rect width="160" height="108" fill="#efe3c6"/>' +
      '<g filter="url(#cmst-mh)">' +
        '<circle cx="126" cy="24" r="10" fill="#d4412c"/>' +
        '<path d="M-2 74 L18 46 L30 60 L48 30 L64 58 L80 38 L96 62 L112 44 L130 66 L146 50 L162 70 V80 H-2Z" fill="#7fa79c" fill-opacity="0.75"' + ink + ' stroke-width="1.3"/>' +
        '<path d="M-2 80 Q40 66 84 76 T162 74 V108 H-2Z" fill="#c9b27a" fill-opacity="0.7"' + ink + ' stroke-width="1"/>' +
        '<path d="M0 98 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#5c8fa3" stroke-width="1.2" stroke-opacity="0.8"/>' +
        '<path d="M40 92 Q36 76 42 66 Q46 58 40 50" fill="none"' + ink + ' stroke-width="2.2"/>' +
        '<ellipse cx="34" cy="52" rx="13" ry="4.5" fill="#3d6b4c"' + ink + ' stroke-width="0.9"/>' +
        '<ellipse cx="48" cy="45" rx="12" ry="4" fill="#4a7a56"' + ink + ' stroke-width="0.9"/>' +
        '<ellipse cx="38" cy="38" rx="10" ry="3.6" fill="#3d6b4c"' + ink + ' stroke-width="0.9"/>' +
        '<rect x="98" y="72" width="30" height="16" fill="#f4ead6"' + ink + ' stroke-width="1"/>' +
        '<line x1="106" y1="72" x2="106" y2="88"' + ink + ' stroke-width="1"/><line x1="120" y1="72" x2="120" y2="88"' + ink + ' stroke-width="1"/>' +
        '<path d="M88 66 Q100 70 113 60 Q126 70 138 66 L132 73 L94 73 Z" fill="#4c5b66"' + ink + ' stroke-width="1.1"/>' +
      '</g>' +
      '<rect width="160" height="108" filter="url(#cmst-mhp)" opacity="0.5"/>';
    return wrap(body, defs);
  }

  // 펠트 인형: 보풀이 인 가장자리 + 털실 결 + 바느질 땀(점선)
  function thumbFT() {
    const defs =
      '<filter id="cmst-ft" x="-10%" y="-10%" width="120%" height="125%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="1" result="f"/>' +
        '<feColorMatrix in="f" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.24" result="fw"/>' +
        '<feComposite in="fw" in2="d" operator="in" result="fi"/>' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="sh"/><feOffset in="sh" dx="1" dy="2" result="so"/>' +
        '<feColorMatrix in="so" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 0.3 0" result="sc"/>' +
        '<feMerge><feMergeNode in="sc"/><feMergeNode in="d"/><feMergeNode in="fi"/></feMerge></filter>';
    const f = function (el) { return '<g filter="url(#cmst-ft)">' + el + '</g>'; };
    const st = ' fill="none" stroke="#fffaf2" stroke-width="0.9" stroke-dasharray="2 2" stroke-opacity="0.9"';
    const body =
      '<rect width="160" height="108" fill="#e8dccb"/>' +
      f('<rect x="4" y="4" width="152" height="68" rx="8" fill="#9cc7d6"/>') +
      f('<circle cx="122" cy="28" r="12" fill="#f2b84a"/>') +
      f('<path d="M-4 76 Q40 52 84 70 T164 62 V112 H-4Z" fill="#94bf72"/>') +
      f('<path d="M-4 92 Q50 74 104 90 T164 86 V112 H-4Z" fill="#6fa25c"/>') +
      f('<rect x="37" y="58" width="7" height="24" rx="2" fill="#8d6346"/>') +
      f('<circle cx="41" cy="48" r="16" fill="#4f8a55"/>') +
      f('<rect x="96" y="66" width="32" height="22" rx="3" fill="#f6e6cf"/>') +
      f('<path d="M91 68 Q112 46 133 68 Z" fill="#d9705f"/>') +
      f('<rect x="106" y="75" width="9" height="13" rx="4" fill="#6f74b8"/>') +
      '<circle cx="122" cy="28" r="9"' + st + '/>' +
      '<circle cx="41" cy="48" r="12.5"' + st + '/>' +
      '<path d="M95 67 Q112 50 129 67"' + st + '/>' +
      '<rect x="99" y="69" width="26" height="16" rx="2"' + st + '/>';
    return wrap(body, defs);
  }

  // 과슈: 윤곽선 없이 불투명하고 차분한 색면 + 마른 붓 자국 + 종이 결
  function thumbGQ() {
    const defs =
      '<filter id="cmst-gq" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04 0.12" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>' +
      '<filter id="cmst-gqg"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0.4 -0.12"/></filter>';
    const body =
      '<rect width="160" height="108" fill="#ecdfc6"/>' +
      '<g filter="url(#cmst-gq)">' +
        '<rect x="0" y="0" width="160" height="70" fill="#e7d6b6"/>' +
        '<circle cx="122" cy="30" r="13" fill="#e2a03a"/>' +
        '<path d="M0 74 Q40 48 84 66 T160 60 V108 H0Z" fill="#4f8a72"/>' +
        '<path d="M14 72 Q40 58 70 66" fill="none" stroke="#6ea58c" stroke-width="3" stroke-linecap="round" opacity="0.7"/>' +
        '<path d="M0 90 Q50 70 104 88 T160 84 V108 H0Z" fill="#2e6766"/>' +
        '<path d="M96 96 Q124 86 152 92" fill="none" stroke="#3f7f7c" stroke-width="3" stroke-linecap="round" opacity="0.7"/>' +
        '<rect x="38" y="58" width="6" height="24" fill="#7e4a2e"/>' +
        '<path d="M41 28 C56 36 58 62 41 64 C24 62 26 36 41 28Z" fill="#1f4f4b"/>' +
        '<rect x="96" y="66" width="32" height="22" fill="#f4ede0"/>' +
        '<path d="M92 67 L112 50 L132 67Z" fill="#c4553d"/>' +
        '<rect x="106" y="75" width="9" height="13" fill="#2a3a5c"/>' +
      '</g>' +
      '<rect width="160" height="108" filter="url(#cmst-gqg)" opacity="0.45"/>';
    return wrap(body, defs);
  }

  const THUMBS = { wc: thumbWC, sb: thumbSB, dg: thumbDG, cp: thumbCP, fv: thumbFV, oil: thumbOil, an: thumbAN, clay: thumbClay, cr: thumbCR, pc: thumbPC, mh: thumbMH, ft: thumbFT, gq: thumbGQ };

  // ---------- 카드 화면 ----------
  // selId: 화풍 select의 id. (ColorM.selectOther로 「기타」가 붙은 뒤에 호출해주세요.)
  function mount(selId) {
    const sel = document.getElementById(selId);
    if (!sel || sel.dataset.cmStyles) return;
    sel.dataset.cmStyles = '1';
    // 카드에 있는데 선택 목록에 없는 화풍은 「직접 입력」 앞에 넣어 둬요
    const otherOpt = [].slice.call(sel.options).find(function (o) { return o.value === '__other__'; });
    STYLES.forEach(function (s) {
      if ([].slice.call(sel.options).some(function (o) { return o.value === s.value; })) return;
      const o = document.createElement('option');
      o.value = o.textContent = s.value;
      sel.insertBefore(o, otherOpt || null);
    });
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
