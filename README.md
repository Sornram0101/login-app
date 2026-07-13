# login-app
vecskill.bncc.ac.th
docker run -d -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
1.ใน Drive C ให้สร้าง Folder ชื่อว่า www
2.ให้สร้าง Docker Volume ชื่อ db_data ถ้ายังไม่ได้สร้าง
>docker volume create db_data


3.ให้สร้าง Docker Network ชื่อ dev_net กรณีที่ยังไม่ได้สร้าง
>docker network create dev_net

4.จากนั้นคัดลอก Compose ด้านล่างนี้ไปใส่ในช่องของ Stacks -> Add stack ->  Web editor
4.1 ตั้งชื่อ stack ชื่อ web-devops

4.2 นำข้อความด้านล่างไปใส่ในช่อง 
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

4.3 คลิกที่ Deploy
