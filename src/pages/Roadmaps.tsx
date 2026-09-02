import React, { useState, useEffect } from "react";
import {
  Trophy,
  BookOpen,
  Code,
  Sparkles,
  MessageSquare,
  FileText,
  Bookmark,
  Award,
  Settings,
  Sun,
  Moon,
  Laptop,
  Play,
  ChevronRight,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  ShieldCheck,
  Download,
  Printer,
  Share2,
  BookmarkCheck,
  Compass,
  Briefcase,
  Zap,
  CheckCircle,
  Clock,
  ExternalLink,
  Layers,
  Check,
  Terminal,
  Cpu,
  Monitor,
  Database,
  Smartphone,
  Eye,
  Gift
} from "lucide-react";
import { UserProfile, Course } from "../types";
import { COURSES as STATIC_COURSES } from "../courses/data";
import CelebrationModal, { CelebrationData } from "../components/CelebrationModal";

interface CareerRoadmap {
  id: string;
  title: string;
  titleMm: string;
  category: string;
  icon: any;
  color: string;
  bgColor: string;
  gradient: string;
  description: string;
  descriptionMm: string;
  careerGoal: string;
  careerGoalMm: string;
  isPremium: boolean;
  requiredSkills: string[];
  recommendedProjects: { title: string; desc: string; difficulty: string }[];
  portfolioIdeas: string[];
  learningTips: string[];
  careerOpportunities: { title: string; salary: string; demand: string }[];
  stages: LearningStage[];
}

interface LearningStage {
  id: string;
  title: string;
  titleMm: string;
  description: string;
  prerequisites: string[]; // lists stage IDs that must be completed
  courses: RoadmapCourse[];
}

interface RoadmapCourse {
  id: string;
  title: string;
  titleMm: string;
  description: string;
  lessons: RoadmapLesson[];
  projects: RoadmapProject[];
}

interface RoadmapLesson {
  id: string;
  title: string;
  titleMm: string;
  duration: string;
  realLessonId?: string; // maps to real lessons completed in user profile if exists
}

interface RoadmapProject {
  id: string;
  title: string;
  titleMm: string;
  description: string;
  points: number;
}

// Complete 5 Roadmaps definitions
export const CAREER_ROADMAPS: CareerRoadmap[] = [
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    titleMm: "ဖရောင့်အန်း ဝဘ်ဖန်တီးသူ လမ်းစဉ်",
    category: "web",
    icon: Monitor,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    gradient: "from-blue-600 to-cyan-500",
    description: "Build user-friendly, responsive, and beautifully interactive web interfaces.",
    descriptionMm: "အသုံးပြုသူ စိတ်ကြိုက်ကျစေမည့် လှပသပ်ရပ်ပြီး အပြန်အလှန်တုံ့ပြန်နိုင်သော ဝဘ်ဆိုက်မျက်နှာပြင်များ ဖန်တီးပါ။",
    careerGoal: "Become a Junior Frontend Developer specializing in React and modern UI engineering.",
    careerGoalMm: "React နှင့် ခေတ်မီ UI နည်းပညာများကို ကျွမ်းကျင်စွာ အသုံးပြုနိုင်သော Junior Frontend Developer တစ်ယောက်ဖြစ်လာစေရန်။",
    isPremium: false,
    requiredSkills: [
      "HTML5 Semantics & SEO basics",
      "CSS3 Custom Properties & Grid/Flexbox",
      "Responsive UI (Tailwind CSS / Bootstrap)",
      "Vanilla ES6+ JavaScript, DOM APIs, Fetch/REST API integration",
      "Git & GitHub Version Control & Deployment",
      "React Hooks, State Management (Context API/Redux), Component lifecycle"
    ],
    recommendedProjects: [
      { title: "Personal Portfolio Website", desc: "A stunning dark/light responsive portfolio showcasing your skills, projects, and contact form.", difficulty: "Beginner" },
      { title: "Dynamic Task Manager (Todo App)", desc: "Interactive client-side task manager with local storage, priority filters, and custom animation states.", difficulty: "Beginner" },
      { title: "E-commerce Interface", desc: "Multi-page storefront featuring search indexing, categorizations, custom sliding shopping cart, and mock checkouts.", difficulty: "Intermediate" }
    ],
    portfolioIdeas: [
      "Build at least 3 pixel-perfect landing pages using Tailwind CSS and publish them on GitHub Pages.",
      "Incorporate custom loading states, skeletons, and elegant error-handling UI in your React components."
    ],
    learningTips: [
      "Don't skip CSS fundamentals! Frameworks are easy to learn if you know custom grid positioning and flexbox inside out.",
      "Practice reading external JSON APIs and processing complex objects in Javascript using filter(), map(), and reduce()."
    ],
    careerOpportunities: [
      { title: "Junior UI Developer", salary: "400,000 - 700,000 MMK", demand: "High (မြင့်မား)" },
      { title: "React Developer", salary: "600,000 - 1,200,000 MMK", demand: "Very High (အလွန်မြင့်မား)" },
      { title: "Frontend Software Engineer", salary: "1,000,000 - 2,500,000 MMK", demand: "High (မြင့်မား)" }
    ],
    stages: [
      {
        id: "fe-stage-1",
        title: "Stage 1: Web Foundation",
        titleMm: "အဆင့် ၁ - ဝဘ်အခြေခံ အမြစ်တွယ်ခြင်း",
        description: "Master the essential building blocks of the web.",
        prerequisites: [],
        courses: [
          {
            id: "fe-course-1",
            title: "Computer Basics & Web intro",
            titleMm: "ကွန်ပျူတာနှင့် ဝဘ်အခြေခံသဘောတရားများ",
            description: "How the internet, servers, browsers, and URLs work under the hood.",
            lessons: [
              { id: "fe-l1", title: "How Browsers Render Webpages", titleMm: "ဝဘ်ဘရောက်ဇာများ အလုပ်လုပ်ပုံ", duration: "15 mins" },
              { id: "fe-l2", title: "HTTP Requests, Responses & DNS", titleMm: "HTTP Requests နှင့် DNS အကြောင်း", duration: "20 mins" }
            ],
            projects: [
              { id: "fe-p1", title: "Tech Stack Analysis Sheet", titleMm: "ဝဘ်ဒီဇိုင်းနည်းပညာ သုံးသပ်ချက်", description: "Document your favorite websites' frontend architectures.", points: 50 }
            ]
          },
          {
            id: "fe-course-2",
            title: "HTML5 Essentials",
            titleMm: "HTML5 အခြေခံ ရေးသားနည်း",
            description: "Structuring documents using semantic elements, headings, paragraphs, links, and tables.",
            lessons: [
              { id: "fe-l3", title: "HTML Structural & Text Semantics", titleMm: "HTML Tags နှင့် အသုံးချပုံ", duration: "30 mins", realLessonId: "html-basics-tags" },
              { id: "fe-l4", title: "HTML Forms, Inputs & Audio-Video Media", titleMm: "ဝဘ် ဖောင်များနှင့် မီဒီယာများ", duration: "35 mins", realLessonId: "html-forms" }
            ],
            projects: [
              { id: "fe-p2", title: "My Personal Resume Structure", titleMm: "ကိုယ်ရေးအကျဉ်း ဝဘ်အရိုးစု တည်ဆောက်ခြင်း", description: "Write standard HTML code for your developer profile structure.", points: 50 }
            ]
          }
        ]
      },
      {
        id: "fe-stage-2",
        title: "Stage 2: Styling & Layout Layouts",
        titleMm: "အဆင့် ၂ - ဒီဇိုင်းနှင့် မျက်နှာပြင်အလှဆင်ခြင်း",
        description: "Format websites elegantly with colors, grids, and responsive layouts.",
        prerequisites: ["fe-stage-1"],
        courses: [
          {
            id: "fe-course-3",
            title: "CSS3 & Responsive Design",
            titleMm: "CSS3 နှင့် အလှဆင်ခြင်း",
            description: "Understanding colors, positioning, margin, padding, flexbox, grid, and responsiveness.",
            lessons: [
              { id: "fe-l5", title: "The Box Model & Basic CSS Selectors", titleMm: "CSS Box Model နှင့် Selectors", duration: "30 mins" },
              { id: "fe-l6", title: "CSS Flexbox & CSS Grid Systems", titleMm: "CSS Flexbox နှင့် Grid ရေးသားနည်း", duration: "45 mins" },
              { id: "fe-l7", title: "Media Queries & Mobile-First Design", titleMm: "မိုဘိုင်းဗားရှင်း ဒီဇိုင်းနှင့် ရေးသားနည်း", duration: "40 mins" }
            ],
            projects: [
              { id: "fe-p3", title: "Responsive Product Pricing Cards Grid", titleMm: "ဈေးနှုန်းဇယား ဇယားကွက် ဖန်တီးခြင်း", description: "Design an eye-catching pricing plan layout that transforms on screens.", points: 100 }
            ]
          }
        ]
      },
      {
        id: "fe-stage-3",
        title: "Stage 3: Interactive Logic",
        titleMm: "အဆင့် ၃ - JavaScript ဆော့ဖ်ဝဲလ်လောဂျစ်",
        description: "Introduce interactivity, loops, and external data storage.",
        prerequisites: ["fe-stage-2"],
        courses: [
          {
            id: "fe-course-4",
            title: "JavaScript Programming Fundamentals",
            titleMm: "JavaScript အခြေခံများနှင့် Logic",
            description: "Variables, conditions, loops, functions, array methods, and event handlers.",
            lessons: [
              { id: "fe-l8", title: "JS Variables, Data Types & Conditionals", titleMm: "JS ကိန်းရှင်များ၊ Data Types နှင့် Logic", duration: "45 mins" },
              { id: "fe-l9", title: "DOM Manipulation & Event Listeners", titleMm: "ဝဘ်စာမျက်နှာများအား ထိန်းချုပ်မောင်းနှင်ခြင်း", duration: "50 mins" },
              { id: "fe-l10", title: "Asynchronous JS, Fetch APIs & Local Storage", titleMm: "Fetch APIs ဖြင့် ဒေတာထုတ်ယူခြင်းနှင့် Local Storage", duration: "55 mins" }
            ],
            projects: [
              { id: "fe-p4", title: "Interactive Coin Conversion Calculator", titleMm: "ငွေလဲနှုန်းတွက်စက် လက်တွေ့ရေးသားခြင်း", description: "Create an interactive exchange rate tool pulling live data.", points: 120 }
            ]
          },
          {
            id: "fe-course-5",
            title: "Git & GitHub Version Control",
            titleMm: "Git နှင့် GitHub ကို ကျွမ်းကျင်စွာ အသုံးပြုခြင်း",
            description: "Track source code histories and host your work on GitHub.",
            lessons: [
              { id: "fe-l11", title: "Git Basics: Commits, Branching, and Merging", titleMm: "Git အခြေခံ - Commit, Branching နှင့် Merge", duration: "35 mins" }
            ],
            projects: [
              { id: "fe-p5", title: "GitHub Deployment Pipeline Setup", titleMm: "GitHub ဝဘ်ဆိုက် တိုက်ရိုက်တင်ဆက်ခြင်း", description: "Deploy your project directly to Git Pages or Netlify.", points: 60 }
            ]
          }
        ]
      },
      {
        id: "fe-stage-4",
        title: "Stage 4: Modern React Mastery",
        titleMm: "အဆင့် ၄ - ခေတ်မီ React ဖရိမ်ဝပ် ကျွမ်းကျင်ခြင်း",
        description: "Develop ultra-fast single-page applications using React components.",
        prerequisites: ["fe-stage-3"],
        courses: [
          {
            id: "fe-course-6",
            title: "React UI Architecture",
            titleMm: "React Component အခြေခံနှင့် UI",
            description: "JSX, Virtual DOM, Custom components, props, hooks (useState, useEffect) and routing.",
            lessons: [
              { id: "fe-l12", title: "React Component Lifecycle & JSX Concepts", titleMm: "React Components နှင့် JSX သဘောတရားများ", duration: "50 mins" },
              { id: "fe-l13", title: "React Hooks deep dive (useState, useEffect, useContext)", titleMm: "React Hooks နက်ရှိုင်းစွာ အသုံးချခြင်း", duration: "60 mins" }
            ],
            projects: [
              { id: "fe-p6", title: "The Career Portfolio Project Capstone", titleMm: "Frontend ဘွဲ့ရ ကိုယ်ပိုင်အလုပ်အကိုင် Portfolio", description: "Build your full professional reactive portfolio with dynamic page routing and resume downloads.", points: 200 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "backend-dev",
    title: "Backend Developer",
    titleMm: "ဘက်ခ်အန်း ဆော့ဖ်ဝဲလ်ရေးသားသူ လမ်းစဉ်",
    category: "backend",
    icon: Database,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    gradient: "from-emerald-600 to-green-500",
    description: "Architect backend engines, design databases, and handle security authentication pipelines.",
    descriptionMm: "ဆာဗာများ၊ ဒေတာဘေ့စ်များ၊ စနစ်လုံခြုံရေးနှင့် API logic များကို စနစ်တကျ တည်ဆောက်မောင်းနှင်ပါ။",
    careerGoal: "Become an Express.js & Node.js backend engineer capable of designing scalable RESTful servers.",
    careerGoalMm: "Express.js နှင့် Node.js တို့ကို သုံးပြီး တိုးချဲ့ရလွယ်ကူသော RESTful APIs များနှင့် Database စနစ်များအား ဒီဇိုင်းဆွဲနိုင်ရန်။",
    isPremium: true,
    requiredSkills: [
      "Node.js Runtime & NPM environment",
      "Express.js Routing, Middlewares, and Error Handlers",
      "Relational Databases (PostgreSQL / SQLite / SQL)",
      "Object Relational Mapping (Drizzle ORM / Prisma)",
      "Secure Authentication (JWT / Session Cookies / bcrypt hashing)",
      "RESTful API architectural designs",
      "Server Deployment (Cloud Run / VPS / Heroku)"
    ],
    recommendedProjects: [
      { title: "Student Record Management API", desc: "A robust API service facilitating student profiles registry, grade listings, and authentication security.", difficulty: "Intermediate" },
      { title: "Secure E-Commerce Backend", desc: "Complete transactional database with relational tables, secure checkout carts, Stripe API proxies, and audit logs.", difficulty: "Advanced" },
      { title: "E-Learning Forum Backend Engine", desc: "Express server hosting user profiles, forum question structures, and multi-user category comments with JWT checks.", difficulty: "Advanced" }
    ],
    portfolioIdeas: [
      "Document all your API endpoints beautifully using standard Postman public documentation.",
      "Write high-quality database migrations and schemas utilizing Drizzle ORM to prove production readiness."
    ],
    learningTips: [
      "Never trust client input! Always implement robust server-side schema verification checks (e.g. using Zod or custom logic).",
      "Understand standard HTTP status codes (200, 201, 400, 401, 403, 404, 500) and use them correctly."
    ],
    careerOpportunities: [
      { title: "Junior Backend Engineer", salary: "500,000 - 800,000 MMK", demand: "High (မြင့်မား)" },
      { title: "Database Developer", salary: "600,000 - 1,300,000 MMK", demand: "Medium (သင့်တင့်)" },
      { title: "Node.js Developer", salary: "1,200,000 - 3,000,000 MMK", demand: "Very High (အလွန်မြင့်မား)" }
    ],
    stages: [
      {
        id: "be-stage-1",
        title: "Stage 1: Programming Foundations",
        titleMm: "အဆင့် ၁ - ဆာဗာအခြေခံသင်ယူခြင်း",
        description: "Deepen logic structures and computational thinking.",
        prerequisites: [],
        courses: [
          {
            id: "be-course-1",
            title: "Advanced Programming Fundamentals",
            titleMm: "ပရိုဂရမ်မင်း အဆင့်မြင့်သဘောတရားများ",
            description: "Data Structures, Algorithms, file streams, and system-level architectures.",
            lessons: [
              { id: "be-l1", title: "Asynchronous Hashing & Streams", titleMm: "Asynchronous မောင်းနှင်ပုံနှင့် Streams", duration: "35 mins" }
            ],
            projects: [
              { id: "be-p1", title: "JSON File Database Store", titleMm: "ဖိုင်စနစ်သုံး ဒေတာဘေ့စ်ငယ် တည်ဆောက်ခြင်း", description: "Create a simple CRUD system reading and writing text JSON files.", points: 70 }
            ]
          }
        ]
      },
      {
        id: "be-stage-2",
        title: "Stage 2: Node.js & Express.js Server",
        titleMm: "အဆင့် ၂ - Node.js နှင့် Express.js ဆာဗာ",
        description: "Expose computing interfaces to the network.",
        prerequisites: ["be-stage-1"],
        courses: [
          {
            id: "be-course-2",
            title: "RESTful API Development with Express",
            titleMm: "Express ဖြင့် ဆာဗာ API များ ဒီဇိုင်းဆွဲခြင်း",
            description: "Server setups, request parsers, route definitions, and middleware patterns.",
            lessons: [
              { id: "be-l2", title: "Understanding Express Middleware Chains", titleMm: "Express Middleware အလုပ်လုပ်ပုံနှင့် သုံးစွဲနည်း", duration: "45 mins" },
              { id: "be-l3", title: "RESTful Standards: GET, POST, PUT, DELETE", titleMm: "REST API ဒီဇိုင်းနှင့် HTTP Methods များ", duration: "50 mins" }
            ],
            projects: [
              { id: "be-p2", title: "Task Manager REST API", titleMm: "ဆာဗာသုံး လုပ်ငန်းမှတ်တမ်း API", description: "Build a modular server-side task tracker serving JSON requests.", points: 120 }
            ]
          }
        ]
      },
      {
        id: "be-stage-3",
        title: "Stage 3: Database & ORM",
        titleMm: "အဆင့် ၃ - Database များနှင့် ဆက်သွယ်ရေးစနစ်",
        description: "Connect APIs with professional databases.",
        prerequisites: ["be-stage-2"],
        courses: [
          {
            id: "be-course-3",
            title: "Relational SQL & Postgres Integration",
            titleMm: "SQL ဒေတာဘေ့စ်နှင့် Postgres အသုံးပြုခြင်း",
            description: "Table designs, relations (one-to-many, many-to-many), queries, and Drizzle ORM.",
            lessons: [
              { id: "be-l4", title: "Designing Schemas & Constraints", titleMm: "ဒေတာဘေ့စ်ဇယားများ ဒီဇိုင်းဆွဲခြင်း", duration: "45 mins" },
              { id: "be-l5", title: "Connecting Node.js with SQL Database Engines", titleMm: "Node.js နှင့် SQL ချိတ်ဆက်အသုံးပြုပုံ", duration: "50 mins" }
            ],
            projects: [
              { id: "be-p3", title: "Drizzle Migration Pipeline Setup", titleMm: "ORM စနစ်သုံး ဒေတာဘေ့စ် ပေါင်းစပ်ခြင်း", description: "Write table relationships and execute database schema migrations.", points: 150 }
            ]
          }
        ]
      },
      {
        id: "be-stage-4",
        title: "Stage 4: Advanced Security & Deployment",
        titleMm: "အဆင့် ၄ - ဆာဗာလုံခြုံရေးနှင့် ဝဘ်ပေါ်တင်ခြင်း",
        description: "Audit security logs, encrypt credentials, and deploy code to servers.",
        prerequisites: ["be-stage-3"],
        courses: [
          {
            id: "be-course-4",
            title: "Securing & Deploying Backends",
            titleMm: "API လုံခြုံရေးမြှင့်တင်ခြင်းနှင့် Cloud ပေါ်တင်ခြင်း",
            description: "JSON Web Tokens, bcrypt password hashing, secure environment variables, and Cloud Run VPS container configs.",
            lessons: [
              { id: "be-l6", title: "Session Security & Token-based JWT Auth", titleMm: "JWT စနစ်သုံး စိတ်ချရသော အကောင့်ဝင်စနစ်", duration: "55 mins" },
              { id: "be-l7", title: "Server Deployments and Containerization", titleMm: "Cloud Run နှင့် VPS ပေါ်သို့ ဆာဗာတင်ဆက်ခြင်း", duration: "60 mins" }
            ],
            projects: [
              { id: "be-p4", title: "Secure Payroll & Audit Backend Capstone", titleMm: "ဆာဗာလုံခြုံရေး ဘွဲ့ရ ပရောဂျက်ကြီး", description: "Integrate relational databases, auth tokens, schema protections, and deploy to a real cloud url.", points: 250 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    titleMm: "ဖူးစတက် ဝဘ်ပညာရှင် လမ်းစဉ်",
    category: "fullstack",
    icon: Layers,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    gradient: "from-indigo-600 to-purple-500",
    description: "Command the entire ecosystem—from user interfaces to complex server architectures.",
    descriptionMm: "ဝဘ်ဆိုက်၏ အရှေ့ပိုင်းဒီဇိုင်းမှ ဆာဗာပိုင်း၊ ဒေတာဘေ့စ် စသည့် နည်းပညာနယ်ပယ်အားလုံးကို စုစည်းလွှမ်းမိုးပါ။",
    careerGoal: "Become a versatile Full Stack Developer who can design, build, and deploy end-to-end web apps.",
    careerGoalMm: "ကိုယ်ပိုင် ဝဘ်ဆိုက်တစ်ခုလုံးကို ဒီဇိုင်းဆွဲခြင်းမှ ဆာဗာတင်ခြင်းအထိ အစအဆုံး ကိုယ်တိုင်ဖန်တီးနိုင်သော Full Stack Developer ဖြစ်လာစေရန်။",
    isPremium: true,
    requiredSkills: [
      "Modern Frontend Development (React / CSS3 / Tailwind)",
      "Scalable Server Architectures (Node.js / Express)",
      "Database Modeling & Performance Tuning (PostgreSQL / Firestore)",
      "Server-to-Client Data Pipelines (REST APIs / WebSockets)",
      "Deployment Pipelines (Docker, CI/CD, Cloud Engine)",
      "Full Stack Application Auditing & System Scalability"
    ],
    recommendedProjects: [
      { title: "Collaborative Real-time Kanban Board", desc: "Interactive dashboard featuring task updates via WebSockets, persistent Firestore syncing, and responsive UI.", difficulty: "Advanced" },
      { title: "SaaS Subscription Platform", desc: "A complete software service showcasing user signup, custom stripe gateways, usage trackers, and client dashboard metrics.", difficulty: "Advanced" }
    ],
    portfolioIdeas: [
      "Build a complete full-stack web application, record a 5-minute video walkthrough, and link it on LinkedIn.",
      "Design clear database relation flowcharts and post them as technical case-studies."
    ],
    learningTips: [
      "Don't get overwhelmed! Focus on mastering one stack fully (like React + Express + PostgreSQL) before trying to learn everything.",
      "Focus heavily on the data-binding pipeline. Getting data smoothly from DB -> API -> React State is 80% of Full Stack work."
    ],
    careerOpportunities: [
      { title: "Full Stack Software Engineer", salary: "1,200,000 - 3,500,000 MMK", demand: "Very High (အလွန်မြင့်မား)" },
      { title: "Technical Co-founder", salary: "Equity / High Stake", demand: "High (မြင့်မား)" },
      { title: "Solutions Architect", salary: "2,500,000 - 5,000,000 MMK", demand: "High (မြင့်မား)" }
    ],
    stages: [
      {
        id: "fs-stage-1",
        title: "Stage 1: Web Foundation & UI",
        titleMm: "အဆင့် ၁ - ပတ်ဝန်းကျင်အခြေခံနှင့် မျက်နှာပြင်",
        description: "Form client-side templates and styled layouts.",
        prerequisites: [],
        courses: [
          {
            id: "fs-course-1",
            title: "Frontend Foundations",
            titleMm: "ဝဘ်ဒီဇိုင်းနှင့် Frontend အခြေခံ",
            description: "HTML, CSS, Responsive flex grids, and modern Tailwind styles.",
            lessons: [
              { id: "fs-l1", title: "HTML5 Semantic Bones", titleMm: "HTML5 ဖြင့် စနစ်ကျသော ဝဘ်ဖွဲ့စည်းပုံ", duration: "30 mins" },
              { id: "fs-l2", title: "Responsive Tailwind Grids", titleMm: "Tailwind CSS ဖြင့် အလိုအလျောက်ပြောင်းလဲသော ဒီဇိုင်း", duration: "40 mins" }
            ],
            projects: [
              { id: "fs-p1", title: "Static Landing Page", titleMm: "ကုမ္ပဏီအိတ်ဆောင် ဝဘ်မျက်နှာပြင်", description: "Develop a highly stylized responsive product landing screen.", points: 80 }
            ]
          }
        ]
      },
      {
        id: "fs-stage-2",
        title: "Stage 2: Frontend App Logic with React",
        titleMm: "အဆင့် ၂ - React နည်းပညာဖြင့် အပြန်အလှန်တုံ့ပြန်မှု",
        description: "Form scalable single page applications with state hooks.",
        prerequisites: ["fs-stage-1"],
        courses: [
          {
            id: "fs-course-2",
            title: "React Application Logic",
            titleMm: "React အသုံးချမှုနှင့် state စီမံခန့်ခွဲမှု",
            description: "React routing, hooks, handling user forms, and state management.",
            lessons: [
              { id: "fs-l3", title: "State Bindings and API Interactions", titleMm: "ဝဘ် API ချိတ်ဆက်မှုနှင့် State ထိန်းချုပ်ပုံ", duration: "50 mins" }
            ],
            projects: [
              { id: "fs-p2", title: "Interactive Portfolio Deck", titleMm: "ကိုယ်ပိုင် အလုပ်အကိုင်ပြခန်း ဝဘ်ဆိုက်", description: "Design a comprehensive, animated portfolio with page-handling routes.", points: 120 }
            ]
          }
        ]
      },
      {
        id: "fs-stage-3",
        title: "Stage 3: Express Backend & DB Core",
        titleMm: "အဆင့် ၃ - ဆာဗာပိုင်းနှင့် ဒေတာစုစည်းမှုစနစ်",
        description: "Form server interfaces and relational query models.",
        prerequisites: ["fs-stage-2"],
        courses: [
          {
            id: "fs-course-3",
            title: "Express Backend & SQL Integration",
            titleMm: "ဆာဗာ APIs များနှင့် SQL ချိတ်ဆက်ခြင်း",
            description: "Build Express APIs, secure validation layers, and Drizzle SQL relational mappings.",
            lessons: [
              { id: "fs-l4", title: "Designing Relational Databases with Drizzle", titleMm: "ဒေတာဘေ့စ် ဇယားများ ချိတ်ဆက်ခြင်း", duration: "50 mins" },
              { id: "fs-l5", title: "API Authentication Token Signings", titleMm: "အကောင့်လုံခြုံရေးနှင့် Token စနစ်", duration: "55 mins" }
            ],
            projects: [
              { id: "fs-p3", title: "Relational Database Server API", titleMm: "ဇယားဆက်နွယ်မှုပါဝင်သော ဆာဗာစနစ်", description: "Expose Express APIs connected directly to a SQL schema database.", points: 160 }
            ]
          }
        ]
      },
      {
        id: "fs-stage-4",
        title: "Stage 4: Deployment & Full Stack Capstone",
        titleMm: "အဆင့် ၄ - ဆာဗာချိတ်ဆက်ခြင်းနှင့် ပရောဂျက်ကြီး",
        description: "Bind client and server environments and launch to production cloud containers.",
        prerequisites: ["fs-stage-3"],
        courses: [
          {
            id: "fs-course-4",
            title: "Production Pipeline Launch",
            titleMm: "ထုတ်လုပ်မှုအဆင့် ဆာဗာတင်ခြင်းနှင့် စနစ်လုံခြုံရေး",
            description: "Setup CORS headers, production builds, environment variables, and launch using Cloud Run containers.",
            lessons: [
              { id: "fs-l6", title: "CORS Configurations & Safe Environments", titleMm: "CORS လုံခြုံရေးနှင့် Env variables ဆက်တင်များ", duration: "45 mins" },
              { id: "fs-l7", title: "Deploying Full-Stack Projects in Production", titleMm: "Full-Stack စနစ်များအား Cloud ပေါ်တင်ဆက်ခြင်း", duration: "60 mins" }
            ],
            projects: [
              { id: "fs-p4", title: "Full Stack Collaborative Hub Capstone", titleMm: "Full-Stack အပြီးသတ် ဘွဲ့ရ ပရောဂျက်ကြီး", description: "Design, code, secure, and deploy a complete collaborative full-stack web application to Cloud.", points: 300 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "android-dev",
    title: "Android Developer",
    titleMm: "အန်ဒရွိုက် အက်ပ်ရေးသားသူ လမ်းစဉ်",
    category: "android",
    icon: Smartphone,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    gradient: "from-green-600 to-emerald-500",
    description: "Design mobile applications, handle sensor hardware integrations, and build clean interfaces.",
    descriptionMm: "မိုဘိုင်းအက်ပ်များ ဖန်တီးပါ၊ ဖုန်းအာရုံခံကိရိယာများနှင့် ချိတ်ဆက်ပါ၊ ကမ္ဘာလုံးဆိုင်ရာ အသုံးချစနစ်များ တည်ဆောက်ပါ။",
    careerGoal: "Become a professional Android App Developer using Java, Kotlin, and modern Jetpack Compose.",
    careerGoalMm: "Java, Kotlin နှင့် Jetpack Compose တို့ကို ကျွမ်းကျင်စွာ သုံးပြီး Play Store တင်နိုင်သော မိုဘိုင်းအက်ပ်များ ဖန်တီးနိုင်စေရန်။",
    isPremium: true,
    requiredSkills: [
      "Java / Kotlin Object-Oriented Fundamentals",
      "Android Studio IDE configurations & layouts",
      "Jetpack Compose / XML Layout Designs",
      "Android Activities, Fragments, and Navigation Lifecycles",
      "Firebase Auth, Firestore, and Realtime database links",
      "Play Store deployment standards & app bundle creation"
    ],
    recommendedProjects: [
      { title: "Interactive News Reader App", desc: "Fetches trending global topics from open REST endpoints with beautiful card swipe visuals.", difficulty: "Intermediate" },
      { title: "Real-time Messaging & Chat App", desc: "Secure multi-user chatting utilizing Firebase real-time database feeds, camera upload triggers, and notifications.", difficulty: "Advanced" }
    ],
    portfolioIdeas: [
      "Upload at least 1 app to the Google Play Store or distribute an active APK file via GitHub Releases.",
      "Incorporate Material Design 3 guidelines featuring dynamic dark/light theme switching."
    ],
    learningTips: [
      "Kotlin is the future! Don't spend too long on Java. Focus on learning Kotlin's modern features like coroutines and Lambdas early.",
      "Understand the Android Activity life cycle completely. Knowing how the app behaves when the phone screen rotates is crucial!"
    ],
    careerOpportunities: [
      { title: "Android UI Developer", salary: "450,000 - 800,000 MMK", demand: "High (မြင့်မား)" },
      { title: "Kotlin Developer", salary: "700,000 - 1,500,000 MMK", demand: "Very High (အလွန်မြင့်မား)" },
      { title: "Senior Mobile Engineer", salary: "1,500,000 - 3,500,000 MMK", demand: "High (မြင့်မား)" }
    ],
    stages: [
      {
        id: "and-stage-1",
        title: "Stage 1: Programming Basics (Java/Kotlin)",
        titleMm: "အဆင့် ၁ - မိုဘိုင်းပရိုဂရမ်မင်းအစ",
        description: "Master Java and Kotlin OOP foundations.",
        prerequisites: [],
        courses: [
          {
            id: "and-course-1",
            title: "Java & Kotlin Basics",
            titleMm: "Java နှင့် Kotlin အခြေခံများ",
            description: "Variables, OOP classes, functions, inheritance, null-safety, and collections.",
            lessons: [
              { id: "and-l1", title: "OOP Principles in Mobile Development", titleMm: "မိုဘိုင်းပရိုဂရမ်မင်းအတွက် OOP သဘောတရားများ", duration: "40 mins" },
              { id: "and-l2", title: "Kotlin Syntax & Null-Safety", titleMm: "Kotlin ရေးထုံးနှင့် စိတ်ချရသော Null-Safety", duration: "45 mins" }
            ],
            projects: [
              { id: "and-p1", title: "OOP Console Budget Calculator", titleMm: "ငွေကြေးစီမံစနစ် Console ပရိုဂရမ်", description: "Write Kotlin code calculating personal expenses using class structures.", points: 80 }
            ]
          }
        ]
      },
      {
        id: "and-stage-2",
        title: "Stage 2: Android Studio & UI Jetpack Compose",
        titleMm: "အဆင့် ၂ - Android Studio နှင့် မျက်နှာပြင်ဒီဇိုင်း",
        description: "Design reactive, flexible interfaces on physical screen displays.",
        prerequisites: ["and-stage-1"],
        courses: [
          {
            id: "and-course-2",
            title: "UI Design with Jetpack Compose",
            titleMm: "Jetpack Compose ဖြင့် UI ရေးဆွဲခြင်း",
            description: "Compose layout rows, columns, states, themes, list animations, and typography.",
            lessons: [
              { id: "and-l3", title: "Compose Rows, Columns & State Handlers", titleMm: "Compose UI တည်ဆောက်ပုံနှင့် State ထိန်းသိမ်းခြင်း", duration: "50 mins" },
              { id: "and-l4", title: "Material Design 3 Theme Integrations", titleMm: "Material Design 3 စနစ်သုံး အပြင်အဆင်များ", duration: "45 mins" }
            ],
            projects: [
              { id: "and-p2", title: "Beautiful Weather Deck UI App", titleMm: "မိုးလေဝသ အခြေအနေပြ လှပသော UI အက်ပ်", description: "Design a multi-layered weather dashboard app using reactive UI elements.", points: 130 }
            ]
          }
        ]
      },
      {
        id: "and-stage-3",
        title: "Stage 3: Local Storage & Network API Mappings",
        titleMm: "အဆင့် ၃ - ဒေတာသိုလှောင်မှုနှင့် ကွန်ရက်ချိတ်ဆက်ခြင်း",
        description: "Synchronize local caching engines with cloud REST data formats.",
        prerequisites: ["and-stage-2"],
        courses: [
          {
            id: "and-course-3",
            title: "Android Network & Storage Pipes",
            titleMm: "Android အချက်အလက်သိုလှောင်မှုနှင့် API",
            description: "Using Room database caching, Retrofit libraries for API networking, and Gson parses.",
            lessons: [
              { id: "and-l5", title: "Retrofit Network Fetch pipelines", titleMm: "Retrofit ဖြင့် ဝဘ် API ချိတ်ဆက်မောင်းနှင်ခြင်း", duration: "55 mins" },
              { id: "and-l6", title: "Offline Local caching with SQLite Room", titleMm: "Room Database ဖြင့် အော့ဖ်လိုင်းဒေတာ သိမ်းဆည်းခြင်း", duration: "50 mins" }
            ],
            projects: [
              { id: "and-p3", title: "News Stream Cache Reader", titleMm: "သတင်းဖတ်အော့ဖ်လိုင်းအက်ပ် လက်တွေ့ရေးသားခြင်း", description: "Form an API-based news reader app that caches reading content locally in Room.", points: 180 }
            ]
          }
        ]
      },
      {
        id: "and-stage-4",
        title: "Stage 4: Firebase Security & Production App Store Launch",
        titleMm: "အဆင့် ၄ - Firebase ပေါင်းစပ်ခြင်းနှင့် အက်ပ်တင်ဆက်ခြင်း",
        description: "Synchronize user profiles with cloud nodes and compile standard packages.",
        prerequisites: ["and-stage-3"],
        courses: [
          {
            id: "and-course-4",
            title: "Production Deployment Standards",
            titleMm: "မိုဘိုင်းအက်ပ်အပြီးသတ်ခြင်းနှင့် Google Play တင်ခြင်း",
            description: "Firebase cloud syncing, user security authentication, app signing pipelines, and Google Play Console registrations.",
            lessons: [
              { id: "and-l7", title: "Firebase Authentication & Database bindings", titleMm: "Firebase ဖြင့် အကောင့်ဝင်ခြင်းနှင့် Cloud ဒေတာဘေ့စ်", duration: "50 mins" },
              { id: "and-l8", title: "Key Signings, Compilations & Play Console", titleMm: "အက်ပ်ထုတ်လုပ်ခြင်းနှင့် Play Store သို့ တင်သွင်းခြင်း", duration: "55 mins" }
            ],
            projects: [
              { id: "and-p4", title: "Social Forum Stream Capstone App", titleMm: "Android အဆင့်မြင့် ဘွဲ့ရ မိုဘိုင်းပရောဂျက်ကြီး", description: "Design and build a fully operational real-time social networking client app complete with SQLite caches, Firebase databases, and generate signing releases.", points: 280 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ai-dev",
    title: "AI Application Developer",
    titleMm: "AI အသုံးချဆော့ဖ်ဝဲလ် ဖန်တီးသူ လမ်းစဉ်",
    category: "ai",
    icon: Cpu,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    gradient: "from-purple-600 to-indigo-500",
    description: "Design prompt interfaces, program LLM API connections, and engineer smart system solutions.",
    descriptionMm: "Prompt များ စနစ်တကျ ရေးသားပါ၊ Gemini AI APIs များနှင့် ဝဘ်ဆိုက်ကို ချိတ်ဆက်ပါ၊ စမတ်စနစ်များ တီထွင်ပါ။",
    careerGoal: "Become a modern AI Application Developer capable of building server-side AI solutions using Gemini API.",
    careerGoalMm: "Gemini API နှင့် LLMs များကို သုံးပြီး စွမ်းဆောင်ရည်မြင့်မားသော AI-Powered ဝဘ်ဆော့ဖ်ဝဲလ်များ ကိုယ်တိုင်ဖန်တီးနိုင်ရန်။",
    isPremium: true,
    requiredSkills: [
      "Programming Logic (Python / TypeScript)",
      "Prompt Engineering (System Instructions, Few-Shot prompting)",
      "Gemini SDK Core Integrations (@google/genai)",
      "AI Multimodal queries (Processing Texts, Audios, Videos, and Images)",
      "Vector Embeddings and Semantic Database searches (RAG)",
      "Secure API proxy structures & Server middlewares"
    ],
    recommendedProjects: [
      { title: "Multimodal Receipt Scanner & Auditor", desc: "Express application processing uploaded grocery bills via Gemini vision API to generate categorized expense listings.", difficulty: "Intermediate" },
      { title: "RAG Smart Document Advisor", desc: "Extracts custom context out of uploaded textbooks using semantic database vector matches and feeds relevant snippets to Gemini.", difficulty: "Advanced" }
    ],
    portfolioIdeas: [
      "Build a functional, responsive web app featuring dynamic Gemini AI-powered analytics and host its demo live.",
      "Write technical guides explaining System Instruction prompt tunings on GitHub."
    ],
    learningTips: [
      "Keep API secrets safe! Always wrap Gemini keys in backend server routes. Never let keys leak into client browser bundles.",
      "Understand token limits and response parsing. Getting structured JSON outputs from Gemini is the key to building programmatic apps."
    ],
    careerOpportunities: [
      { title: "AI Integration Engineer", salary: "800,000 - 1,500,000 MMK", demand: "Very High (အလွန်မြင့်မား)" },
      { title: "Prompt Engineer", salary: "600,000 - 1,200,000 MMK", demand: "High (မြင့်မား)" },
      { title: "AI Full Stack Specialist", salary: "1,500,000 - 4,000,000 MMK", demand: "Very High (အလွန်မြင့်မား)" }
    ],
    stages: [
      {
        id: "ai-stage-1",
        title: "Stage 1: Programming & AI Introductions",
        titleMm: "အဆင့် ၁ - ပရိုဂရမ်မင်းနှင့် ဉာဏ်ရည်တု အခြေခံ",
        description: "Master basic logic coding and prompt tuning fundamentals.",
        prerequisites: [],
        courses: [
          {
            id: "ai-course-1",
            title: "Logic Basics & AI Concepts",
            titleMm: "ကုဒ်ရေးနည်းနှင့် AI သဘောတရားများ",
            description: "Variables, conditions, arrays, and introducing large language models (LLMs).",
            lessons: [
              { id: "ai-l1", title: "How Large Language Models Process Texts", titleMm: "ဉာဏ်ရည်တုဆော့ဖ်ဝဲလ်များ စာသားဖတ်ယူပုံ", duration: "30 mins", realLessonId: "python-basics-variables" },
              { id: "ai-l2", title: "Introduction to Prompt Engineering", titleMm: "Prompt Engineering အခြေခံလမ်းညွှန်ချက်များ", duration: "35 mins" }
            ],
            projects: [
              { id: "ai-p1", title: "Custom System Instruction Design", titleMm: "စနစ်လမ်းညွှန်ချက် ဒီဇိုင်းဖန်တီးခြင်း", description: "Formulate bulletproof instructions guiding AI chatbot characters.", points: 80 }
            ]
          }
        ]
      },
      {
        id: "ai-stage-2",
        title: "Stage 2: Prompts and @google/genai SDK Integration",
        titleMm: "အဆင့် ၂ - Gemini API နှင့် ဆာဗာပိုင်းချိတ်ဆက်ခြင်း",
        description: "Connect APIs with the modern Google GenAI library.",
        prerequisites: ["ai-stage-1"],
        courses: [
          {
            id: "ai-course-2",
            title: "Integrating Gemini SDK Core",
            titleMm: "Gemini API SDK ချိတ်ဆက်အသုံးပြုပုံ",
            description: "Acquiring keys, importing @google/genai SDK, backend route configurations, and processing text queries.",
            lessons: [
              { id: "ai-l3", title: "Safe API Key Handling & Server Proxies", titleMm: "ဆာဗာလုံခြုံရေးနှင့် API Keys စနစ်တကျ သိမ်းဆည်းခြင်း", duration: "45 mins" },
              { id: "ai-l4", title: "Standard generateContent API calls", titleMm: "Gemini SDK generateContent သုံးစွဲပုံ", duration: "40 mins" }
            ],
            projects: [
              { id: "ai-p2", title: "Smart Translation Express Server Hub", titleMm: "ဘာသာပြန်စမတ်ဆာဗာ API တည်ဆောက်ခြင်း", description: "Design an API service utilizing server endpoints proxying translations.", points: 140 }
            ]
          }
        ]
      },
      {
        id: "ai-stage-3",
        title: "Stage 3: Vision and Multimodal Pipelines",
        titleMm: "အဆင့် ၃ - ပုံရိပ်ဖတ်ခြင်းနှင့် မီဒီယာမျိုးစုံသုံး AI စနစ်",
        description: "Process complex images, voices, and document files.",
        prerequisites: ["ai-stage-2"],
        courses: [
          {
            id: "ai-course-3",
            title: "Vision & Document Auditing with LLM",
            titleMm: "ရုပ်ပုံနှင့် စာရွက်စာတမ်းဖတ် AI စနစ်များ",
            description: "How to pass base64 image strings, parse receipts, extract information, and process PDFs.",
            lessons: [
              { id: "ai-l5", title: "Passing Multimodal Images and base64 strings", titleMm: "ပုံရိပ်များနှင့် base64 ဖိုင်တွဲများ ထည့်သွင်းခြင်း", duration: "50 mins" },
              { id: "ai-l6", title: "Structured JSON Responses via Gemini Schema", titleMm: "Gemini ထံမှ JSON ဒေတာ တိုက်ရိုက်တောင်းယူခြင်း", duration: "55 mins" }
            ],
            projects: [
              { id: "ai-p3", title: "Interactive Smart Invoice Scanner App", titleMm: "ပြေစာဖတ် အလိုအလျောက်စာရင်းဝင်စနစ်", description: "Form a full-stack client processing receipts using Vision API.", points: 180 }
            ]
          }
        ]
      },
      {
        id: "ai-stage-4",
        title: "Stage 4: Semantic RAG & Smart Agent Capstone",
        titleMm: "အဆင့် ၄ - Vector Database နှင့် AI Agent ပရောဂျက်ကြီး",
        description: "Engage smart systems with customized database references (RAG) and tool capabilities.",
        prerequisites: ["ai-stage-3"],
        courses: [
          {
            id: "ai-course-4",
            title: "Advanced RAG and Smart Agent Engines",
            titleMm: "ဒေတာဘေ့စ်ပေါင်းစပ် RAG နှင့် စမတ်ကိုယ်စားလှယ်များ",
            description: "Understanding vector databases, similarity metrics, system-grounding context, and model tool calls.",
            lessons: [
              { id: "ai-l7", title: "RAG: Search Grounding and Embeddings", titleMm: "RAG - Vector Embeddings နှင့် ဒေတာပေါင်းစပ်ခြင်း", duration: "60 mins" },
              { id: "ai-l8", title: "Function Calling & Dynamic Tool Triggers", titleMm: "Function Calling ဖြင့် ကုဒ်များနှင့် တိုက်ရိုက်ချိတ်ဆက်ခြင်း", duration: "55 mins" }
            ],
            projects: [
              { id: "ai-p4", title: "Smart Corporate Chat Assistant Capstone", titleMm: "လုပ်ငန်းသုံး AI စမတ်လက်ထောက် ပရောဂျက်ကြီး", description: "Combine vector database semantic search, multimodal file analysis, and live function triggers in a deployed Capstone system.", points: 300 }
            ]
          }
        ]
      }
    ]
  }
];

interface RoadmapsProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  setCurrentTab: (tab: string) => void;
  setSelectedCourse: (course: Course, lessonIdx: number) => void;
  courses?: Course[];
}

export default function Roadmaps({
  user,
  onUpdateUser,
  setCurrentTab,
  setSelectedCourse,
  courses
}: RoadmapsProps) {
  const isPremiumUser = user.role === "premium" || user.role === "teacher" || user.role === "admin" || user.isPremium === true;

  // Selected Active Career Roadmap
  const [activeRoadmapId, setActiveRoadmapId] = useState<string>("frontend-dev");
  const selectedRoadmap = CAREER_ROADMAPS.find(r => r.id === activeRoadmapId) || CAREER_ROADMAPS[0];

  // Active stage expansion state
  const [expandedStageId, setExpandedStageId] = useState<string>("fe-stage-1");

  // Certificate modal state
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCertRoadmap, setSelectedCertRoadmap] = useState<CareerRoadmap | null>(null);

  // Custom exam states
  const [examActive, setExamActive] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examAnswers, setExamAnswers] = useState<number[]>(new Array(10).fill(-1));
  const [examValidationMessage, setExamValidationMessage] = useState("");

  // Simulated premium unlock upgrade modal state
  const [showPremiumUpgradeModal, setShowPremiumUpgradeModal] = useState(false);

  // Graduation celebration modal state
  const [graduationCelebrationData, setGraduationCelebrationData] = useState<CelebrationData | null>(null);

  // Auto expand stage if active roadmap changes
  useEffect(() => {
    if (selectedRoadmap && selectedRoadmap.stages.length > 0) {
      setExpandedStageId(selectedRoadmap.stages[0].id);
    }
    // Reset exam states
    setExamActive(false);
    setExamSubmitted(false);
    setExamScore(0);
    setExamAnswers(new Array(10).fill(-1));
    setExamValidationMessage("");
  }, [activeRoadmapId]);

  // Dynamic progress calculations
  const calculateProgress = (roadmap: CareerRoadmap) => {
    let totalLessons = 0;
    let completedLessonsCount = 0;
    let totalProjects = 0;
    let completedProjectsCount = 0;
    let totalModules = 0;
    let completedModulesCount = 0;

    const completedLessonsSet = new Set(user.completedLessons || []);
    const completedProjectsSet = new Set(user.completedProjects || []);

    roadmap.stages.forEach(stage => {
      stage.courses.forEach(course => {
        totalModules++;
        let courseLessonsCompleted = 0;
        
        course.lessons.forEach(lesson => {
          totalLessons++;
          const isCompleted = lesson.realLessonId 
            ? completedLessonsSet.has(lesson.realLessonId)
            : completedLessonsSet.has(lesson.id);
          
          if (isCompleted) {
            completedLessonsCount++;
            courseLessonsCompleted++;
          }
        });

        course.projects.forEach(project => {
          totalProjects++;
          if (completedProjectsSet.has(project.id)) {
            completedProjectsCount++;
          }
        });

        // Consider module complete if at least 50% of its lessons are completed, or all lessons if small
        const isModuleComplete = course.lessons.length === 0 || 
          (courseLessonsCompleted / course.lessons.length) >= 0.5;
        if (isModuleComplete) {
          completedModulesCount++;
        }
      });
    });

    const totalTasks = totalLessons + totalProjects;
    const completedTasks = completedLessonsCount + completedProjectsCount;
    const overallProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Remaining Lessons
    const remainingLessons = Math.max(0, totalLessons - completedLessonsCount);

    // Current Stage calculation
    let currentStageTitle = roadmap.stages[0].titleMm;
    let currentStageIndex = 1;
    for (let i = 0; i < roadmap.stages.length; i++) {
      const stage = roadmap.stages[i];
      let stageCompleted = true;
      
      stage.courses.forEach(course => {
        course.lessons.forEach(lesson => {
          const isCompleted = lesson.realLessonId 
            ? completedLessonsSet.has(lesson.realLessonId)
            : completedLessonsSet.has(lesson.id);
          if (!isCompleted) stageCompleted = false;
        });
      });

      if (stageCompleted && i < roadmap.stages.length - 1) {
        currentStageTitle = roadmap.stages[i + 1].titleMm;
        currentStageIndex = i + 2;
      } else if (!stageCompleted) {
        currentStageTitle = stage.titleMm;
        currentStageIndex = i + 1;
        break;
      }
    }

    // Estimated Completion (30 mins per remaining lesson + 2 hours per remaining project)
    const estimatedHours = Math.round((remainingLessons * 0.5) + ((totalProjects - completedProjectsCount) * 2));
    const estimatedCompletionText = estimatedHours > 0 ? `${estimatedHours} နာရီခန့် လိုအပ်` : "ပြီးမြောက်ပါပြီ";

    return {
      totalLessons,
      completedLessonsCount,
      totalProjects,
      completedProjectsCount,
      totalModules,
      completedModulesCount,
      overallProgressPercent,
      remainingLessons,
      currentStageTitle,
      currentStageIndex,
      estimatedCompletionText,
      totalTasks,
      completedTasks
    };
  };

  const progress = calculateProgress(selectedRoadmap);

  // Check if a stage is unlocked
  const isStageUnlocked = (stage: LearningStage) => {
    if (stage.prerequisites.length === 0) return true;
    
    const completedLessonsSet = new Set(user.completedLessons || []);
    let allPrereqsMet = true;

    stage.prerequisites.forEach(prereqId => {
      // Find the prerequisite stage in the current roadmap
      const prereqStage = selectedRoadmap.stages.find(s => s.id === prereqId);
      if (prereqStage) {
        prereqStage.courses.forEach(course => {
          course.lessons.forEach(lesson => {
            const isCompleted = lesson.realLessonId 
              ? completedLessonsSet.has(lesson.realLessonId)
              : completedLessonsSet.has(lesson.id);
            if (!isCompleted) {
              allPrereqsMet = false;
            }
          });
        });
      }
    });

    return allPrereqsMet;
  };

  // Click handler for Lesson node
  const handleLessonClick = (lesson: RoadmapLesson, courseTitle: string) => {
    // Attempt to match and launch real course lessons
    if (lesson.realLessonId && courses) {
      // Find course matching the real ID
      for (const course of courses) {
        const lessonIdx = course.lessons.findIndex(l => l.id === lesson.realLessonId);
        if (lessonIdx !== -1) {
          setSelectedCourse(course, lessonIdx);
          return;
        }
      }
    }

    // Interactive simulator completion if no matching real lesson is found
    const completedSet = new Set(user.completedLessons || []);
    const isCompleted = completedSet.has(lesson.id);

    if (isCompleted) {
      alert(`သင်ခန်းစာ "${lesson.titleMm}" အား သင်လေ့လာပြီး ဖြစ်ပါသည် ခင်ဗျာ။`);
    } else {
      const confirmStudy = window.confirm(`[STUDY SIMULATOR] ဤသင်ခန်းစာ "${lesson.titleMm}" အား စတင်လေ့လာမလားခင်ဗျာ။ လက်တွေ့လေ့ကျင့်ခန်း ပြီးမြောက်ပါက +30 XP ရရှိမည်ဖြစ်ပါသည်။`);
      if (confirmStudy) {
        // Mark as completed
        const updatedCompleted = [...(user.completedLessons || [])];
        if (!updatedCompleted.includes(lesson.id)) {
          updatedCompleted.push(lesson.id);
        }
        
        // Award XP
        const newXp = (user.xp || 0) + 30;
        const newCoins = (user.coins || 0) + 15;
        
        onUpdateUser({
          ...user,
          completedLessons: updatedCompleted,
          xp: newXp,
          coins: newCoins
        });
        
        alert(`🎉 အောင်မြင်စွာ လေ့လာပြီးပါပြီ! +30 XP နှင့် +15 Coins ရရှိပါသည်။`);
      }
    }
  };

  // Click handler for Project node
  const handleProjectClick = (project: RoadmapProject) => {
    const completedSet = new Set(user.completedProjects || []);
    const isCompleted = completedSet.has(project.id);

    if (isCompleted) {
      alert(`ပရောဂျက် "${project.titleMm}" ကို အောင်မြင်စွာ တည်ဆောက်ပြီးဖြစ်ပါတယ်ဗျာ။`);
    } else {
      const confirmProject = window.confirm(`[PROJECT CHALLENGE] \n\nခေါင်းစဉ် - ${project.titleMm}\nအသေးစိတ် - ${project.description}\n\nဤလက်တွေ့ပရောဂျက်အား စတင်စမ်းသပ်ပြီး တင်သွင်းရန် အဆင်သင့်ဖြစ်ပြီလားခင်ဗျာ။ အောင်မြင်ပါက +${project.points} XP ရရှိပါမည်။`);
      if (confirmProject) {
        const updatedProjects = [...(user.completedProjects || [])];
        if (!updatedProjects.includes(project.id)) {
          updatedProjects.push(project.id);
        }

        // Add to completed lessons too to sync progress nicely
        const updatedLessons = [...(user.completedLessons || [])];
        if (!updatedLessons.includes(project.id)) {
          updatedLessons.push(project.id);
        }

        const newXp = (user.xp || 0) + project.points;
        const newCoins = (user.coins || 0) + Math.round(project.points / 2);

        onUpdateUser({
          ...user,
          completedProjects: updatedProjects,
          completedLessons: updatedLessons,
          xp: newXp,
          coins: newCoins
        });

        alert(`🎉 ဂုဏ်ယူပါတယ်! ပရောဂျက်အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ။ +${project.points} XP နှင့် +${Math.round(project.points / 2)} Coins ရရှိပါသည်။`);
      }
    }
  };

  // Kibo AI recommendations based on progress
  const getKiboRecommendations = () => {
    const completedSet = new Set(user.completedLessons || []);
    
    let nextLessonToLearn: RoadmapLesson | null = null;
    let nextCourseToLearn: RoadmapCourse | null = null;
    let completedList: RoadmapLesson[] = [];
    let pendingList: { lesson: RoadmapLesson; courseTitle: string }[] = [];

    selectedRoadmap.stages.forEach(stage => {
      stage.courses.forEach(course => {
        course.lessons.forEach(lesson => {
          const isCompleted = lesson.realLessonId 
            ? completedSet.has(lesson.realLessonId)
            : completedSet.has(lesson.id);

          if (isCompleted) {
            completedList.push(lesson);
          } else {
            pendingList.push({ lesson, courseTitle: course.titleMm });
            if (!nextLessonToLearn) {
              nextLessonToLearn = lesson;
              nextCourseToLearn = course;
            }
          }
        });
      });
    });

    // Revision list (randomly pick up to 2 completed ones)
    const revisionTopics = completedList.slice(0, 2);

    // Practice exercises: pick incomplete project
    let recommendedPractice: RoadmapProject | null = null;
    const completedProjSet = new Set(user.completedProjects || []);
    
    for (const stage of selectedRoadmap.stages) {
      for (const course of stage.courses) {
        for (const proj of course.projects) {
          if (!completedProjSet.has(proj.id)) {
            recommendedPractice = proj;
            break;
          }
        }
        if (recommendedPractice) break;
      }
      if (recommendedPractice) break;
    }

    return {
      nextLesson: nextLessonToLearn,
      nextCourse: nextCourseToLearn,
      revisionTopics,
      practice: recommendedPractice
    };
  };

  const kiboRecs = getKiboRecommendations();

  // Career Readiness Final Assessment Quiz
  const MOCK_QUESTIONS = [
    {
      q: "HTML semantics နှင့်ပတ်သက်၍ မည်သည့် tag သည် SEO နှင့် screen reader များအတွက် အကောင်းဆုံး ခေါင်းစဉ်တည်ဆောက်မှု ဖြစ်သနည်း။",
      options: ["<header>", "<h1>", "<title>", "<div font='bold'>"],
      correct: 1
    },
    {
      q: "CSS Layouts များဆွဲရာတွင် flex-direction ၏ default တန်ဖိုးမှာ မည်သည်ဖြစ်သနည်း။",
      options: ["column", "grid", "row", "block"],
      correct: 2
    },
    {
      q: "JavaScript တွင် database တစ်ခုထံမှ async data လှမ်းတောင်းရာတွင် error ကို စနစ်တကျဖမ်းယူရန် မည်သည်ကို သုံးသနည်း။",
      options: ["try...catch block", "if...else statement", "for loop", "switch-case"],
      correct: 0
    },
    {
      q: "Git version control စနစ်တွင် remote repository ဆီသို့ ကုဒ်များတွန်းတင်ရန် မည်သည့် command ကို အသုံးပြုရသနည်း။",
      options: ["git pull", "git push", "git commit", "git merge"],
      correct: 1
    },
    {
      q: "React web framework တွင် state variable တစ်ခုကို ဖန်တီးသိမ်းဆည်းရန် မည်သည့် hook ကို သုံးသနည်း။",
      options: ["useEffect", "useContext", "useState", "useMemo"],
      correct: 2
    },
    {
      q: "API architectural patterns များတွင် GET method သည် မည်သည့်လုပ်ဆောင်ချက်အတွက် သုံးသနည်း။",
      options: ["ဒေတာအသစ် ဖန်တီးရန် (Create)", "ဒေတာဖတ်ယူရန် (Read)", "ဒေတာပြင်ဆင်ရန် (Update)", "ဒေတာဖျက်ပစ်ရန် (Delete)"],
      correct: 1
    },
    {
      q: "ဆာဗာလုံခြုံရေးအတွက် အသုံးပြုသူများ၏ စကားဝှက်များကို database တွင် သိမ်းဆည်းရာ၌ မည်သို့ သိမ်းသင့်သနည်း။",
      options: ["Plain text (စာသားအတိုင်း)", "Base64 encoding", "Encrypted Hash (bcrypt / argon2)", "JSON formats"],
      correct: 2
    },
    {
      q: "Android mobile application များ ဖန်တီးရန်အတွက် Google မှ လက်ရှိ တရားဝင်ထောက်ခံပေးထားသော Modern language မှာ မည်သည်ဖြစ်သနည်း။",
      options: ["Kotlin", "C#", "Swift", "PHP"],
      correct: 0
    },
    {
      q: "Gemini API ကဲ့သို့သော AI Models များနှင့် ချိတ်ဆက်ရာတွင် API key များ လုံခြုံစေရန် မည်သည့်နေရာတွင် သိမ်းဆည်းရန် အကြံပြုသနည်း။",
      options: ["Frontend local storage", "React state variable", "Server-side environment variables (.env)", "GitHub Public repository"],
      correct: 2
    },
    {
      q: "ဝဘ်ဆိုက်တစ်ခုတွင် component sizing သတ်မှတ်ရာ၌ screen size အားလုံးတွင် သင့်လျော်ပြောင်းလဲနိုင်စေရန် မည်သည့် measurement unit ကို ပိုမိုသုံးစွဲသင့်သနည်း။",
      options: ["px", "rem/em သို့မဟုတ် %", "cm", "pt"],
      correct: 1
    }
  ];

  const handleStartExam = () => {
    if (progress.overallProgressPercent < 100) {
      alert("⚠️ သတိပေးချက် - ဤ Roadmap ၏ သင်ခန်းစာများနှင့် ပရောဂျက်များ အားလုံး (100%) ပြီးမြောက်မှသာ Final Career Assessment ကို ဖြေဆိုခွင့် ရှိပါသည်ခင်ဗျာ။");
      return;
    }
    setExamActive(true);
    setExamSubmitted(false);
    setExamAnswers(new Array(10).fill(-1));
    setExamValidationMessage("");
  };

  const handleSelectExamAnswer = (questionIdx: number, optionIdx: number) => {
    const updated = [...examAnswers];
    updated[questionIdx] = optionIdx;
    setExamAnswers(updated);
  };

  const handleSubmitExam = () => {
    // Validate if all questions are answered
    if (examAnswers.includes(-1)) {
      setExamValidationMessage("⚠️ မေးခွန်းအားလုံးကို ဖြေဆိုရန် လိုအပ်ပါသည် ခင်ဗျာ။");
      return;
    }

    setExamValidationMessage("");
    // Calculate score
    let score = 0;
    MOCK_QUESTIONS.forEach((q, idx) => {
      if (examAnswers[idx] === q.correct) {
        score++;
      }
    });

    setExamScore(score);
    setExamSubmitted(true);

    if (score >= 8) {
      // Award certificate, completion badges, coins & XP
      const certId = `CLM-CERT-${selectedRoadmap.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newCertificate = {
        id: certId,
        courseTitle: `${selectedRoadmap.title} Career Roadmap`,
        issuedTo: user.name,
        issuedDate: new Date().toLocaleDateString(),
        verificationId: certId
      };

      const currentCertificates = user.certificates || [];
      const isAlreadyIssued = currentCertificates.some(c => c.courseTitle.includes(selectedRoadmap.title));

      const updatedCerts = isAlreadyIssued ? currentCertificates : [...currentCertificates, newCertificate];

      // Unlock Achievement badge
      const updatedAchievements = [...(user.achievements || [])];
      const badgeId = `badge-roadmap-${selectedRoadmap.id}`;
      const hasBadge = updatedAchievements.some(a => a.id === badgeId);

      if (!hasBadge) {
        updatedAchievements.push({
          id: badgeId,
          title: `${selectedRoadmap.title} ဘွဲ့ရပညာရှင်`,
          description: `Code Learn Myanmar ၏ ${selectedRoadmap.titleMm} ကို အောင်မြင်စွာ ပြီးမြောက်ခဲ့သူ ဖြစ်ပါသည်။`,
          icon: "Award",
          unlockedAt: new Date().toLocaleDateString()
        });
      }

      onUpdateUser({
        ...user,
        certificates: updatedCerts,
        achievements: updatedAchievements,
        xp: (user.xp || 0) + 500, // Career completion huge reward!
        coins: (user.coins || 0) + 200
      });

      // Trigger Grand Graduation Celebration
      setGraduationCelebrationData({
        type: "roadmap",
        title: "Roadmap Graduation Ceremony",
        titleMm: "အသက်မွေးဝမ်းကျောင်း လမ်းညွှန် ဘွဲ့နှင်းသဘင်!",
        subtitleMm: `ဂုဏ်ယူပါတယ်! သင်သည် "${selectedRoadmap.titleMm}" Career Roadmap ကို အောင်မြင်စွာ ပြီးမြောက်ပြီး တရားဝင် Developer Graduate ဖြစ်လာခဲ့ပါပြီ!`,
        xpEarned: 500,
        coinsEarned: 200,
        roadmapTitle: selectedRoadmap.title,
        developerTitleMm: `တရားဝင် ${selectedRoadmap.titleMm} ဘွဲ့ရပညာရှင်`,
        certificateId: certId,
        portfolioUpdated: true,
        unlockedBadge: {
          id: badgeId,
          title: `${selectedRoadmap.title} Graduate`,
          titleMm: `${selectedRoadmap.title} ဘွဲ့ရပညာရှင်`,
          descriptionMm: `${selectedRoadmap.titleMm} လမ်းစဉ်တစ်ခုလုံးရှိ သင်ခန်းစာများနှင့် Final Exam ကို ထူးချွန်စွာ အောင်မြင်ခဲ့ခြင်း။`,
          icon: "Award",
          category: "roadmap"
        },
        careerRecommendations: [
          { title: "Portfolio Project Review", desc: "သင့်၏ Developer Portfolio တွင် ဤ ဘွဲ့ရရှိမှုကို Live Link ဖြင့် ထည့်သွင်းပါ။" },
          { title: "Job Readiness & Interview Prep", desc: "လုပ်ငန်းခွင်အင်တာဗျူးများအတွက် Data Structures & Technical Q&A များကို လေ့ကျင့်ပါ။" }
        ]
      });
    }
  };

  const handleShowCertificate = () => {
    setSelectedCertRoadmap(selectedRoadmap);
    setCertModalOpen(true);
  };

  // Safe tab selection
  const handleSelectRoadmap = (roadmap: CareerRoadmap) => {
    if (roadmap.isPremium && !isPremiumUser) {
      // Show upgrade options
      setShowPremiumUpgradeModal(true);
      return;
    }
    setActiveRoadmapId(roadmap.id);
  };

  const handleUpgradeToPremium = () => {
    // Navigate to premium page
    setCurrentTab("premium");
    setShowPremiumUpgradeModal(false);
  };

  // Helper function to print/save certificate
  const handlePrintCert = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-[#1E293B] to-slate-900 border border-slate-200/10 dark:border-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-300 font-mono">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>OFFICIAL CAREER ROADMAPS</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight font-display text-white">
              အသက်မွေးဝမ်းကျောင်း လမ်းညွှန်မြေပုံများ
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              ပရိုဂရမ်မင်း စတင်လေ့လာသူအဆင့်မှ အလုပ်အကိုင်ရရှိနိုင်သော ကျွမ်းကျင် Developer တစ်ဦးဖြစ်လာစေရန် စနစ်တကျ ရေးဆွဲထားသော လမ်းညွှန်များ ဖြစ်ပါသည်။ လက်တွေ့သင်ခန်းစာများ၊ စိန်ခေါ်မှုပရောဂျက်များနှင့် အပြီးသတ်စာမေးပွဲများကို ကျော်ဖြတ်ပြီး တရားဝင်ဘွဲ့ရလက်မှတ်များ ရယူလိုက်ပါ။
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">YOUR COMPLETED COURSES</span>
              <span className="text-lg font-black font-mono text-white">
                {user.completedCourses?.length || 0} သင်တန်းပြီး
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROADMAPS SELECTION TABS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {CAREER_ROADMAPS.map((roadmap) => {
          const Icon = roadmap.icon;
          const isActive = roadmap.id === activeRoadmapId;
          const isLocked = roadmap.isPremium && !isPremiumUser;
          
          return (
            <button
              key={roadmap.id}
              onClick={() => handleSelectRoadmap(roadmap)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between h-36 ${
                isActive
                  ? "bg-gradient-to-tr from-[#1E293B] to-slate-900 border-blue-500 shadow-lg shadow-blue-500/10 text-white scale-[1.02]"
                  : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200"
              }`}
            >
              {isLocked && (
                <div className="absolute top-3 right-3 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[8px] font-bold text-amber-500 font-mono">PREMIUM</span>
                </div>
              )}
              
              <div className={`p-2.5 rounded-xl w-fit ${isActive ? "bg-blue-600/20 text-blue-400" : roadmap.bgColor + " " + roadmap.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-xs font-black truncate leading-tight mb-1 font-display">
                  {roadmap.title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {roadmap.titleMm}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* DETAILED ACTIVE ROADMAP DISPLAY & PROGRESS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE ROADMAP SUMMARY & PROGRESS STATS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Roadmap Identity */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-tr ${selectedRoadmap.gradient} text-white`}>
                <selectedRoadmap.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold block uppercase tracking-wider">
                  ACTIVE PATH
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-display">
                  {selectedRoadmap.title}
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedRoadmap.descriptionMm}
            </p>

            {/* PROGRESS TRACKER SECTION */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">စုစုပေါင်း တိုးတက်မှု (Overall Progress)</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{progress.overallProgressPercent}%</span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${selectedRoadmap.gradient} transition-all duration-500`}
                  style={{ width: `${progress.overallProgressPercent}%` }}
                />
              </div>

              {/* Grid with statistics details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/50">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Completed Lessons</span>
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-white">
                    {progress.completedLessonsCount} / {progress.totalLessons}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/50">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Completed Projects</span>
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-white">
                    {progress.completedProjectsCount} / {progress.totalProjects}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/50">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Remaining Tasks</span>
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-white">
                    {progress.totalTasks - progress.completedTasks}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800/50">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Est. Duration</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {progress.estimatedCompletionText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KIBO AI ROADMAP RECOMMENDATIONS */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-blue-900/40 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start space-x-3.5 relative z-10">
              {/* Mascot Bubble Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm text-slate-950 font-mono shadow-md flex-shrink-0">
                KB
              </div>
              
              <div className="space-y-3 flex-1 text-left">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 relative">
                  <span className="absolute top-3 -left-1.5 w-3 h-3 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    မင်္ဂလာပါ! ကျွန်တော်ကတော့ <strong className="text-blue-400">Kibo</strong> ပါဗျာ။ သင့်ရဲ့ လေ့လာမှုမှတ်တမ်းတွေကို အခြေခံပြီး နောက်ဆက်လက်လုပ်ဆောင်သင့်တဲ့ လေ့ကျင့်ခန်းတွေကို ထောက်ပြပေးချင်ပါတယ်ခင်ဗျာ။
                  </p>
                </div>

                {/* Recommendations checklist */}
                <div className="space-y-2 pt-1">
                  {kiboRecs.nextLesson && (
                    <button
                      onClick={() => handleLessonClick(kiboRecs.nextLesson!, kiboRecs.nextCourse?.titleMm || "")}
                      className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Play className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-all fill-current" />
                        <div className="truncate">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">RECOMMENDED NEXT LESSON</span>
                          <span className="text-xs font-bold text-slate-200 truncate block max-w-[170px]">{kiboRecs.nextLesson.titleMm}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}

                  {kiboRecs.practice && (
                    <button
                      onClick={() => handleProjectClick(kiboRecs.practice!)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Code className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-all" />
                        <div className="truncate">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">PRACTICE EXERCISE CHOSEN</span>
                          <span className="text-xs font-bold text-slate-200 truncate block max-w-[170px]">{kiboRecs.practice.titleMm}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}

                  {kiboRecs.revisionTopics.length > 0 && (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-yellow-500 font-bold uppercase tracking-wider block mb-1.5">💡 RECOMMENDED REVISIONS</span>
                      <div className="space-y-1">
                        {kiboRecs.revisionTopics.map(topic => (
                          <div key={topic.id} className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                            <span className="w-1 h-1 rounded-full bg-yellow-500" />
                            <span className="truncate">{topic.titleMm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CAREER GUIDANCE & INCOME STATS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                မြန်မာနိုင်ငံ လုပ်ငန်းခွင်နှင့် အခွင့်အလမ်းများ
              </h3>
            </div>

            <div className="space-y-3.5 text-left">
              {selectedRoadmap.careerOpportunities.map((opp, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{opp.title}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">Demand: {opp.demand}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{opp.salary}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">REQUIRED SKILLS (လိုအပ်သော ကျွမ်းကျင်မှုများ)</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoadmap.requiredSkills.map((skill, sIdx) => (
                  <span key={sIdx} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-bold border border-slate-200/50 dark:border-slate-700/50 font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ROADMAP LEARNING TIMELINE & NODES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main timeline header with instructions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                  သင်ကြားရေး အဆင့်များ (Roadmap Timeline)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  အဆင့်အလိုက် တစ်ဆင့်ချင်းစီ ပြီးမြောက်အောင် ဖြေဆိုပြီး နောက်တစ်ဆင့်များကို Unlock ဖွင့်လှစ်ယူပါ။
                </p>
              </div>

              <div className="flex items-center space-x-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono font-bold text-slate-500">
                <Layers className="w-3 h-3" />
                <span>{selectedRoadmap.stages.length} STAGES</span>
              </div>
            </div>

            {/* TIMELINE DISPLAY */}
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-3 space-y-8">
              
              {selectedRoadmap.stages.map((stage, stageIdx) => {
                const isUnlocked = isStageUnlocked(stage);
                const isExpanded = expandedStageId === stage.id;
                
                // Calculate state completeness of this stage
                let stageLessonsCount = 0;
                let stageLessonsCompleted = 0;
                const completedLessonsSet = new Set(user.completedLessons || []);
                
                stage.courses.forEach(c => {
                  c.lessons.forEach(l => {
                    stageLessonsCount++;
                    const isCompleted = l.realLessonId 
                      ? completedLessonsSet.has(l.realLessonId)
                      : completedLessonsSet.has(l.id);
                    if (isCompleted) stageLessonsCompleted++;
                  });
                });
                
                const isStageComplete = stageLessonsCount > 0 && stageLessonsCompleted === stageLessonsCount;

                return (
                  <div key={stage.id} className="relative">
                    
                    {/* Circle timeline dot marker */}
                    <div className={`absolute -left-[37px] top-1.5 w-6.5 h-6.5 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
                      isUnlocked
                        ? isStageComplete
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}>
                      {isUnlocked ? (
                        isStageComplete ? (
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        ) : (
                          <span className="text-[10px] font-black font-mono">{stageIdx + 1}</span>
                        )
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </div>

                    {/* Timeline Node Content Card */}
                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                      isExpanded
                        ? "bg-slate-50/50 dark:bg-slate-900/25 border-blue-500/50"
                        : "bg-transparent border-transparent"
                    }`}>
                      
                      {/* Node Header summary */}
                      <div 
                        onClick={() => {
                          if (isUnlocked) {
                            setExpandedStageId(isExpanded ? "" : stage.id);
                          } else {
                            alert("⚠️ ဤအဆင့်အား လော့ခ်ချထားပါသေးသည်။ ရှေ့သင်ခန်းစာများကို အရင်ဆုံးပြီးမြောက်အောင် ဖြေဆိုပေးပါခင်ဗျာ။");
                          }
                        }}
                        className={`flex items-start justify-between cursor-pointer ${isUnlocked ? "hover:opacity-80" : "opacity-60"}`}
                      >
                        <div className="text-left space-y-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white font-display">
                            {stage.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {stage.titleMm}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isUnlocked && stageLessonsCount > 0 && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                              isStageComplete 
                                ? "bg-emerald-500/10 text-emerald-500" 
                                : "bg-blue-500/10 text-blue-500"
                            }`}>
                              {stageLessonsCompleted} / {stageLessonsCount} Lessons Completed
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 text-slate-400 transform transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </div>
                      </div>

                      {/* Dropdown list of courses and tasks if expanded */}
                      {isExpanded && isUnlocked && (
                        <div className="mt-5 pl-1 border-l-2 border-dashed border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in animate-duration-200">
                          
                          {stage.courses.map((course) => (
                            <div key={course.id} className="pl-4 space-y-3.5">
                              
                              {/* Sub course details */}
                              <div className="text-left">
                                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                  MODULE COURSE
                                </span>
                                <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 font-display">
                                  {course.titleMm}
                                </h5>
                                <p className="text-[10px] text-slate-400">
                                  {course.description}
                                </p>
                              </div>

                              {/* Interactive tasks checklist */}
                              <div className="space-y-2">
                                
                                {/* Lessons checklist */}
                                {course.lessons.map((lesson) => {
                                  const isCompleted = lesson.realLessonId 
                                    ? completedLessonsSet.has(lesson.realLessonId)
                                    : completedLessonsSet.has(lesson.id);

                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() => handleLessonClick(lesson, course.titleMm)}
                                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                        isCompleted
                                          ? "bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/20 text-slate-800 dark:text-slate-200"
                                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/30 text-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2.5 min-w-0">
                                        {isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex-shrink-0" />
                                        )}
                                        <div className="text-left truncate">
                                          <span className="font-bold block truncate max-w-[300px]">{lesson.titleMm}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">{lesson.duration}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1.5 font-mono text-[9px] text-slate-400">
                                        <span>+30 XP</span>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Projects checklist */}
                                {course.projects.map((project) => {
                                  const isProjCompleted = user.completedProjects?.includes(project.id);
                                  
                                  return (
                                    <div
                                      key={project.id}
                                      onClick={() => handleProjectClick(project)}
                                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        isProjCompleted
                                          ? "bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/30 text-slate-800 dark:text-slate-200"
                                          : "bg-blue-500/5 dark:bg-blue-500/5 border-dashed border-blue-500/30 hover:border-blue-500 text-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2.5 min-w-0">
                                        <Code className={`w-4 h-4 flex-shrink-0 ${isProjCompleted ? "text-emerald-500" : "text-blue-500 animate-pulse"}`} />
                                        <div className="text-left truncate">
                                          <span className="font-extrabold text-blue-600 dark:text-blue-400 block truncate max-w-[300px]">
                                            🛠️ PROJECT: {project.titleMm}
                                          </span>
                                          <span className="text-[9px] text-slate-400 block truncate max-w-[320px]">
                                            {project.description}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1.5 font-mono text-[9px] text-emerald-500 font-bold">
                                        <span>+{project.points} XP</span>
                                      </div>
                                    </div>
                                  );
                                })}

                              </div>
                            </div>
                          ))}

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* FINAL ASSESSMENT EXAM INTERACTIVE CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                  Final Assessment & Certification
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  သင်ခန်းစာများအားလုံး ပြီးမြောက်ပါက ဉာဏ်ရည်စမ်းသပ်မှုဖြေဆိုပြီး အောင်လက်မှတ် ရယူလိုက်ပါ။
                </p>
              </div>
            </div>

            {/* Exam status trigger checks */}
            {!examActive && !examSubmitted && (
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                  ဤ Final Career Assessment သည် မေးခွန်း ၁၀ ခုပါဝင်ပြီး standard passing score မှာ <strong>၈၀% (၈ ခုမှန်ကန်ရမည်)</strong> ဖြစ်ပါသည်။ အောင်မြင်ပါက သင်၏နာမည်ဖြင့် Digital Graduate Certificate နှင့် <strong>+500 XP</strong> ဂုဏ်ပြုဆု ရရှိမည်ဖြစ်ပါသည်။
                </p>

                {progress.overallProgressPercent < 100 ? (
                  <div className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs text-slate-500 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Roadmap Tasks အားလုံးကို ပြီးဆုံးအောင် အရင်လုပ်ပါ ({progress.overallProgressPercent}% Complete)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleStartExam}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    ကွန်ပျူတာစစ်ဆေးမှု စတင်ဖြေဆိုမည် (Start Exam)
                  </button>
                )}
              </div>
            )}

            {/* ACTIVE EXAM CONTAINER */}
            {examActive && !examSubmitted && (
              <div className="space-y-6 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black text-indigo-500 font-mono uppercase">ONLINE ASSESSMENT SYSTEM</span>
                  <span className="text-xs font-bold text-slate-500 font-mono">10 QUESTIONS</span>
                </div>

                <div className="space-y-6">
                  {MOCK_QUESTIONS.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {qIdx + 1}။ {q.q}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = examAnswers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectExamAnswer(qIdx, optIdx)}
                              className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span className="font-bold font-mono mr-1.5">{String.fromCharCode(65 + optIdx)}।</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {examValidationMessage && (
                  <p className="text-xs text-red-500 font-bold">{examValidationMessage}</p>
                )}

                <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <button
                    onClick={() => setExamActive(false)}
                    className="py-2 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    ဖျက်သိမ်းရန် (Cancel)
                  </button>
                  <button
                    onClick={handleSubmitExam}
                    className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/15"
                  >
                    အဖြေလွှာတင်သွင်းမည် (Submit Exam)
                  </button>
                </div>
              </div>
            )}

            {/* EXAM RESULT CONTAINER */}
            {examSubmitted && (
              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg bg-emerald-500 text-white">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">
                    {examScore >= 8 ? "🎉 အောင်မြင်စွာ ဖြေဆိုနိုင်ခဲ့ပါသည်!" : "⚠️ သီရိပျက်ကွက်မှု ဖြစ်ပေါ်ခဲ့ပါသည်"}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    YOUR SCORE: {examScore} / 10 CORRECT (ရမှတ် {examScore * 10} မှတ်)
                  </p>
                </div>

                {examScore >= 8 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      ဂုဏ်ယူပါတယ်ခင်ဗျာ! သင်သည် <strong>{selectedRoadmap.title}</strong> စာမေးပွဲကို အောင်မြင်စွာ ဖြေဆိုပြီးဖြစ်သဖြင့် တရားဝင် ဘွဲ့ရလက်မှတ်ကို ရရှိပိုင်ဆိုင်ခွင့် ရရှိသွားပါပြီဗျာ။ +500 XP ဂုဏ်ပြုဆု ထပ်မံချီးမြှင့်လိုက်ပါသည်။
                    </p>
                    <button
                      onClick={handleShowCertificate}
                      className="py-3 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/25 flex items-center space-x-2 mx-auto"
                    >
                      <Award className="w-4 h-4 text-slate-950 stroke-[2.5px]" />
                      <span>အောင်လက်မှတ် ကြည့်ရှုမည် (View Certificate)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-red-500 font-bold max-w-md mx-auto">
                      အောင်ရန် ရမှတ်သည် အနည်းဆုံး ၈ မှတ် ဖြစ်သဖြင့် သင်ခန်းစာများကို ပြန်လည်လေ့လာပြီး နောက်တစ်ကြိမ် ထပ်မံကြိုးစားဖြေဆိုကြည့်ပါဦးခင်ဗျာ။
                    </p>
                    <button
                      onClick={() => {
                        setExamSubmitted(false);
                        setExamActive(true);
                        setExamAnswers(new Array(10).fill(-1));
                      }}
                      className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/15"
                    >
                      ပြန်လည်ဖြေဆိုမည် (Retake Exam)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* PREMIUM CARDS AND PORTFOLIO TEMPLATES */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-tr from-[#1E293B] to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6 text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-500 font-black tracking-widest block uppercase font-mono">EXCLUSIVE PREMIUM RESOURCES</span>
              <h2 className="text-lg lg:text-xl font-black font-display text-white">
                👑 Kibo Premium အဆင့်မြှင့်တင်မှု အထူးပံ့ပိုးမှုများ
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Premium ကျောင်းသားများအနေဖြင့် တိုးချဲ့လမ်းညွှန်များ၊ အလုပ်အကိုင်အဆင်သင့် ကိုယ်ပိုင် Portfolio Templates များနှင့် AI Advanced Projects များကို ရယူနိုင်ပါသည်။
              </p>
            </div>

            {!isPremiumUser && (
              <button
                onClick={handleUpgradeToPremium}
                className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer hover:scale-105 shadow-lg shadow-amber-500/20"
              >
                Premium အဆင့်မြှင့်တင်ရန်
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 relative group">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold absolute top-3 right-3 font-mono">GOLDEN</span>
              <Trophy className="w-8 h-8 text-amber-500 mb-3" />
              <h4 className="text-xs font-black text-white font-display">Exclusive Advanced Projects</h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Real-world SaaS, full-stack chats, automated Vision models.
              </p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 relative group">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold absolute top-3 right-3 font-mono">GOLDEN</span>
              <Award className="w-8 h-8 text-amber-500 mb-3" />
              <h4 className="text-xs font-black text-white font-display">Career & Resume Builders</h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Myanmar recruitment-friendly dynamic CV builders & job templates.
              </p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 relative group">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold absolute top-3 right-3 font-mono">GOLDEN</span>
              <Code className="w-8 h-8 text-amber-500 mb-3" />
              <h4 className="text-xs font-black text-white font-display">Responsive UI Templates</h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Clean interactive React web-resume codebases and Tailwind kits.
              </p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 relative group">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold absolute top-3 right-3 font-mono">GOLDEN</span>
              <Sparkles className="w-8 h-8 text-amber-500 mb-3" />
              <h4 className="text-xs font-black text-white font-display">1-on-1 AI Mentorship</h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Ask Kibo unlimited coding queries with advanced search grounding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GRADUATE DIGITAL CERTIFICATE VIEWER MODAL */}
      {certModalOpen && selectedCertRoadmap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header Controls */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                  တရားဝင် ဘွဲ့ရလက်မှတ် (Digital Career Certificate)
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">VERIFIED GRADUATE BLOCKCHAIN ID</span>
              </div>
              <button
                onClick={() => setCertModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                Close (ပိတ်ရန်)
              </button>
            </div>

            {/* Certificate Canvas Frame */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center">
              
              {/* PRINTABLE VECTOR-STYLE E-CERTIFICATE CARD */}
              <div id="printable-certificate" className="w-full max-w-3xl bg-white border-[12px] border-double border-amber-600/60 p-8 lg:p-12 shadow-xl relative overflow-hidden text-center text-slate-900 flex flex-col justify-between aspect-[1.414/1] min-h-[480px]">
                
                {/* Background watermarks decorative */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-600/5 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border-2 border-dashed border-amber-100 rounded-full pointer-events-none flex items-center justify-center">
                  <div className="w-[300px] h-[300px] border border-amber-200/50 rounded-full flex items-center justify-center font-serif font-black text-amber-500/5 text-8xl">
                    CLM
                  </div>
                </div>

                {/* Top Headers */}
                <div className="space-y-1 relative z-10">
                  <h4 className="font-serif font-bold text-amber-700 tracking-[0.2em] text-lg uppercase">
                    Code Learn Myanmar
                  </h4>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-slate-500">
                    Interactive Professional Development Academy
                  </span>
                </div>

                {/* Sub title statement */}
                <div className="space-y-4 relative z-10">
                  <span className="block font-serif italic text-sm text-slate-600">
                    This is to officially certify that
                  </span>
                  
                  <h2 className="font-serif font-black text-2xl lg:text-3xl text-slate-900 border-b-2 border-slate-200 pb-2 w-fit mx-auto min-w-[280px]">
                    {user.name}
                  </h2>

                  <p className="font-serif text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                    has successfully completed all requirements, active modules, practical exercises, and passed the final career validation examinations for the path:
                  </p>

                  <h3 className="font-serif font-black text-xl lg:text-2xl text-amber-700 uppercase tracking-wide">
                    {selectedCertRoadmap.title}
                  </h3>
                </div>

                {/* Seals & Verification Details */}
                <div className="flex flex-row items-end justify-between pt-6 border-t border-slate-100 relative z-10">
                  
                  {/* Verification Block ID */}
                  <div className="text-left font-mono text-[9px] text-slate-400 space-y-0.5">
                    <span className="block">VERIFICATION ID:</span>
                    <span className="font-bold text-slate-700 uppercase">CLM-ROADMAP-{selectedCertRoadmap.id.toUpperCase()}-VERIFIED</span>
                    <span className="block">DATE: {new Date().toLocaleDateString()}</span>
                  </div>

                  {/* Stamp Gold Logo seal */}
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 flex items-center justify-center relative">
                    <div className="w-13 h-13 rounded-full border border-dashed border-amber-600 bg-amber-50 flex items-center justify-center text-[10px] font-serif font-bold text-amber-700">
                      SEAL
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="text-right space-y-1">
                    <div className="font-serif italic text-sm text-slate-700 border-b border-slate-300 w-32 ml-auto">
                      Kibo AI
                    </div>
                    <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                      Chief Academic Mentor
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* Print & download option controls */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end space-x-3">
              <button
                onClick={handlePrintCert}
                className="py-2 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>ပုံနှိပ်ထုတ်ယူမည် (Print / Save PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PREMIUM UPGRADE OVERLAY MODAL */}
      {showPremiumUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full mx-auto flex items-center justify-center shadow-md animate-pulse">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                👑 Kibo Premium သီးသန့် ကန့်သတ်ချက်
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Backend, Full Stack, Android နှင့် AI Web Application စသည့် အဆင့်မြင့် အသက်မွေးဝမ်းကျောင်း လမ်းညွှန်များအား ဝင်ရောက်လေ့လာရန် Kibo Premium သို့ အဆင့်မြှင့်တင်ရန် လိုအပ်ပါသည်။
              </p>
            </div>

            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-left space-y-2">
              <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Premium စနစ်မှ ရရှိမည့် အားသာချက်များ</span>
              </h4>
              <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>စုစုပေါင်း ၅ ခုသော အသက်မွေးဝမ်းကျောင်း လမ်းညွှန်မြေပုံများ။</li>
                <li>အပြီးသတ် Final Assessment များနှင့် တရားဝင် Graduate ဘွဲ့ရလက်မှတ်များ။</li>
                <li>ကိုယ်ပိုင် Responsive Web Portfolio templates များ။</li>
                <li>လုပ်ငန်းခွင်အဆင်သင့် အကူအညီများ။</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPremiumUpgradeModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                နောက်မှလုပ်မည် (Later)
              </button>
              <button
                onClick={handleUpgradeToPremium}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                အဆင့်မြှင့်တင်မည် (Upgrade)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graduation Celebration Modal */}
      {graduationCelebrationData && (
        <CelebrationModal
          data={graduationCelebrationData}
          user={user}
          onClose={() => setGraduationCelebrationData(null)}
          onNavigateTab={(tab) => {
            setGraduationCelebrationData(null);
            if (setCurrentTab) setCurrentTab(tab);
          }}
          isPremiumUser={isPremiumUser}
        />
      )}

    </div>
  );
}
