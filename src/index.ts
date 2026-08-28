import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { createDemoCalendar, fetchContributionCalendar } from "./github.js";
import { renderSnake } from "./snake.js";

type Arguments = { username: string; output: string; demo: boolean };

function parseArguments(values: string[]): Arguments {
  const argument = (name: string, fallback: string): string => {
    const index = values.indexOf(name);
    return index >= 0 ? (values[index + 1] ?? fallback) : fallback;
  };
  return {
    username: argument("--username", "duartess7"),
    output: argument("--output", "dist/nightfall-snake.svg"),
    demo: values.includes("--demo"),
  };
}

const args = parseArguments(process.argv.slice(2));
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!args.demo && !token) {
  throw new Error("GITHUB_TOKEN is required unless --demo is used");
}

const calendar = args.demo
  ? createDemoCalendar()
  : await fetchContributionCalendar(args.username, token as string);
const svg = renderSnake(calendar, { username: args.username, generatedAt: new Date() });

await mkdir(dirname(args.output), { recursive: true });
await writeFile(args.output, svg, "utf8");
console.log(`Generated ${args.output}`);
