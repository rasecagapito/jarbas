"use client";

import { useEffect, useRef, useState } from "react";

const navItems = ["Cluster", "Workflows", "Logs"];
const featureItems = [
  { icon: "◇", label: "Criptografia", value: "Grau Empresarial" },
  { icon: "✤", label: "Validação", value: "Sinc. Neural" },
  { icon: "↯", label: "Sincronismo", value: "99,9% Uptime" },
];

const fiberLines = [
  { x1: -120, y1: 245, x2: 430, y2: -90, width: 1.2, opacity: 0.42, tone: "cyan" },
  { x1: -90, y1: 330, x2: 760, y2: -120, width: 2.2, opacity: 0.72, tone: "cyan" },
  { x1: -60, y1: 420, x2: 620, y2: 90, width: 0.8, opacity: 0.25, tone: "cyan" },
  { x1: -30, y1: 620, x2: 845, y2: 40, width: 1.2, opacity: 0.48, tone: "cyan" },
  { x1: -30, y1: 710, x2: 1040, y2: 35, width: 3.1, opacity: 0.9, tone: "cyan" },
  { x1: 80, y1: 850, x2: 1040, y2: 230, width: 1.2, opacity: 0.38, tone: "cyan" },
  { x1: 190, y1: 950, x2: 1180, y2: 260, width: 2, opacity: 0.55, tone: "cyan" },
  { x1: 290, y1: 1010, x2: 1300, y2: 315, width: 0.9, opacity: 0.42, tone: "cyan" },
  { x1: 360, y1: 870, x2: 1060, y2: 370, width: 0.9, opacity: 0.26, tone: "cyan" },
  { x1: 500, y1: 975, x2: 1325, y2: 545, width: 0.9, opacity: 0.32, tone: "purple" },
  { x1: 520, y1: 125, x2: 870, y2: -65, width: 1, opacity: 0.22, tone: "purple" },
  { x1: 570, y1: 330, x2: 1040, y2: 15, width: 1, opacity: 0.28, tone: "cyan" },
  { x1: 640, y1: 680, x2: 1180, y2: 300, width: 1, opacity: 0.3, tone: "cyan" },
  { x1: 730, y1: 905, x2: 1460, y2: 500, width: 2.1, opacity: 0.74, tone: "cyan" },
  { x1: 760, y1: 770, x2: 1440, y2: 350, width: 0.9, opacity: 0.36, tone: "cyan" },
  { x1: 805, y1: 350, x2: 1240, y2: 70, width: 1.5, opacity: 0.38, tone: "cyan" },
  { x1: 840, y1: 260, x2: 1190, y2: 10, width: 0.9, opacity: 0.26, tone: "cyan" },
  { x1: 900, y1: 575, x2: 1425, y2: 210, width: 1.2, opacity: 0.34, tone: "cyan" },
  { x1: 920, y1: 850, x2: 1485, y2: 450, width: 1, opacity: 0.28, tone: "purple" },
  { x1: 970, y1: 225, x2: 1355, y2: -40, width: 1.7, opacity: 0.52, tone: "cyan" },
  { x1: 1010, y1: 380, x2: 1485, y2: 60, width: 2.4, opacity: 0.82, tone: "cyan" },
  { x1: 1080, y1: 495, x2: 1510, y2: 205, width: 1.1, opacity: 0.4, tone: "cyan" },
  { x1: 1110, y1: 715, x2: 1515, y2: 420, width: 1.3, opacity: 0.44, tone: "cyan" },
  { x1: 1160, y1: 260, x2: 1500, y2: 35, width: 0.9, opacity: 0.28, tone: "cyan" },
  { x1: 1195, y1: 475, x2: 1465, y2: 282, width: 1, opacity: 0.26, tone: "cyan" },
  { x1: 1230, y1: 930, x2: 1530, y2: 710, width: 2.8, opacity: 0.82, tone: "cyan" },
  { x1: 1260, y1: 170, x2: 1500, y2: -15, width: 1.1, opacity: 0.35, tone: "cyan" },
  { x1: 1305, y1: 610, x2: 1510, y2: 455, width: 1.4, opacity: 0.46, tone: "purple" },
  { x1: 1320, y1: 350, x2: 1510, y2: 210, width: 1, opacity: 0.22, tone: "cyan" },
  { x1: 1380, y1: 760, x2: 1530, y2: 650, width: 1.2, opacity: 0.38, tone: "cyan" },
] as const;

type LoginExperienceProps = {
  loginForm: React.ReactNode;
  showLoginInitially: boolean;
};

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export function LoginExperience({
  loginForm,
  showLoginInitially,
}: LoginExperienceProps) {
  const [showLogin, setShowLogin] = useState(showLoginInitially);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShowLogin(showLoginInitially);
  }, [showLoginInitially]);

  function openLogin() {
    setShowLogin(true);

    window.requestAnimationFrame(() => {
      if (
        typeof window.matchMedia === "function" &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        window.scrollTo({
          behavior: "smooth",
          top: 0,
        });
      }
    });
  }

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.userAgent.toLowerCase().includes("jsdom")
    ) {
      return;
    }

    const canvas = canvasRef.current;
    let ctx: CanvasRenderingContext2D | null | undefined;

    try {
      ctx = canvas?.getContext("2d");
    } catch {
      ctx = null;
    }

    if (!canvas || !ctx) {
      return;
    }

    const canvasElement = canvas;
    const drawingContext = ctx;
    let rafId = 0;
    const rng = createSeededRandom(730197);
    const fibers = Array.from({ length: 128 }, () => {
      const isCyan = rng() > 0.2;
      const isPurple = !isCyan && rng() > 0.35;
      const rgb = isCyan ? "0,219,233" : isPurple ? "109,59,215" : "0,240,255";
      const bright = rng() > 0.68;

      return {
        x: rng() * window.innerWidth * 1.65 - window.innerWidth * 0.35,
        y: rng() * window.innerHeight * 1.5 - window.innerHeight * 0.16,
        angle: ((20 + rng() * 30) * Math.PI) / 180,
        length: 420 + rng() * 960,
        speedX: 0.05 + rng() * 0.12,
        speedY: -(0.05 + rng() * 0.12),
        alpha: bright ? 0.72 + rng() * 0.2 : 0.24 + rng() * 0.42,
        width: bright ? 1.25 + rng() * 1.8 : 0.45 + rng() * 0.85,
        glow: bright ? 18 : 8,
        rgb,
      };
    });

    function resize() {
      const pixelRatio = window.devicePixelRatio || 1;
      canvasElement.width = Math.floor(window.innerWidth * pixelRatio);
      canvasElement.height = Math.floor(window.innerHeight * pixelRatio);
      canvasElement.style.width = `${window.innerWidth}px`;
      canvasElement.style.height = `${window.innerHeight}px`;
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      drawingContext.clearRect(0, 0, width, height);

      for (const fiber of fibers) {
        const endX = fiber.x + Math.cos(fiber.angle) * fiber.length;
        const endY = fiber.y - Math.sin(fiber.angle) * fiber.length;
        const gradient = drawingContext.createLinearGradient(
          fiber.x,
          fiber.y,
          endX,
          endY,
        );

        gradient.addColorStop(0, `rgba(${fiber.rgb},0)`);
        gradient.addColorStop(0.14, `rgba(${fiber.rgb},${fiber.alpha})`);
        gradient.addColorStop(0.86, `rgba(${fiber.rgb},${fiber.alpha})`);
        gradient.addColorStop(1, `rgba(${fiber.rgb},0)`);

        drawingContext.beginPath();
        drawingContext.moveTo(fiber.x, fiber.y);
        drawingContext.lineTo(endX, endY);
        drawingContext.strokeStyle = gradient;
        drawingContext.lineWidth = fiber.width;
        drawingContext.shadowBlur = fiber.glow;
        drawingContext.shadowColor = `rgba(${fiber.rgb},0.58)`;
        drawingContext.stroke();

        fiber.x += fiber.speedX;
        fiber.y += fiber.speedY;

        if (fiber.y < -height * 0.55) {
          fiber.y = height * 1.25;
          fiber.x = rng() * width * 1.65 - width * 0.35;
        }

        if (fiber.x > width * 1.35) {
          fiber.x = -width * 0.35;
          fiber.y = rng() * height * 1.5 - height * 0.16;
        }
      }

      drawingContext.shadowBlur = 0;
      rafId = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main
      className={`jarbas-login-shell relative min-h-screen overflow-hidden text-jarbas-text ${
        showLogin ? "jarbas-login-open" : ""
      }`}
    >
      <div className="jarbas-neural-bg" aria-hidden="true">
        <svg
          className="jarbas-neural-static"
          preserveAspectRatio="none"
          viewBox="0 0 1440 960"
        >
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              height="260%"
              id="jarbas-cyan-glow"
              width="260%"
              x="-80%"
              y="-80%"
            >
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              colorInterpolationFilters="sRGB"
              height="260%"
              id="jarbas-purple-glow"
              width="260%"
              x="-80%"
              y="-80%"
            >
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {fiberLines.map((line, index) => (
            <line
              className={`jarbas-static-fiber jarbas-static-fiber-${line.tone}`}
              filter={`url(#jarbas-${line.tone}-glow)`}
              key={`${line.x1}-${line.y1}-${index}`}
              opacity={line.opacity}
              strokeLinecap="round"
              strokeWidth={line.width}
              x1={line.x1}
              x2={line.x2}
              y1={line.y1}
              y2={line.y2}
            />
          ))}
        </svg>
        <canvas
          className="jarbas-neural-canvas"
          ref={canvasRef}
        />
        <span className="jarbas-bg-blob jarbas-bg-blob-left" />
        <span className="jarbas-bg-blob jarbas-bg-blob-right" />
      </div>

      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-jarbas-surface/45 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1640px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
          <a className="flex min-w-0 items-center gap-3" href="#">
            <span className="jarbas-orchestrator-mark" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-black text-jarbas-text">
                Jarbas / S.A.M.
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.38em] text-jarbas-text/80 sm:block">
                Secure Automated Multi-Agent
              </span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-9 font-display text-base font-bold text-jarbas-text/90 lg:flex"
            aria-label="Navegação visual"
          >
            {navItems.map((item) => (
              <a
                className="transition hover:text-jarbas-cyan"
                href="#"
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-4">
            <button
              className="font-display text-base font-bold text-jarbas-text/90 transition hover:text-jarbas-cyan"
              onClick={openLogin}
              type="button"
            >
              Entrar
            </button>
            <a
              className="jarbas-dark-pill hidden px-7 py-3 font-display text-base font-bold sm:inline-flex"
              href="#"
            >
              Começar
            </a>
          </div>
        </div>
      </header>

      <section className="jarbas-login-layout relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] items-center gap-10 px-4 pb-12 pt-28 sm:px-8 lg:grid-cols-12 lg:px-10 lg:pt-24">
        <div className="jarbas-login-hero min-w-0 space-y-11 lg:col-span-6">
          <div className="max-w-xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-jarbas-cyan/20 bg-jarbas-panel/55 px-4 py-2 text-lg text-jarbas-text backdrop-blur-xl">
              <span className="text-jarbas-cyan">✣</span>
              A PRÓXIMA GERAÇÃO CHEGOU
            </div>

            <div className="space-y-7">
              <h1 className="font-display text-lg font-medium leading-relaxed text-jarbas-text sm:text-xl">
                Acesso Neural Seguro ao{" "}
                <span className="text-jarbas-cyan">futuro.</span>
              </h1>
              <p className="max-w-[560px] text-lg leading-8 text-jarbas-text/95">
                Orquestrando nós descentralizados com criptografia quântica e
                gerenciamento de agentes de IA de alta fidelidade. Preciso,
                cerebral e soberano.
              </p>
            </div>

            <div className="flex flex-wrap gap-5 pt-5">
              <a
                className="jarbas-dark-button inline-flex items-center gap-3 px-9 py-5"
                href="#"
              >
                Começar
                <span aria-hidden="true">→</span>
              </a>
              <a
                className="jarbas-outline-button inline-flex items-center px-9 py-5"
                href="#"
              >
                Documentação
              </a>
            </div>
          </div>

          <div className="grid max-w-[700px] gap-8 sm:grid-cols-3">
            {featureItems.map((item) => (
              <div className="space-y-3" key={item.label}>
                <div className="flex items-center gap-3 text-lg uppercase text-jarbas-text/90">
                  <span className="text-jarbas-text/90">{item.icon}</span>
                  {item.label}
                </div>
                <p className="text-xl text-jarbas-text">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex min-w-0 justify-center lg:col-span-6 lg:justify-end lg:pr-8"
          id="jarbas-login-panel"
          ref={panelRef}
        >
          {showLogin ? (
            <div className="jarbas-login-reveal w-full">{loginForm}</div>
          ) : (
            <div
              aria-hidden="true"
              className="hidden w-full max-w-[420px] lg:block"
            />
          )}
        </div>
      </section>
    </main>
  );
}
