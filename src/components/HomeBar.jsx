export const HomeBar = ({teams, onTeamChange}) => {

  const currentTeams = teams.map(team => {
    return (
      <option key={team.id} value={team.id}> {/* assuming 'id' is unique */}
        {team.name} {/* assuming each team has a 'name' */}
      </option>
    );
  });

  return (
    <div className="whole-head">
      <div className="header">
        <h1>Favourite Team :</h1>
        {/* <label htmlFor="teams">Choose a team:</label> */}
        <select id="teams" name="teams" className="select-box" onChange={onTeamChange}>
          {currentTeams}
        </select>
      </div>
      <nav className="nav header-nav">
        <a href="">Home</a>
        <a href="">Sign in</a>
      </nav>
    </div>
  );
}
