import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEvent, updateEvent, getEventById } from '../api';
import { PageLoader } from '../components/UI';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['conference', 'workshop', 'meetup', 'webinar', 'other'];

const defaultForm = {
  title: '', description: '', date: '', location: '',
  capacity: '', category: 'other', image: '',
};

const EventForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      getEventById(id)
        .then((res) => {
          const e = res.data.event;
          setForm({
            title: e.title,
            description: e.description,
            date: new Date(e.date).toISOString().slice(0, 16),
            location: e.location,
            capacity: e.capacity,
            category: e.category,
            image: e.image || '',
          });
        })
        .catch(() => { toast.error('Event not found'); navigate('/'); })
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit, navigate]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.title.length > 100) e.title = 'Max 100 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.capacity || form.capacity < 1) e.capacity = 'Capacity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await updateEvent(id, form);
        toast.success('Event updated!');
        navigate(`/events/${id}`);
      } else {
        const res = await createEvent(form);
        toast.success('Event created!');
        navigate(`/events/${res.data.event._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to={isEdit ? `/events/${id}` : '/'} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> {isEdit ? 'Back to Event' : 'Back to Events'}
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className={`input-field ${errors.title ? 'border-red-400' : ''}`} placeholder="e.g. React Summit 2025" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`} placeholder="Describe the event..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Date + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time *</label>
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className={`input-field ${errors.date ? 'border-red-400' : ''}`} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field bg-white">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
              <input name="location" value={form.location} onChange={handleChange} className={`input-field ${errors.location ? 'border-red-400' : ''}`} placeholder="e.g. Mumbai, Maharashtra" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity *</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" className={`input-field ${errors.capacity ? 'border-red-400' : ''}`} placeholder="e.g. 100" />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
            </div>
          </div>

          {/* Image URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input name="image" value={form.image} onChange={handleChange} className="input-field" placeholder="https://..." />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
              <Save size={16} /> {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
            <Link to={isEdit ? `/events/${id}` : '/'} className="btn-secondary px-6 py-2.5">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
