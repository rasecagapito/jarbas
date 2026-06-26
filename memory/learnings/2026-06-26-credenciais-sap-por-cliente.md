# Learning - Credenciais SAP/Service Layer por Cliente

## Contexto

O Jarbas tera projetos/clientes diferentes. Cada cliente pode ter dados proprios de acesso ao SAP Business One Service Layer.

## Decisao Registrada

As credenciais de Service Layer/SAP nao devem ser tratadas como valor fixo global do Jarbas.

Elas variam por projeto/cliente, incluindo:

- URL/base do Service Layer;
- banco/CompanyDB;
- usuario;
- senha;
- possiveis parametros de ambiente, como homologacao e producao.

## Implicacao Arquitetural

Em etapa futura, o Jarbas precisara de um desenho seguro para resolver credenciais por cliente/projeto e ambiente, sem expor segredos no frontend.

Possiveis pontos a desenhar depois:

- cadastro de projetos/clientes;
- vinculacao cliente -> ambiente -> credencial SAP;
- segregacao HOM/PRD;
- armazenamento seguro dos segredos;
- forma como n8n seleciona a credencial correta para cada execucao;
- auditoria de qual cliente/projeto/ambiente foi usado.

## Prioridade Atual

Neste momento, a etapa mais importante do projeto nao e ainda fechar essa arquitetura de credenciais SAP.

A prioridade atual e validar o comportamento do Jarbas com o usuario:

- tela de login baseada em `documentacao/levantamento/telas/1.tela_login/login.html`;
- tela/menu inicial baseada em `documentacao/levantamento/telas/2.tela_menu_inicial/telamenuinicial.html`;
- interacao robo -> tela -> usuario;
- comportamento visual e operacional do cockpit antes da carga completa.

## Lembrete

Retomar este ponto antes de fechar o desenho multi-cliente e antes de promover integracoes SAP reais por cliente.
