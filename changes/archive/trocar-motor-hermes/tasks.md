# Tarefas: trocar-motor-hermes

- [ ] 1. Obter dados do Hermes: base URL (`/v1` ou raiz), model id, token Bearer
- [ ] 2. Verificar formato: `curl POST <base>/chat/completions` → confirmar `choices[0].message.content`
- [ ] 3. Editar `env/.env_hom` local: `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL` (comentar linha OpenRouter antiga como fallback; não commitar segredos)
- [ ] 4. `node scripts/check-env.mjs env/.env_hom` → OK OpenAI key + model
- [ ] 5. Testar local: `npm run dev`, enviar msg no chat, confirmar resposta via Hermes (logs VPS + DeepSeek)
- [ ] 6. Setar env vars no Vercel `jarbas-hom` (dashboard) + redeploy
- [ ] 7. Testar HOM por texto em `jarbas-hom.vercel.app`
- [ ] 8. Teste de falha: parar Hermes → confirmar mensagem amigável (sem crash)
- [ ] 9. Endurecer VPS: TLS (Caddy/Cloudflare Tunnel) + Bearer forte + firewall (recomendado)
- [ ] 10. Rotacionar segredos vivos commitados em `env/.env_hom` + remover do versionamento
- [ ] 11. Registrar em memory/ e (se aprovado) promover `dev -> hom`
