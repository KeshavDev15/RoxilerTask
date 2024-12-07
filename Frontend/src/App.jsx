import { useState, useEffect } from "react";
import axios from "axios";
import TransactionTable from "./components/TransactionTable";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("March");
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/combined-stats?month=${month}`
        )
        const transactionn = await axios.get(`http://localhost:3000/transactions?page=${page}`)
        //console.log(transactionn.data.transactions)
        setTransactions(transactionn.data.transactions);
        setTotalTransactions(transactionn.data.totalRecords);
        setStatistics(response.data.statistics);
        setBarChartData(response.data.barChart.data);
        //console.log(response.data.statistics)
        setPieChartData(response.data.pieChart.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="">
        
        <div className="flex space-x-4 mb-6 justify-between translate-y-20">
          <div className="">
            <input
              type="text"
              className="text-center mt-1 w-full border-gray-300 bg-yellow-200 rounded-full shadow-sm px-4 py-2 translate-y-28"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction"
            />
          </div>
          <div class="flex items-center justify-center">
            <h1 class="bg-white -translate-y-24 text-center rounded-full w-64 h-64 flex items-center justify-center text-xl font-bold">
              Transaction<br />Dashboard
            </h1>
          </div>
          {/* <h1 className="flex text-2xl font-medium px-4 py-4  -translate-y-20 bg-white text-center rounded-full">Transaction <br/> Dashboard</h1> */}
          <div className="flex ">
            <select
              className=" border-gray-100 bg-yellow-500 rounded-sm shadow-sm h-10 w-32 translate-y-28"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Select Month"
            >
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
            </select>
          </div>
        </div>
      </div>
      <TransactionTable
        transactions={transactions}
        search={search}
        page={page}
        setPage={setPage}
        total={totalTransactions}
      />


      <div className="p-5">
        <h1 className="text-lg font-bold m-4">Statistics - {month}</h1>
        <div className="bg-yellow-200 rounded-2xl shadow-lg p-4 max-w-md">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">Total Sale Amount</h2>
            <p className="text-lg font-bold">₹{statistics.totalSales}</p>
          </div>
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Total Sold Items</h2>
            <p className="text-xl font-bold">{statistics.soldItems}</p>
          </div>
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Total Not Sold Items</h2>
            <p className="text-xl font-bold">{statistics.unsoldItems}</p>
          </div>
        </div>
      </div>
  
      <div className="flex justify-between mt-10">
        <BarChart data={barChartData} />
        <PieChart data={pieChartData} />
      </div>
    </div>
  );
}

export default App;
