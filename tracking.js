// Global variables to track page state
let pageSession = {
  sessionStart: new Date(),
  sessionId: generateSessionId(),
  events: [],
  currentViewport: {},
  lastLoggedElement: null,
  scrollPosition: 0,
  idleTime: 0,
  lastActivity: new Date()
};

// Generate unique session ID
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + new Date().getTime();
}

// Enhanced element type detection
function getElementType(target) {
  // Get track ID if available
  const trackId = target.getAttribute('data-track-id') || '';
  const trackIdInfo = trackId ? ` [${trackId}]` : '';
  
  if (target.tagName === 'IMG') return `image${trackIdInfo} (${target.alt || target.src.split('/').pop()})`;
  if (target.tagName === 'A') return `link${trackIdInfo} (${target.textContent.trim() || target.href})`;
  if (target.tagName === 'P') return `text${trackIdInfo} (${target.textContent.trim().slice(0, 30)}${target.textContent.trim().length > 30 ? '...' : ''})`;
  if (target.tagName === 'BUTTON') return `button${trackIdInfo} (${target.textContent.trim()})`;
  if (target.tagName === 'SELECT') return `drop-down${trackIdInfo}`;
  if (target.tagName === 'INPUT') return `input${trackIdInfo} (${target.type})`;
  if (target.tagName === 'LI') return `list-item${trackIdInfo} (${target.textContent.trim().slice(0, 20)}${target.textContent.trim().length > 20 ? '...' : ''})`;
  if (target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3') 
    return `heading${trackIdInfo} (${target.textContent.trim()})`;
    
  return `${target.tagName.toLowerCase()}${trackIdInfo} (${target.className || 'no-class'})`;
}

// Enhanced timestamp with milliseconds
function getTimestamp() {
  const now = new Date();
  return now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
}

// Log data in a standardized format
function logEvent(eventType, elementInfo, additionalData = {}) {
  const event = {
    timestamp: getTimestamp(),
    eventType: eventType,
    element: elementInfo,
    viewport: getCurrentViewport(),
    scrollPosition: window.scrollY,
    additionalData: additionalData
  };
  
  pageSession.events.push(event);
  console.log(`${event.timestamp}, ${eventType}, ${elementInfo}`, additionalData);
  
  // Optional: Send to server or save to local storage periodically
  if (pageSession.events.length % 10 === 0) {
    saveEvents();
  }
}

// Save events (could be to localStorage or send to server)
function saveEvents() {
  // For now, just keeping in console
  // In a real implementation, you might do:
  // localStorage.setItem('pageEvents', JSON.stringify(pageSession.events));
  // Or send to server via fetch/ajax
}

// Get current viewport dimensions and visible elements
function getCurrentViewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    visibleElements: getVisibleElements()
  };
}

// Get all elements currently visible in viewport
function getVisibleElements() {
  const visibleElements = [];
  
  document.querySelectorAll('.track-view').forEach(el => {
    const rect = el.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const ratio = visibleHeight / rect.height;
    
    if (ratio > 0.1) {  // At least 10% visible
      visibleElements.push({
        element: getElementType(el),
        visibilityRatio: Math.round(ratio * 100) / 100
      });
    }
  });
  
  return visibleElements;
}

// Enhanced view tracking (entering/leaving viewport)
function setupViewTracking() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = entry.target;
      const type = getElementType(target);
      
      if (entry.isIntersecting) {
        logEvent('view', `${type} (entering view)`, {
          visibilityRatio: Math.round(entry.intersectionRatio * 100) / 100,
          boundingRect: entry.boundingClientRect
        });
      } else {
        logEvent('view', `${type} (leaving view)`, {
          visibilityRatio: 0,
          boundingRect: entry.boundingClientRect
        });
      }
    });
  }, { root: null, threshold: [0.1, 0.25, 0.5, 0.75, 0.9] });
  
  document.querySelectorAll(".track-view").forEach(el => observer.observe(el));
}

// Track clicks with enhanced information
function setupClickTracking() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    const type = getElementType(target);
    
    logEvent('click', type, {
      x: event.clientX,
      y: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      targetInnerText: target.innerText ? target.innerText.trim().substring(0, 50) : ''
    });
  });
}

// Enhanced text selection tracking
function setupTextSelectionTracking() {
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const startNode = range.startContainer.parentNode;
      const endNode = range.endContainer.parentNode;
      
      logEvent('selection', `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, {
        selectionLength: text.length,
        startElement: getElementType(startNode),
        endElement: getElementType(endNode)
      });
    }
  });
}

// Track most visible section with continuous updates
function setupVisibleSectionTracking() {
  let lastVisibleElement = null;
  let lastScrollLog = 0;
  
  // Function to check currently most visible element
  function checkVisibleSections() {
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
    
    if (currentlyVisible && currentlyVisible !== lastVisibleElement) {
      const type = getElementType(currentlyVisible);
      logEvent('viewing', `${type} (most visible)`, {
        visibilityRatio: Math.round(maxVisibleRatio * 100) / 100
      });
      lastVisibleElement = currentlyVisible;
    }
    
    // Log scroll position every 500ms during active scrolling
    const now = Date.now();
    if (now - lastScrollLog > 500) {
      pageSession.scrollPosition = window.scrollY;
      logEvent('scroll', `position ${window.scrollY}px`, {
        direction: window.scrollY > pageSession.scrollPosition ? 'down' : 'up',
        visibleArea: getCurrentViewport()
      });
      lastScrollLog = now;
    }
  }
  
  // Throttled scroll handler
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    pageSession.lastActivity = new Date();
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      checkVisibleSections();
      pageSession.scrollPosition = window.scrollY;
    }, 50); // Check every 50ms during scroll
  });
  
  // Also check periodically independent of scroll
  setInterval(checkVisibleSections, 1000);
}

// Track hover events
function setupHoverTracking() {
  let hoverTimeout;
  let currentHoverElement = null;
  
  document.addEventListener('mousemove', (event) => {
    pageSession.lastActivity = new Date();
    clearTimeout(hoverTimeout);
    
    hoverTimeout = setTimeout(() => {
      const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
      if (hoveredElement && hoveredElement !== currentHoverElement) {
        const type = getElementType(hoveredElement);
        logEvent('hover', type, {
          x: event.clientX,
          y: event.clientY,
          duration: 'start'
        });
        currentHoverElement = hoveredElement;
      }
    }, 500); // 500ms hover threshold
  });
}

// Track page visibility changes
function setupVisibilityTracking() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      logEvent('visibility', 'page hidden', {
        timestamp: getTimestamp()
      });
    } else {
      logEvent('visibility', 'page visible', {
        timestamp: getTimestamp(),
        timeSinceHidden: (new Date() - pageSession.lastActivity) / 1000
      });
      pageSession.lastActivity = new Date();
    }
  });
}

// Track user idle time
function setupIdleTracking() {
  let idleInterval = setInterval(() => {
    const idleTime = (new Date() - pageSession.lastActivity) / 1000;
    
    if (idleTime > 5 && pageSession.idleTime < 5) {
      logEvent('idle', 'user inactive', {
        idleSeconds: idleTime
      });
    } else if (idleTime > 30 && pageSession.idleTime < 30) {
      logEvent('idle', 'user away', {
        idleSeconds: idleTime
      });
    }
    
    pageSession.idleTime = idleTime;
  }, 1000);
  
  // Reset idle time on any user activity
  ['mousemove', 'keypress', 'click', 'touchstart', 'scroll'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      if (pageSession.idleTime > 3) {
        logEvent('active', 'user returned', {
          afterIdleSeconds: pageSession.idleTime
        });
      }
      pageSession.lastActivity = new Date();
      pageSession.idleTime = 0;
    });
  });
}

// Track page load and unload
function setupPageLifecycleTracking() {
  // Already in window.onload below, but adding unload
  window.addEventListener('beforeunload', () => {
    logEvent('unload', 'page closing', {
      sessionDuration: (new Date() - pageSession.sessionStart) / 1000,
      eventsLogged: pageSession.events.length
    });
    saveEvents(); // Final save before leaving
  });
}

// Track window resizing
function setupResizeTracking() {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      logEvent('resize', 'window resized', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 250); // Throttle to avoid excessive logging
  });
}

// Initialize all tracking
window.onload = () => {
  logEvent('load', 'page loaded', {
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`
  });
  
  // Setup all tracking mechanisms
  setupViewTracking();
  setupClickTracking();
  setupTextSelectionTracking();
  setupVisibleSectionTracking();
  setupHoverTracking();
  setupVisibilityTracking();
  setupIdleTracking();
  setupPageLifecycleTracking();
  setupResizeTracking();
  
  // Initial viewport snapshot
  pageSession.currentViewport = getCurrentViewport();
};
