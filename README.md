# ⚡ SLYNC | Neon Cyberpunk Developer Workspace

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00ffcc?style=for-the-badge&logo=githubpages&logoColor=black)](https://pavandurgasaigupta.github.io/slync/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**A high-performance, cyberpunk-themed developer workspace for managing notes, todos, bookmarks, and Git workflows with real-time GitHub synchronization.**

[🚀 **Launch Live Demo**](https://pavandurgasaigupta.github.io/slync/) · [📖 Features](#-key-features) · [🛠️ Tech Stack](#-technologies-used) · [⚙️ Getting Started](#-getting-started) · [📦 Deployment](#-deployment)

</div>

---

## 🌐 Live Application

The application is deployed and hosted on GitHub Pages:
👉 **[https://pavandurgasaigupta.github.io/slync/](https://pavandurgasaigupta.github.io/slync/)**

---

## ⚡ Overview

**SLYNC** (Neon Syncspace) is an all-in-one developer productivity platform built with a futuristic cyberpunk terminal aesthetic. It bridges the gap between local developer workflows and cloud persistence by allowing you to sync all your personal developer data (markdown notes, categorized tasks, developer bookmarks) directly with your private GitHub repositories or Supabase backend.

---

## ✨ Key Features

### 📝 1. Notes Manager
- **Markdown-first Editor**: Rich markdown editing with live rendering and syntax highlighting.
- **Hierarchical Folders**: Organize notes across custom folders and subfolders.
- **Search & Tagging**: Instant search with multi-tag filtering.
- **GitHub Sync**: Push and pull markdown notes directly to your personal GitHub repository.

### ✅ 2. Todo & Task Tracker
- **Priority Management**: Classify tasks by priority (Urgent, High, Medium, Low).
- **Status Workflows**: Track backlog, in-progress, and completed tasks.
- **Due Dates & Timelines**: Set completion deadlines with overdue alerts.
- **Category Filters**: Filter tasks by project or context.

### 🔖 3. Developer Bookmarks Hub
- **Categorized Bookmarks**: Organize repositories, documentation, tools, and tutorials.
- **Tagging & Instant Search**: Rapid keyboard-driven search for quick access.
- **Direct Launch**: One-click opening for frequent developer resources.

### 🔄 4. GitHub Repository Direct Sync (Octokit)
- **Zero-Middleman Persistence**: Connect directly to your GitHub repository using a Personal Access Token (PAT).
- **Automated Commits**: Synchronize your notes, todos, and bookmarks as structured files (`.md`, `.json`) directly in your repository.
- **Version History**: Leverage Git versioning to track revisions of your notes and tasks.

### 💻 5. Interactive Git Commands Cheatsheet
- **Comprehensive Command Library**: Categorized reference for everyday and advanced Git workflows.
- **Quick Copy**: One-click copy-to-clipboard for rapid terminal execution.
- **Detailed Explanations**: Examples and parameter breakdowns for rebasing, cherry-picking, stash workflows, and branch management.

### 🎨 6. Cyberpunk Theming Engine & Visual Effects
- **Dynamic Themes**: Multiple neon color palettes including Neon Green, Cyber Blue, Matrix Green, Synthwave Purple, and Dark Terminal.
- **Visual FX**: Canvas-based Matrix Rain background effect, animated scanlines, neon glow borders, and glitch text animations.

### 💾 7. Data Import & Export
- **JSON & Markdown Backups**: Export your entire workspace into a portable JSON or folder of Markdown files.
- **Data Migration**: Restore or migrate workspace data anytime without vendor lock-in.

---

## 🛠️ Technologies Used

SLYNC is built with a modern, production-grade frontend and tooling stack:

### 🖥️ Core & Runtime
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **[React](https://react.dev/)** | `18.3.1` | Declarative component-based UI architecture |
| **[TypeScript](https://www.typescriptlang.org/)** | `5.5.3` | Strict static typing and enhanced developer experience |
| **[Vite](https://vitejs.dev/)** | `5.4.10` | Next-generation fast frontend build tool and dev server |
| **[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)** | `3.5.0` | Speedy SWC-based React compiler for Vite |

### 🎨 Styling & Design System
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **[Tailwind CSS](https://tailwindcss.com/)** | `3.4.11` | Utility-first CSS framework with custom cyberpunk theme tokens |
| **[Radix UI](https://www.radix-ui.com/)** | Latest | Accessible, unstyled UI primitives (Dialog, Tabs, Accordion, Dropdown, etc.) |
| **[Shadcn UI](https://ui.shadcn.com/)** | Custom | Modular, customizable component design system |
| **[PostCSS](https://postcss.org/)** & **[Autoprefixer](https://github.com/postcss/autoprefixer)** | `8.4.47` / `10.4.20` | CSS transformations and cross-browser vendor prefixing |
| **[Tailwindcss Animate](https://github.com/jamiebuilds/tailwindcss-animate)** | `1.0.7` | Keyframe and transition animations for Tailwind |
| **[@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)** | `0.5.15` | Beautiful markdown typography rendering |

### 🎬 Animations & Interactive FX
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **[Framer Motion](https://www.framer.com/motion/)** | `12.6.2` | Fluid layout animations, page transitions, and micro-interactions |
| **HTML5 Canvas** | Native | High-performance Matrix rain digital stream background effect |
| **CSS Glitch & Scanline FX** | Custom | Retro-futuristic cyberpunk visual shaders |

### 🗄️ State Management & Data Fetching
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **[Zustand](https://zustand-demo.pmnd.rs/)** | `5.0.3` | Lightweight, scalable state management with local storage persistence |
| **[TanStack React Query](https://tanstack.com/query/latest)** | `5.56.2` | Async server-state management, caching, and data synchronization |

### 🔌 APIs & Backend Integrations
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **[Octokit](https://github.com/octokit/octokit.js)** | `4.1.2` | Official GitHub REST & GraphQL API client for Git repository sync |
| **[@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction)** | `2.49.4` | Supabase cloud database, auth, and storage client |

### 📋 Form Handling & Utilities
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **[React Hook Form](https://react-hook-form.com/)** | `7.53.0` | Performant form state management |
| **[Zod](https://zod.dev/)** | `3.23.8` | Schema declaration and validation |
| **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** | `3.9.0` | Zod resolver integration for React Hook Form |
| **[Lucide React](https://lucide.dev/)** | `0.462.0` | Clean, customizable icon set |
| **[Sonner](https://sonner.emilkowal.ski/)** | `1.5.0` | Polished, customizable toast notifications |
| **[cmdk](https://cmdk.paco.me/)** | `1.0.0` | Fast, accessible command palette |
| **[Recharts](https://recharts.org/)** | `2.12.7` | Composable charting library for workspace analytics |
| **[date-fns](https://date-fns.org/)** | `3.6.0` | Modern modular date utility library |
| **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** | Latest | Conditional and conflict-free className resolution |
| **[class-variance-authority](https://cva.style/docs)** | `0.7.1` | Component variant configuration |
| **[vaul](https://vaul.emilkowal.ski/)** | `0.9.3` | Drawer component for mobile views |
| **[embla-carousel-react](https://www.embla-carousel.com/)** | `8.3.0` | Smooth carousel slider |

### 🚀 Tooling, CI/CD & Deployment
| Technology | Purpose |
| :--- | :--- |
| **[GitHub Pages](https://pages.github.com/)** | Static site hosting platform |
| **[GitHub Actions](https://github.com/features/actions)** | Automated CI/CD pipeline for build and deployment on push to `main` |
| **[gh-pages](https://github.com/tschaub/gh-pages)** | CLI deployment automation to `gh-pages` branch |
| **[ESLint](https://eslint.org/)** | Code quality and linting |
| **[React Router DOM](https://reactrouter.com/)** | HashRouter routing for seamless SPA navigation on GitHub Pages |

---

## 📁 Repository Structure

```
slync/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD deployment workflow
├── public/                   # Static assets (favicons, robots.txt)
├── src/
│   ├── components/           # Reusable UI & Cyberpunk components
│   │   ├── auth/             # Authentication components & dialogs
│   │   ├── ui/               # Shadcn/Radix UI primitive components
│   │   ├── FolderList.tsx    # Hierarchical folder view
│   │   ├── GlitchText.tsx    # Cyberpunk glitch typography effect
│   │   ├── MatrixRain.tsx    # Matrix digital rain canvas effect
│   │   ├── NeonButton.tsx    # Glow button component
│   │   ├── NeonInput.tsx     # Cyberpunk styled inputs
│   │   ├── ThemeSwitcher.tsx # Theme selector
│   │   └── ImportExportManager.tsx
│   ├── contexts/             # React Contexts (AuthContext)
│   ├── hooks/                # Custom React Hooks (useTheme, useNotes, useToast)
│   ├── integrations/         # External integrations (Supabase)
│   ├── lib/                  # Shared utility functions (utils.ts)
│   ├── pages/                # Application Page Views
│   │   ├── Auth.tsx          # GitHub / Supabase authentication
│   │   ├── Bookmarks.tsx     # Developer bookmarks workspace
│   │   ├── GitCommands.tsx   # Interactive Git commands cheatsheet
│   │   ├── GitHubSetup.tsx   # GitHub token & repository setup guide
│   │   ├── HowToUse.tsx      # Comprehensive platform user guide
│   │   ├── ImportExport.tsx  # Data backup & restore page
│   │   ├── Index.tsx         # Central dashboard & terminal hub
│   │   ├── Notes.tsx         # Markdown notes manager
│   │   ├── Themes.tsx        # Cyberpunk visual customizer
│   │   ├── Todos.tsx         # Task and todo manager
│   │   └── NotFound.tsx      # 404 page
│   ├── store/                # Zustand Global State Store (authStore.ts)
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Root App component with HashRouter
│   ├── index.css             # Global CSS and Tailwind directives
│   └── main.tsx              # Application entry point
├── index.html                # HTML template
├── package.json              # Project manifest and scripts
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration with GitHub Pages base path
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `bun`)
- **Git**: Installed on your local machine

### 1. Clone the Repository
```bash
git clone https://github.com/PavanDurgaSaiGupta/slync.git
cd slync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 GitHub Authentication & Sync Setup

To sync your data directly with a private GitHub repository:

1. Generate a **Personal Access Token (Classic)** on GitHub:
   - Go to [GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens).
   - Click **Generate new token (classic)**.
   - Set expiration and select the **`repo`** scope (Full control of private repositories).
   - Copy the generated token.
2. In SLYNC, navigate to the **Auth** page.
3. Enter your **GitHub Username**, **Personal Access Token**, and target **Repository Name** (e.g., `slync-data`).
4. Click **Connect Repository**. Your notes, todos, and bookmarks will now automatically synchronize with GitHub.

---

## 📦 Deployment to GitHub Pages

This repository is preconfigured for automatic deployment to GitHub Pages via **GitHub Actions**:

1. Every push to the `main` branch triggers the [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) workflow.
2. The workflow automatically installs dependencies, builds the production bundle with `vite build`, and publishes the output to GitHub Pages.
3. Access the live site at: **[https://pavandurgasaigupta.github.io/slync/](https://pavandurgasaigupta.github.io/slync/)**

### Manual Deployment via CLI
You can also trigger a manual build and deployment anytime:
```bash
npm run deploy
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Engineered by <a href="https://github.com/PavanDurgaSaiGupta">Pavan Durga Sai Gupta</a> · Built for hackers and developers.</sub>
</div>
