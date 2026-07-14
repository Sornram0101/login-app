ตรวจสอบสถานะการทำงานด้วยคำสั่ง:
docker logs portainer

2. 📁 เตรียมความพร้อมของระบบ (Pre-requisites)
ใน Drive C: ให้สร้าง Folder (ตั้งชื่ออะไรก็ได้ตามต้องการ) เพื่อเอาไว้เก็บไฟล์โปรเจกต์

สร้าง Docker Volume ชื่อ db_data (หากยังไม่ได้สร้าง) โดยรันคำสั่ง:

docker volume create db_data

สร้าง Docker Network ชื่อ dev_net (หากยังไม่ได้สร้าง) โดยรันคำสั่ง:

docker network create dev_net
