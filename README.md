🐳 ส่วนที่ 1: คำสั่งฝั่ง Server & Docker
1. คำสั่งติดตั้ง Portainer Container
docker run -d -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
2. คำสั่งตรวจสอบ Logs ของ Portainer
docker logs portainer
3. คำสั่งสร้าง Volume และ Network สำหรับฐานข้อมูล
docker volume create db_data
docker network create dev_net
4. โค้ด YAML สำหรับไปวางใน Portainer Stack (ชื่อ stack: web-devops)
volumes:
  db_data:
    external: true

networks:
  dev_net:
    driver: bridge
    external: true

services:
  mariadb:
    image: mariadb:latest
    container_name: mariadb_container
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: bnccitconfig
      MYSQL_DATABASE: mydb
      MYSQL_USER: admin
      MYSQL_PASSWORD: bnccitconfig
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - dev_net

  php-web:
    image: webdevops/php-apache:8.2
    container_name: php-web-server
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - WEB_DOCUMENT_ROOT=/app
      - PHP_DISPLAY_ERRORS=1
    volumes:
      - c:/www:/app
    depends_on:
      - mariadb
    networks:
      - dev_net
 
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: pma_container
    restart: always
    environment:
      PMA_HOST: mariadb
      PMA_PORT: 3306
      UPLOAD_LIMIT: 64M
    ports:
      - "81:80"
    depends_on:
      - mariadb
    networks:
      - dev_net
💻 ส่วนที่ 2: คำสั่งและโค้ดสำหรับ Node.js
5. คำสั่งเปิดโฟลเดอร์โปรเจกต์และติดตั้ง Packages ผ่าน Terminal
cd C:\login-app
npm init -y
npm install express mysql2 cors
npm install -g nodemon
6. โค้ดสำหรับไฟล์ package.json
{
  "name": "login-app",
  "version": "1.0.0",
  "description": "ระบบ Login และ CRUD API ด้วย Node.js + MySQL",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "mysql2": "^3.9.7"
  }
}
7. โค้ด SQL สำหรับสร้างฐานข้อมูลในไฟล์ sql/database.sql
CREATE DATABASE login_db;
USE login_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  fullname VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, fullname)
VALUES ('admin', '1234', 'Administrator');
8. โค้ดสำหรับไฟล์เชื่อมต่อฐานข้อมูล db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'login_db'
});

connection.connect((err) => {
  if (err) {
    console.log('Database Connection Error');
    return;
  }
  console.log('Database Connected Successfully!');
});

module.exports = connection;
9. โค้ดระบบ API หลักในไฟล์ server.js (เปิดใช้งาน CORS + ระบบ CRUD)
const express = require("express");
const cors = require("cors"); 
const app = express();
const db = require("./db");

app.use(cors()); 
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
 Server URL : http://localhost:${PORT}
 API Endpoint : POST http://localhost:${PORT}/login
==================================================
`);
});

// 1. API ระบบ Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ? AND password = ? ";
  
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Login Database Error:", err);
      return res.status(500).json({ status: false, message: "Database Error" });
    }
    if (result.length > 0) {
      res.json({ status: true, message: "Login Success" });
    } else {
      res.json({ status: false, message: "Username หรือ Password ไม่ถูกต้อง" });
    }
  });
});

// 2. API ดึงข้อมูล User ทั้งหมด
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database Error' });
    }
    res.status(200).json({ success: true, data: result });
  });
});

// 3. API ดึงข้อมูล User เฉพาะคน (ระบุ ID)
app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id=?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database Error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }
    res.status(200).json({ success: true, data: result[0] });
  });
});

// 4. API เพิ่มผู้ใช้ใหม่
app.post('/api/users', (req, res) => {
  const { username, password, fullname } = req.body;
  const sql = `INSERT INTO users (username, password, fullname) VALUES(?, ?, ?)`;
  
  db.query(sql, [username, password, fullname], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database Error หรือข้อมูลซ้ำ' });
    }
    res.status(201).json({ success: true, message: 'User Created', id: result.insertId });
  });
});

// 5. API แก้ไขข้อมูลผู้ใช้
app.put('/api/users/:id', (req, res) => {
  const id = req.params.id;
  const { password, fullname } = req.body;
  
  db.query(`UPDATE users SET password=?, fullname=? WHERE id=?`, [password, fullname, id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database Error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }
    res.status(200).json({ success: true, message: 'Updated' });
  });
});
🛠️ ส่วนที่ 3: วิธีแก้ปัญหา Error & คำสั่งทดสอบระบบ
10. ขั้นตอนแก้ปัญหา MODULE_NOT_FOUND (กรณีลืมติดตั้ง cors)

ให้ทำตามลำดับ 3 คำสั่งย่อยนี้ใน Terminal ของคุณครับ:

10.1 กดเพื่อหยุดระบบเดิม:
Ctrl + C
10.2สั่งติดตั้งโมดูล cors:
npm install cors
10.3สั่งรันระบบใหม่อีกครั้ง:
nodemon server.js
11. คำสั่งสำหรับใช้ทดสอบยิง API ระบบ Login
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"1234\"}"
12. คำสั่งสำหรับใช้ทดสอบยิง API เพิ่มผู้ใช้งานใหม่ (Create User)
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"username\": \"user01\", \"password\": \"5678\", \"fullname\": \"New Student\"}"

