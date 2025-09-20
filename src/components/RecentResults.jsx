/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import '../styles/RecentResults.css';

export const RecentResults = ({ teamMatches, selectedTeam }) => {
  // Get recent finished matches with full match data
  const getRecentMatches = () => {
    if (!teamMatches || !selectedTeam) return [];
    
    return teamMatches
      ?.filter(match => match.status === 'FINISHED')
      ?.slice(-10) // Get last 10 matches
      || [];
  };

  const recentMatches = getRecentMatches();

  // Function to get opponent team and score info
  const getMatchInfo = (match) => {
    const homeTeamId = match.homeTeam.id;
    const awayTeamId = match.awayTeam.id;
    const isHomeTeam = selectedTeam.id === homeTeamId;
    
    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;
    
    if (isHomeTeam) {
      return {
        opponent: match.awayTeam,
        score: `${homeScore}-${awayScore}`,
        isHome: true
      };
    } else {
      return {
        opponent: match.homeTeam,
        score: `${awayScore}-${homeScore}`,
        isHome: false
      };
    }
  };

  return (
    <section className="results">
      {recentMatches.length > 0 ? (
        recentMatches.map((match, index) => {
          const matchInfo = getMatchInfo(match);
          return (
            <div key={index} className="match-result">
              <div className="opponent-crest">
                {matchInfo.opponent.crest ? (
                  <img 
                    src={matchInfo.opponent.crest} 
                    alt={`${matchInfo.opponent.name} crest`}
                    className="team-crest"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="team-crest-fallback"
                  style={{ display: matchInfo.opponent.crest ? 'none' : 'flex' }}
                >
                  {matchInfo.opponent.shortName || matchInfo.opponent.name.charAt(0)}
                </div>
              </div>
              <div className="match-score">
                {matchInfo.score}
              </div>
              <div className="match-venue">
                {matchInfo.isHome ? 'H' : 'A'}
              </div>
            </div>
          );
        })
      ) : (
        <div className="no-results">No recent results</div>
      )}
    </section>
  );
}