/* ===================================================================
   COLOR.M 마음색 그림책 메이커 — 「추천 한 번에 적용」
   "무엇을 골라야 할지 모르겠다면?" 박스. 앞 단계에서 정한 내용을 근거로 규칙에 따라
   현재 단계의 항목을 한 번에 채워줍니다. (외부 AI 호출 없이 브라우저에서 바로 동작)
   채워진 뒤에는 모든 항목을 그대로 직접 고칠 수 있습니다.
   =================================================================== */
const ColorMRecommend = (function () {
  const $ = function (id) { return document.getElementById(id); };
  const esc = function (s) { return ColorM.escapeHTML(s); };
  const val = function (id) { const el = $(id); return el ? String(el.value == null ? '' : el.value).trim() : ''; };
  const project = function () { return ColorM.getProject(); };
  const lastWord = function (s) { return ColorM.heroName({ hero: s }); };

  function setVal(id, v) {
    const el = $(id);
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 이미 직접 쓴 글이 있으면 덮어쓰기 전에 한 번 물어봅니다 (선택 목록 값은 묻지 않음).
  function fillAll(map, msg) {
    // 이전 단계(기획)에서 자동으로 불러온 값은 "직접 쓴 내용"으로 보지 않습니다.
    const plan = project().plan || {};
    const auto = Object.keys(plan).map(function (k) { return String(plan[k] == null ? '' : plan[k]).trim(); });
    auto.push(lastWord(plan.hero));
    const clash = Object.keys(map).some(function (id) {
      const el = $(id);
      if (!el || el.tagName === 'SELECT') return false;
      const cur = String(el.value || '').trim();
      return cur && cur !== map[id] && auto.indexOf(cur) < 0;
    });
    if (clash && !confirm('이미 입력한 내용이 있어요. 추천 내용으로 바꿀까요?\n(바꾼 뒤에도 마음에 안 드는 부분은 직접 고칠 수 있어요.)')) return false;
    Object.keys(map).forEach(function (id) { setVal(id, map[id]); });
    ColorM.toast(msg || '추천 내용을 채웠어요. 마음에 안 드는 부분은 바꿔주세요.');
    return true;
  }

  // ---------- 01 기획: 주제 → 이야기 씨앗 ----------
  // hero/place/time은 아이용(child)과 성인용(adult) 두 가지를 둡니다. adult의 hero는 "○○ 한 사람" 앞부분만 적습니다.
  const SEEDS = [
    { id: 'rest', keys: ['여유', '휴식', '쉼', '쉬어', '힐링', '느긋', '천천히', '평온', '고요'],
      goal: '마음 편히 쉴 곳을 찾고 싶다', problem: '쉬는 법을 잊은 채 바쁘게만 지내왔다', message: '쉬어가도 괜찮다, 천천히 가도 길은 이어진다', special: '특별한 설정 없음',
      child: { hero: '느긋하게 쉬고 싶은 아기 곰', place: '햇살 좋은 숲속', time: '느긋한 오후' }, adult: { hero: '쉼 없이 달려온', place: '조용한 동네 카페', time: '비 갠 오후' } },
    { id: 'comfort', keys: ['위로', '외로', '우울', '슬픔', '눈물', '상실', '이별', '그리움'],
      goal: '따뜻한 위로를 받고 싶다', problem: '혼자라고 느껴져 마음이 쓸쓸하다', message: '내 마음은 이미 충분히 소중하다', special: '특별한 설정 없음',
      child: { hero: '위로가 필요한 작은 토끼', place: '포근한 방 안', time: '고요한 한밤중' }, adult: { hero: '마음이 지친', place: '불 켜진 작은 방', time: '고요한 한밤중' } },
    { id: 'start', keys: ['시작', '출발', '변화', '새로운', '전환'],
      goal: '새로운 시작을 해보고 싶다', problem: '익숙한 곳을 떠나는 일이 두렵다', message: '새로운 시작은 작은 한 걸음에서 온다', special: '특별한 설정 없음',
      child: { hero: '새로운 날을 기다리는 아이', place: '마을 어귀 언덕', time: '이른 아침' }, adult: { hero: '새 출발을 앞둔', place: '이른 아침의 정거장', time: '이른 아침' } },
    { id: 'forgive', keys: ['용서', '화해', '사랑', '상처'],
      goal: '소중한 사람과 화해하고 싶다', problem: '친구와 다투어 마음이 멀어졌다', message: '용서와 이해는 마음에도 세상에도 다시 색을 되찾아 준다', special: '마음의 색이 눈에 보이는 세계',
      child: { hero: '상처받은 친구의 마음을 이해하려는 호기심 많은 토끼', place: '숲속', time: '어느 날' }, adult: { hero: '오래된 상처를 안고 있는', place: '오래된 골목길', time: '해 질 녘' } },
    { id: 'friend', keys: ['우정', '친구', '관계', '이웃'],
      goal: '진짜 친구를 사귀고 싶다', problem: '새로운 곳에서 아무도 말을 걸어주지 않는다', message: '진짜 친구는 서로를 이해해 준다', special: '특별한 설정 없음',
      child: { hero: '수줍지만 마음이 따뜻한 강아지', place: '마을 광장', time: '따뜻한 봄날' }, adult: { hero: '새로운 관계가 두려운', place: '동네 작은 카페', time: '따뜻한 봄날' } },
    { id: 'courage', keys: ['용기', '두려움', '도전', '모험', '불안', '걱정'],
      goal: '두려움을 이겨내고 싶다', problem: '해보고 싶지만 한 걸음이 떨어지지 않는다', message: '용기를 내면 한 걸음 나아갈 수 있다', special: '특별한 설정 없음',
      child: { hero: '겁이 많지만 호기심 가득한 아기 곰', place: '산 위 언덕', time: '해 질 녘' }, adult: { hero: '한 걸음을 망설이는', place: '이른 아침의 산책길', time: '해 질 녘' } },
    { id: 'family', keys: ['가족', '엄마', '아빠', '부모', '육아', '할머니', '할아버지', '자녀'],
      goal: '소중한 사람에게 마음을 전하고 싶다', problem: '바빠서 함께할 시간이 없어 서운한 마음이 쌓였다', message: '사랑은 나눌수록 커진다', special: '특별한 설정 없음',
      child: { hero: '엄마를 기다리는 작은 고양이', place: '우리 집', time: '고요한 한밤중' }, adult: { hero: '가족을 오래 그리워한', place: '어릴 적 살던 집', time: '고요한 한밤중' } },
    { id: 'self', keys: ['자존감', '자신감', '나다움', '자신', '나만', '정체성', '나를'],
      goal: '나만의 색(재능)을 찾고 싶다', problem: '다른 사람들은 저마다 반짝이는데 나만 다르다고 느낀다', message: '나는 있는 그대로 소중하다', special: '마음의 색이 눈에 보이는 세계',
      child: { hero: '자신만의 색이 없다고 느끼는 아이', place: '색을 가진 친구들이 사는 마을', time: '어느 날' }, adult: { hero: '자신을 믿지 못하던', place: '작은 책방', time: '어느 날' } },
    { id: 'emotion', keys: ['감정', '표현'],
      goal: '내 마음을 솔직하게 말해보고 싶다', problem: '화나고 속상한데 어떤 말로 표현해야 할지 모르겠다', message: '마음을 표현하면 마음이 가벼워진다', special: '마음의 색이 눈에 보이는 세계',
      child: { hero: '마음을 말로 표현하지 못하는 아이', place: '우리 집', time: '비 오는 날' }, adult: { hero: '마음을 말로 꺼내지 못하던', place: '창가가 있는 작은 방', time: '비 오는 날' } },
    { id: 'env', keys: ['환경', '자연', '지구', '생태'],
      goal: '사라져 가는 자연을 되살리고 싶다', problem: '오염과 쓰레기로 자연의 색이 사라지고 있다', message: '작은 실천이 세상을 바꾼다', special: '특별한 설정 없음',
      child: { hero: '숲을 지키고 싶은 어린 여우', place: '숲속', time: '따뜻한 봄날' }, adult: { hero: '자연이 그리워진', place: '도시 끝의 작은 숲길', time: '따뜻한 봄날' } },
    { id: 'share', keys: ['나눔', '배려', '양보', '봉사'],
      goal: '가진 것을 함께 나누고 싶다', problem: '내 것을 나누면 모자랄까 봐 망설여진다', message: '나눌수록 마음은 더 따뜻해진다', special: '특별한 설정 없음',
      child: { hero: '나누는 기쁨을 배우는 다람쥐', place: '숲속', time: '눈 내리는 겨울날' }, adult: { hero: '나누는 기쁨을 배우는', place: '동네 시장', time: '눈 내리는 겨울날' } },
    { id: 'diff', keys: ['다름', '차이', '존중', '포용'],
      goal: '있는 그대로 어울리고 싶다', problem: '다르다는 이유로 끼지 못한다', message: '다름은 아름다움이다', special: '특별한 설정 없음',
      child: { hero: '다른 친구들과 생김새가 다른 작은 오리', place: '마을 광장', time: '어느 날' }, adult: { hero: '다름 때문에 위축되었던', place: '낯선 도시의 거리', time: '어느 날' } },
    { id: 'dream', keys: ['꿈', '희망', '미래', '목표'],
      goal: '마음속 꿈을 이루고 싶다', problem: '다들 불가능한 꿈이라며 웃는다', message: '꿈을 향한 한 걸음이 길이 된다', special: '특별한 설정 없음',
      child: { hero: '별을 좋아하는 꿈 많은 소녀', place: '산 위 언덕', time: '고요한 한밤중' }, adult: { hero: '접어둔 꿈을 꺼내보는', place: '옥상에서 본 밤하늘', time: '고요한 한밤중' } }
  ];
  const GENRE_SEED = { '성장 이야기': 'courage', '환경 이야기': 'env', '모험': 'courage', '판타지': 'self', '감성 이야기': 'comfort', '창작동화': 'friend' };

  const isChildAudience = function (a) { return /유아|초등|어린이|아동/.test(String(a || '')); };
  function adultHero(prefix, audience) {
    const a = String(audience || '');
    const who = /여성|여자|엄마|언니|아내/.test(a) ? '여성' : /남성|남자|아빠|형|남편/.test(a) ? '남성' : '사람';
    return prefix + ' 한 ' + who;
  }

  // 주제 → 이야기 틀. 맞는 틀이 없으면 장르로 엉뚱하게 고르지 않고, 입력한 주제 문장으로 기본 틀을 만듭니다.
  function pickSeed(topic, genre, audience) {
    const t = String(topic || '').trim();
    const child = isChildAudience(audience);
    const resolve = function (s) {
      const v = child ? s.child : s.adult;
      return { id: s.id, matched: true, hero: child ? v.hero : adultHero(v.hero, audience), goal: s.goal, problem: s.problem, message: s.message, place: v.place, time: v.time, special: s.special };
    };
    if (t) {
      const hit = SEEDS.find(function (s) { return s.keys.some(function (k) { return t.indexOf(k) >= 0; }); });
      if (hit) return resolve(hit);
      const j = function (pair) { return ColorM.josa(t, pair); };
      return {
        id: 'generic', matched: false,
        hero: child ? '호기심 많은 작은 토끼' : adultHero('평범한 하루를 보내는', audience),
        goal: t + j(['을', '를']) + ' 마음에 품고 싶다',
        problem: t + j(['이', '가']) + ' 자꾸 멀게만 느껴진다',
        message: t + j(['은', '는']) + ' 이미 내 안에 있다',
        place: child ? '숲속' : '조용한 동네', time: '어느 날', special: '특별한 설정 없음'
      };
    }
    const id = GENRE_SEED[genre] || 'comfort';
    return resolve(SEEDS.find(function (s) { return s.id === id; }));
  }
  // ---------- 공통 분위기 → 색/성격 매핑 ----------
  function moodKey(mood) {
    const m = String(mood || '');
    if (/신비|환상/.test(m)) return 'mystic';
    if (/유쾌|재미/.test(m)) return 'fun';
    if (/밝|경쾌/.test(m)) return 'bright';
    if (/잔잔|감성/.test(m)) return 'calm';
    return 'warm';
  }
  const COLOR_BY_MOOD = { warm: '따뜻한 레드와 오렌지 톤', bright: '부드러운 노랑과 크림 톤', mystic: '깊은 남색과 별빛 톤', fun: '맑은 하늘색과 민트 톤', calm: '파스텔 라벤더와 핑크 톤' };
  const BG_BY_MOOD = { warm: '햇살이 비치는 초록 들판', bright: '색색의 꽃이 핀 마을 풍경', mystic: '몽환적인 구름과 빛무리', fun: '색색의 꽃이 핀 마을 풍경', calm: '잔잔한 바닷가 노을' };
  const STYLE_BY_MOOD = { warm: '단색 배경', bright: '작은 패턴 배경', mystic: '은은한 그라데이션', fun: '작은 패턴 배경', calm: '단색 배경' };

  function lightFor(time, mood) {
    const t = String(time || '');
    if (/한밤|밤|달/.test(t)) return '은은한 달빛';
    if (/해 질|노을|저녁/.test(t)) return '따뜻한 노을빛';
    if (/아침|한낮|낮|여름/.test(t)) return '맑고 화사한 낮빛';
    if (moodKey(mood) === 'mystic') return '신비로운 역광';
    return '부드러운 자연광';
  }

  // ---------- 04 캐릭터 ----------
  function charType(hero) {
    const h = String(hero || '');
    if (/로봇/.test(h)) return '로봇';
    if (/요정|마법|용|유니콘|도깨비/.test(h)) return '판타지 캐릭터';
    if (/소녀|여자|언니|엄마|할머니/.test(h)) return '한국 여성';
    if (/소년|남자|형|아빠|할아버지/.test(h)) return '한국 남성';
    if (/토끼|강아지|고양이|곰|여우|새|사슴|다람쥐|호랑이|거북|펭귄|돼지|양|오리|동물/.test(h)) return '동물';
    if (/아이|어린이/.test(h)) return '한국 여성';
    return '동물';
  }
  const AGE_BY_AUDIENCE = { '유아 5~7세': '3~5세 정도의 유아', '초등 저학년': '6~8세 정도의 어린이', '초등 고학년': '9~12세 정도의 어린이', '청소년': '10대 청소년', '전체 연령': '6~8세 정도의 어린이' };
  const APPEARANCE_BY_TYPE = { '동물': '크고 쫑긋한 귀와 복슬복슬한 털', '한국 여성': '동그란 얼굴에 커다란 눈', '한국 남성': '짧은 단발머리에 반짝이는 눈', '판타지 캐릭터': '작고 둥글둥글한 몸', '로봇': '작고 둥글둥글한 몸' };
  const PERSONALITY_BY_MOOD = { warm: '다정하고 씩씩한 성격', bright: '장난기 많고 유쾌한 성격', fun: '장난기 많고 유쾌한 성격', mystic: '호기심 많고 모험을 좋아하는 성격', calm: '수줍지만 마음이 따뜻한 성격' };
  const EMOTION_BY_MOOD = { warm: '늘 웃음을 머금은 따뜻한 표정', bright: '호기심 가득 반짝이는 눈빛', fun: '호기심 가득 반짝이는 눈빛', mystic: '호기심 가득 반짝이는 눈빛', calm: '수줍게 볼이 붉어지는 표정' };
  const HABIT_BY_MOOD = { warm: '속상해하는 친구 곁에서 손을 꼭 잡아주는 버릇', bright: '기쁠 때 제자리에서 폴짝 뛰는 버릇', fun: '기쁠 때 제자리에서 폴짝 뛰는 버릇', mystic: '생각할 때 고개를 갸웃하는 버릇', calm: '무엇이든 일기에 적는 버릇' };
  const CHAR_MOOD_BY_MOOD = { warm: '포근하고 다정한 감성 분위기', bright: '밝고 경쾌한 모험 분위기', fun: '밝고 경쾌한 모험 분위기', mystic: '신비롭고 환상적인 분위기', calm: '잔잔하고 평화로운 분위기' };

  function outfitFor(genre, type) {
    const g = String(genre || '');
    if (/모험|판타지/.test(g)) return '작은 망토와 모험 가방';
    if (/환경|성장/.test(g)) return '노란 우비와 빨간 장화';
    if (/감성/.test(g)) return '따뜻한 털모자와 목도리';
    return type === '한국 남성' ? '체크무늬 셔츠와 멜빵바지' : '빨간 리본과 주황색 원피스';
  }
  function artStyleFor(audience, genre) {
    if (/청소년/.test(audience)) return '선명한 색감의 디지털 일러스트 스타일';
    if (/판타지|감성/.test(genre)) return '따뜻한 선과 포근한 색감의 동화책 일러스트 스타일';
    return '부드러운 파스텔 톤의 수채화 그림책 스타일';
  }

  // ---------- 03 스토리보드 ----------
  const STAGES = ['이야기의 시작', '평범한 하루', '작은 변화', '문제가 드러나다', '결심의 순간', '첫 번째 시도', '새로운 만남', '커지는 어려움', '작은 실마리', '선택의 순간', '문제가 풀리다', '따뜻한 마무리'];
  function stageIndex(i, n) { return n <= 1 ? STAGES.length - 1 : Math.round(i * (STAGES.length - 1) / (n - 1)); }
  function expressionAt(i, n) {
    if (i === n - 1) return '환하게 웃는 표정, 두 팔을 벌린 포즈';
    if (i === 0) return '호기심 어린 눈, 두리번거리는 포즈';
    const t = i / (n - 1);
    if (t < 0.35) return '호기심 어린 눈, 한 걸음 내딛는 포즈';
    if (t < 0.6) return '걱정스러운 표정, 고개를 갸웃하는 포즈';
    if (t < 0.8) return '놀란 표정, 손을 내미는 포즈';
    return '안도하는 미소, 손을 꼭 잡는 포즈';
  }
  function compositionAt(i, n) {
    if (i === 0) return '와이드 샷으로 장소 전체를 보여주는 구도';
    if (i === n - 1) return '풀 샷으로 인물과 배경을 함께 담는 구도';
    const t = i / (n - 1);
    if (t >= 0.6 && t < 0.85) return '클로즈업으로 표정을 크게 담는 구도';
    return '미디엄 샷으로 인물의 행동을 담는 구도';
  }

  // 마음색을 골랐다면 색감 문구를 마음색(+색 흐름) 기준으로 만듭니다.
  function mindSceneTone() {
    if (typeof ColorMMind === 'undefined' || !ColorMMind.hasColor()) return '';
    const n = ColorMMind.sceneCountNow();
    return ColorMMind.toneForScene(Math.min(ColorMMind.selectedSceneNow(), n - 1), n);
  }
  function mindCoverTone() {
    if (typeof ColorMMind === 'undefined' || !ColorMMind.hasColor()) return '';
    return ColorMMind.coverTone(ColorMMind.get());
  }

  // ---------- 06 표지: 제목 추천 ----------
  function titleSuggestions(pr) {
    pr = pr || project();
    const plan = pr.plan || {}, story = pr.story || {}, ch = pr.character || {}, mind = pr.mind || {};
    const out = [];
    const add = function (label, text) {
      text = String(text || '').trim().replace(/\s+/g, ' ');
      if (text.length < 3 || text.length > 26) return;
      if (out.some(function (o) { return o.text === text; })) return;
      out.push({ label: label, text: text });
    };
    (story.titles || []).slice(0, 2).forEach(function (t) { add('스토리에서 만든 제목', t); });
    const topic = String(plan.topic || '').trim();
    if (topic && topic.length <= 14) add('주제에서', topic);
    const name = String(ch.name || '').trim();
    if (name) add('캐릭터에서', name + '의 마음 여행');
    const need = (mind.needs && mind.needs[0]) || String(mind.needCustom || '').trim();
    if (need) add('필요한 것에서', need + ' 한 조각');
    const color = mind.colorName || '';
    if (color) { add('마음색에서', '마음에 번지는 ' + color); add('마음색에서', color + '빛 마음'); }
    const msg = String(plan.message || '').split(/[,，.]/)[0].trim();
    if (msg && msg.length <= 16) add('전하고 싶은 말에서', msg);
    const place = String(plan.place || '').split(/[,，]/)[0].trim();
    if (place && place.length <= 10) add('장소에서', place + '의 하루');
    return out.slice(0, 6);
  }

  // anchor 요소 바로 뒤에 "제목 추천" 카드 목록을 붙입니다. (제목 입력칸은 #title)
  function mountTitles(anchor) {
    if (!anchor || !anchor.parentNode) return;
    const wrap = document.createElement('div');
    wrap.className = 'title-suggest';
    wrap.innerHTML =
      '<p class="help" style="margin:18px 0 8px"><b>✨ 제목 추천</b> — 지금까지 정한 내용으로 만들었어요. 마음에 드는 제목을 누르거나, 위 칸에 직접 써도 돼요.</p>' +
      '<div class="title-cards"></div>' +
      '<div class="actions" style="margin-top:10px"><button type="button" class="btn ghost" data-act="refresh">제목 다시 추천받기</button></div>';
    anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    const list = wrap.querySelector('.title-cards');

    function draw() {
      const items = titleSuggestions(project());
      const cur = val('title');
      list.innerHTML = items.length
        ? items.map(function (it) {
            return '<button type="button" class="title-card' + (it.text === cur ? ' on' : '') + '" data-t="' + esc(it.text) + '"><b>' + esc(it.label) + '</b><p>' + esc(it.text) + '</p></button>';
          }).join('')
        : '<p class="help" style="margin:0">앞 단계(기획·스토리·캐릭터)를 진행하면 내용에 맞는 제목을 추천해 드려요.</p>';
    }
    draw();
    setTimeout(draw, 0);

    wrap.addEventListener('click', function (e) {
      if (e.target.closest('[data-act="refresh"]')) { draw(); return; }
      const card = e.target.closest('.title-card');
      if (!card) return;
      setVal('title', card.dataset.t);
      const pr = project();
      if (!pr.projectName || pr.projectName === ColorM.DEFAULT_PROJECT_NAME) {
        ColorM.saveProjectName(card.dataset.t);
        const inp = document.getElementById('cmProjectName');
        if (inp) inp.value = card.dataset.t;
      }
      draw();
      ColorM.toast('제목을 채웠어요.');
    });
    document.addEventListener('input', function (e) { if (e.target && e.target.id === 'title') draw(); });
  }
  // ---------- 단계별 추천 정의 ----------
  const DEFS = {
    plan: {
      anchor: function () { const e = $('hero'); return e && e.closest('section'); },
      what: '주인공·목표·문제·메시지와 배경(장소·시간·특별한 설정)을',
      basis: function () { return [val('topic'), val('audience'), val('genre'), val('mood')]; },
      apply: function () {
        const s = pickSeed(val('topic'), val('genre'), val('audience'));
        fillAll({ hero: s.hero, goal: s.goal, problem: s.problem, message: s.message, place: s.place, time: s.time, special: s.special },
          s.matched ? '' : '주제에 딱 맞는 추천이 없어서 입력한 주제로 기본 틀을 채웠어요. 내용을 고쳐서 써보세요.');
      }
    },

    story: {
      anchor: function () { const e = $('countOptions'); return e && e.closest('section'); },
      what: '장면 수·이야기 스타일·이야기 장치를',
      basis: function () { const p = project().plan || {}; return [p.audience, p.genre, p.mood]; },
      apply: function () {
        const p = project().plan || {};
        const audience = p.audience || '', genre = p.genre || '', mood = p.mood || '';
        const n = /유아/.test(audience) ? 6 : /고학년|청소년/.test(audience) ? 12 : 8;
        let style = '감성 중심';
        if (/모험|판타지/.test(genre)) style = '모험 중심';
        else if (/환경/.test(genre)) style = '행동 중심';
        else if (/창작동화/.test(genre)) style = '균형 있게';
        if (/유쾌|경쾌/.test(mood)) style = '대화 중심';
        let device = '처음과 끝 연결';
        if (/유아/.test(audience)) device = '반복되는 행동 또는 문장';
        else if (/모험|판타지/.test(genre)) device = '반전 또는 새로운 발견';
        const btn = document.querySelector('#countOptions button[data-n="' + n + '"]');
        if (btn) btn.click();
        setVal('style', style);
        setVal('device', device);
        ColorM.toast('추천 내용을 채웠어요. 마음에 안 드는 부분은 바꿔주세요.');
      }
    },

    storyboard: {
      anchor: function () { return $('sceneCards'); },
      what: '장면 제목·등장인물의 표정과 행동·그림콘티(구도)를',
      basis: function () {
        const pr = project(); const n = document.querySelectorAll('.scene-card').length;
        return [n ? n + '장면' : '', (pr.story || {}).style, lastWord((pr.plan || {}).hero)];
      },
      apply: function () {
        const pr = project(); const plan = pr.plan || {};
        const cards = [].slice.call(document.querySelectorAll('.scene-card'));
        const n = cards.length; if (!n) return;
        let names = [];
        if (!names.length && pr.character && pr.character.name) names = [pr.character.name];
        if (!names.length) names = [lastWord(plan.hero) || '주인공'];
        ColorM.castLines(pr).forEach(function (c) { if (c.name && names.indexOf(c.name) < 0) names.push(c.name); });
        const place = (plan.place || '').trim();
        cards.forEach(function (card, i) {
          const title = card.querySelector('.sc-title');
          if (title && !title.value.trim()) title.value = (i + 1) + '장. ' + STAGES[stageIndex(i, n)];
          const cast = card.querySelector('.sc-cast');
          const castNow = cast.value.trim();
          if (!castNow || names.indexOf(castNow) >= 0 || castNow === lastWord(plan.hero)) {
            const ex = expressionAt(i, n);
            cast.value = names.map(function (nm, k) { return nm + ': ' + (k === 0 ? ex : ex.split(', ').reverse().join(', ')); }).join('\n');
          }
          const conti = card.querySelector('.sc-conti');
          const contiNow = conti.value.trim();
          if (!contiNow || contiNow === place) {
            conti.value = (place ? place + ', ' : '') + compositionAt(i, n);
          }
        });
        ColorM.toast('추천 내용을 채웠어요. 마음에 안 드는 부분은 바꿔주세요. (대화는 직접 적어주세요)');
      }
    },

    character: {
      anchor: function () { const e = $('name'); return e && e.closest('section'); },
      what: '캐릭터 유형·나이·외형·의상·성격·표정·화풍을',
      basis: function () { const p = project().plan || {}; return [p.audience, p.genre, p.mood, lastWord(p.hero)]; },
      apply: function () {
        const p = project().plan || {};
        const type = charType(p.hero);
        const mk = moodKey(p.mood);
        const map = {
          type: type,
          age: AGE_BY_AUDIENCE[p.audience] || AGE_BY_AUDIENCE['초등 저학년'],
          appearance: APPEARANCE_BY_TYPE[type],
          outfit: outfitFor(p.genre, type),
          personality: PERSONALITY_BY_MOOD[mk],
          emotion: EMOTION_BY_MOOD[mk],
          habit: HABIT_BY_MOOD[mk],
          mood: CHAR_MOOD_BY_MOOD[mk],
          artStyle: artStyleFor(p.audience || '', p.genre || ''),
          shot: '전신',
          bg: '흰색 기본'
        };
        const hd = project().heroDraft || {};
        if (hd.type) map.type = hd.type;
        if (hd.age) map.age = hd.age;
        if (hd.appearance) map.appearance = hd.appearance;
        if (hd.outfit) map.outfit = hd.outfit;
        if (hd.name) map.name = hd.name;
        else if (!val('name') && p.hero && lastWord(p.hero) !== '주인공') map.name = lastWord(p.hero);
        if (hd.mainColor) map.mainColor = hd.mainColor;
        else if (typeof ColorMMind !== 'undefined' && ColorMMind.hasColor()) map.mainColor = ColorMMind.get().colorName;
        fillAll(map);
      }
    },

    scene: {
      anchor: function () { const e = $('iBg'); return e && e.closest('section'); },
      what: '배경·컬러 분위기·조명·카메라 거리·시점을',
      basis: function () { const p = project().plan || {}; return [(val('sPlace') || p.place || '').split(/[,，]/)[0], val('sTime') || p.time, val('sMood') || p.mood]; },
      apply: function () {
        const p = project().plan || {};
        const place = (val('sPlace') || p.place || '').split(/[,，]/)[0].trim();
        const mood = val('sMood') || p.mood || '';
        const time = val('sTime') || p.time || '';
        const comp = val('sComposition');
        let distance = '미디엄 샷';
        if (/클로즈업|가까이/.test(comp)) distance = '클로즈업';
        else if (/와이드|멀리|전경/.test(comp)) distance = '와이드 샷';
        else if (/풀 샷|전신/.test(comp)) distance = '풀 샷';
        let angle = '정면 시점';
        if (/위에서/.test(comp)) angle = '위에서 내려다본 시점';
        else if (/아래에서|올려다/.test(comp)) angle = '아래에서 올려다본 시점';
        else if (/측면/.test(comp)) angle = '측면 시점';
        const mk = moodKey(mood);
        fillAll({
          iBg: place ? place + ' 풍경' : BG_BY_MOOD[mk],
          iColor: mindSceneTone() || COLOR_BY_MOOD[mk],
          iLight: lightFor(time, mood),
          iDistance: distance,
          iAngle: angle,
          ratio: '3:4'
        });
      }
    },

    cover: {
      anchor: function () { const e = $('sceneDesc'); return e && e.closest('section'); },
      what: '표지 장면·배경·컬러 분위기·조명·구도, 뒷표지·간지 배경 스타일을',
      basis: function () {
        const pr = project();
        return [val('title') || ((pr.story || {}).titles || [])[0], (pr.character || {}).name, (pr.plan || {}).mood];
      },
      apply: function () {
        const pr = project(); const p = pr.plan || {};
        const mk = moodKey(p.mood);
        let desc = '주인공이 환하게 웃으며 정면을 바라보는 모습';
        if (/모험|판타지/.test(p.genre || '')) desc = '주인공이 길 위에서 모험을 시작하는 모습';
        else if (/와|과|친구/.test(p.hero || '')) desc = '주인공과 친구들이 함께 모여 웃는 모습';
        const map = {
          sceneDesc: desc,
          iBg: BG_BY_MOOD[mk],
          iColor: mindCoverTone() || COLOR_BY_MOOD[mk],
          iLight: mk === 'mystic' ? '신비로운 역광' : '부드러운 자연광',
          iDistance: '미디엄 샷',
          iAngle: '정면 시점',
          ratio: '3:4',
          textInImage: '없음 (기본)',
          backCoverStyle: STYLE_BY_MOOD[mk],
          halfTitleStyle: STYLE_BY_MOOD[mk]
        };
        const sug = titleSuggestions(pr);
        const t = ((pr.story || {}).titles || [])[0] || (sug[0] && sug[0].text);
        if (!val('title') && t) map.title = t;
        fillAll(map);
      }
    },

    publish: {
      anchor: function () { const e = $('pTitle'); return e && e.closest('section'); },
      what: '사용한 AI 도구를',
      basis: function () { return [val('pTitle'), val('pAudience')]; },
      apply: function () {
        const map = {};
        if (!val('pAiTools')) map.pAiTools = 'ChatGPT, Canva Magic Media';
        if (!Object.keys(map).length) { ColorM.toast('이미 모두 채워져 있어요.'); return; }
        fillAll(map);
      }
    }
  };

  function mount(stepKey) {
    const def = DEFS[stepKey];
    if (!def) return;
    const anchor = def.anchor();
    if (!anchor || !anchor.parentNode) return;
    const wrap = document.createElement('div');
    wrap.className = 'recommend-box';
    wrap.innerHTML =
      '<div class="rb-text"><b class="rb-title">✨ 무엇을 골라야 할지 모르겠다면?</b><p class="rb-desc"></p></div>' +
      '<button type="button" class="btn primary rb-btn">추천 한 번에 적용</button>';
    anchor.parentNode.insertBefore(wrap, anchor);
    const desc = wrap.querySelector('.rb-desc');

    function refresh() {
      const b = (def.basis() || []).map(function (x) { return String(x == null ? '' : x).trim(); }).filter(Boolean);
      desc.innerHTML = b.length
        ? '앞에서 정한 내용(<b>' + b.map(esc).join(' / ') + '</b>)을 근거로 ' + def.what + ' 추천해 드려요. 적용한 뒤 마음에 안 드는 부분만 고치면 돼요.'
        : '아직 정한 내용이 없어도 괜찮아요. ' + def.what + ' 기본 추천값으로 채워 드려요. 적용한 뒤 직접 고칠 수 있어요.';
    }
    refresh();
    setTimeout(refresh, 0);
    window.addEventListener('load', refresh);
    let timer = null;
    const later = function () { clearTimeout(timer); timer = setTimeout(refresh, 250); };
    document.addEventListener('input', later);
    document.addEventListener('change', later);
    wrap.querySelector('.rb-btn').addEventListener('click', function () { def.apply(); refresh(); });
  }

  return { mount: mount, fillAll: fillAll, mountTitles: mountTitles, titleSuggestions: titleSuggestions };
})();
