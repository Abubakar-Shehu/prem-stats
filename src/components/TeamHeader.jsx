export const TeamHeader = ({selectedTeam}) => {
  return (
  <section className="team-header">
    {
      selectedTeam ? (
        <>
          <img src={selectedTeam.crest} alt="Crest of the team"/>
          <div className="logo">
            <h2>{selectedTeam.name}</h2>
          <aside className="rec-form">
            <p>Record</p>
            <p>Form</p>  
          </aside>
          </div>
        </>
      )  : (
          <h2 className="no-team">No team selected</h2>
      )
    }
  </section>
  );
}