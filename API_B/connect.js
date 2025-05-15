import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "social_db",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

export default db;
