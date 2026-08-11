# 🇮🇳 SmartDELHI

<p align="center">
  <strong>An intelligent civic technology platform for a cleaner, safer and more responsive Delhi.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SmartDELHI-Civic%20Intelligence-06b6d4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/AI-Gemini-8b5cf6?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-22c55e?style=for-the-badge" />
</p>

<p align="center"><i>Connect citizens • workers • administration • AI • GIS • real-time city intelligence</i></p>

---

## 🌆 What is SmartDELHI?

**SmartDELHI** is an AI-powered civic technology platform designed to connect **Delhi's citizens, municipal workers, administrators, AI and city intelligence systems** inside one ecosystem.

Instead of treating a civic complaint as only a form submission, SmartDELHI is designed around a complete lifecycle:

> **Report → Verify → Understand → Prioritize → Assign → Resolve → Measure → Improve**

The long-term objective is simple:

### **Make Delhi's civic infrastructure measurable, transparent and responsive.**

---

## ✨ Core Vision

| Layer | Purpose |
|---|---|
| 👥 **Citizen Layer** | Report, track and manage civic complaints |
| 🧑‍🔧 **Worker Layer** | Receive, accept and update assigned work |
| 🏛️ **Administration Layer** | Monitor wards, departments, complaints and performance |
| 🤖 **AI Layer** | Verify and classify complaint evidence |
| 🗺️ **GIS Layer** | Visualize Delhi geographically |
| 📊 **Analytics Layer** | Convert civic activity into actionable intelligence |
| 📡 **Real-time Layer** | Monitor live civic conditions and operations |

---

# 🚀 Key Features

## 👤 Citizen Portal

Citizens can:

- Create an account and securely log in
- Report civic issues
- Submit complaint details
- Upload supporting media
- Track complaint status
- View complaint history
- Manage profile information
- Receive notifications
- Explore Delhi's live civic map
- View civic statistics and city intelligence
- Contact the SmartDELHI team

### Civic issue categories

- 🗑️ Garbage & waste
- 🛣️ Roads & potholes
- 🚰 Water
- 🚽 Sewage & sanitation
- ⚡ Electricity
- 🧹 Cleanliness
- 🏫 Public infrastructure
- 🌳 Environment

---

# 🤖 AI-Powered Complaint Verification

One of SmartDELHI's core capabilities is **AI-assisted complaint verification**.

The planned verification pipeline:

```text
Citizen Complaint
       │
       ▼
Photo / Video Evidence
       │
       ▼
Gemini AI Analysis
       │
       ├── Issue detected
       ├── Issue category
       ├── Severity
       ├── Estimated scale
       └── Confidence score
       │
       ▼
Complaint Prioritization
       │
       ▼
Ward / Department Mapping
       │
       ▼
Worker / Administration
       │
       ▼
Resolution & Status Tracking
```

This moves civic reporting from **"a complaint was submitted"** toward **"the system understands what happened, where it happened, how serious it is and what should happen next."**

> 🚧 Gemini verification is the major AI integration milestone currently remaining.

---

# 🗺️ Delhi Live Intelligence

The platform includes a GIS-oriented Delhi intelligence experience supporting:

- 📍 Complaint locations
- 🏙️ Delhi geographic visualization
- 🗺️ Ward-level intelligence
- 🔥 Civic issue concentration
- 🚛 Worker / vehicle intelligence
- 📊 Location-based analytics
- 🧭 Operational map controls

The citizen portal already contains the Delhi map setup, while the main dashboard integrates the same map experience into the wider intelligence interface.

---

# 📊 Civic Intelligence Dashboard

SmartDELHI is designed as a **city intelligence interface**, not simply a collection of cards.

It brings together:

- Live civic information
- Complaint statistics
- Ward-level intelligence
- City ratings
- Civic indicators
- MCD information
- Infrastructure metrics
- Education indicators
- Housing information
- Sanitation information
- Road infrastructure
- Green / forest coverage
- Sex-ratio indicators
- Smart-city information

Where reliable live APIs are unavailable, the architecture supports **verified fallback data** instead of rendering empty/null dashboard blocks.

---

# 🏛️ MCD & Administrative Intelligence

The reporting layer focuses on:

### MCD Budget Intelligence

Historical budget visualization for:

- 2023–24
- 2024–25
- 2025–26

It is designed to compare:

- Budget allocation
- Department-wise allocation
- Infrastructure priorities
- Civic expenditure
- Areas requiring additional investment

### Civic Need & Risk Analysis

The reporting experience is designed to investigate:

- How much funding Delhi actually needs
- Which MCD departments require improvement
- Which civic sectors require greater intervention
- Which wards require additional attention
- Where infrastructure gaps are concentrated
- How environmental and seasonal conditions affect civic pressure

The objective is to turn raw civic data into **decision-support intelligence**.

---

# 📰 Civic Awareness & Public Information

SmartDELHI also includes visual information modules such as:

- Delhi image gallery
- Civic reviews / rating interface
- Civic indicators
- MCD reports
- Public-facing city intelligence
- Newspaper / media evidence panels

These modules use a modern, high-density visual language designed for a premium civic-tech experience.

---

# 📞 SmartDELHI Civic Connect

The Contact Us experience provides a direct communication channel between users and the platform.

The workflow supports:

- Full name
- Email
- Phone
- Topic selection
- Subject
- Message
- Server-side processing
- Email notification through Resend

---

# 🔐 Authentication & Security

SmartDELHI is built around role-based civic access:

```text
Citizen
   │
   ├── Login
   ├── Complaints
   ├── Tracking
   └── Profile

Worker
   │
   ├── Assigned complaints
   ├── Accept job
   └── Update status

Administrator
   │
   ├── Ward intelligence
   ├── Complaint analytics
   ├── Reports
   └── System monitoring
```

The architecture supports:

- JWT-based authentication
- Role-based access
- Password hashing
- Protected API routes
- Server-side environment variables
- Database-backed application state

---

# 🧠 Technology Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React**

### Maps & GIS

- **Google Maps**
- **Leaflet**
- **React Leaflet**

### AI / Computer Vision

- **Google Gemini**
- AI-assisted complaint verification
- Image/media understanding
- Civic issue classification

### Backend

- **Next.js API Routes**
- REST-style API architecture
- Server-side validation
- Authentication APIs

### Database

- **PostgreSQL**
- **Prisma ORM**

### Communication

- **Resend**
- Email notification workflow

### Development

- VS Code
- Git
- GitHub
- npm
- Windows / PowerShell

---

# 🏗️ Project Architecture

```text
SmartDELHI/
│
├── client/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── citizen/
│   │   │   ├── worker/
│   │   │   └── admin/
│   │   ├── contact/
│   │   ├── report/
│   │   └── api/
│   │       ├── auth/
│   │       ├── complaints/
│   │       ├── contact/
│   │       └── ...
│   │
│   ├── components/
│   │   ├── DelhiLiveMap.tsx
│   │   ├── HeroSection.tsx
│   │   ├── DelhiGallery.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── aiScoreTypes.ts
│   │   └── ...
│   │
│   └── prisma/
│       └── schema.prisma
│
└── README.md
```

> The exact structure may evolve as the platform moves toward production architecture.

---

# 🔄 Complaint Lifecycle

```text
┌─────────────────┐
│     CITIZEN     │
│ Reports Issue   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MEDIA / DATA   │
│ Photo / Video   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    GEMINI AI    │
│ Verify + Classify│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PRIORITY ENGINE │
│ Severity + Risk │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WARD / DEPT.   │
│     MAPPING     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     WORKER      │
│   Assignment    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    RESOLUTION   │
│ Status Updates  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    ANALYTICS    │
│ Measure Results │
└─────────────────┘
```

---

# 🎨 Design Philosophy

SmartDELHI follows a premium civic-tech visual system:

- Dark glassmorphism
- Cyan / blue intelligence accents
- Soft gradients
- Subtle glow effects
- Framer Motion animations
- Particle-network backgrounds
- Smooth transitions
- Responsive layouts
- High information density
- Clear visual hierarchy
- Map-first intelligence
- Apple-inspired minimalism with civic-tech aesthetics

> **Modern enough for technology. Clear enough for citizens. Powerful enough for administrators.**

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/SmartDELHI.git
cd SmartDELHI
```

## 2. Open the client

```bash
cd client
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

Create:

```text
.env.local
```

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret"
GOOGLE_MAPS_API_KEY="your-google-maps-key"
GEMINI_API_KEY="your-gemini-key"
RESEND_API_KEY="your-resend-key"
CONTACT_EMAIL="your-email@example.com"
DATA_GOV_API_URL=""
DATA_GOV_API_KEY=""
```

> **Never commit `.env.local` or API keys to GitHub.**

## 5. Database setup

```bash
npx prisma generate
npx prisma migrate dev
```

Optional database browser:

```bash
npx prisma studio
```

## 6. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 7. Production build

```bash
npm run build
npm start
```

---

# 🔑 Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Authentication security |
| `GOOGLE_MAPS_API_KEY` | Google Maps integration |
| `GEMINI_API_KEY` | AI complaint verification |
| `RESEND_API_KEY` | Email delivery |
| `CONTACT_EMAIL` | Contact-message destination |
| `DATA_GOV_API_URL` | Optional government data endpoint |
| `DATA_GOV_API_KEY` | Optional government API key |

---

# 📌 Current Development Status

SmartDELHI is in **active development**.

### Implemented / substantially implemented

- [x] Project foundation
- [x] Next.js application
- [x] Database architecture
- [x] Authentication foundation
- [x] Role-based architecture
- [x] Citizen dashboard
- [x] Complaint system
- [x] Complaint tracking
- [x] Profile / notifications
- [x] Delhi live map integration
- [x] Civic intelligence dashboard
- [x] Delhi image gallery
- [x] Civic reviews / rating interface
- [x] Civic statistics
- [x] MCD reporting interface
- [x] Budget visualization
- [x] Contact Us page
- [x] Email notification workflow
- [x] Responsive / animated UI

### 🚧 In active development

- [ ] Gemini complaint verification
- [ ] AI confidence / severity engine
- [ ] Automated complaint classification
- [ ] Image / video evidence analysis
- [ ] Advanced ward-level intelligence
- [ ] Worker assignment automation
- [ ] Real-time operational tracking
- [ ] Production-grade testing
- [ ] Deployment hardening

---

# 🛣️ Roadmap

### Phase 1 — Foundation
- [x] Project setup
- [x] Database design
- [x] Application architecture

### Phase 2 — Authentication
- [x] Citizen login
- [x] Worker login architecture
- [x] Admin login architecture
- [x] JWT
- [x] Role-based access

### Phase 3 — Citizen Experience
- [x] Citizen dashboard
- [x] Complaint reporting
- [x] Complaint tracking
- [x] Profile
- [x] Notifications
- [x] Map experience

### Phase 4 — Worker Operations
- [x] Worker dashboard foundation
- [x] Assigned complaints
- [ ] Advanced live route intelligence
- [ ] Automated assignment

### Phase 5 — Administration
- [x] Admin architecture
- [x] Reports
- [x] Budget intelligence
- [x] Ward analytics
- [ ] Advanced predictive analytics

### Phase 6 — AI Intelligence
- [ ] Gemini verification
- [ ] Image classification
- [ ] Video evidence analysis
- [ ] Severity scoring
- [ ] Quantity estimation
- [ ] Confidence scoring
- [ ] Automated prioritization

### Phase 7 — City Intelligence
- [x] GIS map
- [x] Civic indicators
- [x] Reports
- [ ] Advanced ward intelligence
- [ ] Predictive civic risk

### Phase 8 — Production
- [ ] Automated testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Monitoring
- [ ] Production deployment

---

# 🧩 Why SmartDELHI?

Traditional civic systems often separate:

**Citizen complaints** • **Municipal operations** • **Administrative decisions** • **Geographic information** • **Public reporting**

SmartDELHI attempts to connect them through one intelligence loop:

```text
Citizen Data
     ↓
AI Understanding
     ↓
Operational Action
     ↓
Administrative Intelligence
     ↓
Public Accountability
     ↓
Better Civic Decisions
```

---

# 🎯 Long-Term Vision

SmartDELHI is not intended to be just another complaint portal.

The larger vision is a **digital civic operating layer for Delhi** where:

- Citizens can be heard faster.
- Workers receive clearer operational information.
- Administrators can see where resources are needed.
- AI can reduce manual verification.
- GIS can reveal geographic patterns.
- Data can support better allocation of public resources.
- Civic performance can become measurable.
- Public infrastructure can be managed proactively instead of reactively.

### The goal:

# **From complaints to intelligence. From intelligence to action. From action to a smarter Delhi. 🇮🇳**

---

# 🤝 Contributing

SmartDELHI is currently under active development.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes and test locally.
4. Commit:

```bash
git add .
git commit -m "feat: add your feature"
```

5. Push:

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

# 🔒 Security

If you discover a security issue:

- Do **not** publish API keys, database credentials or JWT secrets.
- Do **not** commit `.env.local`.
- Rotate exposed credentials immediately.
- Report security issues privately to the project maintainers.

---

# 📜 License

This project is currently under active development. Add the final project license before public production release.

---

<p align="center">
  <strong>SmartDELHI 🇮🇳</strong><br/>
  <sub>Technology for a cleaner, safer and smarter city.</sub>
</p>
