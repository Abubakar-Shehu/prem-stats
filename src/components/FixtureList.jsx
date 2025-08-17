export const FixtureList = () => {
  return (
    <div className="fixture-table">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Home / Away</th>
            <th>Competition</th>
          </tr>
        </thead>
        <tbody>
          <tr className="table-data">
            <td>10-Aug</td>
            <td>Arsenal</td>
            <td>Home</td>
            <td>Prem</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}