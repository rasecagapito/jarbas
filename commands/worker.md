# /worker

Quando o usuario invocar `/worker [nome]`:
1. Identificar o arquivo correspondente em `workers/`.
2. Ler papel, restricoes e lista de contexto.
3. Carregar somente os arquivos listados.
4. Confirmar ativacao com a lista de contexto carregada.
5. Seguir o processo do worker no restante da sessao.

Se nenhum nome for informado, listar os workers disponiveis com suas funcoes.

