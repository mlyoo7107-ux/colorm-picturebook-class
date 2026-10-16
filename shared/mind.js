/* ===================================================================
   COLOR.M 마음색 그림책 메이커 — 마음색 (색채 기반 시작 + 장면별 색 흐름)
   · 01 기획: 마음색 → 감정 → 기억 → 필요한 것을 고르면 기획 항목을 채워줍니다.
   · 05 장면 / 06 표지: 마음색에서 출발해 장면마다 명도·채도·온도가 변하는 "색 흐름"을
     이미지 프롬프트의 색감 문구로 만들어줍니다.
   (마음색 워크북 v3의 색 흐름 계산을 이 메이커 구조에 맞게 옮긴 것)
   데이터는 project.mind 에 저장됩니다.
   =================================================================== */
const ColorMMind = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return ColorM.escapeHTML(s); };

  const COLORS = [
    ['레드', '#EF5350', 'red'], ['코랄', '#FF7F6E', 'coral'], ['오렌지', '#F59E42', 'orange'], ['옐로우', '#F6CF4D', 'yellow'],
    ['라임', '#B6D957', 'lime green'], ['그린', '#54B978', 'green'], ['민트', '#65CFC2', 'mint'], ['터콰이즈', '#36B8C5', 'turquoise'],
    ['블루', '#4C8DDE', 'blue'], ['네이비', '#485A8A', 'navy'], ['퍼플', '#8A6FD1', 'purple'], ['라벤더', '#B9A7E5', 'lavender'],
    ['핑크', '#F58DB4', 'pink'], ['마젠타', '#D83B86', 'magenta'], ['브라운', '#9D735F', 'brown'], ['그레이', '#8E959D', 'gray']
  ];
  const EMOTIONS = [['편안함', '😌'], ['설렘', '💓'], ['위로', '🤗'], ['외로움', '🌧️'], ['용기', '💪'], ['희망', '🌱'], ['따뜻함', '☀️'], ['불안', '🌀'], ['자유', '🕊️'], ['기대', '✨']];
  const NEEDS = ['휴식', '위로', '용기', '자신감', '응원', '새로운 시작', '안정', '여유', '집중', '표현'];
  const BEATS = ['지금의 마음', '작은 사건', '마음이 움직이는 순간', '변화의 순간', '새로운 발견'];

  // 명도·채도·온도 (0,1,2 단계) — 한국어 문구와 영어 문구
  const DIMS = [
    { key: 'light', label: '명도', kr: ['어둡고 깊은 명도', '중간 명도', '밝고 환한 명도'], en: ['deep, dark lightness', 'medium lightness', 'bright, luminous lightness'] },
    { key: 'sat', label: '채도', kr: ['차분하고 부드러운 채도', '적당한 채도', '선명하고 생기 있는 채도'], en: ['calm, muted saturation', 'moderate saturation', 'vivid, lively saturation'] },
    { key: 'temp', label: '온도', kr: ['차가운 색온도', '중립적인 색온도', '따뜻한 색온도'], en: ['cool color temperature', 'neutral color temperature', 'warm color temperature'] }
  ];
  const NEUTRAL = { light: [1, 1, 1, 1, 1], sat: [1, 1, 1, 1, 1], temp: [1, 1, 1, 1, 1] };
  const PRESETS = [
    ['점점 밝아져요', '무거웠던 마음이 조금씩 가벼워지는 이야기', { light: [0, 0, 1, 2, 2], sat: [0, 1, 1, 2, 1], temp: [1, 1, 2, 2, 2] }],
    ['잔잔하게 이어져요', '큰 변화 없이 조용히 마음을 들여다보는 이야기', { light: [1, 1, 1, 1, 1], sat: [0, 0, 0, 0, 0], temp: [1, 1, 1, 1, 1] }],
    ['흔들렸다 돌아와요', '한 번 흔들렸다가 다시 제자리를 찾는 이야기', { light: [1, 0, 0, 1, 2], sat: [1, 2, 1, 1, 1], temp: [1, 0, 1, 2, 2] }],
    ['들뜬 마음이 차분해져요', '설레거나 바빴던 마음이 편안해지는 이야기', { light: [2, 2, 1, 1, 1], sat: [2, 2, 1, 0, 0], temp: [2, 1, 1, 1, 1] }]
  ];

  // 직접 고른 색은 가장 가까운 기본 색 이름을 붙여 프롬프트(한/영)에 함께 씁니다.
  function nearestColor(hex) {
    // 사람이 느끼는 색 이름에 가깝도록 색상(hue)을 가장 크게 보고, 채도·명도로 보정합니다.
    const t = hexToHsl(hex);
    let best = COLORS[0], bd = Infinity;
    COLORS.forEach(function (c) {
      const p = hexToHsl(c[1]);
      let dh = Math.abs(t[0] - p[0]); dh = Math.min(dh, 360 - dh);
      const gray = t[1] < 12 || p[1] < 12;
      const d = gray
        ? Math.pow((t[1] - p[1]) / 30, 2) + Math.pow((t[2] - p[2]) / 20, 2)
        : Math.pow(dh / 60, 2) + Math.pow((t[1] - p[1]) / 80, 2) + Math.pow((t[2] - p[2]) / 45, 2);
      if (d < bd) { bd = d; best = c; }
    });
    return best;
  }  function isPreset(hex) { return COLORS.some(function (c) { return c[1].toLowerCase() === String(hex || '').toLowerCase(); }); }
  function customLine(m) {
    if (!m.color) return '';
    return isPreset(m.color) ? '' : '직접 고른 색 ' + m.color.toUpperCase() + ' (가장 가까운 이름: ' + m.colorName + ')';
  }
  const CUSTOM_HTML = '<div class="mind-custom"><span>원하는 색이 없다면 직접 고르기</span><input type="color" data-role="customColor" value="#F58DB4" aria-label="직접 색 고르기"><small data-role="customName"></small></div>';
  function setCustom(m, hex) { setMain(m, hex); }
  // ---------- 저장 ----------
  function defaults() {
    return { color: '', colorName: '', colorLabel: '', emotions: [], emotionCustom: '', memory: '', needs: [], needCustom: '', flowPreset: '', flow: null, palette: null };
  }
  function palDefaults() { return { harmony: '', sub: '', point: '', moods: [], moodCustom: '' }; }
  function get() {
    const m = Object.assign(defaults(), ColorM.getProject().mind || {});
    m.palette = Object.assign(palDefaults(), m.palette || {});
    return m;
  }
  function save(m) { ColorM.saveStep('mind', m); }
  function hasColor(m) { m = m || get(); return !!m.color; }
  // 메인 컬러가 바뀌면, 추천 배색을 골라둔 경우 서브·포인트도 같이 다시 계산합니다.
  function setMain(m, hex, name) {
    m.color = hex.toUpperCase();
    m.colorName = name || nearestColor(hex)[0];
    if (m.palette && m.palette.harmony) { const p = harmonize(m.color, m.palette.harmony); m.palette.sub = p[0]; m.palette.point = p[1]; }
    save(m);
  }
  function enColorName(m) { const c = COLORS.find(function (x) { return x[0] === m.colorName; }); return c ? c[2] : (m.colorLabel || m.colorName || 'soft'); }

  // ---------- 색 계산 (v3와 동일한 방식) ----------
  function hexToHsl(hex) {
    const n = parseInt((hex || '#F58DB4').slice(1), 16);
    const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s * 100, l * 100];
  }
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    const f = function (n) { return Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))); };
    return '#' + [f(0), f(8), f(4)].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('').toUpperCase();
  }
  function flowOf(m) { return m.flow || NEUTRAL; }
  function beatColor(m, beat) {
    const f = flowOf(m);
    let hsl = hexToHsl(m.color), h = hsl[0], s = hsl[1], l = hsl[2];
    const target = [215, null, 35][f.temp[beat]];
    if (target !== null) { const diff = ((target - h + 540) % 360) - 180; h = (h + diff * 0.28 + 360) % 360; }
    s = Math.min(95, s * [0.5, 1, 1.25][f.sat[beat]]);
    l = Math.max(18, Math.min(88, l + [-20, 0, 16][f.light[beat]]));
    return hslToHex(h, s, l);
  }

  // ---------- 배색 (메인 컬러 → 서브·포인트 컬러) ----------
  const HARMONIES = [
    ['tonal', '톤온톤', '같은 색의 밝기 차이 — 통일감'],
    ['analogous', '유사색', '이웃한 색 — 자연스럽고 편안함'],
    ['complementary', '보색 대비', '반대 색 — 눈에 잘 띄는 포인트'],
    ['triadic', '3색 배색', '120° 간격 — 활기차고 다채로움']
  ];
  const MOODS = [['파스텔', 'pastel'], ['비비드', 'vivid'], ['내추럴', 'natural'], ['따뜻한', 'warm'], ['시원한', 'cool'], ['모던', 'modern'], ['고급스러운', 'elegant'], ['환상적인', 'dreamy']];
  const MOOD_MAX = 2;
  const MOOD_OPPOSITE = { 파스텔: '비비드', 비비드: '파스텔', 따뜻한: '시원한', 시원한: '따뜻한', 내추럴: '모던', 모던: '내추럴' };
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function harmonize(hex, kind) {
    const c = hexToHsl(hex), h = c[0], s = c[1], l = c[2];
    const mk = function (dh, ns, nl) { return hslToHex((h + dh + 360) % 360, clamp(ns, 8, 100), clamp(nl, 14, 94)); };
    if (kind === 'tonal') return [mk(0, s * 0.6, l + 24), mk(0, s * 1.15, l - 16)];
    if (kind === 'complementary') return [mk(0, s * 0.35, l + 24), mk(180, s, clamp(l, 50, 62))];
    if (kind === 'triadic') return [mk(120, s * 0.75, clamp(l, 68, 84)), mk(240, s, clamp(l, 50, 62))];
    return [mk(-32, s * 0.8, clamp(l, 72, 88)), mk(32, s * 1.05, clamp(l, 50, 62))];
  }
  function validHex(x) { return /^#[0-9a-f]{6}$/i.test(String(x || '')); }
  // 서브·포인트까지 정해졌을 때만 팔레트로 인정합니다.
  function hasPalette(m) { m = m || get(); return !!(m.color && validHex(m.palette.sub) && validHex(m.palette.point)); }
  function moodList(m) { return m.palette.moods.slice(-MOOD_MAX).concat([(m.palette.moodCustom || '').trim()]).filter(Boolean); }
  function moodEN(w) { const f = MOODS.find(function (x) { return x[0] === w; }); return f ? f[1] : (typeof ColorMEN !== 'undefined' ? ColorMEN.translate(w) : w); }
  function nm(hex) { return nearestColor(hex); }
  function paletteKR(m) {
    if (!hasPalette(m)) return '';
    const moods = moodList(m);
    return '메인 컬러 ' + m.color + '(' + m.colorName + '), 서브 컬러 ' + m.palette.sub.toUpperCase() + '(' + nm(m.palette.sub)[0] + '), 포인트 컬러 ' + m.palette.point.toUpperCase() + '(' + nm(m.palette.point)[0] + ')' +
      (moods.length ? ', 색감 무드 ' + moods.join('·') : '') + ', 탁하지 않고 맑은 색';
  }
  function paletteEN(m) {
    if (!hasPalette(m)) return '';
    const moods = moodList(m).map(moodEN);
    return 'main color ' + m.color + ' (' + enColorName(m) + '), sub color ' + m.palette.sub.toUpperCase() + ' (' + nm(m.palette.sub)[2] + '), accent color ' + m.palette.point.toUpperCase() + ' (' + nm(m.palette.point)[2] + ')' +
      (moods.length ? ', ' + moods.join(' and ') + ' mood' : '') + ', clean and clear colors, not muddy';
  }
  // 프롬프트에 붙일 팔레트 문구 (한국어 / 영어). 팔레트가 없으면 빈 문자열
  function paletteLine(lang) {
    const m = get();
    return lang === 'en' ? paletteEN(m) : paletteKR(m);
  }
  function withPal(m, kr, en) {
    const pk = paletteKR(m), pe = paletteEN(m);
    return register(pk ? kr + ' · ' + pk : kr, pe ? en + ', ' + pe : en);
  }

  // ---------- 장면 ↔ 5단계 흐름 ----------
  function beatSplit(n) {
    const a = Array(5).fill(Math.floor(n / 5)), order = [1, 2, 3, 0, 4];
    for (let k = 0; k < n % 5; k++) a[order[k]]++;
    return a;
  }
  function sceneBeats(n) {
    const out = [];
    beatSplit(n).forEach(function (c, b) { for (let k = 0; k < c; k++) out.push(b); });
    return out;
  }

  // ---------- 프롬프트용 색감 문구 ----------
  function toneKR(m, beat) { const f = flowOf(m); return DIMS.map(function (d) { return d.kr[f[d.key][beat]]; }).join(', '); }
  function toneEN(m, beat) { const f = flowOf(m); return DIMS.map(function (d) { return d.en[f[d.key][beat]]; }).join(', '); }
  function register(kr, en) { if (typeof ColorMEN !== 'undefined' && ColorMEN.addPairs) ColorMEN.addPairs([[kr, en]]); return kr; }

  // 장면 하나의 색감 문구 (색 흐름을 고른 경우)
  function sceneTone(m, beat) {
    const hex = beatColor(m, beat);
    return withPal(m,
      "마음색 '" + m.colorName + "'에서 출발해 " + toneKR(m, beat) + ' (중심 색 ' + hex + ')',
      "starting from the heart color '" + enColorName(m) + "', with " + toneEN(m, beat) + ' (main color ' + hex + ')'
    );
  }
  // 흐름을 고르지 않은 경우
  function plainTone(m) {
    return withPal(m,
      "마음색 '" + m.colorName + "'" + ColorM.josa(m.colorName, ['을', '를']) + ' 바탕으로 이 장면의 감정에 어울리는 색감 (' + m.color + ')',
      "a palette based on the heart color '" + enColorName(m) + "' (" + m.color + ') that suits the emotion of this scene'
    );
  }
  function coverTone(m) {
    return withPal(m,
      "마음색 '" + m.colorName + "'(" + m.color + ') 중심으로 이야기 전체의 분위기를 담은 색감',
      "a palette centered on the heart color '" + enColorName(m) + "' (" + m.color + ') that carries the mood of the whole story'
    );
  }
  function toneForScene(sceneIdx, n) {
    const m = get();
    if (!hasColor(m)) return '';
    if (m.flowPreset && m.flow) return sceneTone(m, sceneBeats(n)[Math.min(sceneIdx, n - 1)] || 0);
    return plainTone(m);
  }

  // ---------- 마음색 → 기획 규칙 ----------
  const MOOD_BY_EMOTION = { 편안함: '잔잔하고 감성적인', 설렘: '밝고 경쾌한', 위로: '따뜻하고 다정한', 외로움: '잔잔하고 감성적인', 용기: '따뜻하고 다정한', 희망: '따뜻하고 다정한', 따뜻함: '따뜻하고 다정한', 불안: '잔잔하고 감성적인', 자유: '밝고 경쾌한', 기대: '밝고 경쾌한' };
  const HERO_BY_EMOTION = { 편안함: '느긋하게 쉬고 싶은 아기 곰', 설렘: '두근두근 설레는 작은 새', 위로: '위로가 필요한 작은 토끼', 외로움: '혼자라고 느끼는 작은 고양이', 용기: '용기를 내어보고 싶은 아기 곰', 희망: '작은 씨앗을 품은 아이', 따뜻함: '따뜻한 마음을 나누는 강아지', 불안: '걱정이 많은 작은 토끼', 자유: '넓은 하늘을 꿈꾸는 작은 새', 기대: '새로운 날을 기다리는 아이' };
  const HERO_ADULT_BY_EMOTION = { 편안함: '느긋한 휴식을 바라는', 설렘: '설레는 마음을 안은', 위로: '위로가 필요한', 외로움: '혼자라고 느끼는', 용기: '용기를 내보고 싶은', 희망: '작은 희망을 품은', 따뜻함: '따뜻한 마음을 나누고 싶은', 불안: '걱정이 많은', 자유: '답답함에서 벗어나고 싶은', 기대: '새로운 날을 기다리는' };
  // 01 기획에서 고른 대상 독자가 아이(유아·초등)가 아니면 동물 대신 "○○ 한 사람"으로 만듭니다.
  function heroFor(emo) {
    const aud = (document.getElementById('audience') || {}).value || '';
    if (/유아|초등|어린이|아동/.test(aud) || !aud) return HERO_BY_EMOTION[emo] || '마음의 색을 찾아 나선 작은 주인공';
    const who = /여성|여자|엄마|언니|아내/.test(aud) ? '여성' : /남성|남자|아빠|형|남편/.test(aud) ? '남성' : '사람';
    return (HERO_ADULT_BY_EMOTION[emo] || '마음의 색을 찾아 나선') + ' 한 ' + who;
  }
  const PROBLEM_BY_EMOTION = { 편안함: '쉬고 싶지만 마음이 어디에 머무는지 알 수 없다', 설렘: '설레는 마음을 어떻게 전해야 할지 모른다', 위로: '속상한 마음을 털어놓을 곳이 없다', 외로움: '혼자라고 느껴져 마음이 쓸쓸하다', 용기: '해보고 싶지만 한 걸음이 떨어지지 않는다', 희망: '작은 희망이 보이지만 믿기가 어렵다', 따뜻함: '따뜻한 마음을 어떻게 나눌지 모른다', 불안: '알 수 없는 걱정이 자꾸 마음을 흔든다', 자유: '답답한 마음이 어디론가 떠나고 싶어 한다', 기대: '기다리는 시간이 길게만 느껴진다' };
  const TOPIC_BY_NEED = { 휴식: '지친 마음에 쉼을 주는 시간', 위로: '마음을 위로받는 이야기', 용기: '용기를 내어 내딛는 한 걸음', 자신감: '나를 믿는 마음', 응원: '서로를 응원하는 마음', '새로운 시작': '새로운 시작의 설렘', 안정: '마음의 안정과 평온', 여유: '여유를 찾는 하루', 집중: '나에게 집중하는 시간', 표현: '마음을 표현하는 용기' };
  const GOAL_BY_NEED = { 휴식: '마음 편히 쉴 곳을 찾고 싶다', 위로: '따뜻한 위로를 받고 싶다', 용기: '두려움을 이겨내고 한 걸음 내딛고 싶다', 자신감: '나를 믿는 마음을 찾고 싶다', 응원: '누군가에게 응원을 건네고 싶다', '새로운 시작': '새로운 시작을 해보고 싶다', 안정: '마음의 평온을 되찾고 싶다', 여유: '바쁜 마음을 내려놓고 싶다', 집중: '나에게 집중하는 시간을 갖고 싶다', 표현: '내 마음을 솔직하게 표현하고 싶다' };
  const MESSAGE_BY_NEED = { 휴식: '쉬어가도 괜찮다', 위로: '마음은 이미 충분히 소중하다', 용기: '작은 용기가 마음의 색을 바꾼다', 자신감: '나는 나만의 색으로 충분하다', 응원: '따뜻한 응원은 마음을 밝힌다', '새로운 시작': '새로운 시작은 작은 한 걸음에서 온다', 안정: '마음이 고요하면 세상도 고요해진다', 여유: '천천히 가도 괜찮다', 집중: '나에게 귀 기울이면 길이 보인다', 표현: '마음은 표현할수록 가벼워진다' };

  function planFromMind(m) {
    const emo = (m.emotions[0] || m.emotionCustom || '').trim();
    const need = (m.needs[0] || m.needCustom || '').trim();
    const memory = (m.memory || '').trim().split(/[.!?\n]/)[0].trim().slice(0, 40);
    const j = function (w, pair) { return ColorM.josa(w, pair); };
    let problem = PROBLEM_BY_EMOTION[emo] || (emo ? '마음속에 ' + emo + j(emo, ['이', '가']) + ' 가득해 어찌할 바를 모르겠다' : '자신의 마음이 어떤 색인지 아직 잘 모른다');
    if (memory) problem += ' (마음속에는 「' + memory + '」의 기억이 남아 있다)';
    return {
      topic: TOPIC_BY_NEED[need] || (need ? need + j(need, ['이', '가']) + ' 필요한 마음' : (emo ? emo + '의 마음' : '내 마음의 색')),
      genre: '감성 이야기',
      mood: MOOD_BY_EMOTION[emo] || '따뜻하고 다정한',
      hero: heroFor(emo),
      goal: GOAL_BY_NEED[need] || (need ? need + j(need, ['을', '를']) + ' 찾고 싶다' : '내 마음의 색을 찾고 싶다'),
      problem: problem,
      message: MESSAGE_BY_NEED[need] || '마음의 색은 있는 그대로 소중하다',
      place: '마음의 색이 번지는 작은 마을',
      time: '어느 날',
      special: "마음색 '" + m.colorName + "'" + j(m.colorName, ['이', '가']) + ' 이야기 곳곳에 은은하게 나타나는 세계'
    };
  }

  // ---------- 01 기획: 마음색 입구 (한 단계씩) ----------
  const ENTRY_PANELS = [
    { title: '오늘 내 마음은 무슨 색일까요?', lead: '지금 마음과 가장 가까운 색을 하나 골라보세요.' },
    { title: '이 그림책의 대표 색 3가지를 정해볼까요?', lead: '고른 마음색이 메인 컬러가 돼요. 추천 배색을 누르면 어울리는 서브·포인트 컬러가 채워지고, 직접 고쳐도 돼요.' },
    { title: '이 색을 보면 어떤 감정이 떠오르나요?', lead: '여러 개를 선택해도 좋아요. 없다면 직접 적어도 돼요.' },
    { title: '떠오르는 기억이나 장면이 있나요?', lead: '선택 사항이에요. 짧게 적어도 괜찮아요.' },
    { title: '지금 내게 필요한 것은 무엇인가요?', lead: '여러 개를 선택해도 좋아요.' },
    { title: '이야기가 흐르면서 색은 어떻게 변할까요?', lead: '이야기 전체에 한 번만 정해요. 장면마다 밝기·채도·온도가 조금씩 달라져서 마음의 변화가 색으로 이어져요. 잘 모르겠다면 AI 추천을 눌러보세요. 다 고르면 아래 버튼으로 기획을 채워요.' }
  ];

  function mountEntry(anchor) {
    if (!anchor || !anchor.parentNode) return;
    const sec = document.createElement('section');
    sec.className = 'card mind-card';
    sec.innerHTML =
      '<p class="mind-intro">🎨 <b>방법 1. 마음색으로 시작</b> — 질문 몇 개에 답하면 기획이 자동으로 채워져요. &nbsp;·&nbsp; <b>방법 2.</b> 이미 정한 이야기가 있다면 <a href="#planForm" data-act="skip">건너뛰고 바로 기획하기 ↓</a></p>' +
      '<div class="mind-progress"><b data-role="ptext"></b><span class="mind-pdots" data-role="pdots"></span></div>' +
      '<div class="step"><span>시작 · 마음색 (선택)</span><h2 data-role="title"></h2></div>' +
      '<p class="help" data-role="lead"></p>' +
      '<div data-panel="0">' +
        '<div class="mind-preview" data-role="preview"><b data-role="previewName"></b></div>' +
        '<div class="mind-swatches" data-role="colors"></div>' + CUSTOM_HTML +
        '<label>색의 느낌 <small>(선택 · 예: 포근한 분홍, 조용한 파랑)</small><input type="text" data-role="label" placeholder="예: 포근한 분홍"></label>' +
      '</div>' +
      '<div data-panel="1" hidden>' +
        '<p class="help" data-role="palempty" hidden>먼저 앞 단계에서 마음색을 골라주세요.</p>' +
        '<div data-role="palbody">' +
          '<div class="pal-where"><b>이 3가지 색은 책 전체에 쓰여요</b>' +
            '<span>👤 캐릭터의 옷·소품</span><span>🖼️ 모든 장면의 배경·분위기</span><span>📕 표지</span>' +
            '<small>장면마다 색이 조금씩 달라지는 건 05 장면에서 따로 정해요.</small></div>' +
          '<p class="mind-sub">배색 추천 <small>메인 컬러 기준 · 누르면 서브·포인트 컬러로 적용</small></p>' +
          '<div class="pal-cards" data-role="harmonies"></div>' +
          '<p class="mind-sub">내 그림책의 대표 색 <small>컬러피커 · HEX · 직접 입력</small></p>' +
          '<div class="pal-rows" data-role="palrows"></div>' +
          '<p class="mind-sub">컬러 무드 <small>최대 2개 · 반대되는 무드는 함께 고를 수 없어요</small></p>' +
          '<div class="mind-chips" data-role="moods"></div>' +
          '<input type="text" class="mind-extra" data-role="moodCustom" placeholder="다른 무드가 있다면 직접 적어주세요">' +
        '</div>' +
      '</div>' +
      '<div data-panel="2" hidden>' +
        '<div class="mind-chips" data-role="emotions"></div>' +
        '<input type="text" class="mind-extra" data-role="emotionCustom" placeholder="다른 감정이 있다면 직접 적어주세요">' +
      '</div>' +
      '<div data-panel="3" hidden>' +
        '<textarea data-role="memory" rows="3" placeholder="예: 친구와 함께 걷던 노을 진 길"></textarea>' +
      '</div>' +
      '<div data-panel="4" hidden>' +
        '<div class="mind-chips" data-role="needs"></div>' +
        '<input type="text" class="mind-extra" data-role="needCustom" placeholder="다른 필요가 있다면 직접 적어주세요">' +
      '</div>' +
      '<div data-panel="5" hidden>' +
        '<div class="recommend-box" style="margin-bottom:12px"><button type="button" class="btn primary" data-act="aiflow">✨ AI 추천 색 흐름</button>' +
          '<span class="help" data-role="reason" style="margin:0">지금까지 고른 감정과 기획 내용을 읽고 어울리는 흐름을 골라줘요. 추천 후에 바꿔도 돼요.</span></div>' +
        '<div class="mind-flow-presets" data-role="presets"></div>' +
        '<div class="mind-strip" data-role="strip"></div>' +
        '<div class="mind-tone" data-role="tone"></div>' +
      '</div>' +
      '<div class="actions mind-nav">' +
        '<button type="button" class="btn ghost" data-act="prev">← 이전</button>' +
        '<button type="button" class="btn primary" data-act="next">다음 →</button>' +
        '<button type="button" class="btn primary" data-act="apply">마음색으로 기획 채우기</button>' +
      '</div>' +
      '<p class="help mind-status" style="margin:10px 0 0"></p>';
    anchor.parentNode.insertBefore(sec, anchor);

    const q = function (role) { return sec.querySelector('[data-role="' + role + '"]'); };
    const status = sec.querySelector('.mind-status');
    let m = get();
    let cur = 0;
    const LAST = ENTRY_PANELS.length - 1;

    function drawColors() {
      q('colors').innerHTML = COLORS.map(function (c) {
        return '<button type="button" class="mind-sw' + (m.color === c[1] ? ' on' : '') + '" data-color="' + c[1] + '" data-name="' + c[0] + '">' +
          '<i style="background:' + c[1] + '"></i>' + c[0] + '</button>';
      }).join('');
      if (m.color) q('customColor').value = m.color.toLowerCase();
      q('customName').textContent = customLine(m);
      const pv = q('preview');
      pv.style.background = m.color || '#F1ECE9';
      q('previewName').textContent = m.color ? (isPreset(m.color) ? m.colorName : '나만의 색') : '색을 골라주세요';
    }
    function drawChips(role, list, key) {
      q(role).innerHTML = list.map(function (it) {
        const name = Array.isArray(it) ? it[0] : it, ico = Array.isArray(it) ? it[1] + ' ' : '';
        return '<button type="button" class="mind-chip' + (m[key].indexOf(name) >= 0 ? ' on' : '') + '" data-chip="' + key + '" data-v="' + esc(name) + '">' + ico + esc(name) + '</button>';
      }).join('');
    }
    // ----- 배색 패널 -----
    function palKeyHex(key) { return key === 'main' ? m.color : m.palette[key]; }
    function drawHarmonies() {
      const main = m.color || '#F58DB4';
      q('harmonies').innerHTML = HARMONIES.map(function (h) {
        const p = harmonize(main, h[0]);
        return '<button type="button" class="pal-card' + (m.palette.harmony === h[0] ? ' on' : '') + '" data-harmony="' + h[0] + '">' +
          '<span class="pal-bar"><i style="background:' + main + '"></i><i style="background:' + p[0] + '"></i><i style="background:' + p[1] + '"></i></span>' +
          '<b>' + h[1] + '</b><small>' + h[2] + '</small></button>';
      }).join('');
    }
    function drawRows() {
      const rows = [['main', '메인 컬러', '가장 많이 보이는 색'], ['sub', '서브 컬러', '메인을 받쳐주는 부드러운 색'], ['point', '포인트 컬러', '눈에 띄는 작은 강조 색']];
      q('palrows').innerHTML = rows.map(function (r) {
        const hex = palKeyHex(r[0]) || '';
        return '<div class="pal-row" data-key="' + r[0] + '"><b>' + r[1] + '<small>' + r[2] + '</small></b>' +
          '<input type="color" data-role="palColor" data-key="' + r[0] + '" value="' + (validHex(hex) ? hex.toLowerCase() : '#cccccc') + '" aria-label="' + r[1] + '">' +
          '<input type="text" class="pal-hex" data-role="palHex" data-key="' + r[0] + '" value="' + (validHex(hex) ? hex.toUpperCase() : '') + '" placeholder="#HEX" maxlength="7" aria-label="' + r[1] + ' HEX">' +
          '<span class="pal-name" data-role="palName" data-key="' + r[0] + '">' + (validHex(hex) ? nm(hex)[0] : '추천 배색을 누르거나 직접 골라요') + '</span></div>';
      }).join('');
    }
    function refreshRow(key, skipText) {
      const hex = palKeyHex(key), row = q('palrows').querySelector('[data-key="' + key + '"]');
      if (!row || !validHex(hex)) return;
      row.querySelector('[data-role="palColor"]').value = hex.toLowerCase();
      if (!skipText) row.querySelector('[data-role="palHex"]').value = hex.toUpperCase();
      row.querySelector('[data-role="palName"]').textContent = nm(hex)[0];
    }
    function drawPalette() {
      const on = hasColor(m);
      q('palempty').hidden = on; q('palbody').hidden = !on;
      if (!on) return;
      drawHarmonies(); drawRows(); drawMoods();
      q('moodCustom').value = m.palette.moodCustom;
    }
    function drawMoods() {
      m.palette.moods = m.palette.moods.filter(function (w) { return MOODS.some(function (x) { return x[0] === w; }); }).slice(-MOOD_MAX);
      q('moods').innerHTML = MOODS.map(function (x) {
        return '<button type="button" class="mind-chip' + (m.palette.moods.indexOf(x[0]) >= 0 ? ' on' : '') + '" data-mood="' + x[0] + '">' + x[0] + '</button>';
      }).join('');
    }
    // ----- 색 흐름 패널 (이야기 전체 5단계) -----
    function drawFlow() {
      q('presets').innerHTML = PRESETS.map(function (p) {
        return '<button type="button" class="mind-flow' + (m.flowPreset === p[0] ? ' on' : '') + '" data-preset="' + esc(p[0]) + '"><b>' + esc(p[0]) + '</b><small>' + esc(p[1]) + '</small></button>';
      }).join('') + '<button type="button" class="mind-flow' + (!m.flowPreset ? ' on' : '') + '" data-preset=""><b>흐름 없이</b><small>장면마다 감정에 맞는 색으로</small></button>';
      if (!hasColor(m)) { q('strip').innerHTML = ''; q('tone').textContent = '먼저 앞 단계에서 마음색을 골라주세요.'; return; }
      const SHORT = ['지금의 마음', '작은 사건', '마음이 움직임', '변화의 순간', '새로운 발견'];
      q('strip').innerHTML = BEATS.map(function (_, b) {
        const hex = m.flowPreset ? beatColor(m, b) : m.color;
        return '<div class="mind-dotwrap"><i style="background:' + hex + '"></i><small>' + SHORT[b] + '</small></div>';
      }).join('');
      q('tone').innerHTML = m.flowPreset
        ? '<ul class="flow-lines">' + BEATS.map(function (nm, b) { return '<li><b>' + (b + 1) + '. ' + esc(nm) + '</b> — ' + esc(toneKR(m, b)) + '</li>'; }).join('') + '</ul>'
        : '<p class="help" style="margin:0">흐름 없이 고르면 장면의 감정에 맞게 마음색을 바탕으로 색감을 정해요.</p>';
    }
    function showPanel(i) {
      cur = Math.max(0, Math.min(LAST, i));
      if (cur === 5) drawFlow();
      if (cur === 1 && hasColor(m) && !m.palette.sub && !m.palette.point) {
        const p = harmonize(m.color, 'analogous');
        m.palette.harmony = 'analogous'; m.palette.sub = p[0]; m.palette.point = p[1]; save(m);
      }
      if (cur === 1) drawPalette();
      [].slice.call(sec.querySelectorAll('[data-panel]')).forEach(function (p) { p.hidden = (+p.dataset.panel !== cur); });
      q('ptext').textContent = '마음색 찾기 ' + (cur + 1) + '/' + (LAST + 1);
      q('pdots').innerHTML = ENTRY_PANELS.map(function (_, k) { return '<button type="button" class="mind-pdot' + (k === cur ? ' on' : (k < cur ? ' done' : '')) + '" data-go="' + k + '" aria-label="' + (k + 1) + '단계"></button>'; }).join('');
      q('title').textContent = ENTRY_PANELS[cur].title;
      q('lead').textContent = ENTRY_PANELS[cur].lead;
      sec.querySelector('[data-act="prev"]').hidden = cur === 0;
      sec.querySelector('[data-act="next"]').hidden = cur === LAST;
      sec.querySelector('[data-act="apply"]').hidden = cur !== LAST;
      status.textContent = '';
    }
    function draw() {
      drawColors(); drawChips('emotions', EMOTIONS, 'emotions'); drawChips('needs', NEEDS, 'needs');
      q('label').value = m.colorLabel; q('memory').value = m.memory;
      q('emotionCustom').value = m.emotionCustom; q('needCustom').value = m.needCustom;
      showPanel(cur);
    }
    draw();

    sec.addEventListener('click', function (e) {
      const sw = e.target.closest('.mind-sw');
      if (sw) { setMain(m, sw.dataset.color, sw.dataset.name); drawColors(); return; }
      const fp = e.target.closest('.mind-flow');
      if (fp) {
        const p = PRESETS.find(function (x) { return x[0] === fp.dataset.preset; });
        m.flowPreset = p ? p[0] : ''; m.flow = p ? JSON.parse(JSON.stringify(p[2])) : null;
        save(m); drawFlow();
        q('reason').textContent = '직접 고른 흐름이에요. 다시 추천받고 싶다면 위 버튼을 눌러보세요.';
        return;
      }
      if (e.target.closest('[data-act="aiflow"]')) {
        const r = recommendFlow(m);
        m.flowPreset = r.preset[0]; m.flow = JSON.parse(JSON.stringify(r.preset[2]));
        save(m); drawFlow();
        q('reason').textContent = '✨ ' + r.reason;
        return;
      }
      const hc = e.target.closest('[data-harmony]');
      if (hc) {
        const p = harmonize(m.color, hc.dataset.harmony);
        m.palette.harmony = hc.dataset.harmony; m.palette.sub = p[0]; m.palette.point = p[1]; save(m);
        drawHarmonies(); refreshRow('sub'); refreshRow('point'); return;
      }
      const mood = e.target.closest('[data-mood]');
      if (mood) {
        const arr = m.palette.moods, pick = mood.dataset.mood, i = arr.indexOf(pick);
        if (i >= 0) arr.splice(i, 1);
        else {
          // 반대되는 무드는 함께 고를 수 없고, 최대 2개까지만 고를 수 있어요 (넘으면 먼저 고른 것이 빠져요)
          const opp = MOOD_OPPOSITE[pick], j = arr.indexOf(opp);
          if (j >= 0) arr.splice(j, 1);
          arr.push(pick);
          while (arr.length > MOOD_MAX) arr.shift();
        }
        save(m); drawMoods(); return;
      }
      const chip = e.target.closest('.mind-chip');
      if (chip) {
        const arr = m[chip.dataset.chip], v = chip.dataset.v, i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else arr.push(v);
        save(m); chip.classList.toggle('on'); return;
      }
      const dot = e.target.closest('[data-go]');
      if (dot) { if (cur === 0 && +dot.dataset.go > 0 && !hasColor(m)) { status.textContent = '먼저 마음색을 골라주세요.'; return; } showPanel(+dot.dataset.go); return; }
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'skip') {
        e.preventDefault();
        const f = document.getElementById('planForm');
        if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (act.dataset.act === 'prev') { showPanel(cur - 1); return; }
      if (act.dataset.act === 'next') {
        if (cur === 0 && !hasColor(m)) { status.textContent = '먼저 마음색을 하나 골라주세요.'; return; }
        showPanel(cur + 1); return;
      }
      if (act.dataset.act === 'apply') {
        if (!hasColor(m)) { showPanel(0); status.textContent = '먼저 마음색을 하나 골라주세요.'; return; }
        const filled = ColorMRecommend.fillAll(planFromMind(m));
        if (filled === false) return;
        status.textContent = "마음색 '" + m.colorName + "'로 기획을 채웠어요. 아래 내용을 읽어보고 마음에 안 드는 부분은 고쳐주세요.";
        const f = document.getElementById('planForm');
        if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    sec.addEventListener('input', function (e) {
      const role = e.target.dataset && e.target.dataset.role;
      if (!role) return;
      if (role === 'customColor') { setCustom(m, e.target.value); drawColors(); return; }
      if (role === 'palColor' || role === 'palHex') {
        const key = e.target.dataset.key;
        let hex = e.target.value.trim();
        if (role === 'palHex') { if (hex && hex[0] !== '#') hex = '#' + hex; if (!validHex(hex)) return; }
        hex = hex.toUpperCase();
        if (key === 'main') { setMain(m, hex); drawColors(); drawHarmonies(); ['main', 'sub', 'point'].forEach(function (k) { refreshRow(k, k === key && role === 'palHex'); }); return; }
        m.palette[key] = hex; m.palette.harmony = ''; save(m);
        refreshRow(key, role === 'palHex'); drawHarmonies(); return;
      }
      if (role === 'moodCustom') { m.palette.moodCustom = e.target.value; save(m); return; }
      const map = { label: 'colorLabel', memory: 'memory', emotionCustom: 'emotionCustom', needCustom: 'needCustom' };
      if (map[role]) { m[map[role]] = e.target.value; save(m); }
    });
  }

  // 오른쪽 "내 그림책 카드"에서 쓰는 5단계 색 (흐름을 고르지 않았으면 null)
  function flowColors() {
    const m = get();
    if (!hasColor(m) || !m.flowPreset || !m.flow) return null;
    return [0, 1, 2, 3, 4].map(function (b) { return beatColor(m, b); });
  }
  // ---------- AI 추천 색 흐름 (이야기 내용을 읽는 규칙 기반) ----------
  const FLOW_WORDS = {
    '점점 밝아져요': ['위로', '희망', '극복', '용기', '외로', '쓸쓸', '슬픔', '슬프', '걱정', '치유', '새로운 시작', '자신감', '성장', '응원', '이겨', '찾아'],
    '잔잔하게 이어져요': ['편안', '휴식', '쉬', '여유', '평온', '안정', '일상', '잔잔', '조용', '산책', '느긋', '하루'],
    '흔들렸다 돌아와요': ['갈등', '다툼', '싸움', '실수', '화해', '용서', '두려', '불안', '도전', '시련', '실패', '오해', '상처', '혼란', '흔들'],
    '들뜬 마음이 차분해져요': ['설렘', '설레', '들뜬', '바쁜', '기대', '소풍', '축제', '긴장', '신나', '파티', '복잡', '서두']
  };
  const FLOW_WHY = {
    '점점 밝아져요': '이야기가 힘든 마음에서 시작해 희망으로 나아가는 흐름이라서',
    '잔잔하게 이어져요': '큰 사건보다 조용히 마음을 들여다보는 이야기라서',
    '흔들렸다 돌아와요': '한 번 흔들렸다가 다시 제자리를 찾는 이야기라서',
    '들뜬 마음이 차분해져요': '들뜨거나 바쁜 마음이 편안해지는 이야기라서'
  };
  const EMO_COLOR = { 편안함: '민트', 설렘: '핑크', 위로: '코랄', 외로움: '블루', 용기: '오렌지', 희망: '라임', 따뜻함: '오렌지', 불안: '라벤더', 자유: '터콰이즈', 기대: '옐로우' };
  function recommendFlow(m) {
    const pr = ColorM.getProject();
    const text = [pr.plan, pr.story].map(function (o) { return o ? Object.keys(o).map(function (k) { return typeof o[k] === 'string' ? o[k] : ''; }).join(' ') : ''; }).join(' ') +
      ' ' + m.emotions.join(' ') + ' ' + m.emotionCustom + ' ' + m.needs.join(' ') + ' ' + m.needCustom + ' ' + m.memory +
      ' ' + [].slice.call(document.querySelectorAll('#planForm input, #planForm textarea')).map(function (el) { return el.value; }).join(' ');
    let best = PRESETS[0], bs = 0, hit = '';
    PRESETS.forEach(function (p) {
      let s = 0, first = '';
      FLOW_WORDS[p[0]].forEach(function (w) { const c = text.split(w).length - 1; if (c) { s += c; if (!first) first = w; } });
      if (s > bs) { bs = s; best = p; hit = first; }
    });
    const emo = m.emotions[0] || '';
    const cn = EMO_COLOR[emo] || '핑크';
    const color = COLORS.find(function (c) { return c[0] === (m.color ? m.colorName : cn); }) || COLORS.find(function (c) { return c[0] === cn; });
    const why = FLOW_WHY[best[0]];
    return {
      preset: best, color: color,
      reason: bs ? '「' + hit + '」 같은 내용이 있어서, ' + why + ' 「' + best[0] + '」 흐름을 추천했어요.'
                 : '이야기에서 뚜렷한 단서를 찾지 못해, 가장 무난한 「' + best[0] + '」 흐름을 추천했어요.'
    };
  }

  // ---------- 05 장면: 색 흐름 ----------
  function sceneCountNow() {
    const pr = ColorM.getProject();
    const fromBoard = pr.storyboard && pr.storyboard.scenes && pr.storyboard.scenes.length;
    const fromDom = document.querySelectorAll('#sceneOptions button[data-i]').length;
    return fromBoard || fromDom || (pr.story && pr.story.sceneCount) || 5;
  }
  function selectedSceneNow() {
    const b = document.querySelector('#sceneOptions button.on');
    return b ? parseInt(b.dataset.i, 10) || 0 : 0;
  }

  function mountFlowSummary(anchor) {
    if (!anchor || !anchor.parentNode) return;
    const sec = document.createElement('section');
    sec.className = 'card mind-card';
    sec.innerHTML =
      '<div class="step"><span>이 그림책의 색</span><h2>이야기 전체의 색 흐름</h2></div>' +
      '<div data-role="body"></div>';
    anchor.parentNode.insertBefore(sec, anchor);
    const body = sec.querySelector('[data-role="body"]');

    function draw() {
      const m = get(), n = sceneCountNow(), sel = Math.min(selectedSceneNow(), n - 1), beats = sceneBeats(n);
      if (!hasColor(m)) {
        body.innerHTML = '<p class="help">아직 마음색을 고르지 않았어요. ' + ColorM.stepRef('plan', '01 기획') + '에서 색을 정하면 장면마다 어울리는 색감이 자동으로 채워져요.</p>';
        return;
      }
      const pal = hasPalette(m) ? [m.color, m.palette.sub, m.palette.point] : null;
      const dots = beats.map(function (b, i) {
        const hex = m.flowPreset ? beatColor(m, b) : m.color;
        return '<div class="mind-dotwrap' + (i === sel ? ' on' : '') + '"><i style="background:' + hex + '"></i><small>' + String(i + 1).padStart(2, '0') + '</small></div>';
      }).join('');
      const beat = beats[sel] || 0;
      const tone = m.flowPreset
        ? toneKR(m, beat) + ' (중심 색 ' + beatColor(m, beat) + ')'
        : "마음색 '" + m.colorName + "'" + ColorM.josa(m.colorName, ['을', '를']) + ' 바탕으로 장면의 감정에 어울리는 색감';
      body.innerHTML =
        '<p class="help" style="margin-top:0">01에서 정한 색이 장면마다 자동으로 적용돼요. 장면을 고르면 아래 <b>컬러 분위기</b> 칸에 그 장면의 색감이 채워져요.</p>' +
        '<div class="flow-sum"><b>색 흐름</b><span>' + esc(m.flowPreset || '흐름 없이 (장면 감정에 맞게)') + '</span>' +
        (pal ? '<span class="pal-bar" style="width:110px">' + pal.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' : '') +
        '<small>' + ColorM.stepRef('plan', '01 기획') + '에서 바꿔요</small></div>' +
        '<div class="mind-strip">' + dots + '</div>' +
        '<p class="mind-tone"><b>장면 ' + String(sel + 1).padStart(2, '0') + ' · ' + esc(BEATS[beat]) + '</b> — ' + esc(tone) + '</p>';
    }
    draw();
    document.addEventListener('click', function (e) {
      if (e.target.closest('#sceneOptions')) setTimeout(draw, 0);
    });
  }

  // ---------- ChatGPT 요청문에 넣을 마음색 정보 ----------
  function seedText() {
    const m = get();
    if (!hasColor(m)) return '';
    const emo = m.emotions.concat([m.emotionCustom.trim()]).filter(Boolean).join(', ');
    const need = m.needs.concat([m.needCustom.trim()]).filter(Boolean).join(', ');
    const lines = ['[내 마음색 이야기 씨앗]', '마음색: ' + m.colorName + (m.colorLabel ? ' (' + m.colorLabel + ')' : '') + ' ' + m.color];
    if (emo) lines.push('감정: ' + emo);
    if (m.memory.trim()) lines.push('기억: ' + m.memory.trim());
    if (need) lines.push('지금 필요한 것: ' + need);
    if (hasPalette(m)) lines.push('색상 팔레트: ' + paletteKR(m));
    return lines.join('\n');
  }
  // 같은 단계(beat)에 속한 장면을 묶어 "01~03 지금의 마음: …" 형태로
  function flowLines(n) {
    const m = get();
    if (!hasColor(m) || !m.flowPreset || !m.flow) return [];
    const out = [];
    let start = 0;
    beatSplit(n).forEach(function (c, b) {
      if (!c) return;
      const nn = function (i) { return String(i + 1).padStart(2, '0'); };
      out.push((c > 1 ? nn(start) + '~' + nn(start + c - 1) : nn(start)) + ' ' + BEATS[b] + ': ' + toneKR(m, b) + ' (중심 색 ' + beatColor(m, b) + ')');
      start += c;
    });
    return out;
  }
  // 전체 결과 화면·TXT에 쓰는 마음색 요약 (마음색을 안 골랐으면 빈 배열)
  function summaryLines() {
    const m = get();
    if (!hasColor(m)) return [];
    const emo = m.emotions.concat([m.emotionCustom.trim()]).filter(Boolean).join(', ');
    const need = m.needs.concat([m.needCustom.trim()]).filter(Boolean).join(', ');
    const L = ['마음색: ' + m.colorName + (m.colorLabel ? ' (' + m.colorLabel + ')' : '') + ' ' + m.color];
    if (emo) L.push('감정: ' + emo);
    if (m.memory.trim()) L.push('기억: ' + m.memory.trim());
    if (need) L.push('지금 필요한 것: ' + need);
    if (hasPalette(m)) {
      L.push('대표 색: 메인 ' + m.color + '(' + m.colorName + ') / 서브 ' + m.palette.sub.toUpperCase() + '(' + nm(m.palette.sub)[0] + ') / 포인트 ' + m.palette.point.toUpperCase() + '(' + nm(m.palette.point)[0] + ')');
      const mo = moodList(m);
      if (mo.length) L.push('컬러 무드: ' + mo.join('·'));
    }
    L.push('색 흐름: ' + (m.flowPreset || '흐름 없이 (장면 감정에 맞게)'));
    return L;
  }
  const BEATS_EN = ['the current feeling', 'a small event', 'the moment the heart moves', 'the moment of change', 'a new discovery'];
  function flowLinesEN(n) {
    const m = get();
    if (!hasColor(m) || !m.flowPreset || !m.flow) return [];
    const out = [];
    let start = 0;
    beatSplit(n).forEach(function (c, b) {
      if (!c) return;
      const nn = function (i) { return String(i + 1).padStart(2, '0'); };
      out.push((c > 1 ? 'Scenes ' + nn(start) + '–' + nn(start + c - 1) : 'Scene ' + nn(start)) + ' (' + BEATS_EN[b] + '): ' + toneEN(m, b) + ' (main color ' + beatColor(m, b) + ')');
      start += c;
    });
    return out;
  }
  return {
    summaryLines: summaryLines, flowLinesEN: flowLinesEN,
    seedText: seedText, flowLines: flowLines, flowColors: flowColors, colorNameEN: function () { return enColorName(get()); },
    get: get, save: save, hasColor: hasColor,
    hasPalette: function () { return hasPalette(get()); }, paletteLine: paletteLine,
    paletteColors: function () { const m = get(); return hasPalette(m) ? [m.color, m.palette.sub.toUpperCase(), m.palette.point.toUpperCase()] : null; },
    toneForScene: toneForScene, coverTone: coverTone, sceneBeats: sceneBeats, sceneCountNow: sceneCountNow, selectedSceneNow: selectedSceneNow,
    mountEntry: mountEntry, mountFlowSummary: mountFlowSummary, planFromMind: planFromMind
  };
})();
