# Validacao Task 8 - Jarbas Inteligente

## Escopo

Validar a etapa Jarbas Inteligente apos as Tasks 1 a 7:

- conversa por texto via backend;
- protecao de API;
- contexto e memoria;
- comandos internos;
- voz browser-native progressiva;
- POC conceitual de TTS self-host.

## Evidencias Locais

Dev server:

```text
npm run dev -- --port 3000
Next.js 16.2.9
Local: http://localhost:3000
Ready in 3.1s
```

HTTP checks:

```json
[
  {
    "name": "/login",
    "status": 200,
    "hasJarbas": true,
    "hasEntrar": true
  },
  {
    "name": "/",
    "status": 307,
    "location": "/login?redirectedFrom=%2F"
  }
]
```

API auth guard apos correcao:

```json
{
  "status": 401,
  "location": null,
  "contentType": "application/json",
  "payload": {
    "error": "unauthorized"
  }
}
```

## Correcao Aplicada Durante a Validacao

Problema encontrado:

- `POST /api/jarbas/chat` sem sessao era interceptado pelo proxy e redirecionado para `/login`.
- Com redirect automatico, o cliente recebia HTML em vez de JSON.
- Isso poderia quebrar o `JarbasShell` em sessao expirada.

Correcao:

- `lib/supabase/proxy.ts` agora retorna JSON 401 para caminhos `/api/*` sem usuario autenticado.
- Rotas de pagina continuam redirecionando para `/login`.

Teste adicionado:

- `tests/supabase-proxy.test.ts`

## POC De Voz Self-Host

Ambiente local disponivel:

- Node/npm/git disponiveis.
- Docker nao encontrado.
- `supabase` CLI nao encontrado.
- `psql` nao encontrado.
- Python no PATH aponta para WindowsApps, sem confirmacao de ambiente Python real.

Por esse motivo, a POC executavel de motor self-host nao foi rodada nesta maquina sem instalar dependencias externas pesadas. A avaliacao tecnica ficou como POC de viabilidade e decisao de arquitetura.

Opcoes avaliadas:

| Motor | Licenca / fonte | Observacao | Recomendacao |
| --- | --- | --- | --- |
| Piper | MIT no repositorio `rhasspy/piper`; vozes ONNX em `rhasspy/piper-voices` | Rapido, local, boa opcao para assistente offline; projeto original indica movimentacao de desenvolvimento | Melhor primeira POC quando Docker/binario estiver disponivel |
| Kokoro | Apache-2.0, modelo open-weight de 82M parametros | Leve e promissor, mas tende a exigir ambiente Python/modelo | Segunda opcao para qualidade/custo |
| Chatterbox | MIT, open-source TTS da Resemble AI | Mais rico, multilingual e expressivo; potencialmente mais pesado | Avaliar depois de Piper/Kokoro |

Decisao:

- Manter a app acoplada apenas a `VoiceProvider`.
- Nao acoplar Piper, Kokoro ou Chatterbox diretamente ao frontend.
- Primeira POC executavel recomendada: Piper em container/servico local expondo endpoint HTTP.

Contrato sugerido para futuro TTS self-host:

```text
POST /api/jarbas/tts
body: { "text": "Resposta do Jarbas", "voice": "pt-BR" }
response: audio/wav ou audio/mpeg
```

## Pendencias

- Aplicar `supabase/migrations/202606290001_jarbas_memory.sql` em Supabase real.
- Validar o fluxo autenticado real com usuario de teste.
- Executar POC real de Piper/Kokoro/Chatterbox em ambiente com Docker ou Python configurado.
- Fazer validacao visual com browser automation quando `agent-browser` ou Playwright estiver disponivel.

## Status

Task 8 validada parcialmente com evidencias locais:

- build e testes automatizados devem ser executados antes do fechamento;
- rotas publicas e protecao de API foram verificadas via HTTP;
- uma falha real de contrato API foi encontrada e corrigida;
- POC self-host ficou documentada por restricao de ambiente.
