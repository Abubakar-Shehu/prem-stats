import { 
  FixtureList, 
  Footer, 
  HomeBar, 
  KeyStats, 
  QuickLinks, 
  RecentResults,
  SeasonTabs,
  TableStanding,
  TeamCards,
  TeamHeader
} from './components'
import { Modal } from './routes/modal';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css'
import { useEffect, useState } from 'react'

const isAuthRoute = () => window.location.pathname === '/signin' || window.location.pathname === '/signup';
const redirectToSignIn = () => {
  if (!isAuthRoute()) {
    window.location.href = '/signin';
  }
};

const defaultSeason = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? year : year - 1;
};

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [table, setTable] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Empty/undefined VITE_URL means same-origin (Vite middleware / Vercel functions).
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
    if (isAuthRoute()) return;

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
          if (result.currentSeason) {
            setSelectedSeason((current) => current || result.currentSeason);
          }
        }
      } catch (seasonError) {
        console.warn('Could not load seasons list:', seasonError);
        // Keep local defaults so the tabs still render.
        setSeasons([
          { season: 2026, label: '2026/27', isCurrent: true },
          { season: 2025, label: '2025/26', isCurrent: false },
          { season: 2024, label: '2024/25', isCurrent: false },
          { season: 2023, label: '2023/24', isCurrent: false },
        ]);
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (isAuthRoute()) return;

    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    const url = `${apiUrl}/api/prem?season=${selectedSeason}`;
    const options = { 
      method: 'GET',
      credentials: 'include' // Include cookies for authentication
    };

    const getStats = async () => {
      setLoading(true);
      setError(null);
      setSelectedTeam(null);
      setTeamMatches([]);
      try {
        console.log('Fetching from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Authentication required - redirect unless already on auth pages
            redirectToSignIn();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.teams) {
          setTeams(result.teams);
        } else {
          console.warn('No teams data found in response:', result);
          setError('No teams data available');
        }
      } catch (fetchError) {
        console.error('Error fetching data:', fetchError);
        setError('Failed to fetch teams data. Please check your API URL and ensure the server is running.');
      } finally {
        setLoading(false);
      }
    } 

    getStats();
  }, [selectedSeason])

  useEffect(() => {
    if (isAuthRoute()) return;

    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    const url = `${apiUrl}/api/prem/table?season=${selectedSeason}`;
    const options = { 
      method: 'GET',
      credentials: 'include' // Include cookies for authentication
    };

    const getTableStanding = async () => {
      try {
        console.log('Fetching table from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Authentication required - redirect unless already on auth pages
            redirectToSignIn();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Table API Response:', result);
        
        if (result.standings && result.standings[0] && result.standings[0].table) {
          setTable(result.standings[0].table);
        } else {
          console.warn('No table data found in response:', result);
          setTable([]);
        }
      } catch (fetchError) {
        console.error('Error fetching table data:', fetchError);
        setError('Failed to fetch table data');
      }
    } 

    getTableStanding();
  }, [selectedSeason])

  useEffect(() => {
    if (isAuthRoute()) return;
    if (!selectedTeam?.id) return;

    const apiUrl = getApiUrl();
    if (apiUrl === null) return;

    const team = selectedTeam.id
    const url = `${apiUrl}/api/prem/matches/${team}?season=${selectedSeason}`;
    const options = { 
      method: 'GET',
      credentials: 'include' // Include cookies for authentication
    };

    const getGames = async () => {
      try {
        console.log('Fetching matches from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Authentication required - redirect unless already on auth pages
            redirectToSignIn();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Matches API Response:', result);
        
        if (result.matches) {
          setTeamMatches(result.matches);
        } else {
          console.warn('No matches data found in response:', result);
          setTeamMatches([]);
        }
      } catch (fetchError) {
        console.error('Error fetching matches data:', fetchError);
        setError('Failed to fetch matches data');
      }
    } 

    getGames();
  }, [selectedTeam, selectedSeason])

  const handleTeamChange = (event) => {
    const selectedTeamId = event.target.value;
    const team = teams.find(t => String(t.id) === selectedTeamId);  // Find the team by ID
    setSelectedTeam(team);  // Update the selected team state
  };

  const handleSeasonChange = (seasonYear) => {
    setSelectedSeason(seasonYear);
  };
  
  return (
    <AuthProvider>
      <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={
              <>
                <HomeBar key={selectedSeason} teams={teams} onTeamChange={handleTeamChange} isDarkMode={isDarkMode} toggleTheme={toggleTheme}/>
                <SeasonTabs
                  seasons={seasons}
                  selectedSeason={selectedSeason}
                  onSeasonChange={handleSeasonChange}
                  disabled={loading}
                />
                {error && (
                  <div className="error-banner">
                    <p>⚠️ {error}</p>
                    <button onClick={() => setError(null)}>✕</button>
                  </div>
                )}
                {loading && (
                  <div className="loading-banner">
                    <p>🔄 Loading {selectedSeason}/{String(selectedSeason + 1).slice(-2)} data...</p>
                  </div>
                )}
                <div className='main-body'>
                  <section className='left-bar'>
                    <TeamCards selectedTeam={selectedTeam}/>
                    <QuickLinks onLinkClick={openModal}/>
                    <RecentResults teamMatches={teamMatches} selectedTeam={selectedTeam} />
                  </section>
                  <section className='mid-bar'>
                    <TeamHeader selectedTeam={selectedTeam} teamMatches={teamMatches}/>
                    <KeyStats selectedTeam={selectedTeam} teamMatches={teamMatches} />
                    <FixtureList teamMatches={teamMatches} selectedTeam={selectedTeam}/>  
                  </section>
                  <section className='right-bar'>
                    <TableStanding table={table}/>
                  </section>
                </div>
                <Footer />
                {isModalOpen && (
                  <Modal onClose={closeModal} />
                )}
              </>
            } />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  )
}

export default App
