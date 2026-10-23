/* eslint-disable react/prop-types */
import '../styles/PlayerStats.css';

export const PlayerStats = ({ players = [], selectedTeam = null, loading = false }) => {
  const title = selectedTeam
    ? `${selectedTeam.shortName || selectedTeam.name} — Goals / Starts / Assists`
    : 'Player Goals / Starts / Assists';

  if (loading) {
    return (
      <section className="player-stats">
        <h3 className="player-stats-title">{title}</h3>
        <p className="player-stats-empty">Loading player stats...</p>
      </section>
    );
  }

  if (!players.length) {
    return (
      <section className="player-stats">
        <h3 className="player-stats-title">{title}</h3>
        <p className="player-stats-empty">
          {selectedTeam
            ? 'No player stats available for this team yet.'
            : 'No player stats available for this season yet.'}
        </p>
      </section>
    );
  }

  return (
    <section className="player-stats">
      <h3 className="player-stats-title">{title}</h3>
      <div className="player-stats-scroll">
        <table className="player-stats-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              {!selectedTeam ? <th>Team</th> : null}
              <th title="Goals">G</th>
              <th title="Starts">ST</th>
              <th title="Assists">A</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={`${player.id}-${player.team?.id || 'na'}`}>
                <td>{player.rank}</td>
                <td>
                  <div className="player-cell">
                    <span className="player-name">{player.name}</span>
                    {player.position ? (
                      <span className="player-position">{player.position}</span>
                    ) : null}
                  </div>
                </td>
                {!selectedTeam ? (
                  <td>
                    <div className="player-team-cell">
                      {player.team?.crest ? (
                        <img
                          src={player.team.crest}
                          alt=""
                          className="player-team-crest"
                        />
                      ) : null}
                      <span>{player.team?.shortName || player.team?.name}</span>
                    </div>
                  </td>
                ) : null}
                <td className="stat-num">{player.goals}</td>
                <td className="stat-num">{player.starts}</td>
                <td className="stat-num">{player.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
