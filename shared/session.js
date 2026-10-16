/* ===================================================================
   COLOR.M 마음색 그림책 교실 — 회차 안내 화면 (maker-1 ~ maker-4/index.html 공용)
   사용법: <main class="wrap" id="sessionHub" data-session="1"></main>
          <script src="../shared/colorm.js"></script><script src="../shared/session.js"></script>
   =================================================================== */
const ColorMSession = (function () {
  const esc = function (s) { return ColorM.escapeHTML(s); };

  // 회차별 안내 문구: 목표 · 준비물 · 단계 설명 · 마무리 체크 · 다음 시간 예고
  const INFO = {
    1: {
      goal: '내 마음의 색을 고르고, 어떤 이야기를 쓸지 정한 뒤 장면마다 글과 대화를 정리해요.',
      bring: ['떠오르는 이야기 아이디어 (없어도 괜찮아요)', 'ChatGPT를 쓸 수 있는 계정 (선택)'],
      steps: {
        plan: '마음색을 고르고, 주제·주인공·문제·전하고 싶은 말을 정해요.',
        story: '기획을 바탕으로 이야기의 줄거리 뼈대를 만들어요.',
        storyboard: '장면마다 등장인물·내용·대화·그림 구성을 정리해요.'
      },
      wrap: ['마음색과 기획을 정했어요', '이야기 줄거리를 만들었어요', '장면마다 본문 글과 대화를 채웠어요'],
      next: '2회에는 주인공 캐릭터를 그리고, 장면 그림을 만들어요.'
    },
    2: {
      goal: '주인공의 모습을 정해 기준 캐릭터 그림을 만들고, 장면마다 그림을 만들어요.',
      bring: ['그림을 만들 AI 도구 계정 (ChatGPT · 캔바 등)', '만든 그림을 모아 둘 폴더'],
      steps: {
        character: '주인공(과 함께 나오는 캐릭터)의 모습을 정하고, 그림 요청문을 만들어요.',
        scene: '장면마다 그릴 그림의 요청문을 만들어요. 캔바는 전체를 한 번에 넣을 수 있어요.'
      },
      wrap: ['마음에 드는 기준 캐릭터 그림을 저장했어요', '장면 그림을 만들어 폴더에 모았어요', '그림 파일 이름을 장면 순서대로 정리했어요'],
      next: '3회에는 그림과 글을 그림책 한 권으로 정리하고, 캔바에서 페이지를 편집해요.'
    },
    3: {
      goal: '페이지 순서와 글을 다듬고, 고칠 그림은 다시 만들고, 캔바에서 그림책 페이지를 완성해요.',
      bring: ['2회에 만든 장면 그림 파일', '캔바 계정'],
      steps: {
        edit: '페이지 순서 확인 · 글 다듬기 · 그림 확인, 고칠 그림의 수정 요청문 만들기',
        canva: '캔바에 그림을 올리고 페이지마다 글과 말풍선을 넣어요.'
      },
      wrap: ['페이지 순서와 글을 확정했어요', '고칠 그림을 다시 만들었어요', '캔바에 본문 페이지를 완성하고 링크를 적어 뒀어요'],
      next: '4회에는 책 제목과 표지를 만들고, 출판 정보를 정리해요.'
    },
    4: {
      goal: '책 제목과 표지를 만들고, 작가와에 전자책으로 출판할 정보를 정리해 그림책을 완성해요.',
      bring: ['3회에 만든 캔바 디자인 링크', '작가와 회원 가입 (jakkawa.com)', '저자명으로 쓸 필명'],
      steps: {
        cover: '책 제목을 정하고, 표지 그림의 요청문을 만들어요.',
        publish: '작가와에 전자책으로 등록할 정보(책 소개·저자 소개·목차·판권면)를 정리해요.'
      },
      wrap: ['표지를 JPG로, 본문을 PDF로 내려받았어요', '작가와에 책 정보를 넣고 파일을 올렸어요', '유통 신청까지 마치고 신청 메일을 받았어요'],
      next: ''
    },
    5: {
      goal: '2시간 동안 마음색에서 출발해 5~6장면 그림책 한 권을 만들어요. 표지와 작가의 말까지 넣어 캔바로 완성해요.',
      bring: ['ChatGPT 계정', '캔바 계정', '만든 그림을 모아 둘 폴더'],
      steps: {
        plan: '마음색을 고르고, 주인공·원하는 것·문제·전하고 싶은 말을 정해요. (15분)',
        storyboard: '장면 수(5·6)를 고르고, ChatGPT로 책에 실릴 글을 한 번에 받아요. (25분)',
        character: '주인공 그림과 캐릭터 시트를 만들어요. (25분)',
        scene: '캔바에 전체를 한 번에 넣어 그림과 글을 만들어요. (35분)',
        cover: '책 제목을 정하고 표지 그림을 만들어요. (10분)',
        author: '책 맨 뒤에 넣을 작가의 말을 써요. (10분)'
      },
      wrap: ['캔바에 표지 · 본문 · 작가의 말 페이지를 넣었어요', '그림책을 PDF로 내려받았어요', '작업파일(.json)을 저장했어요'],
      next: ''
    }
  };

  function mount() {
    const root = document.getElementById('sessionHub');
    if (!root) return;
    const no = +root.dataset.session;
    const se = ColorM.SESSIONS[no - 1], info = INFO[no];
    ColorM.renderHeader('cmHeader', null, { session: no });
    const steps = ColorM.STEPS.filter(function (s) { return s.session === no; });
    const status = ColorM.stepStatus();
    const done = steps.filter(function (s) { return status[s.key]; }).length;
    const next = steps.find(function (s) { return !status[s.key]; });
    const L = ColorM.sessionLabel(no), single = !!se.single;
    // 특강은 혼자 끝나는 메이커라 지난 회차가 없어요
    const prevSteps = single ? [] : ColorM.STEPS.filter(function (s) { return s.session < no; });
    const prevMissing = prevSteps.filter(function (s) { return !status[s.key]; });
    const checks = (ColorM.getProject().wrapChecks || {})[no] || {};

    document.title = se.title || (se.name + ' — 마음색 그림책 ' + no + '회 메이커');
    root.innerHTML =
      '<header class="hero">' + (single ? '' : '<p class="eyebrow">' + no + '회차 메이커</p>') + '<h1><b>' + esc(single ? '마음색 그림책 특강' : se.name) + '</b></h1><p class="sub">' + esc(info.goal) + '</p></header>' +
      loadCard(no, prevSteps, prevMissing) +
      '<section class="card"><div class="step"><span>오늘 할 일</span><h2>' + steps.length + '단계로 진행해요</h2></div>' +
        '<nav class="makers">' + steps.map(function (s) {
          return '<a class="maker-card' + (status[s.key] ? ' is-done' : '') + '" href="../' + s.path + '"><span class="badge">완료 ✓</span><span class="num">' + s.num + '</span><h3>' + esc(s.name) + '</h3><p>' + esc(info.steps[s.key] || '') + '</p></a>';
        }).join('') + '</nav>' +
        '<div class="how-start"><a class="btn primary big" href="../' + (next || steps[0]).path + '">' +
          (done === 0 ? '✨ 시작하기 → ' : next ? '이어서 하기 → ' : '다시 보기 → ') + esc((next || steps[0]).num + ' ' + (next || steps[0]).name) + '</a>' +
          '<span class="help">' + (next ? done + ' / ' + steps.length + '단계 완료 · 중간에 멈춰도 이 메이커에 자동으로 저장돼요.' : '이번 회차 단계를 모두 마쳤어요!') + '</span></div>' +
      '</section>' +
      '<section class="card"><div class="step"><span>준비물</span><h2>이번 시간에 필요한 것</h2></div><ul class="help hub-list">' +
        info.bring.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></section>' +
      '<section class="card" id="results"><div class="step"><span>결과</span><h2>' + (single ? '오늘' : L + '에') + ' 만든 것</h2></div>' +
        '<p class="help">이번 회차에서 만든 내용을 모았어요. 아래 마무리에서 PDF·TXT로 저장하거나 한 번에 복사할 수 있어요.</p>' +
        resultsHTML(no) + '</section>' +
      '<section class="card" id="wrapup"><div class="step"><span>마무리</span><h2>' + L + ' 마무리 체크</h2></div>' +
        '<ul class="wrap-checks">' + info.wrap.map(function (w, i) {
          return '<li><label><input type="checkbox" data-i="' + i + '"' + (checks[i] ? ' checked' : '') + '> ' + esc(w) + '</label></li>';
        }).join('') + '</ul>' +
        '<h3 class="finish-title" style="margin-top:18px">저장하기</h3>' +
        '<div class="finish-btns"><button type="button" class="btn primary big" data-act="save">💾 ' + (no < 4 ? (no + 1) + '회에 쓸 작업파일(.json) 저장' : '완성한 작업파일(.json) 저장') + '</button></div>' +
        '<div class="finish-btns">' +
          '<button type="button" class="btn soft" data-act="pdf">📕 ' + L + ' 결과 PDF</button>' +
          '<button type="button" class="btn soft" data-act="txt">📝 ' + L + ' 결과 TXT</button>' +
          '<button type="button" class="btn soft" data-act="copy">📋 ' + L + ' 결과 전체 복사</button>' +
          (no === 4 ? '<a class="btn soft" href="summary.html">📚 그림책 전체 결과 (PDF·TXT)</a>' : '') +
        '</div>' +
        '<p class="help">· <b>작업파일(.json)</b>: 다음 메이커에서 불러와 이어서 만들 때 써요. · <b>PDF</b>: 출력·제출용 · <b>TXT</b>: 글만 모은 파일 · <b>전체 복사</b>: 메모장·한글·구글 문서 등에 붙여넣기</p>' +
        (no < 4
          ? '<p class="help"><b>꼭 저장해 주세요!</b> 메이커마다 저장이 따로라서, 다음 시간 <b>' + (no + 1) + '회 메이커</b>에서는 이 작업파일(.json)을 <b>불러오기</b>해야 오늘 작업이 이어져요. 받은 파일은 USB·메일·클라우드 등 잃어버리지 않을 곳에 보관해요.</p>'
          : '<p class="help">작업파일(.json)을 보관해 두면 나중에 이 메이커에서 <b>불러오기</b>로 다시 고칠 수 있어요.</p>') +
        '<p class="help">학교·도서관 같은 <b>공용 컴퓨터</b>라면 작업파일을 저장한 뒤 메뉴의 <b>「처음부터 다시 만들기」</b>로 지워 주세요.</p>' +
        (info.next ? '<div class="note"><b>다음 시간 예고</b><br>' + esc(info.next) + ' 다음 시간에는 <b>' + (no + 1) + '회 메이커</b>를 열어요.</div>'
          : '<div class="note"><b>🎉 그림책 완성을 축하해요!</b><br>' + (single ? '오늘 그림책 한 권을 완성했어요. 캔바에서 표지·본문·작가의 말까지 넘겨 보고 PDF로 저장해요. 위 저장하기에서 오늘 만든 글도 PDF·TXT로 저장할 수 있어요.' : '4회 수업을 모두 마쳤어요. 전체 결과에서 PDF·TXT로 한 번에 저장할 수 있어요.') + '</div>') +
      '</section>';

    // 그림책이 완성되는 4회와 특강만: 마무리 끝에 갤러리 자랑하기
    if ((no === 4 || single) && typeof ColorMGallery !== 'undefined') ColorMGallery.mount(document.getElementById('wrapup'), 'inside');
    root.addEventListener('change', function (e) {
      if (e.target.dataset.i == null) return;
      const p = ColorM.getProject();
      const all = p.wrapChecks || {};
      all[no] = Object.assign({}, all[no]);
      all[no][e.target.dataset.i] = e.target.checked;
      ColorM.saveStep('wrapChecks', all);
    });
    root.addEventListener('click', function (e) {
      const act = (e.target.closest('[data-act]') || {}).dataset;
      if (!act) return;
      if (act.act === 'save') ColorM.exportProject();
      else if (act.act === 'pdf') ColorM.saveAsPDF('results', ColorM.sessionLabel(no) + '결과');
      else if (act.act === 'txt') ColorM.downloadTXT('COLOR.M_' + ColorM.getProject().projectName + '_' + ColorM.sessionLabel(no) + '결과.txt', resultsText(no));
      else if (act.act === 'copy') ColorM.copyText(resultsText(no));
      // 헤더 메뉴의 「불러오기」와 같은 파일 선택창을 열어요.
      if (e.target.closest('[data-act="load"]')) document.getElementById('cmLoadFile').click();
    });
  }

  // ---------- 이번 회차 결과 (화면 보기 · PDF · TXT · 전체 복사가 모두 이 내용을 써요) ----------
  const pad = function (n) { return String(n).padStart(2, '0'); };
  function results(no) {
    const p = ColorM.getProject(), st = ColorM.stepStatus(p), out = [];
    const add = function (key, title, items) {
      items = items.filter(function (it) { return it[1] && String(it[1]).trim(); });
      out.push({ key: key, title: title, items: st[key] ? items : [] });
    };
    if (no === 1) {
      const mind = (typeof ColorMMind !== 'undefined') ? ColorMMind.summaryLines() : [];
      const pl = p.plan || {}, s = p.story || {}, sb = p.storyboard || {};
      add('plan', '01 기획', [['마음색', mind.join('\n')], ['한 줄 기획', pl.oneLine], ['그림책 기획서', pl.planSheet]]);
      add('story', '02 이야기', [['제목 후보', (s.titles || []).join(' / ')], ['줄거리', s.summary]]);
      add('storyboard', '03 스토리보드', [['장면 요약', sb.sceneSummary], ['그림책 문장 모음', sb.bookManuscript]]);
    } else if (no === 2) {
      const c = p.character || {};
      add('character', '04 캐릭터', [['한 줄 캐릭터', c.oneLine], ['캐릭터 고정 정보', c.fixedInfo], ['캐릭터 그림 요청문', c.sheetPrompt || c.basePrompt]]);
      add('scene', '05 장면', (p.scenes || []).map(function (sc, i) {
        return sc ? ['장면 ' + pad(sc.no || i + 1), [sc.sceneDesc, sc.scenePrompt].filter(Boolean).join('\n\n')] : ['', ''];
      }));
    } else if (no === 3) {
      const e = p.edit || {}, cv = p.canva || {};
      add('edit', '편집 1 그림책 정리', [['최종 원고', (e.pages || []).map(function (pg, i) {
        return ['[페이지 ' + pad(i + 1) + '] ' + pg.title, (pg.text || '').trim() || '(본문 글 미작성)'].concat((pg.dialogue || '').trim() ? [pg.dialogue.trim()] : []).join('\n');
      }).join('\n\n')]]);
      add('canva', '편집 2 캔바 편집', [['캔바 디자인 링크', cv.link], ['진행', Object.keys(cv.checks || {}).filter(function (k) { return cv.checks[k]; }).length + '단계 완료 표시']]);
    } else if (no === 5) {
      const pl = p.plan || {}, sb = p.storyboard || {}, c = p.character || {}, cv = p.cover || {}, au = p.author || {};
      const mind = (typeof ColorMMind !== 'undefined') ? ColorMMind.summaryLines() : [];
      add('plan', '01 기획', [['마음색', mind.join('\n')], ['한 줄 기획', pl.oneLine]]);
      add('storyboard', '02 이야기', [['그림책 문장 모음', sb.bookManuscript]]);
      add('character', '03 캐릭터', [['캐릭터 그림 요청문', c.basePrompt], ['캐릭터 시트 요청문', c.sheetPrompt]]);
      add('scene', '04 그림책', [['장면 수', ((sb.scenes || []).length || '') + (sb.scenes ? '장면' : '')]]);
      add('cover', '05 표지', [['책 제목', cv.title], ['표지 그림 요청문', cv.coverPrompt]]);
      add('author', '06 작가의 말', [['작가의 말', au.text]]);
    } else {
      const cv = p.cover || {}, o = (p.publish && p.publish.outputs) || {};
      add('cover', '06 표지', [['책 제목', cv.title], ['표지 그림 요청문', cv.coverPrompt]]);
      add('publish', '07 작가와 출판 정보', [['작가와 등록 입력표', o.form || o.bib], ['판권면', o.colophon], ['작가의 말', o.author]]);
    }
    return out;
  }
  function resultsHTML(no) {
    return results(no).map(function (sec) {
      return '<div class="sr-sec"><h3>' + esc(sec.title) + '</h3>' + (sec.items.length
        ? sec.items.map(function (it) { return '<p class="sr-label">' + esc(it[0]) + '</p><div class="box2 sr-box">' + esc(it[1]) + '</div>'; }).join('')
        : '<p class="help">아직 완료하지 않았어요.</p>') + '</div>';
    }).join('');
  }
  function resultsText(no) {
    const p = ColorM.getProject();
    return [(ColorM.SESSIONS[no - 1].title || 'COLOR.M 마음색 그림책 ' + no + '회 메이커') + ' — ' + ColorM.SESSIONS[no - 1].name, '프로젝트명: ' + p.projectName, '================================', ''].concat(
      results(no).map(function (sec) {
        return '[' + sec.title + ']\n' + (sec.items.length ? sec.items.map(function (it) { return '· ' + it[0] + '\n' + it[1]; }).join('\n\n') : '아직 완료하지 않았어요.');
      }).join('\n\n')).join('\n');
  }

  // 지난 시간에 빠진 학생용: 지난 회차 메이커로 가는 버튼 (앞 회차로 가는 버튼은 두지 않아요)
  function prevMakers(no) {
    return '<div class="prev-makers"><p><b>지난 시간에 못 왔나요?</b> 지난 회차 메이커에서 먼저 만들고, 마무리 때 작업파일을 저장해 와요.</p><div class="prev-btns">' +
      ColorM.SESSIONS.filter(function (se) { return se.no < no; }).map(function (se) {
        return '<a class="btn ghost" data-s="' + se.no + '" href="../' + se.path + '/index.html">← ' + se.no + '회 메이커 · ' + esc(se.short) + '</a>';
      }).join('') + '</div></div>';
  }

  // 2~4회: 지난 회차 작업파일 불러오기 (메이커마다 저장이 따로라 이게 첫 단계예요)
  function loadCard(no, prevSteps, prevMissing) {
    if (no === 1 || ColorM.SESSIONS[no - 1].single) return ''; // 1회와 특강은 불러올 지난 회차가 없어요
    const loaded = prevMissing.length < prevSteps.length;
    const name = ColorM.getProject().projectName;
    if (loaded) {
      return '<div class="note load-ok"><b>✓ 지난 작업을 불러왔어요</b> — 「' + esc(name) + '」' +
        (prevMissing.length ? '<br>아직 비어 있는 단계: ' + prevMissing.map(function (s) { return s.session + '회 ' + s.num + ' ' + s.name; }).join(' · ') +
          ' (그 회차 메이커에서 마친 뒤 다시 저장한 파일이면 채워져요)' : '') +
        ' <button type="button" class="btn ghost" data-act="load" style="margin-left:6px;padding:6px 12px;font-size:13px">다른 파일 불러오기</button>' +
        (prevMissing.length ? prevMakers(no) : '') + '</div>';
    }
    return '<section class="card load-card"><div class="step"><span>먼저 할 일</span><h2>' + (no - 1) + '회 작업파일 불러오기</h2></div>' +
      '<p class="help">메이커마다 저장이 따로라서, 지난 시간 마무리 때 저장한 <b>작업파일(.json)</b>을 불러와야 이야기·캐릭터 등이 이어져요. 파일 이름은 보통 <b>COLOR.M_프로젝트명_' + (no - 1) + '회.json</b>이에요.</p>' +
      '<button type="button" class="btn primary big" data-act="load">📂 작업파일 불러오기</button>' +
      '<p class="help">작업파일이 없다면 선생님께 알려 주세요. 불러오지 않고 시작하면 지난 내용 없이 새로 만들게 돼요.</p>' +
      prevMakers(no) + '</section>';
  }

  return { mount: mount, INFO: INFO };
})();
ColorMSession.mount();
