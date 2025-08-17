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
      <div className='main-body'>
        <section className='left-bar'>
          <TeamCards />
          <QuickLinks />
          <RecentResults />
        </section>
        <section className='mid-bar'>
          <TeamHeader />
          <KeyStats />
          <FixtureList />  
        </section>
        <section className='right-bar'>
          <TableStanding />
        </section>
      </div>
      <Footer />
    </>
  )
}

export default App
