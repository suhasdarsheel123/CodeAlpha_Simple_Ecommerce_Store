// auth.js

// Handle Registration
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the page from reloading
        
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    });
}

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert(`Welcome back, ${data.username}!`);
                
                // Save the user data to the browser so the store remembers them!
                localStorage.setItem('user_id', data.userId);
                localStorage.setItem('username', data.username);
                
                window.location.href = 'index.html'; // Redirect to the store
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    });
}