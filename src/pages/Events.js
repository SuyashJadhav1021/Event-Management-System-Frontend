import { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../api';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import { PageLoader, EmptyState } from '../components/UI';
import { Search, SlidersHorizontal, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['all', 'conference', 'workshop', 'meetup', 'webinar', 'other'];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { isAdmin } = useAuth();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEvents({ page, limit: 9, search, category: category || undefined });
      setEvents(res.data.events);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategory = (cat) => {
    setCategory(cat === 'all' ? '' : cat);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-gray-500 text-sm mt-1">{total} events available</p>
        </div>
        {isAdmin && (
          <Link to="/admin/events/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            + Create Event
          </Link>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search events by title, location..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal size={16} className="text-gray-400 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                (cat === 'all' && !category) || cat === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <PageLoader />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          message={search ? `No results for "${search}"` : 'No events available right now.'}
          action={isAdmin && (
            <Link to="/admin/events/new" className="btn-primary">Create first event</Link>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          <Pagination page={page} pages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Events;
