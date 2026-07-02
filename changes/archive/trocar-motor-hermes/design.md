# Design: trocar-motor-hermes

## Estado atual do motor (`lib/ai/provider.ts`)
- Transporte único OpenAI-compatível: `callModel()` → `fetch(\`${baseUrl}/chat/completions\`)` (linha 138).
- Auth: `Authorization: Bearer ${OPENAI_API_KEY}` (linha 93). Key vazia ⇒ `provider_auth_missing` (linha 207) → Hermes precisa aceitar *alguma* Bearer key.
- Slug `openai`: `baseUrl = OPENAI_BASE_URL` (default `https://api.openai.com/v1`), `model = JARBAS_AI_MODEL ?? OPENAI_MODEL` (linhas 46, 56-58).
- Headers OpenRouter só se `OPENAI_BASE_URL` inclui `openrouter.ai` (linha 97) → VPS ignora-os.
- Resposta lida em `choices[0].message.content`; `sanitizeContent()` remove tokens especiais.
- `OPENAI_MODEL` aceita lista separada por vírgula (fallback por 429).
- Chat: `app/api/jarbas/chat/route.ts` usa `DEFAULT_CHAT_POLICY` (slug `openai`, `default-chat`).

## Decisão
Reusar o slug `openai` e repontar envs. **Sem código.**

| Env | Valor |
|-----|-------|
| `OPENAI_BASE_URL` | prefixo do Hermes (`/v1` ou raiz — confirmar por curl) |
| `OPENAI_API_KEY` | token que o Hermes exige (não-vazio) |
| `OPENAI_MODEL` | id de modelo esperado pelo Hermes (ex.: `deepseek-chat`) |

Aplicar em: (1) `env/.env_hom` local; (2) Vercel `jarbas-hom` env vars (dashboard).

## Endurecimento do VPS (recomendado)
- TLS + domínio via Caddy/nginx + Let's Encrypt (ou Cloudflare Tunnel). Evita Bearer/prompts em texto claro.
- Bearer token robusto no Hermes = mesmo valor de `OPENAI_API_KEY`.
- Firewall: expor só 443; bloquear porta bruta do Hermes.

## Riscos
- **Ponto único de falha**: VPS down = chat down. Mitigar mantendo linha OpenRouter comentada como fallback.
- **Segredos já commitados** em `env/.env_hom` (OpenRouter, ElevenLabs, Supabase `sbp_`, Vercel `vcp_`, SAP) → rotacionar + parar de versionar.
- **Latência**: DeepSeek via VPS pode ser mais lenta; validar no cockpit.

## Verificação
1. curl `POST <base>/chat/completions` com Bearer → confirmar `choices[0].message.content`; decidir `/v1` vs raiz.
2. `node scripts/check-env.mjs env/.env_hom` → OK OpenAI key + model.
3. `npm run dev` → chat responde via Hermes (logs do VPS mostram hit + DeepSeek).
4. Vercel `jarbas-hom` env + redeploy → testar `jarbas-hom.vercel.app` por texto.
5. Parar Hermes 1x → Jarbas devolve `PROVIDER_CALL_FAILED_MESSAGE` (sem crash).
