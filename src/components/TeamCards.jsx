export const TeamCards = ({selectedTeam}) => {
  return (
  <section className="cards">
    {
      selectedTeam ? (
        <>
          <img src={selectedTeam.crest} alt="Crest of the team"/>
          <h2>{selectedTeam.shortName}</h2>
          <p>{selectedTeam.coach.name}</p>
        </>
      )  : (
          <h2>No team selected</h2>
      )
    }
  </section>
  );
}