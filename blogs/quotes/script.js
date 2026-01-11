// Theme toggle (works on all pages)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
}

// Quotes logic (only runs if quotes form exists)
const addQuoteForm = document.getElementById('add-quote-form');

// --- New persistent quotes implementation ---
let quotes = [];

function loadQuotesFromStorage() {
    const raw = localStorage.getItem('quotes');
    if (raw) {
        try {
            quotes = JSON.parse(raw) || [];
            return;
        } catch (e) {
            quotes = [];
        }
    }
    // If no saved quotes, read existing DOM initial quotes and save them
    const list = document.getElementById('quotes-list');
    if (!list) { quotes = []; return; }
    const children = Array.from(list.children);
    quotes = [];
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        if (el.classList.contains('quote')) {
            const quoteText = el.textContent.trim().replace(/^"|"$/g, '');
            let author = 'Anonymous';
            if (i + 1 < children.length && children[i + 1].classList.contains('author')) {
                author = children[i + 1].textContent.replace(/^–\s*/, '').trim();
            }
            quotes.push({ text: quoteText, author });
        }
    }
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveQuotesToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    renderQuotes();
}

function renderQuotes() {
    const quotesList = document.getElementById('quotes-list');
    if (!quotesList) return;
    quotesList.innerHTML = '';
    quotes.forEach((q, idx) => {
        const quoteDiv = document.createElement('div');
        quoteDiv.className = 'quote';
        quoteDiv.textContent = `"${q.text}"`;
        quotesList.appendChild(quoteDiv);

        const authorDiv = document.createElement('div');
        authorDiv.className = 'author';
        authorDiv.textContent = q.author ? `– ${q.author}` : '– Anonymous';

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginLeft = '12px';
        deleteBtn.style.background = '#ff5252';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.padding = '4px 10px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = function() {
            if (confirm('Delete this quote?')) {
                quotes.splice(idx, 1);
                saveQuotesToStorage();
            }
        };
        authorDiv.appendChild(deleteBtn);

        quotesList.appendChild(authorDiv);
    });
}

// Initialize on load
loadQuotesFromStorage();
renderQuotes();

// --- Adjusted add-quote form handler to persist quotes ---
if (addQuoteForm) {
    addQuoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let quoteText = document.getElementById('user-quote').value.trim();
        let authorText = document.getElementById('user-author').value.trim();
        // Simple check for repeated letters (common typo)
        const typoRegex = /(\w)\1{2,}/;
        if (typoRegex.test(quoteText) || typoRegex.test(authorText)) {
            alert('Your quote or author may contain a spelling mistake. Please check before submitting.');
            return;
        }
        // Auto-correct common spelling mistakes
        quoteText = autoCorrect(quoteText);
        authorText = autoCorrect(authorText);
        if (quoteText) {
            // push into persistent array then save+render
            quotes.push({ text: quoteText, author: authorText || 'Anonymous' });
            saveQuotesToStorage();
            addQuoteForm.reset();
        }
    });
    document.getElementById('user-quote').setAttribute('spellcheck', 'true');
    document.getElementById('user-author').setAttribute('spellcheck', 'true');
}

function autoCorrect(text) {
    const corrections = {
        "teh": "the",
        "recieve": "receive",
        "adn": "and",
        "becuase": "because",
        "definately": "definitely",
        "seperated": "separated",
        "occured": "occurred",
        "untill": "until",
        "wich": "which",
        "thier": "their"
    };
    return text.split(' ').map(word => corrections[word.toLowerCase()] || word).join(' ');
}

// To-Do List logic (only runs if todo form exists)
const todoForm = document.getElementById('todo-form');
if (todoForm) {
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    let filter = 'all';
    function renderTodos() {
        const list = document.getElementById('todo-list');
        list.innerHTML = '';
        let filtered = todos.filter(todo => {
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
            return true;
        });
        filtered.forEach((todo, idx) => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (todo.completed ? ' completed' : '');
            li.innerHTML = `
                <span>${todo.text}</span>
                <div class="todo-actions">
                    <button class="complete">${todo.completed ? 'Undo' : 'Complete'}</button>
                    <button class="edit">Edit</button>
                    <button class="delete">Delete</button>
                </div>
            `;
            li.querySelector('.complete').onclick = () => {
                todos[idx].completed = !todos[idx].completed;
                saveTodos();
            };
            li.querySelector('.edit').onclick = () => {
                const newText = prompt('Edit your task:', todos[idx].text);
                if (newText && newText.trim()) {
                    todos[idx].text = newText.trim();
                    saveTodos();
                }
            };
            li.querySelector('.delete').onclick = () => {
                if (confirm('Delete this task?')) {
                    todos.splice(idx, 1);
                    saveTodos();
                }
            };
            list.appendChild(li);
        });
        updateStats();
    }
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            saveTodos();
            input.value = '';
        }
    });
    document.getElementById('filter-all').onclick = function() {
        filter = 'all';
        setActiveFilter(this);
        renderTodos();
    };
    document.getElementById('filter-active').onclick = function() {
        filter = 'active';
        setActiveFilter(this);
        renderTodos();
    };
    document.getElementById('filter-completed').onclick = function() {
        filter = 'completed';
        setActiveFilter(this);
        renderTodos();
    };
    function setActiveFilter(btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    function updateStats() {
        const stats = document.getElementById('todo-stats');
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        stats.textContent = `Total: ${total} | Completed: ${completed} | Active: ${total - completed}`;
    }
    renderTodos();
}