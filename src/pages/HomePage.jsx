import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FixtureList,
  Footer,
  HomeBar,
  KeyStats,
  PlayerStats,
  QuickLinks,
  RecentResults,
  SeasonTabs,
  TableStanding,
  TeamCards,
  TeamHeader,
} from '../components';
import { Modal } from '../routes/modal';
import {
  DEFAULT_SEASONS,
  getDefaultSeasonYear,
  parseSeasonParam,
  seasonLabel,
} from '../lib/seasons';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [table, setTable] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);
  const [seasons, setSeasons] = useState(DEFAULT_SEASONS);
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedSeason = parseSeasonParam(
    searchParams.get('season'),
    getDefaultSeasonYear()
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleTheme = () => setIsDarkMode((value) => !value);

  const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_URL;
    if (apiUrl === 'your_existing_api_url_here' || apiUrl === 'your_backend_api_url_here') {
      console.error('VITE_URL is not properly configured in .env file');
      setError('API URL not configured. Please check your environment variables.');
      return null;
    }
    return apiUrl ?? '';
  };

  useEffect(() => {
    // Keep the URL canonical so season links are shareable.
    if (searchParams.get('season') !== String(selectedSeason)) {
      setSearchParams({ season: String(selectedSeason) }, { replace: true });
    }
  }, [searchParams, selectedSeason, setSearchParams]);

  useEffect(() => {
    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    const loadSeasons = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/prem/seasons`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (Array.isArray(result.seasons) && result.seasons.length) {
          setSeasons(result.seasons);
        }
      } catch (seasonError) {
        console.warn('Could not load seasons list:', seasonError);
        setSeasons(DEFAULT_SEASONS);
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    let cancelled = false;
    const url = `${apiUrl}/api/prem?season=${selectedSeason}`;

    const getStats = async () => {
      setLoading(true);
      setError(null);
      setSelectedTeam(null);
      setTeamMatches([]);
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (cancelled) return;

        if (result.teams) {
          setTeams(result.teams);
        } else {
          setError('No teams data available');
        }
      } catch (fetchError) {
        if (cancelled) return;
        console.error('Error fetching data:', fetchError);
        setError('Failed to fetch teams data. Please check your API URL and ensure the server is running.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getStats();
    return () => {
      cancelled = true;
    };
  }, [selectedSeason]);

  useEffect(() => {
    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    let cancelled = false;
    const url = `${apiUrl}/api/prem/table?season=${selectedSeason}`;

    const getTableStanding = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (cancelled) return;

        if (result.standings?.[0]?.table) {
          setTable(result.standings[0].table);
        } else {
          setTable([]);
        }
      } catch (fetchError) {
        if (cancelled) return;
        console.error('Error fetching table data:', fetchError);
        setError('Failed to fetch table data');
      }
    };

    getTableStanding();
    return () => {
      cancelled = true;
    };
  }, [selectedSeason]);

  useEffect(() => {
    if (!selectedTeam?.id) return;

    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    let cancelled = false;
    const url = `${apiUrl}/api/prem/matches/${selectedTeam.id}?season=${selectedSeason}`;

    const getGames = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (cancelled) return;

        setTeamMatches(result.matches || []);
      } catch (fetchError) {
        if (cancelled) return;
        console.error('Error fetching matches data:', fetchError);
        setError('Failed to fetch matches data');
      }
    };

    getGames();
    return () => {
      cancelled = true;
    };
  }, [selectedTeam, selectedSeason]);

  useEffect(() => {
    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    let cancelled = false;
    const params = new URLSearchParams({
      season: String(selectedSeason),
      limit: selectedTeam?.id ? '40' : '25',
    });
    if (selectedTeam?.id) {
      params.set('team', String(selectedTeam.id));
    }

    const loadPlayers = async () => {
      setPlayersLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/prem/players?${params}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (cancelled) return;
        setPlayers(Array.isArray(result.players) ? result.players : []);
      } catch (fetchError) {
        if (cancelled) return;
        console.error('Error fetching player stats:', fetchError);
        setPlayers([]);
      } finally {
        if (!cancelled) setPlayersLoading(false);
      }
    };

    loadPlayers();
    return () => {
      cancelled = true;
    };
  }, [selectedSeason, selectedTeam]);

  const handleTeamChange = (event) => {
    const selectedTeamId = event.target.value;
    const team = teams.find((item) => String(item.id) === selectedTeamId);
    setSelectedTeam(team || null);
  };

  const handleSeasonChange = (seasonYear) => {
    if (seasonYear === selectedSeason) return;
    setSearchParams({ season: String(seasonYear) });
  };

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      <HomeBar
        key={selectedSeason}
        teams={teams}
        onTeamChange={handleTeamChange}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        seasonLabel={seasonLabel(selectedSeason)}
      />
      <SeasonTabs
        seasons={seasons}
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
      />
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button type="button" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {loading && (
        <div className="loading-banner">
          <p>🔄 Loading {seasonLabel(selectedSeason)} data...</p>
        </div>
      )}
      <div className="main-body">
        <section className="left-bar">
          <TeamCards selectedTeam={selectedTeam} />
          <QuickLinks onLinkClick={openModal} />
          <RecentResults teamMatches={teamMatches} selectedTeam={selectedTeam} />
        </section>
        <section className="mid-bar">
          <TeamHeader selectedTeam={selectedTeam} teamMatches={teamMatches} />
          <KeyStats selectedTeam={selectedTeam} teamMatches={teamMatches} />
          <PlayerStats
            players={players}
            selectedTeam={selectedTeam}
            loading={playersLoading}
          />
          <FixtureList teamMatches={teamMatches} selectedTeam={selectedTeam} />
        </section>
        <section className="right-bar">
          <TableStanding table={table} />
        </section>
      </div>
      <Footer />
      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  );
};
