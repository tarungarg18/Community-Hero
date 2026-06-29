import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Loader2,
  Upload,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { LocationPicker } from '../components/MapView';
import { useAuth } from '../context/AuthContext';
import { createIssue, uploadIssueImage } from '../lib/issues';
import { analyzeWithAI } from '../lib/api';
import type { GeoLocation, IssuePriority, AICategorization } from '../types';
import { ISSUE_CATEGORIES } from '../lib/constants';

export default function ReportPage() {
  const { user, profile, getIdToken, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Other');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [location, setLocation] = useState<GeoLocation>({ lat: 0, lng: 0, address: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiApplied, setAiApplied] = useState(false);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnalyzedRef = useRef('');

  const applyAI = (result: AICategorization) => {
    setCategory(result.category);
    setPriority(result.priority);
    setTags(result.tags);
    setAiSummary(result.summary);
    if (!title.trim()) setTitle(result.suggestedTitle);
    setAiApplied(true);
  };

  const runAIAnalysis = async (desc: string, currentFiles: File[]) => {
    const key = desc + (currentFiles[0]?.name ?? '');
    if (key === lastAnalyzedRef.current) return;
    if (!desc.trim() && currentFiles.length === 0) return;

    setAiLoading(true);
    setError('');
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      let imageBase64: string | undefined;
      let mimeType: string | undefined;
      if (currentFiles.length > 0) {
        imageBase64 = await fileToBase64(currentFiles[0]);
        mimeType = currentFiles[0].type;
      }

      const result = await analyzeWithAI(token, desc, title, imageBase64, mimeType);
      applyAI(result);
      lastAnalyzedRef.current = key;
    } catch (err) {
      // Silent fail for auto-analysis — user can still submit manually
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-analyze when description changes (debounced)
  useEffect(() => {
    if (description.trim().length < 15) return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      runAIAnalysis(description, files);
    }, 800);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [description]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
    setAiApplied(false);
    lastAnalyzedRef.current = '';
    // Auto-analyze immediately when photo added
    if (selected.length > 0) {
      setTimeout(() => runAIAnalysis(description, selected), 100);
    }
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (location.lat === 0 && location.lng === 0) {
      setError('Please search and select a location.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const url = await uploadIssueImage(file);
        imageUrls.push(url);
      }

      const id = await createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location,
        imageUrls,
        aiSummary,
        tags,
        reporterId: user.uid,
        reporterName: profile.displayName,
      });

      await refreshProfile();
      navigate(`/issues/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="text-slate-500 text-sm mt-0.5">Help your community by reporting local problems</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Photos</h2>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-colors">
            <Upload className="w-7 h-7 text-slate-400 mb-1.5" />
            <span className="text-sm text-slate-500">Click to upload photos</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </label>
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, i) => (
                <img key={src} src={src} alt={`Preview ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          )}
        </div>

        {/* Description + auto-AI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={description}
              onChange={(e) => { setDescription(e.target.value); setAiApplied(false); }}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Describe the issue — e.g. large pothole on Main Street near the school..."
            />
          </div>

          {/* AI status indicator */}
          {aiLoading && (
            <div className="flex items-center gap-2 text-violet-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is analyzing your description...
            </div>
          )}
          {aiApplied && !aiLoading && (
            <div className="flex items-center gap-2 bg-violet-50 text-violet-700 text-sm px-3 py-2.5 rounded-xl">
              <Sparkles className="w-4 h-4 shrink-0" />
              AI filled in category, priority &amp; title automatically
              {aiSummary && <span className="text-violet-500 ml-1">· {aiSummary}</span>}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Short title for the issue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-800">Location</h2>
          </div>
          <LocationPicker location={location} onLocationChange={setLocation} height="240px" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-colors shadow-sm"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {submitting ? 'Submitting...' : 'Submit Report (+10 pts)'}
        </button>
      </form>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
