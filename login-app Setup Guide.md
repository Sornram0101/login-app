# 🚀 login-app Setup Guide

ขั้นตอนการติดตั้งระบบผ่านทางเว็บ [vecskill.bncc.ac.th](http://vecskill.bncc.ac.th) และการคอนฟิก Docker ผ่าน Portainer

---

## 1. 🐳 ติดตั้งและตรวจสอบ Portainer
ทำการเชื่อมต่อเข้าเซิร์ฟเวอร์ และรันคำสั่งเพื่อติดตั้ง Portainer:

```bash
docker run -d -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
