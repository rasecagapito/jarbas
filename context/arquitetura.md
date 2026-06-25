# Arquitetura

## Proposito
Consolidar a arquitetura conceitual descrita no levantamento para orientar implementacoes futuras.

## Visao Geral
O projeto segue um padrao de grafo de hierarquia dinamica: o frontend envia mensagens para um orquestrador n8n, o supervisor decide o setor/agente correto, e os subworkflows executam tarefas especializadas usando dados do Supabase.

## Camadas
- **Frontend Cockpit**: interface web com HTML/Next.js, Three.js, Web Audio API, chat, logs e visual de cockpit.
- **Orquestrador n8n**: supervisor central, despacho dinamico para subworkflows e pipeline de voz/texto.
- **Supabase/PostgreSQL**: tabelas de setores, agentes, embeddings, historico e governanca de dados.
- **RAG com pgvector**: busca semantica filtrada por `sector_id` para evitar vazamento entre departamentos.
- **Autenticacao**: comunicacao protegida por JWT com expiracao programada.

## Fluxo Conceitual
1. Usuario envia texto ou audio pelo cockpit.
2. Audio e transcrito por Whisper/OpenAI ou Groq quando aplicavel.
3. Mensagem normalizada entra no supervisor n8n.
4. Supervisor identifica setor, agente e ferramenta.
5. n8n busca `n8n_workflow_id` ativo no banco.
6. Subworkflow executa e devolve resposta ao frontend.
7. Interface exibe resposta, logs e estado do roteamento.

## Restricoes Importantes
- Nao expor webhooks n8n diretamente sem autenticacao.
- Filtrar RAG por setor.
- Manter a logica organizacional em tabelas relacionais, nao fixa no frontend.

