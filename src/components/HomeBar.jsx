export const HomeBar = () => {
  return (
    <div className="whole-head">
      <div className="header">
        <h1>Favourite Team :</h1>
        {/* <label htmlFor="teams">Choose a team:</label> */}
        <select id="teams" name="teams" className="select-box">
          <option value="man-city">Manchester City</option>
        </select>
      </div>
      <nav className="nav header-nav">
        <a href="">Home</a>
        <a href="">Sign in</a>
      </nav>
    </div>
  );
}