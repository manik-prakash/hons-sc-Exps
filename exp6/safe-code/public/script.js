// Fetch current balance and display it
fetch('/balance')
  .then(r => r.json())
  .then(data => {
    document.getElementById('balance').textContent = '₹' + data.balance;
  });

// Fetch CSRF token from server and inject it into the hidden form field.
// Cross-origin scripts cannot call /csrf-token because the SameSite=Strict cookie
// won't be sent, so only same-origin pages can obtain this token.
fetch('/csrf-token')
  .then(r => r.json())
  .then(data => {
    document.getElementById('csrf-token').value = data.token;
  });

// Handle transfer form submission via fetch so we can show the response inline
document.getElementById('transferForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new URLSearchParams(new FormData(this));
  fetch('/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  })
    .then(r => r.json())
    .then(data => {
      const msg = document.getElementById('message');
      if (data.message) {
        msg.textContent = data.message;
        msg.style.color = '#2e7d32';
        // Update balance display
        fetch('/balance')
          .then(r => r.json())
          .then(d => { document.getElementById('balance').textContent = '₹' + d.balance; });
      } else {
        msg.textContent = data.error || 'Transfer failed';
        msg.style.color = '#c62828';
      }
    });
});
