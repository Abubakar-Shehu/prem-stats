/** Stable Premier League team metadata used to shape openfootball data. */
export const TEAM_CATALOG = {
  'Arsenal FC': { id: 57, shortName: 'Arsenal', tla: 'ARS' },
  'Aston Villa FC': { id: 58, shortName: 'Aston Villa', tla: 'AVL' },
  'Chelsea FC': { id: 61, shortName: 'Chelsea', tla: 'CHE' },
  'Everton FC': { id: 62, shortName: 'Everton', tla: 'EVE' },
  'Fulham FC': { id: 63, shortName: 'Fulham', tla: 'FUL' },
  'Liverpool FC': { id: 64, shortName: 'Liverpool', tla: 'LIV' },
  'Manchester City FC': { id: 65, shortName: 'Man City', tla: 'MCI' },
  'Manchester United FC': { id: 66, shortName: 'Man United', tla: 'MUN' },
  'Newcastle United FC': { id: 67, shortName: 'Newcastle', tla: 'NEW' },
  'Sunderland AFC': { id: 71, shortName: 'Sunderland', tla: 'SUN' },
  'Tottenham Hotspur FC': { id: 73, shortName: 'Tottenham', tla: 'TOT' },
  'Wolverhampton Wanderers FC': { id: 76, shortName: 'Wolverhampton', tla: 'WOL' },
  'West Ham United FC': { id: 563, shortName: 'West Ham', tla: 'WHU' },
  'Brighton & Hove Albion FC': { id: 397, shortName: 'Brighton Hove', tla: 'BHA' },
  'Brentford FC': { id: 402, shortName: 'Brentford', tla: 'BRE' },
  'AFC Bournemouth': { id: 1044, shortName: 'Bournemouth', tla: 'BOU' },
  'Nottingham Forest FC': { id: 351, shortName: 'Nottingham', tla: 'NOT' },
  'Crystal Palace FC': { id: 354, shortName: 'Crystal Palace', tla: 'CRY' },
  'Burnley FC': { id: 328, shortName: 'Burnley', tla: 'BUR' },
  'Leeds United FC': { id: 341, shortName: 'Leeds United', tla: 'LEE' },
  'Leicester City FC': { id: 338, shortName: 'Leicester City', tla: 'LEI' },
  'Southampton FC': { id: 340, shortName: 'Southampton', tla: 'SOU' },
  'Ipswich Town FC': { id: 349, shortName: 'Ipswich Town', tla: 'IPS' },
  'Hull City AFC': { id: 322, shortName: 'Hull City', tla: 'HUL' },
  'Coventry City FC': { id: 1076, shortName: 'Coventry', tla: 'COV' },
  'Sheffield United FC': { id: 356, shortName: 'Sheffield Utd', tla: 'SHU' },
  'Luton Town FC': { id: 389, shortName: 'Luton Town', tla: 'LUT' },
};

export function resolveTeam(name) {
  const known = TEAM_CATALOG[name];
  if (known) {
    return {
      id: known.id,
      name,
      shortName: known.shortName,
      tla: known.tla,
      crest: `https://crests.football-data.org/${known.id}.png`,
      coach: null,
    };
  }

  // Deterministic fallback id for uncatalogued clubs
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const id = 900000 + (hash % 90000);
  const shortName = name.replace(/\s+(FC|AFC)$/i, '').trim();
  return {
    id,
    name,
    shortName,
    tla: shortName.slice(0, 3).toUpperCase(),
    crest: null,
    coach: null,
  };
}
