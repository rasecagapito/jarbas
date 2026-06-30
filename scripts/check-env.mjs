import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvFile(filePath) {
  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }

  const active = new Map();
  const commented = [];
  const lines = readFileSync(resolvedPath, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const commentedMatch = trimmed.match(
      /^#\s*([A-Za-z_][A-Za-z0-9_]*)\s*[:=]/,
    );
    if (commentedMatch) {
      commented.push({ key: commentedMatch[1], line: index + 1 });
      return;
    }

    const activeMatch = trimmed.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(=|:)\s*(.*)$/,
    );
    if (!activeMatch) return;

    const [, key, , rawValue] = activeMatch;
    const value = rawValue.trim().replace(/^["']|["']$/g, "");
    if (value) active.set(key, value);
  });

  return { active, commented };
}

function hasAny(active, keys) {
  return keys.some((key) => active.has(key));
}

function printCheck(label, ok, hint) {
  console.log(`${ok ? "OK" : "MISSING"} ${label}${ok ? "" : ` - ${hint}`}`);
}

const envFile = process.argv[2] ?? "env/.env_hom";

try {
  const { active, commented } = parseEnvFile(envFile);

  console.log(`Checking ${envFile}`);
  console.log(`Active variables: ${active.size}`);

  printCheck(
    "Supabase URL",
    hasAny(active, ["NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]),
    "set NEXT_PUBLIC_SUPABASE_URL",
  );
  printCheck(
    "Supabase anon key",
    hasAny(active, [
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_PUBLIC",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ]),
    "set NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
  printCheck("OpenAI API key", active.has("OPENAI_API_KEY"), "set OPENAI_API_KEY");
  printCheck(
    "OpenAI model",
    active.has("OPENAI_MODEL") || active.has("JARBAS_AI_MODEL"),
    "set OPENAI_MODEL=gpt-4o-mini",
  );
  printCheck(
    "ElevenLabs API key",
    hasAny(active, ["ELEVENLABS_API_KEY", "ELEVENLABS_API"]),
    "set ELEVENLABS_API_KEY",
  );
  printCheck(
    "ElevenLabs voice",
    active.has("ELEVENLABS_VOICE_ID"),
    "set ELEVENLABS_VOICE_ID",
  );

  const commentedEnvKeys = commented.filter(({ key }) =>
    /^(NEXT_PUBLIC|VITE|OPENAI|ELEVENLABS|SUPABASE|VERCEL|BASE_|USUARIO_|SENHAR_|PASSWORD_)/.test(
      key,
    ),
  );

  if (commentedEnvKeys.length > 0) {
    console.log("Commented env-like lines:");
    commentedEnvKeys.forEach(({ key, line }) => {
      console.log(`line ${line}: ${key}=***`);
    });
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
