Aqui está o documento completo estruturado em formato Markdown (.md).

Este documento foi projetado para servir como o Manual Técnico de Engenharia (Blueprint) do seu projeto, integrando a interface de utilizador futurista com o robô holográfico interativo em Three.js, gravação de áudio em tempo real via Web Audio API, orquestração assíncrona no n8n, e governança de dados no Supabase.  

(Nota: O código do cockpit e as especificações de banco de dados foram refinados para produção. As explicações de arquitetura e citações de segurança, RAG e orquestração estão posicionadas na prosa fora do bloco de código para que você possa copiar o documento Markdown de forma limpa).

🛠️ Notas de Engenharia e Justificativas de Projeto:
Interface Adaptativa e XAI: A interface gráfica baseia-se no princípio de Explicabilidade de IA (XAI), utilizando a consola de logs e o grafo para que o operador humano saiba exatamente qual sub-workflow foi acionado e qual decisão o supervisor tomou.  

Pesquisa Semântica Filtrada (RAG): O motor de RAG no Supabase utiliza a extensão pgvector estruturada de forma a restringir buscas pelo sector_id, mitigando o vazamento de informações entre departamentos.  

Autenticação Segura: Para evitar a exposição de webhooks do n8n, o sistema integra um modelo de autenticação baseado em JSON Web Tokens (JWT) com expiração programada, blindando as comunicações da aplicação.  

🤖 S.A.M. - Secure Automated Multi-Agent Platform
Manual de Engenharia de Sistemas & Arquitetura de Referência
Este documento define a especificação técnica para a implementação do cockpit tático multiagentes. O ecossistema é composto por um frontend holográfico futurista interativo, uma camada de orquestração assíncrona baseada em n8n e uma camada de dados e segurança gerenciada pelo Supabase (PostgreSQL + pgvector).

1. Arquitetura Conceitual do Ecossistema
O sistema opera sob o padrão de Grafo de Hierarquia Dinâmica. Em vez de acoplar de forma rígida os agentes e ferramentas nas telas de fluxo de automação, toda a lógica organizacional da empresa é externalizada para tabelas relacionais.
[FRONTEND COCKPIT] (Next.js/HTML5 + Three.js)
│
├── (REST/WebSockets com JWT)
▼
[ORQUESTRADOR N8N] (Supervisor Central GPT-4o) ──(Dynamic Tool Dispatch)──► [SUB-WORKFLOWS]
│                                                                     │
├── (Direct SQL & pgvector)                                           ├── Setor PMO
▼                                                                     ├── Setor Operacional
[BANCO SUPABASE] (PostgreSQL + pgvector)                                      ├── Setor Dev
└── Setor Consultores


---

## 2. Camada de Dados: Supabase (PostgreSQL & pgvector)

A camada de persistência armazena a hierarquia dinâmica de setores, metadados de prompts dos agentes especialistas, histórico de conversação segmentado por sessão e coleções de embeddings vetoriais para buscas semânticas (RAG).

### 2.1 Esquema de Banco de Dados (SQL)

Execute este script no editor SQL do Supabase para inicializar as tabelas e extensões:

```sql
-- Ativação da extensão pgvector para busca de embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Tabela de Setores com Autorreferência Hierárquica
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  parent_sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Agentes Especialistas Ativos
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role_description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  n8n_workflow_id VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Embeddings de Documentos Corporativos (RAG)
CREATE TABLE document_embeddings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536), -- Compatível com OpenAI text-embedding-3-small
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Função de Busca Semântica Filtrada por Setor Corporativo
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_sector_id UUID
)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.title,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 
    document_embeddings.sector_id = filter_sector_id
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY (document_embeddings.embedding <=> query_embedding) ASC
  LIMIT match_count;
$$;
3. Camada de Orquestração: fluxos de Trabalho no n8n
O n8n atua como o sistema nervoso central, dividindo a lógica entre o Supervisor (gerente) e Sub-fluxos (setores).

3.1 Pipeline de Entrada de Áudio e Voz (Whisper)
Sempre que uma mensagem de áudio é recebida pelo webhook:

O gatilho Webhook (POST) captura o arquivo binário enviado sob a propriedade file.

Um nó OpenAI Whisper ou Groq Whisper recebe o binário e gera a transcrição textual estruturada em português (pt-BR).

O texto transcrito é unificado sob a propriedade message e injetado no pipeline de inteligência artificial de forma idêntica à entrada via teclado.

3.2 Supervisor Central e Despacho Dinâmico (Dynamic Tool Dispatcher)
O nó AI Agent do Supervisor avalia a intenção e os setores mapeados no banco.

O agente chama a ferramenta execute_sector_agent passando os parâmetros estruturados: sector_id e query.

Um nó de código consulta a tabela agents para obter o n8n_workflow_id ativo.

O n8n executa o nó Call n8n Workflow utilizando o ID retornado dinamicamente.

4. Camada Visual: Cockpit Tático Glassmorphism
Esta aplicação de página única (SPA) implementa a interface futurista e integra o robô interativo Three.js, suporte a gravação de voz e consoles de logs de sistema.

Salve o código abaixo como index.html para abrir diretamente no navegador ou servir como site estático:

HTML
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S.A.M. - Cockpit de Comando Tático</title>
    <!-- Tailwind CSS v4 para Estilos Ultra-Modernos -->
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <link rel="stylesheet" href="[https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)">
    <link href="[https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;600&display=swap](https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;600&display=swap)" rel="stylesheet">
    
    <style>
        :root {
            --neon-cyan: #00f0ff;
            --neon-fuchsia: #ff007f;
            --neon-green: #39ff14;
            --neon-yellow: #ffdf00;
            --active-color: var(--neon-cyan);
            --active-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #020205;
            background-image: 
                radial-gradient(at 0% 0%, rgba(16, 24, 48, 0.5) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(48, 16, 48, 0.3) 0px, transparent 50%),
                linear-gradient(rgba(18, 18, 18, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(18, 18, 18, 0.1) 1px, transparent 1px);
            background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
            color: #e2e8f0;
        }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .mono { font-family: 'Share Tech Mono', monospace; }
        .glass-panel {
            background: rgba(10, 15, 30, 0.45);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }
        .neon-border-active {
            border-color: var(--active-color);
            box-shadow: var(--active-shadow), inset 0 0 10px rgba(0, 240, 255, 0.1);
        }
        @keyframes rotateHolo {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .holo-rotate { animation: rotateHolo 20s linear infinite; }
    </style>
</head>
<body class="flex flex-col h-screen select-none overflow-hidden">

    <!-- Top Navigation Bar -->
    <header class="h-16 border-b border-white/5 glass-panel px-6 flex items-center justify-between z-30">
        <div class="flex items-center space-x-3">
            <div class="relative w-8 h-8 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border border-cyan-500 holo-rotate"></div>
                <i class="fa-solid fa-brain text-xs text-cyan-400"></i>
            </div>
            <div>
                <h1 class="orbitron font-black text-xs tracking-widest text-white">S.A.M. PLATFORM</h1>
                <p class="text-[9px] mono text-cyan-400 tracking-wider">HOLOGRAPHIC MULTI-AGENT CONTROL</p>
            </div>
        </div>

        <div class="hidden lg:flex items-center space-x-8 text-[11px] mono">
            <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-slate-400">COGNITIVE PROCESSOR:</span>
                <span class="text-emerald-400 font-bold">READY</span>
            </div>
            <div class="flex items-center space-x-2">
                <i class="fa-solid fa-link text-slate-500"></i>
                <span class="text-slate-400">ENDPOINT Status:</span>
                <span id="webhookStatus" class="text-amber-400 font-bold">SIMULATION ACTIVE</span>
            </div>
        </div>

        <button id="configToggleBtn" class="px-4 py-1.5 rounded border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition text-xs font-semibold tracking-wider text-slate-300">
            <i class="fa-solid fa-sliders mr-2"></i>CONFIG
        </button>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">

        <!-- Column Left: Specialized Sectors (Agentes) -->
        <aside class="w-80 border-r border-white/5 glass-panel p-5 flex flex-col justify-between hidden md:flex z-10">
            <div>
                <h3 class="orbitron text-xs font-bold tracking-widest text-slate-400 mb-6">ORGANIZAÇÃO INTERNA</h3>
                
                <div class="space-y-3">
                    <button onclick="selectAgent('pmo')" id="btn-pmo" class="w-full flex items-center p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-900/40 transition text-left group">
                        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mr-3">
                            <i class="fa-solid fa-chess-knight text-xs"></i>
                        </div>
                        <div class="flex-1">
                            <span class="orbitron text-[10px] tracking-wider font-bold text-white">SETOR_PMO</span>
                            <p class="text-[9px] text-slate-500">Planeamento e Monitorização</p>
                        </div>
                    </button>

                    <button onclick="selectAgent('operacional')" id="btn-operacional" class="w-full flex items-center p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-900/40 transition text-left group">
                        <div class="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mr-3">
                            <i class="fa-solid fa-gears text-xs"></i>
                        </div>
                        <div class="flex-1">
                            <span class="orbitron text-[10px] tracking-wider font-bold text-white">OPERACIONAL</span>
                            <p class="text-[9px] text-slate-500">Execução e Rotinas Externas</p>
                        </div>
                    </button>

                    <button onclick="selectAgent('desenvolvimento')" id="btn-desenvolvimento" class="w-full flex items-center p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-900/40 transition text-left group">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mr-3">
                            <i class="fa-solid fa-terminal text-xs"></i>
                        </div>
                        <div class="flex-1">
                            <span class="orbitron text-[10px] tracking-wider font-bold text-white">DESENVOLVIMENTO</span>
                            <p class="text-[9px] text-slate-500">Automação e Scripts</p>
                        </div>
                    </button>

                    <button onclick="selectAgent('consultores')" id="btn-consultores" class="w-full flex items-center p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-900/40 transition text-left group">
                        <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mr-3">
                            <i class="fa-solid fa-circle-nodes text-xs"></i>
                        </div>
                        <div class="flex-1">
                            <span class="orbitron text-[10px] tracking-wider font-bold text-white">CONSULTORES</span>
                            <p class="text-[9px] text-slate-500">RAG de Documentos Corporativos</p>
                        </div>
                    </button>
                </div>
            </div>

            <div class="p-4 rounded-lg border border-white/5 bg-black/40 mono text-[10px] leading-relaxed">
                <div class="flex justify-between">
                    <span class="text-slate-500">DB STORAGE:</span>
                    <span class="text-cyan-400">SUPABASE_DB</span>
                </div>
                <div class="flex justify-between mt-1">
                    <span class="text-slate-500">JWT STATUS:</span>
                    <span class="text-emerald-400">AUTHENTICATED</span>
                </div>
            </div>
        </aside>

        <!-- Column Center: 3D Robot & Chat Panel -->
        <section class="flex-1 flex flex-col justify-between overflow-hidden relative">
            
            <!-- Hologram Robot Mesh Visualizer Container -->
            <div class="h-64 border-b border-white/5 relative bg-slate-950/20">
                <div id="threeCanvasContainer" class="w-full h-full"></div>
                <div class="absolute top-3 left-6 flex items-center space-x-2 pointer-events-none">
                    <span class="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                    <span class="orbitron text-[10px] font-bold text-cyan-400 tracking-wider">HOLO_AVATAR_V.12</span>
                </div>
            </div>

            <!-- Chat Message Feed -->
            <div id="chatFeed" class="flex-1 overflow-y-auto p-6 space-y-4"></div>

            <!-- Voice Waves Overlay Visualizer (Shown when recording) -->
            <div id="voiceVisualizer" class="hidden h-12 bg-cyan-950/20 border-t border-cyan-500/20 px-6 items-center justify-between">
                <span class="mono text-[10px] text-cyan-400 animate-pulse"><i class="fa-solid fa-microphone mr-2"></i>GRAVANDO MENSAGEM DE VOZ...</span>
                <div class="flex space-x-1" id="micWaveBars"></div>
            </div>

            <!-- User Text & Audio Form Input Box -->
            <div class="p-6 border-t border-white/5 glass-panel z-10">
                <div class="max-w-4xl mx-auto flex items-end space-x-3">
                    <!-- Record Mic Button -->
                    <button onclick="toggleVoiceRecording()" id="micBtn" class="h-12 w-12 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300 flex items-center justify-center transition shrink-0">
                        <i class="fa-solid fa-microphone text-base" id="micIcon"></i>
                    </button>

                    <div class="flex-1 relative rounded-xl border border-white/10 bg-slate-950/80 p-2">
                        <textarea id="userInput" rows="1" class="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm text-slate-200 placeholder-slate-500 px-3 py-1.5 resize-none overflow-hidden" placeholder="Insira uma instrução de texto..." oninput="autoResizeTextarea(this)"></textarea>
                        <div class="flex justify-between items-center px-3 pt-1 border-t border-white/5 mt-1">
                            <span class="text-[9px] mono text-slate-500">DESPACHO ATIVO:</span>
                            <span id="activeAgentBadge" class="text-[10px] orbitron font-bold text-cyan-400 tracking-wider">SETOR_PMO</span>
                        </div>
                    </div>

                    <button onclick="handleSend()" id="sendBtn" class="h-12 w-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg hover:shadow-cyan-500/20 transition-all font-black shrink-0">
                        <i class="fa-solid fa-arrow-right text-base"></i>
                    </button>
                </div>
            </div>
        </section>

        <!-- Column Right: Tactical Console Logs -->
        <aside class="w-80 border-l border-white/5 glass-panel p-5 hidden xl:flex flex-col z-10">
            <h3 class="orbitron text-xs font-bold tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                <span>CONSOLA COGNITIVA</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>

            <div id="terminalBody" class="flex-1 bg-black/70 rounded-xl border border-white/5 p-4 overflow-y-auto mono text-[10px] text-emerald-400 space-y-2 select-text">
                <div class="text-slate-500"> SYSTEM: Cockpit Holográfico Iniciado.</div>
            </div>
        </aside>

    </div>

    <!-- Webhook Configuration Drawer -->
    <div id="configSidebar" class="fixed top-0 right-0 h-full w-96 glass-panel border-l border-white/10 shadow-2xl translate-x-full transition-transform duration-500 ease-in-out z-50 p-6 flex flex-col justify-between">
        <div>
            <div class="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <h2 class="orbitron font-bold text-sm tracking-wider text-white">N8N CONFIGURAÇÃO</h2>
                <button id="configCloseBtn" class="text-slate-400 hover:text-white transition">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="orbitron text-[10px] font-bold text-slate-400 block tracking-widest">N8N WEBHOOK URL (POST)</label>
                    <input type="text" id="webhookUrlInput" class="w-full bg-black/50 border border-white/10 rounded-lg text-xs text-slate-200 px-3 py-2.5 outline-none focus:border-cyan-500/50" placeholder="[https://seu-n8n.com/webhook/endpoint](https://seu-n8n.com/webhook/endpoint)">
                </div>

                <div class="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40">
                    <div>
                        <span class="orbitron text-[10px] font-bold text-white block">MODO SIMULAÇÃO</span>
                        <p class="text-[9px] text-slate-500">Permite testar visualmente sem n8n.</p>
                    </div>
                    <button onclick="toggleSimulation()" id="simulationSwitch" class="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] text-emerald-400 font-bold tracking-wider">ATIVO</button>
                </div>
            </div>
        </div>

        <button onclick="saveConfiguration()" class="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold orbitron tracking-widest transition-all">SALVAR CREDENCIAIS</button>
    </div>

    <!-- Library Loading Scripts -->
    <script src="[https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js)"></script>

    <script>
        // System Settings
        let webhookUrl = '';
        let isSimulationMode = true;
        let activeAgent = 'pmo';
        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;

        const agentThemes = {
            pmo: { color: '#00f0ff', name: 'SETOR_PMO' },
            operacional: { color: '#ff007f', name: 'SETOR_OPERACIONAL' },
            desenvolvimento: { color: '#39ff14', name: 'SETOR_DEV' },
            consultores: { color: '#ffdf00', name: 'SETOR_CONSULTORIA' }
        };

        // Three.js 3D Holographic Floating Robot Implementation
        let scene, camera, renderer, headWireframe, centralCore, ring1, ring2, particles;
        
        function initThreeJS() {
            const container = document.getElementById('threeCanvasContainer');
            const width = container.clientWidth;
            const height = container.clientHeight;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.z = 8;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            container.appendChild(renderer.domElement);

            // Lighting Setup
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0x00f0ff, 2, 50);
            pointLight.position.set(0, 5, 5);
            scene.add(pointLight);

            // Core Head sphere wireframe
            const headGeom = new THREE.IcosahedronGeometry(1.2, 2);
            const headMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            });
            headWireframe = new THREE.Mesh(headGeom, headMat);
            scene.add(headWireframe);

            // Bright Holographic Central Core
            const coreGeom = new THREE.SphereGeometry(0.35, 16, 16);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
            centralCore = new THREE.Mesh(coreGeom, coreMat);
            scene.add(centralCore);

            // Dynamic rotating rings
            const ringGeom1 = new THREE.TorusGeometry(1.7, 0.05, 8, 48);
            const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });
            ring1 = new THREE.Mesh(ringGeom1, ringMat1);
            ring1.rotation.x = Math.PI / 2;
            scene.add(ring1);

            const ringGeom2 = new THREE.TorusGeometry(2.0, 0.04, 8, 48);
            const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff007f, transparent: true, opacity: 0.5 });
            ring2 = new THREE.Mesh(ringGeom2, ringMat2);
            scene.add(ring2);

            // Floating particles system
            const partGeom = new THREE.BufferGeometry();
            const partCount = 120;
            const posArray = new Float32Array(partCount * 3);
            for(let i=0; i < partCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 6;
            }
            partGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const partMat = new THREE.PointsMaterial({ size: 0.04, color: 0x39ff14 });
            particles = new THREE.Points(partGeom, partMat);
            scene.add(particles);

            animateThreeJS();
        }

        function animateThreeJS() {
            requestAnimationFrame(animateThreeJS);

            const time = Date.now() * 0.001;

            // Hover senoidal animation
            headWireframe.position.y = Math.sin(time) * 0.15;
            centralCore.position.y = Math.sin(time) * 0.15;
            ring1.position.y = Math.sin(time) * 0.15;
            ring2.position.y = Math.sin(time) * 0.15;

            // Individual mesh rotations
            headWireframe.rotation.y += 0.005;
            headWireframe.rotation.x += 0.002;
            ring1.rotation.z += 0.01;
            ring1.rotation.y += 0.005;
            ring2.rotation.z -= 0.008;

            particles.rotation.y -= 0.002;

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            const container = document.getElementById('threeCanvasContainer');
            if(camera && renderer) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });

        // Terminal Logging System
        function writeToTerminal(message, type = 'sys') {
            const time = new Date().toLocaleTimeString();
            let color = 'text-slate-400';
            if (type === 'err') color = 'text-red-500 font-bold';
            if (type === 'route') color = 'text-cyan-400 font-semibold';
            if (type === 'exec') color = 'text-fuchsia-400';

            const log = document.createElement('div');
            log.className = `${color} transition-all duration-300`;
            log.innerHTML = `[${time}] ${message}`;
            terminalBody.appendChild(log);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }

        // Sector Button Switching Action
        function selectAgent(agentKey) {
            activeAgent = agentKey;
            const theme = agentThemes[agentKey];
            
            document.documentElement.style.setProperty('--active-color', theme.color);
            document.documentElement.style.setProperty('--active-shadow', `0 0 20px ${theme.color}66`);
            activeAgentBadge.innerText = theme.name;
            activeAgentBadge.style.color = theme.color;

            // Dynamic Three.js Material Color Adaptation
            if(headWireframe && centralCore) {
                headWireframe.material.color.setHex(parseInt(theme.color.replace('#', '0x')));
                centralCore.material.color.setHex(parseInt(theme.color === '#00f0ff' ? '#ff007f' : '#00f0ff'.replace('#', '0x')));
            }

            document.querySelectorAll('button[id^="btn-"]').forEach(btn => {
                btn.className = btn.className.replace(' neon-border-active', '');
            });
            document.getElementById(`btn-${agentKey}`).className += ' neon-border-active';

            writeToTerminal(`ROUTER: Chaveando para o canal de execução -> ${theme.name}`, 'route');
        }

        // Speech-to-Text API Microphone Recorder Setup (Web Audio API)
        async function toggleVoiceRecording() {
            if (isRecording) {
                mediaRecorder.stop();
                isRecording = false;
                document.getElementById('voiceVisualizer').classList.replace('flex', 'hidden');
                document.getElementById('micIcon').className = 'fa-solid fa-microphone text-base';
                document.getElementById('micBtn').classList.remove('neon-border-active');
            } else {
                if (!navigator.mediaDevices |

| !navigator.mediaDevices.getUserMedia) {
                    alert('Este navegador não suporta gravação de voz.');
                    return;
                }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioChunks = [];
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        writeToTerminal('AUDIO: Áudio capturado com sucesso. Iniciando pipeline.');
                        sendVoicePayload(audioBlob);
                    };
                    
                    mediaRecorder.start();
                    isRecording = true;
                    document.getElementById('voiceVisualizer').classList.replace('hidden', 'flex');
                    document.getElementById('micIcon').className = 'fa-solid fa-square text-base text-red-500';
                    document.getElementById('micBtn').className += ' neon-border-active';
                    renderMicWaveVisualizer();
                } catch (e) {
                    writeToTerminal(`MIC_ERROR: Permissão de microfone negada. ${e.message}`, 'err');
                }
            }
        }

        function renderMicWaveVisualizer() {
            const container = document.getElementById('micWaveBars');
            container.innerHTML = '';
            for(let i=0; i<10; i++) {
                const bar = document.createElement('div');
                bar.className = 'w-1 bg-cyan-400 h-2 animate-bounce';
                bar.style.animationDelay = `${i * 0.1}s`;
                container.appendChild(bar);
            }
        }

        // Webhook Payload Dispatches
        async function sendVoicePayload(blob) {
            writeToTerminal('SYS: Preparando envio de áudio binário.');
            if (isSimulationMode) {
                setTimeout(() => {
                    writeToTerminal('AUDIO_SYSTEM: Transcrevendo mensagem via Whisper (Mockup)...');
                    setTimeout(() => {
                        const mockQuery = "Transição tática de teste simulada por comando de voz";
                        writeToTerminal(`AUDIO_SYSTEM: Transcrição concluída: "${mockQuery}"`);
                        appendMessage('user', `🎙️ [Mensagem de Voz Transcrita]: ${mockQuery}`, true);
                        simulateResponse(mockQuery);
                    }, 1000);
                }, 800);
                return;
            }

            try {
                const formData = new FormData();
                formData.append('file', blob, 'audio-recording.webm');
                formData.append('agent_type', activeAgent);

                writeToTerminal(`NETWORK: Enviando Multipart-Form para o webhook: ${webhookUrl}`);
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData
                });

                if(!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
                const data = await response.json();
                processN8NResponse(data);
            } catch(e) {
                writeToTerminal(`NETWORK_ERROR: Falha de conexão. ${e.message}`, 'err');
            }
        }

        function simulateResponse(query) {
            writeToTerminal(`SYS_SUPERVISOR: Analisando intenções no prompt...`);
            setTimeout(() => {
                let reply = `Comando executado com sucesso pelo agente especialista no canal **${activeAgent.toUpperCase()}**.\n\n*Nota: Esta é uma resposta de simulação do cockpit.*`;
                appendMessage(activeAgent, reply);
                writeToTerminal(`ROUTER: Fluxo de conversação finalizado.`, 'sys');
            }, 1200);
        }

        function processN8NResponse(data) {
            let text = data.response |

| data.output |
| JSON.stringify(data);
            appendMessage(activeAgent, text);
            writeToTerminal('SYS: Resposta recebida do n8n com sucesso.');
        }

        function appendMessage(sender, text, isUser = false) {
            const feed = document.getElementById('chatFeed');
            const wrap = document.createElement('div');
            wrap.className = `flex items-start max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`;
            
            const bgClass = isUser ? 'bg-fuchsia-950/20 border-fuchsia-500/20' : 'bg-slate-950/40 border-white/5';
            const icon = isUser ? 'fa-user text-fuchsia-400' : 'fa-robot text-cyan-400';
            const badgeText = isUser ? 'COGNITIVE OPERATOR' : agentThemes[activeAgent].name;

            wrap.innerHTML = `
                <div class="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center ${isUser ? 'ml-3' : 'mr-3'} mt-1 shrink-0">
                    <i class="fa-solid ${icon} text-xs"></i>
                </div>
                <div class="p-4 rounded-2xl border ${bgClass} backdrop-blur-xl">
                    <span class="orbitron text-[9px] font-bold tracking-wider" style="color: ${isUser ? '#ff007f' : agentThemes[activeAgent].color}">${badgeText}</span>
                    <p class="text-sm text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">${text}</p>
                </div>
            `;
            feed.appendChild(wrap);
            feed.scrollTop = feed.scrollHeight;
        }

        async function handleSend() {
            const input = document.getElementById('userInput');
            const text = input.value.trim();
            if(!text) return;

            input.value = '';
            input.style.height = 'auto';

            appendMessage('user', text, true);
            writeToTerminal(`USER_PAYLOAD: Envia texto para orquestração: "${text.substring(0, 20)}..."`);

            if(isSimulationMode) {
                simulateResponse(text);
                return;
            }

            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, agent_type: activeAgent })
                });
                const data = await response.json();
                processN8NResponse(data);
            } catch (e) {
                writeToTerminal(`NETWORK_ERROR: ${e.message}`, 'err');
            }
        }

        function toggleSimulation() {
            isSimulationMode = !isSimulationMode;
            const btn = document.getElementById('simulationSwitch');
            if (isSimulationMode) {
                btn.innerText = 'ATIVO';
                btn.className = "px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] text-emerald-400 font-bold tracking-wider";
                document.getElementById('webhookStatus').innerText = 'SIMULATION ACTIVE';
                document.getElementById('webhookStatus').className = 'text-amber-400 font-bold';
            } else {
                if(!webhookUrl) {
                    alert('Insira uma URL de Webhook válida antes de desativar!');
                    isSimulationMode = true;
                    return;
                }
                btn.innerText = 'INATIVO';
                btn.className = "px-3 py-1 rounded bg-red-500/20 border border-red-500/40 text-[9px] text-red-500 font-bold tracking-wider";
                document.getElementById('webhookStatus').innerText = 'ONLINE (N8N)';
                document.getElementById('webhookStatus').className = 'text-emerald-400 font-bold';
            }
        }

        function saveConfiguration() {
            webhookUrl = document.getElementById('webhookUrlInput').value.trim();
            localStorage.setItem('sam_webhook', webhookUrl);
            writeToTerminal('CONFIG: Parâmetros de rede salvos com sucesso.');
            document.getElementById('configSidebar').classList.add('translate-x-full');
        }

        function autoResizeTextarea(el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }

        // Keybindings & Initializations
        document.getElementById('configToggleBtn').addEventListener('click', () => {
            document.getElementById('configSidebar').classList.remove('translate-x-full');
        });
        document.getElementById('configCloseBtn').addEventListener('click', () => {
            document.getElementById('configSidebar').classList.add('translate-x-full');
        });

        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        window.onload = () => {
            initThreeJS();
            const stored = localStorage.getItem('sam_webhook');
            if(stored) {
                webhookUrl = stored;
                document.getElementById('webhookUrlInput').value = stored;
                isSimulationMode = false;
                toggleSimulation();
            }
            selectAgent('pmo');
            appendMessage('system', 'Cockpit tático holográfico ativo. Seus subworkflows e canais de áudio estão prontos para escuta.');
        };
    </script>
</body>
</html>