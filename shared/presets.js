/* ===================================================================
   COLOR.M 마음색 그림책 메이커 — 단계별 선택 목록(프리셋)
   각 항목은 목록에서 고르거나 「기타 (직접 입력)」으로 직접 쓸 수 있습니다.
   '한국어|English' 형식은 영어 프롬프트에도 정확한 영어 표현으로 들어갑니다.
   값이 true / {replace:'기타'} 인 항목은 이미 있는 선택 목록에 「기타 (직접 입력)」만 추가합니다.
   =================================================================== */
const ColorMPresets = (function () {

  const BG = [
    '색색의 꽃이 핀 마을 풍경|a village scenery with colorful blooming flowers',
    '회색빛에서 붉게 물들어가는 숲|a forest turning from gray to red',
    '별이 반짝이는 밤하늘|a starry night sky',
    '햇살이 비치는 초록 들판|a sunlit green meadow',
    '포근한 방 안 풍경|a cozy room interior',
    '몽환적인 구름과 빛무리|dreamy clouds and glowing light',
    '잔잔한 바닷가 노을|a calm seaside sunset'
  ];
  const COLOR = [
    '파스텔 라벤더와 핑크 톤',
    '따뜻한 레드와 오렌지 톤|warm red and orange tones',
    '맑은 하늘색과 민트 톤|clear sky-blue and mint tones',
    '부드러운 노랑과 크림 톤|soft yellow and cream tones',
    '차분한 초록과 베이지 톤|calm green and beige tones',
    '깊은 남색과 별빛 톤|deep navy and starlight tones',
    '회색에서 점점 색이 돌아오는 톤|gray tones gradually regaining color'
  ];

  return {
    plan: {
      audience: true,
      genre: true,
      mood: true,
      topic: ['용서와 사랑', '우정', '용기', '가족의 소중함', '나다움·자존감', '감정 표현하기', '환경 보호', '다름을 존중하기', '나눔과 배려', '꿈과 도전', '색과 감정', '두려움 극복'],
      hero: ['호기심 많은 토끼', '용감한 강아지', '다정한 고양이', '수줍은 곰', '장난꾸러기 여우', '상상력 풍부한 소녀', '씩씩한 소년', '마음의 색을 찾는 아이', '작은 요정', '엉뚱한 로봇'],
      goal: ['잃어버린 소중한 것을 찾고 싶다', '진짜 친구를 사귀고 싶다', '두려움을 이겨내고 싶다', '누군가를 돕고 싶다', '새로운 곳을 탐험하고 싶다', '소중한 사람과 화해하고 싶다', '나만의 색(재능)을 찾고 싶다', '꿈을 이루고 싶다'],
      problem: ['소중한 것을 잃어버렸다', '친구와 다투어 마음이 멀어졌다', '새로운 환경이 낯설고 두렵다', '나만 다르다고 느낀다', '길을 잃어버렸다', '마음을 표현하지 못해 답답하다', '누군가 도움을 필요로 한다', '세상의 색이 사라져 버렸다'],
      message: ['용서와 이해는 마음에도 세상에도 다시 색을 되찾아 준다', '진짜 친구는 서로를 이해해 준다', '나는 있는 그대로 소중하다', '용기를 내면 한 걸음 나아갈 수 있다', '다름은 아름다움이다', '함께하면 더 큰 힘이 된다', '사랑은 나눌수록 커진다'],
      place: ['숲속', '바닷가 마을', '학교와 교실', '우리 집', '구름 위 하늘나라', '꽃이 가득한 정원', '산 위 언덕', '도시의 작은 공원', '우주 여행길', '꿈속 세계'],
      time: ['어느 날', '따뜻한 봄날', '햇살 가득한 여름날', '쓸쓸한 가을날', '눈 내리는 겨울날', '해 질 녘', '고요한 한밤중', '아주 먼 옛날', '아주 먼 미래'],
      special: ['말하는 동물들이 사는 세상', '마법이 존재하는 세계', '마음의 색이 눈에 보이는 세계', '사물들이 말을 하는 세계', '감정에 따라 날씨가 변하는 곳', '특별한 설정 없음']
    },

    story: {
      style: true,
      device: true
    },

    storyboard: {},

    character: {
      type: { replace: '기타' },
      artStyle: true,
      shot: true,
      bg: true,
      mainColor: [
        '레드|red', '코랄|coral', '오렌지|orange', '옐로우|yellow', '라임|lime green', '그린|green', '민트|mint', '터콰이즈|turquoise',
        '블루|blue', '네이비|navy', '퍼플|purple', '라벤더|lavender', '핑크|pink', '마젠타|magenta', '브라운|brown', '그레이|gray'
      ],
      age: [
        '3~5세 정도의 유아|a toddler around 3 to 5 years old',
        '6~8세 정도의 어린이|a child around 6 to 8 years old',
        '9~12세 정도의 어린이|a child around 9 to 12 years old',
        '10대 청소년|a teenager',
        '20~30대 성인|an adult in their twenties or thirties',
        '할머니·할아버지|an elderly grandparent',
        '나이를 알 수 없는 신비로운 존재|a mysterious ageless being'
      ],
      appearance: [
        '동그란 얼굴에 커다란 눈',
        '크고 쫑긋한 귀와 복슬복슬한 털|big perky ears and fluffy fur',
        '짧은 단발머리에 반짝이는 눈|short bob hair with sparkling eyes',
        '길고 부드러운 곱슬머리|long soft curly hair',
        '통통한 볼과 작은 코|chubby cheeks and a small nose',
        '작고 둥글둥글한 몸|a small round body',
        '주근깨가 있는 장난스러운 얼굴|a playful freckled face'
      ],
      outfit: [
        '노란 우비와 빨간 장화|a yellow raincoat and red boots',
        '연보라색 원피스와 작은 별 모양 목걸이',
        '체크무늬 셔츠와 멜빵바지|a plaid shirt and overalls',
        '따뜻한 털모자와 목도리|a warm knit hat and scarf',
        '빨간 리본과 주황색 원피스|a red ribbon and an orange dress',
        '작은 망토와 모험 가방|a small cape and an adventure bag',
        '파란 교복 스타일 옷|a blue school-uniform-style outfit'
      ],
      personality: [
        '다정하고 씩씩한 성격|a kind and brave personality',
        '호기심 많고 모험을 좋아하는 성격|a curious, adventure-loving personality',
        '수줍지만 마음이 따뜻한 성격|a shy but warm-hearted personality',
        '장난기 많고 유쾌한 성격|a playful and cheerful personality',
        '여리지만 용기 있는 성격|a delicate yet courageous personality',
        '차분하고 생각이 깊은 성격|a calm and thoughtful personality'
      ],
      emotion: [
        '늘 웃음을 머금은 따뜻한 표정|a warm, smiling expression',
        '처음엔 시무룩하지만 점점 밝아지는 표정',
        '걱정스럽지만 끝까지 해내려는 표정|a worried yet determined expression',
        '호기심 가득 반짝이는 눈빛|curious, sparkling eyes',
        '수줍게 볼이 붉어지는 표정|a shy, blushing expression'
      ],
      habit: [
        '속상해하는 친구 곁에서 손을 꼭 잡아주는 버릇',
        '긴장하면 옷자락을 만지작거리는 버릇|a habit of fidgeting with clothes when nervous',
        '기쁠 때 제자리에서 폴짝 뛰는 버릇|a habit of hopping on the spot when happy',
        '생각할 때 고개를 갸웃하는 버릇|a habit of tilting the head when thinking',
        '무엇이든 일기에 적는 버릇|a habit of writing everything in a diary',
        '소중한 물건을 늘 품에 안고 다니는 버릇|a habit of always carrying a treasured item'
      ],
      mood: [
        '따뜻하고 몽환적인 동화 느낌',
        '밝고 경쾌한 모험 분위기|a bright, lively adventure mood',
        '포근하고 다정한 감성 분위기|a cozy, tender emotional mood',
        '신비롭고 환상적인 분위기|a mysterious, fantastical mood',
        '잔잔하고 평화로운 분위기|a calm, peaceful mood',
        '따뜻한 레드·오렌지 톤의 다정한 분위기|a warm red-and-orange toned, affectionate mood'
      ]
    },

    scene: {
      iLight: true,
      iDistance: true,
      iAngle: true,
      sPlace: [
        '숲속|a forest',
        '마을 광장|a village square',
        '바닷가|a seaside beach',
        '학교 교실|a school classroom',
        '포근한 집 거실|a cozy living room at home',
        '꽃이 가득한 정원|a flower-filled garden',
        '산 위 언덕|a hilltop on a mountain',
        '구름 위 하늘나라|a kingdom above the clouds',
        '한밤의 호숫가|a lakeside at night'
      ],
      sTime: [
        '어느 날|one day',
        '이른 아침|early morning',
        '한낮|midday',
        '해 질 녘|sunset',
        '한밤중|night',
        '비 오는 날|a rainy day',
        '눈 오는 겨울날|a snowy winter day'
      ],
      sMood: [
        '따뜻하고 다정한',
        '신비롭고 환상적인|mysterious and fantastical',
        '설레고 두근거리는|excited and heart-fluttering',
        '쓸쓸하고 고요한|lonely and quiet',
        '긴장감이 흐르는|tense and suspenseful',
        '평화롭고 포근한|peaceful and cozy',
        '밝고 경쾌한|bright and lively'
      ],
      sAction: [
        '두 팔을 벌리고 달려간다|running with arms wide open',
        '조심스럽게 한 걸음씩 다가간다|carefully approaching step by step',
        '손을 내밀어 위로해 준다|reaching out a hand to comfort',
        '나란히 앉아 이야기를 나눈다|sitting side by side and talking',
        '하늘을 올려다본다|looking up at the sky',
        '무언가를 발견하고 손으로 가리킨다|discovering something and pointing at it',
        '웃으며 손을 흔든다'
      ],
      sEmotion: [
        '기쁨과 설렘|joy and excitement',
        '놀라움과 호기심|surprise and curiosity',
        '슬픔과 외로움|sadness and loneliness',
        '걱정과 두려움|worry and fear',
        '따뜻한 위로와 공감|warm comfort and empathy',
        '용기와 결심|courage and determination',
        '안도와 행복|relief and happiness'
      ],
      sComposition: [
        '인물을 화면 가운데 크게 배치|the character large in the center of the frame',
        '인물은 한쪽에 두고 배경을 넓게 보여줌|the character to one side with a wide background',
        '멀리서 바라보는 와이드한 전경|a wide establishing view from afar',
        '인물의 표정을 가까이 담은 클로즈업|a close-up on the character’s expression',
        '두 인물이 마주 보는 구도|two characters facing each other',
        '위에서 내려다본 구도|a view from above',
        '아래에서 올려다본 구도|a view from below'
      ],
      iBg: BG,
      iColor: COLOR
    },

    cover: {
      iLight: true,
      iDistance: true,
      iAngle: true,
      sceneDesc: [
        '주인공이 환하게 웃으며 정면을 바라보는 모습|the main character smiling brightly at the viewer',
        '주인공과 친구들이 함께 모여 웃는 모습|the main character and friends gathered together, smiling',
        '주인공이 먼 곳을 바라보는 뒷모습|the main character seen from behind, gazing into the distance',
        '주인공이 소중한 물건을 품에 안고 있는 모습|the main character hugging a treasured item',
        '주인공이 신비로운 빛에 둘러싸인 모습|the main character surrounded by mysterious light',
        '주인공이 길 위에서 모험을 시작하는 모습|the main character starting an adventure on a path'
      ],
      iBg: BG,
      iColor: COLOR
    },

    publish: {
      pAudience: true,
      pLang: true,
      pPages: true,
      pTrim: true,
      pLicense: true,
      pCategory: [
        '어린이 > 그림책 > 창작동화',
        '어린이 > 그림책 > 감성 이야기',
        '어린이 > 그림책 > 판타지',
        '어린이 > 그림책 > 모험',
        '어린이 > 그림책 > 성장 이야기',
        '어린이 > 그림책 > 환경 이야기',
        '청소년 > 그림책',
        '성인 > 그림책'
      ],
      pAiTools: ['ChatGPT', 'Canva Magic Media', 'Midjourney', 'ChatGPT, Canva Magic Media', 'ChatGPT, Midjourney', 'Gemini', 'Claude']
    }
  };
})();
