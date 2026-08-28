import type { ContributionCalendar, ContributionDay } from "./github.js";

export type Point = { x: number; y: number; column: number; row: number };

export type RenderOptions = {
  username: string;
  generatedAt: Date;
};

const WIDTH = 1100;
const HEIGHT = 340;
const GRID_X = 72;
const GRID_Y = 122;
const CELL = 13;
const STEP = 18;
const ROWS = 7;
const DURATION = 18;

const escapeXml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function buildTraversal(columns: number, rows = ROWS): Point[] {
  const points: Point[] = [];
  for (let row = 0; row < rows; row += 1) {
    const forward = row % 2 === 0;
    for (let offset = 0; offset < columns; offset += 1) {
      const column = forward ? offset : columns - 1 - offset;
      points.push({
        x: GRID_X + column * STEP + CELL / 2,
        y: GRID_Y + row * STEP + CELL / 2,
        column,
        row,
      });
    }
  }
  return points;
}

export function buildPath(points: Point[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
}

function contributionMap(calendar: ContributionCalendar): Map<string, ContributionDay> {
  const map = new Map<string, ContributionDay>();
  calendar.weeks.forEach((week, column) => {
    week.contributionDays.forEach((day) => map.set(`${column}:${day.weekday}`, day));
  });
  return map;
}

function contributionCells(calendar: ContributionCalendar, points: Point[]): string {
  const days = contributionMap(calendar);
  const maximum = Math.max(
    1,
    ...calendar.weeks.flatMap((week) => week.contributionDays.map((day) => day.contributionCount)),
  );
  const pathIndex = new Map(points.map((point, index) => [`${point.column}:${point.row}`, index]));
  const colors = ["#15101d", "#2d1740", "#512570", "#8040ad", "#c7a4f6"];

  return calendar.weeks
    .flatMap((week, column) =>
      Array.from({ length: ROWS }, (_, row) => {
        const day = days.get(`${column}:${row}`);
        const count = day?.contributionCount ?? 0;
        const level = count === 0 ? 0 : Math.min(4, 1 + Math.floor((count / maximum) * 3));
        const index = pathIndex.get(`${column}:${row}`) ?? 0;
        const progress = Math.min(0.96, Math.max(0.01, index / Math.max(points.length - 1, 1)));
        const faded = Math.min(0.975, progress + 0.012);
        const x = GRID_X + column * STEP;
        const y = GRID_Y + row * STEP;
        const tooltip = day ? `${day.date}: ${count} contributions` : "outside contribution range";
        const animation = count
          ? `<animate attributeName="opacity" values="1;1;.08;.08;1" keyTimes="0;${progress.toFixed(4)};${faded.toFixed(4)};.985;1" dur="${DURATION}s" repeatCount="indefinite"/>`
          : "";
        return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" fill="${colors[level]}"><title>${escapeXml(tooltip)}</title>${animation}</rect>`;
      }),
    )
    .join("");
}

function snakeBody(): string {
  const segments = Array.from({ length: 12 }, (_, index) => {
    const radius = Math.max(2.8, 6.2 - index * 0.24);
    const opacity = Math.max(0.22, 0.92 - index * 0.055);
    const delay = (index + 1) * 0.055;
    return `<circle r="${radius.toFixed(1)}" fill="#8b5cf6" opacity="${opacity.toFixed(2)}">
      <animateMotion dur="${DURATION}s" begin="${delay.toFixed(3)}s" repeatCount="indefinite" rotate="auto"><mpath href="#snake-path"/></animateMotion>
    </circle>`;
  }).join("");

  const head = `<g filter="url(#glow)">
    <circle r="7.5" fill="#d8b4fe"><animate attributeName="r" values="7.2;8;7.2" dur=".8s" repeatCount="indefinite"/></circle>
    <circle cx="2.4" cy="-2.5" r="1.35" fill="#12091b"/>
    <circle cx="2.4" cy="2.5" r="1.35" fill="#12091b"/>
    <animateMotion dur="${DURATION}s" repeatCount="indefinite" rotate="auto"><mpath href="#snake-path"/></animateMotion>
  </g>`;

  return `${segments}${head}`;
}

export function renderSnake(calendar: ContributionCalendar, options: RenderOptions): string {
  const columns = calendar.weeks.length;
  const points = buildTraversal(columns);
  const path = buildPath(points);
  const activeDays = calendar.weeks.reduce(
    (total, week) => total + week.contributionDays.filter((day) => day.contributionCount > 0).length,
    0,
  );
  const updated = options.generatedAt.toISOString().replace("T", " ").slice(0, 16) + " UTC";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">Nightfall Snake for ${escapeXml(options.username)}</title>
  <desc id="desc">An original animated serpent consuming the GitHub contribution calendar.</desc>
  <metadata>Copyright © 2026 duartess7. All rights reserved.</metadata>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07050a"/><stop offset="1" stop-color="#10091a"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#8b5cf6" stroke-opacity=".05"/></pattern>
    <path id="snake-path" d="${path}" fill="none"/>
    <style>
      text { font-family: Consolas, 'Courier New', monospace; }
      .title { fill:#eee8f7; font-size:26px; font-weight:700; letter-spacing:4px; }
      .kicker { fill:#9f73d8; font-size:11px; letter-spacing:2.4px; }
      .detail { fill:#756880; font-size:10px; }
      .blink { animation:blink 1.6s step-end infinite; }
      @keyframes blink { 50% { opacity:.25 } }
    </style>
  </defs>
  <rect x="1" y="1" width="1098" height="338" rx="14" fill="url(#background)" stroke="#342047" stroke-width="2"/>
  <rect x="1" y="1" width="1098" height="338" rx="14" fill="url(#grid)"/>
  <path d="M31 1H1v30 M1069 1h30v30 M1099 309v30h-30 M31 339H1v-30" stroke="#a76ff0" stroke-width="2" fill="none"/>
  <circle cx="50" cy="42" r="4" fill="#b794f4" filter="url(#glow)" class="blink"/>
  <text x="66" y="46" class="kicker">LIVE HUNT / ${escapeXml(options.username.toUpperCase())}</text>
  <text x="48" y="84" class="title">NIGHTFALL SERPENT</text>
  <text x="1052" y="45" text-anchor="end" class="detail">${calendar.totalContributions} CONTRIBUTIONS // ${activeDays} ACTIVE DAYS</text>
  <text x="1052" y="82" text-anchor="end" class="kicker">CONSUME // RESET // REPEAT</text>
  <g>${contributionCells(calendar, points)}</g>
  <g>${snakeBody()}</g>
  <path d="M48 284H1052" stroke="#291b39"/>
  <text x="48" y="310" class="detail">ORIGINAL TYPESCRIPT ENGINE / GENERATED ${updated}</text>
  <text x="1052" y="310" text-anchor="end" class="kicker">THE VOID IS HUNGRY</text>
</svg>
`;
}
