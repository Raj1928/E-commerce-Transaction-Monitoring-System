import React from 'react';

const SummaryTable = ({ transactions , monthName }) => {
  const totalSales = transactions.reduce((acc, transaction) => 
    acc + (transaction.sold ? transaction.price : 0), 0);
  const totalSold = transactions.filter(transaction => transaction.sold).length;
  const totalNotSold = transactions.length - totalSold;

  return (
    <div>
      <h2>Summary for {monthName} </h2>
      <table border="1" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Total Amount of Sale</th>
            <th>Total Sold Items</th>
            <th>Total Not Sold Items</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${totalSales.toFixed(2)}</td>
            <td>{totalSold}</td>
            <td>{totalNotSold}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
