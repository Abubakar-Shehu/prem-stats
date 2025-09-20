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
import './App.css'
import { useEffect, useState } from 'react'

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [table, setTable] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  useEffect(() => {
    const url = `${import.meta.env.VITE_URL}/api/prem`;
    const options = { 
      method: 'GET'
    };

    const getStats = async () => {
      try {
        const response = await fetch(url, options);
        const result = await response.json();
        const data = result.teams
        setTeams(data)
      } catch (error) {
        console.error('Error fetching data', error);
      }
    } 

    getStats();
  }, [])

  useEffect(() => {
    const url = `${import.meta.env.VITE_URL}/api/prem/table`;
    const options = { 
      method: 'GET'
    };

    const getTableStanding = async () => {
      try {
        const response = await fetch(url, options);                
        const result = await response.json();
        
        const data = result.standings[0].table;
        setTable(data)
      } catch (error) {
        console.error('Error fetching data', error);
      }
    } 

    getTableStanding();
  }, [])

  useEffect(() => {
    if (!selectedTeam?.id) return;

    const team = selectedTeam.id
    const url = `${import.meta.env.VITE_URL}/api/prem/matches/${team}`;
    const options = { 
      method: 'GET'
    };

    const getGames = async () => {
      try {
        const response = await fetch(url, options);
        const result = await response.json();
        const data = result.matches
        setTeamMatches(data)
      } catch (error) {
        console.error('Error fetching data', error);
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
    <>
      <HomeBar teams={teams} onTeamChange={handleTeamChange}/>
      <div className='main-body'>
        <section className='left-bar'>
          <TeamCards selectedTeam={selectedTeam}/>
          <QuickLinks onLinkClick={openModal}/>
          <RecentResults teamMatches={teamMatches} selectedTeam={selectedTeam} />
        </section>
        <section className='mid-bar'>
          <TeamHeader selectedTeam={selectedTeam} teamMatches={teamMatches}/>
          <KeyStats />
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
  )
}

export default App
