function getElementType(target) {
  if (target.tagName === 'IMG') return `image (${target.alt || target.src})`;
  if (target.tagName === 'A') return `link (${target.textContent.trim() || target.href})`;
  if (target.tagName === 'P') return `text (${target.textContent.trim().slice(0, 30)}...)`;
  if (target.tagName === 'BUTTON') return `button (${target.textContent.trim()})`;
  if (target.tagName === 'SELECT') return 'drop-down';
  if (target.tagName === 'INPUT') return `input (${target.type})`;
  return `${target.tagName.toLowerCase()} (${target.className || 'no-class'})`;
}

function getTimestamp() {
  return new Date().toLocaleString();
}

function liveViewTracking() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target;
      const type = getElementType(target);
      if (entry.isIntersecting) {
        console.log(`${getTimestamp()}, view, ${type} (entering view)`);
      } else {
        console.log(`${getTimestamp()}, view, ${type} (leaving view)`);
      }
    });
  }, {
    root: null,
    threshold: 0.25
  });

  document.querySelectorAll(".track-view").forEach(el => observer.observe(el));
}

function trackClickEvents() {
  document.addEventListener("click", (event) => {
    const type = getElementType(event.target);
    console.log(`${getTimestamp()}, click, ${type}`);
  });
}

function trackTextSelection() {
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      console.log(`${getTimestamp()}, selection, "${selection}"`);
    }
  });
}

window.onload = () => {
  liveViewTracking();
  trackClickEvents();
  trackTextSelection();
};
