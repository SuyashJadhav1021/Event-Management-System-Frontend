import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventById, registerForEvent, cancelRegistration, getAttendees, deleteEvent } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/UI';
import { Calendar, MapPin, Users, Tag, ArrowLeft, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const categoryColors = {
  conference: 'bg-blue-100 text-blue-700',
  workshop: 'bg-green-100 text-green-700',
  meetup: 'bg-yellow-100 text-yellow-700',
  webinar: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEventById(id);
        setEvent(res.data.event);
        // Check if current user is registered
        if (isAdmin) {
          const attRes = await getAttendees(id);
          setAttendees(attRes.data.attendees);
          setIsRegistered(attRes.data.attendees.some((a) => a.user._id === user?._id));
        }
      } catch {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isAdmin, navigate, user]);

  const handleRegister = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      await registerForEvent(id);
      toast.success('Registered successfully!');
      setIsRegistered(true);
      setEvent((prev) => ({ ...prev, registrationCount: (prev.registrationCount || 0) + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelRegistration(id);
      toast.success('Registration cancelled');
      setIsRegistered(false);
      setEvent((prev) => ({ ...prev, registrationCount: Math.max((prev.registrationCount || 1) - 1, 0) }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const loadAttendees = async () => {
    const res = await getAttendees(id);
    setAttendees(res.data.attendees);
    setShowAttendees(true);
  };

  if (loading) return <PageLoader />;
  if (!event) return null;

  const isPast = new Date(event.date) < new Date();
  const isFull = (event.registrationCount || 0) >= event.capacity;
  const spotsLeft = event.capacity - (event.registrationCount || 0);
  const fillPercent = Math.min(((event.registrationCount || 0) / event.capacity) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="card overflow-visible">
        {/* Top accent */}
        <div className={`h-2 ${isPast ? 'bg-gray-300' : 'bg-indigo-500'}`} />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`badge ${categoryColors[event.category] || categoryColors.other}`}>
                  <Tag size={11} className="mr-1" />{event.category}
                </span>
                {isPast && <span className="badge bg-gray-100 text-gray-500">Past Event</span>}
                {!isPast && isFull && <span className="badge bg-red-100 text-red-600">Fully Booked</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/admin/events/edit/${event._id}`} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
                  <Edit size={14} /> Edit
                </Link>
                <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5 text-sm py-1.5">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(event.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm font-semibold text-gray-800">{event.location}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <Users size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Capacity</p>
                <p className="text-sm font-semibold text-gray-800">{event.registrationCount || 0} / {event.capacity}</p>
                <p className="text-xs text-gray-500">{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}</p>
              </div>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-indigo-500'}`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Register / Cancel button (non-admin users) */}
          {!isAdmin && (
            <div className="border-t border-gray-100 pt-6">
              {isPast ? (
                <p className="text-gray-500 text-sm">This event has already taken place.</p>
              ) : isRegistered ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <UserCheck size={18} /> You're registered for this event
                  </div>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="btn-secondary flex items-center gap-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <UserX size={15} /> Cancel Registration
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={actionLoading || isFull}
                  className="btn-primary px-8 py-2.5 disabled:opacity-50"
                >
                  {actionLoading ? 'Registering...' : isFull ? 'Event Full' : 'Register for Event'}
                </button>
              )}
              {!isLoggedIn && (
                <p className="text-sm text-gray-500 mt-3">
                  <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link> to register for this event
                </p>
              )}
            </div>
          )}

          {/* Attendees (admin only) */}
          {isAdmin && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attendees ({event.registrationCount || 0})
                </h2>
                {!showAttendees && (
                  <button onClick={loadAttendees} className="btn-secondary text-sm py-1.5">
                    View All
                  </button>
                )}
              </div>
              {showAttendees && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendees.length === 0 ? (
                    <p className="text-gray-500 text-sm">No registrations yet.</p>
                  ) : attendees.map((a) => (
                    <div key={a._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{a.user.name}</p>
                        <p className="text-xs text-gray-500">{a.user.email}</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(a.registeredAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
