export const QuickLinks = ({onLinkClick}) => {
  return (
  <section className="links">
    <button onClick={onLinkClick}>Roster</button>
    <button onClick={onLinkClick}>Standing</button>
    <button onClick={onLinkClick}>News</button>
  </section>
  );
}