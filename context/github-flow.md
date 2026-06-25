# GitHub Flow

## Repositorio

- **Origin**: `https://github.com/rasecagapito/jarbas`
- **Producao**: `main`
- **Homologacao**: `hom`
- **Desenvolvimento**: `dev`

## Regra De Branches

- Todo desenvolvimento deve acontecer na branch `dev`.
- Quando uma entrega estiver pronta para validacao, promover de `dev` para `hom`.
- Se a validacao em `hom` for aprovada, promover para `main`.
- Se a validacao em `hom` for reprovada, corrigir em `dev` e promover novamente para `hom`.
- `main` representa producao e so deve receber alteracoes ja validadas.

## Fluxo Operacional

```text
dev -> hom -> main
```

Fluxo de reprovacao:

```text
dev -> hom -> ajuste em dev -> hom -> main
```

## Regra Para Codex

Antes de implementar, confirmar que a branch local ativa e `dev`. Nao trabalhar diretamente em `hom` ou `main` para desenvolvimento.

