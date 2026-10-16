/* ===================================================================
   COLOR.M 마음색 그림책 교실 — 마무리 카드
   · 프로젝트 저장 · 불러오기 (PDF / TXT / 작업파일 .json / 전체 내용 복사 / 처음부터 다시)
   =================================================================== */
const ColorMFinish = (function () {
  const esc = function (s) { return ColorM.escapeHTML(s); };

  // opts: { pdf: function, txt: function, copyAll: function() → string, pdfLabel }
  function mount(anchor, opts, where) {
    if (!anchor || !anchor.parentNode) return;
    opts = opts || {};
    const sec = document.createElement('section');
    sec.className = 'card finish-card';
    sec.innerHTML =
      '<h3 class="finish-title">프로젝트 저장 · 불러오기</h3>' +
      '<p class="help">작업파일을 저장하면 다음에 다시 불러와서 이어서 수정할 수 있어요.</p>' +
      '<div class="finish-btns">' +
        '<button type="button" class="btn primary" data-act="pdf">📕 ' + esc(opts.pdfLabel || '그림책 PDF 저장') + '</button>' +
        '<button type="button" class="btn soft" data-act="txt">📝 TXT 저장</button>' +
        '<button type="button" class="btn soft" data-act="save">💾 작업파일 저장</button>' +
        '<button type="button" class="btn soft" data-act="load">📂 작업파일 불러오기</button>' +
        '<button type="button" class="btn soft" data-act="copy">📋 전체 내용 복사</button>' +
        '<button type="button" class="btn ghost finish-reset" data-act="reset">🔄 처음부터 다시 만들기</button>' +
        '<input type="file" accept=".json,application/json" hidden data-role="file">' +
      '</div>' +
      '<p class="help">※ PDF는 제출·출력용이에요. 다시 수정하려면 「작업파일(.json)」을 저장해 주세요.</p>' +
      '<p class="help">💾 입력한 내용은 서버로 보내지 않고 <b>이 브라우저에만 저장</b>돼요. 다른 기기에서 이어서 하려면 「작업파일 저장」을 쓰고, 학교·도서관 같은 공용 컴퓨터에서는 마친 뒤 「처음부터 다시 만들기」로 지워 주세요.</p>';
    if (where === 'after') anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    else anchor.parentNode.insertBefore(sec, anchor);

    const q = function (r) { return sec.querySelector('[data-role="' + r + '"]'); };
    sec.addEventListener('click', function (e) {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'pdf') { if (opts.pdf) opts.pdf(); }
      else if (a === 'txt') { if (opts.txt) opts.txt(); }
      else if (a === 'save') ColorM.exportProject();
      else if (a === 'load') q('file').click();
      else if (a === 'copy') { if (opts.copyAll) ColorM.copyText(opts.copyAll()); }
      else if (a === 'reset') ColorM.newProject();
    });
    q('file').addEventListener('change', function () { ColorM.importProject(this.files[0]); });
  }

  return { mount: mount };
})();
