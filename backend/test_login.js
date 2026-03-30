const axios = require("axios");

async function test() {
  try {
    const res = await axios.post("http://localhost:5000/login", {
      email: "admin@example.com", // commonly used during dev
      password: "password123" // or whatever they used
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}

test();
