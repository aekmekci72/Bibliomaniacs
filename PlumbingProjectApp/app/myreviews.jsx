import { useState } from "react";

export default function MyReviews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const reviews = [
    {
      bookTitle: "The Great Gatsby",
      review: "A beautifully tragic novel.",
      rating: 5,
      status: "Approved",
      createdAt: "2024-11-02",
    },
    {
      bookTitle: "1984",
      review: "Haunting and thought-provoking.",
      rating: 4,
      status: "Pending",
      createdAt: "2024-10-12",
    },
    {
      bookTitle: "Sapiens",
      review: "Insightful and deep!",
      rating: 5,
      status: "Rejected",
      createdAt: "2024-08-21",
    },
  ];

  const statusColor = {
    Approved: "#2b7a4b",
    Pending: "#cc9a06",
    Rejected: "#c0392b",
  };

  const filtered = reviews
    .filter((r) => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchSearch = r.bookTitle.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const exportCSV = () => {
    const headers = ["Book Title", "Review", "Rating", "Status", "Date"];
    const rows = filtered.map(r => [
      r.bookTitle,
      r.review,
      r.rating,
      r.status,
      r.createdAt
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_reviews.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center pb-12 px-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl py-6">
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">
          My Submitted Reviews
        </h1>
        <p className="text-center text-gray-600 mb-6">
          View the status of your submitted reviews
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-gray-400">
            <div className="text-3xl font-bold text-gray-700">{reviews.length}</div>
            <div className="text-sm text-gray-500 font-semibold">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-600">
            <div className="text-3xl font-bold text-green-700">
              {reviews.filter(r => r.status === "Approved").length}
            </div>
            <div className="text-sm text-gray-500 font-semibold">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-600">
            <div className="text-3xl font-bold text-yellow-700">
              {reviews.filter(r => r.status === "Pending").length}
            </div>
            <div className="text-sm text-gray-500 font-semibold">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-red-600">
            <div className="text-3xl font-bold text-red-700">
              {reviews.filter(r => r.status === "Rejected").length}
            </div>
            <div className="text-sm text-gray-500 font-semibold">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center bg-white p-6 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Search by book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-green-200 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-green-200 rounded-lg px-4 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {["All", "Approved", "Pending", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2 rounded-lg font-bold border-2 transition-colors ${
                statusFilter === s
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-green-700 border-green-700 hover:bg-green-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-green-50 border-b-2 border-green-200">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-64">Book</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-96">Review</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-32">Rating</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-32">Status</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-40">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                  <td className="px-4 py-4 font-medium">{r.bookTitle}</td>
                  <td className="px-4 py-4 text-gray-700">{r.review}</td>
                  <td className="px-4 py-4">⭐ {r.rating}</td>
                  <td className="px-4 py-4">
                    <span className="font-bold" style={{ color: statusColor[r.status] }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No reviews match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons at Bottom */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={exportCSV}
            className="bg-green-900 hover:bg-green-950 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-md"
          >
            Export as CSV
          </button>
          <button
            onClick={() => console.log("Add Review pressed")}
            className="bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-md"
          >
            + Add New Review
          </button>
        </div>
      </div>
    </div>
  );
}