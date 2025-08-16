export const HomeBar = () => {
  return (
    <>
      <div>
        <h1>Favourite Team :</h1>
        <label htmlFor="teams">Choose a team:</label>
        <select id="teams" name="teams">
          <option value="man-city">Manchester City</option>
        </select>
      </div>
      <nav>
        <a href="">Home</a>
        <a href="">Sign in</a>
      </nav>
    </>
  );
}