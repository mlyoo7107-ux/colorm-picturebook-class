/* ===================================================================
   COLOR.M — 한국어 → 영어 프롬프트 보조 변환기
   04 CHARACTER MAKER, 05 SCENE MAKER 전용 (이미지 생성 AI용 프롬프트).
   완벽한 번역기가 아니라 "사전 매핑" 방식입니다 — 선택형 항목(화풍·구도 등)은
   100% 정확하게, 자유 입력 텍스트는 알려진 단어/구 단위로 최대한 바꿔주고
   나머지는 원문을 그대로 남겨둡니다.
   =================================================================== */
const ColorMEN = (function () {

  // ---------- 선택형(드롭다운) 옵션 — 완전일치, 100% 정확 ----------
  const FIXED = {
    // 캐릭터 유형
    '한국 여성': 'Korean woman', '한국 남성': 'Korean man', '동물': 'animal character',
    '판타지 캐릭터': 'fantasy character', '로봇': 'robot character',
    '사물 캐릭터': 'anthropomorphic object character', '기타': 'original character',
    // 화풍
    '부드러운 파스텔 톤의 수채화 그림책 스타일': 'soft pastel-toned watercolor picture-book style',
    '따뜻한 선과 포근한 색감의 동화책 일러스트 스타일': "classic children's storybook illustration style with warm soft outlines and cozy gouache-like colors",
    '선명한 색감의 디지털 일러스트 스타일': 'vivid digital illustration style',
    '손그림 느낌의 색연필 스타일': 'hand-drawn colored-pencil style',
    '귀여운 플랫 벡터 스타일': 'cute flat vector illustration style',
    '따뜻한 톤의 동화책 유화 스타일': 'warm-toned storybook oil-painting style',
    // 화면 범위 / 배경 / 텍스트
    '전신': 'full body shot', '반신': 'half body shot', '45도': '3/4 angle view', '얼굴 중심': 'close-up on face',
    '흰색 기본': 'plain white background', '단색': 'solid color background', '간단한 배경': 'simple background',
    '없음 (기본)': 'no text', '있음': 'with text',
    // 캐릭터 시트 옵션
    '정면': 'front view', '측면': 'side view', '후면': 'back view',
    '다양한 표정': 'various expressions', '다양한 포즈': 'various poses',
    // 스토리보드/장면 구도
    '미디엄 샷': 'medium shot', '클로즈업': 'close-up shot', '풀 샷': 'full shot',
    '버즈아이 뷰': "bird's-eye view", '투 샷': 'two-shot', '로우 앵글': 'low-angle shot', '와이드 샷': 'wide shot',
    // 시점 / 카메라 거리
    '정면 시점': 'front-facing viewpoint', '측면 시점': 'side viewpoint',
    '위에서 내려다본 시점': 'top-down viewpoint', '아래에서 올려다본 시점': 'low-angle upward viewpoint',
    // 조명
    '부드러운 자연광': 'soft natural light', '따뜻한 노을빛': 'warm sunset light',
    '은은한 달빛': 'soft moonlight', '맑고 화사한 낮빛': 'bright clear daylight', '신비로운 역광': 'mysterious backlight'
  };

  // ---------- 샘플·자주 쓰이는 구(句) 단위 — 자연스러운 문장 대응 ----------
  const PHRASES = [
    ['동그란 얼굴에 커다란 눈', 'a round face with big eyes'],
    ['부드러운 하늘색 머리카락', 'soft sky-blue hair'],
    ['연보라색 원피스와 작은 별 모양 목걸이', 'a light-purple dress and a small star-shaped necklace'],
    ['여리지만 호기심이 많고 다정한 성격', 'a delicate yet curious and kind personality'],
    ['처음엔 시무룩하지만 점점 밝아지는 표정', 'a gloomy expression that gradually brightens'],
    ['손끝으로 자신의 마음을 톡톡 두드리는 버릇', 'a habit of gently tapping her own heart with her fingertip'],
    ['따뜻하고 몽환적인 동화 느낌', 'a warm, dreamy fairytale mood'],
    ['저마다의 색을 가진 친구들이 사는 마을', 'a village where every friend has their own color'],
    ['웃으며 손을 흔든다', 'smiling and waving a hand'],
    ['색색의 꽃이 핀 친구들의 마을', 'a village of friends with colorful blooming flowers'],
    ['색색의 마을 광장', 'a colorful village square'],
    ['파스텔 라벤더와 핑크 톤', 'pastel lavender and pink tones'],
    ['따뜻하고 다정한', 'warm and kind'],
    ['어느 계절의 하루', 'a day in some season'],
    ['크고 쫑긋한 귀', 'big perky ears'],
    ['퍼프 소매', 'puff sleeves'],
    ['눈을 동그랗게 뜨고 두리번거리다가도 금세 씩씩하게', 'wide-eyed and looking around, but quickly turns brave and'],
    ['친구의 아픔을 보면 눈이 동그래지다가도 금세 다정하게 다가가 웃어주는', "wide-eyed at a friend's pain, but quickly comes close with a warm smile"],
    ['속상해하는 친구 곁에서 손을 꼭 잡아주는', "holding a upset friend's hand tightly by their side"]
  ];

  // ---------- 단어 단위 — 부분 대응(최대한 커버, 완벽하진 않음) ----------
  const WORDS = [
    ['하늘색', 'sky-blue'], ['연보라색', 'light purple'], ['분홍색', 'pink'], ['분홍빛', 'pink'], ['노란색', 'yellow'],
    ['초록색', 'green'], ['빨간색', 'red'], ['빨간', 'red'], ['주황색', 'orange'], ['주황빛', 'orange'], ['갈색', 'brown'],
    ['하얀색', 'white'], ['흰색', 'white'], ['파란색', 'blue'], ['보라색', 'purple'], ['검은색', 'black'], ['크림빛 아이보리', 'creamy ivory'], ['크림빛', 'cream-colored'],
    ['얼굴', 'face'], ['머리카락', 'hair'], ['눈동자', 'eyes'], ['눈', 'eyes'], ['볼', 'cheeks'], ['입', 'mouth'], ['몸', 'body'], ['손', 'hands'], ['표정', 'expression'],
    ['동그란', 'round'], ['커다란', 'big'], ['작은', 'small'], ['부드러운', 'soft'], ['따뜻한', 'warm'], ['따뜻하고', 'warm and'], ['부드럽고', 'soft and'], ['밝고', 'bright and'], ['귀엽고', 'cute and'],
    ['사랑스러운', 'lovely'], ['귀여운', 'cute'], ['반짝이는', 'sparkling'], ['여린', 'delicate'],
    ['다정한', 'kind'], ['씩씩한', 'brave'], ['활발한', 'energetic'], ['조용한', 'quiet'], ['밝은', 'bright'],
    ['원피스', 'dress'], ['목걸이', 'necklace'], ['모자', 'hat'], ['신발', 'shoes'], ['가방', 'bag'],
    ['리본', 'ribbon'], ['별 모양', 'star-shaped'], ['꽃', 'flower'],
    ['시무룩한', 'gloomy'], ['밝아지는', 'brightening'], ['웃는', 'smiling'], ['설레는', 'excited'],
    ['두근거리는', 'heart-pounding'], ['놀란', 'surprised'], ['행복한', 'happy'], ['슬픈', 'sad'],
    ['두드리는', 'tapping'], ['걷는', 'walking'], ['바라보는', 'looking at'], ['손을 흔드는', 'waving a hand'],
    ['마을', 'village'], ['숲', 'forest'], ['하늘', 'sky'], ['정원', 'garden'], ['바다', 'sea'], ['집', 'house'], ['광장', 'square'],
    ['어린이', 'child'], ['청소년', 'teenager'], ['성인', 'adult'], ['노인', 'elderly person'], ['정도의', 'around'], ['살', 'years old']
  ];

  const ALL_PAIRS = PHRASES.concat(WORDS).concat(Object.keys(FIXED).map(function(k){ return [k, FIXED[k]]; }))
    .sort(function (a, b) { return b[0].length - a[0].length; });

  // 선택 목록의 프리셋(한국어|English)을 사전에 등록합니다.
  function addPairs(list) {
    list.forEach(function (p) {
      if (!ALL_PAIRS.some(function (q) { return q[0] === p[0]; })) ALL_PAIRS.push(p);
    });
    ALL_PAIRS.sort(function (a, b) { return b[0].length - a[0].length; });
  }

  // 선택형 값은 정확히 변환하고, 「기타」로 직접 입력한 값은 자유 입력과 같은 방식으로 변환합니다.
  function fixed(krValue) {
    return FIXED[krValue] || translate(krValue);
  }

  // 자유 입력 텍스트를 영어로 치환합니다.
  // 사전만으로는 문장을 끝까지 영어로 바꾸지 못하는 경우가 많은데, 반쯤만 바뀐 문장("수줍지만 마음이 warm 성격")은
  // 읽기도 어렵고 AI도 헷갈려해요. 그래서 한글이 조금이라도 남으면 깨진 혼합 문장 대신 한국어 원문을 그대로 둡니다.
  function translate(text) {
    if (!text) return '';
    let result = text;
    ALL_PAIRS.forEach(function (pair) {
      result = result.split(pair[0]).join(pair[1]);
    });
    // 영단어 바로 뒤에 붙은 한글 조사 제거 (예: "eyes가" → "eyes")
    result = result.replace(/([a-zA-Z])(은|는|이|가|을|를|의|도|만|에서|에게|처럼|와|과|로|으로)(?=[\s,.]|$)/g, '$1');
    return /[가-힣]/.test(result) ? text : result;
  }

  // 선택 목록(프리셋)에 들어 있는 「한국어|English」 번역은 어느 페이지에서든 쓸 수 있게 한 번에 등록합니다.
  // (예: 04에서 고른 나이·외형 문구를 05·06 요청문에서도 영어로 바꿀 수 있어요)
  if (typeof ColorMPresets !== 'undefined') {
    const pairs = [];
    Object.keys(ColorMPresets).forEach(function (step) {
      const fields = ColorMPresets[step];
      if (!fields || typeof fields !== 'object') return;
      Object.keys(fields).forEach(function (id) {
        const list = fields[id];
        if (!Array.isArray(list)) return;
        list.forEach(function (p) {
          if (typeof p !== 'string') return;
          const i = p.indexOf('|');
          if (i > 0) pairs.push([p.slice(0, i).trim(), p.slice(i + 1).trim()]);
        });
      });
    });
    if (pairs.length) addPairs(pairs);
  }

  return { fixed: fixed, translate: translate, addPairs: addPairs };
})();
