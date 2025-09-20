/* eslint-disable react/prop-types */
import '../styles/TableStanding.css';

export const TableStanding = ({table}) => {

  const currentTable = table.map(place => {
    return (
    <tbody key={place.team.id}>
        <tr className="table-data">
          <td>{place.position}</td>
          <td>{place.team.shortName}</td>
          <td>{place.points}</td>
        </tr>
      </tbody>)
  });

  return (
  <>
    <table className="table">
      <thead>
        <tr>
          <th>Position</th>
          <th>Team</th>
          <th>Points</th>
        </tr>
      </thead>
      {currentTable}
    </table>
  </>
  );
}