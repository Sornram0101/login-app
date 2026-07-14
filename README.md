# 🚀 login-app Project & Setup Guide

คู่มือการติดตั้งเซิร์ฟเวอร์ด้วย Docker, Portainer และขั้นตอนการพัฒนา Back-End ด้วย Node.js + MySQL สำหรับระบบ Login และระบบจัดการผู้ใช้ (CRUD API)

---

## PART 1: 🐳 การเตรียมเซิร์ฟเวอร์ด้วย Docker & Portainer

ทำตามขั้นตอนด้านล่างนี้ผ่านทางหน้าเว็บ vecskill.bncc.ac.th หรือ Terminal ของเซิร์ฟเวอร์คุณ

### 1. ติดตั้งและตรวจสอบ Portainer
รันคำสั่งนี้เพื่อสร้าง Container สำหรับ Portainer:
```bash
docker run -d -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
```

ตรวจสอบสถานะการทำงานของ Portainer:
```bash
docker logs portainer
```

---

### 2. เตรียมความพร้อมของระบบ (Pre-requisites)

1. **สร้างโฟลเดอร์สำหรับพัฒนาโปรเจกต์:** ให้สร้างโฟลเดอร์ชื่อ `login-app` ไว้ใน Drive **C:**
2. **สร้าง Docker Volume** ชื่อ `db_data`:
```bash
docker volume create db_data
```

3. **สร้าง Docker Network** ชื่อ `dev_net`:
```bash
docker network create dev_net
```

---

### 3. การตั้งค่าระบบผ่าน Portainer Stacks

1. เปิดหน้าเว็บ Portainer เข้าไปที่เมนู **Stacks** -> คลิกปุ่ม **Add stack**
2. ตั้งชื่อ Stack ว่า: `web-devops`
3. ในส่วน **Build method** เลือกเป็น **Web editor**
4. คัดลอกโค้ด YAML ด้านล่างนี้ไปวางในช่องเขียนโค้ด:

```yaml
# กำหนด Volume สำหรับเก็บข้อมูล
volumes:
  db_data:
    external: true

# กำหนด Network ให้คุยกันได้
networks:
  dev_net:
    driver: bridge
    external: true

services:
  # Service สำหรับ Database (MariaDB)
  mariadb:
    image: mariadb:latest
    container_name: mariadb_container
    restart: always
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: bnccitconfig  # ควรเปลี่ยนรหัสผ่านนี้เพื่อความปลอดภัย
      MYSQL_DATABASE: mydb        # สร้าง database เริ่มต้น (Optional)
      MYSQL_USER: admin               # สร้าง user เริ่มต้น (Optional)
      MYSQL_PASSWORD: bnccitconfig        # รหัสผ่านของ user (Optional)
    volumes:
      - db_data:/var/lib/mysql           # Mount volume เพื่อเก็บข้อมูลถาวร
    networks:
      - dev_net

  # Web Server (ใช้ Image สำเร็จรูปที่มี MySQL Driver แล้ว)
  php-web:
    image: webdevops/php-apache:8.2  # มี PHP 8.2 + Apache + MySQL Driver ครบ
    container_name: php-web-server
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - WEB_DOCUMENT_ROOT=/app      # กำหนด Root Folder ของ Image นี้
      - PHP_DISPLAY_ERRORS=1        # เปิดโชว์ Error ของ PHP (เหมาะสำหรับ Dev)
    volumes:
      # Image นี้ใช้ Path /app แทน /var/www/html
      - c:/www:/app
    depends_on:
      - mariadb
    networks:
      - dev_net
 
  # Service สำหรับหน้าเว็บจัดการ Database (phpMyAdmin)
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: pma_container
    restart: always
    environment:
      PMA_HOST: mariadb                  # ต้องตรงกับชื่อ service ของ database ด้านบน
      PMA_PORT: 3306
      UPLOAD_LIMIT: 64M                  # เพิ่มขนาดไฟล์ upload (Optional)
    ports:
      - "81:80"                        # เข้าใช้งานผ่าน http://localhost:81
    depends_on:
      - mariadb                          # รอให้ MariaDB รันก่อนค่อยรัน phpMyAdmin
    networks:
      - dev_net
```

---
---

## PART 2: 💻 ใบความรู้การพัฒนา Back-End ด้วย Node.js และ MySQL

คู่มือขั้นตอนการสร้างระบบ Login เบื้องต้นและการเชื่อมต่อฐานข้อมูล MySQL ด้วย Node.js

### 1. โครงสร้างโปรเจกต์ (Project Structure)
สร้างไฟล์และโฟลเดอร์ภายในโฟลเดอร์โปรเจกต์ตามโครงสร้างนี้:
```text
login-app
│
├── node_modules/
├── package.json
├── server.js
├── db.js
└── sql/
    └── database.sql
```

---

### 2. การเตรียมตัวและสร้างโปรเจกต์

รันคำสั่งเหล่านี้ใน Terminal เพื่อเริ่มสร้างโปรเจกต์ Node.js และติดตั้ง Packages ที่จำเป็น (**มีการติดตั้ง cors เพิ่มเติม**):

```bash
# 1. สร้างโฟลเดอร์และเข้าสู่โฟลเดอร์โปรเจกต์
mkdir login-app
cd login-app

# 2. เริ่มต้นโปรเจกต์ Node.js (สร้าง package.json)
npm init -y

# 3. ติดตั้ง Package สำหรับ Web Server, การเชื่อมต่อ Database และ CORS
npm install express mysql2 cors

# 4. ติดตั้ง Nodemon เพื่อรีสตาร์ท Server อัตโนมัติเวลาแก้ไขโค้ด (ติดตั้งแบบ Global)
npm install -g nodemon
```

---

### 3. การจัดการฐานข้อมูล (Database Setup)

สร้างโฟลเดอร์ชื่อ `sql` และสร้างไฟล์ชื่อ `database.sql` จากนั้นคัดลอกคำสั่ง SQL ด้านล่างนี้เพื่อใช้สร้างตารางและข้อมูลทดสอบ:

```sql
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
```

**คำอธิบายฟิลด์ในตาราง users:**
* `id`: รหัสผู้ใช้ (Auto Increment)
* `username`: ชื่อเข้าสู่ระบบ
* `password`: รหัสผ่าน
* `fullname`: ชื่อจริง
* `created_at`: วันที่สร้างข้อมูลสำเร็จ

---

### 4. สร้างไฟล์เชื่อมต่อฐานข้อมูล (`db.js`)

สร้างไฟล์ `db.js` ในโฟลเดอร์หลักของโปรเจกต์ และใส่โค้ดเชื่อมต่อฐานข้อมูลดังนี้:

```javascript
const mysql = require('mysql2');

// สร้างการเชื่อมต่อกับฐานข้อมูล MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // หากตั้งรหัสผ่านที่ MySQL Server ให้ระบุตรงนี้
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
```

---

### 5. สร้าง Web Server และ API จัดการระบบ (`server.js`)

สร้างไฟล์ `server.js` ในโฟลเดอร์หลักของโปรเจกต์ และใส่โค้ดที่มีการเปิดใช้งาน **CORS** และ **API สำหรับจัดการข้อมูลผู้ใช้ (CRUD)** ดังนี้:

```javascript
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
 curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"1234\"}"
 
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
        message: "Login Success",
      });
    } else {
      res.json({
        status: false,
        message: "Username หรือ Password ไม่ถูกต้อง",
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

// === 3. ดึงข้อมูล User เฉพาะบุคคล ===
app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id=?', [id], (err, result) => {
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

// === 4. สร้าง User ใหม่ (เพิ่มข้อมูลผู้ใช้ใหม่) ===
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

// === 5. อัปเดตข้อมูล User ===
app.put('/api/users/:id', (req, res) => {
  const id = req.params.id;
  const { password, fullname } = req.body;
  
  db.query(`UPDATE users SET password=?, fullname=? WHERE id=?`, [password, fullname, id], (err, result) => {
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
```

---

### 6. วิธีทดสอบการใช้งาน (Testing)

#### 6.1 รันระบบ Back-End
ใช้ Nodemon เพื่อเปิดการใช้งาน Web Server:
```bash
nodemon server.js
```

#### 6.2 วิธีทดสอบระบบ Login

* **ทดสอบด้วย Command Line (CMD):**
  ```bash
  curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"1234\"}"
  ```

#### 6.3 ➕ วิธีเพิ่มข้อมูลผู้ใช้ใหม่ (Create User)
ในไฟล์ `server.js` ชุดใหม่นี้มี Endpoint สำหรับเพิ่มผู้ใช้มาให้แล้ว สามารถใช้วิธีด้านล่างนี้เพื่อกรอกข้อมูลผู้ใช้ใหม่ลงฐานข้อมูลได้เลยครับ:

* **วิธีที่ 1: เพิ่มผู้ใช้ผ่าน Command Line (CMD)**
  ก๊อบปี้คำสั่งนี้ไปรันในหน้าต่าง CMD บรรทัดเดียว เพื่อเพิ่มสมาชิกใหม่ชื่อ `user01`:
  ```bash
  curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"username\": \"user01\", \"password\": \"5678\", \"fullname\": \"New Student\"}"
  ```
  *ผลลัพธ์ที่ได้รับกลับมา:* `{"success":true,"message":"User Created","id":2}`

* **วิธีที่ 2: เพิ่มผู้ใช้ผ่าน Postman**
  1. เลือก Method เป็น **POST**
  2. กรอก URL: `http://localhost:3000/api/users`
  3. ไปที่แท็บ **Body** -> เลือก **raw** -> ปรับฟอร์แมตขวาสุดเป็น **JSON**
  4. ระบุข้อมูล JSON ผู้ใช้ใหม่ที่ต้องการลงไป เช่น:
     ```json
     {
       "username": "somchai",
       "password": "password99",
       "fullname": "Somchai Jaidee"
     }
     ```
  5. กดปุ่ม **Send** ข้อมูลจะถูกบันทึกเข้าสู่ MySQL ทันที
