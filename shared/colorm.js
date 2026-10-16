/* ===================================================================
   COLOR.M 마음색 그림책 교실 — 공통 스크립트 (4회차 수업용)
   프로젝트 데이터 모델, localStorage 저장/불러오기, 공통 헤더(회차 버튼 + 그 회차의 단계 탭),
   복사/토스트, PDF·TXT 저장을 모든 회차 메이커(maker-1 ~ maker-4)가 공유합니다.

   사용법 (각 메이커 index.html):
     <div id="cmHeader"></div>
     ...
     <script src="../shared/colorm.js"></script>
     <script>
       ColorM.renderHeader('cmHeader', 'plan');           // 헤더+5단계 네비+프로젝트명
       ColorM.renderStepNav('cmStepNav', 'plan');          // 이전/다음 단계 버튼
     </script>
   =================================================================== */
const ColorM = (function () {
  // 메이커(회차)마다 저장 공간을 따로 써요: colorm_class_s1_… ~ colorm_class_s4_… (특강은 s5)
  // 회차가 바뀌면 자동으로 이어지지 않고, 지난 회차에서 저장한 작업파일(.json)을 「불러오기」해야 이어져요.
  // (라이브 그림책 메이커의 colorm_project_v1과도 겹치지 않아요 — 같은 github.io 주소에 올라가도 섞이지 않게)
  const SESSION_NO = +document.documentElement.dataset.session || 0;
  const NS = 'colorm_class_' + (SESSION_NO ? 's' + SESSION_NO + '_' : '');
  const STORAGE_KEY = NS + 'project';
  const DRAFT_PREFIX = NS + 'draft_';
  const BRIDGE_PREFIX = NS + 'bridge_';
  // 작업파일 안의 입력 기록(_drafts)은 어느 메이커에서든 읽을 수 있게 회차 표시 없는 이름으로 적어요.
  const FILE_DRAFT_PREFIX = 'colorm_draft_';
  const DEFAULT_PROJECT_NAME = '나의 AI 그림책 프로젝트';

  // 4회차 수업 구성 — 회차마다 메이커(maker-N 폴더) 하나.
  const SESSIONS = [
    { no: 1, name: '기획 · 이야기 · 스토리보드', short: '이야기', path: 'maker-1' },
    { no: 2, name: '캐릭터 · 장면 생성', short: '그림', path: 'maker-2' },
    { no: 3, name: '편집', short: '편집', path: 'maker-3' },
    { no: 4, name: '표지 · 출판', short: '출판', path: 'maker-4' },
    // 2시간 특강용 메이커 (4회 수업과 따로 쓰는 한 번에 끝나는 메이커 · 저장도 따로)
    { no: 5, name: '2시간 특강', short: '특강', path: 'special', title: '마음색 그림책 특강', label: '특강', single: true }
  ];
  // 화면에 쓰는 회차 이름: 1회 ~ 4회, 특강
  function sessionLabel(no) {
    const se = SESSIONS[no - 1];
    return se && se.label ? se.label : no + '회';
  }

  // 단계 공통 순서 정의 — key는 project 객체의 필드명과 동일하게 맞춥니다. path는 사이트 맨 위 폴더 기준.
  const STEPS = [
    { key: 'plan', label: '01 PLAN', num: '01', name: '기획', session: 1, path: 'maker-1/01-plan.html' },
    { key: 'story', label: '02 STORY', num: '02', name: '스토리', session: 1, path: 'maker-1/02-story.html' },
    { key: 'storyboard', label: '03 STORYBOARD', num: '03', name: '스토리보드', session: 1, path: 'maker-1/03-storyboard.html' },
    { key: 'character', label: '04 CHARACTER', num: '04', name: '캐릭터', session: 2, path: 'maker-2/04-character.html' },
    { key: 'scene', label: '05 SCENE', num: '05', name: '장면', session: 2, path: 'maker-2/05-scene.html' },
    { key: 'edit', label: 'EDIT', num: '편집 1', name: '그림책 정리', session: 3, path: 'maker-3/edit.html' },
    { key: 'canva', label: 'CANVA', num: '편집 2', name: '캔바 편집', session: 3, path: 'maker-3/canva.html' },
    { key: 'cover', label: '06 COVER', num: '06', name: '표지', session: 4, path: 'maker-4/06-cover.html' },
    { key: 'publish', label: '07 PUBLISH', num: '07', name: '출판정보', session: 4, path: 'maker-4/07-publish.html' },
    // 2시간 특강: 같은 단계(기획·캐릭터·표지 등)를 다시 쓰고, 마지막에 작가의 말
    { key: 'plan', label: '01 PLAN', num: '01', name: '기획', session: 5, path: 'special/01-plan.html' },
    { key: 'storyboard', label: '02 STORY', num: '02', name: '이야기', session: 5, path: 'special/02-story.html' },
    { key: 'character', label: '03 CHARACTER', num: '03', name: '캐릭터', session: 5, path: 'special/03-character.html' },
    { key: 'scene', label: '04 BOOK', num: '04', name: '그림책', session: 5, path: 'special/04-book.html' },
    { key: 'cover', label: '05 COVER', num: '05', name: '표지', session: 5, path: 'special/05-cover.html' },
    { key: 'author', label: '06 AUTHOR', num: '06', name: '작가의 말', session: 5, path: 'special/06-author.html' }
  ];
  // 같은 단계가 여러 메이커에 있을 수 있어서, 지금 열린 메이커의 단계를 먼저 찾아요
  function stepFor(key) {
    return STEPS.find(function (x) { return x.key === key && x.session === SESSION_NO; }) ||
      STEPS.find(function (x) { return x.key === key; });
  }
  function sessionOf(key) {
    const s = stepFor(key);
    return s ? s.session : 0;
  }

  function emptyProject() {
    return {
      projectName: DEFAULT_PROJECT_NAME,
      plan: {},
      story: {},
      storyboard: {},
      character: {},
      scenes: [],
      edit: {},
      canva: {},
      cover: {},
      publish: {},
      mind: {},
      cast: [],
      heroDraft: {},
      updatedAt: null
    };
  }

  // ---------- 저장소 추상화 (지금은 localStorage, 추후 Supabase 등으로 교체 가능) ----------
  const storage = {
    get() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    set(project) {
      try {
        project.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        return true;
      } catch (e) {
        return false;
      }
    },
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  };

  function getProject() {
    const saved = storage.get();
    if (!saved) return emptyProject();
    return Object.assign(emptyProject(), saved);
  }

  function saveStep(stepKey, data) {
    const project = getProject();
    project[stepKey] = data;
    storage.set(project);
    return project;
  }

  // manual === true: 사용자가 프로젝트명을 직접 고쳤다는 뜻 (이후 책 제목이 바뀌어도 프로젝트명은 그대로 둡니다)
  function saveProjectName(name, manual) {
    const project = getProject();
    project.projectName = (name || '').trim() || DEFAULT_PROJECT_NAME;
    if (manual === true) project.projectNameManual = project.projectName !== DEFAULT_PROJECT_NAME;
    storage.set(project);
    return project;
  }
  // 표지에서 정한(또는 고치고 있는) 책 제목. 오른쪽 카드와 프로젝트명이 이 제목을 따라갑니다.
  function setBookTitle(title) {
    const project = getProject();
    const t = (title || '').trim();
    project.bookTitle = t;
    if (t && !project.projectNameManual) project.projectName = t;
    storage.set(project);
    const inp = document.getElementById('cmProjectName');
    if (inp && t && !project.projectNameManual) inp.value = t;
    return project;
  }
  // 표지 화면에서 제목 칸을 고치는 즉시 저장
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'title' && document.getElementById('coverForm')) setBookTitle(e.target.value);
  });

  // ---------- 단계별 완료 여부 (헤더 네비 · 허브 · 종합 결과 화면에서 공용) ----------
  function stepStatus(project) {
    project = project || getProject();
    return {
      plan: !!(project.plan && project.plan.hero),
      story: !!(project.story && project.story.sceneCount),
      storyboard: !!(project.storyboard && project.storyboard.scenes && project.storyboard.scenes.length),
      character: !!(project.character && project.character.name),
      scene: !!(project.scenes && project.scenes.some(function (s) { return !!s; })),
      edit: !!(project.edit && project.edit.confirmedAt),
      canva: !!(project.canva && project.canva.doneAt),
      cover: !!(project.cover && project.cover.title),
      publish: !!(project.publish && project.publish.fields && project.publish.fields.title),
      author: !!(project.author && project.author.text)
    };
  }

  // 함께 나오는 캐릭터 (04에서 입력, 05·06·ChatGPT 요청문에서 사용)
  function castLines(project) {
    project = project || getProject();
    return (Array.isArray(project.cast) ? project.cast : []).filter(function (c) { return c && (c.name || c.desc); }).map(function (c) {
      return { role: c.role || '', name: (c.name || '').trim(), desc: (c.desc || '').trim() };
    });
  }
  const ROLE_EN = { '친구': 'friend', '가족': 'family member', '반려동물': 'pet', '도와주는 존재': 'helper', '라이벌': 'rival', '낯선 존재': 'mysterious stranger' };
  // 프롬프트에 붙일 "함께 나오는 캐릭터" 목록 (lang: 'kr' | 'en'), 없으면 ''
  function castBlock(lang) {
    const rows = castLines();
    if (!rows.length) return '';
    if (lang === 'en') {
      return rows.map(function (r) {
        const role = ROLE_EN[r.role] || '';
        const desc = r.desc ? (typeof ColorMEN !== 'undefined' ? ColorMEN.translate(r.desc) : r.desc) : '';
        return '- ' + (r.name || role || 'character') + (role && r.name ? ' (' + role + ')' : '') + (desc ? ': ' + desc : '');
      }).join('\n');
    }
    return rows.map(function (r) { return '- ' + (r.name || r.role) + (r.role && r.name ? ' (' + r.role + ')' : '') + (r.desc ? ': ' + r.desc : ''); }).join('\n');
  }
  // 주인공 설명 문장에서 이름처럼 쓸 말을 뽑습니다. "…한 여성" 같은 일반 명사만 남으면 "주인공"으로 둡니다.
  const GENERIC_HERO = ['사람', '여성', '남성', '아이', '소녀', '소년', '어린이', '주인공'];
  function heroName(plan) {
    const h = String((plan && plan.hero) || '').trim();
    if (!h) return '주인공';
    const w = h.split(/\s+/).pop();
    return GENERIC_HERO.indexOf(w) >= 0 ? '주인공' : w;
  }
  // 스토리보드의 장면별 "이름: 표정·행동" 줄에서 주인공(가장 자주 나오는 인물)과 다른 인물을 뽑습니다.
  function guessCastRole(name) {
    if (/엄마|아빠|할머니|할아버지|언니|오빠|누나|형|동생|삼촌|이모|고모|가족|아들|딸/.test(name)) return '가족';
    if (/강아지|고양이|토끼|새|거북|반려|멍멍|야옹/.test(name)) return '반려동물';
    if (/선생|요정|도우미|안내/.test(name)) return '도와주는 존재';
    return '친구';
  }
  function deriveCharacters(scenes, preferredMain) {
    // "어린 하나"처럼 수식어가 붙은 이름은 마지막 단어(하나)로 묶어서 센다.
    const baseOf = function (n) { return n.split(/\s+/).pop(); };
    const count = {}, order = [];
    (scenes || []).forEach(function (s) {
      const seen = {};
      String((s && s.cast) || '').split('\n').forEach(function (l) {
        const n = l.split(/[:：]/)[0].trim();
        if (!n || n.length > 10 || n.indexOf('주인공') >= 0) return;
        const b = baseOf(n);
        if (seen[b]) return;
        seen[b] = true;
        if (!(b in count)) { count[b] = 0; order.push(b); }
        count[b]++;
      });
    });
    let main = preferredMain ? baseOf(preferredMain) : '';
    if (!main) {
      // 가장 많은 장면에 나온 인물, 동점이면 먼저 나온 인물(보통 주인공)
      main = order.slice().sort(function (a, b) { return count[b] - count[a] || order.indexOf(a) - order.indexOf(b); })[0] || '';
    }
    const extras = order.filter(function (b) { return b !== main; }).slice(0, 4)
      .map(function (b) { return { role: guessCastRole(b), name: b, desc: '' }; });
    return { main: main, extras: extras };
  }
  // ---------- 한국어 조사 자동 선택 (받침 유무 판별) ----------
  function josa(word, pair) {
    const w = String(word == null ? '' : word).trim();
    const last = w[w.length - 1];
    const code = last ? last.charCodeAt(0) : 0;
    if (code < 0xAC00 || code > 0xD7A3) return pair[0];
    const hasBatchim = (code - 0xAC00) % 28 !== 0;
    return hasBatchim ? pair[0] : pair[1];
  }

  function escapeHTML(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- 프로젝트 파일 저장 / 불러오기 / 새 프로젝트 ----------
  // 이 메이커의 저장 공간만 지워요. (다른 회차 메이커의 작업은 그대로)
  function clearAll() {
    storage.clear();
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(DRAFT_PREFIX) === 0 || k.indexOf(BRIDGE_PREFIX) === 0) localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  function exportProject() {
    const project = getProject();
    const drafts = {};
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(DRAFT_PREFIX) === 0) drafts[FILE_DRAFT_PREFIX + k.slice(DRAFT_PREFIX.length)] = localStorage.getItem(k);
      });
    } catch (e) {}
    project._drafts = drafts;
    if (SESSION_NO) project._savedSession = SESSION_NO;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ('COLOR.M_' + project.projectName + (SESSION_NO ? '_' + sessionLabel(SESSION_NO) : '') + '.json').replace(/[\\/:*?"<>|]/g, '_');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('작업파일(.json)로 저장했어요.');
  }

  function importProject(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid');
        const st = stepStatus();
        const hasWork = Object.keys(st).some(function (k) { return st[k]; });
        if (hasWork && !confirm('이 메이커에 있던 작업이 불러온 작업파일 내용으로 바뀌어요. 계속할까요?')) return;
        clearAll();
        const drafts = data._drafts || {};
        delete data._drafts;
        delete data._savedSession;
        try {
          Object.keys(drafts).forEach(function (k) {
            if (k.indexOf(FILE_DRAFT_PREFIX) === 0) localStorage.setItem(DRAFT_PREFIX + k.slice(FILE_DRAFT_PREFIX.length), drafts[k]);
          });
        } catch (e) {}
        storage.set(Object.assign(emptyProject(), data));
        location.reload();
      } catch (e) {
        alert('작업파일(.json)을 읽을 수 없어요. 마음색 그림책 메이커에서 저장한 파일인지 확인해주세요.');
      }
    };
    reader.readAsText(file);
  }

  function newProject() {
    if (!confirm('이 ' + SESSION_NO + '회 메이커에 저장된 작업이 모두 삭제됩니다. (다른 회차 메이커의 작업은 그대로예요)\n먼저 「저장」으로 작업파일을 받아두면 나중에 불러올 수 있어요. 계속할까요?')) return;
    clearAll();
    location.reload();
  }

  // ---------- 공통 헤더 (상단 고정 바 + 6단계 탭 + 프로젝트명) ----------
  function renderHeader(containerId, activeKey, opts) {
    opts = opts || {};
    const root = document.getElementById(containerId);
    if (!root) return;
    const base = opts.base != null ? opts.base : '../';
    const logoSrc = opts.logoSrc || (base + 'shared/assets/logo.png');
    const project = getProject();
    const status = stepStatus(project);

    // 지금 회차: 단계 화면이면 그 단계의 회차, 회차 안내 화면이면 opts.session
    const curSession = opts.session || sessionOf(activeKey);
    // 회차 색: 각 페이지 <html data-session="N">에 적어 두지만(첫 화면 깜빡임 방지), 빠진 경우를 위해 여기서도 맞춰요.
    if (curSession && !document.documentElement.dataset.session) document.documentElement.dataset.session = curSession;
    // 회차마다 따로 쓰는 메이커: 로고·이름·메뉴·탭 모두 그 회차 안에서만 이동해요. (저장소는 하나라 작업은 이어져요)
    const se = SESSIONS[curSession - 1];
    const homeHref = se ? base + se.path + '/index.html' : base + 'index.html';
    const appName = se ? (se.title || '마음색 그림책 ' + se.no + '회 메이커') : '마음색 그림책 교실';
    const tabsHTML = STEPS.filter(function (s) { return s.session === curSession; }).map(function (s) {
      const isOn = s.key === activeKey;
      const done = status[s.key];
      const cls = 'step-tab' + (isOn ? ' on' : '') + (done ? ' done' : '');
      const check = done ? ' <i class="tab-check">✓</i>' : '';
      return '<a class="' + cls + '"' + (isOn ? ' aria-current="page"' : '') + ' href="' + base + s.path + '">' +
        '<b>' + s.num + '</b><span>' + s.name + check + '</span></a>';
    }).join('');

    root.innerHTML =
      '<div class="head-row1" id="cmHeadRow1">' +
      '<div class="top-bar" id="cmTopBar">' +
        '<a class="top-bar-brand" href="' + homeHref + '">' +
          '<img class="top-logo" src="' + logoSrc + '" alt="COLOR.M">' +
          '<span class="app-name">' + appName + '</span>' +
        '</a>' +
      '</div>' +
      '<div class="top-bar-links" id="cmTopBarLinks">' +
        (!SESSION_NO ? '' : '<button type="button" id="cmLoadBtn">불러오기</button>' +
        '<button type="button" id="cmSaveBtn">저장</button>') +
        (curSession === 4 ? '<a href="' + base + 'maker-4/summary.html">전체 결과</a>' : '') +
        (!SESSION_NO ? '' : '<button type="button" id="cmNewBtn" class="menu-danger">처음부터 다시 만들기</button>') +
        // 메이커 처음 화면은 왼쪽 로고로 가요 (메뉴가 넘치지 않게 따로 두지 않음)
        // 메이커 안에서는 메뉴가 넘치지 않게 빼요 (맨 아래 푸터에 colorm.net 링크가 있어요)
        (SESSION_NO ? '' : '<a href="https://colorm.net" target="_blank" rel="noopener">COLOR.M 홈페이지</a>') +
        '<input type="file" id="cmLoadFile" accept=".json,application/json" hidden>' +
      '</div>' +
      '<button type="button" class="menu-toggle" id="cmMenuToggle" aria-haspopup="true" aria-expanded="false" aria-label="메뉴"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>' +
      '</div>' +
      (opts.tabs === false ? '' : (tabsHTML ? '<nav class="step-tabs" id="cmStepTabs"><div class="session-steps">' + tabsHTML + '</div></nav>' : '')) +
      (!opts.projectBar ? '' :
        '<div class="projectbar">' +
          '<label>프로젝트명' +
            '<input id="cmProjectName" type="text" value="' + escapeHTML(project.projectName) + '" placeholder="' + DEFAULT_PROJECT_NAME + '">' +
          '</label>' +
        '</div>');

    const nameInput = document.getElementById('cmProjectName');
    if (nameInput) {
      nameInput.addEventListener('change', function () {
        saveProjectName(nameInput.value);
      });
    }

    const fileInput = document.getElementById('cmLoadFile');
    if (SESSION_NO) document.getElementById('cmLoadBtn').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () { importProject(fileInput.files[0]); });
    if (SESSION_NO) document.getElementById('cmSaveBtn').addEventListener('click', exportProject);
    if (SESSION_NO) document.getElementById('cmNewBtn').addEventListener('click', newProject);

    if (opts.side !== false && STEPS.some(function (x) { return x.key === activeKey; })) renderSideCard(activeKey, base);

    const headRow1 = document.getElementById('cmHeadRow1');
    const topBar = document.getElementById('cmTopBar');
    const topBarLinks = document.getElementById('cmTopBarLinks');
    function syncTopBarHeight() {
      const h = headRow1 ? headRow1.offsetHeight : (topBar.offsetHeight + (topBarLinks ? topBarLinks.offsetHeight : 0));
      document.documentElement.style.setProperty('--topbar-h', h + 'px');
    }
    syncTopBarHeight();
    window.addEventListener('resize', syncTopBarHeight);

    (function () {
      const btn = document.getElementById('cmMenuToggle');
      const menu = document.getElementById('cmTopBarLinks');
      if (!btn || !menu) return;
      function close() { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
      function open() { menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      btn.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.contains('open') ? close() : open(); });
      document.addEventListener('click', function (e) { if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    })();
    mountToTop();
    mountFooter(base, logoSrc);
  }

  // 모든 페이지 맨 아래: 로고 · 이용약관 · 개인정보처리방침 · 사업자정보
  function mountFooter(base, logoSrc) {
    const f = document.querySelector('body > footer');
    if (!f || f.dataset.cmFooter) return;
    f.dataset.cmFooter = '1';
    f.className = 'site-footer';
    f.innerHTML =
      '<img src="' + logoSrc + '" alt="COLOR.M">' +
      '<p class="legal-links"><a href="' + base + 'terms.html">이용약관</a> · <a href="' + base + 'privacy.html">개인정보처리방침</a></p>' +
      '<details class="biz-info"><summary>사업자정보</summary>' +
        '<p>상호명: 컬러엠 | 대표자: 유미란<br>사업자등록번호: 126-30-29572 | 통신판매업신고번호: 제2022-경기하남-2183호<br>주소: 경기도 하남시 미사강변동로72, 904호<br>전화: 0507-1312-4595 | 이메일: mlyoo71@naver.com</p></details>' +
      '<p>© 2026 COLOR.M · <a href="https://colorm.net" target="_blank" rel="noopener">colorm.net</a></p>';
  }

  // 긴 페이지에서 한 번에 맨 위로 올라가는 떠 있는 버튼 (조금 내려가면 나타나요)
  function mountToTop() {
    if (document.getElementById('cmToTop')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'cmToTop';
    b.className = 'to-top';
    b.setAttribute('aria-label', '맨 위로');
    b.innerHTML = '<span aria-hidden="true">↑</span><b>맨 위로</b>';
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(b);
    let ticking = false;
    function sync() { b.classList.toggle('show', window.scrollY > 500); ticking = false; }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    sync();
  }

  // ---------- 오른쪽 "내 그림책 카드" (넓은 화면에서만 보임) ----------
  function renderSideCard(activeKey, base) {
    const main = document.querySelector('main.wrap');
    if (!main || document.getElementById('cmSideCard')) return;
    const content = document.createElement('div');
    content.className = 'wrap-main';
    while (main.firstChild) content.appendChild(main.firstChild);
    main.appendChild(content);
    main.classList.add('with-side');
    document.body.classList.add('has-side');
    const aside = document.createElement('aside');
    aside.className = 'side-card';
    aside.id = 'cmSideCard';
    main.appendChild(aside);

    function draw() {
      if (aside.contains(document.activeElement)) return;
      const p = getProject(), st = stepStatus(p);
      const m = Object.assign({ color: '', colorName: '', colorLabel: '', emotions: [], emotionCustom: '', flowPreset: '' }, p.mind || {});
      const coverTitle = (p.cover && p.cover.title && p.cover.title !== '제목 미정') ? p.cover.title : '';
      const title = (p.bookTitle || coverTitle || (p.story && p.story.titles && p.story.titles[0]) || '').trim();
      const n = (p.story && p.story.sceneCount) || (p.storyboard && p.storyboard.scenes && p.storyboard.scenes.length) || 0;
      const castN = 1 + castLines(p).length;
      const art = ((p.character && p.character.artStyle) || '').replace(/\s*스타일$/, '');
      const meta = [n ? n + '장면' : '장면 수 미정', '캐릭터 ' + castN + '명', art ? (art.length > 14 ? art.slice(0, 14) + '…' : art) : '화풍 미정'].join(' · ');
      const emotions = m.emotions.concat([m.emotionCustom.trim()]).filter(Boolean).slice(0, 4);
      let flow = null;
      if (m.color && m.flowPreset && typeof ColorMMind !== 'undefined' && ColorMMind.flowColors) flow = ColorMMind.flowColors();
      const pal = (typeof ColorMMind !== 'undefined' && ColorMMind.paletteColors) ? ColorMMind.paletteColors() : null;
      const bars = [0, 1, 2, 3, 4].map(function (i) {
        return '<i style="background:' + (flow ? flow[i] : (m.color || '#E9E2DE')) + ';opacity:' + (flow || !m.color ? 1 : 0.35) + '"></i>';
      }).join('');
      const cur = sessionOf(activeKey);
      const steps = '<li class="side-session">' + (cur === 5 ? '마음색 그림책 특강' : cur + '회 메이커') + '</li>' + STEPS.filter(function (s) { return s.session === cur; }).map(function (s) {
        const on = s.key === activeKey;
        return '<li class="' + (st[s.key] ? 'done' : '') + (on ? ' on' : '') + '"><a href="' + base + s.path + '">' + (st[s.key] ? '✓ ' : '· ') + s.name + '</a></li>';
      }).join('');
      aside.innerHTML =
        '<p class="side-eyebrow">내 그림책 카드</p>' +
        '<div class="side-color"><i style="background:' + (m.color || '#F1ECE9') + '"></i><div><b>' + escapeHTML(m.colorLabel || m.colorName || '마음색을 골라보세요') + '</b><input class="side-name" type="text" value="' + escapeHTML(p.projectName || '') + '" aria-label="프로젝트명" placeholder="프로젝트명"></div></div>' +
        '<div class="side-title"><b>' + escapeHTML(title || '제목 미정') + '</b><small>' + escapeHTML(meta) + '</small></div>' +
        (emotions.length ? '<div class="side-tags">' + emotions.map(function (e) { return '<span>' + escapeHTML(e) + '</span>'; }).join('') + '</div>' : '') +
        (pal ? '<p class="side-label">책 전체 대표 색 · 메인 / 서브 / 포인트</p><div class="pal-bar" style="margin-bottom:10px">' + pal.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div>' : '') +
        '<p class="side-label">장면 색 흐름 · ' + escapeHTML(m.flowPreset || 'AI에게 맡기기') + '</p>' +
        '<div class="side-flow">' + bars + '</div>' +
        '<ul class="side-steps">' + steps + '</ul>';
    }
    draw();
    aside.addEventListener('change', function (e) {
      if (e.target.classList.contains('side-name')) {
        saveProjectName(e.target.value, true);
        e.target.value = getProject().projectName;
      }
    });
    let t = null;
    const later = function () { clearTimeout(t); t = setTimeout(draw, 350); };
    document.addEventListener('input', later);
    document.addEventListener('change', later);
    document.addEventListener('click', later);
    window.addEventListener('storage', later);
  }
  // ---------- 작성 중인 입력 자동 저장 / 복원 ----------
  // 단계를 옮겼다가 돌아와도 입력했던 내용이 그대로 보이게 합니다. (localStorage: colorm_class_sN_draft_<key>)
  function autoSaveForm(formId, draftKey, opts) {
    const form = document.getElementById(formId);
    if (!form) return null;
    opts = opts || {};
    const storageKey = DRAFT_PREFIX + draftKey;
    const SKIP = '.cm-quick,.cm-drop,.cm-other,.bridge-paste,[type=button],[type=submit],[type=file]';

    // id가 없는 필드는 장면 카드 번호 + class(03), 또는 체크박스 값(04)으로 구분합니다.
    function keyOf(el) {
      if (el.id) return el.id;
      const card = el.closest('[data-idx]');
      const cls = (el.className || '').trim().split(/\s+/)[0];
      if (card && card.dataset.idx != null && cls) return '__card' + card.dataset.idx + '_' + cls;
      if (el.type === 'checkbox' && el.value) return '__cb_' + el.value;
      return null;
    }
    function findByKey(key) {
      const byId = document.getElementById(key);
      if (byId) return byId;
      const m = /^__card(\d+)_(.+)$/.exec(key);
      if (m) {
        const card = form.querySelector('[data-idx="' + m[1] + '"]');
        return card ? card.querySelector('.' + m[2]) : null;
      }
      const m2 = /^__cb_(.+)$/.exec(key);
      if (m2) return form.querySelector('input[type="checkbox"][value="' + CSS.escape(m2[1]) + '"]');
      return null;
    }
    function fields() {
      return [].slice.call(form.querySelectorAll('input, textarea, select')).filter(function (el) {
        return keyOf(el) && !el.matches(SKIP);
      });
    }
    function collect() {
      const data = {};
      fields().forEach(function (el) { data[keyOf(el)] = (el.type === 'checkbox') ? el.checked : el.value; });
      return data;
    }
    function save() {
      try {
        const payload = { data: collect(), savedAt: Date.now() };
        if (opts.extra) payload.extra = opts.extra.collect();
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (e) {}
    }
    function restore() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (!saved || !saved.data) return false;
        if (opts.extra && saved.extra !== undefined) opts.extra.apply(saved.extra);
        let applied = false;
        Object.keys(saved.data).forEach(function (key) {
          const el = findByKey(key);
          if (!el || el.matches(SKIP)) return;
          if (el.type === 'checkbox') el.checked = !!saved.data[key];
          else el.value = saved.data[key];
          el.dispatchEvent(new Event('change', { bubbles: true }));
          applied = true;
        });
        return applied;
      } catch (e) { return false; }
    }
    function clear() { try { localStorage.removeItem(storageKey); } catch (e) {} }

    let timer = null, dirty = false;
    function schedule() { dirty = true; clearTimeout(timer); timer = setTimeout(function () { dirty = false; save(); }, 500); }
    function flush() { if (dirty) { clearTimeout(timer); dirty = false; save(); } }
    form.addEventListener('input', schedule);
    form.addEventListener('change', schedule);
    form.addEventListener('submit', function () { clearTimeout(timer); dirty = false; save(); }, true);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });

    const restored = restore();
    return { save: save, restore: restore, clear: clear, restored: restored };
  }

  // 이미 만든 결과를 되살릴 때 자동으로 화면이 아래로 스크롤되지 않게 합니다.
  function restoreSilently(fn) {
    const orig = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function () {};
    try { fn(); } finally { setTimeout(function () { Element.prototype.scrollIntoView = orig; }, 700); }
  }
  // ---------- 다른 단계 안내 ----------
  // 같은 회차 메이커 안의 단계면 링크, 다른 회차면 "1회 메이커의 …" 글자만 (메이커끼리는 서로 이동하지 않아요)
  function stepRef(key, label) {
    const s = stepFor(key);
    if (!s) return escapeHTML(label);
    const here = +document.documentElement.dataset.session || 0;
    return s.session === here
      ? '<a href="../' + s.path + '">' + label + '</a>'
      : '<b>' + s.session + '회 메이커의 ' + label + '</b>';
  }

  // ---------- 이전 / 다음 단계 버튼 ----------
  function renderStepNav(containerId, activeKey) {
    const root = document.getElementById(containerId);
    if (!root) return;
    const idx = STEPS.indexOf(stepFor(activeKey));
    const cur = STEPS[idx];
    const prev = STEPS[idx - 1];
    const next = STEPS[idx + 1];
    // 회차의 마지막 단계에서는 다음 단계 대신 "이번 회차 마무리" 화면으로 보냅니다. (다음 시간에 이어서)
    // 다른 회차 메이커로는 넘어가지 않아요. 회차의 첫 단계는 그 회차 처음 화면으로 돌아가요.
    const label = sessionLabel(cur.session);
    const nextSame = next && next.session === cur.session;
    // 다음 회차로 이어지는 건 4회 수업(1→2→3→4) 안에서만이에요. 4회와 특강은 마지막이 끝이에요.
    const nextSession = !nextSame && cur.session < 4 ? cur.session + 1 : 0;
    const prevHTML = prev && prev.session === cur.session
      ? '<a class="btn ghost" href="../' + prev.path + '">← 이전 단계 (' + prev.num + ' ' + prev.name + ')</a>'
      : '<a class="btn ghost" href="index.html">← ' + label + ' 처음 화면</a>';
    const nextHTML = nextSame
      ? '<a class="btn primary" href="../' + next.path + '">다음 단계 (' + next.num + ' ' + next.name + ') →</a>'
      : cur.session === 4
        ? '<a class="btn primary" href="summary.html">전체 결과 보기 →</a>'
        : '<a class="btn primary" href="index.html#wrapup">' + label + ' 마무리하기 ✓</a>';
    root.innerHTML = prevHTML + nextHTML;
    // 회차의 마지막 단계: 다음 회차에서 불러올 작업파일을 바로 저장할 수 있게 버튼을 붙여요
    if (nextSession && !document.getElementById('cmSessionSave')) {
      const box = document.createElement('div');
      box.id = 'cmSessionSave';
      box.className = 'session-save';
      box.innerHTML = '<div><b>💾 ' + label + ' 끝! 작업파일을 꼭 저장해요</b>' +
        '<small>다음 시간 ' + nextSession + '회 메이커 첫 화면에서 이 파일을 불러와야 오늘 작업이 이어져요.</small></div>' +
        '<button type="button" class="btn primary">' + nextSession + '회에 쓸 작업파일 저장</button>';
      box.querySelector('button').addEventListener('click', exportProject);
      root.parentNode.insertBefore(box, root);
    }
  }

  // ---------- 토스트 ----------
  function toast(msg) {
    let t = document.getElementById('cmToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cmToast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg || '복사되었습니다.';
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 1400);
  }

  // ---------- 텍스트 복사 (직접 문자열을 넘길 때) ----------
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(); });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast();
    }
  }

  // ---------- 결과 복사 (읽기 전용 div의 textContent, 또는 수정 가능한 input/textarea의 value) ----------
  function copyBox(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = ('value' in el) ? el.value : el.textContent;
    copyText(text);
  }

  // ---------- PDF 저장 ----------
  // 결과 영역을 A4 PDF 파일로 만들어 바로 내려받아요. (html2pdf.js를 처음 누를 때 불러와요)
  // 불러오지 못하면(인터넷 끊김 등) 브라우저 인쇄 창으로 대신 저장하게 안내해요.
  // resultsId: 'results' 또는 'results1,results2'처럼 여러 영역을 쉼표로 이어서 한 파일에 담을 수 있어요.
  const PDF_LIB_URL = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
  let pdfLibLoading = null;
  function loadPdfLib() {
    if (window.html2pdf) return Promise.resolve();
    if (!pdfLibLoading) {
      pdfLibLoading = new Promise(function (resolve, reject) {
        const s = document.createElement('script');
        s.src = PDF_LIB_URL;
        s.onload = function () { window.html2pdf ? resolve() : reject(); };
        s.onerror = function () { pdfLibLoading = null; reject(); };
        document.head.appendChild(s);
      });
    }
    return pdfLibLoading;
  }
  // 화면의 결과를 복사해 PDF용 종이 한 장(흰 배경)으로 만들어요. 버튼·숨긴 칸은 빼고, 입력칸은 적힌 글 그대로 넣어요.
  function buildPdfSheet(areas, heading) {
    const sheet = document.createElement('div');
    sheet.className = 'pdf-sheet';
    sheet.innerHTML = '<div class="pdf-head"><b>' + escapeHTML(heading) + '</b><span>COLOR.M 마음색 그림책</span></div>';
    areas.forEach(function (el) {
      const c = el.cloneNode(true);
      const src = el.querySelectorAll('textarea, input, select');
      c.querySelectorAll('textarea, input, select').forEach(function (f, i) {
        const s = src[i];
        if (s.type === 'hidden' || s.type === 'file') { f.remove(); return; }
        const d = document.createElement(s.type === 'checkbox' ? 'span' : 'div');
        d.className = s.type === 'checkbox' ? 'pdf-check' : 'pdf-field';
        d.textContent = s.type === 'checkbox' ? (s.checked ? '☑ ' : '☐ ') : (s.tagName === 'SELECT' ? (s.options[s.selectedIndex] || {}).text || '' : s.value);
        f.replaceWith(d);
      });
      c.querySelectorAll('button, .copy, .download-actions, .step-nav, .finish-card, .cm-hide, .hidden, [hidden], script, .note, .lang-en, .lang-en + .box').forEach(function (n) { n.remove(); });
      c.removeAttribute('id');
      c.classList.remove('hidden');
      sheet.appendChild(c);
    });
    return sheet;
  }
  function saveAsPDF(resultsId, titlePrefix) {
    const areas = String(resultsId || 'results').split(',').map(function (id) { return document.getElementById(id.trim()); })
      .filter(function (el) { return el && !el.classList.contains('hidden'); });
    if (!areas.length) {
      alert('먼저 결과를 만들어주세요.');
      return;
    }
    const project = getProject();
    const fileName = ('COLOR.M_' + (titlePrefix || '결과') + '_' + project.projectName).replace(/[\\/:*?"<>|]/g, '_');
    toast('PDF를 만들고 있어요…');
    loadPdfLib().then(function () {
      const sheet = buildPdfSheet(areas, (titlePrefix || '결과') + ' · ' + project.projectName);
      return window.html2pdf().set({
        margin: [12, 12, 14, 12],
        filename: fileName + '.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        // scrollX/Y 0: 페이지를 아래로 내린 채 눌러도 PDF가 밀려서 비지 않게 해요
        // windowWidth 1200: 폰·좁은 창에서 눌러도 모바일 화면 배치로 찍히지 않게 해요
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0, windowWidth: 1200 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.result', '.sr-sec', '.book-page', '.scene-block', '.copy-page', '.checklist li', 'h2', 'h3'] }
      }).from(sheet).save();
    }).then(function () {
      toast('PDF 파일을 저장했어요.');
    }).catch(function () {
      alert('PDF를 바로 만들지 못했어요. 인쇄 창이 열리면 「대상」을 「PDF로 저장」으로 골라 저장해 주세요.');
      printFallback(areas[0], fileName);
    });
  }
  // 예비 방법: 브라우저 인쇄 창 (id="results" 영역만 인쇄돼요)
  function printFallback(results, fileName) {
    const oldTitle = document.title;
    document.title = fileName;

    // 인쇄 시 textarea(수정 가능한 결과창)가 잘리지 않도록 내용 높이만큼 임시로 늘려줍니다.
    const areas = results.querySelectorAll('textarea');
    const prevHeights = [];
    areas.forEach(function (ta) { prevHeights.push(ta.style.height); ta.style.height = ta.scrollHeight + 'px'; });

    window.print();

    areas.forEach(function (ta, i) { ta.style.height = prevHeights[i]; });
    setTimeout(function () { document.title = oldTitle; }, 800);
  }

  // ---------- TXT 다운로드 ----------
  function downloadTXT(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/[\\/:*?"<>|]/g, '_');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- 드롭다운 선택 + 「기타 (직접 입력)」 ----------
  // 기존 input/textarea/select 요소의 id와 .value 동작을 그대로 유지하므로
  // 각 메이커의 읽기/쓰기 코드는 수정할 필요가 없습니다.
  const OTHER_VALUE = '__other__';

  function fireInputEvents(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  let dropSyncWired = false;
  function watchFormReset(el, syncFn) {
    if (!dropSyncWired) {
      dropSyncWired = true;
      const fire = function () { document.dispatchEvent(new CustomEvent('cm-drop-sync')); };
      window.addEventListener('load', fire);
      window.addEventListener('pageshow', fire);
    }
    if (el.form && !el.form.dataset.cmDropReset) {
      el.form.dataset.cmDropReset = '1';
      el.form.addEventListener('reset', function () {
        setTimeout(function () { document.dispatchEvent(new CustomEvent('cm-drop-sync')); }, 0);
      });
    }
    document.addEventListener('cm-drop-sync', syncFn);
  }

  // 글자 입력칸(input/textarea) 위에 선택 목록을 붙입니다. presets 항목은 '한국어' 또는 '한국어|English'.
  function dropOther(id, presets, opts) {
    const el = document.getElementById(id);
    if (!el || el.dataset.cmDrop) return;
    opts = opts || {};
    el.dataset.cmDrop = '1';
    const items = presets.map(function (p) {
      const i = p.indexOf('|');
      return i < 0 ? { kr: p, en: null } : { kr: p.slice(0, i).trim(), en: p.slice(i + 1).trim() };
    });
    if (typeof ColorMEN !== 'undefined' && ColorMEN.addPairs) {
      ColorMEN.addPairs(items.filter(function (it) { return it.en; }).map(function (it) { return [it.kr, it.en]; }));
    }
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    const sel = document.createElement('select');
    sel.className = 'cm-drop';
    sel.innerHTML = '<option value="">' + (opts.placeholder || '목록에서 선택하세요') + '</option>' +
      items.map(function (it) { return '<option>' + escapeHTML(it.kr) + '</option>'; }).join('') +
      '<option value="' + OTHER_VALUE + '">✏️ 기타 (직접 입력)</option>';
    el.parentNode.insertBefore(sel, el);

    let otherMode = false;
    function sync() {
      const v = desc.get.call(el);
      if (v === '') {
        sel.value = otherMode ? OTHER_VALUE : '';
      } else if (!otherMode && items.some(function (it) { return it.kr === v; })) {
        sel.value = v;
      } else {
        otherMode = true;
        sel.value = OTHER_VALUE;
      }
      el.hidden = sel.value !== OTHER_VALUE;
    }
    Object.defineProperty(el, 'value', {
      configurable: true,
      get: function () { return desc.get.call(el); },
      set: function (v) { desc.set.call(el, v == null ? '' : v); otherMode = false; sync(); }
    });
    sel.addEventListener('change', function () {
      if (sel.value === OTHER_VALUE) {
        otherMode = true;
        if (items.some(function (it) { return it.kr === desc.get.call(el); })) desc.set.call(el, '');
        el.hidden = false;
        el.focus();
      } else {
        otherMode = false;
        desc.set.call(el, sel.value);
        el.hidden = true;
      }
      fireInputEvents(el);
    });
    watchFormReset(el, function () { otherMode = false; sync(); });
    sync();
  }

  // 이미 선택 목록인 select에 「기타 (직접 입력)」 항목과 입력칸을 붙입니다.
  function selectOther(id, opts) {
    const sel = document.getElementById(id);
    if (!sel || sel.dataset.cmDrop) return;
    opts = opts || {};
    sel.dataset.cmDrop = '1';
    if (opts.replace) {
      [].slice.call(sel.options).forEach(function (o) { if (o.text === opts.replace) o.remove(); });
    }
    const otherOpt = document.createElement('option');
    otherOpt.value = OTHER_VALUE;
    otherOpt.textContent = '✏️ 기타 (직접 입력)';
    sel.appendChild(otherOpt);
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cm-other';
    input.placeholder = opts.placeholder || '직접 입력해주세요';
    input.hidden = true;
    sel.parentNode.insertBefore(input, sel.nextSibling);
    const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

    function isOther() { return sel.selectedIndex >= 0 && sel.options[sel.selectedIndex].value === OTHER_VALUE; }
    function sync() { input.hidden = !isOther(); }
    Object.defineProperty(sel, 'value', {
      configurable: true,
      get: function () { return isOther() ? input.value.trim() : desc.get.call(sel); },
      set: function (v) {
        v = v == null ? '' : String(v);
        desc.set.call(sel, v);
        const matched = sel.selectedIndex >= 0 && desc.get.call(sel) === v;
        if (!matched) {
          if (v === '') {
            sel.selectedIndex = 0;
          } else {
            otherOpt.selected = true;
            input.value = v;
          }
        }
        sync();
      }
    });
    sel.addEventListener('change', function () {
      sync();
      if (isOther()) input.focus();
    });
    watchFormReset(sel, sync);
    sync();
  }

  // spec: { id: [프리셋...] } → 입력칸, { id: true | {replace:'기타'} } → 기존 선택 목록
  function applyDrops(spec) {
    Object.keys(spec || {}).forEach(function (id) {
      const s = spec[id];
      if (Array.isArray(s)) dropOther(id, s);
      else selectOther(id, s === true ? {} : s);
    });
  }

  return {
    dropOther: dropOther,
    selectOther: selectOther,
    applyDrops: applyDrops,
    STEPS: STEPS,
    stepFor: stepFor,
    sessionLabel: sessionLabel,
    SESSIONS: SESSIONS,
    sessionOf: sessionOf,
    STORAGE_KEY: STORAGE_KEY,
    BRIDGE_PREFIX: BRIDGE_PREFIX,
    SESSION_NO: SESSION_NO,
    DEFAULT_PROJECT_NAME: DEFAULT_PROJECT_NAME,
    emptyProject: emptyProject,
    getProject: getProject,
    saveStep: saveStep,
    saveProjectName: saveProjectName,
    setBookTitle: setBookTitle,
    clearAll: clearAll,
    exportProject: exportProject,
    importProject: importProject,
    newProject: newProject,
    storage: storage,
    josa: josa,
    stepStatus: stepStatus,
    heroName: heroName,
    autoSaveForm: autoSaveForm,
    restoreSilently: restoreSilently,
    deriveCharacters: deriveCharacters,
    guessCastRole: guessCastRole,
    castLines: castLines,
    castBlock: castBlock,
    renderHeader: renderHeader,
    renderStepNav: renderStepNav,
    stepRef: stepRef,
    toast: toast,
    copyText: copyText,
    copyBox: copyBox,
    saveAsPDF: saveAsPDF,
    downloadTXT: downloadTXT,
    escapeHTML: escapeHTML
  };
})();
