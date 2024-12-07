import React from "react";

const TransactionTable = ({ transactions, search, page, setPage, total }) => {
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.price.toString().includes(search) ||
      transaction.category.toLowerCase().includes(search.toLowerCase())
    );
  });

const totalPages = Math.ceil(total / 10);

  return (
    <div>    

<table className="min-w-full border-collapse bg-yellow-200 border border-black">
  <thead className="bg-yellow-200 border-b border-black">
    <tr>
      <th className="px-4 py-2 border-r border-black">Title</th>
      <th className="px-4 py-2 border-r border-black">ID</th>
      <th className="px-4 py-2 border-r border-black">Description</th>
      <th className="px-4 py-2 border-r border-black">Price</th>
      <th className="px-4 py-2 border-r border-black">Category</th>
      <th className="px-4 py-2 border-r border-black">Sold</th>
      <th className="px-4 py-2">Image</th>
    </tr>
  </thead>
  <tbody>
    {filteredTransactions.map((transaction) => (
      <tr key={transaction.id} className="border-b border-black">
        <td className="px-4 py-2 border-r border-black">{transaction.title}</td>
        <td className="px-4 py-2 border-r border-black">{transaction.id}</td>
        <td className="px-4 py-2 border-r border-black">{transaction.description}</td>
        <td className="px-4 py-2 border-r border-black">{transaction.price}</td>
        <td className="px-4 py-2 border-r border-black">{transaction.category}</td>
        <td className="px-4 py-2 border-r border-black">{transaction.sold ? "Yes" : "No"}</td>
        <td className="px-4 py-2">
          <img src={transaction.image} alt={transaction.title} width="50" />
        </td>
      </tr>
    ))}
  </tbody>
</table>

<div className=" space-x-4 mt-4 flex justify-between">
<span className="text-gray-700 font-semibold">Page No : {page}</span>
      <div className="flex justify-center items-center space-x-4 ">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className={`px-4 py-2 rounded ${
            page <= 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 text-white"
          }`}
        >
          Prev
        </button>
        
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className={`px-4 py-2 rounded ${
            page * 10 >= total
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800 text-white"
          }`}
        >
          Next
        </button>
      </div>
      <span className="text-gray-700 font-semibold">Per Page : 10</span> 
    </div>
    </div>
  );
};

export default TransactionTable;
