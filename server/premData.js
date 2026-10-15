import { resolveTeam } from './teamCatalog.js';

const FD_BASE = 'https://api.football-data.org/v4';
const OPENFOOTBALL_BASE =
  'https://raw.githubusercontent.com/openfootball/football.json/master';

const COMPETITION = {
  id: 2021,
  name: 'Premier League',
  code: 'PL',
  type: 'LEAGUE',
  emblem: 'https://crests.football-data.org/PL.png',
};

/** Season start years we expose in the UI (newest first). */
export const SUPPORTED_SEASONS = [2026, 2025, 2024, 2023];

export function normalizeSeason(value, fallback = getDefaultSeason()) {
  const year = Number.parseInt(value, 10);
  if (Number.isFinite(year) && year >= 2010 && year <= 2100) {
    return year;
  }
  return fallback;
}

export function getDefaultSeason() {
  // Premier League season label is the starting calendar year.
  // After July, the new season is underway.
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? year : year - 1;
}

export function seasonLabel(seasonYear) {
  const next = String(seasonYear + 1).slice(-2);
  return `${seasonYear}/${next}`;
}

function openfootballPath(seasonYear) {
  return `${OPENFOOTBALL_BASE}/${seasonYear}-${String(seasonYear + 1).slice(-2)}/en.1.json`;
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function getFootballDataKey() {
  return process.env.FOOTBALL_DATA_API_KEY || process.env.API_KEY || '';
}

async function fetchFootballData(pathname, seasonYear) {
  const key = getFootballDataKey();
  if (!key) return null;

  const url = new URL(`${FD_BASE}${pathname}`);
  url.searchParams.set('season', String(seasonYear));
  return fetchJson(url.toString(), { 'X-Auth-Token': key });
}

function parseMatchScore(rawScore) {
  if (rawScore && typeof rawScore === 'object' && !Array.isArray(rawScore) && Array.isArray(rawScore.ft)) {
    return {
      status: 'FINISHED',
      score: {
        fullTime: { home: rawScore.ft[0], away: rawScore.ft[1] },
        halfTime: Array.isArray(rawScore.ht)
          ? { home: rawScore.ht[0], away: rawScore.ht[1] }
          : { home: null, away: null },
      },
    };
  }

  // openfootball often uses [0, 0] for fixtures that are not fully recorded yet
  return {
    status: 'TIMED',
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
  };
}

async function loadOpenfootballSeason(seasonYear) {
  const data = await fetchJson(openfootballPath(seasonYear));
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const teamNames = new Set();
  matches.forEach((match) => {
    teamNames.add(match.team1);
    teamNames.add(match.team2);
  });

  const teams = [...teamNames].map((name) => resolveTeam(name)).sort((a, b) => a.name.localeCompare(b.name));
  const teamsByName = Object.fromEntries(teams.map((team) => [team.name, team]));

  const normalizedMatches = matches.map((match, index) => {
    const homeTeam = teamsByName[match.team1];
    const awayTeam = teamsByName[match.team2];
    const { status, score } = parseMatchScore(match.score);
    const date = match.date || '1970-01-01';
    const time = match.time || '00:00';
    return {
      id: Number(`${seasonYear}${String(index + 1).padStart(4, '0')}`),
      utcDate: `${date}T${time}:00Z`,
      status,
      matchday: Number.parseInt(String(match.round || '').replace(/\D+/g, ''), 10) || null,
      score,
      homeTeam,
      awayTeam,
      competition: COMPETITION,
    };
  });

  return { teams, matches: normalizedMatches, competitionName: data.name || 'Premier League' };
}

function buildStandings(teams, matches) {
  const stats = Object.fromEntries(
    teams.map((team) => [
      team.id,
      {
        team,
        playedGames: 0,
        won: 0,
        draw: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      },
    ])
  );

  matches
    .filter((match) => match.status === 'FINISHED')
    .forEach((match) => {
      const home = stats[match.homeTeam.id];
      const away = stats[match.awayTeam.id];
      if (!home || !away) return;

      const homeGoals = match.score.fullTime.home;
      const awayGoals = match.score.fullTime.away;

      home.playedGames += 1;
      away.playedGames += 1;
      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;
      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (homeGoals < awayGoals) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.draw += 1;
        away.draw += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  return Object.values(stats)
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    })
    .map((row, index) => ({
      position: index + 1,
      team: {
        id: row.team.id,
        name: row.team.name,
        shortName: row.team.shortName,
        tla: row.team.tla,
        crest: row.team.crest,
      },
      playedGames: row.playedGames,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      points: row.points,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
    }));
}

async function loadSeasonBundle(seasonYear) {
  try {
    const fdTeams = await fetchFootballData('/competitions/PL/teams', seasonYear);
    if (fdTeams?.teams) {
      return { source: 'football-data', teamsPayload: fdTeams };
    }
  } catch (error) {
    // Fall through to openfootball when the key is missing or season is restricted.
    if (error.status && error.status !== 403 && error.status !== 404) {
      console.warn('football-data teams failed, using openfootball:', error.message);
    }
  }

  const open = await loadOpenfootballSeason(seasonYear);
  return {
    source: 'openfootball',
    teamsPayload: {
      count: open.teams.length,
      filters: { season: seasonYear },
      competition: COMPETITION,
      season: {
        id: seasonYear,
        startDate: `${seasonYear}-08-01`,
        endDate: `${seasonYear + 1}-05-31`,
        currentMatchday: null,
        winner: null,
      },
      teams: open.teams,
      matches: open.matches,
    },
  };
}

export async function listSeasons() {
  let currentSeason = getDefaultSeason();
  try {
    const competitions = await fetchJson(`${FD_BASE}/competitions`);
    const pl = competitions.competitions?.find((competition) => competition.code === 'PL');
    if (pl?.currentSeason?.startDate) {
      currentSeason = Number.parseInt(pl.currentSeason.startDate.slice(0, 4), 10) || currentSeason;
    }
  } catch {
    // Keep computed default when public metadata is unavailable.
  }

  const years = [...new Set([currentSeason, ...SUPPORTED_SEASONS])]
    .filter((year) => year <= currentSeason)
    .sort((a, b) => b - a);

  return {
    currentSeason,
    seasons: years.map((year) => ({
      season: year,
      label: seasonLabel(year),
      isCurrent: year === currentSeason,
    })),
  };
}

export async function getTeams(seasonYear) {
  const season = normalizeSeason(seasonYear);
  const bundle = await loadSeasonBundle(season);
  return {
    ...bundle.teamsPayload,
    filters: { ...(bundle.teamsPayload.filters || {}), season },
    meta: { source: bundle.source, season, label: seasonLabel(season) },
  };
}

export async function getTable(seasonYear) {
  const season = normalizeSeason(seasonYear);

  try {
    const standings = await fetchFootballData('/competitions/PL/standings', season);
    if (standings?.standings) {
      return {
        ...standings,
        filters: { ...(standings.filters || {}), season },
        meta: { source: 'football-data', season, label: seasonLabel(season) },
      };
    }
  } catch (error) {
    if (error.status && error.status !== 403 && error.status !== 404) {
      console.warn('football-data standings failed, using openfootball:', error.message);
    }
  }

  const open = await loadOpenfootballSeason(season);
  const table = buildStandings(open.teams, open.matches);
  return {
    filters: { season },
    competition: COMPETITION,
    season: {
      id: season,
      startDate: `${season}-08-01`,
      endDate: `${season + 1}-05-31`,
      currentMatchday: null,
      winner: null,
    },
    standings: [{ stage: 'REGULAR_SEASON', type: 'TOTAL', table }],
    meta: { source: 'openfootball', season, label: seasonLabel(season) },
  };
}

export async function getTeamMatches(teamId, seasonYear) {
  const season = normalizeSeason(seasonYear);
  const numericId = Number.parseInt(teamId, 10);
  if (!Number.isFinite(numericId)) {
    const error = new Error('Invalid team ID');
    error.status = 400;
    throw error;
  }

  try {
    const key = getFootballDataKey();
    if (key) {
      const url = new URL(`${FD_BASE}/teams/${numericId}/matches`);
      url.searchParams.set('competitions', 'PL');
      url.searchParams.set('season', String(season));
      const matches = await fetchJson(url.toString(), { 'X-Auth-Token': key });
      return {
        ...matches,
        meta: { source: 'football-data', season, label: seasonLabel(season) },
      };
    }
  } catch (error) {
    if (error.status && error.status !== 403 && error.status !== 404) {
      console.warn('football-data matches failed, using openfootball:', error.message);
    }
  }

  const open = await loadOpenfootballSeason(season);
  const matches = open.matches.filter(
    (match) => match.homeTeam.id === numericId || match.awayTeam.id === numericId
  );

  return {
    filters: { season, competitions: 'PL' },
    resultSet: { count: matches.length },
    matches,
    meta: { source: 'openfootball', season, label: seasonLabel(season) },
  };
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.end(JSON.stringify(payload));
}

export async function handlePremApi(req, res, url) {
  try {
    const season = normalizeSeason(url.searchParams.get('season'));

    if (url.pathname === '/api/prem/seasons') {
      return sendJson(res, 200, await listSeasons());
    }

    if (url.pathname === '/api/prem') {
      return sendJson(res, 200, await getTeams(season));
    }

    if (url.pathname === '/api/prem/table') {
      return sendJson(res, 200, await getTable(season));
    }

    const matchRoute = url.pathname.match(/^\/api\/prem\/matches\/([^/]+)\/?$/);
    if (matchRoute) {
      return sendJson(res, 200, await getTeamMatches(matchRoute[1], season));
    }

    return false;
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || 'Failed to fetch Premier League data',
    });
    return true;
  }
}
