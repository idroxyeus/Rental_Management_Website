const db = require("./db");
db.query("SELECT name, email FROM users", (err, results) => {
  if (err) console.error(err);
  else console.log("Current Users:", results);
  process.exit();
});
