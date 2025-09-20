/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import '../styles/KeyStats.css';

export const KeyStats = ({ selectedTeam, teamMatches }) => {
  // Calculate team statistics
  const calculateStats = () => {
    if (!selectedTeam || !teamMatches) {
      return {
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      };
    }

    let goalsFor = 0;
    let goalsAgainst = 0;

    // Filter finished matches for the selected team
    const finishedMatches = teamMatches.filter(match => match.status === 'FINISHED');

    finishedMatches.forEach(match => {
      const homeTeamId = match.homeTeam.id;
      const awayTeamId = match.awayTeam.id;
      const isHomeTeam = selectedTeam.id === homeTeamId;
      
      const homeScore = match.score.fullTime.home;
      const awayScore = match.score.fullTime.away;

      if (isHomeTeam) {
        goalsFor += homeScore;
        goalsAgainst += awayScore;
      } else {
        goalsFor += awayScore;
        goalsAgainst += homeScore;
      }
    });

    const goalDifference = goalsFor - goalsAgainst;

    return {
      goalsFor,
      goalsAgainst,
      goalDifference
    };
  };

  const stats = calculateStats();

  return (
    <section className="stats">
      <div className="stat-item">
        <p className="stat-label">Goals For :</p>
        <p className="stat-value">{stats.goalsFor}</p>
      </div>
      <div className="stat-item">
        <p className="stat-label">Goals Against :</p> 
        <p className="stat-value">{stats.goalsAgainst}</p>
      </div>
      <div className="stat-item">
        <p className="stat-label">Goal Difference :</p>
        <p className={`stat-value ${stats.goalDifference >= 0 ? 'positive' : 'negative'}`}>
          {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference}
        </p>
      </div>
    </section>
  );
}