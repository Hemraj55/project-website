// Try multiple candidate paths until a component is successfully fetched.
async function fetchFirstText(candidates) {
  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (res.ok) return await res.text();
    } catch (e) {
      // ignore and try next
    }
  }
  throw new Error('Could not load from any candidate paths');
}

function loadComponent(id, candidates, callback) {
  fetchFirstText(candidates)
    .then(data => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = data;
      if (callback) callback();
    })
    .catch(err => {
      console.warn('Failed to load component', id, err);
    });
}

// Candidate lists try from nearest relative to more remote.
const headerCandidates = [
  './components/header.html',
  'components/header.html',
  '../components/header.html',
  '../../components/header.html',
  '/components/header.html'
];

const footerCandidates = [
  './components/footer.html',
  'components/footer.html',
  '../components/footer.html',
  '../../components/footer.html',
  '/components/footer.html'
];

// Load header
loadComponent('header', headerCandidates, () => {
  setActiveMenu();
  setupSearchListener();
});

// Load footer
loadComponent('footer', footerCandidates);

function setActiveMenu() {
  const pathname = location.pathname;
  const page = pathname.split("/").pop().replace(".html", "");
  let activePage = page || "index";
  
  // If in /games/* folder, highlight Games
  if (pathname.includes("/games/")) {
    activePage = "games";
  }
  
  document.querySelectorAll("nav a").forEach(link => {
    if (link.dataset.page === activePage) {
      link.classList.add("active");
    }
  });
}

// Change navbar style on scroll

  window.addEventListener('scroll', function () {
    const header = document.getElementById('navbar');
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

// For searching and highlighting content
function searchContent() {
    const input = document.getElementById('search').value.trim();
    const content = document.querySelector('main') || document.body;

    clearHighlights();

    if (!input) return;

    const regex = new RegExp(escapeRegExp(input), 'gi');
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);

    const textNodes = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (
            !node.nodeValue.trim() ||
            node.parentNode.closest('script, style, head, mark')
        ) continue;

        textNodes.push(node);
    }

    textNodes.forEach(node => {
        const matches = [...node.nodeValue.matchAll(regex)];

        if (matches.length === 0) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach(match => {
            const start = match.index;
            const end = start + match[0].length;

            // Append text before the match
            if (start > lastIndex) {
                fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, start)));
            }

            // Append highlighted <mark>
            const mark = document.createElement('mark');
            mark.textContent = node.nodeValue.slice(start, end);
            fragment.appendChild(mark);

            lastIndex = end;
        });

        // Append remaining text after the last match
        if (lastIndex < node.nodeValue.length) {
            fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
        }

        node.parentNode.replaceChild(fragment, node);
    });
}

function clearHighlights() {
    const marks = document.querySelectorAll('mark');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// for entering search
function setupSearchListener() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchContent();
        }
    });

    // Clear highlights immediately when the search box is emptied
    searchInput.addEventListener('input', function () {
        if (!this.value.trim()) {
            clearHighlights();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Fallback in case header is already loaded
    setupSearchListener();
});

