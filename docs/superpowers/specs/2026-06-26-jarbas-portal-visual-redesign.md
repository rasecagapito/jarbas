# Jarbas Portal Visual Redesign - Design Spec

## Objetivo

Ajustar o portal Jarbas para que login e menu/cockpit inicial deixem de parecer um MVP cru e passem a refletir a experiencia holografica/cyber desenhada nos prototipos HTML existentes.

Referencias principais:

- `documentacao/levantamento/telas/1.tela_login/login.html`
- `documentacao/levantamento/telas/2.tela_menu_inicial/telamenuinicial.html`

## Direcao Aprovada

Usar uma adaptacao Jarbas fiel a estetica dos prototipos, nao uma copia literal dos textos Aether.

Manter:

- atmosfera escura holografica;
- vidro/transparencia;
- bordas luminosas ciano;
- robo/avatar como centro da experiencia;
- entrada por texto e voz;
- sensacao de cockpit tatico.

Trocar/adaptar:

- `Aether Orchestrator` para `Jarbas / S.A.M.`;
- textos genericos por linguagem operacional do Jarbas;
- elementos decorativos que nao ajudam a operacao por controles reais do MVP.

## Telas no Escopo

### Login

O login deve preservar a autenticacao real Supabase, mas mudar a apresentacao para seguir a tela `login.html`.

Elementos esperados:

- fundo escuro com atmosfera tech;
- marca `Assistente Jarbas` ou `Jarbas / S.A.M.`;
- card glassmorphic central;
- titulo de acesso seguro;
- campos de e-mail e senha;
- botao principal com linguagem de autorizacao/acesso;
- microcopy coerente, sem termos Aether;
- feedback de erro dentro do card, sem quebrar o layout.

### Menu/Cockpit Inicial

O cockpit deve seguir a composicao da tela `telamenuinicial.html`.

Elementos esperados:

- robo/avatar central como foco visual;
- input de texto abaixo do robo;
- botao de voz/microfone proximo ao input;
- painel de agente permitido visivel, mas integrado ao layout;
- area de upload Carga PN sem parecer card administrativo cru;
- progresso/logs em painel secundario;
- botao de sair discreto no topo;
- cabecalho com identidade Jarbas.

## Comportamento Robo -> Tela -> Usuario

Ao entrar:

1. Usuario faz login.
2. Jarbas sauda o usuario usando `profile.display_name` quando existir.
3. Robo/cockpit apresenta o agente disponivel.
4. Usuario pode digitar mensagem, acionar voz ou enviar planilha.
5. Status de upload/execucao aparece como resposta operacional do Jarbas, nao apenas texto solto.

## Dados e Fluxos Mantidos

Nao alterar nesta etapa:

- Supabase Auth;
- RLS/permissoes;
- APIs de upload e execucao;
- chamada n8n;
- formato do payload enviado ao n8n;
- regras de ambiente HOM/PRD.

O redesign e visual/comportamental, mantendo a base funcional atual.

## Componentes Provaveis

- `components/auth/login-form.tsx`: redesign do card de login.
- `app/(auth)/login/page.tsx`: shell visual da tela de login.
- `components/jarbas/jarbas-shell.tsx`: nova composicao do cockpit.
- `components/jarbas/agent-panel.tsx`: adaptar para painel integrado.
- `components/jarbas/file-upload.tsx`: adaptar visual/status.
- `components/jarbas/chat-composer.tsx`: integrar input central.
- `components/jarbas/voice-controls.tsx`: integrar botao/estado de voz.
- `app/globals.css`: tokens, animacoes e efeitos reutilizaveis, se necessario.

## Fora de Escopo

- Arquitetura multi-cliente de credenciais SAP/Service Layer.
- Mudancas no workflow n8n.
- Promocao para producao.
- Regras novas de permissao.
- Reescrever fluxo de upload/execucao.

## Validacao

Antes de promover para `hom`, validar:

- `npm test`
- `npm run lint`
- `npm run build`
- login local ou Preview com usuario HOM;
- comparacao visual contra os dois HTMLs de referencia;
- responsividade basica desktop/mobile;
- ausencia de segredos no frontend;
- fluxo de entrada no cockpit sem regressao.

## Criterio de Conclusao

O objetivo sera considerado concluido quando:

1. login estiver visualmente alinhado ao prototipo;
2. cockpit/menu inicial estiver visualmente alinhado ao prototipo;
3. comportamento inicial do Jarbas estiver claro para o usuario;
4. autenticacao e fluxo funcional existentes continuarem passando;
5. alteracao estiver em `dev`, pronta para PR `dev -> hom`.
