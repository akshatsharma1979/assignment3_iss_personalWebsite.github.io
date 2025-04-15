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

function logViewEvents() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const type = getElementType(target);
                console.log(`${getTimestamp()}, view, ${type}`);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.25 });

    document.querySelectorAll('.track-view').forEach(el => observer.observe(el));
}

function logClickEvents() {
    document.addEventListener('click', event => {
        const target = event.target;
        const type = getElementType(target);
        console.log(`${getTimestamp()}, click, ${type}`);
    });
}

window.onload = () => {
    logViewEvents();
    logClickEvents();
};
