const db = require("./db");

const migrations = [
  `ALTER TABLE properties ADD COLUMN images LONGTEXT DEFAULT NULL`,
  `ALTER TABLE properties ADD COLUMN facilities TEXT DEFAULT NULL`,
];

let done = 0;
migrations.forEach((sql, i) => {
  db.query(sql, (err) => {
    if (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`Migration ${i + 1}: Column already exists, skipping.`);
      } else {
        console.error(`Migration ${i + 1} failed:`, err.message);
      }
    } else {
      console.log(`Migration ${i + 1} applied successfully.`);
    }
    done++;
    if (done === migrations.length) process.exit();
  });
});
