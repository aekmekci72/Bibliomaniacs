import React, { useState } from "react";
import { Search, Star, Calendar, TrendingUp, TrendingDown, Filter, X, ArrowLeft } from "lucide-react";

export default function AllReviews() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);

  const reviews = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      rating: 5,
      review: "A beautifully tragic novel that captures the essence of the American Dream and its inevitable demise. The prose is poetic and the characters are unforgettable.",
      fullReview: "F. Scott Fitzgerald's masterpiece continues to resonate nearly a century after its publication. The story of Jay Gatsby's doomed pursuit of Daisy Buchanan is both a tragic love story and a searing critique of the American Dream. Fitzgerald's prose is nothing short of poetic, with descriptions that shimmer with beauty and melancholy. The green light at the end of Daisy's dock has become one of the most iconic symbols in American literature, representing the unreachable dreams we all chase. Nick Carraway serves as the perfect narrator - involved yet detached, allowing us to witness the decadence and destruction of the Jazz Age. The novel's themes of wealth, class, and the corruption of idealism remain startlingly relevant today. Each re-read reveals new layers of meaning and beauty in Fitzgerald's carefully crafted sentences.",
      cover: "https://placehold.co/400x600/1e293b/white?text=The+Great+Gatsby",
      date: "2024-11-02",
      genre: "Classic Fiction",
      pages: 180,
      readingTime: "3 hours"
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      rating: 4,
      review: "Haunting and thought-provoking dystopian masterpiece. More relevant today than ever before.",
      fullReview: "George Orwell's dystopian vision has only grown more prescient with time. The world of Big Brother, thoughtcrime, and Newspeak feels uncomfortably close to aspects of our modern reality. Winston Smith's struggle for individuality and truth in a totalitarian state is deeply moving and ultimately heartbreaking. Orwell's genius lies in creating a world that feels both impossibly oppressive and disturbingly plausible. The concepts introduced here - doublethink, memory holes, the Two Minutes Hate - have become part of our cultural lexicon for good reason. While the pacing can feel slow at times, particularly in the middle section detailing Goldstein's book, the payoff is worth it. The final third of the novel is devastating and unforgettable. This is essential reading for understanding the dangers of authoritarianism and the fragility of truth.",
      cover: "https://placehold.co/400x600/dc2626/white?text=1984",
      date: "2024-10-12",
      genre: "Dystopian",
      pages: 328,
      readingTime: "6 hours"
    },
    {
      id: 3,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      rating: 5,
      review: "Insightful and deep exploration of human history. Changes the way you think about humanity.",
      fullReview: "Yuval Noah Harari manages to condense 70,000 years of human history into a thoroughly engaging and thought-provoking narrative. His ability to zoom out and see the big patterns in human development is remarkable. The concept of 'imagined realities' - shared myths that allow large groups of humans to cooperate - is brilliantly explored. From the Cognitive Revolution to the Agricultural Revolution to the Scientific Revolution, Harari challenges many assumptions we hold about progress and happiness. His discussions on the role of wheat in domesticating humans (rather than vice versa) and the potential futures facing humanity are fascinating. While some historians have criticized certain generalizations, the book succeeds in making you question fundamental assumptions about human nature and society. It's accessible without being simplistic, and educational without being dry.",
      cover: "https://placehold.co/400x600/059669/white?text=Sapiens",
      date: "2024-08-21",
      genre: "Non-Fiction",
      pages: 443,
      readingTime: "10 hours"
    },
    {
      id: 4,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      rating: 5,
      review: "A timeless tale of justice, morality, and growing up. Scout's perspective is both innocent and wise.",
      fullReview: "Harper Lee's only novel remains a powerful exploration of racial injustice, moral courage, and childhood innocence. Told through the eyes of young Scout Finch, the story of her father Atticus defending a Black man falsely accused of rape in 1930s Alabama is both heartbreaking and hopeful. Lee's genius is in balancing the serious themes with the authentic voice of a child discovering the complexities of the adult world. Atticus Finch stands as one of literature's great moral exemplars, teaching his children (and readers) about empathy, courage, and standing up for what's right even when you know you'll lose. The supporting characters - Boo Radley, Calpurnia, Miss Maudie - are all richly drawn and memorable. The novel's exploration of how prejudice is taught and how it can be challenged remains urgently relevant. Lee's prose is both beautiful and accessible, making this a book that rewards readers of all ages.",
      cover: "https://placehold.co/400x600/7c3aed/white?text=To+Kill+a+Mockingbird",
      date: "2024-09-15",
      genre: "Classic Fiction",
      pages: 324,
      readingTime: "6 hours"
    },
  ];

  // Filter + search logic
  let filtered = reviews.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase())
  );

  if (filter === "Top Rated") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (filter === "Lowest Rated") {
    filtered.sort((a, b) => a.rating - b.rating);
  } else if (filter === "Newest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (filter === "Oldest") {
    filtered.sort((a, b) => new Date(a.date) - b.date);
  }

  const filterOptions = [
    { label: "All", icon: Filter },
    { label: "Top Rated", icon: TrendingUp },
    { label: "Lowest Rated", icon: TrendingDown },
    { label: "Newest", icon: Calendar },
    { label: "Oldest", icon: Calendar },
  ];

  // Expanded Review Modal
  if (selectedReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button
            onClick={() => setSelectedReview(null)}
            className="flex items-center gap-2 mb-8 text-emerald-700 hover:text-emerald-900 
                     font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to all reviews
          </button>

{/* Expanded Review Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
              <h1 className="text-2xl font-bold text-white mb-1">{selectedReview.title}</h1>
              <p className="text-emerald-50 mb-3">by {selectedReview.author}</p>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/90 mb-2">
                <span className="font-semibold">{selectedReview.genre}</span>
                <span>•</span>
                <span>{selectedReview.pages} pages</span>
                <span>•</span>
                <span>{selectedReview.readingTime}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-white">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < selectedReview.rating
                          ? "fill-amber-300 text-amber-300"
                          : "fill-white/30 text-white/30"
                      }`}
                    />
                  ))}
                  <span className="ml-1 font-bold">{selectedReview.rating}/5</span>
                </div>
                
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedReview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            {/* Full Review Content */}
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Review</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedReview.fullReview}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Reviews Grid View
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            All Reviews
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-emerald-200 rounded-2xl 
                       focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100
                       transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {filterOptions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                       transition-all duration-200 transform hover:scale-105
                       ${
                         filter === label
                           ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                           : "bg-white text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400"
                       }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-emerald-700">{filtered.length}</span> {filtered.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReview(r)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl 
                       transition-all duration-300 transform hover:-translate-y-1
                       border border-emerald-100 p-4 text-left cursor-pointer group"
            >
              <div className="space-y-2">
                {/* Title and Author */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">by {r.author}</p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{r.rating}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    {r.genre}
                  </span>
                </div>

                {/* Review Preview */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {r.review}
                </p>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-400 pt-1 border-t border-gray-100">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg max-w-md mx-auto p-10 border-2 border-dashed border-gray-200">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}