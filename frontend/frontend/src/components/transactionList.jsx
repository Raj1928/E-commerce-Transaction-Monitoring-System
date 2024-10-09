import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryTable from "./summaryBox";
import PriceRangeBarChart from "./barChart";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState("March"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/transactions", {
        params: {
          month,
          search: searchTerm,
          page,
          perPage
        }
      });

      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, searchTerm, page]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); 
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setPage(1); 
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div>
      <h1>Transaction List</h1>

      <label htmlFor="month">Select Month: </label>
      <select id="month" value={month} onChange={handleMonthChange}>
        {months.map((monthOption) => (
          <option key={monthOption} value={monthOption}>
            {monthOption}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search transactions"
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginLeft: "10px" }}
      />

      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>${transaction.price.toFixed(2)}</td>
                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                <td>{transaction.sold ? "Yes" : "No"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No transactions found for the selected month.</td>
            </tr>
          )}
        </tbody>
      </table>

      <SummaryTable transactions={transactions} monthName={month}/>
      <PriceRangeBarChart monthName={month} style={{ margin: "20px" }} />

      <div style={{ marginTop: "80px" }}>
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span style={{ marginLeft: "10px", marginRight: "10px" }}>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
