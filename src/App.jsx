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

function App() {
  return (
    <>
      <HomeBar />
      <TeamCards />
      <QuickLinks />
      <RecentResults />
      <TeamHeader />
      <KeyStats />
      <FixtureList />
      <TableStanding />
      <Footer />
    </>
  )
}

export default App
