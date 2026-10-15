/* eslint-disable react/prop-types */
import '../styles/SeasonTabs.css';

export const SeasonTabs = ({ seasons, selectedSeason, onSeasonChange, disabled = false }) => {
  if (!seasons?.length) return null;

  return (
    <div className="season-tabs" role="tablist" aria-label="Premier League seasons">
      {seasons.map((season) => {
        const isActive = season.season === selectedSeason;
        return (
          <button
            key={season.season}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`season-tab${isActive ? ' is-active' : ''}`}
            disabled={disabled || isActive}
            onClick={() => onSeasonChange(season.season)}
          >
            <span className="season-tab-label">{season.label}</span>
            {season.isCurrent ? <span className="season-tab-badge">Current</span> : null}
          </button>
        );
      })}
    </div>
  );
};
