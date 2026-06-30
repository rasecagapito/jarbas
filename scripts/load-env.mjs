import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

function parseEnvValue(rawValue) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFile(filePath) {
  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }

  const content = readFileSync(resolvedPath, "utf8");
  const loaded = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(=|:)\s*(.*)$/,
    );

    if (!match) continue;

    const [, key, , rawValue] = match;
    process.env[key] = parseEnvValue(rawValue);
    loaded.push(key);
  }

  return loaded;
}

function resolveCommand(command, commandArgs) {
  if (command === "node") {
    return { command: process.execPath, args: commandArgs };
  }

  if (command === "next") {
    const nextCli = resolve("node_modules", "next", "dist", "bin", "next");
    if (existsSync(nextCli)) {
      return { command: process.execPath, args: [nextCli, ...commandArgs] };
    }
  }

  if (process.platform === "win32") {
    const localCommand = resolve("node_modules", ".bin", `${command}.cmd`);
    if (existsSync(localCommand)) {
      return { command: localCommand, args: commandArgs };
    }
  }

  return { command, args: commandArgs };
}

const separatorIndex = process.argv.indexOf("--");
const envFile = process.argv[2];
const command = process.argv[separatorIndex + 1];
const commandArgs = process.argv.slice(separatorIndex + 2);

if (!envFile || separatorIndex === -1 || !command) {
  console.error("Usage: node scripts/load-env.mjs <env-file> -- <command>");
  process.exit(1);
}

try {
  const loaded = loadEnvFile(envFile);
  console.log(`Loaded ${loaded.length} variables from ${envFile}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const resolvedCommand = resolveCommand(command, commandArgs);
const child = spawn(resolvedCommand.command, resolvedCommand.args, {
  env: process.env,
  shell: false,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
