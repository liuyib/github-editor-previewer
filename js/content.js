const uid = {
  className: 'gh-editor-previewer-',
  previewer: 'gh-editor-trigger-previewer',
};

// 页面跳转完成（由于 GitHub 使用了 pjax 技术，因此只能这样监听页面跳转）
document.addEventListener('turbo:load', function () {
  try {
    start();
  } catch (error) {
    console.error(`gh-editor-previewer-error: `, error);
  }
});

function start() {
  addPreviewTriggerBtn();

  const editor = document.querySelector('.js-code-textarea');

  if (!editor) return;

  editor.addEventListener('change', window.debounce(triggerPreview, 300));
}

let scrollY = 0;

function getScrollY(element) {
  const doc = element ? element : document.documentElement;
  const top =
    (element ? doc.scrollTop : window.pageYOffset || doc.scrollTop) -
    (doc.clientTop || 0);

  return top;
}

function updateScrollY() {
  scrollY = getScrollY();
  window.addEventListener('scroll', keepScroll);
}

function keepScroll() {
  window.scrollTo(0, scrollY);
  window.removeEventListener('scroll', keepScroll);
}

function triggerPreview() {
  const editorBtn = document.querySelector('.container-preview button.code');
  const previewBtn = document.querySelector(
    '.container-preview button.preview',
  );

  if (!editorBtn || !previewBtn) return;

  updateScrollY();
  editorBtn.click();
  previewBtn.click();
}

function addPreviewTriggerBtn() {
  const navBar = document.querySelector(
    '.container-preview div.js-file-editor-nav',
  );
  const previewerTriggerBtn = document.querySelector(`#${uid.previewer}`);

  if (!navBar || previewerTriggerBtn) return;

  const btn = document.createElement('div');

  btn.innerText = '预览';
  btn.setAttribute('id', uid.previewer);
  btn.classList.add(`${uid.className}trigger`);
  btn.addEventListener('click', function (e) {
    e.stopPropagation();

    updateScrollY();
    layout();
    addEditorTriggerBtn();
    syncEditorPreviewerScroll();
  });
  navBar.appendChild(btn);
}

function addEditorTriggerBtn() {
  const navBar = document.querySelector(
    '.container-preview div.js-file-editor-nav',
  );
  const editorTriggerBtn = document.querySelector(`#${uid.editor}`);

  if (!navBar || editorTriggerBtn) return;

  const btn = document.createElement('div');

  btn.innerText = '编辑';
  btn.setAttribute('id', uid.editor);
  btn.classList.add(`${uid.className}trigger`);
  btn.addEventListener('click', function (e) {
    e.stopPropagation();

    layoutReset();
  });
  navBar.appendChild(btn);
}

function layout() {
  const previewBtn = document.querySelector(
    '.container-preview button.preview',
  );

  if (!previewBtn) return;

  // 触发 GitHub 的预览按钮
  previewBtn.click();

  const editor = document.querySelector('.container-preview div.commit-create');
  const preview = document.querySelector(
    '.container-preview div.commit-preview',
  );

  if (!editor || !preview) return;

  // 添加新样式
  editor.classList.add(`${uid.className}editor`);
  preview.classList.add(`${uid.className}previewer`);

  const editorWrap = document.querySelector(
    '.container-preview div.CodeMirror',
  );

  if (!editorWrap) return;

  const editorHeight = editorWrap.getBoundingClientRect().height;

  // 预览框和编辑框保持同高度
  if (editorHeight) {
    preview.style.height = editorHeight + 'px';
  }
}

function layoutReset() {
  const editorBtn = document.querySelector('.container-preview button.code');

  if (!editorBtn) return;

  // 触发 GitHub 的编辑按钮
  editorBtn.click();

  const editor = document.querySelector('.container-preview div.commit-create');
  const preview = document.querySelector(
    '.container-preview div.commit-preview',
  );

  if (!editor || !preview) return;

  // 删除新样式
  editor.classList.remove(`${uid.className}editor`);
  preview.classList.remove(`${uid.className}previewer`);
  preview.style.height = 'auto';
}

function syncEditorPreviewerScroll() {
  const editorScrollbar = document.querySelector('.CodeMirror-vscrollbar');
  const previewer = document.querySelector('.js-commit-preview');

  const ob = new IntersectionObserver(function () {
    const editorContent = document.querySelector('.CodeMirror-sizer');
    const previewerContent = document.querySelector('#readme');

    if (!editorScrollbar || !previewer || !editorContent || !previewerContent)
      return;

    const eTotalH = editorContent.getBoundingClientRect().height;
    const pTotalH = previewerContent.getBoundingClientRect().height;

    function scrollEditor() {
      const pScrollY = getScrollY(previewer);

      const pScrollScale = pScrollY / pTotalH;
      const eShouldScroll = pScrollScale * eTotalH;

      editorScrollbar.scrollTo(0, eShouldScroll);
    }
    function scrollPreviewer() {
      const eScrollY = getScrollY(editorScrollbar);

      const eScrollScale = eScrollY / eTotalH;
      const pShouldScroll = eScrollScale * pTotalH;

      previewer.scrollTo(0, pShouldScroll);
    }

    editorScrollbar.addEventListener(
      'scroll',
      window.debounce(scrollPreviewer, 300),
    );
    previewer.addEventListener('scroll', window.debounce(scrollEditor, 300));
  });

  ob.observe(previewer);
}
