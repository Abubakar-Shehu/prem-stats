export const FixtureList = () => {
  return (
    <table className="table fixture-table">
      <thead>
        <tr>
          <th className="fixture-date">Date</th>
          <th className="fixture-opp">Opponent</th>
          <th className="fixture-loc">Home / Away</th>
          <th className="fixture-comp">Competition</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>10-Aug</td>
          <td>Arsenal</td>
          <td>Home</td>
          <td>Prem</td>
        </tr>
      </tbody>
    </table>
  );
}