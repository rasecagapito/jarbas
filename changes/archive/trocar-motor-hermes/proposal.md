# Mudança: trocar-motor-hermes

> ENCERRADA 2026-07-02 — Hermes descartado; motor mantido em OpenRouter (plano anterior). Nunca aplicada (só scaffolding, sem código/env alterado).

## Porquê
O motor de chat do Jarbas usa modelos *free* do OpenRouter (Gemma/Nemotron) que sofrem `429/404`, deixando o HOM instável. Já existe um **agente Hermes num VPS** (SSH/IP/root) que consome a **API DeepSeek** e expõe interface **OpenAI-compatível**. Substituir o motor pelo Hermes traz estabilidade (sai do free-tier), mantém a chave DeepSeek só no VPS (fora do Jarbas) e centraliza a lógica de agente no Hermes.

## Escopo
**Entra:**
- Repontar o motor `openai` (slug já usado por `DEFAULT_CHAT_POLICY`) para o Hermes via env: `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`.
- Aplicar em `env/.env_hom` (local, sem commitar segredos) e nas env vars do Vercel `jarbas-hom`.
- Verificação end-to-end (curl ao Hermes, dev local, HOM, falha controlada).
- Recomendações de endurecimento do VPS (TLS/auth/firewall) — documentadas.

**NÃO entra:**
- Alteração de código em `lib/ai/provider.ts` ou `app/api/jarbas/chat/route.ts` (troca é config-only).
- Uso do slug `openai_compatible` (exigiria mudar policy + router).
- Voz/TTS (ElevenLabs continua pausada).
- Promoção a `main`/produção.

## Abordagem
Ver `design.md`. Resumo: transporte único em `lib/ai/provider.ts` já é OpenAI-compatível (`fetch(baseUrl + /chat/completions)`, `Authorization: Bearer OPENAI_API_KEY`, resposta em `choices[0].message.content`). Basta repontar as 3 envs no slug `openai`. Os headers específicos do OpenRouter só disparam se a baseUrl contém `openrouter.ai`, logo apontar ao VPS ignora-os sem código.

Plano de referência: `~/.claude/plans/gostaria-de-ver-qua-luminous-hare.md`.
