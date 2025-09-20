/* eslint-disable react/prop-types */
export const HomeBar = ({ teams, onTeamChange }) => {
  const currentTeams = teams.map(team => (
    <option key={team.id} value={team.id}>
      {team.name}
    </option>
  ));

  return (
    <div className="whole-head">
      <div className="header">
        <h1>Favourite Team :</h1>
        <select
          id="teams"
          name="teams"
          className="select-box"
          defaultValue="" // ensure no pre-selection
          onChange={onTeamChange}
        >
          <option value="" disabled>
            -- Choose a team --
          </option>
          {currentTeams}
        </select>
      </div>
      <nav className="nav header-nav">
        <a href="#">Home</a>
        <a href="#">Sign in</a>
      </nav>
    </div>
  );
};
