const axios = require("axios");
const BASE = "http://localhost:3000";

async function run() {
  try {
    console.log("Register user...");
    await axios.post(BASE + "/register", {
      username: "user1",
      password: "Pass@123"
    });

    console.log("Login...");
    let res = await axios.post(BASE + "/login", {
      username: "user1",
      password: "Pass@123"
    });

    const token = res.data.token;

    console.log("Testing IDOR...");
    let idor = await axios.get(BASE + "/user/999", {
      headers: { Authorization: token }
    });
    console.log("IDOR response:", idor.data);

    console.log("Testing admin access...");
    try {
      await axios.get(BASE + "/admin", {
        headers: { Authorization: token }
      });
    } catch {
      console.log("Blocked non-admin");
    }

    console.log("Testing input validation...");
    try {
      await axios.post(BASE + "/input-test", {
        data: "<script>alert(1)</script>"
      });
    } catch {
      console.log("XSS blocked");
    }

    console.log("Testing rate limit...");
    for (let i = 0; i < 12; i++) {
      try {
        await axios.get(BASE + "/rate-test");
      } catch {
        console.log("Rate limited at request", i + 1);
      }
    }

  } catch (err) {
    console.log(err.message);
  }
}

run();