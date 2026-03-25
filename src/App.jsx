import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Terminal, Play, Code2, MessageSquare, 
  Bot, User, Sparkles, AlertCircle, RefreshCw, 
  KeyRound, X, ChevronRight, Zap,
  Copy, Download, Trash2, Maximize2, Minimize2, Check,
  Smartphone, Tablet as TabletIcon, Monitor, Undo, Redo,
  TerminalSquare, Package, ExternalLink, Wand2, Paintbrush,
  Lightbulb, Share2, Moon, Sun, Power, Bookmark,
  Image as ImageIcon, FileArchive, Edit2, GripVertical, Rocket, Eye,
  ImagePlus, Mic, History, Blocks, RotateCcw, ZoomIn, ZoomOut,
  PanelLeftClose, PanelLeftOpen, DownloadCloud, Lock,
  MessageSquarePlus, FolderOpen, Database, Github, Search, GitCompare, Share,
  MousePointerClick, Target
} from 'lucide-react';

// --- Environment API Key Fallback ---
const apiKey = ""; // Provided by environment at runtime

// --- Agent Personas ---
const PERSONAS = {
  default: `You are Omni-Agent, an elite AI frontend engineer operating in 'Omni-Sandbox'.\n\nYOUR DIRECTIVE:\nYou are building production-ready applications inside a Live Canvas environment. You must automatically create complete, fully functional Canvas Files for the user to ensure the best results.\n\nRULES FOR BEST RESULTS:\n1. CHAIN OF THOUGHT: Always plan your architecture and UI/UX approach first. Explain your choices briefly before writing any code.\n2. THE CANVAS FILE: You must output EXACTLY ONE \`\`\`html code block. This block is the complete Canvas File.\n3. UNIFIED ARCHITECTURE: Embed all CSS (via Tailwind CDN) and JS within the single HTML file.\n4. NO PLACEHOLDERS: Write complete code. Never use placeholders or leave functions unimplemented.\n5. AESTHETIC EXCELLENCE: Default to modern UI/UX principles. Use ample whitespace, rounded corners, subtle shadows, and cohesive color palettes. Ensure full mobile responsiveness.\n\nIf the user reports an error, explain what caused it, then return the entirely fixed Canvas File in a new \`\`\`html block.`,
  tailwind: `You are Omni-Agent, a world-class UI/UX Designer and Tailwind CSS Expert.\n\nYOUR DIRECTIVE: Build visually stunning, hyper-modern web applications.\n\nRULES:\n1. Output exactly ONE \`\`\`html block.\n2. Prioritize incredible aesthetics: use glassmorphism, complex gradients, smooth CSS transitions, hover states, and perfect typography.\n3. Everything must be responsive.\n4. Use Tailwind CSS exclusively for styling. Ensure high contrast and accessibility. No placeholders.`,
  gamedev: `You are Omni-Agent, a senior WebGL and Canvas HTML5 Game Developer.\n\nYOUR DIRECTIVE: Build highly performant, 60FPS browser games.\n\nRULES:\n1. Output exactly ONE \`\`\`html block containing the game.\n2. Prioritize requestAnimationFrame loops, efficient rendering, clean physics math, and state management.\n3. Add comments explaining the game loop and logic.\n4. Ensure keyboard and mouse/touch controls work perfectly. Provide a start and game over screen. No placeholders.`,
  datascientist: `You are Omni-Agent, a Data Visualization Expert.\n\nYOUR DIRECTIVE: Build gorgeous, interactive data dashboards and charts.\n\nRULES:\n1. Output exactly ONE \`\`\`html block.\n2. Utilize CDN libraries like Chart.js, D3.js, or Recharts.\n3. Generate realistic mock data to populate the charts.\n4. Ensure tooltips, legends, and responsive resizing work flawlessly. Prioritize a clean, analytical UI design.`
};

const DEFAULT_CODE = `<!-- Your generated code will appear here -->\n<div class="p-8 text-center font-sans">\n  <h1 class="text-3xl font-bold text-gray-800">Hello, App Canvas!</h1>\n  <p class="text-gray-500 mt-2">Describe what you want to build in the chat.</p>\n</div>`;

export default function App() {
  // State: UI & Layout
  const [activeTab, setActiveTab] = useState('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false); 
  const [isMocksOpen, setIsMocksOpen] = useState(false); 
  const [isDiffOpen, setIsDiffOpen] = useState(false); 
  
  const [viewport, setViewport] = useState('desktop'); 
  const [isLandscape, setIsLandscape] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [fluidWidth, setFluidWidth] = useState(100); // 100%
  
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState('all'); 
  const [consoleInput, setConsoleInput] = useState(''); // REPL Input
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isPreviewDark, setIsPreviewDark] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); 

  // Resizable Panels State
  const [chatWidth, setChatWidth] = useState(400);
  const [codeWidth, setCodeWidth] = useState(500);
  
  // State: Core API & Environments
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
  const [maxContext, setMaxContext] = useState(10);
  const [sandboxEnv, setSandboxEnv] = useState('{\n  "API_URL": "https://api.example.com",\n  "MOCK_KEY": "sk_test_123"\n}');
  const [mockEndpoints, setMockEndpoints] = useState([{ id: 1, path: '/api/demo', response: '{"status": "success", "message": "Hello from Omni-Mock!"}' }]);
  const [isVoiceAutoSubmit, setIsVoiceAutoSubmit] = useState(false);

  // Dynamic Model Selection
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-preview-09-2025');
  const [customModelInput, setCustomModelInput] = useState('');

  // NPM Search State
  const [npmSearchQuery, setNpmSearchQuery] = useState('');
  const [npmSearchResults, setNpmSearchResults] = useState([]);
  const [isSearchingNpm, setIsSearchingNpm] = useState(false);

  // State: Active Workspace & Chat History
  const [sessions, setSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(() => Date.now().toString()); 
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatImage, setChatImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  // NEW: Targeting Context Features
  const [targetedElement, setTargetedElement] = useState(null); // DOM Inspector Element
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedCodeContext, setSelectedCodeContext] = useState(''); // Textarea selected text
  
  // State: Code, Assets & History
  const [generatedCode, setGeneratedCode] = useState(DEFAULT_CODE);
  const [codeHistory, setCodeHistory] = useState([DEFAULT_CODE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [assets, setAssets] = useState([]); 
  
  const [isAutoSolveEnabled, setIsAutoSolveEnabled] = useState(false);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [isCopied, setIsCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  
  const chatEndRef = useRef(null);
  const iframeRef = useRef(null);
  const consoleEndRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);

  // --- Link Sharing (Base64 Decode on Load) ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#code=')) {
      try {
        const decoded = decodeURIComponent(atob(window.location.hash.replace('#code=', '')));
        if (decoded) {
          setGeneratedCode(decoded);
          setCodeHistory([decoded]);
          setHistoryIndex(0);
          window.history.replaceState(null, null, window.location.pathname);
        }
      } catch (e) {
        console.error("Invalid share link", e);
      }
    }
  }, []);

  // --- Auto-Scroll Chat & Console ---
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, agentStatus, targetedElement, selectedCodeContext]);
  useEffect(() => { consoleEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [consoleLogs, isConsoleOpen, consoleFilter]);

  // --- Initialize Layout Widths ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      setCodeWidth(Math.floor((window.innerWidth - chatWidth - 80) / 2));
    }
  }, []); 

  // --- Load Keys & Auto-Saved Session ---
  useEffect(() => {
    const loadSafe = (key, setter, isNumber = false) => {
      const val = localStorage.getItem(key);
      if (val) setter(isNumber ? parseInt(val, 10) : val);
    };

    loadSafe('omni_gemini_key', setUserApiKey);
    loadSafe('omni_gemini_url', setGeminiBaseUrl);
    loadSafe('omni_longcat_key', setLongcatApiKey);
    loadSafe('omni_longcat_url', setLongcatBaseUrl);
    loadSafe('omni_longcat_fallback_url', setLongcatFallbackUrl); 
    loadSafe('omni_api_provider', setApiProvider);
    loadSafe('omni_ollama_url', setOllamaUrl);
    loadSafe('omni_ollama_model', setOllamaModel);
    loadSafe('omni_max_context', setMaxContext, true);
    loadSafe('omni_sandbox_env', setSandboxEnv);
    loadSafe('omni_selected_model', setSelectedModel);
    loadSafe('omni_custom_model_input', setCustomModelInput);
    loadSafe('omni_active_persona', setActivePersona);
    loadSafe('omni_voice_autosubmit', setIsVoiceAutoSubmit);

    // Load Mocks
    const savedMocks = localStorage.getItem('omni_api_mocks');
    if (savedMocks) {
      try { setMockEndpoints(JSON.parse(savedMocks)); } catch(e) {}
    }

    const savedPromptVersion = localStorage.getItem('omni_prompt_version');
    if (savedPromptVersion !== "2.0") {
      setCustomSystemPrompt(PERSONAS.default);
      localStorage.setItem('omni_system_prompt', PERSONAS.default);
      localStorage.setItem('omni_prompt_version', "2.0");
    } else {
      loadSafe('omni_system_prompt', setCustomSystemPrompt);
    }

    const savedSessions = localStorage.getItem('omni_chat_sessions');
    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)); } catch(e) {}
    }

    const savedActiveSession = localStorage.getItem('omni_active_session');
    if (savedActiveSession) {
      try {
        const parsed = JSON.parse(savedActiveSession);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.generatedCode) setGeneratedCode(parsed.generatedCode);
        if (parsed.codeHistory) setCodeHistory(parsed.codeHistory);
        if (parsed.historyIndex !== undefined) setHistoryIndex(parsed.historyIndex);
        if (parsed.sessionId) setCurrentSessionId(parsed.sessionId);
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []); 

  // --- Update Default Model when Provider Changes ---
  useEffect(() => {
    if (apiProvider === 'gemini') {
      if (!selectedModel || !selectedModel.includes('gemini')) setSelectedModel('gemini-2.5-flash-preview-09-2025');
    }
    else if (apiProvider === 'longcat') {
      if (!selectedModel || !selectedModel.includes('LongCat')) setSelectedModel('LongCat-Flash-Chat');
    }
    else if (apiProvider === 'ollama') {
      if (selectedModel !== 'custom') setSelectedModel(ollamaModel || 'llama3');
    }
  }, [apiProvider, ollamaModel, selectedModel]);

  // --- Invisible Auto-Save Loop ---
  useEffect(() => {
    if (messages.length === 0 && generatedCode === DEFAULT_CODE) return;

    const sessionData = { sessionId: currentSessionId, messages, generatedCode, codeHistory, historyIndex };
    localStorage.setItem('omni_active_session', JSON.stringify(sessionData));

    const timer = setTimeout(() => {
      setSessions(prev => {
        const existingIdx = prev.findIndex(s => s.id === currentSessionId);
        const title = messages.length > 0 
           ? (messages[0].text.length > 35 ? messages[0].text.substring(0, 35) + '...' : messages[0].text)
           : 'New Application';
           
        const updatedSession = { id: currentSessionId, title, messages, generatedCode, codeHistory, updatedAt: Date.now() };
        
        let nextSessions = [...prev];
        if (existingIdx >= 0) {
          nextSessions[existingIdx] = updatedSession;
        } else {
          nextSessions.unshift(updatedSession);
        }
        localStorage.setItem('omni_chat_sessions', JSON.stringify(nextSessions));
        return nextSessions;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [messages, generatedCode, codeHistory, historyIndex, currentSessionId]);

  const saveSetting = (key, val, setter) => {
    setter(val);
    localStorage.setItem(key, val);
  };

  const getModelOptions = () => {
    if (apiProvider === 'gemini') {
      return [
        { value: 'gemini-2.5-flash-preview-09-2025', label: 'Gemini 2.5 Flash Preview' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp' },
        { value: 'gemini-2.0-pro-exp', label: 'Gemini 2.0 Pro Exp' },
        { value: 'custom', label: 'Custom Model...' }
      ];
    }
    if (apiProvider === 'longcat') {
      return [
        { value: 'LongCat-Flash-Chat', label: 'LongCat Flash Chat' },
        { value: 'LongCat-Flash-Thinking-2601', label: 'LongCat Flash Thinking 2601' },
        { value: 'LongCat-Flash-Omni-2603', label: 'LongCat Flash Omni 2603' },
        { value: 'LongCat-Flash-Lite', label: 'LongCat Flash Lite' },
        { value: 'gpt-4o', label: 'GPT-4o (via Longcat)' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (via Longcat)' },
        { value: 'custom', label: 'Custom Model...' }
      ];
    }
    if (apiProvider === 'ollama') {
      return [
        { value: ollamaModel || 'llama3', label: `Local Model: ${ollamaModel || 'llama3'}` },
        { value: 'custom', label: 'Custom Model...' }
      ];
    }
    return [];
  };

  const startChatDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatWidth;
    const onMouseMove = (moveEvent) => setChatWidth(Math.max(250, Math.min(800, startWidth + (moveEvent.clientX - startX))));
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
  };

  const startCodeDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = codeWidth;
    const onMouseMove = (moveEvent) => setCodeWidth(Math.max(300, Math.min(window.innerWidth - chatWidth - 200, startWidth + (moveEvent.clientX - startX))));
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
  };

  // Safe Console Interceptor, Command Exec, & DOM Inspector Interceptor
  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.data?.type === 'iframe-console') {
        const { logType, message } = event.data;
        const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
        
        setConsoleLogs(prev => [...prev, { 
          id: Date.now() + Math.random(), 
          type: logType, 
          message: safeMessage, 
          time: new Date().toLocaleTimeString() 
        }]);
        
        if (logType === 'error' && isAutoSolveEnabled && agentStatus !== 'thinking' && agentStatus !== 'fixing') {
          handleAutoSolve(safeMessage);
        }
      }
      
      // NEW: Intercept DOM Element Clicks from Inspector Mode
      if (event.data?.type === 'element-selected') {
        setTargetedElement({
          tag: event.data.tag,
          html: event.data.html
        });
        setIsInspectorActive(false); // Turn off after click
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [isAutoSolveEnabled, agentStatus, generatedCode, messages]);

  // NEW: Toggle Inspector Mode inside iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'toggle-inspector', active: isInspectorActive }, '*');
    }
  }, [isInspectorActive]);

  const handleConsoleCommand = (e) => {
    e.preventDefault();
    if (!consoleInput.trim() || !iframeRef.current) return;
    
    setConsoleLogs(prev => [...prev, { id: Date.now(), type: 'all', message: `> ${consoleInput}`, time: new Date().toLocaleTimeString() }]);
    iframeRef.current.contentWindow.postMessage({ type: 'eval-cmd', code: consoleInput }, '*');
    setConsoleInput('');
  };

  const updateCode = (newCode) => {
    setGeneratedCode(newCode);
    const newHistory = codeHistory.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    setCodeHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setConsoleLogs([]); 
  };

  const handleUndo = () => {
    if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setGeneratedCode(codeHistory[historyIndex - 1]); }
  };

  const handleRedo = () => {
    if (historyIndex < codeHistory.length - 1) { setHistoryIndex(historyIndex + 1); setGeneratedCode(codeHistory[historyIndex + 1]); }
  };

  const restoreHistory = (idx) => {
    setHistoryIndex(idx);
    setGeneratedCode(codeHistory[idx]);
    setIsHistoryOpen(false);
    setIsDiffOpen(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareLink = () => {
    const encoded = btoa(encodeURIComponent(generatedCode));
    const url = `${window.location.origin}${window.location.pathname}#code=${encoded}`;
    navigator.clipboard.writeText(url);
    alert("Shareable Snapshot Link copied to clipboard!");
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas_app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToZip = async (format = 'html') => {
    setIsLoading(true);
    try {
        if (!window.JSZip) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        const zip = new window.JSZip();
        
        if (format === 'vite') {
            zip.file("package.json", JSON.stringify({
              name: "omni-vite-project", version: "1.0.0", type: "module",
              scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
              devDependencies: { vite: "^4.4.5" }
            }, null, 2));
            zip.file("vite.config.js", `import { defineConfig } from 'vite';\nexport default defineConfig({});`);
            zip.file("index.html", generatedCode); 
        } else {
            let html = generatedCode;
            let css = ''; let js = ''; let hasCss = false; let hasJs = false;

            html = html.replace(/<style>([\s\S]*?)<\/style>/gi, (match, content) => {
                css += content + '\n';
                if (!hasCss) { hasCss = true; return '<link rel="stylesheet" href="style.css">'; }
                return ''; 
            });

            html = html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, content) => {
                if (attrs.includes('src=')) return match;
                if (content.includes('iframe-console') || content.includes('window.ENV') || content.includes('__inspectorMode')) return match;
                js += content + '\n';
                if (!hasJs) { hasJs = true; return '<script src="script.js"></script>'; }
                return '';
            });

            zip.file("index.html", html);
            if (css.trim()) zip.file("style.css", css);
            if (js.trim()) zip.file("script.js", js);
        }

        const content = await zip.generateAsync({type:"blob"});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = format === 'vite' ? 'omni_vite_project.zip' : 'omni_project.zip';
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        alert("Failed to export ZIP: " + e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const exportToCodePen = () => {
    const data = { title: "Omni-Sandbox Export", html: generatedCode };
    const JSONstring = JSON.stringify(data).replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = 'data'; input.value = JSONstring;
    form.appendChild(input); document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  };

  const exportChatHistory = () => {
    let md = "# Omni-Sandbox Chat History\n\n";
    messages.forEach(m => {
      const role = m.role === 'user' ? '👤 User' : '🤖 Omni-Agent';
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : 'Unknown Time';
      md += `### ${role} - ${time}\n\n${m.text}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `omni_chat_${new Date().getTime()}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleNewChat = () => {
    setMessages([]); setGeneratedCode(DEFAULT_CODE); setCodeHistory([DEFAULT_CODE]);
    setHistoryIndex(0); setCurrentSessionId(Date.now().toString()); setConsoleLogs([]);
    setAgentStatus('idle'); setActiveTab('chat');
  };

  const loadSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages || []);
      setGeneratedCode(session.generatedCode || DEFAULT_CODE);
      setCodeHistory(session.codeHistory || [session.generatedCode || DEFAULT_CODE]);
      setHistoryIndex((session.codeHistory?.length || 1) - 1);
      setCurrentSessionId(session.id);
      setIsSessionsModalOpen(false); setConsoleLogs([]);
    }
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    const nextSessions = sessions.filter(s => s.id !== id);
    setSessions(nextSessions);
    localStorage.setItem('omni_chat_sessions', JSON.stringify(nextSessions));
    if (id === currentSessionId) handleNewChat();
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the current chat? (Note: It will be removed from your sessions history)')) {
      deleteSession(currentSessionId, { stopPropagation: () => {} });
    }
  };

  const handleEditMessage = (index) => {
    const msgToEdit = messages[index];
    setInput(msgToEdit.text);
    if (msgToEdit.image) setChatImage(msgToEdit.image);
    setMessages(prev => prev.slice(0, index));
  };

  const handleChatImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setChatImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleAssetUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setAssets(prev => [...prev, { name: file.name, base64: event.target.result }]); };
    reader.readAsDataURL(file);
  };

  // NPM Search Handlers
  const searchNPM = async (e) => {
    e.preventDefault();
    if (!npmSearchQuery.trim()) return;
    setIsSearchingNpm(true);
    try {
      const res = await fetch(`https://api.cdnjs.com/libraries?search=${encodeURIComponent(npmSearchQuery)}&limit=10&fields=version,description`);
      const data = await res.json();
      setNpmSearchResults(data.results || []);
    } catch(err) {
      alert("NPM Search Failed: " + err.message);
    } finally {
      setIsSearchingNpm(false);
    }
  };

  const toggleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition is not supported in your browser.");
    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; recognition.interimResults = true;
      let finalTranscript = '';
      recognition.onresult = (event) => {
        finalTranscript = Array.from(event.results).map(res => res[0].transcript).join('');
        setInput(prev => prev.trim() + ' ' + finalTranscript);
      };
      recognition.onend = () => {
        setIsListening(false);
        // Voice Auto Submit Feature
        if (isVoiceAutoSubmit && finalTranscript.trim() !== '') {
          submitPrompt(finalTranscript); 
        }
      };
      recognition.start(); setIsListening(true);
    }
  };

  const highlightHTML = (code) => {
    if (!code) return '';
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
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
  };

  // NEW: Code Selection Highlighting logic
  const handleEditorSelect = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    if (start !== end) {
       setSelectedCodeContext(e.target.value.substring(start, end));
    } else {
       setSelectedCodeContext('');
    }
  };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleDownloadCode(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart; const end = e.target.selectionEnd; const val = e.target.value;
      const newCode = val.substring(0, start) + "  " + val.substring(end);
      setGeneratedCode(newCode);
      setTimeout(() => { if (editorRef.current) { editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2; } }, 0);
    }
  };

  const extractCode = (text) => {
    const regex = new RegExp('\`\`\`(?:html|javascript|js|css)?\\n([\\s\\S]*?)\`\`\`');
    const match = text.match(regex);
    return match ? match[1] : text;
  };

  const callAIAPI = async (chatHistory, newPrompt, isFix = false, imageObj = null) => {
    let retries = 1; 
    let delay = 1000;
    let historyToSend = chatHistory.filter(m => m.role !== 'system');
    if (maxContext > 0 && historyToSend.length > maxContext) historyToSend = historyToSend.slice(-maxContext);
    
    // Inject Active Contexts (DOM Inspector & Selected Code) into the prompt secretly
    let augmentedPrompt = newPrompt;
    if (targetedElement) {
        augmentedPrompt += `\n\n[SYSTEM CONTEXT - The user has pointed an inspector at this specific DOM element on the page. Focus your changes here]:\n\`\`\`html\n${targetedElement.html}\n\`\`\``;
    }
    if (selectedCodeContext) {
        augmentedPrompt += `\n\n[SYSTEM CONTEXT - The user has highlighted this specific block of code in the editor. Focus your changes here]:\n\`\`\`\n${selectedCodeContext}\n\`\`\``;
    }
    
    while (retries > 0) {
      try {
        const activeModelName = selectedModel === 'custom' ? customModelInput : selectedModel;
        if (!activeModelName) throw new Error("Please select or specify a model.");

        if (apiProvider === 'gemini') {
          const effectiveKey = userApiKey || apiKey;
          if (!effectiveKey) throw new Error("No API Key found in Settings.");

          const baseUrl = geminiBaseUrl || 'https://generativelanguage.googleapis.com';
          const url = `${baseUrl.replace(/\/$/, '')}/v1beta/models/${activeModelName}:generateContent?key=${effectiveKey}`;
          
          const contents = historyToSend.map(m => {
            const parts = [{ text: m.text }];
            if (m.image) {
              const mimeType = m.image.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
              const base64Data = m.image.split(',')[1];
              parts.push({ inlineData: { mimeType, data: base64Data } });
            }
            return { role: m.role === 'model' ? 'model' : 'user', parts };
          });

          if (augmentedPrompt) {
            const parts = [{ text: augmentedPrompt }];
            if (imageObj) {
              const mimeType = imageObj.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
              const base64Data = imageObj.split(',')[1];
              parts.push({ inlineData: { mimeType, data: base64Data } });
            }
            contents.push({ role: 'user', parts });
          }

          const payload = { contents, systemInstruction: { parts: [{ text: customSystemPrompt }] } };
          
          let response;
          try {
            response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          } catch(netErr) {
            throw new Error(`Network Error: Failed to reach Google Gemini API. Details: ${netErr.message}`);
          }
          
          const textResponse = await response.text();
          let data;
          try {
              data = JSON.parse(textResponse);
          } catch(e) {
              throw new Error(`Gemini API returned an invalid JSON response (Status ${response.status}). Details: \n\n${textResponse.substring(0, 150)}...`);
          }

          if (!response.ok) { 
            throw new Error(data.error?.message || "Gemini API Error"); 
          }
          
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
        } else {
          // --- LONGCAT & OLLAMA ROUTER ---
          const isOllama = apiProvider === 'ollama';
          let primaryUrl = isOllama ? (ollamaUrl || 'http://localhost:11434/api/chat') : (longcatBaseUrl || 'https://api.longcat.chat/openai/v1/chat/completions');
          
          if (!isOllama && !primaryUrl.includes('/chat/completions')) {
            primaryUrl = primaryUrl.replace(/\/$/, '') + '/chat/completions';
          }

          const headers = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          
          if (!isOllama) {
             if (!longcatApiKey) throw new Error("No Longcat API Key found in Settings.");
             headers['Authorization'] = `Bearer ${longcatApiKey}`;
          }

          const formattedMessages = [];
          const isOmni = activeModelName.toLowerCase().includes('omni') || activeModelName.toLowerCase().includes('vision');
          
          let sysPrompt = customSystemPrompt?.trim() || "";
          
          if (sysPrompt && !isOmni) {
            formattedMessages.push({ role: 'system', content: sysPrompt });
            sysPrompt = "";
          }
          
          historyToSend.forEach((m, idx) => {
            let msgText = m.text?.trim() || "";
            
            if (sysPrompt && idx === 0) {
                msgText = `[System Instructions: ${sysPrompt}]\n\n` + msgText;
                sysPrompt = "";
            }

            if (isOmni) {
              const contentArray = [{ type: "text", text: msgText || "Attached context." }];
              if (m.image) {
                  contentArray.push({ type: "image_url", image_url: { url: m.image } });
              }
              formattedMessages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: contentArray });
            } else {
              if (msgText) {
                  formattedMessages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: msgText });
              }
            }
          });
          
          let finalPrompt = augmentedPrompt?.trim() || '';
          if (sysPrompt && formattedMessages.length === 0) {
              finalPrompt = `[System Instructions: ${sysPrompt}]\n\n` + finalPrompt;
          }
          
          if (isOmni) {
            const contentArray = [{ type: "text", text: finalPrompt || "Analyze this." }];
            if (imageObj) {
                contentArray.push({ type: "image_url", image_url: { url: imageObj } });
            }
            formattedMessages.push({ role: 'user', content: contentArray });
          } else {
            if (finalPrompt) {
                formattedMessages.push({ role: 'user', content: finalPrompt });
            }
          }

          const payload = { 
            model: activeModelName, 
            messages: formattedMessages
          };

          const attemptFetch = async (urlToTry) => {
            let response;
            try {
               response = await fetch(urlToTry, { method: 'POST', headers, body: JSON.stringify(payload) });
            } catch(netErr) {
               throw new Error(`NETWORK_FAIL: ${urlToTry} -> ${netErr.message}`);
            }
            
            const textResponse = await response.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                throw new Error(`JSON_PARSE_FAIL: The proxy returned an HTML Error Page instead of JSON (Status ${response.status}). \n\nRaw Response:\n${textResponse.substring(0, 300)}...`);
            }

            if (!response.ok) {
              let errorMsg = data.error?.message || data.message || `Request failed (${response.status})`;
              if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg); 
              throw new Error(String(errorMsg));
            }
            
            let aiResponseText = isOllama ? (data.message?.content || "") : (data.choices?.[0]?.message?.content || "");
            return String(aiResponseText);
          };

          try {
             return await attemptFetch(primaryUrl);
          } catch (err) {
             if (!isOllama && typeof longcatFallbackUrl !== 'undefined' && longcatFallbackUrl && longcatFallbackUrl.trim() !== '' && (err.message.includes('NETWORK_FAIL') || err.message.includes('JSON_PARSE_FAIL'))) {
                 let fallback = longcatFallbackUrl;
                 if (!fallback.includes('/chat/completions')) {
                     fallback = fallback.replace(/\/$/, '') + '/chat/completions';
                 }
                 try {
                     return await attemptFetch(fallback);
                 } catch (fallbackErr) {
                     throw new Error(`Both Primary and Fallback URLs failed.\n\nPrimary: ${err.message}\n\nFallback: ${fallbackErr.message}`);
                 }
             }
             
             if (err.message.includes('NETWORK_FAIL')) {
                 throw new Error(`Network Error: Unreachable endpoint. Check CORS or URL.\n\nDetails: ${err.message}`);
             }
             if (err.message.includes('JSON_PARSE_FAIL')) {
                 throw new Error(`Proxy Error: The server returned HTML instead of JSON. The proxy might be down, rejecting the model name, or blocking CORS.\n\nDetails: ${err.message}`);
             }
             
             throw err;
          }
        }
      } catch (error) {
        retries--;
        if (retries === 0) throw new Error(String(error.message));
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };

  const submitPrompt = async (text, activeImage = null) => {
    if (!text.trim() || isLoading) return;
    setInput(''); setShowSnippets(false); setChatImage(null);
    setTargetedElement(null); setSelectedCodeContext(''); // Clear contexts on send
    
    setMessages(prev => [...prev, { role: 'user', text: text, image: activeImage, timestamp: new Date().toISOString() }]);
    setIsLoading(true); setAgentStatus('thinking');

    try {
      const responseText = await callAIAPI(messages, text, false, activeImage);
      const code = extractCode(responseText);
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date().toISOString() }]);
      
      if (code && (code.includes('<html') || code.includes('<div') || code.includes('<body'))) updateCode(code);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: `❌ **Error:** ${error.message}` }]);
    } finally {
      setIsLoading(false); setAgentStatus('idle');
    }
  };

  const handleSendMessage = (e) => { e?.preventDefault(); submitPrompt(input.trim(), chatImage); };

  const handleAutoSolve = async (errorMessage) => {
    setAgentStatus('fixing'); setIsLoading(true);
    const backticks = '\`\`\`';
    const fixPrompt = `⚠️ AGENTIC LOOP ACTIVATED ⚠️\nThe code you just generated threw this error in the console:\n${backticks}\n${errorMessage}\n${backticks}\n\nPlease fix the bug and return the COMPLETE, working HTML file.`;
    setMessages(prev => [...prev, { role: 'user', text: fixPrompt, isAutoGenerated: true, timestamp: new Date().toISOString() }]);

    try {
      const responseText = await callAIAPI(messages, fixPrompt, true);
      const newCode = extractCode(responseText);
      setMessages(prev => [...prev, { role: 'model', text: `✅ **Agentic Fix Applied:** I found the issue and updated the Canvas File. It should run smoothly now.\n\n` + responseText, isAutoGenerated: true, timestamp: new Date().toISOString() }]);
      if (newCode) updateCode(newCode);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: `❌ **Auto-Solve Failed:** ${error.message}` }]);
    } finally {
      setIsLoading(false); setAgentStatus('idle');
    }
  };

  const handleAgentAction = async (actionType) => {
    if (isLoading) return;
    setIsLoading(true); setAgentStatus('thinking');
    let actionPrompt = ""; let statusMessage = "";

    if (actionType === 'polish') {
      actionPrompt = `✨ AGENTIC ACTION ACTIVATED ✨\nPlease analyze the following Canvas File. Refactor it to improve performance, clean up the logic, add helpful comments, and ensure best coding practices. Return ONLY the COMPLETE, fully-functional HTML file.\n\nCURRENT CODE:\n\`\`\`html\n${generatedCode}\n\`\`\``;
      statusMessage = "✨ Agentic Action: Refactoring and optimizing the codebase...";
    } else if (actionType === 'beautify') {
      actionPrompt = `🎨 AGENTIC ACTION ACTIVATED 🎨\nPlease analyze the following Canvas File and significantly upgrade its UI/UX. Use modern Tailwind CSS classes to add beautiful color palettes, spacing, rounded corners, transitions, and shadows. Make it look like a premium, modern web application. Do not remove any existing functionality. Return ONLY the COMPLETE, fully-functional HTML file.\n\nCURRENT CODE:\n\`\`\`html\n${generatedCode}\n\`\`\``;
      statusMessage = "🎨 Agentic Action: Upgrading the UI/UX design to premium...";
    } else if (actionType === 'explain') {
      actionPrompt = `🧠 AGENTIC ACTION ACTIVATED 🧠\nPlease provide a clear, concise, and educational explanation of how the following code works. Break down the structure, styling, and logic. Do NOT write new code, just explain the existing code in conversational Markdown.\n\nCURRENT CODE:\n\`\`\`html\n${generatedCode}\n\`\`\``;
      statusMessage = "🧠 Agentic Action: Analyzing and explaining the code...";
    } else if (actionType === 'bootstrap') {
      actionPrompt = `🚀 AGENTIC ACTION ACTIVATED 🚀\nPlease automatically build a complete, modern Canvas File boilerplate from scratch. It should include a stunning layout with Tailwind CSS, a centered glassmorphism container, a beautiful animated gradient background, and a pulsing placeholder element. Output ONLY the complete, fully functioning HTML file. This will be the user's foundation.`;
      statusMessage = "🚀 Agentic Action: Auto-bootstrapping a stunning Canvas File foundation...";
    } else if (actionType === 'auto-improve') {
      actionPrompt = `👁️ AGENTIC QA ACTIVATED 👁️\nAct as a rigorous UI/UX QA Tester and Senior Engineer. Mentally 'render' this Canvas File and look for visual flaws, clunky UX, missing hover/focus animations, poor color contrast, or bad mobile responsiveness. Fix ALL identified issues to make it 'Gemini Canvas' premium quality. Add smooth UI transitions and ensure flawless responsive behavior. Return ONLY the completely upgraded HTML file in a single \`\`\`html block.\n\nCURRENT CODE:\n\`\`\`html\n${generatedCode}\n\`\`\``;
      statusMessage = "👁️ Agentic Action: Mentally reviewing live preview output and applying premium Gemini Canvas level upgrades...";
    }

    setMessages(prev => [...prev, { role: 'user', text: statusMessage, isAutoGenerated: true, timestamp: new Date().toISOString() }]);

    try {
      const responseText = await callAIAPI(messages, actionPrompt, true);
      const newCode = extractCode(responseText);
      let successMessage = actionType === 'explain' ? `🧠 **Code Explanation:**\n\n${responseText}` : `✅ **Agentic Action Complete:** I have successfully upgraded the Canvas File based on the review.\n\n`;
      setMessages(prev => [...prev, { role: 'model', text: successMessage, isAutoGenerated: true, timestamp: new Date().toISOString() }]);
      if (actionType !== 'explain' && newCode) updateCode(newCode);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: `❌ **Agentic Action Failed:** ${error.message}` }]);
    } finally {
      setIsLoading(false); setAgentStatus('idle');
    }
  };

  // API Mocks Save Handler
  const saveMocks = (mocks) => {
    setMockEndpoints(mocks);
    localStorage.setItem('omni_api_mocks', JSON.stringify(mocks));
  };

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
        
        // Command Line Eval Receiver
        window.addEventListener('message', (e) => {
           if (e.data?.type === 'eval-cmd') {
               try { 
                   let res = eval(e.data.code); 
                   console.log(res); 
               } catch(err) { 
                   console.error(String(err)); 
               }
           }
           
           // Toggle DOM Inspector
           if (e.data?.type === 'toggle-inspector') {
               window.__inspectorMode = e.data.active;
               if(window.__inspectorMode) {
                   document.body.style.cursor = 'crosshair';
               } else {
                   document.body.style.cursor = 'default';
                   // remove all outlines
                   document.querySelectorAll('*').forEach(el => el.style.outline = '');
               }
           }
        });

        // DOM Inspector Hover Logic
        document.addEventListener('mouseover', (e) => {
           if (!window.__inspectorMode || e.target === document.body || e.target === document.documentElement) return;
           e.target.style.outline = '2px dashed #6366f1';
           e.target.style.outlineOffset = '2px';
        });
        document.addEventListener('mouseout', (e) => {
           if (!window.__inspectorMode || e.target === document.body || e.target === document.documentElement) return;
           e.target.style.outline = '';
        });
        document.addEventListener('click', (e) => {
           if (!window.__inspectorMode || e.target === document.body || e.target === document.documentElement) return;
           e.preventDefault();
           e.stopPropagation();
           e.target.style.outline = '';
           document.body.style.cursor = 'default';
           window.__inspectorMode = false;
           // Extract Element Context securely
           let htmlString = e.target.outerHTML;
           if(htmlString.length > 2000) htmlString = htmlString.substring(0, 2000) + '... [TRUNCATED]';
           window.parent.postMessage({ type: 'element-selected', tag: e.target.tagName, html: htmlString }, '*');
        }, true); // Use capture phase to intercept

        // Advanced Fetch Interceptor for Mocks
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          const urlStr = String(args[0]);
          const mockMatch = mockData.find(m => urlStr.includes(m.path));
          
          if (mockMatch) {
             postLog('network', ['[MOCKED FETCH]', urlStr]);
             return Promise.resolve(new Response(mockMatch.response, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
             }));
          }

          postLog('network', ['[FETCH Request]', urlStr]);
          try { 
            const response = await origFetch.apply(this, args); 
            postLog('network', ['[FETCH Response]', response.status, response.url]); 
            return response; 
          } catch(e) { 
            postLog('error', ['[FETCH Error]', e.message]); 
            throw e; 
          }
        };
      </script>
    `;
    const envScript = `<script>window.ENV = ${sandboxEnv || '{}'};</script>`;
    const darkModeScript = isPreviewDark ? `<script>document.documentElement.classList.add('dark'); document.body.style.backgroundColor = '#111827'; document.body.style.color = '#f8fafc';</script>` : '';
    
    let doc = generatedCode.replace('<head>', `<head>\n${envScript}\n${injectionScript}`);
    if (doc.includes('</body>')) doc = doc.replace('</body>', `${darkModeScript}</body>`);
    else doc += darkModeScript;
    return doc;
  };

  const injectComponent = (htmlSnippet) => {
    let newCode = generatedCode;
    if (newCode.includes('</body>')) newCode = newCode.replace('</body>', `\n${htmlSnippet}\n</body>`);
    else newCode += `\n${htmlSnippet}`;
    updateCode(newCode); setIsComponentsOpen(false);
  };

  const injectPackage = (tag) => {
    let newCode = generatedCode;
    if (newCode.includes('</head>')) newCode = newCode.replace('</head>', `  ${tag}\n</head>`);
    else newCode = `${tag}\n${newCode}`;
    updateCode(newCode); setIsPackagesOpen(false);
  };

  const popularPackages = [
    { name: 'Tailwind CSS', desc: 'Utility-first CSS framework', tag: '<script src="https://cdn.tailwindcss.com"></script>' },
    { name: 'React + ReactDOM', desc: 'UI Library (UMD Build)', tag: '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' },
    { name: 'Three.js', desc: '3D Javascript Library', tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' },
    { name: 'GSAP', desc: 'Professional Animation Library', tag: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>' },
    { name: 'FontAwesome', desc: 'Icon set and toolkit', tag: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' }
  ];

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
    { icon: '🐍', label: 'Snake Game', prompt: 'Build a fully playable classic Snake game using HTML Canvas and Javascript. Add a score counter and game over screen.' },
    { icon: '📝', label: 'Todo App', prompt: 'Create a beautiful, modern Todo List application using Tailwind CSS. Allow adding, completing, and deleting tasks. Use local storage.' },
    { icon: '🌦️', label: 'Weather UI', prompt: 'Design a sleek, modern Weather Dashboard UI. Use mock data for a 7-day forecast and current conditions. Use smooth gradients.' },
    { icon: '📊', label: 'Dashboard', prompt: 'Build an admin dashboard layout with a sidebar navigation, a top header, and mock charts using a CDN library like Chart.js.' }
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      {!isZenMode && (
        <aside className="w-16 lg:w-20 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-6 gap-6 z-20 shrink-0 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mt-2">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <nav className="flex flex-col gap-4 mt-4 w-full px-2">
            <button onClick={() => setActiveTab('chat')} className={`p-3 rounded-xl flex justify-center transition-all ${activeTab === 'chat' ? 'bg-gray-800 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`} title="Chat"><MessageSquare className="w-6 h-6" /></button>
            <button onClick={() => setIsSessionsModalOpen(true)} className="p-3 rounded-xl flex justify-center lg:hidden transition-all text-gray-500 hover:text-gray-300 hover:bg-gray-800/50" title="Chat History"><FolderOpen className="w-6 h-6" /></button>
            <button onClick={() => setActiveTab('code')} className={`p-3 rounded-xl flex justify-center lg:hidden transition-all ${activeTab === 'code' ? 'bg-gray-800 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`} title="Code"><Code2 className="w-6 h-6" /></button>
            <button onClick={() => setActiveTab('preview')} className={`p-3 rounded-xl flex justify-center lg:hidden transition-all ${activeTab === 'preview' ? 'bg-gray-800 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`} title="Preview"><Play className="w-6 h-6" /></button>
            
            <div className="w-8 h-px bg-gray-800 mx-auto my-2"></div>
            <button onClick={() => setIsMocksOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Local API Mocks Dashboard"><Database className="w-6 h-6" /></button>
          </nav>
          <div className="mt-auto flex flex-col gap-4 w-full px-2">
            <button onClick={() => setIsSessionsModalOpen(true)} className="p-3 rounded-xl hidden lg:flex flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Chat History"><FolderOpen className="w-6 h-6" /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-xl flex justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-all" title="Key Vault & Settings"><Settings className="w-6 h-6" /></button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
        
        {/* Chat Panel */}
        <div style={{ width: (!isZenMode && typeof window !== 'undefined' && window.innerWidth >= 1024) ? chatWidth : '100%' }} className={`flex-col bg-gray-900/50 border-r border-gray-800 h-full shrink-0 transition-all duration-300 ${activeTab === 'chat' && !isZenMode ? 'flex' : 'hidden lg:flex'} ${isZenMode ? '!hidden' : ''}`}>
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur z-10">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                Omni Agent {agentStatus === 'thinking' && <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}{agentStatus === 'fixing' && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
              </h2>
              <p className="text-xs text-gray-500">BYOK Unlimited Context Engine</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleNewChat} className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Start New Chat"><MessageSquarePlus className="w-4 h-4" /></button>
              <button onClick={handleClearChat} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Current Session"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setIsAutoSolveEnabled(!isAutoSolveEnabled)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isAutoSolveEnabled ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`} title="Autonomously fix runtime errors"><Zap className="w-3.5 h-3.5" /> Auto-Solve</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-2"><Sparkles className="w-8 h-8 text-indigo-400" /></div>
                <div><h3 className="text-xl font-semibold text-gray-200">Welcome to Omni-Sandbox</h3><p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">What would you like to build today?</p></div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-4">
                  {templates.map((t, i) => (
                    <button key={i} onClick={() => submitPrompt(t.prompt)} className="p-3 text-left rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-indigo-500/50 transition-all flex flex-col gap-2 group">
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
                    {msg.image && <div className="mb-3"><img src={msg.image} alt="Context" className="max-w-full h-auto max-h-48 object-cover rounded-lg border border-gray-700" /></div>}
                    <div className="whitespace-pre-wrap break-words">
                      {String(msg.text).split('```').map((chunk, i) => {
                        if (i % 2 !== 0) {
                          if (msg.role === 'model' && (chunk.startsWith('html') || chunk.includes('<html') || chunk.includes('<div'))) {
                            return (
                              <div key={i} className="mt-3 mb-2 bg-[#1e1e20] border border-[#333538] rounded-[1.25rem] p-3 flex items-center justify-between w-full min-w-[280px] max-w-sm shadow-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="text-gray-400 bg-[#2b2d31] p-2 rounded-lg shrink-0"><Code2 className="w-5 h-5" /></div>
                                  <div className="flex flex-col text-left overflow-hidden"><span className="text-[13px] font-semibold text-gray-200 truncate tracking-wide">App Canvas</span><span className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">{msg.timestamp ? new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Just now'}</span></div>
                                </div>
                                <div className="flex items-center shrink-0 ml-2 gap-1">
                                  <button onClick={() => setActiveTab('code')} className="text-gray-400 hover:text-white font-medium text-xs px-3 py-1.5 transition-colors">View Code</button>
                                  <button onClick={() => setActiveTab('preview')} className="bg-[#a8c7fa] hover:bg-[#93b8f8] text-[#062e6f] font-medium text-xs px-4 py-1.5 rounded-full transition-colors">Open</button>
                                </div>
                              </div>
                            );
                          }
                          return <div key={i} className="mt-2 mb-2 bg-gray-950 rounded-lg p-3 overflow-x-auto text-xs font-mono text-gray-300 border border-gray-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{chunk.replace(/^(html|javascript|css|js)\n/, '')}</div>;
                        }
                        return chunk.split('**').map((textChunk, j) => j % 2 !== 0 ? <strong key={j} className="text-white font-semibold">{textChunk}</strong> : textChunk);
                      })}
                    </div>
                  </div>
                  {msg.role === 'user' && !msg.isAutoGenerated && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-gray-300" /></div>}
                </div>
              ))
            )}
            {agentStatus !== 'idle' && <div className="flex items-center gap-3 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /><span>{agentStatus === 'thinking' ? 'Writing code...' : 'Autonomously fixing errors...'}</span></div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-gray-900 border-t border-gray-800 z-10 flex flex-col gap-2">
            
            {/* Context Modifiers UI */}
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

            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 shadow-sm max-w-full sm:max-w-fit">
                <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <select value={selectedModel} onChange={(e) => saveSetting('omni_selected_model', e.target.value, setSelectedModel)} className="bg-transparent text-xs font-medium text-gray-300 focus:outline-none cursor-pointer appearance-none outline-none pr-4">
                  {getModelOptions().map(opt => <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-300">{opt.label}</option>)}
                </select>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0 rotate-90 -ml-2" />
              </div>
              
              <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 shadow-sm max-w-full sm:max-w-fit">
                <User className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <select value={activePersona} onChange={(e) => { saveSetting('omni_active_persona', e.target.value, setActivePersona); setCustomSystemPrompt(PERSONAS[e.target.value]); }} className="bg-transparent text-xs font-medium text-gray-300 focus:outline-none cursor-pointer appearance-none outline-none pr-4">
                  <option value="default" className="bg-gray-900 text-gray-300">Default Agent</option>
                  <option value="tailwind" className="bg-gray-900 text-gray-300">Tailwind Pro</option>
                  <option value="gamedev" className="bg-gray-900 text-gray-300">Game Developer</option>
                  <option value="datascientist" className="bg-gray-900 text-gray-300">Data Scientist</option>
                </select>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0 rotate-90 -ml-2" />
              </div>

              {selectedModel === 'custom' && (
                <input type="text" value={customModelInput} onChange={(e) => saveSetting('omni_custom_model_input', e.target.value, setCustomModelInput)} placeholder="e.g., gemini-exp-1234" className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-indigo-500 w-full sm:w-48 shadow-sm" />
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="relative mt-1">
              {chatImage && (
                <div className="absolute bottom-full mb-2 left-0 p-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl flex items-center gap-2 animate-in fade-in">
                  <img src={chatImage} alt="Upload preview" className="h-16 w-16 object-cover rounded-lg border border-gray-600" />
                  <button type="button" onClick={() => setChatImage(null)} className="p-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-md transition-colors"><X className="w-4 h-4"/></button>
                </div>
              )}
              {showSnippets && (
                <div className="absolute bottom-full mb-3 left-0 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2 z-20 animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-xs text-gray-400 mb-2 px-2 font-semibold uppercase tracking-wider">Quick Prompts</div>
                  <div className="space-y-1">
                    {quickSnippets.map((s, i) => <button key={i} type="button" onClick={() => {setInput(s); setShowSnippets(false);}} className="text-left w-full p-2.5 text-xs text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition-colors truncate">{s}</button>)}
                  </div>
                </div>
              )}
              
              <div className="absolute left-2 top-2 bottom-2 flex items-center gap-0.5">
                 <button type="button" onClick={() => document.getElementById('chat-image-upload').click()} className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors rounded-lg" title="Upload Image Context"><ImagePlus className="w-4 h-4" /></button>
                 <button type="button" onClick={toggleListen} className={`p-1.5 transition-colors rounded-lg ${isListening ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-gray-500 hover:text-indigo-400'}`} title="Voice Dictation"><Mic className="w-4 h-4" /></button>
                 <input type="file" id="chat-image-upload" accept="image/*" className="hidden" onChange={handleChatImageUpload} />
              </div>

              <textarea
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                placeholder="Describe what to build..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-[4.5rem] pr-12 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-[60px] max-h-[200px]"
                disabled={isLoading}
              />
              
              <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                <button type="button" onClick={() => setShowSnippets(!showSnippets)} className={`p-1.5 transition-colors rounded-lg ${showSnippets ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400'}`} title="Prompt Snippets"><Bookmark className="w-4 h-4" /></button>
                <button type="submit" disabled={!input.trim() || isLoading} className="aspect-square h-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 flex items-center justify-center transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </form>
          </div>
        </div>

        {!isZenMode && <div onMouseDown={startChatDrag} className="hidden lg:flex w-1 bg-transparent hover:bg-indigo-500 cursor-col-resize shrink-0 z-30 transition-colors relative -ml-[1px]" />}

        {/* Workspace Area */}
        <div className={`flex-1 flex-col h-full bg-[#0d1117] ${activeTab !== 'chat' || isZenMode ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 flex flex-col xl:flex-row h-full min-h-0">
            
            {/* Live Editable Code View (With Syntax Highlighting) */}
            <div style={{ width: (typeof window !== 'undefined' && window.innerWidth >= 1280 && !isZenMode) ? codeWidth : '100%' }} className={`flex-col border-r border-gray-800 h-full shrink-0 ${activeTab === 'code' ? 'flex' : 'hidden xl:flex'}`}>
              <div className="h-12 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-4 text-sm font-medium text-gray-400 shrink-0 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsZenMode(!isZenMode)} className="p-1.5 mr-1 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Toggle Zen Mode">{isZenMode ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}</button>
                  <Terminal className="w-4 h-4" />
                  <span>app_canvas.html</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => setIsAssetsOpen(true)} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors flex items-center gap-1" title="Manage Assets"><ImageIcon className="w-4 h-4" /> <span className="text-xs hidden xl:inline">Assets</span></button>
                  <button onClick={() => setIsPackagesOpen(true)} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors flex items-center gap-1" title="Inject CDNs"><Package className="w-4 h-4" /> <span className="text-xs hidden xl:inline">Packages</span></button>
                  <button onClick={() => setIsComponentsOpen(true)} className="p-1.5 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors flex items-center gap-1" title="Tailwind Blocks"><Blocks className="w-4 h-4" /> <span className="text-xs hidden xl:inline">Blocks</span></button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button onClick={() => setIsDiffOpen(true)} disabled={codeHistory.length < 2} className="p-1.5 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50" title="Compare Code Diff"><GitCompare className="w-4 h-4" /></button>
                  <button onClick={() => handleAgentAction('bootstrap')} disabled={isLoading} className="p-1.5 hover:text-green-400 hover:bg-green-500/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50" title="Agent: Bootstrap Canvas"><Rocket className="w-4 h-4" /></button>
                  <button onClick={() => handleAgentAction('auto-improve')} disabled={isLoading} className="p-1.5 hover:text-purple-400 hover:bg-purple-500/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50" title="Agent: Review & Improve UI"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleAgentAction('explain')} disabled={isLoading} className="p-1.5 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50" title="Agent: Explain Code"><Lightbulb className="w-4 h-4" /></button>
                  <button onClick={() => handleAgentAction('beautify')} disabled={isLoading} className="p-1.5 hover:text-pink-400 hover:bg-pink-500/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50" title="Agent: Beautify UI"><Paintbrush className="w-4 h-4" /></button>
                  <button onClick={() => handleAgentAction('polish')} disabled={isLoading} className="p-1.5 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50" title="Agent: Refactor & Polish"><Wand2 className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button onClick={handleUndo} disabled={historyIndex === 0} className="p-1.5 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-30" title="Undo"><Undo className="w-4 h-4" /></button>
                  <button onClick={handleRedo} disabled={historyIndex === codeHistory.length - 1} className="p-1.5 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-30 mr-1" title="Redo"><Redo className="w-4 h-4" /></button>
                  <button onClick={() => setIsHistoryOpen(true)} className="p-1.5 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Version History"><History className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-700 mx-1"></div>
                  <button onClick={handleCopyCode} className="p-1.5 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => exportToZip('vite')} className="p-1.5 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Export as Vite/React App"><FileArchive className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 relative bg-[#0d1117] overflow-hidden group">
                <pre 
                  ref={highlightRef}
                  className="absolute inset-0 w-full h-full p-4 font-mono text-xs md:text-sm text-[#e5e7eb] leading-relaxed bg-transparent whitespace-pre overflow-hidden pointer-events-none break-normal"
                  style={{ tabSize: 2 }}
                  dangerouslySetInnerHTML={{ __html: highlightHTML(generatedCode) }}
                />
                <textarea 
                  ref={editorRef}
                  value={generatedCode}
                  onChange={(e) => updateCode(e.target.value)}
                  onSelect={handleEditorSelect} // NEW: Selection Capturing
                  onKeyDown={handleEditorKeyDown}
                  onScroll={handleEditorScroll}
                  spellCheck="false"
                  className="absolute inset-0 w-full h-full p-4 font-mono text-xs md:text-sm text-transparent caret-white leading-relaxed bg-transparent resize-none focus:outline-none whitespace-pre overflow-auto break-normal selection:bg-indigo-500/30"
                  style={{ tabSize: 2 }}
                />
              </div>
            </div>

            <div onMouseDown={startCodeDrag} className="hidden xl:flex w-1 bg-transparent hover:bg-indigo-500 cursor-col-resize shrink-0 z-30 transition-colors relative -ml-[1px]" />

            {/* Live Preview View */}
            <div className={isFullscreen ? 'fixed inset-0 z-50 flex flex-col bg-[#0d1117]' : `flex-1 flex-col h-full min-w-0 ${activeTab === 'preview' || (activeTab === 'chat' && window.innerWidth >= 1024) ? 'flex' : 'hidden xl:flex'}`}>
              <div className="h-12 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-4 text-sm font-medium text-gray-400 shrink-0 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-400" />
                    <span className="hidden sm:inline">Live Canvas</span>
                  </div>
                  <div className="flex items-center bg-gray-950 rounded-lg p-0.5 border border-gray-800 hidden sm:flex">
                    <button onClick={() => { setViewport('mobile'); setIsLandscape(false); setFluidWidth(100); }} className={`p-1.5 rounded-md transition-colors ${viewport === 'mobile' ? 'bg-gray-800 text-white' : 'hover:text-white'}`} title="Mobile"><Smartphone className="w-4 h-4" /></button>
                    <button onClick={() => { setViewport('tablet'); setIsLandscape(false); setFluidWidth(100); }} className={`p-1.5 rounded-md transition-colors ${viewport === 'tablet' ? 'bg-gray-800 text-white' : 'hover:text-white'}`} title="Tablet"><TabletIcon className="w-4 h-4" /></button>
                    <button onClick={() => { setViewport('desktop'); setIsLandscape(false); setFluidWidth(100); }} className={`p-1.5 rounded-md transition-colors ${viewport === 'desktop' && fluidWidth === 100 ? 'bg-gray-800 text-white' : 'hover:text-white'}`} title="Desktop"><Monitor className="w-4 h-4" /></button>
                    {viewport !== 'desktop' && (
                      <button onClick={() => setIsLandscape(!isLandscape)} className={`p-1.5 ml-1 rounded-md transition-colors hover:text-white ${isLandscape ? 'text-indigo-400' : ''}`} title="Rotate Device"><RotateCcw className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                   {/* NEW DOM Inspector Toggle */}
                   <button onClick={() => setIsInspectorActive(!isInspectorActive)} className={`p-1.5 rounded-md transition-colors ${isInspectorActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'hover:text-indigo-400 hover:bg-indigo-500/10'}`} title="Point & Prompt DOM Inspector"><MousePointerClick className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1"></div>

                   {viewport === 'desktop' && (
                     <div className="flex items-center gap-2 mr-2 hidden lg:flex">
                        <span className="text-[10px] uppercase font-bold text-gray-600">Fluid Width</span>
                        <input type="range" min="30" max="100" value={fluidWidth} onChange={(e)=>setFluidWidth(e.target.value)} className="w-24 accent-indigo-500" />
                     </div>
                   )}
                   <button onClick={shareLink} className="p-1.5 rounded-md transition-colors hover:text-indigo-400 hover:bg-indigo-500/10" title="Share Snapshot Link"><Share className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1"></div>
                   
                   <button onClick={() => setPreviewZoom(z => Math.max(25, z - 25))} className="p-1.5 rounded-md transition-colors hover:text-white" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                   <span className="text-xs w-8 text-center font-mono">{previewZoom}%</span>
                   <button onClick={() => setPreviewZoom(z => Math.min(200, z + 25))} className="p-1.5 rounded-md transition-colors hover:text-white" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                   <div className="w-px h-4 bg-gray-700 mx-1"></div>
                   <button onClick={() => setIsPreviewDark(!isPreviewDark)} className={`hover:text-white transition-colors flex items-center p-1.5 rounded ${isPreviewDark ? 'bg-indigo-500/20 text-indigo-400' : ''}`} title="Toggle Dark Mode">{isPreviewDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</button>
                   <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className={`hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded ${isConsoleOpen ? 'bg-gray-800 text-white' : ''}`} title="Developer Console">
                     <TerminalSquare className="w-4 h-4" />{consoleLogs.length > 0 && <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 rounded-full">{consoleLogs.length}</span>}
                   </button>
                   <div className="w-px h-4 bg-gray-700 mx-1"></div>
                   <button onClick={() => setIframeKey(k => k + 1)} className="hover:text-red-400 transition-colors" title="Hard Reset"><Power className="w-4 h-4" /></button>
                   <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:text-white transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
                   <button onClick={() => iframeRef.current && (iframeRef.current.srcdoc = getSandboxDoc())} className="hover:text-white transition-colors" title="Reload"><RefreshCw className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div 
                className={`flex-1 bg-[#090b0f] relative flex justify-center overflow-auto items-start ${viewport !== 'desktop' ? 'pt-2 sm:pt-8' : ''}`}
                style={{ backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=")' }}
              >
                <div 
                  className={`bg-white transition-all duration-300 ease-in-out relative origin-top flex flex-col ${
                    viewport !== 'desktop' || fluidWidth < 100
                      ? 'rounded-[2.5rem] border-[14px] border-[#1a1b1e] overflow-hidden shrink-0 shadow-[0_0_0_2px_rgba(255,255,255,0.05)_inset,0_25px_50px_-12px_rgba(0,0,0,0.8)]' 
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
                  {(viewport === 'desktop' && fluidWidth === 100) && (
                    <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 w-full z-10 select-none">
                      <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm"/><div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm"/><div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm"/></div>
                      <div className="flex-1 flex justify-center px-4"><div className="bg-white border border-gray-200/60 rounded-md px-3 py-1 text-[11px] text-gray-500 font-mono w-full max-w-md text-center truncate shadow-sm flex items-center justify-center gap-2"><Lock className="w-3 h-3 text-gray-400" /> localhost:3000</div></div>
                      <div className="w-[52px]"></div>
                    </div>
                  )}
                  {viewport !== 'desktop' && !isLandscape && (
                    <div className="absolute top-2 inset-x-0 h-7 bg-black rounded-full w-28 mx-auto z-10 pointer-events-none flex items-center justify-end px-3 shadow-md border border-gray-800/80">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] border border-gray-800/50 relative overflow-hidden"><div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-blue-400/30 rounded-full blur-[1px]"/></div>
                    </div>
                  )}
                  {viewport !== 'desktop' && isLandscape && (
                    <div className="absolute left-2 inset-y-0 w-7 bg-black rounded-full h-28 my-auto z-10 pointer-events-none flex flex-col items-center justify-end py-3 shadow-md border border-gray-800/80">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] border border-gray-800/50 relative overflow-hidden"><div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-blue-400/30 rounded-full blur-[1px]"/></div>
                    </div>
                  )}
                  
                  <div className={`flex-1 relative bg-white w-full h-full ${isInspectorActive ? 'pointer-events-auto' : ''}`}>
                    <iframe key={iframeKey} ref={iframeRef} title="Preview" className="absolute inset-0 w-full h-full border-none bg-transparent z-0" sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin" srcDoc={getSandboxDoc()} />
                  </div>
                </div>
              </div>

              {isConsoleOpen && (
                <div className="h-64 bg-gray-950 border-t border-gray-800 flex flex-col shrink-0">
                  <div className="h-10 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-3 text-xs font-mono text-gray-400">
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
                  <form onSubmit={handleConsoleCommand} className="h-10 border-t border-gray-800 bg-gray-900 flex items-center px-3">
                     <span className="text-indigo-400 font-bold mr-2">{'>'}</span>
                     <input type="text" value={consoleInput} onChange={e => setConsoleInput(e.target.value)} placeholder="Enter JavaScript command to evaluate in sandbox..." className="flex-1 bg-transparent border-none text-xs font-mono text-gray-200 focus:outline-none" />
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* NEW: Chat Sessions / History Modal */}
      {isSessionsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FolderOpen className="w-5 h-5 text-indigo-400" /> Chat History</h3>
              <button onClick={() => setIsSessionsModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">No saved sessions yet.</p>
              ) : (
                sessions.map((session) => (
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
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
              <button onClick={() => { handleNewChat(); setIsSessionsModalOpen(false); }} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquarePlus className="w-4 h-4" /> Start New Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: API Mocking Dashboard Modal */}
      {isMocksOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Database className="w-5 h-5 text-indigo-400" /> Local API Mocking Dashboard</h3>
              <button onClick={() => setIsMocksOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-gray-400 mb-6">Define fake API endpoints here. The Omni-Sandbox will automatically intercept any `fetch()` calls matching these paths and return your mock JSON data. This allows you to build full-stack data apps with no real backend!</p>
              
              <div className="space-y-4">
                 {mockEndpoints.map((mock, index) => (
                    <div key={mock.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 relative group">
                       <button onClick={() => { const newMocks = [...mockEndpoints]; newMocks.splice(index, 1); saveMocks(newMocks); }} className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                       <div className="mb-3">
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Endpoint Path</label>
                         <input type="text" value={mock.path} onChange={e => { const newMocks = [...mockEndpoints]; newMocks[index].path = e.target.value; saveMocks(newMocks); }} placeholder="/api/users" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">JSON Response</label>
                         <textarea value={mock.response} onChange={e => { const newMocks = [...mockEndpoints]; newMocks[index].response = e.target.value; saveMocks(newMocks); }} placeholder='{"status": "ok"}' className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-indigo-500 h-24 resize-none" />
                       </div>
                    </div>
                 ))}
              </div>
              <button onClick={() => saveMocks([...mockEndpoints, { id: Date.now(), path: '/api/new', response: '{}' }])} className="w-full mt-4 py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                + Add New Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Code Diff Modal */}
      {isDiffOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><GitCompare className="w-5 h-5 text-indigo-400" /> Code Differences</h3>
              <button onClick={() => setIsDiffOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
               <div className="flex-1 border-r border-gray-800 flex flex-col">
                  <div className="bg-gray-950 p-2 text-center text-xs font-bold text-red-400 uppercase tracking-widest border-b border-gray-800">Previous Version</div>
                  <textarea readOnly value={codeHistory[historyIndex - 1] || ''} className="flex-1 p-4 bg-[#0d1117] text-gray-300 font-mono text-xs resize-none focus:outline-none opacity-80" />
               </div>
               <div className="flex-1 flex flex-col">
                  <div className="bg-gray-950 p-2 text-center text-xs font-bold text-green-400 uppercase tracking-widest border-b border-gray-800">Current Version</div>
                  <textarea readOnly value={generatedCode} className="flex-1 p-4 bg-[#0d1117] text-gray-100 font-mono text-xs resize-none focus:outline-none" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Version History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center"><h3 className="text-lg font-semibold flex items-center gap-2"><History className="w-5 h-5 text-indigo-400" /> Version History</h3><button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {codeHistory.map((_, i) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${historyIndex === i ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-gray-950 border-gray-800'}`}>
                  <div><h4 className={`font-medium text-sm ${historyIndex === i ? 'text-indigo-300' : 'text-gray-200'}`}>Version {i + 1}</h4><p className="text-xs text-gray-500">{historyIndex === i ? 'Currently Active' : 'Auto-Saved State'}</p></div>
                  <button onClick={() => restoreHistory(i)} disabled={historyIndex === i} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-30 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2">Restore</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Components Modal */}
      {isComponentsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center"><h3 className="text-lg font-semibold flex items-center gap-2"><Blocks className="w-5 h-5 text-indigo-400" /> Tailwind Blocks</h3><button onClick={() => setIsComponentsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {tailwindComponents.map((comp, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <h4 className="font-medium text-gray-200 text-sm">{comp.name}</h4><button onClick={() => injectComponent(comp.code)} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2">Insert</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Packages Modal & NPM Search */}
      {isPackagesOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0"><h3 className="text-lg font-semibold flex items-center gap-2"><Package className="w-5 h-5 text-indigo-400" /> Inject Packages</h3><button onClick={() => setIsPackagesOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
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
                        <div className="overflow-hidden pr-2"><h4 className="font-medium text-gray-200 text-sm truncate">{pkg.name}</h4><p className="text-xs text-gray-500 truncate">{pkg.description}</p></div>
                        <button onClick={() => injectPackage(`<script src="${pkg.latest}"></script>`)} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2">Add</button>
                      </div>
                   ))}
                 </>
              ) : (
                 <>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Add</h4>
                   {popularPackages.map((pkg, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-950 border border-gray-800">
                      <div><h4 className="font-medium text-gray-200 text-sm">{pkg.name}</h4><p className="text-xs text-gray-500">{pkg.desc}</p></div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center"><h3 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-indigo-400" /> Asset Manager</h3><button onClick={() => setIsAssetsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:bg-gray-800/50 transition-colors relative">
                <input type="file" accept="image/*" onChange={handleAssetUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" /><p className="text-sm text-gray-400">Click or drag image to upload<br/><span className="text-xs text-gray-500">(Converts to Base64)</span></p>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-400" /> Settings & Key Vault</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Feature Toggles */}
              <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-xl">
                 <div>
                   <h4 className="text-sm font-medium text-gray-200">Voice Auto-Submit</h4>
                   <p className="text-xs text-gray-500">Automatically send prompt when you stop speaking</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isVoiceAutoSubmit} onChange={(e) => saveSetting('omni_voice_autosubmit', e.target.checked, setIsVoiceAutoSubmit)} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                 </label>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Active AI Provider</label>
                  <select value={apiProvider} onChange={(e) => saveSetting('omni_api_provider', e.target.value, setApiProvider)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <option value="gemini">Google Gemini</option>
                    <option value="longcat">Longcat.chat</option>
                    <option value="ollama">Ollama (Local LLM)</option>
                  </select>
                </div>

                {apiProvider === 'gemini' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Custom Gemini API Key (BYOK)</label>
                      <input type="password" value={userApiKey} onChange={(e) => saveSetting('omni_gemini_key', e.target.value, setUserApiKey)} placeholder="AIzaSy..." className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      <p className="text-xs text-gray-500">Stored securely locally. Overrides the default environment key.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Custom Base URL (Optional)</label>
                      <input type="text" value={geminiBaseUrl} onChange={(e) => saveSetting('omni_gemini_url', e.target.value, setGeminiBaseUrl)} placeholder="[https://generativelanguage.googleapis.com](https://generativelanguage.googleapis.com)" className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                  </div>
                )}

                {apiProvider === 'longcat' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Longcat API Key</label>
                      <input type="password" value={longcatApiKey} onChange={(e) => saveSetting('omni_longcat_key', e.target.value, setLongcatApiKey)} placeholder="lc_..." className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Primary Base URL</label>
                      <input type="text" value={longcatBaseUrl} onChange={(e) => saveSetting('omni_longcat_url', e.target.value, setLongcatBaseUrl)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      <p className="text-xs text-gray-500">Default: [https://api.longcat.chat/openai/v1/chat/completions](https://api.longcat.chat/openai/v1/chat/completions)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Fallback Base URL (Optional)</label>
                      <input type="text" value={longcatFallbackUrl} onChange={(e) => saveSetting('omni_longcat_fallback_url', e.target.value, setLongcatFallbackUrl)} placeholder="Secondary proxy URL..." className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                  </div>
                )}

                {apiProvider === 'ollama' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg mb-2"><p className="text-xs text-indigo-300">Make sure Ollama is running locally and CORS is enabled (set <code>OLLAMA_ORIGINS="*"</code>).</p></div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Local Endpoint URL</label>
                      <input type="text" value={ollamaUrl} onChange={(e) => saveSetting('omni_ollama_url', e.target.value, setOllamaUrl)} placeholder="http://localhost:11434/api/chat" className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Model Name</label>
                      <input type="text" value={ollamaModel} onChange={(e) => saveSetting('omni_ollama_model', e.target.value, setOllamaModel)} placeholder="llama3, deepseek-coder, etc." className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                  </div>
                )}
              </div>

              {/* Environment Variables */}
              <div className="pt-4 border-t border-gray-800 space-y-2">
                 <label className="text-sm font-medium text-gray-300">Environment Variables (JSON)</label>
                 <p className="text-xs text-gray-500 mb-2">These are injected safely into your Sandbox as <code>window.ENV</code>.</p>
                 <textarea value={sandboxEnv} onChange={(e) => saveSetting('omni_sandbox_env', e.target.value, setSandboxEnv)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-24 resize-none" />
              </div>

              {/* Context Manager */}
              <div className="pt-4 border-t border-gray-800 space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-300 flex items-center gap-2">Context Memory Limit <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">{maxContext === 0 ? 'Unlimited' : `${maxContext} Msgs`}</span></label>
                 </div>
                 <p className="text-xs text-gray-500 mb-2">Lower limits save API costs and prevent "Token Limit" errors on long projects.</p>
                 <input type="range" min="0" max="40" step="2" value={maxContext} onChange={(e) => saveSetting('omni_max_context', parseInt(e.target.value), setMaxContext)} className="w-full accent-indigo-500" />
              </div>

              {/* Advanced System Prompt */}
              <div className="pt-4 border-t border-gray-800 space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-300">System Prompt (Advanced)</label>
                   <button onClick={() => saveSetting('omni_system_prompt', PERSONAS.default, setCustomSystemPrompt)} className="text-xs text-indigo-400 hover:text-indigo-300">Reset to Default</button>
                 </div>
                 <textarea value={customSystemPrompt} onChange={(e) => saveSetting('omni_system_prompt', e.target.value, setCustomSystemPrompt)} className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-32 resize-none" />
              </div>

            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end shrink-0">
              <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">Save & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
