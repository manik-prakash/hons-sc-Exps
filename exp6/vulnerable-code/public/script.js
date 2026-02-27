fetch("/balance")
  .then(res => res.json())
  .then(data => {
      document.getElementById("balance").innerText = data.balance;
  });