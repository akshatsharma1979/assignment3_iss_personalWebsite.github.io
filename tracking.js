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

// View observer (entering/leaving logs)
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
  }, { root: null, threshold: 0.25 });

  document.querySelectorAll(".track-view").forEach(el => observer.observe(el));
}

// Click tracker
function trackClickEvents() {
  document.addEventListener("click", (event) => {
    const type = getElementType(event.target);
    console.log(`${getTimestamp()}, click, ${type}`);
  });
}

// Text selection tracker
function trackTextSelection() {
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      console.log(`${getTimestamp()}, selection, "${selection}"`);
    }
  });
}

// Track currently visible element
function trackCurrentlyViewedSection() {
  let lastVisible = null;

  window.addEventListener('scroll', () => {
    let maxVisibleRatio = 0;
    let currentlyVisible = null;

    document.querySelectorAll('.track-view').forEach(el => {
      const rect = el.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const ratio = visibleHeight / rect.height;

      if (ratio > maxVisibleRatio && ratio > 0.3) {
        maxVisibleRatio = ratio;
        currentlyVisible = el;
      }
    });

    if (currentlyVisible && currentlyVisible !== lastVisible) {
      const type = getElementType(currentlyVisible);
      console.log(`${getTimestamp()}, viewing, ${type} (most visible)`);
      lastVisible = currentlyVisible;
    }
  });
}

window.onload = () => {
  liveViewTracking();
  trackClickEvents();
  trackTextSelection();
  trackCurrentlyViewedSection();
};
