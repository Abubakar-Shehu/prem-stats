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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);


  useEffect(() => {
    const apiUrl = import.meta.env.VITE_URL;
    console.log('API URL:', apiUrl);
    
    if (!apiUrl || apiUrl === 'your_existing_api_url_here') {
      console.error('VITE_URL is not properly configured in .env file');
      return;
    }

    const url = `${apiUrl}/api/prem`;
    const options = { 
      method: 'GET'
    };

    const getStats = async () => {
      try {
        console.log('Fetching from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.teams) {
          setTeams(result.teams);
        } else {
          console.warn('No teams data found in response:', result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Please check your API URL and ensure the server is running');
      }
    } 

    getStats();
  }, [])

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_URL;
    
    if (!apiUrl || apiUrl === 'your_existing_api_url_here') {
      console.error('VITE_URL is not properly configured for table data');
      return;
    }

    const url = `${apiUrl}/api/prem/table`;
    const options = { 
      method: 'GET'
    };

    const getTableStanding = async () => {
      try {
        console.log('Fetching table from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
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
      }
    } 

    getTableStanding();
  }, [])

  useEffect(() => {
    if (!selectedTeam?.id) return;

    const apiUrl = import.meta.env.VITE_URL;
    
    if (!apiUrl || apiUrl === 'your_existing_api_url_here') {
      console.error('VITE_URL is not properly configured for team matches');
      return;
    }

    const team = selectedTeam.id
    const url = `${apiUrl}/api/prem/matches/${team}`;
    const options = { 
      method: 'GET'
    };

    const getGames = async () => {
      try {
        console.log('Fetching matches from:', url);
        const response = await fetch(url, options);
        
        if (!response.ok) {
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
