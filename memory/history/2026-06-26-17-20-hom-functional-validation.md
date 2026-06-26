# Historico - Validacao Funcional HOM

## Data e Hora

2026-06-26 17:20 -03:00

## Objetivo

Continuar a validacao funcional de homologacao do Jarbas:

1. Login no Preview `hom`.
2. Validar cockpit/menu inicial.
3. Testar upload XLS/XLSX e criacao de execucao.

## Resultado

- Login no Preview `hom`: concluido.
- Redirecionamento pos-login: concluido.
- Cockpit/menu inicial: renderizado.
- Upload XLSX: bloqueado por permissao da extensao Chrome/Codex para arquivos locais.
- Criacao de execucao: nao executada, pois depende do upload.
- Chamada ao n8n: nao executada, pois depende da criacao de execucao.

## Evidencias Observadas

Depois do login, o app apresentou:

- `Grupo Solucoes`;
- `Agentes Permitidos`;
- `Carga PN Excel`;
- `Cockpit Carga PN Excel`;
- `Upload Excel Carga PN`;
- `Aguardando Excel padrao para Carga PN`;
- botoes `Sair`, `Enviar` e `Voz`.

## Bloqueio

O upload via navegador falhou antes de chegar ao app:

```txt
fileChooser.setFiles failed
Not allowed
```

Este comportamento indica que a extensao do Chrome/Codex precisa de permissao para anexar arquivos locais.

## Acao Necessaria

No Chrome:

1. Abrir `chrome://extensions`.
2. Localizar a extensao Codex.
3. Clicar em `Details` / `Detalhes`.
4. Habilitar `Allow access to file URLs` / `Permitir acesso a URLs de arquivo`.
5. Retomar a aba do Preview HOM no cockpit.
6. Repetir upload XLSX.

## Arquivos Locais

Arquivo de teste criado fora do repositorio:

```txt
C:\Users\Seidor\AppData\Local\Temp\jarbas-hom-test\jarbas-carga-pn-homologacao.xlsx
```

## Pendencias

1. Liberar permissao de upload de arquivos locais na extensao Chrome/Codex.
2. Repetir upload XLSX.
3. Criar execucao.
4. Confirmar chamada ao n8n.
5. Confirmar status/logs no cockpit.

## Ponto de Retomada

A aba do Preview HOM ficou aberta no Chrome como handoff, ja autenticada no cockpit.
