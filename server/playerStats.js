import { TEAM_CATALOG, resolveTeam } from './teamCatalog.js';

const FPL_LIVE = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const FPL_HISTORY_BASE =
  'https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data';

/** FPL short codes that differ from our catalog TLAs. */
const TLA_ALIASES = {
  NFO: 'NOT',
};

const POSITION_BY_TYPE = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

function getDefaultSeason() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? year : year - 1;
}

function normalizeSeason(value, fallback = getDefaultSeason()) {
  const year = Number.parseInt(value, 10);
  if (Number.isFinite(year) && year >= 2010 && year <= 2100) {
    return year;
  }
  return fallback;
}

function seasonLabel(seasonYear) {
  return `${seasonYear}/${String(seasonYear + 1).slice(-2)}`;
}

function buildTlaIndex() {
  const byTla = {};
  Object.entries(TEAM_CATALOG).forEach(([name, meta]) => {
    byTla[meta.tla] = { ...meta, name };
  });
  return byTla;
}

const TLA_INDEX = buildTlaIndex();

function resolveFplTeam(shortName, displayName) {
  const tla = TLA_ALIASES[shortName] || shortName;
  if (TLA_INDEX[tla]) {
    const meta = TLA_INDEX[tla];
    return {
      id: meta.id,
      name: meta.name,
      shortName: meta.shortName,
      tla: meta.tla,
      crest: `https://crests.football-data.org/${meta.id}.png`,
    };
  }

  const guessedName = displayName?.includes('FC') ? displayName : `${displayName} FC`;
  return resolveTeam(guessedName);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'prem-stats/1.0' },
  });
  if (!response.ok) {
    const error = new Error(`Failed to fetch ${url} (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response.text();
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      current.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      current.push(field);
      if (current.length > 1 || current[0] !== '') rows.push(current);
      current = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length || current.length) {
    current.push(field);
    rows.push(current);
  }

  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((values) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] ?? '';
    });
    return entry;
  });
}

function toInt(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

function normalizePlayer(raw, team) {
  const goals = toInt(raw.goals_scored);
  const assists = toInt(raw.assists);
  const starts = toInt(raw.starts);
  const minutes = toInt(raw.minutes);
  const first = raw.first_name || '';
  const second = raw.second_name || '';
  const webName = raw.web_name || second || first;

  return {
    id: toInt(raw.id),
    name: webName,
    fullName: `${first} ${second}`.trim() || webName,
    position: POSITION_BY_TYPE[toInt(raw.element_type)] || null,
    goals,
    assists,
    starts,
    minutes,
    team,
  };
}

async function loadLiveFplPlayers() {
  const response = await fetch(FPL_LIVE, {
    headers: { 'User-Agent': 'prem-stats/1.0' },
  });
  if (!response.ok) {
    const error = new Error(`FPL live API failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  const teamsById = Object.fromEntries(
    (data.teams || []).map((team) => [
      team.id,
      resolveFplTeam(team.short_name, team.name),
    ])
  );

  return (data.elements || [])
    .map((player) => normalizePlayer(player, teamsById[player.team]))
    .filter((player) => player.team);
}

async function loadHistoricalFplPlayers(seasonYear) {
  const folder = `${seasonYear}-${String(seasonYear + 1).slice(-2)}`;
  const [playersCsv, teamsCsv] = await Promise.all([
    fetchText(`${FPL_HISTORY_BASE}/${folder}/players_raw.csv`),
    fetchText(`${FPL_HISTORY_BASE}/${folder}/teams.csv`),
  ]);

  const teamsById = Object.fromEntries(
    parseCsv(teamsCsv).map((team) => [
      toInt(team.id),
      resolveFplTeam(team.short_name, team.name),
    ])
  );

  return parseCsv(playersCsv)
    .map((player) => normalizePlayer(player, teamsById[toInt(player.team)]))
    .filter((player) => player.team);
}

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    if (b.starts !== a.starts) return b.starts - a.starts;
    return b.minutes - a.minutes;
  });
}

export async function getPlayerStats(seasonYear, { teamId, limit = 25 } = {}) {
  const season = normalizeSeason(seasonYear);
  const currentSeason = getDefaultSeason();
  const numericTeamId = teamId == null || teamId === '' ? null : Number.parseInt(teamId, 10);
  const numericLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 25, 1), 100);

  let source = 'fpl-live';
  let players;

  try {
    if (season === currentSeason) {
      players = await loadLiveFplPlayers();
    } else {
      source = 'fpl-history';
      players = await loadHistoricalFplPlayers(season);
    }
  } catch (liveError) {
    if (season === currentSeason) {
      console.warn('FPL live failed, falling back to archive:', liveError.message);
      source = 'fpl-history';
      players = await loadHistoricalFplPlayers(season);
    } else {
      throw liveError;
    }
  }

  if (Number.isFinite(numericTeamId)) {
    players = players.filter((player) => player.team.id === numericTeamId);
  } else {
    players = players.filter(
      (player) => player.goals > 0 || player.assists > 0 || player.starts > 0
    );
  }

  const ranked = sortPlayers(players).slice(0, numericLimit).map((player, index) => ({
    rank: index + 1,
    ...player,
  }));

  return {
    filters: {
      season,
      team: Number.isFinite(numericTeamId) ? numericTeamId : null,
      limit: numericLimit,
    },
    count: ranked.length,
    players: ranked,
    meta: {
      source,
      season,
      label: seasonLabel(season),
      metrics: ['goals', 'starts', 'assists'],
    },
  };
}
