/* ===================================================================
   COLOR.M 마음색 그림책 메이커 — ChatGPT 왕복 연결
   ① 지금까지 정한 내용으로 요청문을 만들어 복사 → ② ChatGPT·Claude·제미나이 등에서 답변 받기
   → ③ 받은 답변을 붙여넣으면 장면별 칸에 자동으로 나눠 채워줍니다.
   (서버·API 키 없이 사용자가 쓰는 AI 도구를 그대로 활용)
   답변 형식은 아래 FORMAT_* 상수 한 곳에서 관리합니다.
   =================================================================== */
const ColorMBridge = (function () {

  // ---------- 요청문에 들어가는 출력 형식 ----------
  const FORMAT_CAST = [
    '주인공: (종류, 생김새, 옷, 대표색, 소품)',
    '다른 인물:',
    '이름: 종류, 생김새, 옷, 대표색'
  ].join('\n');

  const FORMAT_STORYBOARD = [
    FORMAT_CAST,
    '',
    '[장면 1]',
    '제목: (장면 제목)',
    '등장인물:',
    '이름: 표정, 행동',
    '내용: (그림책 본문 1~3문장)',
    '대화:',
    '이름: "대사"',
    '그림콘티: (장소, 인물 위치, 카메라 거리, 시점, 배경 분위기)',
    '',
    '[장면 2]',
    '(같은 형식으로 마지막 장면까지)'
  ].join('\n');
  const FORMAT_STORY = [
    '[제목 후보]',
    '1. (제목)',
    '2. (제목)',
    '3. (제목)',
    '',
    '[전체 이야기 요약]',
    '(5~7문장)',
    '',
    '[장면 1]',
    '(2~3문장의 이야기)',
    '',
    '[장면 2]',
    '(같은 형식으로 마지막 장면까지)'
  ].join('\n');

  function ageRule(audience) {
    const a = String(audience || '');
    if (/유아/.test(a)) return '대상은 유아(5~7세)야. 문장은 짧고 쉬운 말로, 의성어·의태어와 반복 표현을 살려줘.';
    if (/저학년/.test(a)) return '대상은 초등 저학년이야. 쉬운 어휘로 한 문장을 짧게 써줘.';
    if (/고학년/.test(a)) return '대상은 초등 고학년이야. 조금 더 풍부한 표현과 감정 묘사를 써도 좋아.';
    if (/청소년/.test(a)) return '대상은 청소년이야. 섬세한 감정 표현을 써도 좋아.';
    return '대상 독자의 눈높이에 맞는 자연스러운 문장으로 써줘.';
  }

  // ---------- 프로젝트 정보 → 요청문 재료 ----------
  function line(label, v) { v = String(v == null ? '' : v).trim(); return v ? '- ' + label + ': ' + v : ''; }

  function contextText(plan, extra, withDraft) {
    const pr = ColorM.getProject();
    const story = pr.story || {}, ch = pr.character || {};
    const out = ['[그림책 정보]'];
    if (plan && plan.hero) {
      out.push([
        line('제목 후보', (story.titles || []).join(' / ')),
        line('주제', plan.topic), line('대상 독자', plan.audience),
        line('장르', plan.genre), line('전체 분위기', plan.mood),
        line('주인공', plan.hero), line('목표', plan.goal), line('문제·갈등', plan.problem),
        line('전하고 싶은 메시지', plan.message),
        line('장소', plan.place), line('시간·시대', plan.time), line('특별한 설정', plan.special)
      ].filter(Boolean).join('\n'));
    } else if (plan && plan.planSheet) {
      out.push(plan.planSheet);
    }
    if (typeof ColorMMind !== 'undefined' && ColorMMind.seedText()) out.push('\n' + ColorMMind.seedText());
    if (extra) out.push(extra);
    if (withDraft && story.summary) out.push('\n[전체 이야기 요약]\n' + story.summary);
    if (withDraft && story.scenes && story.scenes.length) {
      out.push('\n[장면별 이야기 초안 — 흐름 참고용]\n' + story.scenes.join('\n'));
    }
    if (ch && ch.name) {
      out.push('\n[캐릭터]\n' + [line('이름', ch.name), line('외형', ch.appearance), line('의상·소품', ch.outfit), line('대표색', ch.mainColor), line('성격', ch.personality)].filter(Boolean).join('\n'));
    }
    const castList = ColorM.castLines(pr);
    if (castList.length) {
      out.push('\n[함께 나오는 캐릭터]\n' + castList.map(function (c) { return '- ' + (c.name || c.role) + (c.role && c.name ? ' (' + c.role + ')' : '') + (c.desc ? ': ' + c.desc : ''); }).join('\n'));
    }
    return out.filter(Boolean).join('\n');
  }

  function mindOn() { return typeof ColorMMind !== 'undefined' && ColorMMind.hasColor(); }
  function numbered(rules) { return rules.filter(Boolean).map(function (r, i) { return (i + 1) + '. ' + r; }).join('\n'); }
  // 마음색을 고른 경우에만 붙는 규칙
  function mindRules() {
    if (!mindOn()) return [];
    const m = ColorMMind.get();
    return [
      "마음색 '" + m.colorName + "'" + ColorM.josa(m.colorName, ['이', '가']) + ' 이야기 속에 자연스럽게 나타나게 해줘.',
      '색이나 감정을 보고 사람의 성격이나 심리를 단정하거나 진단하지 마. 이야기는 내가 정하고, 너는 쓰고 다듬는 역할만 해줘. 뻔한 교훈이나 지나친 설명은 빼줘.'
    ];
  }

  function requestStoryboard(opts) {
    const plan = opts.plan || (ColorM.getProject().plan || {});
    const flow = mindOn() ? ColorMMind.flowLines(opts.n) : [];
    const rules = [
      '총 ' + opts.n + '장면. 이야기 초안의 흐름을 따르되, 더 자연스럽고 생생하게 다듬어줘.',
      '"내용"은 그림책 지면에 실릴 본문(서술) 1~3문장이야. ' + ageRule(plan.audience),
      '"대화"는 등장인물의 대사 2~4줄이야. 한 줄에 한 명, 형식은 이름: "대사".',
      '"등장인물"은 그 장면에 나오는 인물마다 한 줄, 형식은 이름: 표정, 행동.',
      '"그림콘티"는 장소, 인물 위치, 카메라 거리, 시점, 배경 분위기를 한두 문장으로 써줘.' + (flow.length ? ' 색감은 아래 [색 흐름]을 따라줘.' : ''),
      '인물 이름과 설정은 모든 장면에서 똑같이 유지해줘.',
      '맨 위에 "주인공:" 한 줄과, 장면에 나오는 다른 인물(엄마·친구 등)마다 "이름: 종류, 생김새, 옷, 대표색" 한 줄을 적어줘. 그림으로 그릴 수 있게 구체적으로 써줘.'
    ].concat(mindRules(), ['인사말이나 설명 없이, 아래 출력 형식 그대로 출력해줘.']);
    return [
      '너는 어린이 그림책 스토리보드 작가야. 아래 정보를 바탕으로 그림책 스토리보드를 총 ' + opts.n + '장면으로 써줘.',
      '',
      contextText(plan, '', true),
      flow.length ? '\n[색 흐름]\n' + flow.join('\n') : '',
      '',
      '[쓰는 규칙]',
      numbered(rules),
      '',
      '[출력 형식]',
      FORMAT_STORYBOARD
    ].join('\n');
  }

  function requestStory(opts) {
    const plan = opts.plan || {};
    const extra = [line('이야기 스타일', opts.style), line('이야기 장치', opts.device)].filter(Boolean).join('\n');
    const rules = [
      '제목 후보 3개, 전체 이야기 요약(5~7문장), 장면별 이야기(각 2~3문장)를 써줘.',
      '총 ' + opts.n + '장면. 기-승-전-결의 흐름이 느껴지게 하고, 마지막에는 메시지가 자연스럽게 전해지게 해줘.',
      ageRule(plan.audience)
    ].concat(mindRules(), ['인사말이나 설명 없이, 아래 출력 형식 그대로만 출력해줘.']);
    return [
      '너는 어린이 그림책 작가야. 아래 기획을 바탕으로 그림책 이야기 초안을 ' + opts.n + '장면으로 써줘.',
      '',
      contextText(plan, extra, false),
      '',
      '[쓰는 규칙]',
      numbered(rules),
      '',
      '[출력 형식]',
      FORMAT_STORY
    ].join('\n');
  }
  // 질문 없이 한 번에 원고를 받는 짧은 요청문 (캔바 AI · Magic Write 등 입력이 짧은 도구용)
  const FORMAT_ONESHOT = [
    '제목 후보: (3개)',
    '제목: (그중 하나)',
    FORMAT_STORYBOARD
  ].join('\n');

  function requestOneShot(opts) {
    const plan = opts.plan || (ColorM.getProject().plan || {});
    const n = opts.n;
    const seed = typeof ColorMMind !== 'undefined' ? ColorMMind.seedText() : '';
    const flow = mindOn() ? ColorMMind.flowLines(n) : [];
    const planLines = [
      line('주제', plan.topic), line('대상 독자', plan.audience), line('분위기', plan.mood),
      line('주인공', plan.hero), line('목표', plan.goal), line('문제·갈등', plan.problem),
      line('전하고 싶은 메시지', plan.message), line('장소', plan.place)
    ].filter(Boolean).join('\n');
    const rules = [
      '주인공은 위 내용을 대신 표현하는 캐릭터로 정하고, "주인공:" 줄에 종류, 생김새, 옷, 대표색, 소품을 한 줄로 적어줘. 장면에 나오는 다른 인물은 "다른 인물:" 아래에 "이름: 종류, 생김새, 옷, 대표색"으로 한 줄씩 적어줘.',
      n + '장면. 장면마다 본문 ' + (n >= 10 ? '1~3' : '2~4') + '문장, 대화 2~3줄, 그림콘티(장소·인물·행동·구도) 한 줄을 써줘. 그림 안에는 글자를 넣지 않는 걸로 해줘.',
      ageRule(plan.audience),
      '제목은 짧고 감성적인 후보 3개를 적고, 가장 어울리는 하나를 "제목:"에 적어줘.'
    ].concat(mindRules(), flow.length ? ['그림콘티의 색감은 아래 [색 흐름]을 따라줘.'] : [], ['아래 형식 그대로, 생략 없이 써줘.']);
    const parts = ['너는 그림책 작가야. 나에게 질문하지 말고, 아래 내용으로 ' + n + '장면 그림책 원고를 한 번에 완성해줘.'];
    if (planLines) parts.push('[이야기 씨앗]\n' + planLines);
    if (seed) parts.push(seed);
    if (flow.length) parts.push('[색 흐름]\n' + flow.join('\n'));
    parts.push('[작성 규칙]\n' + numbered(rules));
    parts.push('[출력 형식]\n' + FORMAT_ONESHOT);
    return parts.join('\n\n');
  }

  // ---------- 답변 분석 (마크다운·번호·굵은 글씨가 섞여도 읽을 수 있게 느슨하게) ----------
  const SCENE_HEAD = /^\s*(?:#{1,6}\s*)?(?:\*\*)?\[?\s*(?:장면|씬|Scene)\s*0*(\d{1,2})\s*\]?(?:\*\*)?\s*(?:[.:：)\-–—]+\s*(.*?))?\s*$/i;
  const LABELS = [
    ['title', '장면\\s*제목|제목'],
    ['cast', '등장인물'],
    ['content', '내용|본문|서술'],
    ['dialogue', '대화|대사'],
    ['conti', '그림\\s*콘티|콘티|구도']
  ];

  function stripMd(s) { return s.replace(/\*\*|__/g, '').replace(/^\s*(?:[-•·*]|\d+[.)])\s+/, ''); }

  function matchLabel(rawLine) {
    const s = stripMd(rawLine);
    for (let i = 0; i < LABELS.length; i++) {
      const m = new RegExp('^\\s*(?:' + LABELS[i][1] + ')[^:：\\n]{0,24}[:：]\\s*(.*)$').exec(s);
      if (m) return { key: LABELS[i][0], rest: m[1] };
    }
    return null;
  }

  function splitScenes(text) {
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const blocks = [];
    let cur = null;
    lines.forEach(function (ln) {
      const m = SCENE_HEAD.exec(ln);
      if (m) { cur = { no: parseInt(m[1], 10), hint: (m[2] || '').replace(/\*\*/g, '').trim(), lines: [] }; blocks.push(cur); }
      else if (cur) cur.lines.push(ln);
    });
    return blocks;
  }

  function parseScenes(text) {
    const blocks = splitScenes(text);
    if (!blocks.length) return null;
    const SPEAKER = /^[^\s:：]{1,12}\s*(?:\([^)]*\)|（[^）]*）)?\s*[:：]/;
    const scenes = blocks.map(function (b, bi) {
      const buf = { title: [], cast: [], content: [], dialogue: [], conti: [] };
      const isLast = bi === blocks.length - 1;
      let key = null, labeled = false, afterBlank = false;
      b.lines.forEach(function (ln) {
        const lab = matchLabel(ln);
        if (lab) { key = lab.key; labeled = true; afterBlank = false; if (lab.rest.trim()) buf[key].push(lab.rest.trim()); return; }
        const t = stripMd(ln).trim();
        if (!t) { afterBlank = true; return; }
        if (!key) return;
        // 마지막 장면 뒤에 붙는 맺음말("마음에 드셨으면 좋겠어요!" 등)은 빈 줄 뒤의 일반 문장이면 버립니다.
        if (isLast && afterBlank && buf[key].length && !((key === 'dialogue' || key === 'cast') && SPEAKER.test(t))) return;
        buf[key].push(t);
      });
      if (!labeled) {
        buf.content = b.lines.map(function (l) { return stripMd(l).trim(); }).filter(Boolean);
      }
      return {
        no: b.no,
        title: buf.title.join(' ') || b.hint,
        cast: buf.cast.join('\n'),
        content: buf.content.join(' '),
        dialogue: buf.dialogue.join('\n'),
        conti: buf.conti.join(' ')
      };
    });
    const filled = scenes.filter(function (s) { return s.title || s.cast || s.content || s.dialogue || s.conti; });
    if (!filled.length) return null;
    // 첫 장면 앞에 있는 "제목:", "주인공:" 줄(한 번에 완성 모드)
    const meta = { others: [] };
    let inOthers = false;
    String(text || '').replace(/\r/g, '').split('\n').some(function (ln) {
      if (SCENE_HEAD.test(ln)) return true;
      const s = stripMd(ln).trim();
      if (!s) return false;
      let m = /^제목\s*[:：]\s*(.+)$/.exec(s);
      if (m) { meta.title = m[1].replace(/^[『「“"'‘]+|[』」”"'’]+$/g, '').trim(); inOthers = false; return false; }
      m = /^주인공\s*[:：]\s*(.+)$/.exec(s);
      if (m) { meta.hero = m[1].trim(); inOthers = false; return false; }
      m = /^(?:다른\s*인물|주변\s*인물|그\s*외\s*인물|조연|등장인물\s*설정)\s*[:：]?\s*(.*)$/.exec(s);
      if (m) {
        inOthers = true;
        const first = /^([^\s:：]{1,10}(?:\s[^\s:：]{1,6})?)\s*[:：]\s*(.+)$/.exec(m[1]);
        if (first) meta.others.push({ name: first[1].trim(), desc: first[2].trim() });
        return false;
      }
      if (inOthers) {
        m = /^([^\s:：]{1,10}(?:\s[^\s:：]{1,6})?)\s*[:：]\s*(.+)$/.exec(s);
        if (m) meta.others.push({ name: m[1].trim(), desc: m[2].trim() });
        else inOthers = false;
      }
      return false;
    });
    return { scenes: filled, meta: meta };
  }

  const SEC_HEAD = /^\s*(?:#{1,6}\s*)?(?:\*\*)?\[?\s*(제목\s*후보|제목\s*제안|전체\s*이야기\s*요약|이야기\s*요약|요약)\s*\]?(?:\*\*)?\s*[:：]?\s*(.*?)\s*$/;

  function parseStory(text) {
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const titles = [], summary = [], scenes = [];
    let state = null, scene = null;
    lines.forEach(function (ln) {
      const sm = SCENE_HEAD.exec(ln);
      if (sm) { state = 'scene'; scene = []; scenes.push(scene); if (sm[2] && sm[2].trim()) scene.push(sm[2].trim()); return; }
      const hm = SEC_HEAD.exec(ln);
      if (hm) {
        state = /제목/.test(hm[1]) ? 'titles' : 'summary';
        if (hm[2]) (state === 'titles' ? titles : summary).push(hm[2]);
        return;
      }
      const t = stripMd(ln).trim();
      if (!t) return;
      if (state === 'titles') titles.push(t);
      else if (state === 'summary') summary.push(t);
      else if (state === 'scene' && scene) scene.push(t.replace(/^(?:내용|이야기)\s*[:：]\s*/, ''));
    });
    const cleanTitles = titles.map(function (t) {
      return t.replace(/^\s*(?:\d+[.)]|[-•*])\s*/, '').replace(/^[『「“"'‘]+|[』」”"'’]+$/g, '').trim();
    }).filter(Boolean);
    const sceneTexts = scenes.map(function (s) { return s.join(' ').trim(); }).filter(Boolean);
    if (!sceneTexts.length && !summary.length) return null;
    return { titles: cleanTitles, summary: summary.join(' '), scenes: sceneTexts };
  }

  // ---------- 04 캐릭터로 넘길 정보 (주인공 줄 + 장면에 나온 다른 인물) ----------
  const COLOR_WORDS = [
    ['핑크', ['핑크', '분홍']], ['레드', ['레드', '빨강', '빨간']], ['코랄', ['코랄']], ['오렌지', ['오렌지', '주황']], ['옐로우', ['옐로우', '노랑', '노란']],
    ['라임', ['라임']], ['그린', ['그린', '초록']], ['민트', ['민트']], ['터콰이즈', ['터콰이즈', '청록']], ['블루', ['블루', '파랑', '파란', '하늘색']],
    ['네이비', ['네이비', '남색']], ['퍼플', ['퍼플', '보라']], ['라벤더', ['라벤더']], ['마젠타', ['마젠타']], ['브라운', ['브라운', '갈색']], ['그레이', ['그레이', '회색']]
  ];
  const QUOTE = /[‘'“"「『]\s*([^’'”"」』]{1,12}?)\s*[’'”"」』]/;

  // "종류, 생김새, 옷, 대표색, 소품" 형태의 한 줄을 04 캐릭터 칸에 맞게 나눕니다.
  function parseHero(raw) {
    raw = String(raw || '').trim();
    if (!raw) return null;
    const parts = raw.split(/\s*[,，]\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
    let name = '';
    parts.some(function (p) { const m = QUOTE.exec(p); if (m) { name = m[1].trim(); return true; } return false; });
    const clean = function (s) { return String(s || '').replace(QUOTE, '').replace(/\s{2,}/g, ' ').trim(); };
    const structured = parts.length >= 4;
    const kind = structured ? parts[0] : '';
    const appearance = structured ? clean(parts[1]) : clean(raw);
    const outfit = structured ? [parts[2]].concat(parts.slice(4)).filter(Boolean).join(', ') : '';
    const colorText = structured ? parts[3] : raw;
    const look = kind + ' ' + appearance;
    let type = '';
    if (/로봇/.test(look)) type = '로봇';
    else if (/요정|마법|유니콘|도깨비|드래곤/.test(look)) type = '판타지 캐릭터';
    else if (/동물|토끼|강아지|고양이|곰|여우|새|사슴|다람쥐|호랑이|거북|펭귄|돼지|양|오리/.test(look)) type = '동물';
    else if (/여성|여자|소녀|엄마|할머니/.test(look)) type = '한국 여성';
    else if (/남성|남자|소년|아빠|할아버지/.test(look)) type = '한국 남성';
    const am = /(\d+\s*[~-]\s*\d+\s*세|\d+\s*세|성인|청소년|어린이|유아|노인|할머니|할아버지)/.exec(raw);
    let mainColor = '';
    COLOR_WORDS.some(function (c) { return c[1].some(function (w) { if (colorText.indexOf(w) >= 0) { mainColor = c[0]; return true; } return false; }); });
    return { raw: raw, name: name, type: type, age: am ? am[1].replace(/\s/g, '') : '', appearance: appearance, outfit: outfit, mainColor: mainColor };
  }

  // 03에서 답변을 채운 뒤 호출 → 04 캐릭터 단계로 넘길 정보를 프로젝트에 저장
  function saveCharacters(parsed) {
    const pr = ColorM.getProject();
    const hero = parseHero(parsed.meta && parsed.meta.hero) || {};
    const d = ColorM.deriveCharacters(parsed.scenes, hero.name);
    const main = hero.name || d.main;
    if (main || hero.raw) pr.heroDraft = Object.assign({}, hero, { name: main, fresh: true });
    // "다른 인물:" 아래에 ChatGPT가 적어준 외형 설명을 인물 이름에 맞춰 붙입니다.
    const others = (parsed.meta && parsed.meta.others) || [];
    const baseOf = function (n) { return String(n || '').trim().split(/\s+/).pop(); };
    others.forEach(function (o) {
      if (baseOf(o.name) === baseOf(main)) return;
      if (!d.extras.some(function (e) { return baseOf(e.name) === baseOf(o.name); })) {
        d.extras.push({ role: ColorM.guessCastRole ? ColorM.guessCastRole(baseOf(o.name)) : '친구', name: baseOf(o.name), desc: '' });
      }
    });
    d.extras.forEach(function (e) {
      const o = others.find(function (x) { return baseOf(x.name) === baseOf(e.name); });
      if (o && !e.desc) e.desc = o.desc;
    });
    const cast = Array.isArray(pr.cast) ? pr.cast : [];
    d.extras.forEach(function (e) {
      const ex = cast.find(function (c) { return baseOf(c.name) === baseOf(e.name); });
      if (!ex) cast.push(e);
      else if (!ex.desc && e.desc) ex.desc = e.desc;
    });
    pr.cast = cast.slice(0, 4);
    ColorM.storage.set(pr);
    return { main: main, extras: d.extras.map(function (e) { return e.name; }), hero: hero };
  }
  // ---------- 화면 ----------
  // opts: {anchor, kind:'storyboard'|'story', title, lead, getOpts(), apply(parsed)->message}
  // 02(줄거리 받기)와 03(책에 실릴 글 받기)이 헷갈리지 않게, 받는 것 · 채워지는 곳 · 버튼 이름을 따로 둡니다.
  const KIND_TEXT = {
    story: {
      tag: 'ChatGPT · 줄거리 받기',
      what: '이야기의 <b>설계도</b> — 제목 후보 · 전체 요약 · 장면마다 한두 줄 줄거리',
      where: '아래 <b>결과 칸</b> (제목 · 요약 · 장면별 줄거리)',
      note: '책에 그대로 들어갈 <b>문장과 대화</b>는 다음 단계 <b>03 스토리보드</b>의 「책에 실릴 글 받기」에서 받아요.',
      paste: '3. 받은 줄거리 붙여넣기', placeholder: 'ChatGPT가 준 줄거리 답변을 그대로 붙여넣어 주세요.', fill: '줄거리 채우기'
    },
    storyboard: {
      tag: 'ChatGPT · 책에 실릴 글 받기',
      what: '그림책의 <b>실제 원고</b> — 장면마다 제목 · 본문 글 · 대화 · 그림 구성',
      where: '아래 <b>장면 카드</b>',
      note: '02에서 정한 <b>줄거리</b>를 바탕으로 장면마다 책에 들어갈 문장을 써 줘요.',
      paste: '3. 받은 장면 글 붙여넣기', placeholder: 'ChatGPT가 준 장면별 답변([장면 1] …)을 그대로 붙여넣어 주세요.', fill: '장면 카드 채우기'
    }
  };
  function mount(opts) {
    const anchor = opts.anchor;
    if (!anchor || !anchor.parentNode) return;
    const T = KIND_TEXT[opts.kind] || KIND_TEXT.storyboard;
    const sec = document.createElement('section');
    sec.className = 'card bridge-card';
    sec.innerHTML =
      '<div class="step"><span>' + T.tag + '</span><h2>' + ColorM.escapeHTML(opts.title) + '</h2></div>' +
      '<p class="help">' + opts.lead + '</p>' +
      '<div class="bridge-what"><p><b>받는 것</b> ' + T.what + '</p><p><b>채워지는 곳</b> ' + T.where + '</p><p class="bridge-note">' + T.note + '</p></div>' +
      (opts.oneShot
        ? '<div class="mind-flow-presets" style="margin:0 0 14px">' +
            '<button type="button" class="mind-flow on" data-mode="chat"><b>대화형</b><small>ChatGPT·Gemini 등에 붙여넣고 정리해서 받기</small></button>' +
            '<button type="button" class="mind-flow" data-mode="oneshot"><b>한 번에 완성</b><small>질문 없이 짧은 요청 하나로 · 캔바 AI·Magic Write용</small></button>' +
          '</div>'
        : '') +
      '<ol class="bridge-steps">' +
        '<li><b>요청문 복사</b> — 지금까지 정한 내용이 담겨 있어요.</li>' +
        '<li><b>ChatGPT·Claude·제미나이</b> 등에 붙여넣고 답변을 받으세요.</li>' +
        '<li><b>받은 답변 전체</b>를 아래 칸에 붙여넣고 「' + T.fill + '」를 누르세요.</li>' +
      '</ol>' +
      '<div class="actions"><button type="button" class="btn soft" data-act="copy">1. 요청문 복사하기</button>' +
      '<button type="button" class="btn ghost" data-act="toggle">요청문 미리보기</button></div>' +
      '<p class="help" style="margin:12px 0 0">AI 도구 열기: ' +
        '<a href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a> · ' +
        '<a href="https://gemini.google.com/" target="_blank" rel="noopener">Gemini</a> · ' +
        '<a href="https://wrtn.ai/" target="_blank" rel="noopener">뤼튼</a> · ' +
        '<a href="https://www.canva.com/" target="_blank" rel="noopener">캔바</a></p>' +
      '<pre class="bridge-preview hidden"></pre>' +
      '<label>' + T.paste + '<textarea class="bridge-paste" rows="6" placeholder="' + T.placeholder + '"></textarea></label>' +
      '<div class="actions" style="margin-top:12px"><button type="button" class="btn primary" data-act="fill">' + T.fill + '</button></div>' +
      '<p class="help bridge-status" style="margin:10px 0 0"></p>';
    anchor.parentNode.insertBefore(sec, anchor);

    const pre = sec.querySelector('.bridge-preview');
    const paste = sec.querySelector('.bridge-paste');
    const status = sec.querySelector('.bridge-status');
    // 붙여넣은 답변은 단계를 옮겨도 칸에 남아 있게 저장합니다.
    const pasteKey = ColorM.BRIDGE_PREFIX + 'paste_' + opts.kind;
    try { paste.value = localStorage.getItem(pasteKey) || ''; } catch (e) {}
    paste.addEventListener('input', function () { try { localStorage.setItem(pasteKey, paste.value); } catch (e) {} });

    let mode = 'chat';
    const build = function () {
      const o = opts.getOpts();
      if (opts.kind === 'story') return requestStory(o);
      return mode === 'oneshot' ? requestOneShot(o) : requestStoryboard(o);
    };

    sec.addEventListener('click', function (e) {
      const mb = e.target.closest('[data-mode]');
      if (mb) {
        mode = mb.dataset.mode;
        [].slice.call(sec.querySelectorAll('[data-mode]')).forEach(function (b) { b.classList.toggle('on', b === mb); });
        if (!pre.classList.contains('hidden')) pre.textContent = build();
        status.textContent = mode === 'oneshot'
          ? '「한 번에 완성」 요청문으로 바꿨어요. 질문 없이 원고를 한 번에 받아요.'
          : '「대화형」 요청문으로 바꿨어요.';
        return;
      }
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'copy') {
        ColorM.copyText(build());
        status.textContent = '요청문을 복사했어요. ChatGPT 등에 붙여넣어 답변을 받아보세요.';
      } else if (act === 'toggle') {
        pre.textContent = build();
        pre.classList.toggle('hidden');
      } else if (act === 'fill') {
        const text = paste.value.trim();
        if (!text) { status.textContent = '받은 답변을 먼저 붙여넣어 주세요.'; return; }
        const parsed = opts.kind === 'story' ? parseStory(text) : parseScenes(text);
        if (!parsed) {
          status.textContent = '답변에서 「[장면 1]」 형식을 찾지 못했어요. ChatGPT에게 "요청문에 적은 [출력 형식] 그대로 다시 써줘"라고 한 번 더 요청해보세요.';
          return;
        }
        const msg = opts.apply(parsed);
        if (msg) status.textContent = msg;
      }
    });
  }

  return { mount: mount, parseScenes: parseScenes, parseStory: parseStory, requestStoryboard: requestStoryboard, requestStory: requestStory, requestOneShot: requestOneShot, parseHero: parseHero, saveCharacters: saveCharacters };
})();
