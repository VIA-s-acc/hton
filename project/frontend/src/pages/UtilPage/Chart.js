import React from "react";

const Chart = ({ data }) => {
  return (
    <div className="chart-container">
      <h4>Circular Chart</h4>
      {/* Используйте библиотеку вроде Chart.js для графика */}
      <div className="chart-placeholder">Chart Placeholder</div>
      <div className="date-filters">
        <label>
          Start Date:
          <input type="date" />
        </label>
        <label>
          End Date:
          <input type="date" />
        </label>
      </div>
    </div>
  );
};

export default Chart;
