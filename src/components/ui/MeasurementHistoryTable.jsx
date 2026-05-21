import {
  formatDate,
  formatNumber,
  translateRole,
} from "../../lib/formatters";
import { StatusPill } from "./StatusPill";

export function MeasurementHistoryTable({ measurements, emptyText }) {
  if (!measurements?.length) {
    return (
      <div className="empty-state compact">
        <h3>Henuz kayit yok</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Boy</th>
            <th>Kilo</th>
            <th>Dirsek</th>
            <th>Bilek</th>
            <th>Frame Index</th>
            <th>Z-Score</th>
            <th>Kategori</th>
            <th>Kaydeden</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((measurement) => (
            <tr key={measurement.id}>
              <td>{formatDate(measurement.measurementDate)}</td>
              <td>{formatNumber(measurement.height, 1)} cm</td>
              <td>{formatNumber(measurement.weight, 1)} kg</td>
              <td>{formatNumber(measurement.elbowWidth, 1)} cm</td>
              <td>{formatNumber(measurement.wristWidth, 1)} cm</td>
              <td>{formatNumber(measurement.frameIndex)}</td>
              <td>{formatNumber(measurement.zScore)}</td>
              <td>
                <StatusPill value={measurement.frameCategory} />
              </td>
              <td>
                {translateRole(measurement.recordedByRole)}
                {measurement.recordedByName
                  ? ` / ${measurement.recordedByName}`
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
