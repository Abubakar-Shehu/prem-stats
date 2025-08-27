export const FixtureList = ({ teamMatches, selectedTeam }) => {
  const futureMatches = teamMatches.map (matches => {
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
    </div>
  );
}