const db = require("./db");

// First try to ADD the column (for DBs that don't have it yet)
// If it already exists, MODIFY it to LONGTEXT
db.query(
  "ALTER TABLE properties ADD COLUMN image_url LONGTEXT DEFAULT NULL",
  (addErr) => {
    if (addErr && addErr.code === "ER_DUP_FIELDNAME") {
      // Column exists — just widen it
      db.query(
        "ALTER TABLE properties MODIFY COLUMN image_url LONGTEXT DEFAULT NULL",
        (modErr) => {
          if (modErr) {
            console.error("Migration failed:", modErr.message);
          } else {
            console.log("✔ image_url column widened to LONGTEXT successfully.");
          }
          process.exit();
        }
      );
    } else if (addErr) {
      console.error("Migration failed:", addErr.message);
      process.exit();
    } else {
      console.log("✔ image_url column added as LONGTEXT successfully.");
      process.exit();
    }
  }
);
