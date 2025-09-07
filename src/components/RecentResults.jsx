export const RecentResults = ({ teamMatches, selectedTeam }) => {
  // Function to determine match result for the selected team
  const getMatchResult = (match) => {
    if (!selectedTeam || !match.score) return null;
    
    const homeTeamId = match.homeTeam.id;
    const awayTeamId = match.awayTeam.id;
    const isHomeTeam = selectedTeam.id === homeTeamId;
    
    // Check if match is finished
    if (match.status !== 'FINISHED') return null;
    
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
  };

  // Get recent finished matches (last 5-10 matches)
  const recentMatches = teamMatches
    ?.filter(match => match.status === 'FINISHED')
    ?.slice(-10) // Get last 10 matches
    ?.map(match => getMatchResult(match))
    ?.filter(result => result !== null) || [];

  // Function to get CSS class based on result
  const getResultClass = (result) => {
    const baseClass = "rounded-div";
    if (result === 'W') return `${baseClass} win`;
    if (result === 'L') return `${baseClass} loss`;
    return baseClass; // For draws, use default styling
  };

  return (
    <section className="results">
      {recentMatches.length > 0 ? (
        recentMatches.map((result, index) => (
          <div key={index} className={getResultClass(result)}>
            {result}
          </div>
        ))
      ) : (
        <div>No recent results</div>
      )}
    </section>
  );
}