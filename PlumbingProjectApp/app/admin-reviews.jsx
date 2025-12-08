import { useState } from "react";

export default function AdminReviews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [confirmModal, setConfirmModal] = useState({ show: false, reviewId: null, action: null });

  const [reviews, setReviews] = useState([
    {
      id: 1,
      bookTitle: "The Great Gatsby",
      reviewerName: "Alice Johnson",
      review: "A beautifully tragic novel that captures the essence of the American Dream.",
      rating: 5,
      status: "Approved",
      submittedAt: "2024-11-02",
    },
    {
      id: 2,
      bookTitle: "1984",
      reviewerName: "Bob Smith",
      review: "Haunting and thought-provoking dystopian masterpiece.",
      rating: 4,
      status: "Pending",
      submittedAt: "2024-10-12",
    },
    {
      id: 3,
      bookTitle: "Sapiens",
      reviewerName: "Charlie Davis",
      review: "Insightful and deep exploration of human history!",
      rating: 5,
      status: "Rejected",
      submittedAt: "2024-08-21",
    },
  ]);

  const statusColor = {
    Approved: "#2b7a4b",
    Pending: "#cc9a06",
    Rejected: "#c0392b",
  };

  const filtered = reviews.filter((r) => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchSearch =
      r.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewerName.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !fromDate || new Date(r.submittedAt) >= new Date(fromDate);
    const matchTo = !toDate || new Date(r.submittedAt) <= new Date(toDate);
    return matchStatus && matchSearch && matchFrom && matchTo;
  });

  const handleActionClick = (id, newStatus) => {
    const review = reviews.find(r => r.id === id);
    if (review.status === newStatus) return;
    
    setConfirmModal({ show: true, reviewId: id, action: newStatus });
  };

  const confirmAction = () => {
    const { reviewId, action } = confirmModal;
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: action } : r))
    );
    setConfirmModal({ show: false, reviewId: null, action: null });
  };

  const exportCSV = () => {
    const headers = ["Book Title", "Reviewer Name", "Review", "Rating", "Status", "Submitted Date"];
    const rows = filtered.map(r => [
      r.bookTitle,
      r.reviewerName,
      r.review,
      r.rating,
      r.status,
      r.submittedAt
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_reviews.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center pb-12 px-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl py-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Submitted Reviews
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center bg-white p-6 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Search by book or reviewer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-green-200 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
            className="border border-green-200 rounded-lg px-4 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
            className="border border-green-200 rounded-lg px-4 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

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
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-48">Book Title</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-40">Reviewer Name</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-80">Review</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-24">Rating</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-28">Status</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-32">Submitted</th>
                <th className="px-4 py-4 text-left font-bold text-gray-700 w-96">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-gray-800">{r.bookTitle}</td>
                  <td className="px-4 py-4 text-gray-700">{r.reviewerName}</td>
                  <td className="px-4 py-4 text-gray-600 text-sm">{r.review}</td>
                  <td className="px-4 py-4">
                    <span className="text-green-700 font-bold">★ {r.rating}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold" style={{ color: statusColor[r.status] }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm">{r.submittedAt}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActionClick(r.id, "Approved")}
                        className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleActionClick(r.id, "Rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleActionClick(r.id, "Pending")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Set Pending
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    No reviews match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Export CSV Button at Bottom */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={exportCSV}
            className="bg-green-900 hover:bg-green-950 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-md"
          >
            Export as CSV
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">
              Confirm Action
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to change this review's status to{" "}
              <span className="font-bold" style={{ color: statusColor[confirmModal.action] }}>
                {confirmModal.action}
              </span>
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ show: false, reviewId: null, action: null })}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="text-white font-bold py-2 px-6 rounded-lg transition-colors"
                style={{ backgroundColor: statusColor[confirmModal.action] }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}