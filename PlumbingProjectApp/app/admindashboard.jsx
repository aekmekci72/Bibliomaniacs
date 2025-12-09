import { useState } from "react";
import { Users, Book, FileText, Plus, X, Calendar, ExternalLink } from "lucide-react";
import { ScrollView } from "react-native";

export default function AdminDashboard() {
  const [admins, setAdmins] = useState([
    { id: 1, email: "admin@bookclub.com" },
    { id: 2, email: "manager@bookclub.com" },
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const [bookOfWeek, setBookOfWeek] = useState({
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    lastUpdated: "2024-11-15",
  });
  const [showUpdateBook, setShowUpdateBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");

  const reviewStats = {
    approved: 45,
    pending: 12,
    rejected: 8,
  };

  const totalReviews = reviewStats.approved + reviewStats.pending + reviewStats.rejected;

  const addAdmin = () => {
    if (newAdminEmail && newAdminEmail.includes("@")) {
      setAdmins([...admins, { id: Date.now(), email: newAdminEmail }]);
      setNewAdminEmail("");
      setShowAddAdmin(false);
    }
  };

  const removeAdmin = (id) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  const updateBookOfWeek = () => {
    if (newBookTitle && newBookAuthor) {
      setBookOfWeek({
        title: newBookTitle,
        author: newBookAuthor,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      setNewBookTitle("");
      setNewBookAuthor("");
      setShowUpdateBook(false);
    }
  };

  const getPercentage = (value) => ((value / totalReviews) * 100).toFixed(1);

  return (
    <ScrollView>
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-3 text-center">
          Admin Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-12">Manage your book review platform</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manage Admins Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Manage Admins</h2>
              </div>
              <button
                onClick={() => setShowAddAdmin(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white 
                         font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Admin
              </button>
            </div>

            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                >
                  <span className="text-gray-700 font-medium">{admin.email}</span>
                  <button
                    onClick={() => removeAdmin(admin.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {showAddAdmin && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-emerald-200">
                <input
                  type="email"
                  placeholder="Enter admin email..."
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg mb-3 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addAdmin}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold 
                             py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddAdmin(false);
                      setNewAdminEmail("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold 
                             py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Book of the Week Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <Book className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Book of the Week</h2>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 mb-4 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{bookOfWeek.title}</h3>
              <p className="text-gray-600 mb-4">by {bookOfWeek.author}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date(bookOfWeek.lastUpdated).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>

            <button
              onClick={() => setShowUpdateBook(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold 
                       py-2 rounded-lg transition-colors"
            >
              Update Book of the Week
            </button>

            {showUpdateBook && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-emerald-200">
                <input
                  type="text"
                  placeholder="Book title..."
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg mb-3 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Author name..."
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg mb-3 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={updateBookOfWeek}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold 
                             py-2 rounded-lg transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateBook(false);
                      setNewBookTitle("");
                      setNewBookAuthor("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold 
                             py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Review Statistics Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Review Statistics</h2>
              </div>
<button
  onClick={() => window.location.href = '/admin-reviews'}
  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 
           font-semibold transition-colors"
>
  Manage Reviews
  <ExternalLink className="w-4 h-4" />
</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Pie Chart */}
              <div className="flex justify-center">
                <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
                  {/* Approved - Green */}
                  <circle
                    cx="140"
                    cy="140"
                    r="100"
                    fill="none"
                    stroke="#2b7a4b"
                    strokeWidth="60"
                    strokeDasharray={`${(reviewStats.approved / totalReviews) * 628} 628`}
                    strokeDashoffset="0"
                  />
                  {/* Pending - Yellow */}
                  <circle
                    cx="140"
                    cy="140"
                    r="100"
                    fill="none"
                    stroke="#cc9a06"
                    strokeWidth="60"
                    strokeDasharray={`${(reviewStats.pending / totalReviews) * 628} 628`}
                    strokeDashoffset={`-${(reviewStats.approved / totalReviews) * 628}`}
                  />
                  {/* Rejected - Red */}
                  <circle
                    cx="140"
                    cy="140"
                    r="100"
                    fill="none"
                    stroke="#c0392b"
                    strokeWidth="60"
                    strokeDasharray={`${(reviewStats.rejected / totalReviews) * 628} 628`}
                    strokeDashoffset={`-${((reviewStats.approved + reviewStats.pending) / totalReviews) * 628}`}
                  />
                  {/* Center white circle */}
                  <circle cx="140" cy="140" r="70" fill="white" />
                  {/* Total count */}
                  <text
                    x="140"
                    y="140"
                    textAnchor="middle"
                    dy=".3em"
                    className="text-4xl font-bold"
                    fill="#1f2937"
                    transform="rotate(90 140 140)"
                  >
                    {totalReviews}
                  </text>
                  <text
                    x="140"
                    y="165"
                    textAnchor="middle"
                    className="text-sm"
                    fill="#6b7280"
                    transform="rotate(90 140 165)"
                  >
                    Total
                  </text>
                </svg>
              </div>

              {/* Legend and Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-700 rounded"></div>
                    <span className="font-semibold text-gray-800">Approved</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{reviewStats.approved}</div>
                    <div className="text-sm text-gray-600">{getPercentage(reviewStats.approved)}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span className="font-semibold text-gray-800">Pending</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{reviewStats.pending}</div>
                    <div className="text-sm text-gray-600">{getPercentage(reviewStats.pending)}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="font-semibold text-gray-800">Rejected</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{reviewStats.rejected}</div>
                    <div className="text-sm text-gray-600">{getPercentage(reviewStats.rejected)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ScrollView>
  );
}