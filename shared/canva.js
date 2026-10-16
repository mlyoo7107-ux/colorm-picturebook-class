/* ===================================================================
   COLOR.M 마음색 그림책 메이커 — 캔바에 "전체를 한 번에" 넣는 스토리보드
   캔바는 장면을 하나씩 넣으면 장면마다 그림체·캐릭터가 달라지기 쉬워요.
   그래서 기획·캐릭터·색·표지·모든 장면(본문+대화)을 하나의 글로 묶어서,
   그림과 본문 글을 한 번에 만들어 달라고 요청하는 프롬프트를 만듭니다.
   =================================================================== */
const ColorMCanva = (function () {
  const esc = function (s) { return ColorM.escapeHTML(s); };
  const pad = function (n) { return String(n).padStart(2, '0'); };
  const has = function (s) { return !!(s && String(s).trim()); };
  // 사전 번역이 한국어를 반쯤만 바꾸면 문장이 깨져서, 완전히 번역된 경우만 영어로 쓰고 아니면 한국어 원문을 유지합니다.
  const tr = function (s) {
    if (typeof ColorMEN === 'undefined') return s;
    const t = ColorMEN.translate(s);
    return /[가-힣]/.test(t) ? s : t;
  };
  const fx = function (s) { return (typeof ColorMEN !== 'undefined') ? ColorMEN.fixed(s) : s; };
  const mindOn = function () { return typeof ColorMMind !== 'undefined' && ColorMMind.hasColor(); };

  // ---------- 프로젝트에서 필요한 값 모으기 ----------
  function collect() {
    const p = ColorM.getProject();
    const plan = p.plan || {}, story = p.story || {}, ch = p.character || {}, cover = p.cover || {};
    const scenes = (p.storyboard && p.storyboard.scenes) || [];
    const title = p.bookTitle || (cover.title && cover.title !== '제목 미정' ? cover.title : '') || (story.titles && story.titles[0]) || (p.projectName && p.projectName !== ColorM.DEFAULT_PROJECT_NAME ? p.projectName : '') || '제목 미정';
    return { p: p, plan: plan, story: story, ch: ch, cover: cover, scenes: scenes, title: title, n: scenes.length };
  }

  // 빠진 부분을 알려줘서 채우도록 안내합니다.
  function missing(D) {
    const out = [];
    if (!D.n) out.push('03 스토리보드에 장면이 없어요. 장면이 있어야 전체 스토리보드를 만들 수 있어요.');
    else {
      const noText = [], noDlg = [];
      D.scenes.forEach(function (s, i) {
        if (!has(s.content)) noText.push(pad(s.no || i + 1));
        if (!has(s.dialogue)) noDlg.push(pad(s.no || i + 1));
      });
      if (noText.length) out.push('본문 글이 비어 있는 장면: ' + noText.join(', ') + ' (03에서 채우면 좋아요. 비워 두면 캔바 AI가 장면 설명으로 문장을 만들어요)');
      if (noDlg.length && noDlg.length < D.n) out.push('대화가 비어 있는 장면: ' + noDlg.join(', ') + ' (대화 없는 장면이면 그대로 둬도 돼요)');
    }
    if (!(D.ch.fixedInfo || D.ch.name)) out.push('04 캐릭터를 아직 만들지 않았어요. 캐릭터 정보가 있어야 모든 페이지에서 같은 모습을 유지해요.');
    if (!(D.cover.coverDesc || D.cover.sceneDesc)) out.push('06 표지를 아직 만들지 않았어요. (표지 설명 없이도 만들 수 있지만, 만들어 두면 표지가 더 정확해져요)');
    return out;
  }

  // ---------- 한국어 ----------
  function buildKR(D) {
    const n = D.n, plan = D.plan, ch = D.ch, L = [];
    const art = ch.artStyle || '부드러운 파스텔 톤의 수채화 그림책 스타일';
    L.push('[캔바 AI용 · 그림책 전체를 한 번에 만들기]');
    L.push('');
    L.push('아래 정보를 바탕으로 『' + D.title + '』 그림책을 처음부터 끝까지 한 번에 만들어줘.');
    L.push('구성: 표지 1장 + 본문 ' + n + '장면 + 뒷표지 1장 (총 ' + (n + 2) + '페이지)');
    L.push('각 페이지마다 "그림"과 "본문 글"을 한 세트로 함께 만들어줘.');
    L.push('');
    L.push('[꼭 지켜줘]');
    L.push('1. 모든 페이지에서 같은 캐릭터(얼굴·헤어·옷·소품·대표 색)와 같은 화풍·색감을 유지해줘. 페이지마다 달라지면 안 돼.');
    L.push('2. 각 장면의 "본문 글"과 "대화"는 아래 내용을 그대로 사용해줘. 문장을 바꾸거나 빼거나 새로 지어내지 말아줘.');
    L.push('3. 대화는 말풍선이나 따옴표(" ")로 본문 글과 함께 자연스럽게 넣어줘.');
    L.push('4. 그림은 본문과 대화의 내용·감정에 맞게 그리고, 글자가 들어갈 자리는 그림과 겹치지 않게 읽기 쉽게 비워줘.');
    L.push('5. 페이지 순서는 표지 → 장면 ' + pad(1) + '~' + pad(n) + ' → 뒷표지로 지켜줘.');
    L.push('6. 참고 이미지(기준 캐릭터)를 함께 첨부했다면, 그 캐릭터를 모든 페이지의 기준으로 삼아줘.');
    L.push('');
    L.push('[그림책 정보]');
    L.push('제목: ' + D.title + (D.cover.subtitle ? ' / 부제: ' + D.cover.subtitle : ''));
    [['대상 독자', plan.audience], ['장르', plan.genre], ['분위기', plan.mood], ['주제', plan.topic], ['전하고 싶은 메시지', plan.message], ['배경 장소', plan.place], ['시간', plan.time]].forEach(function (r) { if (has(r[1])) L.push(r[0] + ': ' + r[1]); });
    if (has(D.story.summary)) L.push('줄거리: ' + D.story.summary.trim());
    L.push('');
    L.push('[화풍과 색]');
    L.push('화풍: ' + art + ' (모든 페이지 동일)');
    const pal = mindOn() ? ColorMMind.paletteLine('kr') : '';
    if (pal) L.push('색상 팔레트: ' + pal);
    if (mindOn()) {
      const fl = ColorMMind.flowLines(n);
      if (fl.length) { L.push('이야기 색 흐름 (장면 번호별로 색감이 달라져요):'); fl.forEach(function (x) { L.push('- ' + x); }); }
      else { const m = ColorMMind.get(); L.push("마음색 '" + m.colorName + "'(" + m.color + ')을 바탕으로 장면의 감정에 어울리는 색감'); }
    }
    L.push('');
    L.push('[주인공 캐릭터 — 모든 페이지에서 동일하게]');
    // 화풍·팔레트는 위 [화풍과 색]에 한 번만 적어요 (캐릭터 정보에 따로 저장된 예전 값은 뺍니다)
    const fixed = has(ch.fixedInfo) ? ch.fixedInfo.split('\n').filter(function (ln) { return !/^(색상 팔레트|화풍)\s*:/.test(ln.trim()); }).join('\n').trim() : '';
    L.push(fixed || (has(ch.name) ? ('이름: ' + ch.name) : '(04에서 캐릭터를 만들면 여기에 들어가요)'));
    const cast = ColorM.castBlock('kr');
    if (cast) { L.push(''); L.push('[함께 나오는 인물 — 해당 장면에만 등장]'); L.push(cast); }
    L.push('');
    L.push('[표지]');
    L.push('제목: ' + D.title + (D.cover.subtitle ? ' / 부제: ' + D.cover.subtitle : ''));
    L.push('표지 장면: ' + (D.cover.sceneDesc || '주인공과 이야기의 분위기가 드러나는 대표 장면'));
    L.push('');
    D.scenes.forEach(function (s, i) {
      L.push('[장면 ' + pad(s.no || i + 1) + (has(s.title) ? ' · ' + s.title.trim() : '') + ']');
      if (has(s.cast)) L.push('- 등장인물·표정: ' + s.cast.trim().replace(/\n/g, ' / '));
      if (has(s.memo)) L.push('- 장면 설명(그림에 그릴 일): ' + s.memo.trim());
      L.push('- 본문 글: ' + (has(s.content) ? s.content.trim() : (has(s.memo) ? '(비어 있음 — 위 장면 설명을 바탕으로 어린이가 읽기 쉬운 1~2문장으로 써줘)' : '(본문이 없는 장면 — 그림만 만들어줘)')));
      if (has(s.dialogue)) L.push('- 대화: ' + s.dialogue.trim().replace(/\n/g, ' / '));
      if (has(s.conti)) L.push('- 그림 구성: ' + s.conti.trim());
      L.push('');
    });
    L.push('[뒷표지]');
    L.push('이야기 속 작은 소품이나 주인공의 뒷모습 하나만 작게 두고, 나머지는 글자를 넣을 수 있게 넓은 여백으로 남겨줘. 앞표지와 같은 화풍·색감.');
    L.push('');
    L.push('[출력 방식]');
    L.push('표지부터 뒷표지까지 페이지 순서대로, 페이지마다 이미지와 본문 글이 함께 들어가게 만들어줘.');
    return L.join('\n');
  }

  // ---------- English (본문·대화는 한국어 원문 그대로 유지) ----------
  function buildEN(D) {
    const n = D.n, plan = D.plan, ch = D.ch, L = [];
    const art = ch.artStyle || '부드러운 파스텔 톤의 수채화 그림책 스타일';
    L.push('[Canva AI · Create the whole picture book at once]');
    L.push('');
    L.push('Using the information below, create the picture book "' + D.title + '" from start to finish in one go.');
    L.push('Structure: 1 cover + ' + n + ' story scenes + 1 back cover (' + (n + 2) + ' pages in total).');
    L.push('For every page, create the illustration and the page text together as one set.');
    L.push('');
    L.push('[Rules]');
    L.push('1. Keep the same character (face, hair, outfit, props, main colors) and the same art style and color mood on every page. Nothing may change between pages.');
    L.push('2. Use each scene\'s "Body text" and "Dialogue" below EXACTLY as written (they are in Korean). Do not rewrite, remove, translate or invent sentences.');
    L.push('3. Put dialogue naturally with the body text, as speech bubbles or in quotation marks.');
    L.push('4. Draw each illustration to match the mood of the body text and dialogue, and leave clear, readable space for the text without overlapping the artwork.');
    L.push('5. Keep the page order: cover → scenes ' + pad(1) + '–' + pad(n) + ' → back cover.');
    L.push('6. If a reference image of the main character is attached, use it as the reference for every page.');
    L.push('');
    L.push('[Book info]');
    L.push('Title: ' + D.title + (D.cover.subtitle ? ' / Subtitle: ' + D.cover.subtitle : '') + ' (keep the title in Korean)');
    [['Audience', plan.audience], ['Genre', plan.genre], ['Mood', plan.mood], ['Theme', plan.topic], ['Message', plan.message], ['Setting', plan.place], ['Time', plan.time]].forEach(function (r) { if (has(r[1])) L.push(r[0] + ': ' + tr(r[1])); });
    L.push('');
    L.push('[Art style & color]');
    L.push('Art style: ' + fx(art) + ' (identical on all pages)');
    const pal = mindOn() ? ColorMMind.paletteLine('en') : '';
    if (pal) L.push('Color palette: ' + pal);
    if (mindOn()) {
      const fl = ColorMMind.flowLinesEN(n);
      if (fl.length) {
        L.push('Color flow across the story (the color mood changes by scene number):');
        fl.forEach(function (x) { L.push('- ' + x); });
      } else { const m = ColorMMind.get(); L.push("A palette based on the heart color '" + ColorMMind.colorNameEN() + "' (" + m.color + ') that suits each scene\'s emotion'); }
    }
    L.push('');
    L.push('[Main character — identical on every page]');
    const cl = [];
    if (has(ch.name)) cl.push('Name: ' + ch.name);
    if (has(ch.age)) cl.push('Age: ' + tr(ch.age));
    if (has(ch.type)) cl.push('Type: ' + fx(ch.type));
    if (has(ch.appearance)) cl.push('Appearance: ' + tr(ch.appearance));
    if (has(ch.outfit)) cl.push('Outfit & props: ' + tr(ch.outfit));
    if (has(ch.mainColor)) cl.push('Main color: ' + tr(ch.mainColor));
    if (has(ch.personality)) cl.push('Personality: ' + tr(ch.personality));
    L.push(cl.length ? cl.join('\n') : '(Create the character in step 04 and it will appear here)');
    const cast = ColorM.castBlock('en');
    if (cast) { L.push(''); L.push('[Other characters — appear only in their own scenes]'); L.push(cast); }
    L.push('');
    L.push('[Cover]');
    L.push('Title: ' + D.title + (D.cover.subtitle ? ' / Subtitle: ' + D.cover.subtitle : ''));
    L.push('Cover scene: ' + tr(D.cover.sceneDesc || 'a representative scene showing the main character and the mood of the story'));
    L.push('');
    D.scenes.forEach(function (s, i) {
      L.push('[Scene ' + pad(s.no || i + 1) + (has(s.title) ? ' · ' + s.title.trim() : '') + ']');
      if (has(s.cast)) L.push('- Characters & expressions: ' + tr(s.cast.trim().replace(/\n/g, ' / ')));
      if (has(s.memo)) L.push('- Scene description (what to draw): ' + tr(s.memo.trim()));
      L.push('- Body text (use exactly as written, in Korean): ' + (has(s.content) ? s.content.trim() : (has(s.memo) ? '(empty — write 1–2 easy-to-read Korean sentences based on the scene description above)' : '(no text — illustration only)')));
      if (has(s.dialogue)) L.push('- Dialogue (use exactly as written, in Korean): ' + s.dialogue.trim().replace(/\n/g, ' / '));
      if (has(s.conti)) L.push('- Composition: ' + tr(s.conti.trim()));
      L.push('');
    });
    L.push('[Back cover]');
    L.push('Only one small story prop or the main character seen from behind, placed small; leave wide empty space for text. Same art style and colors as the front cover.');
    L.push('');
    L.push('[Output]');
    L.push('Create all pages in order from the cover to the back cover, each page with its illustration and text together.');
    return L.join('\n');
  }

  // ---------- 화면 ----------
  function mount(anchor) {
    if (!anchor || !anchor.parentNode) return;
    const sec = document.createElement('section');
    sec.className = 'card canva-card';
    sec.innerHTML =
      '<div class="step"><span>캔바를 쓴다면</span><h2>캔바에 전체를 한 번에 넣기</h2></div>' +
      '<p class="help">캔바는 장면을 하나씩 넣으면 장면마다 그림체와 캐릭터가 달라지기 쉬워요. 아래 <b>전체 스토리보드</b>(본문·대화 포함)를 한 번에 넣으면 그림과 본문 글이 함께 만들어져요.</p>' +
      '<ol class="canva-steps"><li>04에서 만든 <b>캐릭터 그림·캐릭터 시트</b>를 캔바에 준비해요</li><li>아래 <b>전체 복사</b>를 눌러요</li><li>캔바 AI에 <b>붙여넣어 한 번에</b> 만들어요</li></ol>' +
      '<div class="canva-warn" data-role="warn" hidden></div>' +
      '<div class="actions"><button type="button" class="btn primary" data-act="kr">전체 복사</button>' +

      '<button type="button" class="btn soft" data-act="txt">TXT 저장</button>' +
      '<button type="button" class="btn ghost" data-act="refresh">다시 만들기</button></div>' +
      '<details class="canva-det"><summary>만들어진 프롬프트 미리 보기</summary>' +
      '<span class="lang-tag lang-kr">🇰🇷 한국어 (본문·대화 포함)</span><div class="box canva-box" data-role="kr"></div>' +
      '<span class="lang-tag lang-en">🇺🇸 English (본문·대화는 한국어 원문 유지)</span><div class="box canva-box" data-role="en"></div></details>';
    anchor.parentNode.insertBefore(sec, anchor);
    const q = function (r) { return sec.querySelector('[data-role="' + r + '"]'); };

    function refresh() {
      const D = collect(), warn = missing(D);
      q('warn').hidden = !warn.length;
      q('warn').innerHTML = warn.length ? '<b>채우면 더 좋아요</b><ul>' + warn.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '';
      q('kr').textContent = D.n ? buildKR(D) : '(03 스토리보드에서 장면을 만들면 여기에 전체 스토리보드가 만들어져요)';
      q('en').textContent = D.n ? buildEN(D) : '(Create scenes in step 03 first)';
      return D;
    }
    refresh();
    sec.addEventListener('click', function (e) {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const D = refresh();
      if (b.dataset.act === 'refresh') { ColorM.toast('최신 내용으로 다시 만들었어요.'); return; }
      if (!D.n) { ColorM.toast('먼저 03 스토리보드에서 장면을 만들어주세요.'); return; }
      if (b.dataset.act === 'kr') ColorM.copyText(buildKR(D));
      else if (b.dataset.act === 'en') ColorM.copyText(buildEN(D));
      else if (b.dataset.act === 'txt') {
        ColorM.downloadTXT('COLOR.M_' + D.p.projectName + '_캔바_전체스토리보드.txt',
          ['COLOR.M 마음색 그림책 — 캔바용 전체 스토리보드', '================================', '', buildKR(D)].join('\n'));
      }
    });
  }

  return { mount: mount, buildKR: function () { return buildKR(collect()); }, buildEN: function () { return buildEN(collect()); } };
})();
