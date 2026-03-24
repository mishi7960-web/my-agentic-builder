import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Settings, Play, Code, Send, Bot, User, AlertCircle, CheckCircle2, 
  Loader2, RefreshCw, X, Cpu, Zap, Mic, MicOff, Monitor, Tablet, 
  Smartphone, Download, Copy, History, TerminalSquare, ChevronLeft, 
  ChevronRight, BookOpen, SplitSquareHorizontal, ImagePlus, ExternalLink, 
  PackageSearch, ShieldCheck, DollarSign, Trash2, Sparkles, Wand2,
  PanelLeftClose, PanelLeftOpen, Terminal, Globe, AppWindow, StopCircle,
  MousePointerClick, Database, Library, BookmarkPlus, Brain, ChevronDown,
  Eye, EyeOff, Plus, Palette, Activity, Folder, GripVertical, Network, MessageSquare,
  Wifi, Check, Command, RotateCcw, Share2, Code2, Search
} from 'lucide-react';

const DEFAULT_CODE = `<!-- Your generated code will appear here -->
<div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans p-6 relative overflow-hidden">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
  <div class="text-center space-y-6 max-w-xl relative z-10">
    <div class="inline-flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 shadow-2xl shadow-emerald-900/20">
       <svg class="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </div>
    <h1 class="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent pb-2">Agentic Builder</h1>
    <p class="text-zinc-400 text-lg leading-relaxed font-medium">Select a template below, swap your theme, or hit <kbd class="px-2 py-1 bg-zinc-800 rounded-md text-zinc-300 text-sm font-mono border border-zinc-700">Cmd+K</kbd> to explore commands.</p>
  </div>
</div>`;

const TEMPLATES = [
  { title: 'SaaS Dashboard', prompt: 'Build a modern dark-mode SaaS dashboard with a sidebar, top nav, and 3 placeholder chart widgets using Tailwind CSS.' },
  { title: 'Auth Screen (Firebase)', prompt: 'Create a beautiful login/signup split screen. Use Firebase to handle user authentication.' },
  { title: 'Kimi Coding Special', prompt: 'Create a sophisticated, stateful React-like dashboard in a single file with advanced transitions and data handling.' }
];

const NVIDIA_MODELS = [
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi k2.5 (Best for Coding)' },
  { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vis' },
  { id: 'mistralai/mixtral-8x22b-instruct-v0.1', name: 'Mixtral 8x22B' },
  { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2' },
  { id: 'nvidia/nemotron-4-340b-instruct', name: 'Nemotron-4 340B' },
  { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B' },
  { id: 'microsoft/phi-3-vision-128k-instruct', name: 'Phi-3 Vision' }
];

const PROVIDERS = {
  nvidia: { name: 'NVIDIA API', url: 'https://integrate.api.nvidia.com/v1/chat/completions' },
  openai: { name: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions' },
  anthropic: { name: 'Anthropic', url: 'https://api.anthropic.com/v1/messages' },
  groq: { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions' },
  local: { name: 'Local/Ollama', url: 'http://localhost:11434/v1/chat/completions' },
  custom: { name: 'Custom Endpoint', url: '' }
};

const THEMES = {
  emerald: { id: 'emerald', text: 'text-emerald-400', bg: 'bg-emerald-500', bgHover: 'hover:bg-emerald-600', border: 'border-emerald-500', borderSubtle: 'border-emerald-500/30', from: 'from-emerald-600', to: 'to-teal-500', ring: 'ring-emerald-500', lightBg: 'bg-emerald-500/10', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
  violet: { id: 'violet', text: 'text-violet-400', bg: 'bg-violet-500', bgHover: 'hover:bg-violet-600', border: 'border-violet-500', borderSubtle: 'border-violet-500/30', from: 'from-violet-600', to: 'to-purple-500', ring: 'ring-violet-500', lightBg: 'bg-violet-500/10', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]' },
  blue: { id: 'blue', text: 'text-blue-400', bg: 'bg-blue-500', bgHover: 'hover:bg-blue-600', border: 'border-blue-500', borderSubtle: 'border-blue-500/30', from: 'from-blue-600', to: 'to-cyan-500', ring: 'ring-blue-500', lightBg: 'bg-blue-500/10', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  rose: { id: 'rose', text: 'text-rose-400', bg: 'bg-rose-500', bgHover: 'hover:bg-rose-600', border: 'border-rose-500', borderSubtle: 'border-rose-500/30', from: 'from-rose-600', to: 'to-pink-500', ring: 'ring-rose-500', lightBg: 'bg-rose-500/10', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
};

const FRAMEWORKS = ['Vanilla HTML', 'React (JSX)', 'Vue (SFC)', 'Svelte'];

const MAX_HISTORY_LEN = 20;
const MAX_MESSAGES_LEN = 50;
const MAX_AUTO_RETRIES = 3;

// Lightweight Regex Syntax Highlighter for HTML
const highlightHTML = (code) => {
  if (!code) return '';
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="text-pink-400">$2</span>')
    .replace(/([a-zA-Z0-9-]+)=/g, '<span class="text-blue-300">$1</span>=')
    .replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="text-emerald-300">$1</span>')
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="text-zinc-500 italic">$1</span>');
};

export default function App() {
  // --- Persistent Workspaces & Settings ---
  const [sessions, setSessions] = useState(() => {
    try { const saved = localStorage.getItem('agentic_sessions'); return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Initial Project', messages: [], history: [{ code: DEFAULT_CODE, timestamp: new Date().toLocaleTimeString() }], historyIndex: 0 }]; } catch { return [{ id: 'default', name: 'Initial Project', messages: [], history: [{ code: DEFAULT_CODE, timestamp: new Date().toLocaleTimeString() }], historyIndex: 0 }]; }
  });
  const [activeSessionId, setActiveSessionId] = useState(() => localStorage.getItem('agentic_active_session') || 'default');
  
  const [apiKeys, setApiKeys] = useState(() => {
    try { const saved = localStorage.getItem('agentic_apikeys'); return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Default API Key', key: '' }]; } catch { return [{ id: 'default', name: 'Default API Key', key: '' }]; }
  });
  const [activeKeyId, setActiveKeyId] = useState(() => localStorage.getItem('agentic_active_key') || 'default');
  const [providerKey, setProviderKey] = useState(() => localStorage.getItem('agentic_provider') || 'nvidia');
  const [apiEndpoint, setApiEndpoint] = useState(() => localStorage.getItem('agentic_endpoint') || PROVIDERS.nvidia.url);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('agentic_model') || 'moonshotai/kimi-k2.5');
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('agentic_theme') || 'emerald');
  const [savedComponents, setSavedComponents] = useState(() => {
    try { const saved = localStorage.getItem('agentic_library'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  // --- Session Derived States ---
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const [messages, setMessages] = useState(activeSession.messages);
  const [history, setHistory] = useState(activeSession.history);
  const [historyIndex, setHistoryIndex] = useState(activeSession.historyIndex);

  // --- Core States ---
  const [systemPromptOverride, setSystemPromptOverride] = useState('');
  const [knowledgeContext, setKnowledgeContext] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [sessionTokens, setSessionTokens] = useState(0);
  
  // --- Advanced Features States ---
  const [targetPlatform, setTargetPlatform] = useState('web'); 
  const [targetFramework, setTargetFramework] = useState('Vanilla HTML');
  const [inspectorMode, setInspectorMode] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const [autoSolveEnabled, setAutoSolveEnabled] = useState(false);
  const [qaReviewEnabled, setQaReviewEnabled] = useState(false);
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);
  const [layout, setLayout] = useState('tabs'); 
  const [activeTab, setActiveTab] = useState('preview');
  const [deviceSize, setDeviceSize] = useState('desktop'); 
  const [isLandscape, setIsLandscape] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [networkLogs, setNetworkLogs] = useState([]);
  const [bottomPanelTab, setBottomPanelTab] = useState('console'); 
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  
  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Command Palette
  const [showCmdK, setShowCmdK] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  const [showKey, setShowKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState({});
  const [splitWidth, setSplitWidth] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  
  // --- Modals ---
  const [showSettings, setShowSettings] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [previewKey, setPreviewKey] = useState(0);

  // --- Refs ---
  const chatEndRef = useRef(null);
  const consoleEndRef = useRef(null);
  const networkEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const codeContentRef = useRef(null);
  const autoRetryCount = useRef(0);
  const abortControllerRef = useRef(null);
  const cmdInputRef = useRef(null);

  const t = THEMES[activeTheme];
  const generatedCode = history[historyIndex]?.code || DEFAULT_CODE;

  // --- Sync to Local Storage ---
  useEffect(() => { 
    const updatedSessions = sessions.map(s => s.id === activeSessionId ? { ...s, messages, history, historyIndex } : s);
    localStorage.setItem('agentic_sessions', JSON.stringify(updatedSessions)); 
  }, [messages, history, historyIndex, activeSessionId]);
  
  useEffect(() => { localStorage.setItem('agentic_active_session', activeSessionId); }, [activeSessionId]);
  useEffect(() => { localStorage.setItem('agentic_library', JSON.stringify(savedComponents)); }, [savedComponents]);
  useEffect(() => { localStorage.setItem('agentic_theme', activeTheme); }, [activeTheme]);
  useEffect(() => { 
    localStorage.setItem('agentic_apikeys', JSON.stringify(apiKeys)); 
    localStorage.setItem('agentic_active_key', activeKeyId);
    localStorage.setItem('agentic_provider', providerKey);
    localStorage.setItem('agentic_endpoint', apiEndpoint);
    localStorage.setItem('agentic_model', selectedModel);
  }, [apiKeys, activeKeyId, providerKey, apiEndpoint, selectedModel]);

  // --- Workspace & CMD+K Listeners ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { 
        e.preventDefault(); 
        setShowCmdK(true); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => { if (showCmdK) setTimeout(() => cmdInputRef.current?.focus(), 100); }, [showCmdK]);

  // --- Speech Recognition ---
  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition is not supported in your browser.'); return; }
    
    if (isListening) { 
      recognitionRef.current?.stop(); 
      setIsListening(false); 
      return; 
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) transcript += e.results[i][0].transcript;
      setCurrentInput(prev => {
         const base = prev.replace(/\s*\(listening\.\.\.\)\s*$/, '');
         return base + ' ' + transcript + (e.results[e.results.length - 1].isFinal ? '' : ' (listening...)');
      });
    };
    recognition.onend = () => { setIsListening(false); setCurrentInput(prev => prev.replace(/\s*\(listening\.\.\.\)\s*$/, '')); };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const switchSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages);
      setHistory(session.history);
      setHistoryIndex(session.historyIndex);
      setActiveSessionId(id);
      setShowWorkspaces(false);
      setPreviewKey(prev => prev + 1);
    }
  };

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession = { id: newId, name: `Project ${sessions.length + 1}`, messages: [], history: [{ code: DEFAULT_CODE, timestamp: new Date().toLocaleTimeString() }], historyIndex: 0 };
    setSessions([...sessions, newSession]);
    switchSession(newId);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) switchSession(newSessions[0].id);
  };

  // --- Draggable Split ---
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingSplit) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setSplitWidth(newWidth);
    };
    const onMouseUp = () => setIsDraggingSplit(false);
    if (isDraggingSplit) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [isDraggingSplit]);

  // --- Auto-scrolls ---
  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, streamedContent]);
  useEffect(() => { if (bottomPanelTab === 'console') consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [consoleLogs, bottomPanelTab]);
  useEffect(() => { if (bottomPanelTab === 'network') networkEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [networkLogs, bottomPanelTab]);

  const handleCodeScroll = (e) => {
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = e.target.scrollTop;
  };

  const undo = useCallback(() => setHistoryIndex(prev => Math.max(0, prev - 1)), []);
  const redo = useCallback(() => setHistoryIndex(prev => Math.min(history.length - 1, prev + 1)), [history.length]);
  const handleTimelineChange = (e) => setHistoryIndex(parseInt(e.target.value, 10));

  const openPreviewInNewTab = () => {
    const blob = new Blob([getIframeSource()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // --- CodePen Export ---
  const exportToCodePen = () => {
    const data = { title: "Agentic Builder App", html: generatedCode, description: "Generated with Universal Agentic Builder v5.0" };
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', 'data');
    input.setAttribute('value', JSON.stringify(data));
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://codepen.io/pen/define');
    form.setAttribute('target', '_blank');
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  // --- Listen for iframe events ---
  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      if (event.data.type === 'preview-error') {
        handleAutoSolveError(event.data.message, event.data.line);
        setConsoleLogs(prev => [...prev, { type: 'error', text: `[Line ${event.data.line}] ${event.data.message}` }]);
      } else if (event.data.type === 'console') {
        setConsoleLogs(prev => [...prev, { type: event.data.method, text: event.data.args.join(' ') }]);
      } else if (event.data.type === 'network') {
        setNetworkLogs(prev => [...prev, { method: event.data.method, url: event.data.url, status: event.data.status, time: event.data.time }]);
      } else if (event.data.type === 'inspect-click') {
        setInspectorMode(false); 
        setCurrentInput(prev => `Update this specific element:\n\`\`\`html\n${event.data.html}\n\`\`\`\n\nInstruction: `);
        addMessage('system', 'Element targeted. Check your prompt input or attach a reference image.');
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [autoSolveEnabled, generatedCode, isGenerating]);

  const handleAutoSolveError = async (errorMessage, line) => {
    if (!autoSolveEnabled || isGenerating || autoRetryCount.current >= MAX_AUTO_RETRIES) return;
    autoRetryCount.current += 1;
    const errorPrompt = `I encountered a JavaScript error in the code at line ${line}:\n"${errorMessage}"\nPlease fix this error and output the corrected full code.`;
    addMessage('system', `Auto-Solve triggered: Fixing error...`);
    await processPrompt(errorPrompt, true);
  };

  const handleProviderChange = (e) => {
    const pKey = e.target.value;
    setProviderKey(pKey);
    if (PROVIDERS[pKey].url) setApiEndpoint(PROVIDERS[pKey].url);
  };

  const testConnection = async (keyObj) => {
    setKeyTestStatus(prev => ({...prev, [keyObj.id]: 'loading'}));
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(keyObj.key ? {'Authorization': `Bearer ${keyObj.key}`} : {}) },
        body: JSON.stringify({ model: selectedModel, messages: [{role: 'user', content: 'ping'}], max_tokens: 1 })
      });
      if (res.ok) setKeyTestStatus(prev => ({...prev, [keyObj.id]: 'success'}));
      else setKeyTestStatus(prev => ({...prev, [keyObj.id]: 'error'}));
    } catch (e) {
      setKeyTestStatus(prev => ({...prev, [keyObj.id]: 'error'}));
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.6)); 
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (url) => setAttachedImages(prev => [...prev, url]));
    e.target.value = '';
  };

  const extractCode = (text) => {
    const marker = String.fromCharCode(96, 96, 96);
    const regex = new RegExp(marker + "(?:html|jsx|tsx|vue|svelte)?\\s*([\\s\\S]*?)" + marker, "i");
    const match = text.match(regex);
    if (match) return match[1];
    const partialRegex = new RegExp(marker + "(?:html|jsx|tsx|vue|svelte)?\\s*([\\s\\S]*)", "i");
    const partialMatch = text.match(partialRegex);
    if (partialMatch) return partialMatch[1];
    if (text.trim().startsWith('<') && text.trim().endsWith('>')) return text;
    return null;
  };

  const formatMessageContent = (text, images) => {
    if (images.length === 0) return text;
    return [{ type: 'text', text: text }, ...images.map(img => ({ type: 'image_url', image_url: { url: img } }))];
  };

  const streamApiCall = async (apiMessages, onUpdate) => {
    abortControllerRef.current = new AbortController();
    const headers = { 'Content-Type': 'application/json' };
    const currentKey = apiKeys.find(k => k.id === activeKeyId)?.key || '';
    if (currentKey) headers['Authorization'] = `Bearer ${currentKey}`;

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ model: selectedModel, messages: apiMessages, max_tokens: 4096, temperature: 0.7, stream: true }),
      signal: abortControllerRef.current.signal
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status} - ${await response.text()}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let content = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim() !== '');
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace(/^data: /, ''));
              if (data.choices && data.choices[0]?.delta?.content) {
                content += data.choices[0].delta.content;
                onUpdate(content);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) { if (err.name !== 'AbortError') throw err; }
    return content;
  };

  const processPrompt = async (promptText, isAutoSolve = false) => {
    const isLocalEndpoint = apiEndpoint.includes('0.0.0.0') || apiEndpoint.includes('localhost') || apiEndpoint.includes('127.0.0.1');
    const currentKey = apiKeys.find(k => k.id === activeKeyId)?.key || '';
    if (!promptText.trim() && attachedImages.length === 0) return;
    if (!currentKey && !isLocalEndpoint) { setShowSettings(true); return; }

    if (!isAutoSolve) {
      autoRetryCount.current = 0;
      addMessage('user', promptText, attachedImages);
      setCurrentInput('');
      setAttachedImages([]);
    }
    
    setIsGenerating(true);
    setStreamedContent('');

    // --- NPM Auto-Injector Logic ---
    let injectedContext = "";
    const lowerPrompt = promptText.toLowerCase();
    if (lowerPrompt.includes('chart') || lowerPrompt.includes('recharts')) injectedContext += "\nCRITICAL: User requested charts. Inject Recharts or Chart.js via CDN in the HTML.";
    if (lowerPrompt.includes('3d') || lowerPrompt.includes('threejs')) injectedContext += "\nCRITICAL: Inject Three.js via CDN.";

    let platformInstruction = "";
    if (targetPlatform === 'mobile') platformInstruction = "TARGET PLATFORM: Native Mobile App. Design a strictly mobile-first interface.";
    else if (targetPlatform === 'desktop') platformInstruction = "TARGET PLATFORM: Native Desktop App. Design desktop-optimized layouts (sidebars).";
    else platformInstruction = "TARGET PLATFORM: Responsive Website.";
    
    const thinkInstruction = deepThinkEnabled ? "DEEP THINK MODE: You MUST first write a comprehensive architectural plan wrapped strictly in <thinking>...</thinking> tags. Analyze requirements, choose the right layout, and define state BEFORE writing the code block." : "";
    const defaultSystem = `You are an elite 10x Full Stack Developer. Build visually stunning, single-file ${targetFramework} applications. Use Tailwind CSS via CDN. Write robust, production-ready code.`;
    const finalSystemPrompt = `${systemPromptOverride.trim() ? systemPromptOverride : defaultSystem}\n\n${platformInstruction}\n${injectedContext}\n${thinkInstruction}`;

    const apiMessages = [
      { role: 'system', content: finalSystemPrompt + (knowledgeContext ? `\n\nCONTEXT: ${knowledgeContext}` : '') },
      ...messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: formatMessageContent(m.content, m.images || []) })),
      { role: 'user', content: formatMessageContent(promptText, attachedImages) }
    ];

    try {
      let fullReply = await streamApiCall(apiMessages, setStreamedContent);
      let newCode = extractCode(fullReply);
      const wasAborted = abortControllerRef.current?.signal.aborted;

      if (qaReviewEnabled && newCode && !isAutoSolve && !wasAborted) {
        addMessage('system', 'QA Reviewing...');
        setStreamedContent(''); 
        const qaMessages = [{ role: 'system', content: `QA Code Reviewer.` }, { role: 'user', content: `Fix bugs in this:\n\`\`\`html\n${newCode}\n\`\`\`` }];
        fullReply = await streamApiCall(qaMessages, setStreamedContent);
        newCode = extractCode(fullReply) || newCode; 
      }

      setSessionTokens(prev => prev + Math.ceil((promptText.length + fullReply.length) / 4));
      addMessage('assistant', fullReply);
      
      if (newCode) {
        const newHistory = [...history].slice(Math.max(0, historyIndex + 1 - MAX_HISTORY_LEN + 1), historyIndex + 1);
        newHistory.push({ code: newCode, timestamp: new Date().toLocaleTimeString() });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } catch (error) { addMessage('system', `Failed: ${error.message}`); } finally { setIsGenerating(false); setStreamedContent(''); }
  };

  const addMessage = (role, content, images = []) => {
    setMessages(prev => {
      const updated = [...prev, { role, content, images }];
      return updated.length > MAX_MESSAGES_LEN ? updated.slice(updated.length - MAX_MESSAGES_LEN) : updated;
    });
  };

  // Custom renderer to parse `<thinking>` blocks beautifully
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return "[Complex Data]";
    const thinkMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    if (thinkMatch) {
       const thinkingText = thinkMatch[1];
       const restText = content.replace(/<thinking>[\s\S]*?<\/thinking>/i, '');
       return (
          <div className="flex flex-col gap-3">
            <details className={`bg-zinc-900/40 border-l-4 ${t.border} rounded-r-xl rounded-l-sm overflow-hidden group shadow-sm`}>
              <summary className="p-2.5 cursor-pointer text-xs font-bold text-zinc-300 flex items-center gap-2 hover:bg-zinc-800/60 transition-colors select-none outline-none">
                <Brain className={`w-4 h-4 ${t.text}`}/> <span className="uppercase tracking-wider">Agentic Reasoning</span>
                <ChevronDown className="w-3.5 h-3.5 ml-auto text-zinc-500 group-open:rotate-180 transition-transform"/>
              </summary>
              <div className="p-4 text-xs text-zinc-400 font-mono whitespace-pre-wrap bg-zinc-950/50 leading-relaxed border-t border-zinc-800/50">
                 {thinkingText.trim()}
              </div>
            </details>
            <span className="whitespace-pre-wrap leading-relaxed">{restText.trim()}</span>
          </div>
       );
    }
    return <span className="whitespace-pre-wrap leading-relaxed">{content}</span>;
  };

  const getIframeSource = () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script>
        const originalConsole = { log: console.log, warn: console.warn, error: console.error };
        ['log', 'warn', 'error'].forEach(method => {
          console[method] = function(...args) {
            window.parent.postMessage({ type: 'console', method, args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a))}, '*');
            originalConsole[method](...args);
          };
        });
        window.onerror = function(msg, url, line) { window.parent.postMessage({ type: 'preview-error', message: msg, line: line }, '*'); return false; };
        
        const origFetch = window.fetch;
        window.fetch = async (...args) => {
           const start = Date.now();
           const url = typeof args[0] === 'string' ? args[0] : args[0].url;
           window.parent.postMessage({ type: 'network', method: args[1]?.method || 'GET', url: url, status: 'pending', time: 0 }, '*');
           try {
               const res = await origFetch(...args);
               window.parent.postMessage({ type: 'network', method: args[1]?.method || 'GET', url: url, status: res.status, time: Date.now() - start }, '*');
               return res;
           } catch(e) {
               window.parent.postMessage({ type: 'network', method: args[1]?.method || 'GET', url: url, status: 'ERROR', time: Date.now() - start }, '*');
               throw e;
           }
        };

        window.addEventListener('message', e => {
          if (e.data && e.data.type === 'eval') { try { eval(e.data.code); } catch (err) { console.error(err.toString()); } }
        });
        ${inspectorMode ? `
          document.addEventListener('mouseover', e => { e.target.style.outline = '2px dashed #10b981'; e.target.style.cursor = 'crosshair'; }, true);
          document.addEventListener('mouseout', e => e.target.style.outline = '', true);
          document.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); window.parent.postMessage({ type: 'inspect-click', html: e.target.outerHTML }, '*'); }, true);
        ` : ''}
      </script>
      <style> body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; } </style>
    </head>
    <body>${generatedCode}</body>
    </html>
  `;

  const linesCount = generatedCode.split('\n').length || 1;
  const lineNumbers = Array.from({length: linesCount}, (_, i) => i + 1);

  // Command Palette Actions
  const cmdActions = [
    { name: 'New Workspace', icon: <Plus/>, action: () => { createNewSession(); setShowCmdK(false); } },
    { name: 'Open Settings', icon: <Settings/>, action: () => { setShowSettings(true); setShowCmdK(false); } },
    { name: 'Clear Chat History', icon: <Trash2/>, action: () => { setMessages([]); setShowCmdK(false); } },
    { name: 'Toggle Theme (Emerald)', icon: <Palette/>, action: () => { setActiveTheme('emerald'); setShowCmdK(false); } },
    { name: 'Toggle Theme (Violet)', icon: <Palette/>, action: () => { setActiveTheme('violet'); setShowCmdK(false); } },
    { name: 'Toggle Split Layout', icon: <SplitSquareHorizontal/>, action: () => { setLayout(layout === 'split' ? 'tabs' : 'split'); setShowCmdK(false); } },
    { name: 'Export to CodePen', icon: <Share2/>, action: () => { exportToCodePen(); setShowCmdK(false); } }
  ].filter(a => a.name.toLowerCase().includes(cmdSearch.toLowerCase()));

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* COMMAND PALETTE MODAL */}
      {showCmdK && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50 transition-all" onClick={() => setShowCmdK(false)}>
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in ring-1 ring-white/5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-4 border-b border-zinc-800/50">
               <Search className={`w-5 h-5 ${t.text} mr-3`}/>
               <input ref={cmdInputRef} value={cmdSearch} onChange={e => setCmdSearch(e.target.value)} placeholder="Type a command or search..." className="flex-1 bg-transparent text-lg text-white font-medium focus:outline-none placeholder:text-zinc-500" />
               <kbd className="text-[10px] font-mono bg-zinc-800/50 border border-zinc-700 text-zinc-400 px-2 py-1 rounded shadow-sm">ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
               {cmdActions.length > 0 ? cmdActions.map((action, i) => (
                 <button key={i} onClick={action.action} className={`w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-xl hover:${t.bg} hover:text-white text-zinc-300 transition-all group`}>
                   <span className="opacity-60 group-hover:opacity-100 [&>svg]:w-5 [&>svg]:h-5 transition-opacity">{action.icon}</span>
                   <span className="text-sm font-semibold">{action.name}</span>
                 </button>
               )) : <div className="text-center text-zinc-500 py-8 text-sm font-medium">No commands found.</div>}
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACES SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 w-[280px] transform transition-transform duration-300 ease-in-out shadow-2xl ${showWorkspaces ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
           <div className="font-bold flex items-center gap-2.5 text-lg"><Folder className={`w-5 h-5 ${t.text}`}/> Workspaces</div>
           <button onClick={() => setShowWorkspaces(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {sessions.map(s => (
            <div key={s.id} onClick={() => switchSession(s.id)} className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 border shadow-sm ${activeSessionId === s.id ? `${t.border} ${t.lightBg} ring-1 ${t.ring} ring-opacity-20` : 'border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/80 hover:bg-zinc-800/40'}`}>
              <div className="flex flex-col overflow-hidden">
                <span className={`text-sm font-bold truncate ${activeSessionId === s.id ? t.text : 'text-zinc-200'}`}>{s.name}</span>
                <span className="text-[11px] font-medium text-zinc-500 mt-0.5">{s.messages.length} messages</span>
              </div>
              <button onClick={(e) => deleteSession(s.id, e)} className="text-zinc-600 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 w-full p-5 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
          <button onClick={createNewSession} className={`w-full py-3 rounded-xl text-sm font-bold border border-zinc-700 hover:border-zinc-500 text-white flex items-center justify-center gap-2 transition-all hover:bg-zinc-800/50 shadow-sm`}><Plus className="w-4 h-4"/> New Workspace</button>
        </div>
      </div>

      {/* MAIN CHAT SIDEBAR */}
      <div className={`flex flex-col border-r border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-2xl z-20 flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[420px]' : 'w-0 overflow-hidden border-none'}`}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-950/30 backdrop-blur-md w-[420px]">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowWorkspaces(!showWorkspaces)} className={`p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 transition-colors shadow-sm`}><Folder className={`w-4.5 h-4.5 ${t.text}`} /></button>
            <h1 className="font-bold text-base tracking-tight text-white truncate w-36">{activeSession.name}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowLibrary(true)} className={`p-2 hover:bg-zinc-800/80 rounded-xl text-zinc-400 hover:${t.text} transition-colors`}><Library className="w-5 h-5" /></button>
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-zinc-800/80 rounded-xl text-zinc-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
            <button onClick={() => setMessages([])} className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar w-[420px]">
          {messages.length === 0 ? (
            <div className="grid grid-cols-1 gap-3.5 mt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1 ml-1">Suggested Templates</p>
              {TEMPLATES.map((tmpl, i) => (
                <button key={i} onClick={() => setCurrentInput(tmpl.prompt)} className={`text-left p-4.5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:${t.borderSubtle}`}>
                  <div className={`font-bold text-sm text-zinc-200 mb-1.5 group-hover:${t.text} transition-colors`}>{tmpl.title}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed font-medium line-clamp-2">{tmpl.prompt}</div>
                </button>
              ))}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (<div className="w-8 h-8 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-sm mt-1"><Bot className={`w-4 h-4 ${t.text}`} /></div>)}
                <div className={`max-w-[85%] rounded-2xl p-4.5 text-sm shadow-sm ${msg.role === 'user' ? `bg-gradient-to-br ${t.from} ${t.to} text-white rounded-tr-sm shadow-lg shadow-${t.id}-900/20 font-medium` : msg.role === 'system' ? 'bg-amber-500/10 text-amber-300 font-mono text-xs border border-amber-500/20' : 'bg-zinc-900/80 backdrop-blur-md text-zinc-200 border border-zinc-700/50 rounded-tl-sm'}`}>
                   {renderMessageContent(msg.content)}
                </div>
              </div>
            ))
          )}
          {isGenerating && streamedContent && (
            <div className="flex gap-3.5 justify-start">
               <div className="w-8 h-8 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-sm mt-1"><Bot className={`w-4 h-4 ${t.text}`} /></div>
               <div className="max-w-[85%] rounded-2xl p-4.5 text-sm bg-zinc-900/80 backdrop-blur-md text-zinc-200 border border-zinc-700/50 rounded-tl-sm shadow-sm">
                  {renderMessageContent(streamedContent)}
                  <span className={`inline-block w-2 h-4 ml-1.5 rounded-sm ${t.bg} animate-pulse align-middle`}></span>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl w-[420px]">
          <div className={`flex flex-col bg-zinc-900/60 backdrop-blur-lg border border-zinc-700/60 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden focus-within:border-${t.id}-500/50 focus-within:ring-1 focus-within:ring-${t.id}-500/20 transition-all duration-300`}>
            
            {/* Top Prompt Controls */}
            <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-zinc-950/40 border-b border-zinc-800/60 gap-2">
              <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 shadow-inner px-2">
                <button onClick={() => setAutoSolveEnabled(!autoSolveEnabled)} className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold transition-colors px-1.5 py-1 rounded-md hover:bg-zinc-800/50 ${autoSolveEnabled ? t.text : 'text-zinc-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${autoSolveEnabled ? `${t.bg} ${t.glow}` : 'bg-zinc-600'}`}></div> Auto
                </button>
                <div className="w-px h-3.5 bg-zinc-700/80"></div>
                <button onClick={() => setQaReviewEnabled(!qaReviewEnabled)} className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold transition-colors px-1.5 py-1 rounded-md hover:bg-zinc-800/50 ${qaReviewEnabled ? 'text-blue-400' : 'text-zinc-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${qaReviewEnabled ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-zinc-600'}`}></div> QA
                </button>
                <div className="w-px h-3.5 bg-zinc-700/80"></div>
                <button onClick={() => setDeepThinkEnabled(!deepThinkEnabled)} className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold transition-colors px-1.5 py-1 rounded-md hover:bg-zinc-800/50 ${deepThinkEnabled ? 'text-purple-400' : 'text-zinc-500'}`} title="Deep Reasoning Mode">
                  <Brain className="w-3.5 h-3.5"/> Think
                </button>
              </div>

              {/* Model Dropdown */}
              <div className="flex items-center bg-zinc-900/80 p-0.5 rounded-xl border border-zinc-800/80 shadow-inner relative max-w-[130px]">
                 <div className="pl-2 text-zinc-500"><Cpu className="w-3.5 h-3.5" /></div>
                 <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-transparent text-xs font-bold text-zinc-300 pl-1.5 pr-7 py-1.5 focus:outline-none appearance-none cursor-pointer truncate">
                   {NVIDIA_MODELS.map(m => <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>)}
                   {!NVIDIA_MODELS.find(m => m.id === selectedModel) && <option value={selectedModel} className="bg-zinc-900">{selectedModel}</option>}
                 </select>
                 <div className="absolute right-2 pointer-events-none text-zinc-500"><ChevronDown className="w-3 h-3"/></div>
              </div>
            </div>

            {/* Framework / Platform Row */}
            <div className="flex items-center justify-between px-3.5 pt-3">
              <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800/50 relative hover:bg-zinc-800/40 transition-colors">
                 <div className="pl-2 text-zinc-500"><Code2 className="w-3.5 h-3.5" /></div>
                 <select value={targetFramework} onChange={(e) => setTargetFramework(e.target.value)} className="bg-transparent text-[11px] uppercase tracking-wider font-bold text-zinc-400 pl-2 pr-7 py-1 focus:outline-none appearance-none cursor-pointer hover:text-zinc-200">
                   {FRAMEWORKS.map(f => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
                 </select>
                 <div className="absolute right-2 pointer-events-none text-zinc-500"><ChevronDown className="w-3 h-3"/></div>
              </div>
              
              <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800/50">
                <button onClick={() => handlePlatformChange('web')} className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${targetPlatform === 'web' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}><Globe className="w-3.5 h-3.5"/> Web</button>
                <button onClick={() => handlePlatformChange('mobile')} className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${targetPlatform === 'mobile' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}><Smartphone className="w-3.5 h-3.5"/> App</button>
              </div>
            </div>

            <textarea value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} placeholder="Describe what you want to build..." className="w-full bg-transparent text-zinc-100 p-4 resize-none focus:outline-none min-h-[70px] max-h-[150px] custom-scrollbar text-sm placeholder:text-zinc-600 font-medium leading-relaxed" />
            
            {/* Attached Images */}
            {attachedImages.length > 0 && (
              <div className="flex gap-2.5 px-4 pb-3 overflow-x-auto custom-scrollbar">
                 {attachedImages.map((img, i) => (
                   <div key={i} className="relative w-14 h-14 rounded-xl border-2 border-zinc-700 overflow-hidden group shadow-md shrink-0">
                     <img src={img} alt="attached" className="w-full h-full object-cover"/>
                     <button onClick={() => setAttachedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"><X className="w-3 h-3 text-white"/></button>
                   </div>
                 ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-3 pb-3">
               <div className="flex items-center gap-1.5">
                  <button onClick={() => fileInputRef.current?.click()} className={`p-2 text-zinc-400 hover:${t.text} hover:bg-zinc-800/50 rounded-xl transition-all`} title="Attach Image"><ImagePlus className="w-5 h-5" /><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} /></button>
                  <button onClick={toggleMic} className={`p-2 rounded-xl transition-all ${isListening ? `${t.text} ${t.lightBg} animate-pulse` : `text-zinc-400 hover:${t.text} hover:bg-zinc-800/50`}`} title="Voice Prompt"><Mic className="w-5 h-5" /></button>
               </div>
               {isGenerating ? (
                 <button onClick={() => abortControllerRef.current?.abort()} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors border border-red-500/20"><StopCircle className="w-4 h-4" /> Stop</button>
               ) : (
                 <button onClick={() => processPrompt(currentInput)} className={`px-6 py-2.5 bg-gradient-to-r ${t.from} ${t.to} text-white rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg ${t.glow} hover:brightness-110 hover:-translate-y-0.5 transition-all duration-300`}><Sparkles className="w-4.5 h-4.5" /> Generate</button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* EDITOR & PREVIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        <div className="flex flex-wrap items-center justify-between p-3.5 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl relative z-10 gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl hover:${t.border} hover:${t.lightBg} transition-all shadow-sm`} title="Toggle Sidebar"><PanelLeftClose className="w-4.5 h-4.5" /></button>
            
            {/* Segmented Controls */}
            <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 shadow-inner">
              <button onClick={() => setLayout('tabs')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${layout === 'tabs' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}>Tabs</button>
              <button onClick={() => setLayout('split')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${layout === 'split' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}><SplitSquareHorizontal className="w-3.5 h-3.5"/> Split</button>
            </div>
            {layout === 'tabs' && (
              <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 shadow-inner">
                <button onClick={() => setActiveTab('preview')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? `${t.bg} text-white shadow-sm` : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}><Play className="w-3.5 h-3.5" /> Preview</button>
                <button onClick={() => setActiveTab('code')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'code' ? `${t.bg} text-white shadow-sm` : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}><Code className="w-3.5 h-3.5" /> Code</button>
              </div>
            )}
            {/* Device Rotation (Mobile only) */}
            {targetPlatform === 'mobile' && activeTab === 'preview' && (
              <button onClick={() => setIsLandscape(!isLandscape)} className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm hover:bg-zinc-800 transition-colors" title="Rotate Device"><RotateCcw className="w-4.5 h-4.5"/></button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setInspectorMode(!inspectorMode)} className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-sm ${inspectorMode ? `${t.bg} text-white ${t.border} ${t.glow}` : `bg-zinc-900 border-zinc-800 ${t.text} hover:border-zinc-700 hover:bg-zinc-800/50`}`} title="Visual DOM Inspector"><MousePointerClick className="w-4 h-4" /> Target Element</button>
            
            {/* Visual Timeline Slider */}
            <div className="flex items-center bg-zinc-900/80 rounded-xl border border-zinc-800/80 px-4 py-2.5 gap-3 min-w-[180px] shadow-inner">
                <button onClick={undo} disabled={historyIndex === 0} className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"><ChevronLeft className="w-4.5 h-4.5"/></button>
                <input type="range" min="0" max={Math.max(0, history.length - 1)} value={historyIndex} onChange={handleTimelineChange} className={`flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-${t.id}-500 hover:h-2 transition-all`} style={{ accentColor: `var(--${t.id}-500, #10b981)` }} title="Timeline Scrubber" />
                <button onClick={redo} disabled={historyIndex === history.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"><ChevronRight className="w-4.5 h-4.5"/></button>
                <span className="text-[11px] font-mono font-bold text-zinc-400 w-7 text-right bg-zinc-950/50 px-1 py-0.5 rounded">v{historyIndex + 1}</span>
            </div>
            
            <div className="flex items-center gap-1.5 border-l border-zinc-800/80 pl-3">
              <button onClick={() => { const name = prompt("Name your component:"); if (name) setSavedComponents(prev => [{ id: Date.now(), name, code: generatedCode, timestamp: new Date().toLocaleTimeString() }, ...prev]); }} className="p-2.5 text-zinc-400 hover:text-purple-400 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors shadow-sm" title="Save to Library"><BookmarkPlus className="w-4.5 h-4.5" /></button>
              <button onClick={() => { const blob = new Blob([generatedCode], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `app-${Date.now()}.html`; a.click(); URL.revokeObjectURL(url); }} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors shadow-sm" title="Download Source"><Download className="w-4.5 h-4.5" /></button>
              <button onClick={exportToCodePen} className={`px-4 py-2.5 ${t.lightBg} border ${t.border} rounded-xl ${t.text} flex items-center gap-2 text-xs font-bold hover:brightness-110 transition-all shadow-sm`}><Share2 className="w-4 h-4"/> Share</button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {layout === 'split' ? (
            <div className="flex-1 flex w-full relative">
              {/* Highlighted Code Pane */}
              <div style={{ width: `${splitWidth}%` }} className="h-full border-r border-zinc-800 flex bg-[#09090b] relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]">
                 <div ref={lineNumbersRef} className="w-14 bg-zinc-900/60 border-r border-zinc-800/50 text-right pr-4 py-6 select-none overflow-hidden text-zinc-600 font-mono text-xs leading-6 shrink-0 shadow-inner">
                    {lineNumbers.map(n => <div key={n} className="opacity-70">{n}</div>)}
                 </div>
                 {/* Highlighting Engine overlay */}
                 <div ref={codeContentRef} onScroll={handleCodeScroll} className="flex-1 bg-transparent text-[#e4e4e7] p-6 pl-5 font-mono text-sm overflow-auto custom-scrollbar whitespace-pre leading-6 focus:outline-none" dangerouslySetInnerHTML={{ __html: highlightHTML(generatedCode) }} />
              </div>

              {/* Draggable Resizer */}
              <div onMouseDown={() => setIsDraggingSplit(true)} className={`absolute top-0 bottom-0 w-2.5 -ml-[5px] bg-transparent hover:${t.bg} hover:bg-opacity-50 cursor-col-resize z-20 transition-all duration-200 flex items-center justify-center group`} style={{ left: `${splitWidth}%` }}>
                 <div className={`h-10 w-1.5 bg-zinc-600 rounded-full flex items-center justify-center pointer-events-none group-hover:${t.bg} transition-colors shadow-lg`}><GripVertical className="w-3 h-3 text-zinc-900 opacity-0 group-hover:opacity-100"/></div>
              </div>

              {/* Preview Pane */}
              <div style={{ width: `${100 - splitWidth}%` }} className="h-full relative bg-zinc-950 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] flex items-center justify-center overflow-hidden">
                 <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-700/50 shadow-xl z-20">
                    <button onClick={() => setPreviewKey(prev => prev + 1)} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors" title="Refresh Preview"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-zinc-700/80"></div>
                    <button onClick={openPreviewInNewTab} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors" title="Open in New Tab"><ExternalLink className="w-3.5 h-3.5" /></button>
                 </div>
                 
                 <div className={`transition-all duration-500 ease-out relative ${deviceSize === 'mobile' ? (isLandscape ? 'w-[812px] h-[375px]' : 'w-[375px] h-[812px]') + ' rounded-[3rem] ring-[12px] ring-zinc-900 border-[8px] border-zinc-950 shadow-black/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]' : 'w-full h-full'}`}>
                   <iframe key={previewKey} srcDoc={getIframeSource()} className={`w-full h-full border-none bg-white relative z-0 ${deviceSize === 'mobile' ? 'rounded-[2.2rem]' : ''}`} sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin allow-downloads" />
                 </div>
              </div>
            </div>
          ) : (
            activeTab === 'preview' ? (
              <div className="flex-1 bg-zinc-950 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] flex items-center justify-center p-8 relative overflow-hidden">
                
                {/* Enhanced Floating Toolbar */}
                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-xl p-2 rounded-2xl border border-zinc-700/50 shadow-2xl z-20">
                    <button onClick={() => setPreviewKey(prev => prev + 1)} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors" title="Refresh Preview"><RefreshCw className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-zinc-700/80"></div>
                    <button onClick={openPreviewInNewTab} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors" title="Open in New Tab"><ExternalLink className="w-4 h-4" /></button>
                </div>

                <div className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-out relative ${deviceSize === 'mobile' ? (isLandscape ? 'w-[812px] h-[375px]' : 'w-[375px] h-[812px]') + ' rounded-[3rem] ring-[14px] ring-zinc-900 border-[8px] border-zinc-950 shadow-black/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]' : 'w-full h-full rounded-2xl border border-zinc-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'}`}>
                  <iframe key={previewKey} srcDoc={getIframeSource()} className={`w-full h-full border-none bg-white relative z-0 ${deviceSize === 'mobile' ? 'rounded-[2.2rem]' : ''}`} sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin allow-downloads" />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex bg-[#09090b] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                 <div ref={lineNumbersRef} className="w-14 bg-zinc-900/60 border-r border-zinc-800/50 text-right pr-4 py-6 select-none overflow-hidden text-zinc-600 font-mono text-xs leading-6 shrink-0">
                    {lineNumbers.map(n => <div key={n} className="opacity-70">{n}</div>)}
                 </div>
                 <div ref={codeContentRef} onScroll={handleCodeScroll} className="flex-1 bg-transparent text-[#e4e4e7] p-6 pl-5 font-mono text-sm overflow-auto custom-scrollbar whitespace-pre leading-6 focus:outline-none" dangerouslySetInnerHTML={{ __html: highlightHTML(generatedCode) }} />
              </div>
            )
          )}
        </div>

        {/* BOTTOM PANEL (Console & Network) */}
        {isConsoleVisible && (
          <div className={`bg-zinc-950 border-t border-zinc-800/80 flex flex-col transition-all duration-300 ease-in-out shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 ${showBottomPanel ? 'h-72' : 'h-12'}`}>
             <div className="flex items-center justify-between px-4 bg-zinc-900/90 backdrop-blur border-b border-zinc-800/80">
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => { setShowBottomPanel(true); setBottomPanelTab('console'); }} className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold rounded-t-lg transition-colors ${bottomPanelTab === 'console' && showBottomPanel ? `bg-zinc-800/80 ${t.text} border-t-2 ${t.border}` : 'border-t-2 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}><TerminalSquare className="w-4 h-4"/> Console</button>
                  <button onClick={() => { setShowBottomPanel(true); setBottomPanelTab('network'); }} className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold rounded-t-lg transition-colors ${bottomPanelTab === 'network' && showBottomPanel ? `bg-zinc-800/80 ${t.text} border-t-2 ${t.border}` : 'border-t-2 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}><Network className="w-4 h-4"/> Network</button>
                </div>
                <div className="flex items-center gap-4 pb-1.5">
                  <div className="text-[10px] text-zinc-400 font-mono font-semibold flex items-center gap-1.5 border border-zinc-800/80 px-2.5 py-1 rounded-md bg-zinc-950/80 shadow-inner" title="Estimated API Token Cost"><DollarSign className="w-3.5 h-3.5 text-emerald-500"/> {(sessionTokens * 0.000002).toFixed(4)} USD</div>
                  <button onClick={() => bottomPanelTab === 'console' ? setConsoleLogs([]) : setNetworkLogs([])} className="text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-md hover:text-white hover:bg-zinc-700 transition-colors shadow-sm">Clear</button>
                  <button onClick={() => setShowBottomPanel(!showBottomPanel)} className="p-1.5 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-md hover:bg-zinc-700 transition-colors"><ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${showBottomPanel ? '' : 'rotate-180'}`}/></button>
                </div>
             </div>
             
             {showBottomPanel && bottomPanelTab === 'console' && (
               <div className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-scrollbar bg-zinc-950/50">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className={`py-2 px-4 mb-2 rounded-lg border flex gap-4 shadow-sm ${log.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : log.type === 'warn' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'text-zinc-300 hover:bg-zinc-900 border-transparent hover:border-zinc-800 transition-colors'}`}>
                      <span className="opacity-60 font-bold uppercase text-[10px] w-12 shrink-0 pt-0.5">[{log.type}]</span>
                      <span className="break-all whitespace-pre-wrap leading-relaxed">{log.text}</span>
                    </div>
                  ))}
                  <div ref={consoleEndRef}/>
               </div>
             )}

             {showBottomPanel && bottomPanelTab === 'network' && (
               <div className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-scrollbar bg-zinc-950/50">
                  <div className="grid grid-cols-12 gap-3 px-4 py-2 text-zinc-500 font-extrabold border-b border-zinc-800 mb-3 uppercase tracking-wider text-[10px]">
                    <div className="col-span-2">Method</div>
                    <div className="col-span-6">URL</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Time</div>
                  </div>
                  {networkLogs.map((log, i) => (
                    <div key={i} className={`grid grid-cols-12 gap-3 py-2 px-4 mb-1.5 rounded-lg border shadow-sm transition-colors ${log.status === 'ERROR' || log.status >= 400 ? 'text-red-400 bg-red-500/5 border-red-500/20' : log.status === 'pending' ? 'text-zinc-500 animate-pulse border-transparent' : 'text-zinc-300 hover:bg-zinc-900 border-transparent hover:border-zinc-800'}`}>
                      <div className="col-span-2 font-bold pt-0.5">{log.method}</div>
                      <div className="col-span-6 truncate pt-0.5" title={log.url}>{log.url}</div>
                      <div className="col-span-2 pt-0.5 flex items-center gap-1.5">
                          {log.status === 'pending' ? <Loader2 className="w-3 h-3 animate-spin inline"/> : <span className={`w-2 h-2 rounded-full inline-block ${log.status >= 400 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>}
                          {log.status}
                      </div>
                      <div className="col-span-2 text-right pt-0.5 opacity-80">{log.time ? `${log.time}ms` : '...'}</div>
                    </div>
                  ))}
                  <div ref={networkEndRef}/>
               </div>
             )}
          </div>
        )}
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl w-full max-w-5xl p-10 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar ring-1 ring-white/5">
            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-3xl font-extrabold mb-10 text-white flex items-center gap-3"><Settings className={`w-8 h-8 ${t.text}`} /> Platform Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* LEFT COLUMN: Model & Connection */}
              <div className="space-y-8">
                <h3 className={`${t.text} text-sm font-bold uppercase tracking-wider border-b border-zinc-800/80 pb-4 flex items-center gap-2.5`}>
                  <Cpu className="w-4.5 h-4.5"/> API Configuration
                </h3>
                
                <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/80 space-y-5 shadow-inner">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Provider Preset</label>
                      <select value={providerKey} onChange={handleProviderChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm font-semibold text-white appearance-none focus:outline-none focus:border-zinc-500 cursor-pointer shadow-sm">
                        {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Active Model</label>
                      <div className="relative">
                        <input type="text" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} list="model-suggestions" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm font-semibold text-white focus:outline-none focus:border-zinc-500 shadow-sm" placeholder="e.g. gpt-4o" />
                        <datalist id="model-suggestions">
                           {NVIDIA_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </datalist>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">API Endpoint</label>
                    <input type="text" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} disabled={providerKey !== 'custom'} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm font-mono text-zinc-300 focus:outline-none focus:border-zinc-500 disabled:opacity-50 shadow-sm" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Authentication Keys</label>
                    <button onClick={() => setApiKeys([...apiKeys, { id: Date.now().toString(), name: 'New Key', key: '' }])} className={`text-xs font-bold ${t.bg} text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:-translate-y-0.5`}><Plus className="w-3.5 h-3.5"/> Add Key</button>
                  </div>
                  <div className="space-y-3.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {apiKeys.map(k => (
                      <div key={k.id} className={`flex flex-col gap-3.5 p-5 rounded-2xl border transition-all duration-300 ${activeKeyId === k.id ? `${t.border} ${t.lightBg} shadow-lg shadow-${t.id}-900/20` : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3.5 flex-1 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors shadow-inner ${activeKeyId === k.id ? t.border : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                               {activeKeyId === k.id && <div className={`w-2.5 h-2.5 ${t.bg} rounded-full`} />}
                             </div>
                             <input type="radio" checked={activeKeyId === k.id} onChange={() => setActiveKeyId(k.id)} className="hidden" />
                             <input type="text" value={k.name} onChange={(e) => setApiKeys(apiKeys.map(ak => ak.id === k.id ? {...ak, name: e.target.value} : ak))} className="bg-transparent text-sm font-extrabold text-zinc-200 focus:outline-none w-full placeholder:text-zinc-600" placeholder="e.g. Production Key" />
                          </label>
                          <div className="flex items-center gap-1">
                            <button onClick={() => testConnection(k)} title="Test Connection" className={`p-2 rounded-lg transition-colors shadow-sm bg-zinc-900 border border-zinc-800 ${keyTestStatus[k.id] === 'loading' ? 'text-amber-400' : keyTestStatus[k.id] === 'success' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : keyTestStatus[k.id] === 'error' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
                               {keyTestStatus[k.id] === 'loading' ? <Loader2 className="w-4 h-4 animate-spin"/> : keyTestStatus[k.id] === 'success' ? <Check className="w-4 h-4"/> : <Wifi className="w-4 h-4"/>}
                            </button>
                            {apiKeys.length > 1 && (
                              <button onClick={() => { const newKeys = apiKeys.filter(ak => ak.id !== k.id); setApiKeys(newKeys); if (activeKeyId === k.id) setActiveKeyId(newKeys[0].id); }} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors bg-zinc-900 border border-zinc-800 shadow-sm"><Trash2 className="w-4 h-4"/></button>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <input type={showKey ? "text" : "password"} value={k.key} onChange={(e) => setApiKeys(apiKeys.map(ak => ak.id === k.id ? {...ak, key: e.target.value} : ak))} className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-11 text-sm text-white focus:${t.border} focus:outline-none focus:ring-1 focus:${t.ring} font-mono placeholder:text-zinc-600 placeholder:font-sans shadow-inner transition-all`} placeholder="sk-..." />
                          <button onClick={() => setShowKey(!showKey)} className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white transition-colors">{showKey ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Context & Theming */}
              <div className="space-y-8">
                <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider border-b border-zinc-800/80 pb-4 flex items-center gap-2.5">
                  <Palette className="w-4.5 h-4.5"/> Interface Theme
                </h3>
                <div className="grid grid-cols-4 gap-4">
                   {Object.values(THEMES).map(theme => (
                     <button key={theme.id} onClick={() => setActiveTheme(theme.id)} className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${activeTheme === theme.id ? `border-${theme.id}-500 bg-${theme.id}-500/10 shadow-[0_10px_30px_rgba(var(--${theme.id}-rgb),0.2)]` : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-600 shadow-sm'}`}>
                        <div className={`w-8 h-8 rounded-full shadow-inner border border-white/10 ${theme.bg}`}></div>
                        <span className="text-xs font-bold text-zinc-300 capitalize tracking-wide">{theme.id}</span>
                     </button>
                   ))}
                </div>

                <h3 className="text-purple-400 text-sm font-bold uppercase tracking-wider border-b border-zinc-800/80 pb-4 flex items-center gap-2.5 pt-2">
                  <Brain className="w-4.5 h-4.5"/> Context & Behavior
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
                      Knowledge Context
                      <span className="text-[9px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">PROJECT SCOPE</span>
                    </label>
                    <textarea value={knowledgeContext} onChange={(e) => setKnowledgeContext(e.target.value)} className="w-full bg-zinc-950/40 border border-zinc-800 rounded-2xl p-4 text-sm font-medium h-28 text-zinc-200 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none resize-none custom-scrollbar placeholder:text-zinc-600 shadow-inner transition-all" placeholder="Paste documentation, schemas, specific styling rules, or API endpoints here..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
                      System Prompt Override
                      <span className="text-[9px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">AI PERSONA</span>
                    </label>
                    <textarea value={systemPromptOverride} onChange={(e) => setSystemPromptOverride(e.target.value)} className="w-full bg-zinc-950/40 border border-zinc-800 rounded-2xl p-4 text-sm font-medium h-28 text-zinc-200 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 focus:outline-none resize-none custom-scrollbar placeholder:text-zinc-600 shadow-inner transition-all" placeholder="Override the default '10x developer' persona. e.g., 'You are a senior React performance specialist...'" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-800/80 flex justify-end gap-4">
              <button onClick={() => setShowSettings(false)} className={`bg-gradient-to-r ${t.from} ${t.to} text-white px-10 py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:-translate-y-1 ${t.glow} flex items-center gap-2.5 text-sm`}><CheckCircle2 className="w-5 h-5"/> Save & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* LIBRARY MODAL */}
      {showLibrary && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl w-full max-w-3xl p-8 shadow-2xl flex flex-col max-h-[85vh] ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800/80 pb-4">
               <h2 className="text-2xl font-extrabold text-white flex items-center gap-3"><Library className={`w-7 h-7 ${t.text}`}/> Local Component Library</h2>
               <button onClick={() => setShowLibrary(false)} className="p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {savedComponents.length === 0 ? <p className="text-zinc-500 text-center py-16 font-medium text-lg">No components saved yet. <br/><span className="text-sm font-normal mt-2 block">Click the Bookmark icon in the editor to save your code.</span></p> : savedComponents.map(comp => (
                <div key={comp.id} className={`bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:${t.borderSubtle} group`}>
                  <div className="flex flex-col gap-1.5">
                     <h3 className={`${t.text} font-extrabold text-base`}>{comp.name}</h3>
                     <p className="text-xs font-mono font-medium text-zinc-500 flex items-center gap-1.5"><History className="w-3.5 h-3.5"/> Saved at {comp.timestamp}</p>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSavedComponents(prev => prev.filter(c => c.id !== comp.id))} className="text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-4 py-2 rounded-xl transition-all border border-red-500/20 hover:border-red-500 shadow-sm">Delete</button>
                    <button onClick={() => { const newHist = [...history].slice(Math.max(0, historyIndex + 1 - MAX_HISTORY_LEN + 1), historyIndex + 1); newHist.push({ code: comp.code, timestamp: new Date().toLocaleTimeString() }); setHistory(newHist); setHistoryIndex(newHist.length - 1); setShowLibrary(false); }} className={`${t.bg} ${t.bgHover} px-6 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5`}>Load</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(63, 63, 70, 0.6); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(161, 161, 170, 0.8); }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px) scale(0.97); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
      `}} />
    </div>
  );
}
