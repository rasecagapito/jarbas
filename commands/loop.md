# /loop

Quando o usuario invocar `/loop [goal]`:

1. Obter data e hora atuais.
2. Ler o `GOAL` informado pelo usuario.
3. Consultar `memory/history/` para entender o ultimo estado do trabalho.
4. Consultar `memory/learnings/` antes de repetir investigacoes, decisoes ou erros ja tratados.
5. Consultar `context/` somente quando a tarefa envolver produto, arquitetura, stack, documentacao ou regras do projeto.
6. Montar uma lista curta de tasks necessarias para atingir o GOAL.
7. Priorizar as tasks por impacto, dependencia, risco e urgencia.
8. Verificar creditos diarios antes de executar qualquer task.
9. Executar somente uma task por ciclo.
10. Apos cada task, gerar obrigatoriamente um `/status` operacional.
11. No `/status`, registrar o que foi feito, o que falta, o saldo de creditos e a margem segura restante.
12. Continuar somente se os creditos restantes forem maiores que 10%.
13. Parar imediatamente se os creditos restantes forem iguais ou menores que 10%.
14. Parar tambem se nao houver saldo de creditos confiavel.
15. Ao parar, criar um checkpoint final com status, pendencias, riscos e ponto de retomada.
16. Nao alterar `AGENTS.md` sem aprovacao explicita do usuario.
17. Nao deletar, mover ou renomear arquivos sem aprovacao explicita do usuario.
18. Nao imprimir, versionar ou expor valores de `env/` ou arquivos `.env*`.

---

## Objetivo

Permitir que o agente trabalhe em modo de execucao controlada por GOAL, realizando uma task por vez, medindo o progresso e protegendo a reserva minima de 10% dos creditos diarios.

O `/loop` deve evitar execucao longa sem controle. Ele sempre trabalha no modelo:

```txt
1 task -> /status -> verificar creditos -> decidir continuar ou parar
```

---

## Entrada esperada

O comando pode ser chamado assim:

```txt
/loop [goal]
```

Exemplo:

```txt
/loop finalizar a Task 3 do MVP Jarbas Carga PN: Supabase clients, middleware de auth e login real
```

Quando possivel, o usuario ou orquestrador deve informar:

```txt
GOAL:
CREDITOS_DIARIOS_TOTAL:
CREDITOS_ATUAIS:
PERCENTUAL_CREDITOS_RESTANTES:
CONTEXTO:
RESTRICOES:
```

Se os creditos nao forem informados e nao existir ferramenta confiavel para consulta, o agente deve pausar antes de executar.

---

## Variaveis de controle

Usar estas variaveis sempre que disponiveis:

```txt
GOAL
DATA_HORA_ATUAL
CREDITOS_DIARIOS_TOTAL
CREDITOS_ATUAIS
PERCENTUAL_CREDITOS_RESTANTES
LIMITE_MINIMO_CREDITOS = 10%
CREDITOS_RESERVA
CREDITOS_SEGUROS_DISPONIVEIS
PERCENTUAL_SEGURO_DISPONIVEL
STATUS_EXECUCAO
TASK_ATUAL
PROXIMA_TASK
TASKS_CONCLUIDAS
TASKS_PENDENTES
CHECKPOINT_ATUAL
```

---

## Regra absoluta de creditos

Antes de qualquer task:

1. Verificar `PERCENTUAL_CREDITOS_RESTANTES`.
2. Se `PERCENTUAL_CREDITOS_RESTANTES <= 10%`, parar imediatamente.
3. Nunca consumir os ultimos 10% dos creditos diarios.
4. Se nao houver saldo confiavel, pausar.
5. Nunca inventar, estimar ou simular saldo de creditos.
6. Nunca executar uma task quando houver risco claro de consumir a reserva de 10%.

Mensagem obrigatoria quando faltar saldo:

```txt
Nao tenho acesso confiavel ao saldo atual de creditos. Para evitar consumo indevido, a execucao sera pausada ate que o saldo seja informado ou consultado por uma ferramenta confiavel.
```

---

## Formula de margem segura

Quando houver dados suficientes, calcular:

```txt
CREDITOS_RESERVA = CREDITOS_DIARIOS_TOTAL * 0.10

CREDITOS_SEGUROS_DISPONIVEIS = CREDITOS_ATUAIS - CREDITOS_RESERVA

PERCENTUAL_SEGURO_DISPONIVEL = PERCENTUAL_CREDITOS_RESTANTES - 10%
```

Exemplo:

```txt
Creditos totais: 100
Creditos atuais: 35
Reserva obrigatoria: 10
Creditos seguros ainda disponiveis: 25
Percentual seguro ainda disponivel: 25%
```

---

## Fluxo operacional

Executar exatamente este fluxo:

1. Receber `/loop [goal]`.
2. Confirmar o GOAL.
3. Consultar memoria e contexto relevantes:
   - `memory/history/`
   - `memory/learnings/`
   - `context/`
4. Identificar o estado atual.
5. Montar plano curto de tasks.
6. Escolher a proxima task prioritaria.
7. Verificar creditos antes da task.
8. Executar somente a task escolhida.
9. Validar o resultado.
10. Gerar `/status` operacional.
11. Verificar creditos depois da task.
12. Decidir:
    - continuar;
    - pausar;
    - finalizar;
    - bloquear por falta de informacao.
13. Repetir somente se houver creditos seguros acima de 10%.
14. Ao encerrar, gerar checkpoint final.

---

## Loop de execucao

Enquanto `PERCENTUAL_CREDITOS_RESTANTES > 10%`, executar:

```txt
INICIO DO CICLO

1. Verificar creditos restantes.
2. Confirmar se creditos > 10%.
3. Selecionar a proxima task prioritaria.
4. Executar somente uma task.
5. Validar o resultado.
6. Gerar /status.
7. Atualizar tasks concluidas e pendentes.
8. Verificar creditos novamente.
9. Decidir:
   - continuar, se creditos > 10% e houver margem segura;
   - pausar, se faltarem creditos confiaveis ou contexto;
   - finalizar, se o GOAL foi concluido;
   - parar, se creditos <= 10%.

FIM DO CICLO
```

---

## Integracao obrigatoria com /status

O `/loop` nunca deve executar duas tasks seguidas sem gerar um `/status`.

O `/status` dentro do loop deve informar:

1. Task executada.
2. Resultado obtido.
3. Status da task: concluida, parcial, bloqueada ou com erro.
4. O que ja foi concluido.
5. O que ainda falta.
6. Creditos antes da task.
7. Creditos depois da task.
8. Percentual de creditos restantes.
9. Margem segura ainda disponivel antes do limite de 10%.
10. Proxima task recomendada.
11. Decisao: continuar, pausar, finalizar ou bloquear.

---

## Saida obrigatoria do /status dentro do loop

```md
# /status - Controle do Loop

## GOAL
- Objetivo principal:

## Task Atual
- Task executada:
- Status:
- Resultado:

## Progresso
- O que ja foi concluido:
- O que ainda falta:

## Creditos
- Creditos totais:
- Creditos antes da task:
- Creditos depois da task:
- Percentual restante:
- Reserva obrigatoria: 10%
- Margem segura disponivel:

## Proxima Task Recomendada
- Task:
- Motivo:
- Risco de consumo:

## Decisao
- Continuar, pausar, finalizar ou bloquear:
- Justificativa:
```

---

## Criterios de parada

Parar imediatamente quando:

1. `PERCENTUAL_CREDITOS_RESTANTES <= 10%`.
2. Nao houver informacao confiavel de creditos.
3. O GOAL for concluido.
4. Existir bloqueio externo.
5. Existir erro critico.
6. A proxima task tiver risco alto de consumir a reserva de 10%.
7. Faltar contexto essencial.
8. A acao exigir aprovacao explicita do usuario.
9. A acao envolver deletar, mover ou renomear arquivos.
10. A acao envolver segredos, `.env*`, credenciais ou valores sensiveis.

---

## Regras de seguranca

1. Nao inventar saldo de creditos.
2. Nao inventar progresso.
3. Nao declarar task como concluida sem validacao.
4. Nao criar, alterar ou apagar arquivos fora do escopo aprovado.
5. Nao alterar `AGENTS.md` sem fatos aprovados.
6. Nao versionar arquivos sensiveis.
7. Nao imprimir valores de variaveis de ambiente.
8. Nao continuar execucao sem margem segura.
9. Nao executar varias tasks em um unico ciclo.
10. Nao ignorar pendencias ou erros.

---

## Regras de memoria

Durante a execucao:

1. Usar `memory/history/` para entender o ultimo estado.
2. Usar `memory/learnings/` para evitar repetir erros.
3. Registrar no checkpoint final:
   - decisoes tomadas;
   - arquivos criados ou alterados;
   - tasks concluidas;
   - tasks pendentes;
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
- Percentual de creditos restantes:

## GOAL Trabalhado
- Goal principal:
- Resultado geral alcancado:

## Tasks Concluidas
1.
2.
3.

## Tasks Pendentes
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

## Riscos Identificados
1.
2.
3.

## Proxima Melhor Acao
Descrever exatamente qual deve ser a proxima task ao retomar.

## Ponto de Retomada
Informar onde o proximo agente ou a proxima sessao deve continuar.

## Observacoes
-
```

---

## Modo antidelirio

Se faltar contexto para continuar:

```txt
Requisitos insuficientes para continuar com seguranca. Para prosseguir, preciso da seguinte informacao: [listar exatamente o que falta].
```

Se faltar saldo de creditos:

```txt
Nao tenho acesso confiavel ao saldo atual de creditos. Para evitar consumo indevido, a execucao sera pausada ate que o saldo seja informado ou consultado por uma ferramenta confiavel.
```

Se uma task depender de aprovacao:

```txt
Esta acao exige aprovacao explicita antes de continuar: [descrever a acao]. A execucao sera pausada ate a aprovacao do usuario.
```

Nunca inventar:

- saldo de creditos;
- percentual restante;
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

## GOAL
- Objetivo:

## Estado Atual
- Ultima memoria consultada:
- Learnings relevantes:
- Contextos carregados:

## Plano Inicial de Tasks
1.
2.
3.

## Controle de Creditos
- Creditos totais:
- Creditos atuais:
- Percentual restante:
- Limite minimo: 10%
- Margem segura:

## Proxima Task
- Task selecionada:
- Motivo:

## Decisao Inicial
- Executar, pausar ou bloquear:
- Justificativa:
```

---

## Instrucao final

Ao receber `/loop [goal]`, ativar esta funcao.

Executar o GOAL em ciclos controlados.

Sempre executar apenas uma task por ciclo.

Depois de cada task, gerar `/status`.

Continuar somente enquanto houver creditos seguros acima da reserva minima de 10%.

Parar imediatamente quando os creditos restantes forem iguais ou menores que 10%, quando faltar saldo confiavel ou quando houver bloqueio de seguranca.

Ao encerrar, gerar checkpoint final completo.
