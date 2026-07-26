"use client"

import { useEffect, useRef, useState } from 'react'

// Strong TypeScript interfaces for data safety
interface PullRequest {
  title: string;
  repo: string;
  date: string;
  link: string;
}

interface PRCounts {
  merged: number;
  open: number;
  closed: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface Command {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

// Seeding pseudo-random matrix cells for GitHub contributions (42 weeks * 7 days)
const contributionSeed = Array.from({ length: 42 * 7 }, (_, i) => {
  const hash = Math.sin(i + 4) * 10000;
  const rand = hash - Math.floor(hash);
  if (rand < 0.48) return 0;
  if (rand < 0.75) return 1;
  if (rand < 0.88) return 2;
  if (rand < 0.96) return 3;
  return 4;
});

const getContributionColor = (val: number): string => {
  switch(val) {
    case 0: return 'bg-neutral-900/60';
    case 1: return 'bg-blue-950/50 border border-blue-900/10';
    case 2: return 'bg-blue-800/40 border border-blue-700/10';
    case 3: return 'bg-blue-600/60 border border-blue-500/10';
    case 4: return 'bg-blue-500 border border-blue-400/20';
    default: return 'bg-neutral-900/60';
  }
};

const MatrixRain = ({ isActive }: { isActive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
    const charArr = chars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41'; // matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-[0.08] z-0"
    />
  );
};

export default function Page() {
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false)
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false)
  const [isMatrixActive, setIsMatrixActive] = useState<boolean>(false)
  const [isTerminalMode, setIsTerminalMode] = useState<boolean>(false)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Welcome to piyush.c interactive shell (v1.0.0)',
    'Type "help" to see a list of commands, or "gui" to exit.'
  ])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [copiedText, setCopiedText] = useState<string>('')
  const [prTab, setPrTab] = useState<'merged' | 'open' | 'closed'>('merged')

  const terminalBottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new logs are added
  useEffect(() => {
    if (isTerminalMode && terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [terminalLogs, isTerminalMode])
  
  // Dynamic PR states with strongly-typed objects
  const [prsData, setPrsData] = useState<{ merged: PullRequest[]; open: PullRequest[]; closed: PullRequest[] }>({
    merged: [],
    open: [],
    closed: []
  })
  const [prCounts, setPrCounts] = useState<PRCounts>({ merged: 0, open: 0, closed: 0 })
  const [loadingPrs, setLoadingPrs] = useState<boolean>(true)

  // Dynamic GitHub calendar states
  const [githubCalendar, setGithubCalendar] = useState<ContributionDay[] | null>(null)
  const [totalGithubContributions, setTotalGithubContributions] = useState<number>(0)
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(true)
  
  const paletteInputRef = useRef<HTMLInputElement>(null)

  // Real fallback data if API limit is reached
  const fallbackPrs: { merged: PullRequest[]; open: PullRequest[]; closed: PullRequest[] } = {
    merged: [
      {
        title: "add dynamic social sharing metadata",
        repo: "StabilityNexus/StableViewpoints",
        date: "Jul 22, 2026",
        link: "https://github.com/StabilityNexus/StableViewpoints/pull/106"
      },
      {
        title: "redesign events(workshop) page",
        repo: "StabilityNexus/Website",
        date: "Jul 17, 2026",
        link: "https://github.com/StabilityNexus/Website/pull/64"
      },
      {
        title: "feat(gamification): add rewards redemption store",
        repo: "sngaryan/EcoSphere",
        date: "Jul 12, 2026",
        link: "https://github.com/sngaryan/EcoSphere/pull/9"
      },
      {
        title: "feat(gamification): add reviewer feedback and proof uploads",
        repo: "sngaryan/EcoSphere",
        date: "Jul 12, 2026",
        link: "https://github.com/sngaryan/EcoSphere/pull/7"
      },
      {
        title: "Remove The Stable Order CTA from applications page",
        repo: "StabilityNexus/Website",
        date: "Jul 09, 2026",
        link: "https://github.com/StabilityNexus/Website/pull/63"
      }
    ],
    open: [],
    closed: [
      {
        title: "Remove Stability Research Network section",
        repo: "StabilityNexus/Website",
        date: "Jul 09, 2026",
        link: "https://github.com/StabilityNexus/Website/pull/62"
      },
      {
        title: "feat(applications): add StablePay Coming Soon card and brand logo",
        repo: "StabilityNexus/Website",
        date: "Jul 06, 2026",
        link: "https://github.com/StabilityNexus/Website/pull/61"
      }
    ]
  }

  // Dynamic GitHub PR fetching with cache and local dev override
  useEffect(() => {
    const cacheKey = 'piyush_prs_cache_v3'
    const cached = localStorage.getItem(cacheKey)
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && cached) {
      try {
        const { timestamp, data, counts } = JSON.parse(cached)
        // 5 minutes cache duration for fast updates
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setPrsData(data)
          setPrCounts(counts)
          setLoadingPrs(false)
          return
        }
      } catch (e) {
        console.error('Error parsing PR cache', e)
      }
    }

    setLoadingPrs(true)
    fetch('https://api.github.com/search/issues?q=author:Piyushbijarania+type:pr&per_page=60')
      .then(res => {
        if (!res.ok) throw new Error('API Rate Limit or Error')
        return res.json()
      })
      .then(result => {
        if (result && result.items) {
          const mergedList: PullRequest[] = []
          const openList: PullRequest[] = []
          const closedList: PullRequest[] = []

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result.items.forEach((item: any) => {
            const formatted: PullRequest = {
              title: item.title,
              repo: item.repository_url.replace('https://api.github.com/repos/', ''),
              date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              link: item.html_url
            }

            if (item.state === 'open') {
              openList.push(formatted)
            } else if (item.state === 'closed') {
              if (item.pull_request && item.pull_request.merged_at) {
                mergedList.push(formatted)
              } else {
                closedList.push(formatted)
              }
            }
          })

          const data = {
            merged: mergedList.slice(0, 5),
            open: openList.slice(0, 5),
            closed: closedList.slice(0, 5)
          }

          const counts = {
            merged: mergedList.length,
            open: openList.length,
            closed: closedList.length
          }

          setPrsData(data)
          setPrCounts(counts)
          setLoadingPrs(false)

          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data,
            counts
          }))
        }
      })
      .catch(err => {
        console.warn('API error, falling back to static lists:', err)
        setPrsData(fallbackPrs)
        setPrCounts({
          merged: 34,
          open: 0,
          closed: 6
        })
        setLoadingPrs(false)
      })
  }, [])

  // Dynamic GitHub calendar fetching with cache and local dev override
  useEffect(() => {
    const cacheKey = 'piyush_calendar_cache_v4'
    const cached = localStorage.getItem(cacheKey)
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && cached) {
      try {
        const { timestamp, total, contributions } = JSON.parse(cached)
        // 5 minutes cache duration
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setGithubCalendar(contributions)
          setTotalGithubContributions(total)
          setLoadingCalendar(false)
          return
        }
      } catch (e) {
        console.error('Error parsing calendar cache', e)
      }
    }

    setLoadingCalendar(true)
    fetch('https://github-contributions-api.jogruber.de/v4/Piyushbijarania?y=last')
      .then(res => {
        if (!res.ok) throw new Error('API Error')
        return res.json()
      })
      .then(result => {
        if (result && result.contributions) {
          const lastContributions = result.contributions.slice(-294) // 42 weeks * 7 days
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const yearTotal = (result.total as any)?.lastYear || (result.total as any)?.['2026'] || 208
          
          setGithubCalendar(lastContributions)
          setTotalGithubContributions(yearTotal)
          setLoadingCalendar(false)

          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            total: yearTotal,
            contributions: lastContributions
          }))
        }
      })
      .catch(err => {
        console.warn('Contributions API error, falling back to static seed:', err)
        setTotalGithubContributions(208)
        setLoadingCalendar(false)
      })
  }, [])

  // Mouse move event for cursor follow glow
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  // Command palette toggle keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsPaletteOpen((prev) => !prev)
        setSearchQuery('')
        setSelectedIndex(0)
      }
      if (e.key === 'Escape') {
        setIsPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when palette opens
  useEffect(() => {
    if (isPaletteOpen && paletteInputRef.current) {
      setTimeout(() => {
        paletteInputRef.current?.focus()
      }, 50)
    }
  }, [isPaletteOpen])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label)
      setTimeout(() => setCopiedText(''), 2000)
    })
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsPaletteOpen(false)
  }

  // Available command items in palette
  const commands: Command[] = [
    {
      id: 'go-experience',
      title: 'Navigate to Experience',
      subtitle: 'Jump to Google Summer of Code timeline',
      icon: 'ri-briefcase-line',
      action: () => scrollToSection('experience')
    },
    {
      id: 'go-projects',
      title: 'Navigate to Projects',
      subtitle: 'View AI-powered and web3 projects',
      icon: 'ri-code-box-line',
      action: () => scrollToSection('projects')
    },
    {
      id: 'go-opensource',
      title: 'Navigate to Open Source',
      subtitle: 'Check pull requests and contributions',
      icon: 'ri-git-merge-line',
      action: () => scrollToSection('opensource')
    },
    {
      id: 'go-funstuff',
      title: 'Navigate to The Fun Stuff',
      subtitle: 'See WakaTime metrics and Spotify history',
      icon: 'ri-music-2-line',
      action: () => scrollToSection('funstuff')
    },
    {
      id: 'go-skills',
      title: 'Navigate to Skills',
      subtitle: 'Explore computer languages and devops systems',
      icon: 'ri-tools-line',
      action: () => scrollToSection('skills')
    },
    {
      id: 'go-education',
      title: 'Navigate to Education',
      subtitle: 'Check universities and schools details',
      icon: 'ri-book-open-line',
      action: () => scrollToSection('education')
    },
    {
      id: 'view-resume',
      title: 'View Resume',
      subtitle: 'Open the PDF resume in a viewer',
      icon: 'ri-file-pdf-line',
      action: () => {
        setIsResumeOpen(true)
        setIsPaletteOpen(false)
      }
    },
    {
      id: 'copy-email',
      title: 'Copy Email Address',
      subtitle: 'piyush.gag6513@gmail.com',
      icon: 'ri-mail-line',
      action: () => {
        copyToClipboard('piyush.gag6513@gmail.com', 'Email Address')
        setIsPaletteOpen(false)
      }
    },
    {
      id: 'copy-phone',
      title: 'Copy Phone Number',
      subtitle: '+91 9653816266',
      icon: 'ri-phone-line',
      action: () => {
        copyToClipboard('+91 9653816266', 'Phone Number')
        setIsPaletteOpen(false)
      }
    },
    {
      id: 'open-github',
      title: 'Open GitHub Profile',
      subtitle: 'Explore open-source repositories',
      icon: 'ri-github-fill',
      action: () => {
        window.open('https://github.com/Piyushbijarania', '_blank')
        setIsPaletteOpen(false)
      }
    },
    {
      id: 'open-linkedin',
      title: 'Open LinkedIn Profile',
      subtitle: 'Connect with Piyush Choudhary',
      icon: 'ri-linkedin-box-fill',
      action: () => {
        window.open('https://linkedin.com/in/piyush-choudhary-a83a3b255', '_blank')
        setIsPaletteOpen(false)
      }
    },
    {
      id: 'toggle-matrix',
      title: 'Toggle Matrix Rain Background',
      subtitle: isMatrixActive ? 'Deactivate green digital rain streams' : 'Activate retro code canvas overlay',
      icon: 'ri-contrast-drop-2-line',
      action: () => {
        setIsMatrixActive(prev => !prev)
        setIsPaletteOpen(false)
      }
    },
    {
      id: 'switch-terminal',
      title: 'Switch to Interactive Shell',
      subtitle: 'Type commands directly (help, skills, contact, clear)',
      icon: 'ri-terminal-line',
      action: () => {
        setIsTerminalMode(true)
        setSearchQuery('')
      }
    }
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTerminalSubmit = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const newLogs = [...terminalLogs, `guest@piyush.c:~$ ${trimmed}`];
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();

    switch(cmd) {
      case 'help':
        newLogs.push(
          'Available commands:',
          '  skills     Display technical proficiencies',
          '  contact    Show phone and email details',
          '  projects   Print current and past work portfolio',
          '  clear      Reset terminal output history',
          '  gui        Switch back to search menu mode',
          '  exit       Close command palette'
        );
        break;
      case 'skills':
        newLogs.push(
          'TECHNICAL SKILLS:',
          '  Languages:  Python, Java, JavaScript, TypeScript, Solidity',
          '  Frameworks: React, Next.js, Node.js, FastAPI, Tailwind CSS',
          '  AI/ML:      Gemini API, Groq API, MCP, Prompt Engineering',
          '  Database:   PostgreSQL, MongoDB, NeonDB',
          '  DevOps:     Git, GitHub Actions, Docker, AWS, Postman',
          '  Blockchain: Solidity, Foundry, Smart Contracts, EVM Oracles'
        );
        break;
      case 'contact':
        newLogs.push(
          'CONTACT INFO:',
          '  Email: piyush.gag6513@gmail.com',
          '  Phone: +91 9653816266'
        );
        break;
      case 'projects':
        newLogs.push(
          'PROJECTS LIST:',
          '  - OrbOracle (GSoC \'26) [Solidity, Foundry, Smart Contracts]',
          '  - PIYX [FastAPI, Gemini API, ManimCE, FFmpeg]',
          '  - SimAI [Next.js, Gemini 2.5 Pro, Drizzle ORM, Neon Postgres]'
        );
        break;
      case 'clear':
        setTerminalLogs([]);
        setSearchQuery('');
        return;
      case 'gui':
        setIsTerminalMode(false);
        setSearchQuery('');
        return;
      case 'exit':
        setIsPaletteOpen(false);
        setSearchQuery('');
        return;
      default:
        newLogs.push(`Command not found: "${cmd}". Type "help" for a list of available commands.`);
    }

    setTerminalLogs(newLogs);
    setSearchQuery('');
  };

  const handlePaletteKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTerminalMode) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-white/10 overflow-x-hidden">
      
      {/* Decorative vertical bounds gridlines */}
      <div className="col-border-left"></div>
      <div className="col-border-right"></div>
      
      {/* Interactive cursor light beam */}
      <div className="cursor-glow-beam"></div>

      {/* Falling Matrix rain background overlay */}
      <MatrixRain isActive={isMatrixActive} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 grid-bg-overlay pointer-events-none opacity-[0.8]"></div>

      {/* Sticky Header Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-neutral-900/80 bg-black/60 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold tracking-wider text-white uppercase select-none">piyush.c</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 font-display text-[13px] font-medium tracking-wide text-neutral-400">
              <a href="#skills" className="hover:text-white transition-colors">Skills</a>
              <a href="#experience" className="hover:text-white transition-colors">Experience</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#opensource" className="hover:text-white transition-colors">Open Source</a>
              <a href="#funstuff" className="hover:text-white transition-colors">Fun Stuff</a>
              <a href="#education" className="hover:text-white transition-colors">Education</a>
              <button 
                onClick={() => setIsResumeOpen(true)}
                className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-display text-[13px] font-medium tracking-wide text-neutral-400"
              >
                Resume
              </button>
            </div>

            {/* Matrix Rain Toggle */}
            <button 
              onClick={() => setIsMatrixActive(prev => !prev)}
              className={`p-1.5 rounded border text-xs transition-colors cursor-pointer flex items-center justify-center ${
                isMatrixActive 
                  ? 'border-green-800 bg-green-950/20 text-green-400 hover:bg-green-950/40 hover:border-green-700' 
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
              title={isMatrixActive ? "Disable Matrix Rain" : "Enable Matrix Rain"}
            >
              <i className="ri-contrast-drop-2-line text-sm"></i>
            </button>

            {/* Command Palette Trigger */}
            <button 
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
              title="Open Command Palette"
            >
              <i className="ri-search-2-line"></i>
              <kbd className="hidden sm:inline-block font-mono text-[10px] opacity-60">Ctrl K</kbd>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:py-20">
        
        {/* Toast copy notification */}
        {copiedText && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-neutral-200 shadow-2xl animate-fade-in">
            <i className="ri-checkbox-circle-line text-green-500"></i>
            <span>Copied {copiedText} to clipboard</span>
          </div>
        )}

        {/* Hero Banner Grid lines & details */}
        <section className="relative flex flex-col md:flex-row items-start justify-between gap-10 md:gap-12 pb-16">
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                PIYUSH CHOUDHARY
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-[15px] font-medium tracking-wide text-neutral-400">
                  Full-Stack & AI Developer
                </span>
              </div>
            </div>

            <p className="max-w-2xl text-sm sm:text-[15px] leading-relaxed text-neutral-400">
              Full-Stack & AI Developer specializing in TypeScript, React, Next.js, FastAPI, Solidity, and modern LLM ecosystems. Contributor at Google Summer of Code 2026, building decentralized price feeds on EVM, alongside scalable AI developer tooling.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a 
                href="mailto:piyush.gag6513@gmail.com" 
                className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-neutral-200 px-4 py-2 text-[13px] font-semibold transition-all"
              >
                <i className="ri-mail-send-line"></i>
                <span>Get in touch</span>
              </a>
              <button 
                onClick={() => setIsResumeOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 px-4 py-2 text-[13px] font-medium transition-all cursor-pointer"
              >
                <i className="ri-file-text-line"></i>
                <span>Resume</span>
              </button>
            </div>
            
            {/* Social connections links */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <a href="https://github.com/Piyushbijarania" target="_blank" rel="noopener noreferrer" className="p-2 text-xl text-neutral-400 hover:text-white transition-colors" title="GitHub">
                <i className="ri-github-fill"></i>
              </a>
              <a href="https://linkedin.com/in/piyush-choudhary-a83a3b255" target="_blank" rel="noopener noreferrer" className="p-2 text-xl text-neutral-400 hover:text-white transition-colors" title="LinkedIn">
                <i className="ri-linkedin-box-fill"></i>
              </a>
              <a href="https://codeforces.com/profile/piyush_0" target="_blank" rel="noopener noreferrer" className="p-2 text-xl text-neutral-400 hover:text-white transition-colors" title="Codeforces">
                <i className="ri-code-fill"></i>
              </a>
              <a href="https://leetcode.com/Piyush_bijarania" target="_blank" rel="noopener noreferrer" className="p-2 text-xl text-neutral-400 hover:text-white transition-colors" title="Leetcode">
                <i className="ri-terminal-box-line"></i>
              </a>
            </div>
          </div>

          {/* Profile Avatar Frame */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/avatar.png" 
              alt="Piyush Choudhary Profile" 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none"></div>
          </div>
        </section>

        {/* Section: Skills */}
        <section id="skills" className="py-12 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Skills</h2>
            <div className="flex-1 h-px bg-neutral-900"></div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            
            {/* Skill 1: Languages */}
            <div className="rounded-2xl border border-neutral-900 p-5 flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-neutral-300 font-display">Languages</span>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'Java', 'JavaScript', 'TypeScript', 'Solidity'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Skill 2: Frameworks */}
            <div className="rounded-2xl border border-neutral-900 p-5 flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-neutral-300 font-display">Frameworks</span>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'Next.js', 'Node.js', 'Express.js', 'FastAPI', 'Tailwind CSS'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Skill 3: AI & ML */}
            <div className="rounded-2xl border border-neutral-900 p-5 flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-neutral-300 font-display">AI / ML</span>
              <div className="flex flex-wrap gap-1.5">
                {['Gemini API', 'Groq API', 'MCP', 'Prompt Engineering', 'Text-to-Speech'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Skill 4: Databases */}
            <div className="rounded-2xl border border-neutral-900 p-5 flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-neutral-300 font-display">Databases</span>
              <div className="flex flex-wrap gap-1.5">
                {['PostgreSQL', 'MongoDB', 'NeonDB'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Skill 5: Cloud & DevOps */}
            <div className="rounded-2xl border border-neutral-900 p-5 flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-neutral-300 font-display">Cloud & DevOps</span>
              <div className="flex flex-wrap gap-1.5">
                {['Git', 'GitHub Actions', 'Docker', 'AWS', 'Postman'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Skill 6: Blockchain */}
            <div className="rounded-2xl border border-neutral-900 p-5 flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-neutral-300 font-display">Blockchain</span>
              <div className="flex flex-wrap gap-1.5">
                {['Solidity', 'Foundry', 'Smart Contracts', 'EVM Oracles'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900 text-neutral-400">{tag}</span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Diagonal Stripes Divider */}
        <div className="stripe-divider my-8"></div>

        {/* Section: Experience */}
        <section id="experience" className="py-12 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Experience</h2>
            <div className="flex-1 h-px bg-neutral-900"></div>
          </div>

          <div className="flex flex-col gap-10">
            {/* Timeline element */}
            <div className="relative border-l border-neutral-800 pl-6 ml-3 flex flex-col gap-6">
              
              {/* Timeline Bullet */}
              <div className="absolute -left-[6px] top-1.5 w-[11px] h-[11px] rounded-full bg-white border-2 border-black"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-white">Google Summer of Code 2026 Contributor</h3>
                  <p className="text-sm text-neutral-400">AOSSIE (Open Source Initiative)</p>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-xs font-mono text-neutral-400">May 2026 – Nov 2026</p>
                  <p className="text-xs text-neutral-500">Remote</p>
                </div>
              </div>

              <ul className="text-sm text-neutral-400 space-y-3 list-disc pl-4">
                <li>
                  Architected **OrbOracle’s ComposedOracle** infrastructure enabling multiplication, division, and inversion of existing EVM price feeds to support composable decentralized derivatives.
                </li>
                <li>
                  Engineered secure scaling, precision-aware rounding, stale-feed validation, and dependency verification mechanisms to ensure reliable oracle aggregation and protocol safety.
                </li>
                <li>
                  Extended the **OrbOracle Explorer** with an intuitive interface for creating composed feeds, visualizing dependency graphs, and monitoring oracle health in real time.
                </li>
                <li>
                  Developed comprehensive unit, integration, and fuzz testing suites using **Foundry**, significantly improving contract reliability and edge-case coverage.
                </li>
                <li>
                  Built SEO-optimized landing pages for multiple Stability Nexus projects while preserving brand identity and improving discoverability.
                </li>
                <li>
                  Collaborated with mentors through iterative code reviews, delivering production-ready smart contract, frontend, and CI/CD contributions to open-source repositories.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Diagonal Stripes Divider */}
        <div className="stripe-divider my-8"></div>

        {/* Section: Projects */}
        <section id="projects" className="py-12 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Projects</h2>
            <div className="flex-1 h-px bg-neutral-900"></div>
          </div>

          {/* Currently working */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest select-none">Currently Working</p>
            <div className="relative border-t border-l border-neutral-900">
              {/* Corner Crosses */}
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -top-2 -left-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -top-2 -right-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -bottom-2 -left-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -bottom-2 -right-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Project 1: OrbOracle (GSoC '26) */}
                <div className="flex flex-col justify-between gap-5 p-6 border-r border-b border-neutral-900 hover:bg-neutral-950/40 transition-colors group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                        OrbOracle (GSoC &apos;26)
                      </h3>
                      <a href="https://github.com/AOSSIE-Org/OrbOracle" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" title="GitHub Repository">
                        <i className="ri-github-fill text-lg"></i>
                      </a>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      EVM price feeds oracle infrastructure. Developed secure smart contracts with scale, precision-aware calculations, stale feeds validation, and extensive Foundry tests.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['Solidity', 'Foundry', 'Smart Contracts', 'EVM Oracles'].map(tag => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-900 bg-neutral-950 text-neutral-500">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Project 2: PIYX */}
                <div className="flex flex-col justify-between gap-5 p-6 border-r border-b border-neutral-900 hover:bg-neutral-950/40 transition-colors group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                        PIYX
                      </h3>
                      <a href="https://github.com/Piyushbijarania/PIYX" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" title="GitHub Repository">
                        <i className="ri-github-fill text-lg"></i>
                      </a>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      An end-to-end AI platform translating natural language prompts into animated educational math videos using LLM reasoning and automated rendering pipelines.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['FastAPI', 'Gemini API', 'ManimCE', 'FFmpeg', 'Python'].map(tag => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-900 bg-neutral-950 text-neutral-500">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Past projects */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest select-none">Past Projects</p>
            <div className="relative border-t border-l border-neutral-900">
              {/* Corner Crosses */}
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -top-2 -left-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -top-2 -right-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -bottom-2 -left-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute z-10 -bottom-2 -right-2 w-4 h-4 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-neutral-800"><line x1="5" y1="0" x2="5" y2="10" stroke-width="1"></line><line x1="0" y1="5" x2="10" y2="5" stroke-width="1"></line></svg>
              </span>

              <div className="grid grid-cols-1">
                {/* Project 3: SimAI */}
                <div className="flex flex-col justify-between gap-5 p-6 border-r border-b border-neutral-900 hover:bg-neutral-950/40 transition-colors group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                        SimAI
                      </h3>
                      <a href="https://github.com/Piyushbijarania/SimAI" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" title="GitHub Repository">
                        <i className="ri-github-fill text-lg"></i>
                      </a>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      AI platform turning user prompts into interactive browser-based physics simulations. Implemented with Neon serverless database storage and JWT authorization.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['Next.js', 'Gemini 2.5 Pro', 'Drizzle ORM', 'Neon Postgres'].map(tag => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-900 bg-neutral-950 text-neutral-500">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagonal Stripes Divider */}
        <div className="stripe-divider my-8"></div>

        {/* Section: Open Source */}
        <section id="opensource" className="py-12 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Open Source</h2>
            <div className="flex-1 h-px bg-neutral-900"></div>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* PR Tab buttons list wrapper */}
            <div className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-900 bg-neutral-950/40 w-fit">
              <button 
                onClick={() => setPrTab('merged')}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  prTab === 'merged' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Merged {loadingPrs ? '..' : prCounts.merged}
              </button>
              <button 
                onClick={() => setPrTab('open')}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  prTab === 'open' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Open {loadingPrs ? '..' : prCounts.open}
              </button>
              <button 
                onClick={() => setPrTab('closed')}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  prTab === 'closed' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Closed {loadingPrs ? '..' : prCounts.closed}
              </button>
            </div>

            {/* PR Listing items */}
            <div className="flex flex-col border-t border-neutral-900">
              {loadingPrs ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  <i className="ri-loader-4-line animate-spin text-lg mr-2 inline-block align-middle"></i>
                  <span>Syncing contributions from GitHub...</span>
                </div>
              ) : prsData[prTab] && prsData[prTab].length > 0 ? (
                prsData[prTab].map((pr, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between gap-4 py-4 border-b border-neutral-900/60 animate-fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-purple-450 shrink-0 flex items-center justify-center">
                        <i className="ri-git-merge-line text-[14px]"></i>
                      </span>
                      <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
                        <a 
                          href={pr.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-neutral-200 hover:text-white hover:underline transition-all truncate"
                        >
                          {pr.title}
                        </a>
                        <span className="text-[11px] text-neutral-500 font-mono truncate">
                          {pr.repo}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono shrink-0 select-none">
                      {pr.date}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No pull requests found.
                </div>
              )}
            </div>

            {/* Footer counts */}
            {!loadingPrs && prCounts[prTab] > 5 && (
              <a 
                href={`https://github.com/Piyushbijarania?tab=pulls&q=is:pr+is:${prTab}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors pt-2 block w-fit"
              >
                Show all ({prCounts[prTab] - 5} more)
              </a>
            )}
          </div>
        </section>

        {/* Diagonal Stripes Divider */}
        <div className="stripe-divider my-8"></div>

        {/* Section: The Fun Stuff */}
        <section id="funstuff" className="py-12 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">The Fun Stuff</h2>
            <div className="flex-1 h-px bg-neutral-900"></div>
          </div>

          {/* GitHub contributions matrix grid */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest font-display">GitHub Contributions</span>
              <span className="text-xs text-neutral-400 font-mono">
                {loadingCalendar ? '...' : `${totalGithubContributions.toLocaleString()} contributions`} in the last year
              </span>
            </div>

            <div className="border border-neutral-900 rounded-2xl p-6 bg-neutral-950/20 flex flex-col gap-3">
              {/* Months labels */}
              <div className="flex justify-between text-[9px] font-mono text-neutral-600 px-1 select-none">
                {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, idx) => (
                  <span key={idx}>{m}</span>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto select-none py-1">
                {loadingCalendar ? (
                  Array.from({ length: 42 * 7 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="w-[9px] h-[9px] rounded-[1px] bg-neutral-900/40 animate-pulse"
                    ></div>
                  ))
                ) : githubCalendar ? (
                  githubCalendar.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`w-[9px] h-[9px] rounded-[1px] ${getContributionColor(day.level)}`}
                      title={`${day.date}: ${day.count} contributions`}
                    ></div>
                  ))
                ) : (
                  contributionSeed.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`w-[9px] h-[9px] rounded-[1px] ${getContributionColor(val)}`}
                      title={`${val} contributions`}
                    ></div>
                  ))
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-start gap-1.5 text-[9px] font-mono text-neutral-600 mt-2 select-none">
                <span>Less</span>
                <div className="w-[8px] h-[8px] rounded-[1px] bg-neutral-900/60"></div>
                <div className="w-[8px] h-[8px] rounded-[1px] bg-blue-950/50"></div>
                <div className="w-[8px] h-[8px] rounded-[1px] bg-blue-800/40"></div>
                <div className="w-[8px] h-[8px] rounded-[1px] bg-blue-600/60"></div>
                <div className="w-[8px] h-[8px] rounded-[1px] bg-blue-500"></div>
                <span>More</span>
              </div>
            </div>
          </div>
        </section>

        {/* Diagonal Stripes Divider */}
        <div className="stripe-divider my-8"></div>

        {/* Section: Education */}
        <section id="education" className="py-12 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Education</h2>
            <div className="flex-1 h-px bg-neutral-900"></div>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* Education 1 */}
            <div className="border border-neutral-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950/20">
              <div>
                <h4 className="font-display text-[15px] font-semibold text-white">Bachelor of Technology (Computer Science & Engineering)</h4>
                <p className="text-xs text-neutral-400">Birla Institute of Technology, Mesra</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-neutral-400 font-mono">Aug 2024 – May 2028</p>
                <p className="text-xs text-neutral-300 font-medium">Grade: 8.01 / 10.0</p>
              </div>
            </div>

            {/* Education 2 */}
            <div className="border border-neutral-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950/20">
              <div>
                <h4 className="font-display text-[15px] font-semibold text-white">Intermediate (Class XII)</h4>
                <p className="text-xs text-neutral-400">Noble Kingdom Senior Secondary School</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-neutral-400 font-mono">2022 – 2023</p>
                <p className="text-xs text-neutral-300 font-medium">Grade: 81.4%</p>
              </div>
            </div>

            {/* Education 3 */}
            <div className="border border-neutral-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950/20">
              <div>
                <h4 className="font-display text-[15px] font-semibold text-white">Matriculation (Class X)</h4>
                <p className="text-xs text-neutral-400">Noble Kingdom Senior Secondary School</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-neutral-400 font-mono">2020 – 2021</p>
                <p className="text-xs text-neutral-300 font-medium">Grade: 98.0%</p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer Divider */}
      <div className="stripe-divider mt-12"></div>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-xs text-neutral-600">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Piyush Choudhary. All rights reserved.</p>
          <p className="font-display tracking-widest text-[10px] uppercase text-neutral-500">anisight</p>
        </div>
      </footer>

      {/* Command Palette Modal */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          
          {/* Click outside backdrop close */}
          <div className="absolute inset-0" onClick={() => setIsPaletteOpen(false)}></div>
          
          <div 
            className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden z-10 font-sans"
            onKeyDown={handlePaletteKeyDown}
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 border-b border-neutral-900 px-4 py-3">
              {isTerminalMode ? (
                <span className="font-mono text-xs text-green-500 shrink-0 select-none">guest@piyush.c:~$</span>
              ) : (
                <i className="ri-search-2-line text-neutral-400 text-lg"></i>
              )}
              <input 
                ref={paletteInputRef}
                type="text"
                placeholder={isTerminalMode ? "Type command (e.g. help, skills, contact)..." : "Type a command or search..."}
                value={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isTerminalMode) {
                    e.preventDefault();
                    handleTerminalSubmit(searchQuery);
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (!isTerminalMode) setSelectedIndex(0)
                }}
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none font-mono"
              />
              <span className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500 font-mono uppercase">ESC</span>
            </div>

            {/* Results listing / Terminal logs */}
            <div className="max-h-80 overflow-y-auto p-4 font-mono text-xs text-neutral-300 space-y-1.5 bg-black/40">
              {isTerminalMode ? (
                <>
                  {terminalLogs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap leading-relaxed">
                      {log.startsWith('guest@piyush.c') ? (
                        <span className="text-green-500 font-semibold">{log}</span>
                      ) : log.startsWith('  ') ? (
                        <span className="text-neutral-400">{log}</span>
                      ) : log.startsWith('TECHNICAL') || log.startsWith('CONTACT') || log.startsWith('PROJECTS') || log.startsWith('Available') ? (
                        <span className="text-blue-400 font-bold">{log}</span>
                      ) : (
                        log
                      )}
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </>
              ) : (
                filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex
                    return (
                      <button 
                        key={cmd.id}
                        onClick={() => cmd.action()}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-4 rounded-lg px-3 py-2.5 text-left transition-all cursor-pointer ${
                          isSelected ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <i className={`${cmd.icon} text-lg ${isSelected ? 'text-white' : 'text-neutral-500'}`}></i>
                        <div className="flex-1">
                          <p className="text-xs font-semibold">{cmd.title}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{cmd.subtitle}</p>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-neutral-500">Enter ↵</span>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    No matching commands found.
                  </div>
                )
              )}
            </div>
            
            {/* Footer hints */}
            <div className="border-t border-neutral-900 px-4 py-2 flex items-center justify-between text-[10px] text-neutral-500 bg-neutral-950/40 font-mono">
              {isTerminalMode ? (
                <div className="flex items-center gap-3">
                  <span>Type &apos;gui&apos; to switch back</span>
                  <span>&apos;exit&apos; to close</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>↑↓ to navigate</span>
                  <span>enter to select</span>
                </div>
              )}
              <span>piyush.c</span>
            </div>
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {isResumeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          {/* Click outside backdrop close */}
          <div className="absolute inset-0" onClick={() => setIsResumeOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl h-[85vh] rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col overflow-hidden z-10">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3 bg-neutral-950">
              <div className="flex items-center gap-2">
                <i className="ri-file-pdf-line text-red-500 text-lg"></i>
                <span className="font-mono text-xs text-neutral-400 truncate">Piyush_Choudhary_Resume.pdf</span>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href="/resume.pdf" 
                  download="Piyush_Choudhary_Resume.pdf"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-colors"
                >
                  <i className="ri-download-line text-sm"></i>
                  <span>Download</span>
                </a>
                <button 
                  onClick={() => setIsResumeOpen(false)}
                  className="p-1.5 rounded hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            </div>

            {/* Document Iframe */}
            <div className="flex-1 bg-neutral-900 relative">
              <iframe 
                src="/resume.pdf"
                className="w-full h-full border-none"
                title="Piyush Choudhary Resume"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
