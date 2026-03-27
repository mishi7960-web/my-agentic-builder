import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Terminal, Play, Code2, MessageSquare, Bot, User, Sparkles, AlertCircle, RefreshCw, 
  KeyRound, X, ChevronRight, Zap, Copy, Download, Trash2, Maximize2, Minimize2, Check,
  Smartphone, Tablet as TabletIcon, Monitor, Undo, Redo, TerminalSquare, Package, ExternalLink, 
  Wand2, Paintbrush, Lightbulb, Share2, Moon, Sun, Power, Bookmark, Image as ImageIcon, 
  FileArchive, Edit2, GripVertical, Rocket, Eye, EyeOff, ImagePlus, Mic, History, Blocks, RotateCcw, 
  ZoomIn, ZoomOut, PanelLeftClose, PanelLeftOpen, DownloadCloud, Lock, MessageSquarePlus, 
  FolderOpen, Database, Github, Search, GitCompare, Share, MousePointerClick, Target, AlignLeft, 
  Save, Users, CloudLightning, Activity, GitBranch, Layers, Figma, BookOpen, TestTube, Gauge, 
  HardDriveDownload, HardDriveUpload, ShieldCheck, Workflow, Video, Wand, SplitSquareHorizontal, 
  Accessibility, Split, Music, ServerCrash, Globe, Regex, Box, Component, ArrowUpCircle, GitPullRequest, AppWindow,
  Ghost, Flame, Volume2, VolumeX, Command, Menu,
  Tag, ShieldAlert, UserPlus, Network, Library, Wind, Repeat, Scale, LayoutGrid,
  PenTool, MonitorSpeaker, CheckSquare, BrainCircuit,
  DatabaseBackup, SplitSquareVertical, BugPlay, Headset, Brain, Puzzle, Map as MapIcon, SearchCode, Replace
} from 'lucide-react';

// --- Environment API Key Fallback ---
const apiKey = ""; 

// --- Safe Backtick Generator (Prevents Markdown Parser Crashes) ---
const T_BACKTICKS = String.fromCharCode(96, 96, 96);

// --- Agent Personas ---
const PERSONAS = {
  default: `You are Omni-Agent, an elite AI frontend engineer operating in 'Omni-Sandbox'.\n\nYOUR DIRECTIVE:\nYou are building production-ready applications inside a Live Canvas environment.\n\nRULES FOR BEST RESULTS:\n1. CHAIN OF THOUGHT: Always plan your architecture first.\n2. ONE SINGLE FILE: You must output EXACTLY ONE ${T_BACKTICKS}html code block containing the complete HTML file. NEVER output separate frontend/backend files.\n3. UNIFIED ARCHITECTURE: Embed all CSS (Tailwind) and JS within the single HTML file.\n4. NO PLACEHOLDERS: Write complete code. NEVER truncate.\n5. PRESERVE FUNCTIONALITY: When editing existing code, merge and improve. Do not duplicate. Preserve all logic.\n6. AESTHETIC EXCELLENCE: Default to modern UI/UX principles.`,
  tailwind: `You are Omni-Agent, a world-class UI/UX Designer and Tailwind CSS Expert.\n\nYOUR DIRECTIVE: Build visually stunning, hyper-modern web applications.\n\nRULES:\n1. Output exactly ONE complete ${T_BACKTICKS}html block.\n2. Prioritize incredible aesthetics: glassmorphism, gradients, smooth transitions. Use Tailwind CSS exclusively.\n3. NEVER use placeholders. Provide complete code.`,
  gamedev: `You are Omni-Agent, a senior WebGL and Canvas HTML5 Game Developer.\n\nYOUR DIRECTIVE: Build highly performant, 60FPS browser games.\n\nRULES:\n1. Output exactly ONE complete ${T_BACKTICKS}html block containing the game.\n2. Prioritize requestAnimationFrame loops, efficient rendering, clean physics math.\n3. NEVER use placeholders. Ensure complete logic is returned.`,
  datascientist: `You are Omni-Agent, a Data Visualization Expert.\n\nYOUR DIRECTIVE: Build gorgeous, interactive data dashboards and charts.\n\nRULES:\n1. Output exactly ONE complete ${T_BACKTICKS}html block.\n2. Utilize CDN libraries like Chart.js, D3.js, or Recharts. Generate realistic mock data.\n3. Do not truncate the file.`
};

const MULTI_AGENT_PROMPT = `You are the Omni Development Team consisting of three personas: The Architect, The Developer, and The QA Tester. 
When responding, structure your thought process internally as:
1. [ARCHITECT]: Plan the structure and UI/UX.
2. [DEVELOPER]: Write the flawless, unified HTML/CSS/JS code block. Ensure it is complete with NO placeholders.
3. [QA TESTER]: Mentally verify responsive design, error handling, and aesthetics. Check that NO existing features were broken.
Return EXACTLY ONE ${T_BACKTICKS}html code block containing the final, verified application.`;

const VOICE_PERSONA = `You are Omni, an advanced, conversational AI voice assistant (powered by Google Gemini). 
YOUR DIRECTIVE: 
1. Be friendly, helpful, and concise. You are speaking out loud to the user.
2. If the user asks you to build or modify code, briefly acknowledge the request in 1-2 sentences, and then output EXACTLY ONE ${T_BACKTICKS}html code block containing the complete HTML file.
3. NEVER truncate the code. Preserve existing logic.
4. Keep the conversational part of your response short so the text-to-speech doesn't talk forever.`;

const DEFAULT_CODE = `<!-- Your generated code will appear here -->\n<div class="p-8 text-center font-sans">\n  <h1 class="text-3xl font-bold text-gray-800">Hello, App Canvas!</h1>\n  <p class="text-gray-500 mt-2">Describe what you want to build in the chat.</p>\n</div>`;

// --- DRY Agent Actions Configuration ---
const AGENT_ACTIONS = [
  { id: 'bootstrap', icon: Rocket, title: 'Bootstrap Base App', color: 'text-green-400', isInfo: false, msg: '🚀 Bootstrapping foundation...', prompt: 'Please automatically build a complete, modern Canvas File boilerplate from scratch. It should include a stunning layout with Tailwind CSS, a centered glassmorphism container, a beautiful animated gradient background, and a pulsing placeholder element. Output ONLY the complete, fully functioning HTML file.' },
  { id: 'auto-improve', icon: Eye, title: 'UI/UX QA Review', color: 'text-purple-400', isInfo: false, msg: '👁️ Reviewing UI/UX...', prompt: 'Act as a rigorous UI/UX QA Tester and Senior Engineer. Mentally render this Canvas File and fix ALL visual flaws, clunky UX, missing animations, poor contrast, or bad mobile responsiveness to make it premium quality. Return ONLY the fully upgraded HTML file.' },
  { id: 'explain', icon: Lightbulb, title: 'Explain Code', color: 'text-blue-400', isInfo: true, msg: '🧠 Analyzing code...', prompt: 'Please provide a clear, concise, and educational explanation of how the following code works. Break down the structure, styling, and logic in Markdown. DO NOT write new HTML code.' },
  { id: 'beautify', icon: Paintbrush, title: 'Beautify UI', color: 'text-pink-400', isInfo: false, msg: '🎨 Upgrading design...', prompt: 'Significantly upgrade the UI/UX. Use modern Tailwind CSS classes to add beautiful color palettes, spacing, rounded corners, transitions, and shadows. Make it look like a premium, modern web app. Do not remove functionality.' },
  { id: 'polish', icon: Wand2, title: 'Refactor & Polish', color: 'text-amber-400', isInfo: false, msg: '✨ Refactoring code...', prompt: 'Refactor this code to improve performance, clean up the logic, add helpful comments, and ensure best coding practices. Return ONLY the fully-functional HTML file.' },
  { id: 'readme', icon: BookOpen, title: 'Generate README', color: 'text-cyan-400', isInfo: true, msg: '📚 Writing documentation...', prompt: 'Act as a Technical Writer and generate a comprehensive, professional README.md for this application based on the code provided. Include features, architecture, and instructions.' },
  { id: 'test', icon: TestTube, title: 'Write Unit Tests', color: 'text-yellow-400', isInfo: true, msg: '🧪 Generating tests...', prompt: `Act as a QA Automation Engineer. Write a comprehensive suite of Jest/Vitest unit tests for the logic contained in the provided Canvas File. Output ONLY the test file code in a ${T_BACKTICKS}js block.` },
  { id: 'e2e-test', icon: CheckSquare, title: 'Generate E2E Tests', color: 'text-green-300', isInfo: true, msg: '🤖 Generating Playwright Scripts...', prompt: `Act as an SDET. Analyze the DOM elements and logic in this file and generate a robust suite of end-to-end (E2E) tests using Playwright. Output the script in a ${T_BACKTICKS}js block.` },
  { id: 'flowchart', icon: Workflow, title: 'Architecture Flowchart', color: 'text-indigo-400', isInfo: true, msg: '🗺️ Mapping architecture...', prompt: 'Act as an Application Architect. Reverse-engineer the provided Canvas File and output a beautiful, complex `mermaid.js` flowchart graph that maps out the DOM structure, state logic, and component hierarchy. Output ONLY the mermaid block.' },
  { id: 'security', icon: ShieldCheck, title: 'Security Audit', color: 'text-red-400', isInfo: false, msg: '🛡️ Scanning vulnerabilities...', prompt: 'Act as a Cyber Security Auditor. Aggressively scan the provided Canvas File for vulnerabilities (XSS, insecure data handling, unhandled rejections). Provide a fixed, hardened version of the HTML file.' },
  { id: 'refactor-multi', icon: SplitSquareHorizontal, title: 'Semantic Auto-Refactoring', color: 'text-emerald-400', isInfo: true, msg: '📂 Splitting architecture...', prompt: 'Act as a Senior Architect. This single file is getting large. Analyze it and output a plan to cleanly split it into a multi-file component architecture (e.g., components/, hooks/, styles.css). Output the file structures in code blocks.' },
  { id: 'animate', icon: Flame, title: 'Auto-Animate', color: 'text-orange-400', isInfo: false, msg: '🔥 Injecting animations...', prompt: 'Add complex, satisfying GSAP or Framer-Motion style CSS/JS animations to this UI. Add hover states, entrance animations, and smooth transitions. Keep all existing functionality.' },
  { id: 'a11y', icon: Accessibility, title: 'a11y Auto-Patcher', color: 'text-teal-400', isInfo: false, msg: '♿ Patching accessibility...', prompt: 'Deep scan this code for accessibility issues. Add missing ARIA roles, fix color contrast, add alt text, and ensure keyboard navigation works perfectly. Return the 100% WCAG compliant code.' },
  { id: 'ab-test', icon: Split, title: 'A/B Test Generator', color: 'text-indigo-300', isInfo: false, msg: '⚖️ Creating A/B variants...', prompt: 'Modify this code to include two distinct design variants (A and B) of the main UI component. Add a small toggle button at the top to switch between Variant A and Variant B for A/B testing.' },
  { id: 'sfx', icon: Music, title: 'Add Sound Effects', color: 'text-purple-300', isInfo: false, msg: '🎵 Generating Web Audio...', prompt: 'Integrate the Web Audio API to automatically generate and attach satisfying, synthesized sound effects to the UI interactions (button clicks, success states, error states) without needing external audio files.' },
  { id: 'schema', icon: Database, title: 'DB Schema Builder', color: 'text-blue-300', isInfo: true, msg: '🗄️ Designing database...', prompt: 'Act as a Database Administrator. Analyze this UI and generate a complete relational database schema. Output a Mermaid.js ERD diagram, AND the raw SQL script (SQLite compatible) to create the necessary tables.' },
  { id: 'i18n', icon: Globe, title: 'Auto-Localization', color: 'text-sky-400', isInfo: false, msg: '🌍 Localizing text...', prompt: 'Extract all hardcoded English text strings in this UI into a JavaScript dictionary. Add translations for Spanish and French. Implement a dropdown to dynamically switch the UI language.' },
  { id: 'regex', icon: Regex, title: 'Regex Generator', color: 'text-pink-300', isInfo: true, msg: '🔣 Generating RegExp...', prompt: 'Analyze the active code context or request. Generate the exact Regular Expression needed, explain its capture groups, and provide a small JS snippet testing it.' },
  { id: 'storybook', icon: Component, title: 'Isolate Component', color: 'text-rose-400', isInfo: false, msg: '📦 Isolating component...', prompt: 'Remove all surrounding application wrapper code and isolate ONLY the primary component (or the specifically targeted element). Modify the HTML to display this component beautifully centered, like a Storybook preview.' },
  { id: 'storybook-cat', icon: Layers, title: 'Generate Component Catalog', color: 'text-rose-300', isInfo: false, msg: '📚 Building Storybook...', prompt: 'Parse the entire canvas logic and isolate all reusable UI patterns. Refactor this file into a fully interactive, documented Component Catalog view displaying variants of each component.' },
  { id: 'sketch', icon: PenTool, title: 'Sketch-to-UI', color: 'text-blue-500', isInfo: false, msg: '✏️ Converting Sketch to UI...', prompt: 'If an image of a wireframe or sketch is attached, use the Vision model to flawlessly translate it into a fully styled, responsive Tailwind HTML canvas. If no image is attached, please politely ask the user to upload one.' },
  { id: 'wasm', icon: BrainCircuit, title: 'WASM Compiler Logic', color: 'text-emerald-500', isInfo: false, msg: '⚙️ Generating WASM logic...', prompt: 'Simulate a WebAssembly environment. Rewrite the core mathematical or logic loop of this app into embedded C/Rust code strings, and add Pyodide or a WASM wrapper to execute it. Make it performant.' },
  { id: 'rag-search', icon: Brain, title: 'Local RAG Search', color: 'text-fuchsia-400', isInfo: true, msg: '🧠 Searching local knowledge base...', prompt: 'Simulate querying a local vector database. Read the current context and generate code using advanced, undocumented SDK patterns as if retrieved from local offline docs.' },
  { id: 'gen-assets', icon: ImagePlus, title: 'GenAI Assets', color: 'text-violet-400', isInfo: false, msg: '🎨 Generating assets...', prompt: 'Scan the HTML for any <img> tags with placeholder src URLs. Generate realistic base64 image strings using a simulated local diffusion model and replace the src attributes.' },
  { id: 'node-builder', icon: Puzzle, title: 'Visual Node Builder', color: 'text-lime-400', isInfo: true, msg: '🧩 Generating React Flow nodes...', prompt: 'Parse the state and logic of this file. Output a JSON configuration suitable for React Flow that maps out the interactive node-based architecture of this app.' },
  { id: 'upgrade-deps', icon: ArrowUpCircle, title: 'Upgrade Dependencies', color: 'text-emerald-300', isInfo: false, msg: '🔄 Upgrading packages...', prompt: 'Scan the HTML head for CDN links. Update all libraries (React, Tailwind, GSAP, Three.js, etc.) to their absolute latest stable versions. Fix any breaking API changes in the JS code.' },
  { id: 'pr-review', icon: GitPullRequest, title: 'Automated PR Review', color: 'text-gray-400', isInfo: true, msg: '👀 Reviewing Pull Request...', prompt: 'Act as a Senior Developer reviewing a Pull Request. Critique this code for anti-patterns, performance bottlenecks, and bad practices. Provide inline suggestions formatted clearly in Markdown.' },
  { id: 'seo-tags', icon: Tag, title: 'SEO & OpenGraph', color: 'text-blue-400', isInfo: false, msg: '🔍 Generating SEO tags...', prompt: 'Read the HTML and generate perfect meta tags, Open Graph tags, and Twitter cards. Append a visual SEO mock-up card at the bottom of the UI.' },
  { id: 'red-team', icon: ShieldAlert, title: 'Red Team Bug Injector', color: 'text-red-500', isInfo: false, msg: '👾 Injecting vulnerability...', prompt: 'Secretly inject a hidden logic bug, memory leak, or UI glitch into this code for me to practice debugging. Add a comment // RED TEAM BUG INJECTED near it.' },
  { id: 'webrtc', icon: UserPlus, title: 'WebRTC Multiplayer', color: 'text-green-500', isInfo: false, msg: '📡 Adding multiplayer cursors...', prompt: 'Inject WebRTC / Yjs boilerplate into this canvas to enable live multiplayer cursors and state sharing.' },
  { id: 'xstate', icon: Network, title: 'XState Grapher', color: 'text-indigo-400', isInfo: true, msg: '🕸️ Mapping state machine...', prompt: 'Analyze the state logic of this app and generate a visual State Machine Graph using Mermaid.js.' },
  { id: 'mock-data', icon: Database, title: 'Auto-Faker Data', color: 'text-amber-500', isInfo: false, msg: '📝 Populating mock data...', prompt: 'Detect any lists, tables, or grids in the UI and automatically populate them with highly realistic, context-aware mock data instead of generic lorem ipsum.' },
  { id: 'swagger', icon: Library, title: 'Swagger Auto-Gen', color: 'text-pink-500', isInfo: false, msg: '📖 Generating API Docs...', prompt: 'Generate a fully interactive Swagger UI page within this sandbox to document the local mock API endpoints.' },
  { id: 'css-tailwind', icon: Repeat, title: 'CSS <-> Tailwind', color: 'text-teal-400', isInfo: false, msg: '🔄 Converting styles...', prompt: 'Convert all raw CSS to Tailwind utility classes, OR convert Tailwind back to raw CSS depending on what is currently used.' },
  { id: 'perf-budget', icon: Scale, title: 'Performance Budget', color: 'text-orange-500', isInfo: false, msg: '⚖️ Enforcing budget...', prompt: 'Inject a performance monitoring script that checks DOM node count and simulated payload size, displaying a red warning overlay if it exceeds typical budgets.' },
  { id: 'chaos-test', icon: Wind, title: 'Chaos Monkey', color: 'text-gray-500', isInfo: false, msg: '🌪️ Unleashing chaos...', prompt: 'Inject a Chaos Monkey script that randomly deletes DOM nodes, delays events, or throws network errors to test UI resilience.' },
  { id: 'cicd', icon: Activity, title: 'Auto CI/CD Pipeline', color: 'text-green-500', isInfo: false, msg: '🔄 Running CI/CD Pipeline...', prompt: 'Run a simulated CI/CD pipeline. Write tests for this code, execute them, find any errors, and patch the code until it is perfect. Return the final resilient HTML.' },
  { id: 'dom-clone', icon: Search, title: 'DOM-to-Tailwind', color: 'text-purple-500', isInfo: false, msg: '🕵️‍♂️ Transpiling DOM...', prompt: 'Assume the user has provided a snippet of extracted DOM or a URL. Convert the structure and computed styles into clean, modern Tailwind CSS and React/HTML code.' },
  { id: 'video-ui', icon: Video, title: 'Video-to-Code', color: 'text-pink-500', isInfo: false, msg: '🎬 Analyzing Video...', prompt: 'Analyze the attached video or GIF of a UI interaction. Generate the exact HTML, Tailwind CSS, and Framer Motion/GSAP JS required to replicate this animation.' },
  { id: 'rag-sync', icon: Brain, title: 'RAG Knowledge Sync', color: 'text-blue-500', isInfo: true, msg: '🧠 Syncing RAG...', prompt: 'Process the uploaded documentation into the local Vector DB (simulated). Acknowledge that the knowledge base is now active for future coding tasks.' }
];

const sanitizeUrl = (urlStr) => {
  if (!urlStr) return '';
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (markdownRegex.test(urlStr)) return urlStr.replace(markdownRegex, '$2').trim();
  return urlStr.trim();
};

const popularPackages = [
  { name: 'Tailwind CSS', desc: 'Utility-first CSS framework', tag: '<script src="https://cdn.tailwindcss.com"></script>' },
  { name: 'React + ReactDOM', desc: 'UI Library (UMD Build)', tag: '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' },
  { name: 'Three.js', desc: '3D Javascript Library', tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' },
  { name: 'GSAP', desc: 'Professional Animation Library', tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>' },
  { name: 'FontAwesome', desc: 'Icon set', tag: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' },
  { name: 'Firebase SDK', desc: 'Google BaaS', tag: '<script type="module">import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";</script>' },
  { name: 'Supabase SDK', desc: 'Open Source BaaS', tag: '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>' },
  { name: 'Pyodide (Python)', desc: 'Python in Browser', tag: '<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>' },
  { name: 'sql.js (SQLite)', desc: 'Browser DB', tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>' }
];

// --- Gemini Live TTS Utilities ---
const GEMINI_VOICES = ["Aoede", "Puck", "Charon", "Kore", "Fenrir", "Zephyr", "Leda", "Orus", "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat"];

function pcmToWav(pcmData, sampleRate = 24000) {
  const binaryString = atob(pcmData);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  
  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);
  
  const writeString = (v, offset, string) => { for (let i = 0; i < string.length; i++) v.setUint8(offset + i, string.charCodeAt(i)); };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM Format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(view, 36, 'data');
  view.setUint32(40, bytes.length, true);
  
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(bytes);
  return new Blob([buffer], { type: 'audio/wav' });
}

const tailwindComponents = [
  { name: 'Hero Section', code: `<section class="bg-white dark:bg-gray-900">\n  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">\n    <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">We invest in the world’s potential</h1>\n    <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.</p>\n  </div>\n</section>` },
  { name: 'Simple Navbar', code: `<nav class="bg-white border-gray-200 dark:bg-gray-900 shadow-sm">\n  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">\n    <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">\n      <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">AppCanvas</span>\n    </a>\n    <div class="hidden w-full md:block md:w-auto" id="navbar-default">\n      <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">\n        <li><a href="#" class="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</a></li>\n        <li><a href="#" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About</a></li>\n      </ul>\n    </div>\n  </div>\n</nav>` },
  { name: 'Action Button', code: `<button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Primary Button</button>` }
];

const quickSnippets = [
  "Build a classic Pong game using HTML Canvas.",
  "Set up a Three.js scene with a rotating 3D cube.",
  "Design a modern, glassmorphism login form using Tailwind."
];

const templates = [
  { icon: '🌦️', label: 'Weather Dashboard', prompt: 'Build a beautiful glassmorphism Weather Dashboard. Add a pulsing loading state.' },
  { icon: '🐍', label: 'Neon Snake Game', prompt: 'Create a retro Snake Game using HTML Canvas. Add neon glow effects to the snake.' },
  { icon: '📋', label: 'Kanban Board', prompt: 'Build a responsive Kanban board UI (like Trello) with draggable columns.' },
  { icon: '📊', label: 'Financial Dashboard', prompt: 'Design an analytical Financial Dashboard with mock charts using Chart.js' }
];

const MobileMenuItem = ({ icon: Icon, label, onClick }) => (
   <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gray-950 border border-gray-800 hover:bg-gray-800 hover:border-indigo-500/50 transition-colors w-full h-full aspect-square">
      <Icon className="w-6 h-6 text-indigo-400" />
      <span className="text-[10px] font-medium text-gray-400 text-center leading-tight truncate w-full px-1">{label}</span>
   </button>
);

const ChatCodeBlock = ({ code, onApply }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAppCode = code.includes('<html') || code.includes('<body') || code.length > 500;
  
  if (isAppCode && !isExpanded) {
    return (
      <div className="mt-3 mb-2 flex flex-col bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 shadow-sm w-full min-w-[200px] max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 shrink-0"><Code2 className="w-5 h-5"/></div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-semibold text-indigo-300 truncate">App Canvas Code</span>
              <span className="text-[11px] text-indigo-400/60 truncate">{code.split('\n').length} lines</span>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0 ml-2">
             <button onClick={() => setIsExpanded(true)} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0">View</button>
             {onApply && <button onClick={() => onApply(code.replace(/^[a-zA-Z0-9-]+\n/, ''))} className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 rounded-lg transition-colors shrink-0">Apply</button>}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-2 mb-2 bg-gray-950 rounded-lg overflow-hidden border border-gray-800 relative">
      {isAppCode && (
         <div className="bg-gray-900 px-3 py-2 flex justify-between items-center border-b border-gray-800">
            <span className="text-xs text-gray-400 font-mono">app_canvas.html</span>
            <div className="flex gap-2">
               {onApply && <button onClick={() => onApply(code.replace(/^[a-zA-Z0-9-]+\n/, ''))} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-500 transition-colors">Apply to Canvas</button>}
               <button onClick={() => setIsExpanded(false)} className="text-[10px] text-gray-500 hover:text-gray-300 px-2 py-1 bg-gray-800 rounded transition-colors">Collapse</button>
            </div>
         </div>
      )}
      <div className="p-3 overflow-x-auto text-xs font-mono text-gray-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
         <pre style={{margin: 0, padding: 0}}>{code.replace(/^[a-zA-Z0-9-]+\n/, '')}</pre>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false); 
  const [isMocksOpen, setIsMocksOpen] = useState(false); 
  const [isDiffOpen, setIsDiffOpen] = useState(false); 
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [viewport, setViewport] = useState('desktop'); 
  const [isLandscape, setIsLandscape] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [fluidWidth, setFluidWidth] = useState(100); 
  
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [isTimeTravelMode, setIsTimeTravelMode] = useState(false); 
  const [isChaosMonkey, setIsChaosMonkey] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isGridMode, setIsGridMode] = useState(false);
  const [isA11ySimulatorActive, setIsA11ySimulatorActive] = useState(false);
  const [isMultiplayerActive, setIsMultiplayerActive] = useState(false);
  const [multiplayerRoomId, setMultiplayerRoomId] = useState('');
  
  const [isAutoHealerActive, setIsAutoHealerActive] = useState(false);
  const [isDbStudioOpen, setIsDbStudioOpen] = useState(false);
  const [isSplitPane, setIsSplitPane] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [timeScrubberValue, setTimeScrubberValue] = useState(100);
  const [isSpatialMode, setIsSpatialMode] = useState(false);

  // Advanced Voice Assistant States (Gemini Live Clone)
  const [voiceState, setVoiceState] = useState('inactive'); // 'inactive', 'listening', 'thinking', 'speaking'
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [geminiVoice, setGeminiVoice] = useState('Aoede');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [isVoiceAssistantMode, setIsVoiceAssistantMode] = useState(false);
  
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState('all'); 
  const [consoleInput, setConsoleInput] = useState(''); 
  const [consoleHeight, setConsoleHeight] = useState(256); 
  const [commandHistory, setCommandHistory] = useState([]); 
  const [commandIndex, setCommandIndex] = useState(-1);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true); 
  const [isCodeVisible, setIsCodeVisible] = useState(true); 
  const [isPreviewDark, setIsPreviewDark] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); 

  // Advance IDE Features: Command Palette, Context Menu, Minimap, Search
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isSearchReplaceOpen, setIsSearchReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const [chatWidth, setChatWidth] = useState(450);
  const [codeWidth, setCodeWidth] = useState(500);
  
  const [apiProvider, setApiProvider] = useState('gemini');
  const [userApiKey, setUserApiKey] = useState('');
  const [geminiBaseUrl, setGeminiBaseUrl] = useState('');
  
  const [longcatApiKey, setLongcatApiKey] = useState('');
  const [longcatBaseUrl, setLongcatBaseUrl] = useState('https://api.longcat.chat/openai/v1/chat/completions');
  const [longcatFallbackUrl, setLongcatFallbackUrl] = useState(''); 
  
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434/api/chat');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  
  const [activePersona, setActivePersona] = useState('default');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(PERSONAS.default);
  const [userSavedPersonas, setUserSavedPersonas] = useState({}); 
  const [newPersonaName, setNewPersonaName] = useState('');
  
  const [maxContext, setMaxContext] = useState(10);
  const [sandboxEnv, setSandboxEnv] = useState('{\n  "API_URL": "https://api.example.com",\n  "MOCK_KEY": "sk_test_123"\n}');
  const [mockEndpoints, setMockEndpoints] = useState([{ id: 1, path: '/api/demo', type: 'json', response: '{"status": "success", "message": "Hello from Omni-Mock!"}' }]);
  const [isVoiceAutoSubmit, setIsVoiceAutoSubmit] = useState(false);
  const [isMultiAgent, setIsMultiAgent] = useState(false); 

  // Settings UI States
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showLongcatKey, setShowLongcatKey] = useState(false);
  const [testingStatus, setTestingStatus] = useState({});
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [longcatKeyInput, setLongcatKeyInput] = useState('');

  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubFilePath, setGithubFilePath] = useState('index.html');
  const [figmaToken, setFigmaToken] = useState('');

  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [customModelInput, setCustomModelInput] = useState('');

  const [npmSearchQuery, setNpmSearchQuery] = useState('');
  const [npmSearchResults, setNpmSearchResults] = useState([]);
  const [isSearchingNpm, setIsSearchingNpm] = useState(false);

  const [sessions, setSessions] = useState([]); 
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString()); 
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [chatImage, setChatImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const [targetedElement, setTargetedElement] = useState(null); 
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedCodeContext, setSelectedCodeContext] = useState(''); 
  
  const [generatedCode, setGeneratedCode] = useState(DEFAULT_CODE);
  const [codeHistory, setCodeHistory] = useState([DEFAULT_CODE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [branches, setBranches] = useState([]); 
  const [assets, setAssets] = useState([]); 
  const [auditResult, setAuditResult] = useState(null); 
  
  const [isAutoSolveEnabled, setIsAutoSolveEnabled] = useState(false);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [consoleLogs, setConsoleLogs] = useState([]);
  
  const chatEndRef = useRef(null);
  const iframeRef = useRef(null);
  const consoleEndRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const minimapRef = useRef(null);

  const estimateTokens = () => Math.floor(messages.map(m => m.text).join(' ').length / 4);

  // Command Palette Configuration
  const systemCommands = [
    { id: 'sys-settings', title: 'Open Settings Vault', icon: Settings, action: () => setIsSettingsOpen(true) },
    { id: 'sys-format', title: 'Format Canvas Code', icon: AlignLeft, action: () => formatCode() },
    { id: 'sys-clear', title: 'Clear Chat History', icon: Trash2, action: () => handleClearChat() },
    { id: 'sys-history', title: 'View Version History', icon: History, action: () => setIsHistoryOpen(true) },
    { id: 'sys-preview', title: 'Switch to Live Canvas', icon: Play, action: () => setActiveTab('preview') },
    { id: 'sys-code', title: 'Switch to Code Editor', icon: Code2, action: () => setActiveTab('code') },
    { id: 'sys-zen', title: 'Toggle Zen Mode', icon: Maximize2, action: () => setIsZenMode(!isZenMode) },
    { id: 'sys-minimap', title: 'Toggle Code Minimap', icon: MapIcon, action: () => setShowMinimap(!showMinimap) },
    { id: 'sys-search', title: 'Toggle In-Editor Find & Replace', icon: SearchCode, action: () => setIsSearchReplaceOpen(!isSearchReplaceOpen) },
    { id: 'sys-console', title: 'Toggle Developer Console', icon: TerminalSquare, action: () => setIsConsoleOpen(!isConsoleOpen) },
    { id: 'sys-mocks', title: 'Open API Mocking Dashboard', icon: Database, action: () => setIsMocksOpen(true) },
    { id: 'sys-github', title: 'Sync with GitHub', icon: Github, action: () => setIsGithubOpen(true) },
  ];

  const allCommands = [
    ...AGENT_ACTIONS.map(a => ({ ...a, action: () => handleAgentAction(a.id) })),
    ...systemCommands
  ];

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Command Palette Trigger (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Find (Cmd/Ctrl + F)
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchReplaceOpen(true);
        setActiveTab('code');
      }
      // Escape handlers
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const closeContext = () => setContextMenu(null);
    window.addEventListener('click', closeContext);
    return () => window.removeEventListener('click', closeContext);
  }, []);

  const purgeCredentials = () => {
    if (window.confirm("Are you sure you want to delete all your stored API keys from this browser?")) {
        saveSetting('omni_gemini_key', '', setUserApiKey);
        saveSetting('omni_longcat_key', '', setLongcatApiKey);
        saveSetting('omni_github_token', '', setGithubToken);
        saveSetting('omni_figma_token', '', setFigmaToken);
        alert("All credentials wiped successfully.");
    }
  };

  const testConnection = async (provider) => {
    setTestingStatus(prev => ({ ...prev, [provider]: 'loading' }));
    try {
      if (provider === 'gemini') {
        let keysToTest = userApiKey.split(',').map(k => k.trim()).filter(Boolean);
        if (geminiKeyInput.trim()) {
           keysToTest = [...keysToTest, geminiKeyInput.trim()];
           if (!userApiKey.includes(geminiKeyInput.trim())) {
               saveSetting('omni_gemini_key', keysToTest.join(', '), setUserApiKey);
               setGeminiKeyInput('');
           }
        }
        if (!keysToTest.length) throw new Error("No key");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keysToTest[0]}`);
        if (!res.ok) throw new Error("Invalid");
      } else if (provider === 'longcat') {
        let keysToTest = longcatApiKey.split(',').map(k => k.trim()).filter(Boolean);
        if (longcatKeyInput.trim()) {
           keysToTest = [...keysToTest, longcatKeyInput.trim()];
           if (!longcatApiKey.includes(longcatKeyInput.trim())) {
               saveSetting('omni_longcat_key', keysToTest.join(', '), setLongcatApiKey);
               setLongcatKeyInput('');
           }
        }
        if (!keysToTest.length) throw new Error("No key");
        
        // Auto-fix URL to models endpoint for the test
        let testUrl = longcatBaseUrl || 'https://api.longcat.chat/openai/v1/chat/completions';
        testUrl = sanitizeUrl(testUrl).replace(/\/chat\/completions$/, '') + '/models';
        
        const res = await fetch(testUrl, { headers: { 'Authorization': `Bearer ${keysToTest[0]}` } });
        if (!res.ok) throw new Error("Invalid");
      } else if (provider === 'ollama') {
        const url = (ollamaUrl || 'http://localhost:11434/api/chat').replace(/\/api\/chat$/, '') + '/api/tags';
        const res = await fetch(url);
        if (!res.ok) throw new Error("Invalid");
      }
      setTestingStatus(prev => ({ ...prev, [provider]: 'success' }));
      setTimeout(() => setTestingStatus(prev => ({ ...prev, [provider]: null })), 3000);
    } catch (err) {
      setTestingStatus(prev => ({ ...prev, [provider]: 'error' }));
      setTimeout(() => setTestingStatus(prev => ({ ...prev, [provider]: null })), 3000);
    }
  };

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    const loadVoices = () => {
       if (typeof window !== 'undefined' && window.speechSynthesis) {
         const v = window.speechSynthesis.getVoices();
         setAvailableVoices(v);
         if (v.length > 0 && !selectedVoiceURI) {
             const preferred = v.find(voice => (voice.name.includes('Google') || voice.name.includes('Premium')) && voice.name.includes('Female')) || v[0];
             setSelectedVoiceURI(preferred.voiceURI);
         }
       }
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
       window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#code=')) {
      try {
        const decoded = decodeURIComponent(atob(window.location.hash.replace('#code=', '')));
        if (decoded) {
          setGeneratedCode(decoded); setCodeHistory([decoded]); setHistoryIndex(0);
          window.history.replaceState(null, null, window.location.pathname);
        }
      } catch (e) { console.error("Invalid share link", e); }
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, agentStatus, targetedElement, selectedCodeContext]);
  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [consoleLogs, isConsoleOpen, consoleFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) setCodeWidth(Math.floor((window.innerWidth - chatWidth - 80) / 2));
  }, [chatWidth]); 

  useEffect(() => {
    const loadSafe = (key, setter, isNumber = false) => {
      const val = localStorage.getItem(key);
      if (val) setter(isNumber ? parseInt(val, 10) : val);
    };

    loadSafe('omni_gemini_key', setUserApiKey); loadSafe('omni_gemini_url', setGeminiBaseUrl);
    loadSafe('omni_longcat_key', setLongcatApiKey); loadSafe('omni_longcat_url', setLongcatBaseUrl);
    loadSafe('omni_longcat_fallback_url', setLongcatFallbackUrl); loadSafe('omni_api_provider', setApiProvider);
    loadSafe('omni_ollama_url', setOllamaUrl); loadSafe('omni_ollama_model', setOllamaModel);
    loadSafe('omni_max_context', setMaxContext, true); loadSafe('omni_sandbox_env', setSandboxEnv);
    loadSafe('omni_selected_model', setSelectedModel); loadSafe('omni_custom_model_input', setCustomModelInput);
    loadSafe('omni_active_persona', setActivePersona); loadSafe('omni_voice_autosubmit', setIsVoiceAutoSubmit);
    loadSafe('omni_github_token', setGithubToken); loadSafe('omni_github_repo', setGithubRepo);
    loadSafe('omni_figma_token', setFigmaToken);
    loadSafe('omni_voice_uri', setSelectedVoiceURI);
    loadSafe('omni_gemini_voice', setGeminiVoice);

    const savedMocks = localStorage.getItem('omni_api_mocks');
    if (savedMocks) { try { setMockEndpoints(JSON.parse(savedMocks)); } catch(e) {} }
    
    const savedVault = localStorage.getItem('omni_persona_vault');
    if (savedVault) { try { setUserSavedPersonas(JSON.parse(savedVault)); } catch(e) {} }
    
    const savedBranches = localStorage.getItem('omni_branches');
    if (savedBranches) { try { setBranches(JSON.parse(savedBranches)); } catch(e) {} }

    const savedPromptVersion = localStorage.getItem('omni_prompt_version');
    if (savedPromptVersion !== "2.0") {
      setCustomSystemPrompt(PERSONAS.default);
      localStorage.setItem('omni_system_prompt', PERSONAS.default);
      localStorage.setItem('omni_prompt_version', "2.0");
    } else { loadSafe('omni_system_prompt', setCustomSystemPrompt); }

    const savedSessions = localStorage.getItem('omni_chat_sessions');
    if (savedSessions) { try { setSessions(JSON.parse(savedSessions)); } catch(e) {} }

    const savedActiveSession = localStorage.getItem('omni_active_session');
    if (savedActiveSession) {
      try {
        const parsed = JSON.parse(savedActiveSession);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.generatedCode) setGeneratedCode(parsed.generatedCode);
        if (parsed.codeHistory) setCodeHistory(parsed.codeHistory);
        if (parsed.historyIndex !== undefined) setHistoryIndex(parsed.historyIndex);
        if (parsed.sessionId) setCurrentSessionId(parsed.sessionId);
      } catch (e) {}
    }
  }, []); 

  useEffect(() => {
    if (apiProvider === 'gemini') { if (!selectedModel || !selectedModel.includes('gemini')) setSelectedModel('gemini-2.5-flash'); }
    else if (apiProvider === 'longcat') { if (!selectedModel || selectedModel.includes('gemini')) setSelectedModel('gpt-4o'); }
    else if (apiProvider === 'ollama') { if (selectedModel !== 'custom') setSelectedModel(ollamaModel || 'llama3'); }
  }, [apiProvider, ollamaModel, selectedModel]);

  useEffect(() => {
    if (messages.length === 0 && generatedCode === DEFAULT_CODE) return;
    const sessionData = { sessionId: currentSessionId, messages, generatedCode, codeHistory, historyIndex };
    localStorage.setItem('omni_active_session', JSON.stringify(sessionData));

    const timer = setTimeout(() => {
      setSessions(prev => {
        const existingIdx = prev.findIndex(s => s.id === currentSessionId);
        const title = messages.length > 0 ? (messages[0].text.length > 35 ? messages[0].text.substring(0, 35) + '...' : messages[0].text) : 'New Application';
        const updatedSession = { id: currentSessionId, title, messages, generatedCode, codeHistory, updatedAt: Date.now() };
        let nextSessions = [...prev];
        if (existingIdx >= 0) nextSessions[existingIdx] = updatedSession; else nextSessions.unshift(updatedSession);
        localStorage.setItem('omni_chat_sessions', JSON.stringify(nextSessions));
        return nextSessions;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [messages, generatedCode, codeHistory, historyIndex, currentSessionId]);

  const saveSetting = (key, val, setter) => { setter(val); localStorage.setItem(key, val); };

  const saveToVault = () => {
    if (!newPersonaName.trim() || !customSystemPrompt.trim()) return;
    const name = newPersonaName.trim();
    const updatedVault = { ...userSavedPersonas, [name]: customSystemPrompt };
    setUserSavedPersonas(updatedVault); localStorage.setItem('omni_persona_vault', JSON.stringify(updatedVault));
    setActivePersona(name); setNewPersonaName(''); alert(`Saved "${name}" to your Prompt Vault!`);
  };
  
  const saveBranch = (codeObj, name) => {
    const newBranch = { id: Date.now(), name: name || `Branch ${branches.length + 1}`, code: codeObj, date: new Date().toLocaleString() };
    const updatedBranches = [newBranch, ...branches];
    setBranches(updatedBranches); localStorage.setItem('omni_branches', JSON.stringify(updatedBranches));
    alert("Saved code state to Branches.");
  };

  const getModelOptions = () => {
    if (apiProvider === 'gemini') return [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
      { value: 'custom', label: 'Custom Model...' }
    ];
    if (apiProvider === 'longcat') return [
      { value: 'LongCat-Flash-Chat', label: 'LongCat Flash Chat' },
      { value: 'LongCat-Flash-Thinking-2601', label: 'LongCat Flash Thinking 2601' },
      { value: 'LongCat-Flash-Omni-2603', label: 'LongCat Flash Omni 2603' },
      { value: 'gpt-4o', label: 'GPT-4o (via Longcat)' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { value: 'custom', label: 'Custom Model...' }
    ];
    if (apiProvider === 'ollama') return [
      { value: ollamaModel || 'llama3', label: `Local Model: ${ollamaModel || 'llama3'}` },
      { value: 'custom', label: 'Custom Model...' }
    ];
    return [];
  };

  const handleLocalSync = async () => {
    try {
      if (!window.showDirectoryPicker) throw new Error("File System Access API not supported in this browser.");
      const directoryHandle = await window.showDirectoryPicker();
      alert(`Successfully linked to local folder: ${directoryHandle.name}.\n(Note: Full bidirectional file sync requires a secure context and permissions).`);
    } catch (e) {
      if (e.name !== 'AbortError') alert("Local Sync Failed: " + e.message);
    }
  };

  const toggleMultiplayerMode = () => {
    if (isMultiplayerActive) {
       setIsMultiplayerActive(false);
       setMultiplayerRoomId('');
    } else {
       const room = Math.random().toString(36).substring(2, 10);
       setMultiplayerRoomId(room);
       setIsMultiplayerActive(true);
       alert(`Multiplayer Session Started!\n\nShare this Room ID: ${room}\n(Note: This is a UI simulation. Real CRDT/Yjs requires backend websockets.)`);
    }
  };

  const fetchFromGitHub = async () => {
    if (!githubToken || !githubRepo || !githubFilePath) return alert("Please fill out all GitHub fields.");
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${githubFilePath}`, {
        headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3.raw' }
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      const text = await res.text(); updateCode(text); alert("Successfully pulled code from GitHub!"); setIsGithubOpen(false);
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };

  const pushToGitHub = async () => {
    if (!githubToken || !githubRepo || !githubFilePath) return alert("Please fill out all GitHub fields.");
    setIsLoading(true);
    try {
      const getRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${githubFilePath}`, {
        headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      let sha = ''; if (getRes.ok) { const fileData = await getRes.json(); sha = fileData.sha; }
      
      const contentBase64 = btoa(unescape(encodeURIComponent(generatedCode)));
      const putRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${githubFilePath}`, {
        method: 'PUT',
        headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Update ${githubFilePath} via Omni-Sandbox`, content: contentBase64, sha: sha || undefined })
      });
      if (!putRes.ok) throw new Error(`Failed to push: ${putRes.statusText}`);
      alert("Successfully pushed code to GitHub!"); setIsGithubOpen(false);
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };

  const startChatDrag = (e) => {
    e.preventDefault(); const startX = e.clientX; const startWidth = chatWidth;
    const onMouseMove = (moveEvent) => setChatWidth(Math.max(250, Math.min(800, startWidth + (moveEvent.clientX - startX))));
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
  };

  const startCodeDrag = (e) => {
    e.preventDefault(); const startX = e.clientX; const startWidth = codeWidth;
    const onMouseMove = (moveEvent) => setCodeWidth(Math.max(300, Math.min(window.innerWidth - chatWidth - 200, startWidth + (moveEvent.clientX - startX))));
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
  };

  const startConsoleDrag = (e) => {
    e.preventDefault(); const startY = e.clientY; const startHeight = consoleHeight;
    const onMouseMove = (moveEvent) => { const newHeight = startHeight - (moveEvent.clientY - startY); setConsoleHeight(Math.max(100, Math.min(window.innerHeight - 200, newHeight))); };
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.data?.type === 'iframe-console') {
        const { logType, message } = event.data;
        let safeMessage = '';
        try {
            safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
        } catch(e) {
            safeMessage = String(message);
        }
        setConsoleLogs(prev => [...prev, { id: Date.now() + Math.random(), type: logType, message: safeMessage, time: new Date().toLocaleTimeString() }]);
        if (logType === 'error' && isAutoSolveEnabled && agentStatus !== 'thinking' && agentStatus !== 'fixing') handleAutoSolve(safeMessage);
      }
      if (event.data?.type === 'element-selected') { setTargetedElement({ tag: event.data.tag, html: event.data.html }); setIsInspectorActive(false); }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [isAutoSolveEnabled, agentStatus, generatedCode, messages]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'toggle-inspector', active: isInspectorActive }, '*');
  }, [isInspectorActive]);

  const handleConsoleCommand = (e) => {
    e.preventDefault(); if (!consoleInput.trim() || !iframeRef.current) return;
    setConsoleLogs(prev => [...prev, { id: Date.now(), type: 'all', message: `> ${consoleInput}`, time: new Date().toLocaleTimeString() }]);
    iframeRef.current.contentWindow.postMessage({ type: 'eval-cmd', code: consoleInput }, '*');
    setCommandHistory(prev => [consoleInput, ...prev]); setCommandIndex(-1); setConsoleInput('');
  };

  const handleConsoleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandIndex < commandHistory.length - 1) { const newIdx = commandIndex + 1; setCommandIndex(newIdx); setConsoleInput(commandHistory[newIdx]); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandIndex > 0) { const newIdx = commandIndex - 1; setCommandIndex(newIdx); setConsoleInput(commandHistory[newIdx]); } 
      else if (commandIndex === 0) { setCommandIndex(-1); setConsoleInput(''); }
    }
  };

  const updateCode = (newCode) => {
    setGeneratedCode(newCode); const newHistory = codeHistory.slice(0, historyIndex + 1);
    newHistory.push(newCode); setCodeHistory(newHistory); setHistoryIndex(newHistory.length - 1); setConsoleLogs([]); 
  };

  const handleUndo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setGeneratedCode(codeHistory[historyIndex - 1]); } };
  const handleRedo = () => { if (historyIndex < codeHistory.length - 1) { setHistoryIndex(historyIndex + 1); setGeneratedCode(codeHistory[historyIndex + 1]); } };
  const restoreHistory = (codeString) => { setGeneratedCode(codeString); const newHistory = codeHistory.slice(0, historyIndex + 1); newHistory.push(codeString); setCodeHistory(newHistory); setHistoryIndex(newHistory.length - 1); setIsHistoryOpen(false); setIsDiffOpen(false); };
  
  const handleCopyCode = () => { navigator.clipboard.writeText(generatedCode); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
  
  const shareLink = () => {
    const encoded = btoa(encodeURIComponent(generatedCode));
    const url = `${window.location.origin}${window.location.pathname}#code=${encoded}`;
    navigator.clipboard.writeText(url); alert("Shareable Snapshot Link copied to clipboard!");
  };

  const openPopoutPreview = () => {
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(getSandboxDoc()); win.document.close();
  };

  const deployToStackBlitz = () => {
    const form = document.createElement('form'); form.method = 'POST'; form.action = 'https://stackblitz.com/run'; form.target = '_blank';
    const addInput = (name, value) => { const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value; form.appendChild(input); };
    addInput('project[title]', 'Omni-Sandbox Cloud Export'); addInput('project[description]', 'Generated by Omni-Sandbox');
    addInput('project[template]', 'html'); addInput('project[files][index.html]', generatedCode);
    document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  };

  const performLighthouseAudit = () => {
    let score = 100; let issues = [];
    if (!generatedCode.includes('<html lang=')) { score -= 10; issues.push("Missing 'lang' attribute in <html> tag."); }
    if (!generatedCode.includes('<meta name="viewport"')) { score -= 20; issues.push("Missing responsive viewport <meta> tag."); }
    if (!generatedCode.includes('<title>')) { score -= 10; issues.push("Missing <title> tag for SEO."); }
    if (generatedCode.includes('<img') && !generatedCode.includes('alt=')) { score -= 15; issues.push("Images are missing 'alt' attributes (Accessibility)."); }
    if (!generatedCode.includes('<main>') && !generatedCode.includes('<nav>') && !generatedCode.includes('<header>')) { score -= 5; issues.push("Lacks HTML5 semantic landmarks."); }
    setAuditResult({ score: Math.max(0, score), issues }); setIsAuditOpen(true);
  };

  const exportToZip = async (format = 'html') => {
    setIsLoading(true);
    try {
        if (!window.JSZip) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
            });
        }
        const zip = new window.JSZip();
        if (format === 'vite') {
            zip.file("package.json", JSON.stringify({ name: "omni-vite-project", version: "1.0.0", type: "module", scripts: { dev: "vite", build: "vite build", preview: "vite preview" }, devDependencies: { vite: "^4.4.5" } }, null, 2));
            zip.file("vite.config.js", `import { defineConfig } from 'vite';\nexport default defineConfig({});`);
            zip.file("index.html", generatedCode); 
        } else if (format === 'pwa') {
            zip.file("index.html", generatedCode.replace('</head>', '<link rel="manifest" href="manifest.json"><script>if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js");}</script></head>'));
            zip.file("manifest.json", JSON.stringify({ name: "Omni App", short_name: "App", start_url: ".", display: "standalone", background_color: "#ffffff", theme_color: "#000000" }, null, 2));
            zip.file("sw.js", `self.addEventListener('install', (e) => e.waitUntil(caches.open('v1').then((c) => c.addAll(['/'])))); self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))));`);
        } else {
            let html = generatedCode; let css = ''; let js = ''; let hasCss = false; let hasJs = false;
            html = html.replace(/<style>([\s\S]*?)<\/style>/gi, (match, content) => { css += content + '\n'; if (!hasCss) { hasCss = true; return '<link rel="stylesheet" href="style.css">'; } return ''; });
            html = html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, content) => { if (attrs.includes('src=')) return match; if (content.includes('iframe-console') || content.includes('window.ENV') || content.includes('__inspectorMode')) return match; js += content + '\n'; if (!hasJs) { hasJs = true; return '<script src="script.js"></script>'; } return ''; });
            zip.file("index.html", html); if (css.trim()) zip.file("style.css", css); if (js.trim()) zip.file("script.js", js);
        }
        const content = await zip.generateAsync({type:"blob"}); const url = URL.createObjectURL(content); const a = document.createElement('a'); a.href = url; a.download = format === 'pwa' ? 'omni_pwa.zip' : (format === 'vite' ? 'omni_vite_project.zip' : 'omni_project.zip'); a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert("Failed to export ZIP: " + e.message); } finally { setIsLoading(false); }
  };

  const exportToExtension = async () => {
    setIsLoading(true);
    try {
        if (!window.JSZip) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
            });
        }
        const zip = new window.JSZip();
        zip.file("manifest.json", JSON.stringify({ manifest_version: 3, name: "Omni Extension", version: "1.0", action: { default_popup: "index.html" } }, null, 2));
        zip.file("index.html", generatedCode);
        const content = await zip.generateAsync({type:"blob"}); 
        const url = URL.createObjectURL(content); const a = document.createElement('a'); a.href = url; a.download = 'omni_extension.zip'; a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert("Failed to export Extension: " + e.message); } finally { setIsLoading(false); }
  };

  const exportToCodePen = () => {
    const data = { title: "Omni-Sandbox Export", html: generatedCode };
    const JSONstring = JSON.stringify(data).replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    const form = document.createElement('form'); form.action = 'https://codepen.io/pen/define'; form.method = 'POST'; form.target = '_blank';
    const input = document.createElement('input'); input.type = 'hidden'; input.name = 'data'; input.value = JSONstring;
    form.appendChild(input); document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  };

  const exportChatHistory = () => {
    let md = "# Omni-Sandbox Chat History\n\n";
    messages.forEach(m => { md += `### ${m.role === 'user' ? '👤 User' : '🤖 Omni-Agent'} - ${m.timestamp ? new Date(m.timestamp).toLocaleString() : 'Unknown Time'}\n\n${m.text}\n\n---\n\n`; });
    const blob = new Blob([md], { type: 'text/markdown' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `omni_chat_${new Date().getTime()}.md`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleNewChat = () => {
    setMessages([]); setGeneratedCode(DEFAULT_CODE); setCodeHistory([DEFAULT_CODE]);
    setHistoryIndex(0); setCurrentSessionId(Date.now().toString()); setConsoleLogs([]);
    setAgentStatus('idle'); setActiveTab('chat');
  };

  const loadSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages || []); setGeneratedCode(session.generatedCode || DEFAULT_CODE);
      setCodeHistory(session.codeHistory || [session.generatedCode || DEFAULT_CODE]);
      setHistoryIndex((session.codeHistory?.length || 1) - 1); setCurrentSessionId(session.id);
      setIsSessionsModalOpen(false); setConsoleLogs([]);
    }
  };

  const deleteSession = (id, e) => {
    e.stopPropagation(); const nextSessions = sessions.filter(s => s.id !== id);
    setSessions(nextSessions); localStorage.setItem('omni_chat_sessions', JSON.stringify(nextSessions));
    if (id === currentSessionId) handleNewChat();
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the current chat?')) deleteSession(currentSessionId, { stopPropagation: () => {} });
  };

  const handleEditMessage = (index) => {
    const msgToEdit = messages[index]; setInput(msgToEdit.text);
    if (msgToEdit.image) setChatImage(msgToEdit.image);
    setMessages(prev => prev.slice(0, index));
  };

  const handleChatImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (event) => setChatImage(event.target.result); reader.readAsDataURL(file);
  };

  const handleAssetUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (event) => { setAssets(prev => [...prev, { name: file.name, base64: event.target.result }]); }; reader.readAsDataURL(file);
  };

  const formatCode = async () => {
    setIsFormatting(true);
    try {
      if (!window.prettier || !window.prettierPlugins) {
        await new Promise((resolve, reject) => {
          const script1 = document.createElement('script'); script1.src = "https://unpkg.com/prettier@2.8.8/standalone.js"; document.head.appendChild(script1);
          script1.onload = () => { const script2 = document.createElement('script'); script2.src = "https://unpkg.com/prettier@2.8.8/parser-html.js"; document.head.appendChild(script2); script2.onload = resolve; script2.onerror = reject; };
          script1.onerror = reject;
        });
      }
      const formatted = window.prettier.format(generatedCode, { parser: 'html', plugins: window.prettierPlugins, printWidth: 100, tabWidth: 2 });
      updateCode(formatted);
    } catch (err) { alert("Prettier Format Failed: " + err.message); } finally { setIsFormatting(false); }
  };

  const searchNPM = async (e) => {
    e.preventDefault(); if (!npmSearchQuery.trim()) return; setIsSearchingNpm(true);
    try {
      const res = await fetch(`https://api.cdnjs.com/libraries?search=${encodeURIComponent(npmSearchQuery)}&limit=10&fields=version,description`);
      const data = await res.json(); setNpmSearchResults(data.results || []);
    } catch(err) { alert("NPM Search Failed: " + err.message); } finally { setIsSearchingNpm(false); }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    setGeneratedCode(prev => prev.split(findText).join(replaceText));
  };

  // --- Advanced AI Voice Assistant Loop (Gemini Live Equivalent) ---
  const toggleVoiceMode = () => {
    if (voiceState !== 'inactive') {
        stopVoiceMode();
    } else {
        startVoiceListening();
    }
  };

  const stopVoiceMode = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setVoiceState('inactive');
    setVoiceTranscript('');
  };

  const startVoiceListening = () => {
    setVoiceState('listening');
    setVoiceTranscript('');
    if (audioRef.current) { audioRef.current.pause(); }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition is not supported in your browser.");
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    
    let finalT = '';
    recognitionRef.current.onresult = (e) => {
       finalT = Array.from(e.results).map(res => res[0].transcript).join('');
       setVoiceTranscript(finalT);
    };
    
    recognitionRef.current.onend = () => {
       if (finalT.trim()) {
          handleVoiceSubmit(finalT);
       } else {
          setVoiceState('inactive');
       }
    };
    recognitionRef.current.start();
  };

  const speakTextAI = async (fullText) => {
    // Clean text to sound natural (remove Markdown, code blocks)
    let cleanText = fullText.replace(/```[\s\S]*?```/g, ' I have updated the canvas. ');
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_#`]/g, '');
    
    if (apiProvider === 'gemini') {
        const keys = (userApiKey || apiKey).split(',').map(k => k.trim()).filter(Boolean);
        if (keys.length > 0) {
            try {
                const payload = {
                  contents: [{ parts: [{ text: cleanText }] }],
                  generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice } } } },
                  model: "gemini-2.5-flash-preview-tts"
                };
                
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${keys[0]}`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
                    if (inlineData) {
                        const match = inlineData.mimeType.match(/rate=(\d+)/);
                        const rate = match ? parseInt(match[1], 10) : 24000;
                        const wavBlob = pcmToWav(inlineData.data, rate);
                        const url = URL.createObjectURL(wavBlob);
                        if (audioRef.current) {
                            audioRef.current.src = url;
                            audioRef.current.play();
                            setVoiceState('speaking');
                        }
                        return; // Successfully played Gemini Audio
                    }
                }
            } catch(e) { console.error("Gemini Native TTS Failed", e); }
        }
    }
    
    // Fallback to local browser TTS if not Gemini or if fetch failed
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (selectedVoiceURI) {
       const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
       if (selectedVoice) utterance.voice = selectedVoice;
    }
    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => { if (isVoiceAutoSubmit) { startVoiceListening(); } else { setVoiceState('inactive'); } };
    utterance.onerror = () => setVoiceState('inactive');
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceSubmit = async (text) => {
    setVoiceState('thinking');
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: text, timestamp: new Date().toISOString() }]);
    
    try {
       const responseText = await callAIAPI(messages, text, false, null, generatedCode, false);
       const code = extractCode(responseText);
       const hasValidCode = !!code;
       
       setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date().toISOString() }]);
       if (hasValidCode) updateCode(code);
       
       await speakTextAI(responseText); // Start speaking the response
    } catch (err) {
       setMessages(prev => [...prev, { role: 'model', text: `❌ **Voice Error:** ${err.message}` }]);
       setVoiceState('inactive');
    }
  };

  const highlightHTML = (code) => {
    if (!code) return '';
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>') 
      .replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="text-pink-400">$2</span>') 
      .replace(/([a-zA-Z-]+)(?==)/g, '<span class="text-indigo-300">$1</span>') 
      .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|".*?"|'.*?')/g, '<span class="text-green-400">$1</span>'); 
  };

  const handleEditorScroll = (e) => { 
    if (highlightRef.current) { 
        highlightRef.current.scrollTop = e.target.scrollTop; 
        highlightRef.current.scrollLeft = e.target.scrollLeft; 
    } 
    if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
    if (minimapRef.current) {
        // Approximate sync for minimap scroll
        const ratio = minimapRef.current.scrollHeight / e.target.scrollHeight;
        minimapRef.current.scrollTop = e.target.scrollTop * ratio;
    }
  };

  const handleEditorSelect = (e) => { const start = e.target.selectionStart; const end = e.target.selectionEnd; if (start !== end) { setSelectedCodeContext(e.target.value.substring(start, end)); } else { setSelectedCodeContext(''); } };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); exportToZip('html'); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart; const end = e.target.selectionEnd; const val = e.target.value;
      const newCode = val.substring(0, start) + "  " + val.substring(end);
      setGeneratedCode(newCode); setTimeout(() => { if (editorRef.current) { editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2; } }, 0);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const extractCode = (text) => {
    const regex = new RegExp(T_BACKTICKS + '(?:[a-zA-Z0-9-]+)?\\n([\\s\\S]*?)' + T_BACKTICKS);
    const match = text.match(regex);
    if (match) return match[1];
    const fallbackRegex = new RegExp(T_BACKTICKS + '(?:[a-zA-Z0-9-]+)?\\n([\\s\\S]*)');
    const fallbackMatch = text.match(fallbackRegex);
    return fallbackMatch ? fallbackMatch[1] : null; 
  };

  const cleanResponseText = (fullText) => {
    let cleaned = fullText.replace(new RegExp(T_BACKTICKS + '(?:[a-zA-Z0-9-]+)?\\n([\\s\\S]*?)' + T_BACKTICKS, 'g'), (match, p1) => {
      return p1.trim().length > 100 ? T_BACKTICKS + 'canvas_update\n' + T_BACKTICKS : match;
    });
    // Fallback for unclosed massive code blocks at the very end
    cleaned = cleaned.replace(new RegExp(T_BACKTICKS + '(?:[a-zA-Z0-9-]+)?\\n([\\s\\S]{300,})$', 'g'), T_BACKTICKS + 'canvas_update\n' + T_BACKTICKS);
    return cleaned;
  };

  const executeSimulatedAgentStatus = async (initialDelay = 1000) => {
    if (!isMultiAgent) return;
    setAgentStatus('architect'); await new Promise(r => setTimeout(r, initialDelay + 1500));
    setAgentStatus('developer'); await new Promise(r => setTimeout(r, 2000));
    setAgentStatus('qa'); await new Promise(r => setTimeout(r, 1000));
  };

  const callAIAPI = async (chatHistory, newPrompt, isFix = false, imageObj = null, currentCodeContext = null, forceGemini = false) => {
    const getGeminiKeys = () => (userApiKey || apiKey).split(',').map(k => k.trim()).filter(Boolean);
    const getLongcatKeys = () => longcatApiKey.split(',').map(k => k.trim()).filter(Boolean);
    
    const activeProvider = forceGemini ? 'gemini' : apiProvider;
    const activeModelName = (forceGemini ? 'gemini-2.5-flash' : (selectedModel === 'custom' ? customModelInput : selectedModel)).trim();
    
    let maxKeys = 1;
    if (activeProvider === 'gemini') maxKeys = getGeminiKeys().length || 1;
    if (activeProvider === 'longcat') maxKeys = getLongcatKeys().length || 1;
    
    let retries = Math.max(maxKeys, 1); 
    let delay = 1000;
    
    let historyToSend = chatHistory.filter(m => m.role !== 'system');
    if (maxContext > 0 && historyToSend.length > maxContext) historyToSend = historyToSend.slice(-maxContext);
    
    let augmentedPrompt = newPrompt;
    if (currentCodeContext && currentCodeContext !== DEFAULT_CODE && !isFix) {
        augmentedPrompt += `\n\n[CURRENT CODEBASE STATE - You MUST use this as the base for your edits. Do NOT generate multiple files. Merge all improvements into ONE single HTML file containing all CSS and JS. Maintain ALL existing functionality unless requested otherwise. Do NOT use placeholders or truncate the file!]:\n${T_BACKTICKS}html\n${currentCodeContext}\n${T_BACKTICKS}`;
    }
    if (targetedElement) augmentedPrompt += `\n\n[SYSTEM CONTEXT - The user has pointed an inspector at this specific DOM element on the page. Focus your changes here]:\n${T_BACKTICKS}html\n${targetedElement.html}\n${T_BACKTICKS}`;
    if (selectedCodeContext) augmentedPrompt += `\n\n[SYSTEM CONTEXT - The user has highlighted this specific block of code in the editor. Focus your changes here]:\n${T_BACKTICKS}\n${selectedCodeContext}\n${T_BACKTICKS}`;
    
    const initialRetries = retries;
    let finalSystemPrompt = isMultiAgent ? MULTI_AGENT_PROMPT : customSystemPrompt;
    if (forceGemini) finalSystemPrompt = VOICE_PERSONA;

    executeSimulatedAgentStatus();

    while (retries > 0) {
      try {
        if (!activeModelName) throw new Error("Please select or specify a model.");
        const keyIndex = initialRetries - retries;

        if (activeProvider === 'gemini') {
          const geminiKeys = getGeminiKeys();
          if (geminiKeys.length === 0) throw new Error("No Gemini API Key found. A Gemini key is required to use the Voice Assistant.");
          const currentKey = geminiKeys[keyIndex % geminiKeys.length];
          const baseUrl = sanitizeUrl(geminiBaseUrl) || 'https://generativelanguage.googleapis.com';
          const url = `${baseUrl.replace(/\/$/, '')}/v1beta/models/${activeModelName}:generateContent?key=${currentKey}`;
          
          const contents = historyToSend.map(m => {
            let textForAPI = m.text;
            if (m.role === 'model') textForAPI = cleanResponseText(textForAPI);
            const parts = [{ text: textForAPI }];
            if (m.image) {
              const mimeType = m.image.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
              parts.push({ inlineData: { mimeType, data: m.image.split(',')[1] } });
            }
            return { role: m.role === 'model' ? 'model' : 'user', parts };
          });

          if (augmentedPrompt) {
            const parts = [{ text: augmentedPrompt }];
            if (imageObj) parts.push({ inlineData: { mimeType: imageObj.match(/data:(.*?);base64/)?.[1] || "image/jpeg", data: imageObj.split(',')[1] } });
            contents.push({ role: 'user', parts });
          }

          const payload = { contents, systemInstruction: { parts: [{ text: finalSystemPrompt }] }, generationConfig: { maxOutputTokens: 8192 } };
          let response;
          try { response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } 
          catch(netErr) { throw new Error(`Network Error: Failed to reach Google Gemini API. Details: ${netErr.message}`); }
          
          const textResponse = await response.text();
          let data; 
          try { data = JSON.parse(textResponse); } 
          catch(e) { 
              console.error("Gemini Raw Parse Error:", textResponse.substring(0, 500));
              throw new Error(`Gemini API returned an invalid JSON response. Please verify the endpoint URL.`); 
          }

          if (!response.ok) { 
            if ([429,403,400,402].includes(response.status)) throw new Error(`RATE_LIMIT: Gemini API key limit reached. Rotating...`);
            throw new Error(data.error?.message || "Gemini API Error"); 
          }
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
        } else {
          // LONGCAT / OPENAI / OLLAMA / GROQ
          const isOllama = activeProvider === 'ollama';
          let primaryUrl = isOllama ? (ollamaUrl || 'http://localhost:11434/api/chat') : (longcatBaseUrl || 'https://api.longcat.chat/openai/v1/chat/completions');
          
          primaryUrl = sanitizeUrl(primaryUrl);
          if (!isOllama && !primaryUrl.includes('/chat/completions')) primaryUrl = primaryUrl.replace(/\/$/, '') + '/chat/completions';

          const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
          if (!isOllama) {
             const longcatKeys = getLongcatKeys();
             if (longcatKeys.length === 0) throw new Error("No API Key found in Settings for the current provider.");
             headers['Authorization'] = `Bearer ${longcatKeys[keyIndex % longcatKeys.length]}`;
          }

          const formattedMessages = [];
          const isOmni = activeModelName.toLowerCase().includes('omni') || activeModelName.toLowerCase().includes('vision') || activeModelName.toLowerCase().includes('gpt-4o');
          
          let sysPrompt = finalSystemPrompt?.trim() || "";
          if (sysPrompt && !isOmni) { formattedMessages.push({ role: 'system', content: sysPrompt }); sysPrompt = ""; }
          
          historyToSend.forEach((m, idx) => {
            let msgText = m.text?.trim() || "";
            if (m.role === 'model') msgText = cleanResponseText(msgText);
            if (sysPrompt && idx === 0) { msgText = `[System Instructions: ${sysPrompt}]\n\n` + msgText; sysPrompt = ""; }
            if (isOmni) {
              const contentArray = [{ type: "text", text: msgText || "Attached context." }];
              if (m.image) contentArray.push({ type: "image_url", image_url: { url: m.image } });
              formattedMessages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: contentArray });
            } else if (msgText) formattedMessages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: msgText });
          });
          
          let finalPrompt = augmentedPrompt?.trim() || '';
          if (sysPrompt && formattedMessages.length === 0) finalPrompt = `[System Instructions: ${sysPrompt}]\n\n` + finalPrompt;
          
          if (isOmni) {
            const contentArray = [{ type: "text", text: finalPrompt || "Analyze this." }];
            if (imageObj) contentArray.push({ type: "image_url", image_url: { url: imageObj } });
            formattedMessages.push({ role: 'user', content: contentArray });
          } else if (finalPrompt) formattedMessages.push({ role: 'user', content: finalPrompt });

          const payload = { model: activeModelName, messages: formattedMessages };
          if (!isOllama) {
              // Standard OpenAI payload
              payload.max_tokens = 8192;
          } else {
              // Ollama requires explicit stream flag to avoid NDJSON parsing crashes
              payload.stream = false;
          }

          const attemptFetch = async (urlToTry) => {
            let response;
            try { response = await fetch(urlToTry, { method: 'POST', headers, body: JSON.stringify(payload) }); } 
            catch(netErr) { throw new Error(`NETWORK_FAIL: Failed to reach ${urlToTry}`); }
            const textResponse = await response.text();
            let data; 
            try { 
                data = JSON.parse(textResponse); 
            } catch (e) { 
                console.error("Raw API Response:", textResponse.substring(0, 500));
                throw new Error(`JSON_PARSE_FAIL: API returned malformed data (check console for raw response).`); 
            }
            if (!response.ok) {
              if ([429,403,402,400].includes(response.status)) throw new Error(`RATE_LIMIT: Proxy limit reached. Rotating...`);
              throw new Error(String(data.error?.message || data.message || `Request failed (${response.status})`));
            }
            return String(isOllama ? (data.message?.content || "") : (data.choices?.[0]?.message?.content || ""));
          };

          try { return await attemptFetch(primaryUrl); } 
          catch (err) {
             if (err.message.includes('RATE_LIMIT')) throw err; 
             if (!isOllama && longcatFallbackUrl) {
                 let fallback = sanitizeUrl(longcatFallbackUrl); 
                 if (!fallback.includes('/chat/completions')) fallback = fallback.replace(/\/$/, '') + '/chat/completions';
                 if (err.message.includes('NETWORK_FAIL') || err.message.includes('JSON_PARSE_FAIL')) {
                     try { return await attemptFetch(fallback); } catch (fallbackErr) { throw new Error(`Fallback failed: ${fallbackErr.message}`); }
                 }
             }
             throw err;
          }
        }
      } catch (error) {
        retries--;
        if (error.message.includes('RATE_LIMIT') && maxKeys > 1) { if (retries === 0) throw new Error(`❌ All API keys have reached limits.`); continue; }
        if (retries === 0) throw new Error(String(error.message));
        await new Promise(r => setTimeout(r, delay)); delay *= 2;
      }
    }
  };

  const submitPrompt = async (text, activeImage = null, isVoice = false) => {
    if (!text.trim() || isLoading) return;
    setInput(''); setShowSnippets(false); setChatImage(null); setTargetedElement(null); setSelectedCodeContext(''); 
    setMessages(prev => [...prev, { role: 'user', text: text, image: activeImage, timestamp: new Date().toISOString() }]);
    setIsLoading(true); setAgentStatus('thinking');

    try {
      const responseText = await callAIAPI(messages, text, false, activeImage, generatedCode, isVoice);
      const code = extractCode(responseText);
      const hasValidCode = !!code;
      
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date().toISOString() }]);
      if (hasValidCode) updateCode(code);
      
      if (isVoice) speakText(responseText);
      
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: `❌ **Error:** ${error.message}` }]);
    } finally {
      setIsLoading(false); setAgentStatus('idle');
    }
  };

  const handleSendMessage = (e) => { 
    e?.preventDefault(); 
    if (isVoiceAssistantMode && window.speechSynthesis) {
       const unlock = new SpeechSynthesisUtterance('');
       unlock.volume = 0;
       window.speechSynthesis.speak(unlock);
    }
    submitPrompt(input.trim(), chatImage, isVoiceAssistantMode); 
  };

  const handleAutoSolve = async (errorMessage) => {
    setAgentStatus('fixing'); setIsLoading(true);
    const fixPrompt = `⚠️ AGENTIC LOOP ACTIVATED ⚠️\nThe code you just generated threw this error in the console:\n${T_BACKTICKS}\n${errorMessage}\n${T_BACKTICKS}\n\nPlease fix the bug and return the COMPLETE, working HTML file.`;
    setMessages(prev => [...prev, { role: 'user', text: fixPrompt, isAutoGenerated: true, timestamp: new Date().toISOString() }]);
    try {
      const responseText = await callAIAPI(messages, fixPrompt, true, null, generatedCode);
      const newCode = extractCode(responseText);
      const hasValidCode = !!newCode;
      
      setMessages(prev => [...prev, { role: 'model', text: `✅ **Agentic Fix Applied:** I found the issue and updated the Canvas File.\n\n${responseText}`, isAutoGenerated: true, timestamp: new Date().toISOString() }]);
      if (hasValidCode) updateCode(newCode);
    } catch (error) { setMessages(prev => [...prev, { role: 'model', text: `❌ **Auto-Solve Failed:** ${error.message}` }]); } 
    finally { setIsLoading(false); setAgentStatus('idle'); }
  };

  const handleAgentAction = async (actionId) => {
    if (isLoading) return;
    const actionDef = AGENT_ACTIONS.find(a => a.id === actionId);
    if (!actionDef) return;
    
    setIsLoading(true); setAgentStatus('thinking');
    setMessages(prev => [...prev, { role: 'user', text: actionDef.msg, isAutoGenerated: true, timestamp: new Date().toISOString() }]);

    try {
      const responseText = await callAIAPI(messages, actionDef.prompt, true, null, generatedCode);
      const newCode = extractCode(responseText);
      const hasValidCode = !!newCode;
      
      let successMessage = actionDef.isInfo ? `✅ **Action Complete:**\n\n${responseText}` : `✅ **Agentic Action Complete:** I have successfully modified the Canvas File.\n\n${responseText}`;
      
      setMessages(prev => [...prev, { role: 'model', text: successMessage, isAutoGenerated: true, timestamp: new Date().toISOString() }]);
      if (!actionDef.isInfo && hasValidCode) updateCode(newCode);
    } catch (error) { setMessages(prev => [...prev, { role: 'model', text: `❌ **Agentic Action Failed:** ${error.message}` }]); } 
    finally { setIsLoading(false); setAgentStatus('idle'); }
  };

  const getAgentStatusText = () => {
    switch(agentStatus) {
      case 'thinking': return 'Writing code...';
      case 'fixing': return 'Autonomously fixing errors...';
      case 'architect': return 'Architect planning architecture...';
      case 'developer': return 'Developer writing code...';
      case 'qa': return 'QA Tester verifying output...';
      default: return 'Idle';
    }
  };

  const saveMocks = (mocks) => { setMockEndpoints(mocks); localStorage.setItem('omni_api_mocks', JSON.stringify(mocks)); };

  const getSandboxDoc = () => {
    const injectionScript = `
      <script>
        const mockData = ${JSON.stringify(mockEndpoints)};
        const postLog = (type, args) => {
          try {
            const msg = Array.from(args).map(a => {
              try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } 
              catch(e) { return '[Unserializable Object]'; }
            }).join(' ');
            window.parent.postMessage({ type: 'iframe-console', logType: type, message: msg }, '*');
          } catch(e) {}
        };
        const origLog = console.log; console.log = function(...args) { postLog('log', args); origLog.apply(console, args); };
        const origWarn = console.warn; console.warn = function(...args) { postLog('warn', args); origWarn.apply(console, args); };
        const origError = console.error; console.error = function(...args) { postLog('error', args); origError.apply(console, args); };
        window.onerror = function(msg, url, line) { postLog('error', [msg + ' at line ' + line]); return false; };
        
        window.addEventListener('message', (e) => {
           if (e.data?.type === 'eval-cmd') { try { let res = eval(e.data.code); console.log(res); } catch(err) { console.error(String(err)); } }
           if (e.data?.type === 'toggle-inspector') {
               window.__inspectorMode = e.data.active;
               if(window.__inspectorMode) { document.body.style.cursor = 'crosshair'; } 
               else { document.body.style.cursor = 'default'; document.querySelectorAll('*').forEach(el => el.style.outline = ''); }
           }
        });

        document.addEventListener('mouseover', (e) => {
           if (!window.__inspectorMode || e.target === document.body || e.target === document.documentElement) return;
           e.target.style.outline = '2px dashed #6366f1'; e.target.style.outlineOffset = '2px';
        });
        document.addEventListener('mouseout', (e) => {
           if (!window.__inspectorMode || e.target === document.body || e.target === document.documentElement) return;
           e.target.style.outline = '';
        });
        document.addEventListener('click', (e) => {
           if (!window.__inspectorMode || e.target === document.body || e.target === document.documentElement) return;
           e.preventDefault(); e.stopPropagation(); e.target.style.outline = ''; document.body.style.cursor = 'default'; window.__inspectorMode = false;
           let htmlString = e.target.outerHTML; if(htmlString.length > 2000) htmlString = htmlString.substring(0, 2000) + '... [TRUNCATED]';
           window.parent.postMessage({ type: 'element-selected', tag: e.target.tagName, html: htmlString }, '*');
        }, true);

        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          const urlStr = String(args[0]);
          const mockMatch = mockData.find(m => urlStr.includes(m.path));
          
          ${isChaosMonkey ? `await new Promise(r => setTimeout(r, Math.random() * 2000)); if (Math.random() < 0.2) { postLog('network', ['[CHAOS MONKEY FAIL]', urlStr]); throw new Error("Chaos Monkey injected network failure"); }` : ''}

          if (mockMatch) {
             postLog('network', ['[MOCK 200 OK]', urlStr]);
             if (mockMatch.type === 'edge') {
                 try { const fn = new Function('req', mockMatch.response); const res = await fn(args); return new Response(JSON.stringify(res), {status:200}); } 
                 catch(e) { postLog('error', ['[MOCK EDGE ERROR]', e.message]); return new Response("{}", {status:500}); }
             }
             return Promise.resolve(new Response(mockMatch.response, { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }

          postLog('network', ['[FETCH Pending]', urlStr]);
          try { const response = await origFetch.apply(this, args); postLog('network', ['[FETCH Success]', response.status, response.url]); return response; } 
          catch(e) { postLog('network', ['[FETCH Failed]', e.message]); throw e; }
        };
      </script>
    `;
    const envScript = `<script>window.ENV = ${sandboxEnv || '{}'};</script>`;
    const darkModeScript = isPreviewDark ? `<script>document.documentElement.classList.add('dark'); document.body.style.backgroundColor = '#111827'; document.body.style.color = '#f8fafc';</script>` : '';
    const perfScript = isPerformanceMode ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/stats.js/16/Stats.min.js"></script><script>window.addEventListener('load', function() { const stats = new Stats(); stats.showPanel(0); stats.dom.style.position = 'fixed'; stats.dom.style.top = '10px'; stats.dom.style.left = '10px'; stats.dom.style.zIndex = '999999'; document.body.appendChild(stats.dom); function animate() { stats.begin(); stats.end(); requestAnimationFrame(animate); } requestAnimationFrame(animate); });</script>` : '';
    const rrwebScript = isTimeTravelMode ? `<script src="https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.11/dist/rrweb.min.js"></script><script>console.log("[Time Travel Debugging] rrweb injected. Recording started (mock).");</script>` : '';
    
    const modeScripts = `
      ${is3DMode ? '<style>body{perspective:1000px; overflow:visible;} *{transform-style:preserve-3d; transform:translateZ(10px); outline:1px solid rgba(99,102,241,0.2); background:rgba(255,255,255,0.8);} body:hover{transform:rotateX(20deg) rotateY(-20deg);}</style>' : ''}
      ${isGhostMode ? '<script>window.addEventListener("load", ()=>{ const c=document.createElement("div"); c.style="width:20px;height:20px;background:red;border-radius:50%;position:fixed;z-index:9999;pointer-events:none;transition:all 0.3s ease;"; document.body.appendChild(c); setInterval(()=>{ c.style.left = Math.random()*window.innerWidth+"px"; c.style.top = Math.random()*window.innerHeight+"px"; if(Math.random()>0.7){ const el=document.elementFromPoint(parseInt(c.style.left), parseInt(c.style.top)); if(el && el.click) el.click(); } }, 1000); });</script>' : ''}
      ${isA11ySimulatorActive ? '<style>body { filter: blur(5px) grayscale(50%) contrast(120%); } *:focus { outline: 4px solid #ffff00 !important; outline-offset: 2px !important; }</style>' : ''}
    `;

    let doc = generatedCode.replace('<head>', `<head>\n${envScript}\n${injectionScript}\n${perfScript}\n${rrwebScript}\n${modeScripts}`);
    if (doc.includes('</body>')) doc = doc.replace('</body>', `${darkModeScript}</body>`); else doc += darkModeScript;
    return doc;
  };

  return (
    <div className="flex h-[100dvh] bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* Desktop Sidebar Navigation */}
      {!isZenMode && (
        <aside className="hidden lg:flex w-20 bg-gray-900 border-r border-gray-800 flex-col items-center py-6 gap-6 z-20 shrink-0 transition-all duration-300 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mt-2 shrink-0">
            <AppWindow className="text-white w-6 h-6" />
          </div>
          <nav className="flex flex-col gap-4 mt-4 w-full px-2">
            <button onClick={() => { setActiveTab('chat'); setIsChatVisible(true); }} className={`p-3 rounded-xl flex justify-center transition-all ${activeTab === 'chat' && isChatVisible ? 'bg-gray-800 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`} title="Chat"><MessageSquare className="w-6 h-6" /></button>
            <div className="w-8 h-px bg-gray-800 mx-auto my-2"></div>
            <button onClick={() => setIsCommandPaletteOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Command Palette (Cmd+K)"><Command className="w-6 h-6" /></button>
            <button onClick={() => setIsMocksOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Local API Mocks Dashboard"><Database className="w-6 h-6" /></button>
            <button onClick={() => setIsDbStudioOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="WASM DB Studio"><DatabaseBackup className="w-6 h-6" /></button>
            <button onClick={() => setIsSpatialMode(!isSpatialMode)} className={`p-3 rounded-xl flex justify-center transition-all ${isSpatialMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`} title="Toggle Infinite Spatial Workspace"><MapIcon className="w-6 h-6" /></button>
            <button onClick={() => setIsGithubOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="GitHub Sync"><Github className="w-6 h-6" /></button>
          </nav>
          <div className="mt-auto flex flex-col gap-4 w-full px-2">
            <button onClick={() => setIsChatVisible(!isChatVisible)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title={isChatVisible ? "Collapse Chat" : "Expand Chat"}>
              {isChatVisible ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeftOpen className="w-6 h-6" />}
            </button>
            <button onClick={() => setIsSessionsModalOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Chat History"><FolderOpen className="w-6 h-6" /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Key Vault & Settings"><Settings className="w-6 h-6" /></button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative bg-[#090b0f] pb-[60px] lg:pb-0">
        <div className={`flex-1 flex flex-col lg:flex-row w-full h-full transition-all duration-500 origin-center ${isSpatialMode ? 'scale-[0.85] p-6 lg:p-12 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] ring-4 ring-gray-800 overflow-hidden' : ''}`}
             style={isSpatialMode ? { backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=")' } : {}}
        >
        
        {/* Chat Panel (Collapsible Desktop, Toggleable Mobile) */}
        {isChatVisible && (
          <div style={{ width: (!isZenMode && typeof window !== 'undefined' && window.innerWidth >= 1024) ? chatWidth : '100%' }} className={`flex-col bg-gray-900/50 border-r border-gray-800 h-full shrink-0 transition-all duration-300 ${activeTab === 'chat' && !isZenMode ? 'flex' : 'hidden lg:flex'} ${isZenMode ? '!hidden' : ''} relative`}>
            <div className="p-2 lg:p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur z-10">
              <div>
                <h2 className="font-semibold text-sm lg:text-lg flex items-center gap-2">
                  {isMultiAgent ? 'Omni Team' : 'Omni Agent'} 
                  {agentStatus !== 'idle' && <span className={`flex h-2 w-2 rounded-full ${agentStatus === 'fixing' ? 'bg-amber-500' : 'bg-indigo-500'} animate-pulse`} />}
                </h2>
                <p className="text-[10px] lg:text-xs text-gray-500 font-mono text-indigo-300">~ {estimateTokens()} Tokens</p>
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <button onClick={() => setIsMultiAgent(!isMultiAgent)} className={`p-1.5 rounded-lg transition-colors border ${isMultiAgent ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`} title="Multi-Agent Mode (Architect -> Dev -> QA)"><Users className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-gray-800 mx-0.5 lg:mx-1"></div>
                <button onClick={handleNewChat} className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Start New Chat"><MessageSquarePlus className="w-4 h-4" /></button>
                <button onClick={handleClearChat} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Current Session"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setIsAutoSolveEnabled(!isAutoSolveEnabled)} className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isAutoSolveEnabled ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`} title="Autonomously fix runtime errors"><Zap className="w-3.5 h-3.5" /> Auto-Solve</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in pt-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-2"><Sparkles className="w-8 h-8 text-indigo-400" /></div>
                  <div><h3 className="text-xl font-semibold text-gray-200">Welcome to Omni-Sandbox</h3><p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">What would you like to build today?</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm mt-4 px-2">
                    {templates.map((t, i) => (
                      <button key={i} onClick={() => submitPrompt(t.prompt, null, isVoiceAssistantMode)} className="p-3 text-left rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-indigo-500/50 transition-all flex flex-col gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-bottom-left">{t.icon}</span><span className="text-sm font-medium text-gray-300 group-hover:text-indigo-300">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'user' && !msg.isAutoGenerated && <button onClick={() => handleEditMessage(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-indigo-400 text-gray-500 transition-opacity self-center"><Edit2 className="w-3.5 h-3.5" /></button>}
                    {msg.role === 'model' && <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAutoGenerated ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}><Bot className="w-5 h-5" /></div>}
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? msg.isAutoGenerated ? 'bg-gray-800 border border-amber-500/20 text-gray-300 rounded-tr-sm' : 'bg-indigo-600 text-white rounded-tr-sm shadow-md' : msg.isAutoGenerated ? 'bg-gray-800/80 border border-amber-500/20 text-gray-200 rounded-tl-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700/50'}`}>
                      {msg.image && <div className="mb-3">
                         {msg.image.startsWith('data:video') ? (
                           <video src={msg.image} controls className="max-w-full h-auto max-h-48 object-cover rounded-lg border border-gray-700" />
                         ) : (
                           <img src={msg.image} alt="Context" className="max-w-full h-auto max-h-48 object-cover rounded-lg border border-gray-700" />
                         )}
                      </div>}
                      <div className="whitespace-pre-wrap break-words">
                        {String(msg.text).split(T_BACKTICKS).map((chunk, i) => {
                          if (i % 2 !== 0) {
                            return <ChatCodeBlock key={i} code={chunk} onApply={updateCode} />;
                          }
                          return chunk.split('**').map((textChunk, j) => j % 2 !== 0 ? <strong key={j} className="text-white font-semibold">{textChunk}</strong> : textChunk);
                        })}
                      </div>
                    </div>
                    {msg.role === 'user' && !msg.isAutoGenerated && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-gray-300" /></div>}
                  </div>
                ))
              )}
              {agentStatus !== 'idle' && (
                 <div className="flex items-center gap-3 text-sm text-gray-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>{getAgentStatusText()}</span>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 lg:p-4 bg-gray-900 border-t border-gray-800 z-10 flex flex-col gap-2">
              
              {(targetedElement || selectedCodeContext) && (
                <div className="flex flex-wrap gap-2 mb-1 px-1">
                   {targetedElement && (
                     <div className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-medium max-w-[200px]">
                        <Target className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Element: &lt;{targetedElement.tag.toLowerCase()}&gt;</span>
                        <button onClick={() => setTargetedElement(null)} className="ml-auto hover:text-white"><X className="w-3.5 h-3.5"/></button>
                     </div>
                   )}
                   {selectedCodeContext && (
                     <div className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium max-w-[200px]">
                        <Code2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Code Selected ({selectedCodeContext.split('\n').length} lines)</span>
                        <button onClick={() => setSelectedCodeContext('')} className="ml-auto hover:text-white"><X className="w-3.5 h-3.5"/></button>
                     </div>
                   )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 shadow-sm w-full sm:max-w-fit">
                  <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <select value={selectedModel} onChange={(e) => saveSetting('omni_selected_model', e.target.value, setSelectedModel)} className="bg-transparent w-full text-xs font-medium text-gray-300 focus:outline-none cursor-pointer appearance-none outline-none pr-4">
                    {getModelOptions().map(opt => <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-300">{opt.label}</option>)}
                  </select>
                  <ChevronRight className="w-3 h-3 text-gray-600 shrink-0 rotate-90 -ml-2" />
                </div>
                
                <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 shadow-sm w-full sm:max-w-fit">
                  <User className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <select value={activePersona} onChange={(e) => { saveSetting('omni_active_persona', e.target.value, setActivePersona); setCustomSystemPrompt(PERSONAS[e.target.value] || userSavedPersonas[e.target.value]); }} className="bg-transparent w-full text-xs font-medium text-gray-300 focus:outline-none cursor-pointer appearance-none outline-none pr-4">
                    <optgroup label="System Defaults">
                      <option value="default" className="bg-gray-900 text-gray-300">Default Agent</option>
                      <option value="tailwind" className="bg-gray-900 text-gray-300">Tailwind Pro</option>
                      <option value="gamedev" className="bg-gray-900 text-gray-300">Game Developer</option>
                      <option value="datascientist" className="bg-gray-900 text-gray-300">Data Scientist</option>
                    </optgroup>
                    {Object.keys(userSavedPersonas).length > 0 && (
                      <optgroup label="Your Vault">
                        {Object.keys(userSavedPersonas).map(name => <option key={name} value={name} className="bg-gray-900 text-indigo-300">{name}</option>)}
                      </optgroup>
                    )}
                  </select>
                  <ChevronRight className="w-3 h-3 text-gray-600 shrink-0 rotate-90 -ml-2" />
                </div>
              </div>
              
              <form onSubmit={handleSendMessage} className="relative mt-1 flex flex-col sm:block">
                {chatImage && (
                  <div className="absolute bottom-full mb-2 left-0 p-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex items-center gap-2 animate-in fade-in">
                    {chatImage.startsWith('data:video') ? (
                      <video src={chatImage} className="h-16 w-16 object-cover rounded-lg border border-gray-600" autoPlay loop muted />
                    ) : (
                      <img src={chatImage} alt="Upload preview" className="h-16 w-16 object-cover rounded-lg border border-gray-600" />
                    )}
                    <button type="button" onClick={() => setChatImage(null)} className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-md transition-colors"><X className="w-4 h-4"/></button>
                  </div>
                )}
                {showSnippets && (
                  <div className="absolute bottom-full mb-3 left-0 w-full sm:w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2 z-20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-xs text-gray-400 mb-2 px-2 font-semibold uppercase tracking-wider">Quick Prompts</div>
                    <div className="space-y-1">
                      {quickSnippets.map((s, i) => <button key={i} type="button" onClick={() => {setInput(s); setShowSnippets(false);}} className="text-left w-full p-2.5 text-xs text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors truncate">{s}</button>)}
                    </div>
                  </div>
                )}
                
                {/* Responsive Mobile-Friendly Icon Toolbar */}
                <div className="flex sm:absolute sm:left-2 sm:top-2 sm:bottom-2 items-center gap-1 z-10 mb-2 sm:mb-0 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                   <button type="button" onClick={() => document.getElementById('chat-image-upload').click()} className="p-2 sm:p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-gray-800 transition-colors rounded-lg bg-gray-900 sm:bg-transparent" title="Upload Image Context"><ImagePlus className="w-5 h-5 sm:w-4 sm:h-4" /></button>
                   {apiProvider !== 'ollama' && (
                      <button type="button" onClick={() => {
                        const defaultUrl = figmaToken ? "Enter Figma File URL:" : "Enter Figma File URL (Add Figma API Token in Settings for direct extraction!):";
                        const figmaUrl = prompt(defaultUrl);
                        if(figmaUrl) setInput(prev => prev + `\n[Figma Reference: ${figmaUrl}]`);
                      }} className="p-2 sm:p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-gray-800 transition-colors rounded-lg bg-gray-900 sm:bg-transparent" title="Import Figma URL"><Figma className="w-5 h-5 sm:w-4 sm:h-4" /></button>
                   )}
                   <div className="w-px h-5 bg-gray-700 mx-0.5 hidden sm:block"></div>
                   <button type="button" onClick={toggleVoiceMode} className="p-2 sm:p-1.5 transition-colors rounded-lg flex items-center gap-1.5 text-gray-500 hover:text-blue-400 hover:bg-gray-800 bg-gray-900 sm:bg-transparent" title="Start Omni Voice Assistant (Gemini Live Equivalent)">
                     <Mic className="w-5 h-5 sm:w-4 sm:h-4" />
                   </button>
                   <input type="file" id="chat-image-upload" accept="image/*,video/mp4,video/webm,image/gif" className="hidden" onChange={handleChatImageUpload} />
                </div>

                <div className="relative w-full">
                    <textarea
                      value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                      placeholder="Describe what to build..."
                      className={`w-full bg-gray-950 border rounded-xl py-3 pl-4 sm:pl-[8rem] md:pl-[10rem] pr-[4.5rem] text-base sm:text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 resize-none h-[60px] max-h-[200px] border-gray-800 focus:ring-indigo-500/50`}
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                      <button type="button" onClick={() => setShowSnippets(!showSnippets)} className={`p-1.5 transition-colors rounded-lg hidden sm:block ${showSnippets ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400'}`} title="Prompt Snippets"><Bookmark className="w-4 h-4" /></button>
                      <button type="submit" disabled={!input.trim() || isLoading} className={`aspect-square h-full rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-800 disabled:text-gray-600 ${isVoiceAssistantMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {!isZenMode && isChatVisible && <div onMouseDown={startChatDrag} className="hidden lg:flex w-1 bg-transparent hover:bg-indigo-500 cursor-col-resize shrink-0 z-30 transition-colors relative -ml-[1px]" />}

        {/* Workspace Area */}
        <div className={`flex-1 flex-col h-full bg-[#0d1117] ${(!isChatVisible || activeTab !== 'chat' || isZenMode) ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 flex flex-col xl:flex-row h-full min-h-0">
            
            {/* Live Editable Code View */}
            <div style={{ width: (typeof window !== 'undefined' && window.innerWidth >= 1280 && !isZenMode) ? codeWidth : '100%' }} className={`flex-col border-r border-gray-800 h-full shrink-0 ${activeTab === 'code' ? 'flex' : (isCodeVisible ? 'hidden xl:flex' : '!hidden')}`}>
              <div className="h-12 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-2 text-sm font-medium text-gray-400 shrink-0 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center gap-2 pl-2">
                  <button onClick={() => setIsZenMode(!isZenMode)} className="p-1 hover:text-white hover:bg-gray-800 rounded transition-colors hidden sm:block"><PanelLeftClose className="w-4 h-4" /></button>
                  <Terminal className="w-4 h-4 hidden sm:block" /> <span>app_canvas.html</span>
                  <button onClick={() => {
                     const win = window.open('', '_blank', 'width=800,height=800');
                     win.document.write(`<textarea style="width:100%;height:100%;background:#0d1117;color:#e5e7eb;font-family:monospace;padding:20px;border:none;">${generatedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>`);
                     win.document.title = "Omni Code Editor Pop-out";
                  }} className="p-1 hover:text-indigo-400 transition-colors ml-1 hidden sm:block" title="Pop-out Editor"><ExternalLink className="w-3 h-3"/></button>
                </div>
                <div className="flex items-center gap-0.5 ml-2">
                  <button onClick={() => setIsAssetsOpen(true)} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors" title="Manage Assets"><ImageIcon className="w-4 h-4" /></button>
                  <button onClick={() => setIsPackagesOpen(true)} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors" title="Inject CDNs / BaaS"><Package className="w-4 h-4" /></button>
                  <button onClick={() => setIsComponentsOpen(true)} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors hidden sm:block" title="Tailwind Blocks"><Blocks className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  
                  <button onClick={formatCode} disabled={isFormatting} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors" title="Auto-Format"><AlignLeft className="w-4 h-4" /></button>
                  <button onClick={() => setIsDiffOpen(true)} disabled={codeHistory.length < 2} className="p-1.5 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors hidden sm:block" title="Compare Diff"><GitCompare className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  
                  {/* DRY Agent Actions Mapping */}
                  <div className="flex gap-0.5 overflow-x-auto max-w-[200px] sm:max-w-[250px] hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {AGENT_ACTIONS.filter(a => !a.isInfo).map(action => {
                       const ActionIcon = action.icon;
                       return (
                       <button key={action.id} onClick={() => handleAgentAction(action.id)} disabled={isLoading} className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${action.color} disabled:opacity-50 shrink-0`} title={`Agent: ${action.title}`}>
                          <ActionIcon className="w-4 h-4" />
                       </button>
                       );
                    })}
                    <div className="w-px h-4 bg-gray-700 mx-1 self-center shrink-0"></div>
                    {AGENT_ACTIONS.filter(a => a.isInfo).map(action => {
                       const ActionIcon = action.icon;
                       return (
                       <button key={action.id} onClick={() => handleAgentAction(action.id)} disabled={isLoading} className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${action.color} disabled:opacity-50 shrink-0`} title={`Agent: ${action.title}`}>
                          <ActionIcon className="w-4 h-4" />
                       </button>
                       );
                    })}
                  </div>

                  <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                  <button onClick={handleUndo} disabled={historyIndex === 0} className="p-1.5 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 hidden sm:block" title="Undo"><Undo className="w-4 h-4" /></button>
                  <button onClick={handleRedo} disabled={historyIndex === codeHistory.length - 1} className="p-1.5 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-30 mr-1 hidden sm:block" title="Redo"><Redo className="w-4 h-4" /></button>
                  <button onClick={() => setIsHistoryOpen(true)} className="p-1.5 hover:text-white hover:bg-gray-800 rounded transition-colors hidden sm:block" title="Version History & Branches"><History className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                  
                  {/* NEW: Map & Find Tools */}
                  <button onClick={() => setShowMinimap(!showMinimap)} className={`p-1.5 rounded transition-colors hidden sm:block ${showMinimap ? 'bg-indigo-500/20 text-indigo-400' : 'hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Toggle Minimap"><MapIcon className="w-4 h-4" /></button>
                  <button onClick={() => setIsSearchReplaceOpen(!isSearchReplaceOpen)} className={`p-1.5 rounded transition-colors ${isSearchReplaceOpen ? 'bg-indigo-500/20 text-indigo-400' : 'hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Find & Replace"><SearchCode className="w-4 h-4" /></button>

                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button onClick={handleCopyCode} className="p-1.5 hover:text-white hover:bg-gray-800 rounded transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Advanced IDE Features: Find & Replace Bar */}
              {isSearchReplaceOpen && (
                <div className="h-auto py-2 bg-gray-950 border-b border-gray-800 flex flex-wrap items-center px-3 gap-2 shrink-0 animate-in slide-in-from-top-1">
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md px-2 flex-1 min-w-[120px]">
                     <SearchCode className="w-3.5 h-3.5 text-gray-500 mr-2" />
                     <input type="text" value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="w-full bg-transparent text-base sm:text-xs text-gray-200 focus:outline-none py-1.5" />
                  </div>
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md px-2 flex-1 min-w-[120px]">
                     <Replace className="w-3.5 h-3.5 text-gray-500 mr-2" />
                     <input type="text" value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace..." className="w-full bg-transparent text-base sm:text-xs text-gray-200 focus:outline-none py-1.5" />
                  </div>
                  <button onClick={handleReplaceAll} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md transition-colors shrink-0">Replace All</button>
                  <button onClick={() => setIsSearchReplaceOpen(false)} className="p-1 text-gray-500 hover:text-white shrink-0"><X className="w-4 h-4" /></button>
                </div>
              )}
              
              {/* ADVANCED EDITOR WITH LINE NUMBERS AND MINIMAP */}
              <div className="flex-1 relative bg-[#0d1117] overflow-hidden flex flex-col">
                <div className="flex-1 flex overflow-hidden group">
                  {/* Line Numbers Gutter */}
                  <div 
                    ref={lineNumbersRef}
                    className="w-10 sm:w-12 bg-[#090b0f] border-r border-gray-800 text-gray-600 font-mono text-right pr-2 sm:pr-3 py-4 select-none overflow-hidden shrink-0"
                    style={{ fontSize: '13px', lineHeight: '21px' }}
                  >
                    {generatedCode.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                  </div>
                  
                  {/* Editor Container */}
                  <div className="flex-1 relative overflow-hidden">
                    <pre 
                      ref={highlightRef}
                      className="absolute inset-0 w-full h-full p-4 font-mono text-[#e5e7eb] bg-transparent whitespace-pre overflow-hidden pointer-events-none break-normal [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] m-0"
                      style={{ tabSize: 2, fontSize: '13px', lineHeight: '21px' }}
                      dangerouslySetInnerHTML={{ __html: highlightHTML(generatedCode) }}
                    />
                    <textarea 
                      ref={editorRef}
                      value={generatedCode}
                      onChange={(e) => updateCode(e.target.value)}
                      onSelect={handleEditorSelect} 
                      onKeyDown={handleEditorKeyDown}
                      onScroll={handleEditorScroll}
                      onContextMenu={handleContextMenu}
                      spellCheck="false"
                      className="absolute inset-0 w-full h-full p-4 font-mono text-transparent caret-white bg-transparent resize-none focus:outline-none whitespace-pre overflow-auto break-normal selection:bg-indigo-500/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] m-0 border-none outline-none"
                      style={{ tabSize: 2, fontSize: '13px', lineHeight: '21px' }}
                    />
                  </div>

                  {/* VS Code Style Minimap */}
                  {showMinimap && (
                    <div 
                      ref={minimapRef}
                      className="w-16 bg-[#090b0f] border-l border-gray-800 hidden sm:block shrink-0 overflow-hidden pointer-events-none select-none opacity-60 relative"
                    >
                       <pre 
                         className="absolute inset-0 w-[400%] origin-top-left font-mono text-[#e5e7eb] whitespace-pre break-normal"
                         style={{ transform: 'scale(0.25)', fontSize: '10px', lineHeight: '14px', padding: '8px' }}
                         dangerouslySetInnerHTML={{ __html: highlightHTML(generatedCode) }}
                       />
                       {/* Minimap Viewport Highlight Indicator */}
                       <div className="absolute w-full bg-indigo-500/10 border-y border-indigo-500/30" 
                            style={{ 
                              top: editorRef.current ? `${(editorRef.current.scrollTop / editorRef.current.scrollHeight) * 100}%` : '0%',
                              height: editorRef.current ? `${(editorRef.current.clientHeight / editorRef.current.scrollHeight) * 100}%` : '10%'
                            }} 
                       />
                    </div>
                  )}

                </div>

                {isTerminalOpen && (
                  <div className="h-48 bg-black border-t border-gray-800 p-2 font-mono text-xs text-green-400 overflow-y-auto flex flex-col shrink-0 relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                     <div className="flex justify-between items-center text-gray-500 mb-2 border-b border-gray-800 pb-1">
                        <span>WebContainer Terminal (Simulated)</span>
                        <button onClick={()=>setIsTerminalOpen(false)}><X className="w-3 h-3 hover:text-white"/></button>
                     </div>
                     <div className="flex-1">root@omni-sandbox:~/project# <span className="animate-pulse">_</span></div>
                  </div>
                )}
              </div>
            </div>

            {isCodeVisible && <div onMouseDown={startCodeDrag} className="hidden xl:flex w-1 bg-transparent hover:bg-indigo-500 cursor-col-resize shrink-0 z-30 transition-colors relative -ml-[1px]" />}

            {/* Live Preview View */}
            <div className={isFullscreen ? 'fixed inset-0 z-[120] flex flex-col bg-[#0d1117]' : `flex-1 flex-col h-full min-w-0 ${activeTab === 'preview' || (activeTab === 'chat' && window.innerWidth >= 1024) ? 'flex' : 'hidden xl:flex'}`}>
              <div className="h-12 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-4 text-sm font-medium text-gray-400 shrink-0 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsCodeVisible(!isCodeVisible)} className="p-1.5 mr-1 hover:text-white hover:bg-gray-800 rounded-md transition-colors hidden xl:flex" title={isCodeVisible ? "Hide Code Editor" : "Show Code Editor"}>
                      {isCodeVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </button>
                    <Play className="w-4 h-4 text-green-400" />
                    <span className="hidden sm:inline">Live Canvas</span>
                    <button onClick={openPopoutPreview} className="p-1 hover:text-indigo-400 transition-colors ml-2 hidden sm:block" title="Pop-out Multi-Monitor Preview"><ExternalLink className="w-3 h-3"/></button>
                  </div>
                  <div className="flex items-center bg-gray-950 rounded-lg p-0.5 border border-gray-800">
                    <button onClick={() => { setViewport('mobile'); setIsLandscape(false); setFluidWidth(100); setIsGridMode(false); }} className={`p-1.5 rounded-md transition-colors ${viewport === 'mobile' && !isGridMode ? 'bg-gray-800 text-white' : 'hover:text-white'}`}><Smartphone className="w-4 h-4" /></button>
                    <button onClick={() => { setViewport('tablet'); setIsLandscape(false); setFluidWidth(100); setIsGridMode(false); }} className={`p-1.5 rounded-md transition-colors ${viewport === 'tablet' && !isGridMode ? 'bg-gray-800 text-white' : 'hover:text-white'}`}><TabletIcon className="w-4 h-4" /></button>
                    <button onClick={() => { setViewport('desktop'); setIsLandscape(false); setFluidWidth(100); setIsGridMode(false); }} className={`p-1.5 rounded-md transition-colors ${viewport === 'desktop' && fluidWidth === 100 && !isGridMode ? 'bg-gray-800 text-white' : 'hover:text-white'}`}><Monitor className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                    <button onClick={() => setIsGridMode(!isGridMode)} className={`p-1.5 rounded-md transition-colors hidden sm:block ${isGridMode ? 'bg-indigo-500/20 text-indigo-400' : 'hover:text-white'}`} title="Grid-Based Multi-Device Stress Tester"><LayoutGrid className="w-4 h-4" /></button>
                    {viewport !== 'desktop' && !isGridMode && <button onClick={() => setIsLandscape(!isLandscape)} className={`p-1.5 ml-1 rounded-md transition-colors hover:text-white ${isLandscape ? 'text-indigo-400' : ''}`}><RotateCcw className="w-4 h-4" /></button>}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                   {/* Sync & Collab Tools */}
                   <button onClick={handleLocalSync} className="p-1.5 rounded-md transition-colors hover:text-indigo-400 hover:bg-indigo-500/10 hidden sm:block" title="Link Local Folder (File System Access)"><HardDriveDownload className="w-4 h-4" /></button>
                   <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-md p-0.5">
                     <button onClick={toggleMultiplayerMode} className={`p-1.5 rounded transition-colors ${isMultiplayerActive ? 'bg-green-500/20 text-green-400' : 'hover:text-green-400 hover:bg-green-500/10'}`} title="Live CRDT Multiplayer"><Users className="w-4 h-4" /></button>
                     {isMultiplayerActive && (
                        <button onClick={() => setIsAudioCallActive(!isAudioCallActive)} className={`p-1.5 rounded transition-colors ${isAudioCallActive ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'hover:text-blue-400 hover:bg-blue-500/10'}`} title="Pair Programming Audio Chat"><Headset className="w-4 h-4" /></button>
                     )}
                   </div>
                   <div className="w-px h-4 bg-gray-700 mx-1"></div>
                   
                   <button onClick={performLighthouseAudit} className="p-1.5 rounded-md transition-colors hover:text-indigo-400 hover:bg-indigo-500/10 hidden md:block" title="Run Lighthouse/QA Audit"><Activity className="w-4 h-4" /></button>
                   <button onClick={deployToStackBlitz} className="p-1.5 rounded-md transition-colors hover:text-yellow-400 hover:bg-yellow-500/10 hidden md:block" title="Deploy Full-Stack App to WebContainers"><CloudLightning className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                   
                   {/* Advanced Tools */}
                   <button onClick={() => setIsSplitPane(!isSplitPane)} className={`p-1.5 rounded-md transition-colors ${isSplitPane ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Multi-Canvas Microservices"><SplitSquareVertical className="w-4 h-4" /></button>
                   <button onClick={() => setIsAutoHealerActive(!isAutoHealerActive)} className={`p-1.5 rounded-md transition-colors ${isAutoHealerActive ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'hover:text-green-400 hover:bg-green-500/10'}`} title="Passive Auto-Healer"><BugPlay className="w-4 h-4" /></button>
                   <button onClick={() => setIsTimeTravelMode(!isTimeTravelMode)} className={`p-1.5 rounded-md transition-colors ${isTimeTravelMode ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'hover:text-red-400 hover:bg-red-500/10'}`} title="Time-Travel Debugging (rrweb)"><Video className="w-4 h-4" /></button>
                   <button onClick={() => setIsChaosMonkey(!isChaosMonkey)} className={`p-1.5 rounded-md transition-colors ${isChaosMonkey ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'hover:text-orange-400 hover:bg-orange-500/10'}`} title="Chaos Monkey (Simulate Network Fails)"><ServerCrash className="w-4 h-4" /></button>
                   <button onClick={() => setIs3DMode(!is3DMode)} className={`p-1.5 rounded-md transition-colors ${is3DMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'hover:text-blue-400 hover:bg-blue-500/10'}`} title="3D DOM Debugger"><Box className="w-4 h-4" /></button>
                   <button onClick={() => setIsGhostMode(!isGhostMode)} className={`p-1.5 rounded-md transition-colors ${isGhostMode ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50' : 'hover:text-teal-400 hover:bg-teal-500/10'}`} title="Real-User Emulation (Ghost Cursors)"><Ghost className="w-4 h-4" /></button>
                   <button onClick={() => setIsA11ySimulatorActive(!isA11ySimulatorActive)} className={`p-1.5 rounded-md transition-colors ${isA11ySimulatorActive ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'hover:text-yellow-400 hover:bg-yellow-500/10'}`} title="A11y Screen Reader Simulator"><EyeOff className="w-4 h-4" /></button>
                   <button onClick={() => setIsPerformanceMode(!isPerformanceMode)} className={`p-1.5 rounded-md transition-colors ${isPerformanceMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Performance Profiler (FPS/Memory)"><Gauge className="w-4 h-4" /></button>
                   <button onClick={() => setIsInspectorActive(!isInspectorActive)} className={`p-1.5 rounded-md transition-colors ${isInspectorActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Point & Prompt DOM Inspector"><MousePointerClick className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>

                   {viewport === 'desktop' && (
                     <div className="flex items-center gap-2 mr-2 hidden lg:flex">
                        <span className="text-[10px] uppercase font-bold text-gray-600">Fluid Width</span>
                        <input type="range" min="30" max="100" value={fluidWidth} onChange={(e)=>setFluidWidth(e.target.value)} className="w-24 accent-indigo-500" />
                     </div>
                   )}
                   <button onClick={shareLink} className="p-1.5 rounded-md transition-colors hover:text-indigo-400 hover:bg-indigo-500/10 hidden sm:block" title="Share Snapshot Link"><Share className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                   
                   <button onClick={() => setPreviewZoom(z => Math.max(25, z - 25))} className="p-1.5 rounded-md transition-colors hover:text-white hidden sm:block"><ZoomOut className="w-4 h-4" /></button>
                   <span className="text-xs w-8 text-center font-mono hidden sm:inline-block">{previewZoom}%</span>
                   <button onClick={() => setPreviewZoom(z => Math.min(200, z + 25))} className="p-1.5 rounded-md transition-colors hover:text-white hidden sm:block"><ZoomIn className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                   <button onClick={() => setIsPreviewDark(!isPreviewDark)} className={`hover:text-white transition-colors flex items-center p-1.5 rounded hidden sm:block ${isPreviewDark ? 'bg-indigo-500/20 text-indigo-400' : ''}`}><Moon className="w-4 h-4" /></button>
                   
                   <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                   <button onClick={() => setIframeKey(k => k + 1)} className="hover:text-red-400 transition-colors" title="Hard Reset"><Power className="w-4 h-4" /></button>
                   <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:text-white transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
                   <button onClick={() => iframeRef.current && (iframeRef.current.srcdoc = getSandboxDoc())} className="hover:text-white transition-colors hidden sm:block" title="Reload"><RefreshCw className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                 <div 
                   className={`flex-1 bg-[#090b0f] relative flex justify-center overflow-auto items-start ${viewport !== 'desktop' && !isGridMode ? 'pt-2 sm:pt-8' : ''}`}
                   style={{ backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=")' }}
                 >
                   {isGridMode ? (
                     <div className="w-full h-full p-8 overflow-auto flex flex-wrap gap-12 items-start justify-center">
                       <div className="flex flex-col items-center gap-3">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full">Mobile (375x812)</span>
                         <div className="w-[375px] h-[812px] bg-white rounded-[3rem] border-[12px] border-gray-900 overflow-hidden shadow-2xl relative shrink-0">
                            {/* Realistic iPhone Notch */}
                            <div className="absolute top-0 inset-x-0 h-6 w-40 bg-gray-900 rounded-b-3xl mx-auto z-20 flex justify-center items-end pb-1">
                               <div className="w-12 h-1.5 bg-black rounded-full"></div>
                            </div>
                            <iframe title="Mobile Preview" className="absolute inset-0 w-full h-full border-none bg-transparent" sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin" srcDoc={getSandboxDoc()} />
                         </div>
                       </div>
                       <div className="flex flex-col items-center gap-3">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full">Tablet (768x1024)</span>
                         <div className="w-[768px] h-[1024px] bg-white rounded-[2.5rem] border-[14px] border-[#1a1b1e] overflow-hidden shadow-2xl relative shrink-0">
                            {/* Simple tablet camera dot */}
                            <div className="absolute top-0 inset-y-0 right-2 w-2 h-2 bg-black rounded-full my-auto z-20"></div>
                            <iframe title="Tablet Preview" className="absolute inset-0 w-full h-full border-none bg-transparent" sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin" srcDoc={getSandboxDoc()} />
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div 
                       className={`bg-white transition-all duration-300 ease-in-out relative origin-top flex flex-col ${
                         viewport !== 'desktop' || fluidWidth < 100
                           ? 'rounded-[3rem] border-[12px] border-[#1a1b1e] overflow-hidden shrink-0 shadow-[0_0_0_2px_rgba(255,255,255,0.05)_inset,0_25px_50px_-12px_rgba(0,0,0,0.8)] ring-2 ring-gray-800' 
                           : 'w-full h-full overflow-hidden border-t border-l border-gray-700/50 rounded-tl-xl shadow-2xl mr-[-1px]'
                       }`}
                       style={viewport !== 'desktop' ? { 
                         width: viewport === 'mobile' ? (isLandscape ? 812 : 375) : (isLandscape ? 1024 : 768), 
                         height: viewport === 'mobile' ? (isLandscape ? 375 : 812) : (isLandscape ? 768 : 1024),
                         transform: `scale(${previewZoom / 100})`
                       } : { 
                         width: fluidWidth < 100 ? `${fluidWidth}%` : '100%',
                         height: fluidWidth < 100 ? '90%' : '100%',
                         marginTop: fluidWidth < 100 ? '2%' : '0',
                         transform: `scale(${previewZoom / 100})`, 
                         transformOrigin: 'top center' 
                       }}
                     >
                       {/* Hardware Side Buttons for mobile/tablet */}
                       {viewport !== 'desktop' && !isLandscape && (
                          <>
                             <div className="absolute -left-[16px] top-24 w-[4px] h-8 bg-gray-700 rounded-l-md hidden sm:block"></div>
                             <div className="absolute -left-[16px] top-36 w-[4px] h-12 bg-gray-700 rounded-l-md hidden sm:block"></div>
                             <div className="absolute -left-[16px] top-52 w-[4px] h-12 bg-gray-700 rounded-l-md hidden sm:block"></div>
                             <div className="absolute -right-[16px] top-32 w-[4px] h-16 bg-gray-700 rounded-r-md hidden sm:block"></div>
                          </>
                       )}

                       {/* Emulated Device Top Bar for Desktop */}
                       {(viewport === 'desktop' && fluidWidth === 100) && (
                         <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 w-full z-10 select-none">
                           <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm"/><div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm"/><div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm"/></div>
                           <div className="flex-1 flex justify-center px-4"><div className="bg-white border border-gray-200/60 rounded-md px-3 py-1 text-[11px] text-gray-500 font-mono w-full max-w-md text-center truncate shadow-sm flex items-center justify-center gap-2"><Lock className="w-3 h-3 text-gray-400" /> localhost:3000</div></div>
                           <div className="w-[52px]"></div>
                         </div>
                       )}
                       
                       {/* Dynamic Island / Notch for Pro Devices */}
                       {viewport === 'mobile' && !isLandscape && (
                         <div className="absolute top-0 inset-x-0 h-6 w-32 bg-black rounded-b-[18px] mx-auto z-20 pointer-events-none flex items-center justify-center">
                            <div className="w-10 h-1.5 bg-gray-800 rounded-full shadow-inner"></div>
                         </div>
                       )}

                       {viewport !== 'desktop' && isLandscape && (
                         <div className="absolute left-0 inset-y-0 w-6 h-32 bg-black rounded-r-[18px] my-auto z-20 pointer-events-none flex items-center justify-center">
                             <div className="h-10 w-1.5 bg-gray-800 rounded-full shadow-inner"></div>
                         </div>
                       )}
                       
                       <div className={`flex-1 relative bg-white w-full h-full flex ${isSplitPane ? 'flex-col' : ''} ${isInspectorActive ? 'pointer-events-auto' : ''}`}>
                         <iframe key={iframeKey} ref={iframeRef} title="Preview Frontend" className={`w-full ${isSplitPane ? 'h-1/2 border-b border-gray-300' : 'h-full absolute inset-0'} border-none bg-transparent z-0`} sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin" srcDoc={getSandboxDoc()} />
                         {isSplitPane && (
                            <div className="h-1/2 w-full bg-gray-900 relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
                               <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-bl-lg font-mono font-bold z-10">Simulated Backend (Port 8080)</div>
                               <iframe title="Preview Backend" className="w-full h-full border-none bg-transparent opacity-80" srcDoc={getSandboxDoc().replace('App Canvas', 'Backend Microservice')} />
                            </div>
                         )}
                         {isTimeTravelMode && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-gray-900/90 backdrop-blur border border-gray-700 p-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
                               <Video className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                               <div className="flex-1 flex flex-col">
                                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1"><span>-5.0s</span><span>LIVE</span></div>
                                  <input type="range" min="0" max="100" value={timeScrubberValue} onChange={(e)=>setTimeScrubberValue(e.target.value)} className="w-full accent-red-500" />
                               </div>
                               <span className="text-xs font-mono text-gray-300 font-bold shrink-0">{timeScrubberValue}%</span>
                            </div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {/* Target Element Sidebar Panel */}
                 {targetedElement && (
                   <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right-2">
                      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                         <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> DOM Target</h3>
                         <button onClick={() => setTargetedElement(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4"/></button>
                      </div>
                      <div className="p-4 space-y-4">
                         <div>
                            <p className="text-xs text-gray-500 mb-1">Tag</p>
                            <div className="px-2 py-1 bg-gray-950 rounded text-indigo-300 font-mono text-xs border border-gray-800 inline-block">&lt;{targetedElement.tag.toLowerCase()}&gt;</div>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 mb-1">Raw Source</p>
                            <textarea readOnly value={targetedElement.html} className="w-full h-40 bg-[#0d1117] border border-gray-800 rounded p-2 text-gray-300 font-mono text-[10px] resize-none focus:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" />
                         </div>
                         <div className="space-y-2 pt-2 border-t border-gray-800">
                            <button onClick={() => {
                               setInput("Modify this element: Make it ");
                               document.querySelector('textarea[placeholder="Describe what to build..."]')?.focus();
                            }} className="w-full py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs font-medium transition-colors">
                               Edit with AI
                            </button>
                            <button onClick={() => handleAgentAction('storybook')} className="w-full py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors flex justify-center items-center gap-1.5">
                               <Component className="w-3 h-3"/> Isolate Component
                            </button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              {isConsoleOpen && (
                <div className="bg-gray-950 border-t border-gray-800 flex flex-col shrink-0 relative" style={{ height: consoleHeight }}>
                  {/* Console Drag Handle */}
                  <div onMouseDown={startConsoleDrag} className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize hover:bg-indigo-500 z-10 transition-colors" />
                  
                  <div className="h-10 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-3 text-xs font-mono text-gray-400 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-300">Console</span>
                      <div className="w-px h-3 bg-gray-700 mx-1"></div>
                      <div className="flex items-center gap-1">
                        {['all', 'log', 'warn', 'error', 'network'].map(f => (
                          <button key={f} onClick={() => setConsoleFilter(f)} className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${consoleFilter === f ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setConsoleLogs([])} className="hover:text-white transition-colors">Clear</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
                    {consoleLogs.filter(log => consoleFilter === 'all' || log.type === consoleFilter).length === 0 ? (
                      <div className="text-gray-600 italic px-2 py-1">No logs matching filter.</div>
                    ) : (
                      consoleLogs.filter(log => consoleFilter === 'all' || log.type === consoleFilter).map(log => (
                        <div key={log.id} className={`px-2 py-1.5 rounded border-l-2 flex items-start gap-2 ${log.type === 'error' ? 'bg-red-900/10 text-red-400 border-red-500' : log.type === 'warn' ? 'bg-amber-900/10 text-amber-400 border-amber-500' : log.type === 'network' ? 'bg-blue-900/10 text-blue-400 border-blue-500' : 'text-gray-300 border-gray-700 hover:bg-gray-900'}`}>
                          <div className="flex-1 font-mono break-all"><span className="text-gray-600 mr-3">[{log.time}]</span>{log.message}</div>
                          {log.type === 'error' && (
                            <button onClick={() => handleAutoSolve(log.message)} className="p-1 bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded shrink-0 transition-colors flex items-center gap-1" title="Ask Agent to Fix Error">
                               <Bot className="w-3 h-3" /> Fix
                            </button>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={consoleEndRef} />
                  </div>
                  <form onSubmit={handleConsoleCommand} className="h-10 border-t border-gray-800 bg-gray-900 flex items-center px-3 shrink-0">
                     <span className="text-indigo-400 font-bold mr-2">{'>'}</span>
                     <input type="text" value={consoleInput} onChange={e => setConsoleInput(e.target.value)} onKeyDown={handleConsoleKeyDown} placeholder="Enter JavaScript command to evaluate in sandbox..." className="flex-1 bg-transparent border-none text-xs font-mono text-gray-200 focus:outline-none" />
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-[60px] bg-gray-950 border-t border-gray-800 flex justify-around items-center px-2 z-[100] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('chat')} className={`p-2 flex flex-col items-center gap-1 w-full ${activeTab === 'chat' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>
        <button onClick={() => setActiveTab('code')} className={`p-2 flex flex-col items-center gap-1 w-full ${activeTab === 'code' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
          <Code2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Code</span>
        </button>
        <button onClick={() => setActiveTab('preview')} className={`p-2 flex flex-col items-center gap-1 w-full ${activeTab === 'preview' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
          <Play className="w-5 h-5" />
          <span className="text-[10px] font-medium">Preview</span>
        </button>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 flex flex-col items-center gap-1 w-full text-gray-500 hover:text-gray-300">
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex flex-col justify-end lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-gray-900 rounded-t-3xl border-t border-gray-800 p-4 pb-10 flex flex-col gap-2 animate-in slide-in-from-bottom-full duration-300 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-4 shrink-0" />
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              <MobileMenuItem icon={Settings} label="Settings" onClick={() => setIsSettingsOpen(true)} />
              <MobileMenuItem icon={Command} label="Commands" onClick={() => setIsCommandPaletteOpen(true)} />
              <MobileMenuItem icon={FolderOpen} label="History" onClick={() => setIsSessionsModalOpen(true)} />
              <MobileMenuItem icon={Database} label="API Mocks" onClick={() => setIsMocksOpen(true)} />
              <MobileMenuItem icon={DatabaseBackup} label="DB Studio" onClick={() => setIsDbStudioOpen(true)} />
              <MobileMenuItem icon={Github} label="Git Sync" onClick={() => setIsGithubOpen(true)} />
              <MobileMenuItem icon={MapIcon} label="Spatial" onClick={() => setIsSpatialMode(!isSpatialMode)} />
              <MobileMenuItem icon={TerminalSquare} label="Console" onClick={() => { setIsConsoleOpen(!isConsoleOpen); setActiveTab('preview'); }} />
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Overlay (Gemini Live Equivalent) */}
      {voiceState !== 'inactive' && (
        <div className="fixed inset-0 bg-gray-950/85 backdrop-blur-xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <button onClick={stopVoiceMode} className="absolute top-8 right-8 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-full text-gray-300 transition-colors"><X className="w-6 h-6" /></button>
           
           <div className="flex flex-col items-center max-w-3xl w-full px-8">
              <div className="h-32 mb-16 flex items-center justify-center">
                 {voiceState === 'listening' && (
                    <div className="relative w-40 h-40 flex items-center justify-center cursor-pointer" onClick={stopVoiceMode} title="Stop Listening">
                       <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                       <div className="absolute inset-4 bg-blue-500/40 rounded-full animate-pulse"></div>
                       <div className="relative w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)]">
                           <Mic className="w-10 h-10 text-white" />
                       </div>
                    </div>
                 )}
                 {voiceState === 'thinking' && (
                    <div className="relative w-40 h-40 flex items-center justify-center">
                       <div className="absolute inset-6 border-[6px] border-t-purple-500 border-r-indigo-500 border-b-pink-500 border-l-transparent rounded-full animate-spin"></div>
                       <Bot className="w-10 h-10 text-purple-400 animate-pulse" />
                    </div>
                 )}
                 {voiceState === 'speaking' && (
                    <div className="relative w-40 h-40 flex items-center justify-center cursor-pointer" onClick={startVoiceListening} title="Interrupt & Speak">
                       <div className="flex items-center gap-2 h-16">
                          {[...Array(5)].map((_, i) => (
                             <div key={i} className="w-3 bg-teal-400 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.15}s`, height: i % 2 === 0 ? '100%' : '60%' }}></div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
              
              <div className="text-center min-h-[120px]">
                 {voiceState === 'listening' && (
                   <p className="text-3xl md:text-5xl font-medium text-gray-100 transition-all leading-tight tracking-tight">
                      {voiceTranscript || "I'm listening..."}
                   </p>
                 )}
                 {voiceState === 'thinking' && <p className="text-2xl text-purple-300 animate-pulse">Processing your request...</p>}
                 {voiceState === 'speaking' && (
                   <div className="animate-in slide-in-from-bottom-2 fade-in">
                     <p className="text-2xl text-teal-400 font-medium tracking-wide">Omni is speaking</p>
                     <p className="text-sm text-gray-500 mt-4">(Tap the waveform to interrupt)</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Hidden Audio Player for TTS */}
      <audio ref={audioRef} onEnded={() => { if (isVoiceAutoSubmit) { startVoiceListening(); } else { setVoiceState('inactive'); } }} className="hidden" />

      {/* Editor Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-gray-900 border border-gray-700 shadow-2xl rounded-lg py-1.5 z-[150] w-56 animate-in fade-in zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-1.5 mb-1.5 border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Editor Actions</div>
          <button onClick={() => { handleAgentAction('explain'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm text-gray-300 flex items-center gap-2 transition-colors"><Lightbulb className="w-4 h-4"/> Explain Selection</button>
          <button onClick={() => { handleAgentAction('refactor-multi'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm text-gray-300 flex items-center gap-2 transition-colors"><Wand2 className="w-4 h-4"/> Refactor Selection</button>
          <div className="my-1 border-t border-gray-800"></div>
          <button onClick={() => { if (selectedCodeContext) navigator.clipboard.writeText(selectedCodeContext); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm text-gray-300 flex items-center gap-2 transition-colors"><Copy className="w-4 h-4"/> Copy Text</button>
          <button onClick={() => { formatCode(); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm text-gray-300 flex items-center gap-2 transition-colors"><AlignLeft className="w-4 h-4"/> Format Code</button>
        </div>
      )}

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh] px-4" onClick={() => setIsCommandPaletteOpen(false)}>
          <div className="bg-gray-900 border border-gray-700 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-4 border-b border-gray-800 bg-gray-950">
               <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
               <input 
                 autoFocus
                 type="text" 
                 value={commandQuery}
                 onChange={e => setCommandQuery(e.target.value)}
                 className="flex-1 bg-transparent text-gray-100 focus:outline-none text-base placeholder-gray-500 font-medium w-full"
                 placeholder="Type a command or search actions..."
               />
               <div className="flex items-center gap-1 shrink-0 ml-2">
                 <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">ESC</span>
               </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
               {allCommands.filter(c => c.title.toLowerCase().includes(commandQuery.toLowerCase()) || c.id.includes(commandQuery.toLowerCase())).map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                  <button 
                    key={idx}
                    onClick={() => { cmd.action(); setIsCommandPaletteOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-500/20 hover:text-indigo-300 text-gray-300 rounded-lg flex items-center justify-between group transition-colors"
                  >
                     <div className="flex items-center gap-3 overflow-hidden">
                         <div className="p-1.5 bg-gray-800 group-hover:bg-indigo-500/20 rounded-md text-gray-400 group-hover:text-indigo-400 transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                         </div>
                         <span className="font-medium text-sm truncate">{cmd.title}</span>
                     </div>
                     <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider shrink-0 ml-2 hidden sm:block">{cmd.id.startsWith('sys-') ? 'System' : 'AI Action'}</span>
                  </button>
               )})}
               {allCommands.filter(c => c.title.toLowerCase().includes(commandQuery.toLowerCase()) || c.id.includes(commandQuery.toLowerCase())).length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">No commands found matching "{commandQuery}"</div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Sessions / History Modal */}
      {isSessionsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FolderOpen className="w-5 h-5 text-indigo-400" /> Chat History</h3>
              <button onClick={() => setIsSessionsModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 border-b border-gray-800 bg-gray-950 shrink-0">
               <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input type="text" value={historySearchQuery} onChange={e => setHistorySearchQuery(e.target.value)} placeholder="Search past sessions..." className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500" />
               </div>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {sessions.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">No saved sessions yet.</p>
              ) : (
                sessions.filter(s => s.title?.toLowerCase().includes(historySearchQuery.toLowerCase())).map((session) => (
                  <div key={session.id} onClick={() => loadSession(session.id)} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-colors ${currentSessionId === session.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-gray-950 border-gray-800 hover:border-gray-600'}`}>
                    <div className="overflow-hidden pr-4">
                      <h4 className={`font-medium text-sm truncate ${currentSessionId === session.id ? 'text-indigo-300' : 'text-gray-200'}`}>{session.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{new Date(session.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {currentSessionId === session.id && <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-[10px] font-bold">ACTIVE</span>}
                      <button onClick={(e) => deleteSession(session.id, e)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Delete Session"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0">
              <button onClick={() => { handleNewChat(); setIsSessionsModalOpen(false); }} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquarePlus className="w-4 h-4" /> Start New Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Direct Sync Modal */}
      {isGithubOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Github className="w-5 h-5 text-indigo-400" /> GitHub Direct Sync</h3>
              <button onClick={() => setIsGithubOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              <p className="text-sm text-gray-400">Pull code directly from your GitHub repositories into the Canvas, or push your generated code back as a commit.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">GitHub Personal Access Token (PAT)</label>
                  <input type="password" value={githubToken} onChange={(e) => saveSetting('omni_github_token', e.target.value, setGithubToken)} placeholder="ghp_..." className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  <p className="text-[10px] text-gray-500">Stored safely in localStorage. Requires 'repo' scope.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Repository (owner/repo)</label>
                  <input type="text" value={githubRepo} onChange={(e) => saveSetting('omni_github_repo', e.target.value, setGithubRepo)} placeholder="e.g. facebook/react" className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">File Path</label>
                  <input type="text" value={githubFilePath} onChange={(e) => setGithubFilePath(e.target.value)} placeholder="e.g. index.html or public/index.html" className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                 <button onClick={fetchFromGitHub} disabled={isLoading} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    <HardDriveDownload className="w-4 h-4"/> Pull to Canvas
                 </button>
                 <button onClick={pushToGitHub} disabled={isLoading} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    <HardDriveUpload className="w-4 h-4"/> Push Commit
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Mocking Dashboard Modal */}
      {isMocksOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Database className="w-5 h-5 text-indigo-400" /> Local API Mocks</h3>
              <button onClick={() => setIsMocksOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-400 mb-6 hidden sm:block">Define fake API endpoints here. The Sandbox intercepts matching `fetch()` calls and returns your mock data. Turn on "Edge Function" mode to execute raw JS logic (like Vercel Edge/Cloudflare Workers).</p>
              
              <div className="space-y-4">
                 {mockEndpoints.map((mock, index) => (
                    <div key={mock.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 relative group">
                       <button onClick={() => { const newMocks = [...mockEndpoints]; newMocks.splice(index, 1); saveMocks(newMocks); }} className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                       <div className="flex flex-col sm:flex-row gap-4 mb-3">
                         <div className="flex-1 pr-6 sm:pr-0">
                           <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Endpoint Path</label>
                           <input type="text" value={mock.path} onChange={e => { const newMocks = [...mockEndpoints]; newMocks[index].path = e.target.value; saveMocks(newMocks); }} placeholder="/api/users" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500" />
                         </div>
                         <div className="w-full sm:w-40">
                           <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                           <select value={mock.type || 'json'} onChange={e => { const newMocks = [...mockEndpoints]; newMocks[index].type = e.target.value; saveMocks(newMocks); }} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500">
                             <option value="json">Static JSON</option>
                             <option value="edge">Edge Function</option>
                           </select>
                         </div>
                       </div>
                       <div>
                         <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{mock.type === 'edge' ? 'Return Function Body' : 'JSON Response'}</label>
                         <textarea value={mock.response} onChange={e => { const newMocks = [...mockEndpoints]; newMocks[index].response = e.target.value; saveMocks(newMocks); }} placeholder={mock.type === 'edge' ? 'return { timestamp: Date.now(), req: req[0] };' : '{"status": "ok"}'} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-indigo-500 h-24 resize-none" />
                       </div>
                    </div>
                 ))}
              </div>
            </div>
            <div className="p-4 bg-gray-900/80 border-t border-gray-800 shrink-0">
               <button onClick={() => saveMocks([...mockEndpoints, { id: Date.now(), path: '/api/new', type: 'json', response: '{}' }])} className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                 + Add New Endpoint
               </button>
            </div>
          </div>
        </div>
      )}

      {/* WASM DB Studio Modal */}
      {isDbStudioOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[80vh] sm:h-[70vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><DatabaseBackup className="w-5 h-5 text-indigo-400" /> WASM DB Studio (PGlite)</h3>
              <button onClick={() => setIsDbStudioOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
               <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-gray-800 bg-gray-950 p-2 overflow-y-auto shrink-0 flex sm:flex-col gap-2">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider sm:mb-2 px-2 mt-2 hidden sm:block">Tables</div>
                  <div className="px-3 py-2 text-sm text-indigo-300 bg-indigo-500/10 rounded-lg cursor-pointer whitespace-nowrap">users</div>
                  <div className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded-lg cursor-pointer sm:mt-1 whitespace-nowrap">products</div>
               </div>
               <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0">
                  <div className="p-2 bg-gray-900 border-b border-gray-800 flex gap-2 overflow-x-auto hide-scrollbar">
                     <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md shrink-0">Run Query</button>
                     <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-md shrink-0">Export</button>
                  </div>
                  <textarea className="h-24 sm:h-32 bg-gray-950 text-green-400 font-mono text-sm p-4 border-b border-gray-800 focus:outline-none resize-none shrink-0" defaultValue="SELECT * FROM users LIMIT 10;" />
                  <div className="flex-1 p-4 overflow-auto">
                     <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900"><tr><th className="px-4 py-2">id</th><th className="px-4 py-2">name</th><th className="px-4 py-2">role</th></tr></thead>
                        <tbody><tr className="border-b border-gray-800"><td className="px-4 py-2">1</td><td className="px-4 py-2 text-gray-200">admin</td><td className="px-4 py-2 text-indigo-400">superuser</td></tr></tbody>
                     </table>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Diff Modal */}
      {isDiffOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><GitCompare className="w-5 h-5 text-indigo-400" /> Code Differences</h3>
              <button onClick={() => setIsDiffOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
               <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-800 flex flex-col min-h-0">
                  <div className="bg-gray-950 p-2 text-center text-xs font-bold text-red-400 uppercase tracking-widest border-b border-gray-800 shrink-0">Previous Version</div>
                  <textarea readOnly value={codeHistory[historyIndex - 1] || ''} className="flex-1 p-4 bg-[#0d1117] text-gray-300 font-mono text-xs resize-none focus:outline-none opacity-80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" />
               </div>
               <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-gray-950 p-2 text-center text-xs font-bold text-green-400 uppercase tracking-widest border-b border-gray-800 shrink-0">Current Version</div>
                  <textarea readOnly value={generatedCode} className="flex-1 p-4 bg-[#0d1117] text-gray-100 font-mono text-xs resize-none focus:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Version History & Branches Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><History className="w-5 h-5 text-indigo-400" /> Version Control</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
               {/* Branches Section */}
               <div className="w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-gray-800 flex flex-col min-h-[30vh]">
                  <div className="p-3 bg-gray-950 border-b border-gray-800 text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2 shrink-0"><GitBranch className="w-4 h-4"/> Saved Branches</div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                     {branches.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No branches saved. Save a version to pin it here.</p>}
                     {branches.map(branch => (
                        <div key={branch.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                           <div className="overflow-hidden pr-2">
                              <div className="text-sm font-bold text-indigo-300 truncate">{branch.name}</div>
                              <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{branch.date}</div>
                           </div>
                           <div className="flex gap-1 shrink-0">
                             <button onClick={() => restoreHistory(branch.code)} className="px-2 sm:px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors">Checkout</button>
                             <button onClick={() => {
                               const newB = branches.filter(b => b.id !== branch.id);
                               setBranches(newB);
                               localStorage.setItem('omni_branches', JSON.stringify(newB));
                             }} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               {/* Auto-History Section */}
               <div className="w-full sm:w-1/2 flex flex-col min-h-[30vh]">
                  <div className="p-3 bg-gray-950 border-b border-gray-800 text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 shrink-0"><History className="w-4 h-4"/> Auto-History</div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    {codeHistory.map((codeStr, i) => (
                      <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${historyIndex === i ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-gray-950 border-gray-800'}`}>
                        <div className="overflow-hidden pr-2">
                          <h4 className={`font-medium text-sm truncate ${historyIndex === i ? 'text-indigo-300' : 'text-gray-200'}`}>Version {i + 1}</h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{historyIndex === i ? 'Currently Active' : 'Auto-Saved State'}</p>
                        </div>
                        <div className="flex gap-1 shrink-0 ml-2">
                           <button onClick={() => {
                             const bName = prompt("Enter Branch Name:");
                             if(bName) saveBranch(codeStr, bName);
                           }} className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="Save as Branch"><GitBranch className="w-4 h-4"/></button>
                           <button onClick={() => restoreHistory(codeStr)} disabled={historyIndex === i} className="px-2 sm:px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 rounded-lg text-xs font-medium transition-colors">Restore</button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lighthouse Audit Modal */}
      {isAuditOpen && auditResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" /> Canvas Audit Report</h3>
              <button onClick={() => setIsAuditOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex flex-col items-center max-h-[70vh] overflow-y-auto">
               <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold mb-4 shrink-0 ${auditResult.score >= 90 ? 'border-green-500 text-green-400' : auditResult.score >= 50 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>
                  {auditResult.score}
               </div>
               <h4 className="text-gray-200 font-bold mb-4">Performance & Best Practices</h4>
               
               <div className="w-full space-y-2">
                  {auditResult.issues.length === 0 ? (
                     <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl flex items-center gap-2"><Check className="w-4 h-4"/> Perfect! No major issues found.</div>
                  ) : (
                     auditResult.issues.map((issue, i) => (
                        <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl flex items-start gap-2">
                           <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                           <span>{issue}</span>
                        </div>
                     ))
                  )}
               </div>
               
               {auditResult.issues.length > 0 && (
                  <button onClick={() => {
                     setIsAuditOpen(false);
                     handleAutoSolve(`Lighthouse Audit Failed with the following issues:\n${auditResult.issues.join('\n')}\n\nPlease apply fixes for all these issues.`);
                  }} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2 shrink-0">
                     <Bot className="w-4 h-4" /> Agent, Fix All Issues
                  </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Components Modal */}
      {isComponentsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0"><h3 className="text-lg font-semibold flex items-center gap-2"><Blocks className="w-5 h-5 text-indigo-400" /> Tailwind Blocks</h3><button onClick={() => setIsComponentsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {tailwindComponents.map((comp, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <h4 className="font-medium text-gray-200 text-sm truncate pr-2">{comp.name}</h4>
                  <button onClick={() => injectComponent(comp.code)} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors shrink-0">Insert</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Packages Modal & NPM Search */}
      {isPackagesOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0"><h3 className="text-lg font-semibold flex items-center gap-2"><Package className="w-5 h-5 text-indigo-400" /> Inject Packages & BaaS</h3><button onClick={() => setIsPackagesOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 border-b border-gray-800 bg-gray-950 shrink-0">
               <form onSubmit={searchNPM} className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input type="text" value={npmSearchQuery} onChange={e => setNpmSearchQuery(e.target.value)} placeholder="Search NPM (e.g. framer-motion)..." className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500" />
               </form>
               {isSearchingNpm && <p className="text-xs text-indigo-400 mt-2 text-center">Searching...</p>}
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {npmSearchResults.length > 0 ? (
                 <>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Results</h4>
                   {npmSearchResults.map((pkg, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-950 border border-gray-800">
                        <div className="overflow-hidden pr-2"><h4 className="font-medium text-gray-200 text-sm truncate">{pkg.name}</h4><p className="text-[10px] sm:text-xs text-gray-500 truncate">{pkg.description}</p></div>
                        <button onClick={() => injectPackage(`<script src="${pkg.latest}"></script>`)} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2">Add</button>
                      </div>
                   ))}
                 </>
              ) : (
                 <>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Add</h4>
                   {popularPackages.map((pkg, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-950 border border-gray-800">
                      <div className="overflow-hidden pr-2"><h4 className="font-medium text-gray-200 text-sm truncate">{pkg.name}</h4><p className="text-[10px] sm:text-xs text-gray-500 truncate">{pkg.desc}</p></div>
                      <button onClick={() => injectPackage(pkg.tag)} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2">Add</button>
                    </div>
                  ))}
                 </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assets Modal */}
      {isAssetsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0"><h3 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-indigo-400" /> Asset Manager</h3><button onClick={() => setIsAssetsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:bg-gray-800/50 transition-colors relative">
                <input type="file" accept="image/*" onChange={handleAssetUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" /><p className="text-sm text-gray-400">Click or tap to upload<br/><span className="text-xs text-gray-500">(Converts to Base64)</span></p>
              </div>
              <div className="space-y-2">
                {assets.map((asset, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-950 border border-gray-800">
                    <div className="flex items-center gap-2 overflow-hidden"><img src={asset.base64} alt="preview" className="w-8 h-8 object-cover rounded bg-gray-800 shrink-0" /><span className="text-xs text-gray-300 truncate">{asset.name}</span></div>
                    <button onClick={() => { navigator.clipboard.writeText(asset.base64); alert('Base64 copied to clipboard!'); }} className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition-colors shrink-0 ml-2" title="Copy Base64"><Copy className="w-4 h-4" /></button>
                  </div>
                ))}
                {assets.length === 0 && <p className="text-xs text-center text-gray-600 py-4">No assets uploaded yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-400" /> Settings & Integrations</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800">
                  
                  {/* Left Column - Core Config */}
                  <div className="bg-gray-900 p-4 sm:p-6 space-y-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Configuration</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-xl">
                       <div>
                         <h4 className="text-sm font-medium text-gray-200">Voice Auto-Submit</h4>
                         <p className="text-[10px] sm:text-xs text-gray-500">Send prompt automatically</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isVoiceAutoSubmit} onChange={(e) => saveSetting('omni_voice_autosubmit', e.target.checked, setIsVoiceAutoSubmit)} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                       </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Active AI Provider</label>
                      <select value={apiProvider} onChange={(e) => saveSetting('omni_api_provider', e.target.value, setApiProvider)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="gemini">Google Gemini</option>
                        <option value="longcat">Longcat.chat</option>
                        <option value="ollama">Ollama (Local LLM)</option>
                      </select>
                    </div>

                    {apiProvider === 'gemini' && (
                      <div className="space-y-4 animate-in fade-in">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Custom Gemini API Key</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {userApiKey.split(',').map(k => k.trim()).filter(Boolean).map((key, idx) => (
                               <div key={idx} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md text-xs font-mono">
                                  {showGeminiKey ? key : '•'.repeat(Math.min(key.length, 10))}
                                  <button onClick={() => {
                                     const newKeys = userApiKey.split(',').map(k=>k.trim()).filter(Boolean).filter((_, i) => i !== idx).join(', ');
                                     saveSetting('omni_gemini_key', newKeys, setUserApiKey);
                                  }}><X className="w-3 h-3 hover:text-red-400"/></button>
                               </div>
                            ))}
                          </div>
                          <div className="relative flex items-center gap-2">
                            <input 
                              type={showGeminiKey ? "text" : "password"} 
                              value={geminiKeyInput}
                              onChange={(e) => setGeminiKeyInput(e.target.value)}
                              placeholder="Paste API Key..." 
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault();
                                    const currentKeys = userApiKey.split(',').map(k=>k.trim()).filter(Boolean);
                                    if (!currentKeys.includes(e.target.value.trim())) saveSetting('omni_gemini_key', [...currentKeys, e.target.value.trim()].join(', '), setUserApiKey);
                                    setGeminiKeyInput('');
                                 }
                              }}
                              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full"
                            />
                            <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)} className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 text-gray-400 transition-colors shrink-0" title={showGeminiKey ? "Hide Keys" : "Show Keys"}>
                               {showGeminiKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4" />}
                            </button>
                            <button type="button" onClick={() => testConnection('gemini')} className="p-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl text-white transition-colors flex items-center justify-center w-10 shrink-0">
                               {testingStatus.gemini === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : testingStatus.gemini === 'success' ? <Check className="w-4 h-4 text-green-300" /> : testingStatus.gemini === 'error' ? <AlertCircle className="w-4 h-4 text-red-300" /> : <Zap className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] text-gray-500">Stored safely locally.</p>
                              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Get Free Gemini Key</a>
                          </div>
                        </div>
                      </div>
                    )}

                    {apiProvider === 'longcat' && (
                      <div className="space-y-4 animate-in fade-in">
                         {/* Longcat settings (Truncated slightly for visual balance, same logic applies) */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-300">Longcat API Key</label>
                           <div className="relative flex items-center gap-2">
                             <input type={showLongcatKey ? "text" : "password"} value={longcatKeyInput} onChange={(e) => setLongcatKeyInput(e.target.value)} placeholder="Paste key..." onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { e.preventDefault(); const currentKeys = longcatApiKey.split(',').map(k=>k.trim()).filter(Boolean); if (!currentKeys.includes(e.target.value.trim())) saveSetting('omni_longcat_key', [...currentKeys, e.target.value.trim()].join(', '), setLongcatApiKey); setLongcatKeyInput(''); } }} className="flex-1 bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full" />
                             <button type="button" onClick={() => setShowLongcatKey(!showLongcatKey)} className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 text-gray-400 transition-colors shrink-0">{showLongcatKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4" />}</button>
                             <button type="button" onClick={() => testConnection('longcat')} className="p-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl text-white transition-colors flex items-center justify-center w-10 shrink-0">{testingStatus.longcat === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : testingStatus.longcat === 'success' ? <Check className="w-4 h-4 text-green-300" /> : testingStatus.longcat === 'error' ? <AlertCircle className="w-4 h-4 text-red-300" /> : <Zap className="w-4 h-4" />}</button>
                           </div>
                         </div>
                      </div>
                    )}

                    {apiProvider === 'ollama' && (
                      <div className="space-y-4 animate-in fade-in">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Local Endpoint URL</label>
                          <input type="text" value={ollamaUrl} onChange={(e) => saveSetting('omni_ollama_url', e.target.value, setOllamaUrl)} placeholder="http://localhost:11434/api/chat" className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-800 space-y-2">
                       <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><MonitorSpeaker className="w-4 h-4 text-indigo-400"/> Assistant Voice Setup</label>
                       <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Choose the TTS voice used when Omni Voice Assistant is active.</p>
                       
                       {apiProvider === 'gemini' ? (
                          <div className="space-y-1 mb-2">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gemini Native Voices</span>
                            <select value={geminiVoice} onChange={(e) => saveSetting('omni_gemini_voice', e.target.value, setGeminiVoice)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                               {GEMINI_VOICES.map(v => <option key={v} value={v}>{v} (High Quality)</option>)}
                            </select>
                          </div>
                       ) : (
                          <div className="space-y-1 mb-2">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Browser Fallback Voices</span>
                            <select value={selectedVoiceURI} onChange={(e) => saveSetting('omni_voice_uri', e.target.value, setSelectedVoiceURI)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                               {availableVoices.length === 0 && <option value="">Loading voices...</option>}
                               {availableVoices.map((v, i) => (
                                  <option key={i} value={v.voiceURI}>{v.name} ({v.lang})</option>
                               ))}
                            </select>
                          </div>
                       )}
                    </div>

                  </div>
                  
                  {/* Right Column - Integrations & Sandbox Config */}
                  <div className="bg-gray-900 p-4 sm:p-6 space-y-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Integrations & Data</h4>
                    
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Figma className="w-4 h-4 text-pink-400"/> Figma API Token (Optional)</label>
                       <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Allows the Agent to directly extract design tokens and CSS from a Figma file URL.</p>
                       <input type="password" value={figmaToken} onChange={(e) => saveSetting('omni_figma_token', e.target.value, setFigmaToken)} placeholder="figd_..." className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>

                    <div className="pt-4 border-t border-gray-800 space-y-2">
                       <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Lock className="w-4 h-4 text-amber-400"/> Environment Variables</label>
                       <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Injected safely into Sandbox as <code>window.ENV</code>.</p>
                       <textarea value={sandboxEnv} onChange={(e) => saveSetting('omni_sandbox_env', e.target.value, setSandboxEnv)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-20 resize-none" />
                    </div>

                    <div className="pt-4 border-t border-gray-800 space-y-2">
                       <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Brain className="w-4 h-4 text-fuchsia-400"/> Local Vector RAG</label>
                       <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Upload project docs or PDFs to give the Omni-Agent persistent memory.</p>
                       <button onClick={() => alert("Simulated: Vector DB Initialized. Docs chunked and embedded into IndexedDB.")} className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-fuchsia-400 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 transition-colors text-xs font-medium flex items-center justify-center gap-2">
                          <Database className="w-3.5 h-3.5" /> Upload Knowledge Base
                       </button>
                    </div>

                    <div className="pt-4 border-t border-gray-800 space-y-2">
                       <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-gray-300 flex items-center gap-2">Context Memory Limit <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs">{maxContext === 0 ? 'Unlimited' : `${maxContext} Msgs`}</span></label>
                       </div>
                       <input type="range" min="0" max="40" step="2" value={maxContext} onChange={(e) => saveSetting('omni_max_context', parseInt(e.target.value), setMaxContext)} className="w-full accent-indigo-500 mt-2" />
                    </div>

                    {/* Prompt Vault */}
                    <div className="pt-4 border-t border-gray-800 space-y-3">
                       <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400"/> Custom Persona Vault</label>
                         <button onClick={() => saveSetting('omni_system_prompt', PERSONAS.default, setCustomSystemPrompt)} className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300">Reset Default</button>
                       </div>
                       <textarea value={customSystemPrompt} onChange={(e) => setCustomSystemPrompt(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-20 resize-none" />
                       <div className="flex flex-col sm:flex-row gap-2">
                         <input type="text" value={newPersonaName} onChange={e => setNewPersonaName(e.target.value)} placeholder="Name your Persona..." className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 sm:py-1.5 text-sm sm:text-xs text-gray-200 focus:outline-none focus:border-indigo-500 w-full" />
                         <button onClick={saveToVault} disabled={!newPersonaName.trim()} className="w-full sm:w-auto px-4 py-2 sm:py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm sm:text-xs font-medium hover:bg-indigo-500/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 shrink-0"><Save className="w-3.5 h-3.5"/> Save</button>
                       </div>
                    </div>

                  </div>
               </div>
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex justify-between items-center shrink-0">
              <button onClick={purgeCredentials} className="px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4 hidden sm:block" /> Purge Credentials
              </button>
              <button onClick={() => {
                  if (geminiKeyInput.trim()) {
                    const currentKeys = userApiKey.split(',').map(k=>k.trim()).filter(Boolean);
                    if (!currentKeys.includes(geminiKeyInput.trim())) saveSetting('omni_gemini_key', [...currentKeys, geminiKeyInput.trim()].join(', '), setUserApiKey);
                    setGeminiKeyInput('');
                  }
                  if (longcatKeyInput.trim()) {
                    const currentKeys = longcatApiKey.split(',').map(k=>k.trim()).filter(Boolean);
                    if (!currentKeys.includes(longcatKeyInput.trim())) saveSetting('omni_longcat_key', [...currentKeys, longcatKeyInput.trim()].join(', '), setLongcatApiKey);
                    setLongcatKeyInput('');
                  }
                  setIsSettingsOpen(false);
              }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
