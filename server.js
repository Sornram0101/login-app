const express = require("express");
const cors = require("cors"); // 1. นำเข้า CORS
const app = express();
const db = require("./db");

app.use(cors()); // 2. เปิดใช้งาน CORS ให้ทุกโดเมนเข้าถึงได้
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Node.js Server Ready");
});

app.listen(PORT, () => {
  console.clear();
  console.log(`
==================================================
            BACKEND SERVER STARTED
==================================================

 Server URL
 http://localhost:${PORT}

 API Endpoint
 POST http://localhost:${PORT}/login

 Test Commandline (CMD)
 curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\\"username\\": \\"admin\\", \\"password\\": \\"1234\\"}"
 
 Test Browser
 URL http://localhost:${PORT}

 Test Postman
 Method : POST
 URL    : http://localhost:${PORT}/login
 Body (JSON)
        {
          "username":"admin",
          "password":"1234"
        }
==================================================
`);
});

// === 1. ระบบ Login ===
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ? AND password = ? ";
  
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Login Database Error:", err);
      return res.status(500).json({
        status: false,
        message: "Database Error",
      });
    }
    if (result.length > 0) {
      res.json({
        status: true,
        message: "Login Success เจ๋งๆเอาไป5บาท",
      });
    } else {
      res.json({
        status: false,
        message: "Username หรือ Password ไม่ถูกต้องเอามา 50 บาท",
      });
    }
  });
});

// === 2. ดึงข้อมูล User ทั้งหมด ===
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Get Users Error:", err);
      return res.status(500).json({
        success: false,
        message: 'Database Error'
      });
    }
    res.status(200).json({
      success: true,
      data: result
    });
  });
});

// === 3. ดึงข้อมูล User เฉพาะบุคคล (เพิ่ม Error Handling แล้ว) ===
app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id=?', [id], (err, result) => {
    // ดักจับ Error หากฐานข้อมูลมีปัญหา
    if (err) {
      console.error(`Get User ID ${id} Error:`, err);
      return res.status(500).json({
        success: false,
        message: 'Database Error'
      });
    }
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found'
      });
    }
    res.status(200).json({
      success: true,
      data: result[0]
    });
  });
});

// === 4. สร้าง User ใหม่ ===
app.post('/api/users', (req, res) => {
  const { username, password, fullname } = req.body;
  const sql = `INSERT INTO users (username, password, fullname) VALUES(?, ?, ?)`;
  
  db.query(sql, [username, password, fullname], (err, result) => {
    if (err) {
      console.error("Create User Error:", err);
      return res.status(500).json({
        success: false,
        message: 'Database Error หรือข้อมูลซ้ำซ้อน'
      });
    }
    res.status(201).json({
      success: true,
      message: 'User Created',
      id: result.insertId
    });
  });
});

// === 5. อัปเดตข้อมูล User (เพิ่ม Error Handling แล้ว) ===
app.put('/api/users/:id', (req, res) => {
  const id = req.params.id;
  const { password, fullname } = req.body;
  
  db.query(`UPDATE users SET password=?, fullname=? WHERE id=?`, [password, fullname, id], (err, result) => {
    // ดักจับ Error หากฐานข้อมูลมีปัญหา
    if (err) {
      console.error(`Update User ID ${id} Error:`, err);
      return res.status(500).json({
        success: false,
        message: 'Database Error'
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Updated'
    });
  });
});