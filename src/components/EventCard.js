import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

const categoryColors = {
  conference: 'bg-blue-100 text-blue-700',
  workshop:   'bg-green-100 text-green-700',
  meetup:     'bg-yellow-100 text-yellow-700',
  webinar:    'bg-purple-100 text-purple-700',
  other:      'bg-gray-100 text-gray-700',
};

const EventCard = ({ event }) => {
  const isPast = new Date(event.date) < new Date();
  const isFull = event.registrationCount >= event.capacity;
  const spotsLeft = event.capacity - (event.registrationCount || 0);

  return (
    <Link to={`/events/${event._id}`} className="card hover:shadow-md transition-shadow duration-200 group block">
      {/* Top color bar by category */}
      <div className={`h-1.5 w-full ${isPast ? 'bg-gray-300' : 'bg-indigo-500'}`} />

      <div className="p-5">
        {/* Category + status badges */}
        <div className="flex items-center justify-between mb-3">
          <span className={`badge ${categoryColors[event.category] || categoryColors.other}`}>
            <Tag size={10} className="mr-1" />
            {event.category}
          </span>
          {isPast && <span className="badge bg-gray-100 text-gray-500">Past</span>}
          {!isPast && isFull && <span className="badge bg-red-100 text-red-600">Full</span>}
          {!isPast && !isFull && spotsLeft <= 5 && (
            <span className="badge bg-amber-100 text-amber-700">{spotsLeft} left</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Meta info */}
        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-indigo-400 shrink-0" />
            <span>{new Date(event.date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-indigo-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-indigo-400 shrink-0" />
            <span>{event.registrationCount || 0} / {event.capacity} registered</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(((event.registrationCount || 0) / event.capacity) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Created by */}
        <p className="mt-3 text-xs text-gray-400">
          By {event.createdBy?.name || 'Admin'}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
