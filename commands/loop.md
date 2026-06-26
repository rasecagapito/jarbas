# /loop

Quando o usuario invocar `/loop [objetivo]`:

1. Obter data e hora atuais.
2. Ler exatamente o objetivo informado pelo usuario.
3. Identificar se o objetivo e unico ou composto.
   - Exemplo objetivo unico: finalizar Task 1.
   - Exemplo objetivo unico: finalizar a tela de login.
   - Exemplo objetivo composto: fazer as Tasks 1, 2 e 3.
4. Transformar o objetivo em uma lista objetiva de entregas esperadas.
5. Definir o criterio de conclusao de cada entrega.
6. Consultar `memory/history/` para entender o ultimo estado do trabalho.
7. Consultar `memory/learnings/` antes de repetir investigacoes, decisoes ou erros ja tratados.
8. Consultar `context/` somente quando a tarefa envolver produto, arquitetura, stack, documentacao ou regras do projeto.
9. Executar uma unidade de trabalho por ciclo.
10. Apos cada ciclo, gerar obrigatoriamente um `/status` operacional.
11. No `/status`, registrar o que foi feito, o que falta para o objetivo definido e se ainda existe trabalho dentro do escopo.
12. Continuar somente enquanto ainda existir pendencia dentro do objetivo definido pelo usuario.
13. Parar imediatamente quando o objetivo definido for concluido.
14. Parar tambem quando houver bloqueio, erro critico, falta de contexto ou necessidade de aprovacao do usuario.
15. Ao parar, gerar checkpoint final e retornar ao usuario.
16. Nao executar atividades fora do objetivo definido.
17. Nao ampliar o escopo por conta propria.
18. Nao alterar `AGENTS.md` sem aprovacao explicita do usuario.
19. Nao deletar, mover ou renomear arquivos sem aprovacao explicita do usuario.
20. Nao imprimir, versionar ou expor valores de `env/` ou arquivos `.env*`.

---

## Objetivo

Permitir que o agente trabalhe em modo de execucao controlada por objetivo, realizando ciclos sucessivos ate concluir exatamente o ponto definido pelo usuario.

O `/loop` nao deve mais controlar a parada por saldo de creditos.

O criterio principal de parada passa a ser o objetivo informado pelo usuario.

O `/loop` deve trabalhar no modelo:

```txt
objetivo definido -> executar 1 ciclo -> gerar /status -> verificar pendencias do objetivo -> continuar ou parar
```

---

## Exemplos de uso

```txt
/loop finalizar Task 1
```

```txt
/loop finalizar a tela de login
```

```txt
/loop fazer as Tasks 1, 2 e 3
```

```txt
/loop corrigir o bug de autenticacao e parar quando o login real funcionar
```

---

## Entrada esperada

O comando pode ser chamado assim:

```txt
/loop [objetivo]
```

O objetivo deve indicar claramente o ponto de parada esperado.

Quando o objetivo nao estiver claro, o agente deve pausar e pedir esclarecimento antes de executar.

Exemplos de objetivo claro:

```txt
Finalizar Task 1.
Finalizar a tela de login.
Fazer as Tasks 1, 2 e 3.
Implementar o middleware de auth e parar quando estiver validado.
```

Exemplos de objetivo insuficiente:

```txt
Continuar o projeto.
Fazer melhorias.
Arrumar tudo.
Prosseguir.
```

---

## Variaveis de controle

Usar estas variaveis sempre que aplicavel:

```txt
OBJETIVO_USUARIO
DATA_HORA_ATUAL
ESCOPO_DEFINIDO
CRITERIO_DE_CONCLUSAO
OBJETIVOS_LISTADOS
OBJETIVOS_CONCLUIDOS
OBJETIVOS_PENDENTES
CICLO_ATUAL
TASK_ATUAL
PROXIMA_TASK
STATUS_EXECUCAO
CHECKPOINT_ATUAL
```

---

## Regra absoluta de escopo

1. O agente deve executar somente o que estiver dentro do objetivo informado.
2. O agente nao pode ampliar o escopo por conta propria.
3. O agente nao pode continuar apos concluir o objetivo definido.
4. O agente nao pode iniciar uma nova task fora do objetivo.
5. Se o objetivo for composto, executar apenas os itens listados pelo usuario.
6. Se surgir uma melhoria fora do escopo, registrar como sugestao ou pendencia futura, mas nao executar.
7. Se houver duvida sobre o limite do objetivo, pausar e perguntar.

Mensagem obrigatoria quando o objetivo estiver amplo ou ambiguo:

```txt
O objetivo informado esta amplo demais para executar em loop com seguranca. Para prosseguir, defina o ponto exato de parada. Exemplo: finalizar Task 1, finalizar tela de login, ou fazer Tasks 1, 2 e 3.
```

---

## Definicao do criterio de conclusao

Antes de iniciar, o agente deve transformar o objetivo em criterios verificaveis.

Exemplo 1:

```txt
Objetivo do usuario:
Finalizar Task 1.

Criterio de conclusao:
Task 1 implementada, validada e registrada no /status final.
```

Exemplo 2:

```txt
Objetivo do usuario:
Finalizar a tela de login.

Criterio de conclusao:
Tela de login implementada ou ajustada, fluxo basico validado e pendencias registradas.
```

Exemplo 3:

```txt
Objetivo do usuario:
Fazer as Tasks 1, 2 e 3.

Criterio de conclusao:
Tasks 1, 2 e 3 concluidas ou, se alguma bloquear, registrar motivo do bloqueio e retornar ao usuario.
```

---

## Fluxo operacional

Executar exatamente este fluxo:

1. Receber `/loop [objetivo]`.
2. Obter data e hora atuais.
3. Interpretar o objetivo do usuario.
4. Separar objetivo unico ou multiplos objetivos.
5. Definir o escopo permitido.
6. Definir criterio de conclusao.
7. Consultar memoria e contexto relevantes:
   - `memory/history/`
   - `memory/learnings/`
   - `context/`
8. Identificar o estado atual.
9. Montar plano curto apenas com atividades necessarias para concluir o objetivo.
10. Escolher a proxima unidade de trabalho.
11. Executar somente essa unidade.
12. Validar o resultado.
13. Gerar `/status` operacional.
14. Verificar se o objetivo definido foi concluido.
15. Se o objetivo ainda nao foi concluido, continuar para o proximo ciclo.
16. Se o objetivo foi concluido, parar e retornar ao usuario.
17. Se houver bloqueio, erro critico, falta de contexto ou acao que exija aprovacao, parar e retornar ao usuario.
18. Ao encerrar, gerar checkpoint final.

---

## Loop de execucao

Enquanto houver pendencia dentro do objetivo definido, executar:

```txt
INICIO DO CICLO

1. Confirmar objetivo definido.
2. Verificar objetivos concluidos e pendentes.
3. Selecionar a proxima unidade de trabalho dentro do escopo.
4. Executar somente essa unidade.
5. Validar resultado.
6. Gerar /status.
7. Atualizar objetivos concluidos e pendentes.
8. Decidir:
   - continuar, se ainda houver pendencia dentro do objetivo;
   - finalizar, se o objetivo definido foi concluido;
   - pausar, se faltar contexto ou houver bloqueio;
   - retornar ao usuario, se precisar de aprovacao.

FIM DO CICLO
```

---

## Integracao obrigatoria com /status

O `/loop` nunca deve executar dois ciclos seguidos sem gerar um `/status`.

O `/status` dentro do loop deve informar:

1. Objetivo definido pelo usuario.
2. Ciclo executado.
3. Unidade de trabalho executada.
4. Resultado obtido.
5. Status: concluido, parcial, bloqueado ou com erro.
6. O que ja foi concluido.
7. O que ainda falta para o objetivo definido.
8. Se existe trabalho fora do escopo identificado.
9. Proxima unidade de trabalho, se ainda houver.
10. Decisao: continuar, pausar, finalizar ou retornar ao usuario.

---

## Saida obrigatoria do /status dentro do loop

```md
# /status - Controle do Loop

## Objetivo Definido
- Objetivo informado pelo usuario:
- Escopo permitido:
- Criterio de conclusao:

## Ciclo Atual
- Ciclo:
- Unidade de trabalho executada:
- Status:
- Resultado:

## Progresso do Objetivo
- Concluido:
- Pendente:
- Bloqueado:

## Fora de Escopo Identificado
- Itens encontrados fora do objetivo:
- Acao tomada: registrar, ignorar ou sugerir depois.

## Proxima Unidade de Trabalho
- Proxima acao dentro do objetivo:
- Motivo:

## Decisao
- Continuar, pausar, finalizar ou retornar ao usuario:
- Justificativa:
```

---

## Criterios de parada

Parar imediatamente quando:

1. O objetivo definido pelo usuario for concluido.
2. Todos os objetivos listados pelo usuario forem concluidos.
3. Uma das tasks solicitadas estiver bloqueada e nao puder avancar sem decisao externa.
4. Houver erro critico.
5. Faltar contexto essencial.
6. A proxima acao exigir aprovacao explicita do usuario.
7. A acao envolver deletar, mover ou renomear arquivos.
8. A acao envolver segredos, `.env*`, credenciais ou valores sensiveis.
9. O proximo trabalho necessario estiver fora do objetivo definido.
10. O usuario tiver definido uma parada explicita e ela tiver sido atingida.

---

## Regras de seguranca

1. Nao executar fora do objetivo definido.
2. Nao ampliar escopo por conta propria.
3. Nao declarar objetivo como concluido sem validacao.
4. Nao criar, alterar ou apagar arquivos fora do escopo aprovado.
5. Nao alterar `AGENTS.md` sem fatos aprovados.
6. Nao versionar arquivos sensiveis.
7. Nao imprimir valores de variaveis de ambiente.
8. Nao executar varias unidades de trabalho sem `/status`.
9. Nao ignorar pendencias ou erros.
10. Nao continuar depois de atingir o ponto de parada definido pelo usuario.

---

## Regras de memoria

Durante a execucao:

1. Usar `memory/history/` para entender o ultimo estado.
2. Usar `memory/learnings/` para evitar repetir erros.
3. Registrar no checkpoint final:
   - objetivo trabalhado;
   - escopo definido;
   - criterios de conclusao;
   - decisoes tomadas;
   - arquivos criados ou alterados;
   - unidades concluidas;
   - unidades pendentes;
   - bloqueios;
   - riscos;
   - proxima melhor acao;
   - ponto de retomada.
4. Criar novas licoes em `memory/learnings/` somente quando houver aprendizado reutilizavel.
5. Nao gravar informacoes temporarias ou inseguras como licoes permanentes.

---

## Formato do checkpoint final

Quando o loop parar, gerar:

```md
# CHECKPOINT FINAL - /loop

## Status da Execucao
- Status:
- Motivo da parada:
- Data/hora:

## Objetivo Trabalhado
- Objetivo informado pelo usuario:
- Escopo definido:
- Criterio de conclusao:

## Resultado Geral
- Resultado alcancado:
- Objetivo concluido: sim/nao/parcial

## Unidades Concluidas
1.
2.
3.

## Unidades Pendentes
1.
2.
3.

## Arquivos Criados ou Alterados
1.
2.
3.

## Decisoes Tomadas
1.
2.
3.

## Bloqueios ou Riscos
1.
2.
3.

## Fora de Escopo Identificado
1.
2.
3.

## Proxima Melhor Acao
Descrever exatamente qual deve ser a proxima acao ao retomar.

## Ponto de Retomada
Informar onde o proximo agente ou a proxima sessao deve continuar.

## Retorno ao Usuario
Informar de forma direta que o loop parou porque atingiu o objetivo, bloqueou ou precisa de aprovacao.
```

---

## Modo antidelirio

Se o objetivo estiver amplo demais:

```txt
O objetivo informado esta amplo demais para executar em loop com seguranca. Para prosseguir, defina o ponto exato de parada. Exemplo: finalizar Task 1, finalizar tela de login, ou fazer Tasks 1, 2 e 3.
```

Se faltar contexto para continuar:

```txt
Requisitos insuficientes para continuar com seguranca. Para prosseguir, preciso da seguinte informacao: [listar exatamente o que falta].
```

Se uma acao depender de aprovacao:

```txt
Esta acao exige aprovacao explicita antes de continuar: [descrever a acao]. A execucao sera pausada ate a aprovacao do usuario.
```

Nunca inventar:

- objetivo concluido;
- status de task;
- arquivos criados;
- arquivos alterados;
- commits feitos;
- testes executados;
- validacoes realizadas;
- status de deploy;
- resultados nao verificados;
- decisoes nao aprovadas.

---

## Saida esperada ao iniciar

Ao iniciar `/loop`, responder:

```md
# LOOP INICIADO

## Objetivo Definido
- Objetivo informado pelo usuario:
- Escopo permitido:
- Criterio de conclusao:

## Estado Atual
- Ultima memoria consultada:
- Learnings relevantes:
- Contextos carregados:

## Plano Inicial
1.
2.
3.

## Proxima Unidade de Trabalho
- Unidade selecionada:
- Motivo:

## Decisao Inicial
- Executar, pausar ou bloquear:
- Justificativa:
```

---

## Instrucao final

Ao receber `/loop [objetivo]`, ativar esta funcao.

Executar apenas o objetivo informado pelo usuario.

Trabalhar em ciclos controlados.

Sempre executar somente uma unidade de trabalho por ciclo.

Depois de cada ciclo, gerar `/status`.

Continuar somente enquanto houver pendencia dentro do objetivo definido.

Parar imediatamente quando o objetivo definido for concluido, quando houver bloqueio, quando faltar contexto ou quando a proxima acao exigir aprovacao.

Ao parar, gerar checkpoint final completo e retornar ao usuario.
