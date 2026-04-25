import { 
  FixtureList, 
  Footer, 
  HomeBar, 
  KeyStats, 
  QuickLinks, 
  RecentResults,
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

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [table, setTable] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Helper function to get API URL
  const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_URL;
    if (!apiUrl || apiUrl === 'your_existing_api_url_here') {
      console.error('VITE_URL is not properly configured in .env file');
      setError('API URL not configured. Please check your environment variables.');
      return null;
    }
    return apiUrl;
  };


  useEffect(() => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const url = `${apiUrl}/api/prem`;
    const options = { 
      method: 'GET',
      credentials: 'include' // Include cookies for authentication
    };

    const getStats = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Authentication required - redirect to sign in
            window.location.href = '/signin';
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch teams data. Please check your API URL and ensure the server is running.');
      } finally {
        setLoading(false);
      }
    } 

    getStats();
  }, [])

  useEffect(() => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const url = `${apiUrl}/api/prem/table`;
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
            // Authentication required - redirect to sign in
            window.location.href = '/signin';
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
        }
      } catch (error) {
        console.error('Error fetching table data:', error);
        setError('Failed to fetch table data');
      }
    } 

    getTableStanding();
  }, [])

  useEffect(() => {
    if (!selectedTeam?.id) return;

    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const team = selectedTeam.id
    const url = `${apiUrl}/api/prem/matches/${team}`;
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
            // Authentication required - redirect to sign in
            window.location.href = '/signin';
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
        }
      } catch (error) {
        console.error('Error fetching matches data:', error);
        setError('Failed to fetch matches data');
      }
    } 

    getGames();
  }, [selectedTeam])

  const handleTeamChange = (event) => {
    const selectedTeamId = event.target.value;
    const team = teams.find(t => String(t.id) === selectedTeamId);  // Find the team by ID
    setSelectedTeam(team);  // Update the selected team state
  };
  
  console.log(import.meta.env)

  return (
    <AuthProvider>
      <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={
              <>
                <HomeBar teams={teams} onTeamChange={handleTeamChange} isDarkMode={isDarkMode} toggleTheme={toggleTheme}/>
                {error && (
                  <div className="error-banner">
                    <p>⚠️ {error}</p>
                    <button onClick={() => setError(null)}>✕</button>
                  </div>
                )}
                {loading && (
                  <div className="loading-banner">
                    <p>🔄 Loading data...</p>
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
