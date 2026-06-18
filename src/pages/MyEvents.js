import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents } from '../api';
import { PageLoader, EmptyState } from '../components/UI';
import { Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEvents()
      .then((res) => setRegistrations(res.data.registrations))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const upcoming = registrations.filter((r) => r.event && new Date(r.event.date) >= new Date());
  const past = registrations.filter((r) => r.event && new Date(r.event.date) < new Date());

  const EventRow = ({ reg }) => (
    <Link
      to={`/events/${reg.event._id}`}
      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
          {reg.event.title}
        </h3>
        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(reg.event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {reg.event.location}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Registered on {new Date(reg.registeredAt).toLocaleDateString('en-IN')}
        </p>
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors ml-3 shrink-0" />
    </Link>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <p className="text-gray-500 text-sm mt-1">{registrations.length} total registrations</p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations yet"
          message="You haven't registered for any events. Browse upcoming events to get started."
          action={<Link to="/" className="btn-primary">Browse Events</Link>}
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((r) => <EventRow key={r._id} reg={r} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Past ({past.length})
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((r) => <EventRow key={r._id} reg={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
