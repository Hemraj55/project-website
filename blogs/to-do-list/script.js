// Theme toggle (works on todo list page)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
}

// To-Do List Logic
let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';

function renderTodos() {
    const list = document.getElementById('todo-list');
    // Force the list to be a normal block container (stack items vertically)
    list.style.setProperty('display', 'block', 'important');
    list.style.setProperty('width', '100%', 'important');
    list.style.padding = '0';
    list.innerHTML = '';
    let filtered = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });
    filtered.forEach((todo) => {
        const li = document.createElement('li');
        // Ensure each list item is full-width, block-level and clears any floats
        li.style.setProperty('display', 'block', 'important');
        li.style.setProperty('width', '100%', 'important');
        li.style.setProperty('clear', 'both', 'important');
        li.style.marginBottom = '8px';
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.innerHTML = `
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="complete">${todo.completed ? 'Undo' : 'Complete'}</button>
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </div>
        `;
        // Keep actions aligned to the right
        const actions = li.querySelector('.todo-actions');
        actions.style.display = 'inline-flex';
        actions.style.gap = '8px';
        actions.style.setProperty('float', 'right', 'important');

        // Use the original index in the todos array
        const originalIdx = todos.indexOf(todo);
        // Complete/Undo
        li.querySelector('.complete').onclick = () => {
            if (originalIdx > -1) {
                todos[originalIdx].completed = !todos[originalIdx].completed;
                saveTodos();
            }
        };
        // Edit
        li.querySelector('.edit').onclick = () => {
            if (originalIdx > -1) {
                const newText = prompt('Edit your task:', todos[originalIdx].text);
                if (newText && newText.trim()) {
                    todos[originalIdx].text = newText.trim();
                    saveTodos();
                }
            }
        };
        // Delete
        li.querySelector('.delete').onclick = () => {
            if (originalIdx > -1 && confirm('Delete this task?')) {
                todos.splice(originalIdx, 1);
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

document.getElementById('todo-form').addEventListener('submit', function(e) {
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
