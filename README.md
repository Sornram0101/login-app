Markdown
# 🚀 login-app Project & Setup Guide

คู่มือการติดตั้งเซิร์ฟเวอร์ด้วย Docker, Portainer และขั้นตอนการพัฒนา Back-End ด้วย Node.js + MySQL สำหรับระบบ Login และระบบจัดการผู้ใช้ (CRUD API)

---

## PART 1: 🐳 การเตรียมเซิร์ฟเวอร์ด้วย Docker & Portainer

ทำตามขั้นตอนด้านล่างนี้ผ่านทางหน้าเว็บ vecskill.bncc.ac.th หรือ Terminal ของเซิร์ฟเวอร์คุณ

### 1. ติดตั้งและตรวจสอบ Portainer
รันคำสั่งนี้เพื่อสร้าง Container สำหรับ Portainer:
```bash
docker run -d -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
ตรวจสอบสถานะการทำงานของ Portainer:

Bash
docker logs portainer
2. เตรียมความพร้อมของระบบ (Pre-requisites)
สร้างโฟลเดอร์สำหรับพัฒนาโปรเจกต์: ให้สร้างโฟลเดอร์ชื่อ login-app ไว้ใน Drive C:

สร้าง Docker Volume ชื่อ db_data:

Bash
docker volume create db_data
สร้าง Docker Network ชื่อ dev_net:

Bash
docker network create dev_net
3. การตั้งค่าระบบผ่าน Portainer Stacks (Docker Compose)
เปิดหน้าเว็บ Portainer เข้าไปที่เมนู Stacks -> คลิกปุ่ม Add stack

ตั้งชื่อ Stack ว่า: web-devops

ในส่วน Build method เลือกเป็น Web editor

คัดลอกโค้ด YAML ด้านล่างนี้ไปวางในช่องเขียนโค้ด:

YAML
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
PART 2: 💻 ใบความรู้การพัฒนา Back-End ด้วย Node.js และ MySQL
คู่มือขั้นตอนการสร้างระบบ Login เบื้องต้นและการเชื่อมต่อฐานข้อมูล MySQL ด้วย Node.js

1. โครงสร้างโปรเจกต์ (Project Structure)
สร้างไฟล์และโฟลเดอร์ภายในโฟลเดอร์โปรเจกต์ตามโครงสร้างนี้:

Plaintext
login-app
│
├── node_modules/
├── package.json
├── server.js
├── db.js
└── sql/
    └── database.sql
2. การเตรียมตัวและสร้างโปรเจกต์
รันคำสั่งเหล่านี้ใน Terminal เพื่อเริ่มสร้างโปรเจกต์ Node.js และติดตั้ง Packages ที่จำเป็น:

Bash
# 1. เข้าสู่โฟลเดอร์โปรเจกต์
cd C:\login-app

# 2. เริ่มต้นโปรเจกต์ Node.js
npm init -y

# 3. ติดตั้ง Package สำหรับ Web Server, การเชื่อมต่อ Database และ CORS
npm install express mysql2 cors

# 4. ติดตั้ง Nodemon เพื่อรีสตาร์ท Server อัตโนมัติเวลาแก้ไขโค้ด (ติดตั้งแบบ Global)
npm install -g nodemon
3. 💡 สาเหตุและวิธีแก้ไขปัญหา MODULE_NOT_FOUND
หากพบปัญหาโปรแกรมแครชและขึ้นข้อความแจ้งเตือน Error ในแถวที่ระบุคำสั่งเรียกใช้ cors ดังนี้:

JavaScript
code: 'MODULE_NOT_FOUND'
// เกิดปัญหาขึ้นที่ไฟล์ server.js บรรทัดที่ 2:
const cors = require("cors"); 
สาเหตุ:
เกิดจากเรายังไม่ได้กดติดตั้ง Package ที่ชื่อว่า cors เข้ามาในโปรเจกต์ (ในเครื่องคอมพิวเตอร์จึงยังไม่มีโฟลเดอร์ของโมดูลนี้)

ขั้นตอนการแก้ไข:

ให้กดปุ่ม Ctrl + C ที่หน้าต่าง Terminal/CMD นี้ก่อนเพื่อหยุดการทำงานเดิมของ nodemon

พิมพ์คำสั่งด้านล่างนี้แล้วกด Enter เพื่อดึง Package เข้ามาติดตั้งในโปรเจกต์:

Bash
npm install cors
เมื่อพิมพ์เสร็จและระบบทำการติดตั้งเรียบร้อยแล้ว ให้ลองสั่งรันระบบใหม่อีกครั้งด้วยคำสั่งเดิม:

Bash
nodemon server.js
4. ซอร์สโค้ดไฟล์ต่างๆ ในโปรเจกต์ (Source Code)
📄 ไฟล์ package.json
JSON
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
📄 ไฟล์ sql/database.sql
SQL
-- 1. สร้าง Database
CREATE DATABASE login_db;
USE login_db;

-- 2. สร้างตาราง users สำหรับเก็บข้อมูลผู้ใช้งาน
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  fullname VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. เพิ่มข้อมูลผู้ใช้ตัวอย่างสำหรับการทดสอบ Login
INSERT INTO users (username, password, fullname)
VALUES ('admin', '1234', 'Administrator');
📄 ไฟล์ db.js
JavaScript
const mysql = require('mysql2');

// สร้างการเชื่อมต่อกับฐานข้อมูล MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'login_db'
});

// เชื่อมต่อระบบ
connection.connect((err) => {
  if (err) {
    console.log('Database Connection Error');
    return;
  }
  console.log('Database Connected Successfully!');
});

module.exports = connection;
📄 ไฟล์ server.js (เวอร์ชันอัปเดตระบบ CORS + CRUD เต็มรูปแบบ)
JavaScript
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
 Server URL : http://localhost:${PORT}
 API Endpoint : POST http://localhost:${PORT}/login
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
      return res.status(500).json({ status: false, message: "Database Error" });
    }
    if (result.length > 0) {
      res.json({ status: true, message: "Login Success" });
    } else {
      res.json({ status: false, message: "Username หรือ Password ไม่ถูกต้อง" });
    }
  });
});

// === 2. ดึงข้อมูล User ทั้งหมด ===
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database Error' });
    }
    res.status(200).json({ success: true, data: result });
  });
});

// === 3. ดึงข้อมูล User เฉพาะบุคคล ===
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

// === 4. สร้าง User ใหม่ ===
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

// === 5. อัปเดตข้อมูล User ===
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
5. วิธีทดสอบการใช้งาน (Testing)
รันระบบเซิร์ฟเวอร์ด้วย Nodemon:

Bash
nodemon server.js
ทดสอบระบบ Login ด้วย Command Line (CMD):

Bash
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"1234\"}"
ทดสอบเพิ่มผู้ใช้ใหม่ (Create User):

Bash
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"us