/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
export const TeamHeader = ({selectedTeam, teamMatches}) => {
  // Function to get last 4 games record
  const getLastFourGamesRecord = () => {
    if (!selectedTeam || !teamMatches) return null;
    
    // Filter finished matches and get last 4
    const finishedMatches = teamMatches
      .filter(match => match.status === 'FINISHED')
      .slice(-4); // Get last 4 matches
    
    if (finishedMatches.length === 0) return null;
    
    // Calculate record for each match
    const record = finishedMatches.map(match => {
      const homeTeamId = match.homeTeam.id;
      const awayTeamId = match.awayTeam.id;
      const isHomeTeam = selectedTeam.id === homeTeamId;
      
      const homeScore = match.score.fullTime.home;
      const awayScore = match.score.fullTime.away;
      
      if (isHomeTeam) {
        if (homeScore > awayScore) return 'W';
        if (homeScore < awayScore) return 'L';
        return 'D';
      } else {
        if (awayScore > homeScore) return 'W';
        if (awayScore < homeScore) return 'L';
        return 'D';
      }
    });
    
    return record;
  };

  const lastFourRecord = getLastFourGamesRecord();

  return (
  <section className="team-header">
    {
      selectedTeam ? (
        <>
          <img src={selectedTeam.crest} alt="Crest of the team"/>
          <div className="logo">
            <h2>{selectedTeam.name}</h2>
          <aside className="rec-form">
            <div className="record">
              {lastFourRecord ? (
                <div className="last-four-games">
                  <span className="record-label">Record :</span>
                  {lastFourRecord.map((result, index) => (
                    <span key={index} className={`game-result ${result.toLowerCase()}`}>
                      {result}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="no-record">No recent games</span>
              )}
            </div>
          </aside>
          </div>
        </>
      )  : (
          <h2 className="no-team">No team selected</h2>
      )
    }
  </section>
  );
}