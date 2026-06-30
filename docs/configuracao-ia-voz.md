# Configuracao IA e Voz do Jarbas

## Motor de IA

O Jarbas usa o backend como unico ponto de chamada para IA. O frontend nunca deve receber chave de provider.

Configuracao padrao atual:

```env
OPENAI_API_KEY=sua_chave_server_side
OPENAI_MODEL=gpt-4o-mini
```

Sem `OPENAI_API_KEY`, o chat retorna:

```text
O motor de IA do Jarbas nao esta configurado com seguranca no backend.
```

Tambem e possivel usar um endpoint compativel com OpenAI:

```env
OPENAI_COMPATIBLE_API_KEY=sua_chave_server_side
OPENAI_COMPATIBLE_BASE_URL=https://seu-endpoint/v1
OPENAI_COMPATIBLE_MODEL=seu-modelo
```

## Voz ElevenLabs

A voz tenta usar ElevenLabs primeiro. Se a configuracao nao existir ou falhar, o Jarbas cai automaticamente para a Web Speech API do navegador.

```env
ELEVENLABS_API_KEY=sua_chave_server_side
ELEVENLABS_VOICE_ID=id_da_voz
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128
```

`ELEVENLABS_MODEL_ID` e `ELEVENLABS_OUTPUT_FORMAT` sao opcionais.
`ELEVENLABS_API` tambem e aceito como compatibilidade, mas o nome recomendado e `ELEVENLABS_API_KEY`.

## Arquivos por ambiente

O projeto usa arquivos locais na pasta `env/`:

```text
env/.env      -> producao
env/.env_hom  -> homologacao
```

Para homologacao, use:

```bash
npm run dev:hom
npm run build:hom
npm run start:hom
```

Para producao, use:

```bash
npm run build:prod
npm run start:prod
```

`.env.local` pode ser usado apenas para teste local isolado com `npm run dev`.

Depois de alterar qualquer arquivo de ambiente, reinicie usando o comando do ambiente correspondente. Exemplo para homologacao:

```bash
npm run dev:hom
```
