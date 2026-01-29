const API_URL = 'http://localhost:3000/api/auth';

// 1. Cek: Kalau sudah login, lempar langsung ke halaman Todo
if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}

let isRegister = false;

function switchMode() {
    isRegister = !isRegister;
    const title = document.getElementById('form-title');
    const btn = document.getElementById('submit-btn');
    const usernameInput = document.getElementById('username');
    const toggleLink = document.getElementById('toggle-mode');

    if (isRegister) {
        title.innerText = "Buat Akun Baru";
        btn.innerText = "Daftar";
        usernameInput.style.display = "block";
        usernameInput.required = true;
        toggleLink.innerText = "Sudah punya akun? Login";
    } else {
        title.innerText = "Selamat Datang";
        btn.innerText = "Masuk";
        usernameInput.style.display = "none";
        usernameInput.required = false;
        toggleLink.innerText = "Belum punya akun? Daftar";
    }
}

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    // Tentukan mau nembak API Login atau Register
    const endpoint = isRegister ? '/register' : '/login';
    const payload = isRegister ? { username, email, password } : { email, password };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Terjadi kesalahan');
        }

        if (isRegister) {
            alert('Registrasi berhasil! Silakan login.');
            switchMode(); // Kembalikan ke mode login
        } else {
            // LOGIN SUKSES: Simpan token & Pindah Halaman
            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';
        }

    } catch (error) {
        alert(error.message);
    }
});