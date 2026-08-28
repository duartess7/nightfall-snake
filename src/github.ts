export type ContributionDay = {
  contributionCount: number;
  date: string;
  weekday: number;
};

export type ContributionWeek = {
  contributionDays: ContributionDay[];
};

export type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

type GraphqlResponse = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const QUERY = `
  query NightfallSnake($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

export async function fetchContributionCalendar(
  username: string,
  token: string,
): Promise<ContributionCalendar> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "nightfall-snake",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}`);
  }

  const payload = (await response.json()) as GraphqlResponse;
  const calendar = payload.data?.user?.contributionsCollection.contributionCalendar;
  if (!calendar) {
    const detail = payload.errors?.map((error) => error.message).join("; ");
    throw new Error(detail || `No contribution calendar found for ${username}`);
  }
  return calendar;
}

export function createDemoCalendar(columns = 53): ContributionCalendar {
  const weeks: ContributionWeek[] = [];
  let totalContributions = 0;
  const start = new Date(Date.UTC(2025, 7, 24));

  for (let week = 0; week < columns; week += 1) {
    const contributionDays: ContributionDay[] = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const wave = Math.sin(week * 0.62 + weekday * 1.17);
      const pulse = (week * 7 + weekday) % 13 === 0 ? 5 : 0;
      const contributionCount = Math.max(0, Math.round(wave * 3 + pulse));
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + week * 7 + weekday);
      contributionDays.push({
        contributionCount,
        date: date.toISOString().slice(0, 10),
        weekday,
      });
      totalContributions += contributionCount;
    }
    weeks.push({ contributionDays });
  }

  return { totalContributions, weeks };
}
