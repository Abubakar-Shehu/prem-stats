/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/HomeBar.css';

export const HomeBar = ({ teams, onTeamChange, isDarkMode, toggleTheme }) => {
  const { user, signOut } = useAuth();
  
  const currentTeams = teams.map(team => (
    <option key={team.id} value={team.id}>
      {team.name}
    </option>
  ));

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
        <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <span className="user-welcome">
              Welcome, {user.user_metadata?.username || user.email}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/signin">Sign in</Link>
        )}
      </nav>
    </div>
  );
};
