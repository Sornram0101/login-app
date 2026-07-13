const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bnccitconfig",
  database: "login_db",
});
connection.connect((err) => {
  if (err) {
    console.log("Database Error");
    return;
  }
  console.log("Database Connected");
});
module.exports = connection;