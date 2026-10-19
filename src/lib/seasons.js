export const DEFAULT_SEASONS = [
  { season: 2026, label: '2026/27', isCurrent: true },
  { season: 2025, label: '2025/26', isCurrent: false },
  { season: 2024, label: '2024/25', isCurrent: false },
  { season: 2023, label: '2023/24', isCurrent: false },
];

export function getDefaultSeasonYear() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? year : year - 1;
}

export function seasonLabel(seasonYear) {
  return `${seasonYear}/${String(seasonYear + 1).slice(-2)}`;
}

export function parseSeasonParam(value, fallback = getDefaultSeasonYear()) {
  const year = Number.parseInt(value, 10);
  if (Number.isFinite(year) && year >= 2010 && year <= 2100) {
    return year;
  }
  return fallback;
}
