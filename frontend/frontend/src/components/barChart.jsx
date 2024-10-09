import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const PriceRangeBarChart = ({ monthName }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Number of Items",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/items/price-range?month=${monthName}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log("Fetched price data:", data);

        const labels = Object.keys(data);
        const values = Object.values(data);

        setChartData({
          labels,
          datasets: [
            {
              label: "Number of Items",
              data: values,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching price range data:", error);
      }
    };

    if (monthName) {
      fetchPriceData();
    }
  }, [monthName]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <h2>Price Range Distribution for "{monthName}" Month</h2>
      <Bar data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default PriceRangeBarChart;
