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
import './App.css'
import { useEffect, useState } from 'react'

function App() {

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [table, setTable] = useState([]);

  useEffect(() => {
    const url = 'http://localhost:8080/api/prem';
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
    const url = 'http://localhost:8080/api/prem/table';
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

  const handleTeamChange = (event) => {
    const selectedTeamId = event.target.value;
    const team = teams.find(t => String(t.id) === selectedTeamId);  // Find the team by ID
    setSelectedTeam(team);  // Update the selected team state
  };

  return (
    <>
      <HomeBar teams={teams} onTeamChange={handleTeamChange}/>
      <div className='main-body'>
        <section className='left-bar'>
          <TeamCards selectedTeam={selectedTeam}/>
          <QuickLinks />
          <RecentResults />
        </section>
        <section className='mid-bar'>
          <TeamHeader selectedTeam={selectedTeam}/>
          <KeyStats />
          <FixtureList />  
        </section>
        <section className='right-bar'>
          <TableStanding table={table}/>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default App
