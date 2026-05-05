# 🌱 Bugandayari
<img width="720" height="261" alt="image" src="https://github.com/user-attachments/assets/d862b44d-3c42-4d84-9f3c-a96f1712d9ac" />


> **Tanum · Bantay · Presyo**  
A farm management web app that helps farmers track crops, monitor growth, and stay updated with market prices.

---

## 📖 Description

**Bugandayari** is a simple yet powerful system designed for farmers to:
- 🌱 Track planted crops
- 📅 Monitor growth timelines
- 💰 View market prices
- 📊 Analyze expenses and profit

It also includes an **Admin Portal** for managing:
- User accounts
- Crop records (all users)
- Market prices

---

## 🚀 Features

### 👨‍🌾 Farmer App (`index.html`)
- 🔐 Login & Registration system  
- 🌦️ Weather display  
- 🌱 Crop tracking (Planted, Growing, Ready, Harvested)  
- 📅 Timeline view of crops  
- 💰 Market price viewer  
- 📊 Reports (Gastos vs Kita)  
- 📵 Offline support  
- 👤 Account management (change password, clear data)  

---

### 🛠️ Admin Panel (`admin.html`)
- 🔐 Admin login (default: `admin / admin1234`)  
- 📊 Dashboard overview (accounts, crops, prices)  
- 👥 Manage user accounts  
- 🌱 View all crop records  
- 💰 Manage market prices  
- ⚙️ System settings:
  - Reset prices  
  - Export/Import data  
  - Clear all records  

---

## 🧰 Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend / Database:** Supabase  
- **Other:**
  - Local storage (offline support)  
  - PWA features (installable app)  

---

## 📁 Project Structure

📦 bugandayari
┣ 📜 index.html # Farmer app
┣ 📜 admin.html # Admin panel
┣ 📜 shared.js # Shared logic (auth, storage, etc.)
┣ 📂 styles/
┃ ┣ 📜 index.css
┃ ┗ 📜 admin.css
┣ 📜 manifest.json # PWA config

---

## ⚙️ Installation

``bash
git clone https://github.com/your-username/bugandayari.git
cd bugandayari
Open index.html in your browser
or use Live Server.

 ## 🔑 Setup (Supabase)
Create a project in Supabase
Add your credentials in shared.js
Create tables:
accounts
crops
expenses
prices

##📱 Usage
Farmer
Register an account
Add crops
Track growth & harvest
View prices and reports
Admin

Open admin.html and login:

Username: admin  
Password: admin1234


📊 Future Improvements
📍 Location-based weather
📈 Advanced analytics charts
🔔 Notifications (harvest alerts)
📱 Mobile app version
🤝 Contributing
Fork the repo
Create a branch
Commit changes
Submit a pull request
📜 License

This project is for educational purposes.
👨‍💻 Author
Arcenas, Kong, Pamati-an


---

