const ALLOWED_TAGS = new Set([
  "P", "BR", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE",
  "STRONG", "B", "EM", "I", "U", "S", "DEL", "A", "IMG", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
  "HR", "SPAN", "DIV", "INPUT", "LABEL",
]);
const ALLOWED_ATTRIBUTES = new Set(["href", "src", "alt", "type", "checked", "disabled"]);

const translationsBySource = new Map();

const toggleButton = document.createElement("button");
toggleButton.id = "lt-toggle";
toggleButton.textContent = "译";
toggleButton.title = "翻译成中文";

const overlay = document.createElement("div");
overlay.id = "lt-overlay";
overlay.hidden = true;
overlay.innerHTML = `
  <div id="lt-dialog" role="dialog" aria-label="中文翻译">
    <button id="lt-close" title="关闭 (Esc)">×</button>
    <div id="lt-content"></div>
  </div>`;
document.body.appendChild(overlay);
const content = overlay.querySelector("#lt-content");

function closeOverlay() {
  overlay.hidden = true;
}

overlay.querySelector("#lt-close").onclick = closeOverlay;
overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closeOverlay();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) closeOverlay();
});

// Keeps only whitelisted tags and attributes, so page HTML and model output render as plain rich text.
function sanitize(root) {
  for (const element of [...root.querySelectorAll("*")]) {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      continue;
    }
    for (const attribute of [...element.attributes]) {
      const isAllowed = ALLOWED_ATTRIBUTES.has(attribute.name)
        && !/^\s*javascript:/i.test(attribute.value);
      if (!isAllowed) element.removeAttribute(attribute.name);
    }
    if (element.tagName === "A") element.target = "_blank";
  }
  return root;
}

// Linear class names are hashed, so find the title and every rich-text editor instead.
function findTitle() {
  return document.querySelector('[aria-label="Issue title"]') ?? document.querySelector("main h1");
}

function findTranslatableElements() {
  const title = findTitle();
  const editors = [...document.querySelectorAll("main .ProseMirror")]
    .filter((editor) => !title || !(editor.contains(title) || title.contains(editor)));
  return [title, ...editors].filter((element) => element?.innerText.trim());
}

function translate(sourceHtml) {
  if (!translationsBySource.has(sourceHtml)) {
    const request = browser.runtime.sendMessage({ type: "translate", text: sourceHtml });
    translationsBySource.set(sourceHtml, request);
    request.catch(() => translationsBySource.delete(sourceHtml));
  }
  return translationsBySource.get(sourceHtml);
}

function renderSection(section, translatedHtml, isTitle) {
  const parsed = new DOMParser().parseFromString(translatedHtml, "text/html").body;
  const target = isTitle ? document.createElement("h1") : section;
  target.replaceChildren(...sanitize(parsed).childNodes);
  if (isTitle) section.replaceChildren(target);
}

async function showTranslation() {
  const title = findTitle();
  const elements = findTranslatableElements();
  content.replaceChildren();
  overlay.hidden = false;
  toggleButton.disabled = true;

  await Promise.all(elements.map(async (element) => {
    const section = document.createElement("section");
    section.textContent = "翻译中…";
    content.appendChild(section);
    const sourceHtml = element === title
      ? element.innerText
      : sanitize(element.cloneNode(true)).innerHTML;
    try {
      renderSection(section, await translate(sourceHtml), element === title);
    } catch (error) {
      section.textContent = `翻译失败：${error.message}`;
    }
  }));
  toggleButton.disabled = false;
}

toggleButton.onclick = showTranslation;

// Floated right and placed just before the title, so it sits on the title's line.
function attachButtonToTitle() {
  const title = findTitle();
  if (!title) {
    toggleButton.remove();
    return;
  }
  if (toggleButton.nextElementSibling !== title) title.before(toggleButton);
}

let lastUrl = location.href;
setInterval(() => {
  attachButtonToTitle();
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  closeOverlay();
}, 500);
