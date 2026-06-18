import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent, getAttendees } from '../api';
import { PageLoader, EmptyState } from '../components/UI';
import { Calendar, Users, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, totalAttendees: 0 });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEvents({ limit: 100 });
      const all = res.data.events;
      setEvents(all);
      const now = new Date();
      setStats({
        total: all.length,
        upcoming: all.filter((e) => new Date(e.date) >= now).length,
        past: all.filter((e) => new Date(e.date) < now).length,
        totalAttendees: all.reduce((sum, e) => sum + (e.registrationCount || 0), 0),
      });
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <PageLoader />;

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all events and attendees</p>
        </div>
        <Link to="/admin/events/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle size={16} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Calendar} label="Total Events" value={stats.total} color="bg-indigo-500" />
        <StatCard icon={Calendar} label="Upcoming" value={stats.upcoming} color="bg-green-500" />
        <StatCard icon={Calendar} label="Past" value={stats.past} color="bg-gray-400" />
        <StatCard icon={Users} label="Total Attendees" value={stats.totalAttendees} color="bg-amber-500" />
      </div>

      {/* Events table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Events</h2>
        </div>

        {events.length === 0 ? (
          <EmptyState icon={Calendar} title="No events yet" message="Create your first event to get started."
            action={<Link to="/admin/events/new" className="btn-primary">Create Event</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Event</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Location</th>
                  <th className="text-left px-5 py-3">Attendees</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => {
                  const isPast = new Date(event.date) < new Date();
                  const isFull = (event.registrationCount || 0) >= event.capacity;
                  return (
                    <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{event.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{event.category}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-gray-600 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-gray-600 max-w-[150px] truncate">
                        {event.location}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {event.registrationCount || 0}/{event.capacity}
                      </td>
                      <td className="px-5 py-4">
                        {isPast ? (
                          <span className="badge bg-gray-100 text-gray-500">Past</span>
                        ) : isFull ? (
                          <span className="badge bg-red-100 text-red-600">Full</span>
                        ) : (
                          <span className="badge bg-green-100 text-green-700">Open</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/events/${event._id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View">
                            <Eye size={15} />
                          </Link>
                          <Link to={`/admin/events/edit/${event._id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Edit size={15} />
                          </Link>
                          <button onClick={() => handleDelete(event._id, event.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
