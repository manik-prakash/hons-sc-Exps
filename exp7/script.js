const USERS = {
  admin: 'pass123',
  alice: 'pass123'
};


function loginVulnerable() {
  const user = document.getElementById('p1-user').value.trim();
  const pass = document.getElementById('p1-pass').value;

  let msg;
  if (!USERS[user]) {
    msg = `SQLException: SELECT * FROM users WHERE username='${user}'\n` +
          `Error: No rows returned — user '${user}' does not exist\n` +
          `  at /app/db/query.js:42\n  at /app/routes/auth.js:17`;
  } else if (USERS[user] !== pass) {
    msg = `AuthError: Password mismatch for user '${user}'\n` +
          `  Provided hash: ${btoa(pass)}\n` +
          `  Stored hash:   ${btoa(USERS[user])}\n` +
          `  at /app/middleware/auth.js:55`;
  } else {
    msg = `Login successful. Welcome, ${user}!\n  Session token: ${btoa(user + Date.now())}`;
  }

  document.getElementById('vuln-out').textContent = msg;
}

function loginSecure() {
  const user = document.getElementById('p1-user').value.trim();
  const pass = document.getElementById('p1-pass').value.trim();

  let msg;
  if (!USERS[user] || USERS[user] !== pass) {
    msg = 'Error: Invalid credentials. Please try again.';
  } else {
    msg = 'Login successful. Welcome back!';
  }

  document.getElementById('sec-out').textContent = msg;
}

const ERROR_MAP = {
  userNotFound: {
    vuln: "SQLException: SELECT * FROM users WHERE username='john'\nError: No rows returned — user 'john' does not exist\n  at /app/db/query.js:42",
    sec:  "Error: Invalid credentials. Please try again."
  },
  wrongPassword: {
    vuln: "AuthError: Password mismatch for user 'john'\n  Provided: MyPass99\n  at /app/middleware/auth.js:55",
    sec:  "Error: Invalid credentials. Please try again."
  },
  dbError: {
    vuln: "SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:5432\n  at /app/db/connection.js:18\n  at process.nextTick",
    sec:  "Error: Service temporarily unavailable. Please try later."
  },
  fileError: {
    vuln: "ENOENT: no such file or directory '/var/app/config/database.json'\n  at Object.openSync (fs.js:462)\n  at /app/config/loader.js:9",
    sec:  "Error: Configuration error. Please contact support."
  }
};

function showErrorComparison() {
  const type = document.getElementById('err-type').value;
  document.getElementById('err-vuln').textContent = ERROR_MAP[type].vuln;
  document.getElementById('err-sec').textContent  = ERROR_MAP[type].sec;
}

function logInsecure() {
  const email = document.getElementById('log-email').value;
  const pass  = document.getElementById('log-pass').value;
  const ts    = new Date().toISOString();

  const entry = `[${ts}] INFO Login attempt\n` +
                `  email:    ${email}\n` +
                `  password: ${pass}\n` +
                `  db_query: SELECT * FROM users WHERE email='${email}' AND password='${pass}'\n` +
                `  result:   FAILED`;

  document.getElementById('log-bad').textContent = entry;
}

function logSecure() {
  const email = document.getElementById('log-email').value;
  const pass  = document.getElementById('log-pass').value;
  const ts    = new Date().toISOString();

  const entry = JSON.stringify({
    timestamp: ts,
    level:     'INFO',
    event:     'login_failed',
    requestId: 'req-' + Math.random().toString(36).slice(2, 9),
    user:      maskEmail(email),
    password:  '****',
    ip:        '192.168.x.x'
  }, null, 2);

  document.getElementById('log-good').textContent = entry;
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return '****';
  const visible = local.slice(0, 2);
  return visible + '**@' + domain;
}

function maskPassword() {
  return '****';
}

function maskData() {
  const email = document.getElementById('mask-email').value;
  const pass  = document.getElementById('mask-pass').value;

  document.getElementById('mask-orig').textContent =
    `Email:    ${email}\nPassword: ${pass}`;

  document.getElementById('mask-out').textContent =
    `Email:    ${maskEmail(email)}\nPassword: ${'****'}`;
}
