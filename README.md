# 🎓 Skill-Sync — SISTec Alumni Portal

A full-stack social networking and career platform built exclusively for **SISTec (Sagar Institute of Science & Technology)** students, alumni, and faculty. Skill-Sync bridges the gap between current students and graduates — enabling collaboration, networking, job opportunities, and community engagement under one roof.

**Live URL:** [https://alumni.sistec.ac.in](https://alumni.sistec.ac.in)

---

## 📁 Project Structure

```
Skill-Sync/
├── FRONTEND/        # React.js student/alumni portal (Port 3000)
├── BACKEND/         # Node.js + Express API server (Port 8800)
└── admin/           # React.js admin dashboard (Port 3001)
```

---

## ✨ Features

### 👤 Authentication & Onboarding
- **Enrollment-based registration** — Students and alumni must provide a valid enrollment number to register. It is validated against the college's student database before account creation.
- **Faculty registration** — Faculty accounts require admin approval before activation.
- **JWT authentication** — Tokens stored in HTTP-only cookies. Both cookie and `Authorization: Bearer` header strategies supported.
- **Forgot Password** — Secure token-based email link to reset password (expires in 1 hour).
- **Forgot Enrollment Number** — Recover your enrollment number via a secure email link.
- **Rate limiting on login** — Max 10 attempts per 5 minutes to prevent brute-force attacks.
- **Role-based access** — Three roles: `student`, `alumni`, `faculty`, and `admin`.

### 🏠 Home Feed
- Social-media-style feed displaying posts from the community.
- Create posts with text and image uploads (images compressed client-side before upload).
- **Post moderation** — All new posts go into a `pending` state and must be approved by an admin before appearing in the feed.
- Like and comment on posts.
- Skeleton loading states for smooth UX while data loads.

### 👤 Profile Page
- Full user profile with cover photo and avatar (both uploadable to Cloudinary).
- Sections for Skills, Education, Professional Experience, and Other info.
- Social media links: Facebook, Instagram, Twitter/X, LinkedIn.
- Address fields: village, district, state, pincode.
- Edit Profile page with all sections editable.
- View any other user's profile.

### 💬 Real-Time Messaging
- One-on-one direct messaging between users.
- Powered by **Socket.IO** for real-time delivery.
- Online/offline presence indicator — shows which users are currently active.
- Image sharing in messages.
- Chat sidebar with conversation list.

### 🧵 Forums
- Community Q&A / discussion threads.
- Create forum posts with a title, description, and tags.
- Threaded comments on each forum post.
- Skeleton loaders for forums list and individual posts.

### 💼 Jobs
- Alumni and faculty can post job/internship offers.
- Students can browse and apply for jobs.
- Application status pipeline: `Registered → In Progress → Rejected → Selected → Offered`.
- Detailed job description page with full offer details (CTC, fixed gross, bonuses, bond, location, etc.).
- Offer letter and Letter of Intent path storage.
- Separate "Explore Jobs" and "Posted Jobs" tabs.
- "Create Offer" form for alumni/faculty to post opportunities.
- Skeleton loader for job listings.

### 🤝 Collaborate
- Project collaboration board where users post projects they're working on and need teammates for.
- Post a project with title, description, tech stack, number of slots, and deadline.
- Project status: `Open`, `In Progress`, `Completed`.
- Apply to join projects with a note; project owner can accept or reject applicants.
- Project updates feature — owners can post progress updates.
- View detailed project modal with applicants list and management.

### 👥 People
- Browse all registered users on the platform.
- Click a user to start a direct message conversation.

### 🖼️ Gallery
- Photo gallery showcasing alumni and college events.
- Carousel navigation with left/right controls.

### 📅 Events
- Events page for college/alumni events.

### 📋 Alumni Form
- Event attendance form for alumni reunions and gatherings.
- Fields: attending status, phone number, occupation, city, special requirements, accommodation needs (with date picker for accommodation dates).

### 🔔 Address Banner
- Nudges users who haven't filled in their address details to complete their profile.

### 📱 Progressive Web App (PWA)
- Fully installable on Android, iOS, and desktop as a standalone app.
- Service worker for offline caching.
- Custom splash screen with animated branding shown before the React bundle loads.
- Manifest with icons, theme color, and app name.

### 🌙 Dark Mode
- Full dark/light theme support across all pages via React Context and SCSS theming.

---

## 🛠️ Tech Stack

### Frontend (`FRONTEND/`)
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| TanStack React Query v5 | Server state, caching, refetching |
| Zustand v5 | Client-side state (auth, chat) |
| Socket.IO Client v4 | Real-time messaging |
| Tailwind CSS v4 | Utility-first styling |
| SCSS / Sass | Component-level styles and theming |
| Framer Motion | Animations |
| MUI (Material UI) v5 | UI components |
| Lucide React | Icon library |
| React Icons | Additional icon library |
| React Hot Toast / React Toastify | Toast notifications |
| React Fast Marquee | Scrolling alumni marquee |
| Swiper.js | Event carousel |
| AOS | Scroll animation library |
| tsParticles | Particle background effects |
| React Multi Date Picker | Date selection in alumni form |
| React Select | Searchable dropdowns |
| Browser Image Compression | Client-side image compression before upload |
| date-fns | Date formatting utilities |
| React Bootstrap | Bootstrap components |
| Lottie Player | Lottie animations (Coming Soon page) |

### Backend (`BACKEND/`)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Primary database |
| Socket.IO v4 | Real-time WebSocket server |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Cloudinary | Image storage and delivery |
| Multer | File upload handling |
| Nodemailer | Transactional emails (password reset, enrollment recovery) |
| express-rate-limit | Brute-force protection on login |
| cookie-parser | Cookie handling |
| dotenv | Environment variable management |
| csv-parser / xlsx | Batch student data import |
| streamifier | Stream buffer to Cloudinary |

### Admin Panel (`admin/`)
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router v7 | Routing |
| Axios | HTTP requests |
| jsPDF | PDF export |
| PapaParse | CSV parsing |
| XLSX | Excel export |
| SweetAlert2 | Confirmation dialogs |
| Lucide React | Icons |
| React Icons | Icons |
| Sass | Styling |

---

## 🗄️ Database Models

### `User`
Core user account. Fields: `email`, `password`, `name`, `role`, `profilePic`, `coverPhoto`, `about`, `skills[]`, `education[]`, `experience[]`, `others`, `facebook`, `instagram`, `twitter`, `linkedin`, `village`, `district`, `state`, `pincode`, `isActive`, `resetToken`, `resetTokenExpiry`.

### `Student`
College student master data (imported by admin). Fields: `EnrollmentNo`, `StudentName`, `EmailId`, `MobileNo`, `batch` (YYYY-YYYY format), `branch`, `role`. Used to validate enrollment during registration.

### `Post`
Feed posts. Fields: `desc`, `img`, `userId`, `createdAt`, `status` (`pending` / `approved` / `declined`).

### `PendingPost`
Staging model for posts awaiting admin review.

### `Comment`
Comments on feed posts. Fields: `comment`, `userId`, `postId`.

### `Like`
Post likes. Fields: `userId`, `postId`.

### `Forum`
Discussion threads. Fields: `title`, `description`, `tags[]`, `created_by`.

### `ForumComment`
Comments on forum posts. Fields: `text`, `forum` (ref), `created_by`.

### `Job`
Job/internship listings. Fields: `job_title`, `organisation_name`, `offer_type`, `joining_date`, `location`, `remote_working`, `cost_to_company`, `fixed_gross`, `bonuses`, `offer_letter_path`, `letter_of_intent_path`, `job_description`, `bond_details`.

### `JobApplication`
Job applications. Fields: `jobId`, `studentId`, `status` (`Registered` / `In Progress` / `Rejected` / `Selected` / `Offered`), `appliedAt`.

### `Project`
Collaborate section projects. Fields: `title`, `description`, `techStack[]`, `slots`, `deadline`, `postedBy`, `status` (`open` / `in-progress` / `completed`).

### `Application`
Project collaboration applications. Fields: `projectId`, `studentId`, `note`, `status` (`pending` / `accepted` / `rejected`). Unique index on `(projectId, studentId)`.

### `ProjectUpdate`
Progress updates on a project. Fields: `projectId`, `postedBy`, `content`.

### `Message`
Direct messages. Fields: `senderId`, `receiverId`, `text`, `image`.

### `AlumniForm`
Alumni event attendance. Fields: `userId`, `attending`, `phoneNumber`, `occupation`, `city`, `specialRequirements`, `accommodation.required`, `accommodation.dates[]`.

### `AlumniUpdate`
Admin-posted updates about alumni (promotions, awards, etc.). Fields: `studentId`, `note`, `category`, `isVisible`.

---

## 🔌 API Endpoints

All routes are prefixed with `/API_B`.

| Prefix | Module |
|---|---|
| `/API_B/auth` | Register, login, logout, forgot/reset password, enrollment recovery |
| `/API_B/users` | Get/update user info |
| `/API_B/profile` | Profile data and address |
| `/API_B/posts` | Feed posts (create, approve, fetch) |
| `/API_B/comments` | Post comments |
| `/API_B/likes` | Post likes |
| `/API_B/forums` | Forum CRUD |
| `/API_B/jobs` | Job listings and applications |
| `/API_B/messages` | Direct messages |
| `/API_B/collaborate` | Projects and project applications |
| `/API_B/admin` | Admin dashboard operations |
| `/API_B/alumni-form` | Alumni event form |
| `/API_B/alumni-updates` | Alumni achievement updates |
| `/health` | Health check endpoint |

---

## 🏢 Admin Panel

The admin panel (`/admin`) is a separate React app deployed independently.

**Admin capabilities:**
- **Dashboard** — Overview stats (users, posts, jobs, batches).
- **Manage Users** — View all users, activate/deactivate accounts, approve faculty registrations, assign roles.
- **Posts Moderation** — Approve or decline pending posts before they go live on the feed.
- **Jobs** — View all posted jobs, manage listings, view applications per job with status pipeline.
- **Job Detail** — Full applicant list for each job with status management.
- **Gallery** — Upload and manage gallery images.
- **Batches** — Import student data via CSV/Excel for enrollment validation.
- **Alumni Forms** — View alumni event attendance responses.
- **Alumni Updates** — Post achievements/updates about alumni (promotions, awards, higher studies).
- **Create Admin** — Create new admin accounts.
- **Export** — Export data as PDF or Excel/CSV.

---

## 🚀 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Render | `https://skill-sync-frontend.onrender.com` |
| Backend | Render | `https://skill-sync-backend-522o.onrender.com` |
| Admin Panel | Render | `https://skill-sync-admin.onrender.com` |
| Production | Custom Domain | `https://alumni.sistec.ac.in` |

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
PORT=8800
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/social_db
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_EMAIL=youremail@gmail.com
SMTP_PASSWORD=your_app_password
```

### Frontend (`.env`)
```env
REACT_APP_API_BASE_URL_LOCAL=http://localhost:8800
REACT_APP_API_BASE_URL_PROD=https://skill-sync-backend-522o.onrender.com
```

---

## 🏃 Running Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)
- Cloudinary account
- Gmail account (for SMTP emails)

### Backend
```bash
cd BACKEND
npm install
# Create .env with the variables above
npm run dev
# Runs on http://localhost:8800
```

### Frontend
```bash
cd FRONTEND
npm install
npm start
# Runs on http://localhost:3000
```

### Admin Panel
```bash
cd admin
npm install
npm start
# Runs on http://localhost:3001
```

---

## 🔐 Security Features

- HTTP-only cookie JWT storage (XSS-safe)
- bcryptjs password hashing (salt rounds: 10)
- Rate limiting on login route (10 attempts / 5 min)
- CORS whitelist — only approved origins can call the API
- Admin-only middleware guards all admin routes
- Post moderation — no content goes live without admin approval
- Enrollment validation at registration — no fake accounts
- Token expiry + clock skew tolerance on JWT verification
- Password reset tokens expire in 1 hour

---

## 📂 Key Frontend Architecture

```
FRONTEND/src/
├── App.js                  # Router setup, Layout wrapper, Protected routes
├── style.scss              # Global SCSS: theme variables, mixins, breakpoints
├── axios.js                # Axios instance with base URL and credentials
├── store/
│   └── useAuthStore.js     # Zustand: socket connection, current user
├── context/
│   ├── authContext.js      # React Context: current user session
│   └── darkModeContext.js  # React Context: dark/light theme
├── components/
│   ├── navbar/             # Top navigation bar
│   ├── leftBar/            # Sidebar navigation
│   ├── share/              # Post creation component
│   ├── posts/              # Feed post list
│   ├── post/               # Individual post card + skeleton
│   ├── comments/           # Comments section
│   ├── footer/             # Footer
│   ├── AddressBanner/      # Address completion nudge
│   └── SplashScreen/       # Animated loading screen on first load
└── pages/
    ├── LandingPage/        # Public landing page with alumni marquee + events
    ├── home/               # Authenticated feed
    ├── ProfilePage/        # User profile + edit
    ├── forums/             # Forum list + comment page
    ├── createForum/        # New forum post
    ├── job/                # Job listings + description
    ├── jobs/               # Create job offer
    ├── Collaborate/        # Project collaboration board
    ├── messages/           # Real-time chat
    ├── people/             # Browse users
    ├── gallery/            # Photo gallery
    ├── events/             # Events page
    ├── AlumniForm/         # Event attendance form
    ├── Comingsoon/         # Placeholder for unreleased features
    ├── Update Password/    # Forgot + reset password
    └── recoverEnroll/      # Enrollment number recovery
```

---

## 🗺️ Route Map

| Path | Page | Auth Required |
|---|---|---|
| `/` | Landing Page | ❌ |
| `/home` | Feed | ✅ |
| `/profile/:id` | User Profile | ✅ |
| `/edit-profile/:id` | Edit Profile | ✅ |
| `/forums` | Forums List | ✅ |
| `/forums/:id/comments` | Forum Thread | ✅ |
| `/create-forum` | Create Forum | ✅ |
| `/job` | Job Listings | ✅ |
| `/jobs/:id` | Job Detail | ✅ |
| `/jobs/CreateOffer` | Post a Job | ✅ |
| `/events` | Events | ✅ |
| `/messages` | Direct Messages | ✅ |
| `/people` | Browse People | ✅ |
| `/gallery` | Photo Gallery | ✅ |
| `/collaborate` | Collaboration Board | ✅ |
| `/alumni-form` | Event Attendance | ✅ |
| `/fundraiser` | Coming Soon | ✅ |
| `/resume-builder` | Coming Soon | ✅ |
| `/forgot-password` | Forgot Password | ❌ |
| `/reset-password/:token` | Reset Password | ❌ |
| `/forgot-enrollment` | Forgot Enrollment | ❌ |
| `/recover-enrollment/:token` | Recover Enrollment | ❌ |

---

## 🐛 Known Issues & Notes

- **Scroll bug (fixed):** The splash screen CSS introduced `overflow: hidden` and `height: 100%` on `html` and `body` globally in `FRONTEND/public/index.html`, which broke scrolling across all pages. Fixed by keeping only the `body::before` overlay for the splash effect without constraining the document scroll.
- The `Resume Builder` and `Fundraiser` pages are placeholders showing a "Coming Soon" screen.
- `user.model.js` in the backend is a commented-out legacy file — the active user model is `Users.js`.
- Alumni registration uses the same enrollment-number validation as student registration.

---

## 👥 Roles Summary

| Role | Registration | Post Approval | Can Post Jobs | Admin Panel |
|---|---|---|---|---|
| `student` | Auto (with valid enrollment) | Required | ❌ | ❌ |
| `alumni` | Auto (with valid enrollment) | Required | ✅ | ❌ |
| `faculty` | Manual (admin approval) | Required | ✅ | ❌ |
| `admin` | Admin panel only | Bypass | ✅ | ✅ |

---

*Built with ❤️ for the SISTec community.*