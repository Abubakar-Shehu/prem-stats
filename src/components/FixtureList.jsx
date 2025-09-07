export const FixtureList = ({ teamMatches, selectedTeam }) => {
  // Filter and process matches
  const getUpcomingMatches = () => {
    if (!teamMatches || !selectedTeam) return [];

    // Filter out finished matches and get upcoming ones
    const upcomingMatches = teamMatches.filter(match => 
      match.status !== 'FINISHED' && 
      match.status !== 'CANCELLED' &&
      match.status !== 'POSTPONED'
    );

    if (upcomingMatches.length === 0) return [];

    // Sort by date to get chronological order
    const sortedMatches = upcomingMatches.sort((a, b) => 
      new Date(a.utcDate) - new Date(b.utcDate)
    );

    // Find the next match date
    const nextMatchDate = new Date(sortedMatches[0].utcDate);
    
    // Calculate two months from the next match
    const twoMonthsFromNext = new Date(nextMatchDate);
    twoMonthsFromNext.setMonth(twoMonthsFromNext.getMonth() + 2);

    // Filter matches within two months of the next match
    const matchesWithinTwoMonths = sortedMatches.filter(match => {
      const matchDate = new Date(match.utcDate);
      return matchDate <= twoMonthsFromNext;
    });

    return matchesWithinTwoMonths;
  };

  const upcomingMatches = getUpcomingMatches();

  const futureMatches = upcomingMatches.map(matches => {
    return (
      <tbody key={matches.id}>
          <tr className="table-data">
            <td>{new Date(matches.utcDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit"
            })}</td>
            {
              selectedTeam.id === matches.awayTeam.id && 
              <>
                <td>{matches.homeTeam.shortName}</td>
                <td>Away</td>
              </>
            }
            {
              selectedTeam.id === matches.homeTeam.id && 
              <>
                <td>{matches.awayTeam.shortName}</td>
                <td>Home</td>
              </>
            }
            <td>
              <img src={matches.competition.emblem} alt="Competition Logo" className="fixture-logo"/>
            </td>
          </tr>
        </tbody>)
  });

  return (
    <div className="fixture-table">
      {upcomingMatches.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Opponent</th>
              <th>Home / Away</th>
              <th>Competition</th>
            </tr>
          </thead>
          {futureMatches}
        </table>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          {selectedTeam ? 'No upcoming matches in the next 2 months' : 'Select a team to view upcoming fixtures'}
        </div>
      )}
    </div>
  );
}