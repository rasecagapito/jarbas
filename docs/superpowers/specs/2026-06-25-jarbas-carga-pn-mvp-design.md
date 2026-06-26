# Jarbas Carga PN MVP - Design

## Resumo

O primeiro MVP do Jarbas sera um fluxo vertical monitoravel para carga de Parceiro de Negocio via Excel padrao. O Jarbas sera o orquestrador conversacional por texto e voz; o n8n sera o executor tecnico da carga; o Supabase sera a base de autenticacao, permissoes, status, historico, checklist e rastreabilidade.

## Objetivo

Permitir que um usuario autenticado do grupo Solucoes solicite ao Jarbas uma carga de Parceiro de Negocio, envie um Excel padrao, acompanhe o progresso percentual da execucao e receba orientacao em caso de erro ate a carga ser finalizada ou corretamente pausada.

## Fontes E Referencias

- Prompt inicial: `documentacao/prompt_inicial/prompt_jarbas.txt`
- Tela de login: `documentacao/levantamento/telas/1.tela_login/login.html`
- Tela inicial: `documentacao/levantamento/telas/2.tela_menu_inicial/telamenuinicial.html`
- Workflow n8n de referencia: `2-CARGA_PN_EXCEL (#aeXRhoPa7qV4X55X)`
- Workflow n8n alvo do Jarbas: `JARBAS - SOLUCOES - CARGA PN EXCEL (#AfhcrI8P35wY0SV7)`
- Contexto Agentic OS: `AGENTS.md`, `context/arquitetura.md`, `context/produto.md`, `context/stack.md`
- Plugin especialista: `sap-b1-n8n-portal-specialist`

## Decisoes Aprovadas

- O MVP usara login real com Supabase Auth por e-mail e senha.
- O nome do usuario sera lido do perfil autenticado, por exemplo `profile.display_name`; Jarbas nao deve assumir nomes.
- O primeiro grupo operacional do MVP sera `Solucoes`, mas a arquitetura deve nascer preparada para outros grupos.
- O primeiro agente sera `Carga PN Excel`, permitido para o grupo Solucoes.
- O usuario enviara o Excel diretamente pela tela do Jarbas.
- O MVP aceitara somente um Excel padrao com campos esperados.
- O Jarbas exibira percentual de progresso e etapa atual.
- O Jarbas devera pausar, explicar e orientar quando houver erro que exija acao do usuario.
- O novo workflow n8n executara a carga real com base nas regras ja validadas do workflow `2-CARGA_PN_EXCEL`.
- O Supabase sera a base de status operacional consultada pelo Jarbas.
- O cerebro de IA do Jarbas nao deve ficar preso a um provedor unico; a arquitetura deve suportar multiplas APIs de modelo por configuracao.

## Escopo Do MVP

### Incluido

- Login real.
- Perfil de usuario com nome exibivel.
- Grupo inicial Solucoes, com modelagem preparada para expansao de grupos.
- Permissao do grupo Solucoes para usar o agente Carga PN Excel.
- Tela inicial com Jarbas se apresentando por texto e voz quando possivel.
- Entrada de instrucao por texto e voz.
- Camada de roteamento de IA para selecionar provedor/modelo do cerebro do Jarbas.
- Upload de Excel padrao.
- Registro de execucao no Supabase.
- Disparo do workflow n8n `AfhcrI8P35wY0SV7`.
- Status por etapa e percentual.
- Logs operacionais visiveis de forma resumida.
- Erros explicados em linguagem clara.
- Checklist da execucao.
- Historico da conversa e da carga.
- Resumo final da carga.

### Fora Do Escopo Inicial

- Implementacao completa dos demais grupos em producao alem de Solucoes.
- Excel com mapeamento flexivel de colunas.
- Criacao automatica de novos agentes pelo usuario.
- Uso simultaneo avancado de multiplos modelos na mesma resposta.
- Dashboards completos.
- Retomada sofisticada com edicao linha a linha dentro do Jarbas.
- Reescrita direta do workflow n8n de referencia.
- Escrita direta em tabelas transacionais do SAP B1.

## Arquitetura

```text
Usuario
  -> Supabase Auth
  -> Jarbas
  -> AI Router: provedor/modelo configuravel por agente ou grupo
  -> Supabase: perfil, grupo, permissao, historico, checklist, status
  -> Upload do Excel padrao
  -> Supabase Storage ou area controlada de arquivo
  -> Workflow n8n JARBAS - SOLUCOES - CARGA PN EXCEL
  -> BrasilAPI
  -> SAP B1 Service Layer
  -> Supabase: progresso, logs, erros, resumo
  -> Jarbas: acompanhamento e resposta ao usuario
```

## Responsabilidades

### Jarbas

- Autenticar sessao via Supabase Auth.
- Identificar `profile.display_name`.
- Identificar grupo e permissoes do usuario.
- Selecionar o provedor/modelo de IA por politica de agente, grupo e ambiente.
- Apresentar-se por texto e voz quando suportado pelo navegador.
- Interpretar comandos por texto ou voz.
- Ativar somente agentes permitidos.
- Solicitar e receber o Excel padrao.
- Criar execucao e checklist.
- Disparar o workflow n8n.
- Consultar Supabase para acompanhar etapa, percentual, logs e erros.
- Explicar erro e orientar proximo passo.
- Consolidar resumo final.

### AI Router / Cerebro

- Centralizar chamadas para provedores de IA.
- Permitir provedores diferentes, como OpenAI, Anthropic/Claude, GLM ou endpoints compativeis.
- Manter chaves, tokens e credenciais Auth somente no backend ou em cofre/configuracao segura.
- Escolher modelo por politica: padrao global, agente, grupo ou fallback.
- Registrar uso, custo estimado, modelo usado e erro de provedor quando aplicavel.
- Permitir troca de provedor sem mudar a interface do Jarbas nem a regra dos agentes.

Para o MVP, o Jarbas pode iniciar com um provedor padrao configurado por ambiente. A estrutura, porem, deve nascer com `ai_providers`, `ai_models` e `agent_ai_policies` para evitar acoplamento ao primeiro modelo escolhido.

O cadastro do provedor deve permitir modos de autenticacao diferentes. Para uso direto das APIs, OpenAI e Claude podem iniciar com API key. Para cenarios corporativos, proxy, gateway ou integracao futura, o mesmo desenho deve aceitar bearer token/OAuth ou endpoint compativel.

### Supabase

- Autenticacao do usuario.
- Perfil do usuario.
- Grupo e permissao.
- Armazenamento ou referencia segura do Excel.
- Execucoes.
- Etapas e percentual.
- Logs e erros.
- Checklists.
- Historico de conversa.

### n8n

- Receber a execucao do Jarbas.
- Buscar ou receber referencia do Excel.
- Validar estrutura do Excel padrao.
- Aplicar regras de negocio validadas do workflow de referencia.
- Atualizar Supabase com etapa, percentual, logs e resumo.
- Executar integracoes tecnicas com BrasilAPI e SAP B1 Service Layer.
- Tratar erros de linha e erros bloqueantes.

### SAP B1

- Receber criacao de Parceiro de Negocio pela API oficial, preferencialmente Service Layer.
- Servir como fonte para validacao de PN existente.

## Experiencia Do Usuario

## Canais De Comunicacao

O Jarbas deve aceitar e responder por dois canais principais:

- **Texto**: o usuario digita comandos, envia mensagens, acompanha status, le erros e recebe o resumo final.
- **Voz**: o usuario pode falar comandos quando o navegador suportar captura de audio; o Jarbas pode se apresentar e orientar por fala quando o navegador suportar sintese de voz.

As duas formas de entrada devem alimentar o mesmo fluxo interno de intencao. Para o MVP, texto e voz nao devem criar agentes ou regras separados; ambos acionam o mesmo agente permitido para o grupo do usuario.

Se voz nao estiver disponivel, bloqueada ou sem permissao no navegador, o Jarbas deve continuar funcionando por texto sem interromper a carga.

### Entrada

1. Usuario acessa a tela de login.
2. Usuario autentica com e-mail e senha.
3. Jarbas carrega perfil, grupo, historico e checklists.
4. Jarbas se apresenta sem inventar nome.

Exemplo quando houver nome:

```text
Ola, {profile.display_name}. Eu sou o Jarbas. Consultei seus historicos e checklists do grupo Solucoes. Posso iniciar uma carga de Parceiro de Negocio ou continuar uma execucao pendente.
```

Exemplo quando nao houver nome:

```text
Ola. Eu sou o Jarbas. Consultei seus historicos e checklists do grupo Solucoes. Posso iniciar uma carga de Parceiro de Negocio ou continuar uma execucao pendente.
```

### Carga PN

1. Usuario pede a carga por texto ou voz.
2. Jarbas confirma que o agente Carga PN Excel esta disponivel para o grupo Solucoes.
3. Jarbas solicita o Excel padrao.
4. Usuario faz upload.
5. Jarbas cria a execucao e checklist.
6. Jarbas dispara o workflow n8n.
7. Jarbas exibe percentual, etapa atual e logs resumidos.
8. Ao final, Jarbas apresenta resumo e grava historico.

## Status Da Execucao

Status principais:

```text
created
waiting_file
file_received
validating_excel
processing
paused_error
waiting_user_action
resuming
finished
failed
cancelled
```

Etapas de negocio:

```text
recebendo arquivo
validando estrutura do Excel
normalizando linhas
validando CNPJs
consultando BrasilAPI
montando dados SAP B1
verificando PN existente
criando PN
registrando resultado
reconciliando carga
finalizando
```

## Modelo De Dados Conceitual

### `profiles`

- `id`
- `user_id`
- `display_name`
- `email`
- `active`
- `created_at`

### `groups`

- `id`
- `name`
- `slug`
- `active`

Registro inicial:

```text
name: Solucoes
slug: solucoes
```

Grupos previstos para fases seguintes:

```text
name: Consultoria
slug: consultoria

name: Administrativo
slug: administrativo
```

No MVP, somente o grupo Solucoes precisa estar operacional. Mesmo assim, a modelagem de `groups`, `user_groups`, `agents` e `agent_permissions` deve suportar a inclusao futura de novos grupos sem refatoracao estrutural.

### `user_groups`

- `id`
- `user_id`
- `group_id`
- `created_at`

### `agents`

- `id`
- `name`
- `slug`
- `description`
- `active`

Registro inicial:

```text
name: Carga PN Excel
slug: carga-pn-excel
```

### `agent_permissions`

- `id`
- `agent_id`
- `group_id`
- `can_execute`

### `ai_providers`

- `id`
- `name`
- `slug`
- `base_url`
- `auth_mode`
- `secret_ref`
- `enabled`
- `created_at`

Exemplos de provedores planejados:

```text
slug: openai
slug: anthropic
slug: glm
slug: openai_compatible
```

Modos de autenticacao previstos:

```text
auth_mode: api_key
auth_mode: bearer_token
auth_mode: oauth
auth_mode: gateway
```

`secret_ref` deve guardar apenas a referencia da credencial, como `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` ou uma chave de cofre. O segredo real nao deve ser salvo em texto claro na tabela nem enviado ao frontend.

### `ai_models`

- `id`
- `provider_id`
- `model_key`
- `display_name`
- `supports_text`
- `supports_vision`
- `supports_tools`
- `enabled`
- `created_at`

### `agent_ai_policies`

- `id`
- `agent_id`
- `group_id`
- `primary_model_id`
- `fallback_model_id`
- `temperature`
- `max_output_tokens`
- `created_at`

Essas politicas definem qual modelo o Jarbas usa para interpretar a intencao e conduzir um agente em determinado grupo. Para o MVP, o agente `Carga PN Excel` do grupo `Solucoes` deve ter um modelo primario configurado e um fallback opcional.

### `jarbas_uploaded_files`

- `id`
- `user_id`
- `bucket`
- `file_path`
- `original_name`
- `mime_type`
- `status`
- `created_at`

### `jarbas_executions`

- `id`
- `user_id`
- `group_id`
- `agent_id`
- `workflow_id`
- `uploaded_file_id`
- `status`
- `current_step`
- `progress_percent`
- `summary`
- `created_at`
- `started_at`
- `finished_at`

### `jarbas_execution_steps`

- `id`
- `execution_id`
- `step_key`
- `step_label`
- `status`
- `progress_percent`
- `started_at`
- `finished_at`

### `jarbas_execution_logs`

- `id`
- `execution_id`
- `level`
- `message`
- `row_number`
- `card_code`
- `cnpj`
- `raw_payload_ref`
- `created_at`

### `jarbas_checklists`

- `id`
- `execution_id`
- `label`
- `status`
- `sort_order`
- `created_at`
- `updated_at`

### `conversation_history`

- `id`
- `user_id`
- `execution_id`
- `role`
- `channel`
- `message`
- `created_at`

## Workflow n8n Alvo

Workflow:

```text
JARBAS - SOLUCOES - CARGA PN EXCEL (#AfhcrI8P35wY0SV7)
```

Estado atual confirmado via MCP:

```text
active: false
availableInMCP: true
nodes: []
connections: []
triggers: none
executions: none
```

Entrada esperada do Jarbas:

```json
{
  "execution_id": "uuid",
  "user_id": "uuid",
  "group_id": "uuid",
  "agent_id": "uuid",
  "file_path": "string",
  "bucket": "string",
  "signed_url": "string",
  "callback_secret": "string"
}
```

O novo workflow deve usar o workflow `2-CARGA_PN_EXCEL (#aeXRhoPa7qV4X55X)` como referencia de regra de negocio, especialmente:

- Normalizacao do Excel.
- Limpeza de CNPJ.
- Validacao de 14 caracteres.
- Validacao de duplicidade na planilha.
- Consulta BrasilAPI.
- Montagem de `OCRD`.
- Montagem de `CRD1`.
- Montagem de `CRD7`.
- Login SAP B1 Service Layer.
- Verificacao de PN existente.
- Criacao de PN.
- Registro de erros.
- Reconciliacao final.

## Erros E Retomada

Erros por linha podem continuar a carga quando for seguro:

- CNPJ invalido.
- BrasilAPI sem retorno.
- PN ja existente.
- Dados insuficientes para uma linha especifica.

Erros bloqueantes devem pausar ou falhar a execucao:

- Excel fora do padrao.
- Falha de autenticacao SAP B1.
- Falha geral de conexao com SAP B1.
- Falha geral de permissao.
- Arquivo inacessivel.

Quando houver erro bloqueante, Jarbas deve:

1. Parar o acompanhamento em estado `paused_error` ou `failed`.
2. Explicar o que aconteceu.
3. Informar o que o usuario pode corrigir.
4. Preservar historico, checklist e logs.
5. Permitir nova tentativa quando o erro for corrigivel.

## Resumo Final

Formato conceitual:

```json
{
  "total_rows": 100,
  "created": 90,
  "ignored_existing": 5,
  "invalid_cnpj": 3,
  "errors": 2,
  "status": "finished"
}
```

Jarbas deve transformar esse resumo em linguagem de usuario:

```text
Carga finalizada. Foram processadas 100 linhas: 90 parceiros criados, 5 ja existiam, 3 tinham CNPJ invalido e 2 precisam de revisao.
```

## Criterios De Aceite

- Usuario consegue fazer login real.
- Jarbas le o nome do perfil autenticado quando disponivel.
- Usuario do grupo Solucoes consegue acessar o agente Carga PN Excel.
- A permissao e validada por grupo, mesmo que no MVP apenas Solucoes esteja operacional.
- O cerebro de IA e chamado por uma camada de roteamento, nao diretamente pelo frontend.
- A politica de modelo por agente/grupo pode ser configurada sem alterar componentes de tela.
- Usuario envia um Excel padrao pela tela.
- Uma execucao e criada no Supabase.
- O workflow n8n `AfhcrI8P35wY0SV7` e disparado.
- O progresso percentual e atualizado no Supabase.
- Jarbas exibe etapa atual e percentual.
- Erros bloqueantes sao explicados ao usuario.
- Erros de linha sao registrados com linha, CNPJ/CardCode quando disponiveis e mensagem clara.
- Resumo final e exibido.
- Historico e checklist da execucao ficam registrados.

## Riscos E Mitigacoes

- **Workflow n8n vazio no inicio**: criar o fluxo com base no workflow validado `aeXRhoPa7qV4X55X`, mantendo o fluxo antigo preservado.
- **Upload direto com arquivo grande**: usar Supabase Storage e enviar referencia segura para o n8n.
- **Percentual impreciso**: calcular percentual por total de linhas processadas e etapa macro, registrando explicitamente a formula usada.
- **Erro SAP B1 sem mensagem clara**: sanitizar erro tecnico e mapear mensagem amigavel no log do Jarbas.
- **Permissao apenas visual**: validar permissao tambem no backend antes de disparar n8n.
- **Nome ausente no perfil**: usar saudacao neutra sem inventar nome.
- **Expansao futura de grupos**: manter permissoes por relacionamento grupo-agente desde o MVP, evitando regras fixas no codigo para apenas Solucoes.
- **Acoplamento a um provedor de IA**: usar AI Router e politicas por agente/grupo desde o MVP, mantendo chaves, tokens e Auth fora do frontend.

## Impacto Nos Prototipos Existentes

- `login.html` evolui para login real com Supabase Auth.
- `telamenuinicial.html` evolui para central Jarbas com fala inicial, entrada por texto/voz, upload de Excel, progresso, logs resumidos e resumo final.
- Os prototipos atuais continuam como referencia visual e conceitual; nao devem ser tratados como implementacao final imutavel.

## Observacoes De Documentacao

Alguns documentos Agentic OS criados anteriormente mencionam `1.documentacao/...`, mas a estrutura atual usa `documentacao/...`. A correcao dessas referencias deve entrar como ajuste documental antes ou durante o plano de implementacao, sem alterar os prototipos originais.
