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
  adjustComponentPaths();
  setActiveMenu();
  setupSearchListener();
});

// Load footer
loadComponent('footer', footerCandidates, adjustComponentPaths);

// Adjust links and image paths inside loaded components so they point to the site root
function computeBasePath() {
  // For GitHub Pages project sites like hemraj55.github.io/project-website/
  // pathname is e.g. /project-website/blogs/calculator/index.html
  // We need to extract depth relative to site root (ignoring project folder)
  
  const pathname = location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  
  // Remove the file name if present (last part if contains a dot)
  if (parts.length && parts[parts.length - 1].includes('.')) {
    parts.pop();
  }
  
  // Remove the first part if it looks like a project name (hyphen/underscore, not a known site folder)
  if (parts.length > 0) {
    const firstPart = parts[0];
    const knownFolders = ['blogs', 'games', 'projects', 'blog', 'game'];
    if ((firstPart.includes('-') || firstPart.includes('_')) && !knownFolders.includes(firstPart.toLowerCase())) {
      // Likely the project folder name (e.g., project-website)
      parts.shift();
    }
  }
  
  // Remaining parts represent depth from site root
  const depth = parts.length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

function adjustComponentPaths() {
  const base = computeBasePath();

  // Update header nav links (use `data-page` attributes to map)
  const mapping = {
    index: 'index.html',
    blogs: 'blogs.html',
    games: 'games.html',
    contact: 'contact.html',
    about: 'about.html'
  };

  document.querySelectorAll('#header a[data-page]').forEach(link => {
    const page = link.dataset.page;
    if (mapping[page]) link.setAttribute('href', base + mapping[page]);
  });

  // Update footer image paths
  const img = document.querySelector('#footer img');
  if (img && img.dataset.src) {
    const filename = img.dataset.src.split('/').pop();
    img.setAttribute('src', base + 'media/' + filename);
  }

  // Ensure favicon points to site/project-relative path so browser doesn't request site root /favicon.ico
  ensureFavicon(base);
}

/**
 * Ensure a favicon link exists and points to a project-relative path.
 * Tries base + 'favicon.ico', then base + 'media/favicon.ico'.
 */
function ensureFavicon(base) {
  try {
    let iconHref = base + 'favicon.ico';
    // Prefer an existing <link rel="icon"> or <link rel="shortcut icon">
    let link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

    // If none exists, create one
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // Use media/ subfolder as second choice if the first 404s; we cannot detect 404 synchronously,
    // so prefer media location if project assets are stored in media folder.
    // If your favicon lives in media/, change order below or place an actual favicon at <base>/favicon.ico.
    const candidates = [base + 'favicon.ico', base + 'media/favicon.ico'];

    // Set first candidate; browsers will fetch and may 404 if not present, but this avoids root request.
    // If you want to test alternative, set the preferred candidate here.
    link.href = candidates[0];

    // Optionally, if you know favicons live under media, uncomment the next line to prefer media:
    // link.href = candidates[1];
  } catch (e) {
    // silent fallback
  }
}

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

