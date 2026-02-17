function setAttack(type) {
    if (type === 'sqli') {
        document.getElementById('username').value = "admin' OR '1'='1";
        document.getElementById('password').value = "anything";
    } else if (type === 'xss') {
        document.getElementById('username').value = "<script>alert('XSS')</script>";
        document.getElementById('password').value = "password";
    }
}

function robustHandler(user, pass) {
    if (!user || !pass) return "Error: Fill all fields";
    const query = "SELECT * FROM users WHERE user='" + user + "'";
    if (user.includes("'") || user.includes("OR")) {
        return "VULNERABLE: " + query;
    }
    return "OK (but not secure)";
}

function secureHandler(user, pass) {
    if (!user || !pass) return "Error: Fill all fields";
    if (/['";<>]/.test(user) || /OR|AND|SELECT/i.test(user)) {
        return "BLOCKED: Invalid characters detected";
    }
    return "OK: Using parameterized query";
}

function testLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    document.getElementById('robust-out').textContent = robustHandler(user, pass);
    document.getElementById('secure-out').textContent = secureHandler(user, pass);
}

function testSanitize() {
    const input = document.getElementById('comment').value;
    document.getElementById('unsanitized-out').innerHTML = input;
    document.getElementById('sanitized-out').textContent = input;
}

function analyzePassword() {
    const pass = document.getElementById('test-pass').value;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    document.getElementById('strength-text').textContent = labels[score] || "Enter password";
    document.getElementById('plain-pw').textContent = pass || "-";
    document.getElementById('hash-pw').textContent = pass ? "$2b$12$" + btoa(pass).slice(0, 20) : "-";
}
