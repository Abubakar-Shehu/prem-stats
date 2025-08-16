import { 
  FixtureList, 
  Footer, 
  HomeBar, 
  KeyStats, 
  QuickLinks, 
  RecentResult,
  TableStanding,
  TeamCards,
  TeamHeader
} from './components'
import './App.css'

function App() {
  return (
    <>
      <HomeBar />
      <TeamCards />
      <QuickLinks />
      <RecentResult />
      <TeamHeader />
      <KeyStats />
      <FixtureList />
      <TableStanding />
      <Footer />
    </>
  )
}

export default App
