import { useState, useEffect } from "react";
import { RequireAccess } from "../components/requireaccess";
import { getAuth } from "firebase/auth";
import { SendNotif } from "./_layout";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

export default function AdminReviews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("date_received");
  const [sortOrder, setSortOrder] = useState("desc");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, reviewId: null, action: null });
  const [stats, setStats] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/clear_cache', { method: 'POST' });
    fetchReviews();
    fetchStats();
  }, [statusFilter, gradeFilter, schoolFilter, sortBy, sortOrder]);

  const getIdToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    return await user.getIdToken(true);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter.toLowerCase());
      if (gradeFilter !== "All") params.append("grade", gradeFilter);
      if (schoolFilter !== "All") params.append("school", schoolFilter);
      if (search) params.append("search", search);
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      const response = await fetch(`http://localhost:5001/get_reviews?${params}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5001/get_review_stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const clearCacheAndRefresh = async () => {
    try {
      await fetch('http://localhost:5001/clear_cache', { method: 'POST' });
      await fetchReviews();
      await fetchStats();
    } catch (err) {
      console.error(err);
      fetchReviews();
      fetchStats();
    }
  };

  const statusColor = {
    Approved: "#2b7a4b",
    Pending: "#cc9a06",
    Rejected: "#c0392b",
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.book_title?.toLowerCase().includes(search.toLowerCase()) ||
      r.author?.toLowerCase().includes(search.toLowerCase()) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !fromDate || new Date(r.date_received) >= new Date(fromDate);
    const matchTo = !toDate || new Date(r.date_received) <= new Date(toDate);
    return matchSearch && matchFrom && matchTo;
  });

  const handleActionClick = (review, newStatus) => {
    const currentStatus = review.approved ? "Approved" : (review.date_processed ? "Rejected" : "Pending");
    if (currentStatus === newStatus) {
      return;
    }
    
    setConfirmModal({ show: true, reviewId: review.id, action: newStatus, review });
  };

  const confirmAction = async () => {
    const { reviewId, action } = confirmModal;
    setUpdating(reviewId);
    
    try {
      const idToken = await getIdToken();
      const approved = action === "Approved";
      
      const updateData = {
        idToken,
        approved,
      };

      // Only set date_processed if approving or rejecting (not for pending)
      if (action !== "Pending") {
        updateData.date_processed = new Date().toISOString();
      }

      const response = await fetch(`http://localhost:5001/update_review/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        try {
          const review = confirmModal.review;
          const reviewerEmail = review.email;
          const bookTitle = review.book_title;
          const newStatusLower = action.toLowerCase();
      
          // 1. Get admin sender info
          const auth = getAuth();
          const adminUser = auth.currentUser;
      
          // These will work if you store names on the user document OR displayName:
          const senderFirstName =
            adminUser?.first_name ||
            adminUser?.displayName?.split(" ")[0] ||
            "";
          const senderLastName =
            adminUser?.last_name ||
            (adminUser?.displayName?.includes(" ")
              ? adminUser.displayName.split(" ").slice(1).join(" ")
              : "");
      
          // 2. Backend request to look up UID by email
          const resRecipient = await fetch("http://localhost:5001/get_uid_by_email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: reviewerEmail }),
          });
      
          const recipientData = await resRecipient.json();

          if (!resRecipient.ok) {
            console.error("get_uid_by_email failed:", recipientData);
            return; // or just skip sending notif
          }

          const recipientUid = recipientData.uid;

          if (!recipientUid) {
            console.error("No recipient uid returned for email:", reviewerEmail);
            return;
          }
      
          // 3. Send the notification
          await SendNotif("review_status", `${senderFirstName} ${senderLastName}`, [recipientUid], bookTitle, newStatusLower);
        } catch (notifErr) {
          console.error("Failed to send notification:", notifErr);
        }
        // Clear cache and refresh data
        await clearCacheAndRefresh();
      } else {
        const error = await response.json();
      }
    } catch (error) {
      console.error("Failed to update review:", error);
    } finally {
      setUpdating(null);
      setConfirmModal({ show: false, reviewId: null, action: null, review: null });
    }
  };

  const exportCSV = () => {
    const headers = [
      "Entry ID", "Date Received", "Date Processed", "First Name", "Last Name",
      "Grade", "School", "Email", "Phone", "Book Title", "Author", 
      "Recommended Grade", "Rating", "Review", "Anonymous", "Approved",
      "Time Earned", "Call Number", "Notes"
    ];
    
    const rows = filtered.map(r => [
      r.entry_id, r.date_received, r.date_processed, r.first_name, r.last_name,
      r.grade, r.school, r.email, r.phone_number, r.book_title, r.author, r.rating, r.review, r.anonymous,
      r.approved ? "Yes" : "No", r.call_number, r.notes_to_admin
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell || ""}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviews_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const viewDetails = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const uniqueGrades = ["All", ...new Set(reviews.map(r => r.grade).filter(Boolean))].sort();
  const uniqueSchools = ["All", ...new Set(reviews.map(r => r.school).filter(Boolean))].sort();
  
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid); // change to user.email if that's your doc id
        const snap = await getDoc(userRef);

        if (!snap.exists()) return;

        const data = snap.data() || {};
        const current = Array.isArray(data.notifications) ? data.notifications : [];

        const filtered = current.filter((n) => n?.type !== "new_review");

        if (filtered.length !== current.length) {
          await updateDoc(userRef, { notifications: filtered });
        }
      } catch (err) {
        console.error("Failed clearing new_review notifications:", err);
      }
    });

    return unsubscribe;
    }, []);

  return (
    <RequireAccess
      allowRoles={["admin"]}
      redirectTo="/notfound"
    >
    <div className="flex flex-col items-center pb-12 px-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-[1600px] py-6">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            Manage Submitted Reviews
          </h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
              <div className="text-2xl font-bold text-gray-700">{stats.total_reviews}</div>
              <div className="text-xs text-gray-500 font-semibold">Total Reviews</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
              <div className="text-2xl font-bold text-green-700">{stats.approved_reviews}</div>
              <div className="text-xs text-gray-500 font-semibold">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-600">
              <div className="text-2xl font-bold text-yellow-700">{stats.pending_reviews}</div>
              <div className="text-xs text-gray-500 font-semibold">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
              <div className="text-2xl font-bold text-blue-700">{stats.total_volunteer_hours}</div>
              <div className="text-xs text-gray-500 font-semibold">Volunteer Hours</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center bg-white p-6 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Search books, authors, reviewers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchReviews()}
            className="border border-green-200 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-green-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-green-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading reviews...</div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="bg-green-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Date</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Reviewer</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Grade</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Book Title</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Author</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Rating</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Status</th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const status = r.approved ? "Approved" : (r.date_processed ? "Rejected" : "Pending");
                  const isUpdating = updating === r.id;
                  
                  return (
                    <tr key={r.id} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {new Date(r.date_received).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-800">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">{r.grade}</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">{r.book_title}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{r.author}</td>
                      <td className="px-3 py-3 text-sm">
                        <span className="text-green-700 font-bold">★ {Number(r.rating).toFixed(1)}</span>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <span className="font-bold" style={{ color: statusColor[status] }}>
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {isUpdating ? (
                          <div className="text-gray-500 text-sm">Updating...</div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewDetails(r)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleActionClick(r, "Approved")}
                              disabled={status === "Approved"}
                              className={`font-bold py-1 px-3 rounded text-xs transition-colors ${
                                status === "Approved"
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-green-700 hover:bg-green-800 text-white"
                              }`}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleActionClick(r, "Rejected")}
                              disabled={status === "Rejected"}
                              className={`font-bold py-1 px-3 rounded text-xs transition-colors ${
                                status === "Rejected"
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              ✗
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-500">
                      No reviews match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={exportCSV}
            className="bg-green-900 hover:bg-green-950 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-md"
          >
            Export Full Database as CSV
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Review Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Entry ID</p>
                <p className="text-gray-800">{selectedReview.entry_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Date Received</p>
                <p className="text-gray-800">{new Date(selectedReview.date_received).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Reviewer</p>
                <p className="text-gray-800">{selectedReview.first_name} {selectedReview.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Grade</p>
                <p className="text-gray-800">{selectedReview.grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">School</p>
                <p className="text-gray-800">{selectedReview.school}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Email</p>
                <p className="text-gray-800 text-sm">{selectedReview.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Phone</p>
                <p className="text-gray-800">{selectedReview.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Anonymous</p>
                <p className="text-gray-800">{selectedReview.anonymous}</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Book Information</h3>
              <p className="text-sm text-gray-500 font-semibold">Title</p>
              <p className="text-gray-800 mb-2">{selectedReview.book_title}</p>
              <p className="text-sm text-gray-500 font-semibold">Author</p>
              <p className="text-gray-800 mb-2">{selectedReview.author}</p>
              <p className="text-sm text-gray-500 font-semibold">Rating</p>
              <p className="text-gray-800 mb-2">★ {Number(selectedReview.rating).toFixed(1)} / 5</p>
              <p className="text-sm text-gray-500 font-semibold">Recommended Grade</p>
              <p className="text-gray-800">{selectedReview.recommended_audience_grade || "N/A"}</p>
            </div>

            <div className="border-t pt-4 mb-4">
              <p className="text-sm text-gray-500 font-semibold mb-2">Review</p>
              <p className="text-gray-800 bg-gray-50 p-3 rounded whitespace-pre-line">{selectedReview.review}</p>
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Admin Fields</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 font-semibold">Call Number</p>
                  <p className="text-gray-800">{selectedReview.call_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Time Earned</p>
                  <p className="text-gray-800">{0.5} hrs</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Label Created</p>
                  <p className="text-gray-800">{selectedReview.label_created ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">On Volgistics</p>
                  <p className="text-gray-800">{selectedReview.on_volgistics ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Confirm Action</h2>
            <p className="text-gray-600 mb-2">
              Book: <span className="font-semibold">{confirmModal.review?.book_title}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Change status to{" "}
              <span className="font-bold" style={{ color: statusColor[confirmModal.action] }}>
                {confirmModal.action}
              </span>
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ show: false, reviewId: null, action: null, review: null })}
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
    </RequireAccess>
  );
}