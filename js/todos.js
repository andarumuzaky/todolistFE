const API_URL = 'http://localhost:3000/api/todos';
const token = localStorage.getItem('token');

// 1. Proteksi Halaman: Kalau tidak ada token, tendang ke login
if (!token) {
    alert("Anda harus login dulu!");
    window.location.href = 'login.html';
}

let todos = [];
let currentFilter = 'all';

// Load data saat halaman dibuka
document.addEventListener('DOMContentLoaded', fetchTodos);

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// --- FUNGSI API ---

async function fetchTodos() {
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
            logout(); // Token kadaluarsa
            return;
        }

        todos = await res.json();
        render();
    } catch (err) {
        console.error("Gagal mengambil data", err);
    }
}

async function addTodo() {
    const input = document.getElementById('todo-input');
    const task = input.value.trim();
    if (!task) return;

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ task })
        });
        input.value = '';
        fetchTodos(); // Refresh data
    } catch (err) {
        alert("Gagal menambah data");
    }
}

async function toggleStatus(id, currentStatus) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ is_completed: !currentStatus })
        });
        fetchTodos();
    } catch (err) {
        console.error(err);
    }
}

async function deleteTodo(id) {
    if (!confirm("Hapus tugas ini?")) return;
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTodos();
    } catch (err) {
        console.error(err);
    }
}

async function editTodo(id, oldTask) {
    const newTask = prompt("Edit tugas:", oldTask);
    if (!newTask) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ task: newTask })
        });
        fetchTodos();
    } catch (err) {
        console.error(err);
    }
}

async function clearCompleted() {
    if (!confirm("Hapus semua yang sudah selesai?")) return;
    try {
        await fetch(`${API_URL}/completed`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTodos();
    } catch (err) {
        console.error(err);
    }
}

// --- FUNGSI TAMPILAN (RENDER) ---

function setFilter(type) {
    currentFilter = type;
    
    // Update warna tombol filter
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active'); // Highlight tombol yg diklik
    
    render();
}

function render() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    // Filter data di sisi client (browser)
    let filteredData = todos;
    if (currentFilter === 'active') filteredData = todos.filter(t => !t.is_completed);
    if (currentFilter === 'completed') filteredData = todos.filter(t => t.is_completed);

    filteredData.forEach(todo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="todo-content">
                <div class="checkbox ${todo.is_completed ? 'checked' : ''}" 
                     onclick="toggleStatus(${todo.id}, ${todo.is_completed})">
                </div>
                <span class="task-text ${todo.is_completed ? 'completed' : ''}">${todo.task}</span>
            </div>
            <div class="actions">
                <i class="fas fa-pen" onclick="editTodo(${todo.id}, '${todo.task}')"></i>
                <i class="fas fa-trash" onclick="deleteTodo(${todo.id})"></i>
            </div>
        `;
        list.appendChild(li);
    });

    // Update counter sisa tugas
    const sisa = todos.filter(t => !t.is_completed).length;
    document.getElementById('counter').innerText = `${sisa} tugas tersisa`;
}