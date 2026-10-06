# 🏥 ArogyaSetu — Smart Rural Health Assistant

> **Bridging the healthcare gap for rural and underserved communities in India**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Admin%20Dashboard-0f4c81?style=for-the-badge)](https://smart-rural-health-assistant-j3jf.vercel.app/) [![Health Worker Portal](https://img.shields.io/badge/🩺%20Live%20Demo-Health%20Worker%20Portal-059669?style=for-the-badge)](https://aid-rural-doctor.lovable.app)

---

## 🚀 Live Deployments

| Portal | Link | Users |
|--------|------|-------|
| 🔵 Admin Dashboard | [smart-rural-health-assistant-j3jf.vercel.app](https://smart-rural-health-assistant-j3jf.vercel.app/) | District Officers, Doctors |
| 🟢 Health Worker Portal | [aid-rural-doctor.lovable.app](https://aid-rural-doctor.lovable.app) | ASHA Workers, ANMs |

### Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| District Health Officer | `admin` | `admin123` |
| Medical Officer | `doctor1` | `doc123` |
| ASHA Worker | `asha1` | `asha123` |

---

## 📌 Problem Statement

**SIH 2024 — PS Title:** Accessibility and quality of public healthcare services, particularly in rural and underserved areas

Rural and underserved communities face:
- Long travel distances to reach specialists
- Shortage of doctors and diagnostic equipment
- Fragmented medical records across facilities
- Delayed referrals with no tracking
- Limited awareness of available health services
- Low connectivity, language barriers, and affordability issues

---

## 💡 Our Solution

**ArogyaSetu** (Bridge to Health) is an integrated, offline-first rural healthcare platform that connects patients, ASHA workers, and district health administrators through a unified digital system.

---

## ✨ Key Features

### 🔵 Admin Dashboard
- 📊 **Real-time Analytics** — Patient counts, referral rates, consultation trends
- 👥 **Patient Registry** — Searchable database with risk classification
- 🔁 **Referral Tracker** — Track referrals from PHC to district hospital
- 💊 **Medicine Stock Monitor** — Critical stock alerts across all facilities
- 🤖 **AI Triage Engine** — Symptom-based severity assessment (HIGH/MEDIUM/LOW)
- 📹 **Teleconsultation** — Connect rural patients with remote specialists
- 🏥 **Facility Dashboard** — Monitor all health centres in the district

### 🟢 Health Worker Portal (ASHA/ANM)
- 🏠 **Personalized Home** — High-risk patients, tasks, and announcements
- 👤 **Patient Management** — View and search assigned patients
- 📋 **Patient Registration** — Generate ABHA Health ID instantly
- 📈 **Vitals Recording** — Log BP, temperature, SpO2, pulse
- 🤖 **AI Triage** — Offline symptom assessment tool
- ✅ **Task Manager** — Daily follow-up task tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Web Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Mobile App | React Native, Expo |
| Navigation | React Navigation v6 |
| AI Engine | Rule-based Clinical Decision Logic (Offline) |
| Backend (Planned) | FastAPI, PostgreSQL, JWT |
| Standards | ABDM / FHIR, ABHA Health ID |
| Deployment | Vercel |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│              ArogyaSetu Platform             │
├──────────────────┬──────────────────────────┤
│  Admin Dashboard │  Health Worker Portal    │
│  (Blue Theme)    │  (Green Theme)           │
│                  │                          │
│  • Analytics     │  • Patient Registration  │
│  • Referrals     │  • Vitals Recording      │
│  • Medicine      │  • AI Triage             │
│  • Teleconsult   │  • Task Management       │
├──────────────────┴──────────────────────────┤
│           Shared AI Triage Engine           │
│         (Offline, No API Required)          │
├─────────────────────────────────────────────┤
│         Mock Data Layer (Prototype)         │
│   Patients | Referrals | Medicines | Tasks  │
└─────────────────────────────────────────────┘
```

---

## 🚦 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/Hariti076/Smart-Rural-Health-Assistant.git

# Navigate to project
cd Smart-Rural-Health-Assistant

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

---

## 📱 Screens & Pages

### Admin Portal
| Page | Description |
|------|-------------|
| Login | Role-based authentication |
| Dashboard | Analytics overview with charts |
| Patients | Registry with search and risk filter |
| Referrals | Track referral status across facilities |
| Medicines | Stock levels with critical alerts |
| AI Triage | Symptom assessment engine |
| Teleconsult | Remote specialist connection |
| Facilities | District facility overview |

### Health Worker Portal
| Page | Description |
|------|-------------|
| Home | Personalized dashboard with tasks |
| My Patients | Assigned patient list |
| Register Patient | ABHA Health ID generation |
| Record Vitals | BP, SpO2, temp, pulse logging |
| AI Triage | Offline symptom checker |
| My Tasks | Daily follow-up management |

---

## 🎯 Impact & Outcomes

- ⬇️ Reduced travel time for rural patients
- ⚡ Faster triage and specialist consultation
- ✅ 100% referral tracking and completion visibility
- 🤰 Better follow-up for maternal and child health
- 💊 Real-time medicine availability monitoring
- 📡 Works offline — designed for 2G connectivity

---

## 🔮 Future Scope

- [ ] FastAPI + PostgreSQL backend integration
- [ ] ABDM / ABHA full compliance
- [ ] Gemini AI multilingual chatbot (Telugu, Hindi, English)
- [ ] WhatsApp alerts for high-risk patient follow-up
- [ ] Mobile APK for Android devices
- [ ] Integration with National Health Stack

---

## 👥 Team

**Institution:** PVP Siddhartha Institute of Technology, Vijayawada, Andhra Pradesh

| Name | Role |
|------|------|
| **P. Hariti** | Team Lead & Full Stack Developer |
| **N. Varshini** | Frontend Developer |
| **P. Vaishnavi** | UI/UX Designer |
| **P. Hima Sri** | Backend & Data |
| **M. Murali Krishna** | Mobile App Developer |
| **M. Sashank** | AI & Research |

---

## 📄 License

This project was built for **Smart India Hackathon (SIH)** by Team ArogyaSetu.

---

<div align="center">
  <strong>Built with ❤️ for Rural India</strong><br/>
  <em>ArogyaSetu — Bridging the Healthcare Gap</em>
</div>
