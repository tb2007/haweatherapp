import { useState, useEffect } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { useTimelapseStatus } from '../../hooks/useTimelapseStatus';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const TIMELAPSE_CAMERA_ID = 'camera'; // SnowCam only

function timeAgo(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 min ago';
  return `${minutes} min ago`;
}

function TimelapsePlayer() {
  const { data } = useTimelapseStatus();
  const [hours, setHours] = useState<6 | 12 | 24>(6);

  const windows = data ?? [];
  const active = windows.find((w) => w.hours === hours);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {([6, 12, 24] as const).map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              hours === h ? 'bg-sky-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            {h}h
          </button>
        ))}
      </div>

      {active?.available ? (
        <div>
          <video
            key={`${hours}-${active.updatedAt}`}
            src={`/timelapse/snowcam-${hours}h.mp4?v=${active.updatedAt}`}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-lg bg-black"
          />
          {active.updatedAt && (
            <p className="mt-2 text-xs text-slate-400">Updated {timeAgo(active.updatedAt)}</p>
          )}
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-black text-slate-500">
          <span className="text-5xl">🎬</span>
          <span className="text-sm font-medium">First timelapse is still building</span>
          <span className="text-xs">Check back in ~15 min</span>
        </div>
      )}
    </div>
  );
}

function Go2rtcPlayer({ streamName }: { streamName: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [streamKey, setStreamKey] = useState(() => Date.now());

  // iOS Safari kills the MJPEG connection when the browser is backgrounded.
  // When the user returns, force a fresh connection by resetting the src.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setLoaded(false);
        setError(false);
        setStreamKey(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {/* Live badge */}
      {loaded && !error && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          LIVE
        </div>
      )}

      {/* Loading state */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
          <LoadingSpinner size="lg" />
          <span className="text-xs">Connecting to camera…</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
          <span className="text-5xl">📷</span>
          <span className="text-sm font-medium">Camera unavailable</span>
        </div>
      )}

      <img
        src={`/go2rtc/api/stream.mjpeg?src=${streamName}&t=${streamKey}`}
        alt="Live Camera"
        className={`h-full w-full object-contain transition-opacity duration-500 ${loaded && !error ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(false); setError(true); }}
      />
    </div>
  );
}

function YouTubeEmbed({ url }: { url: string }) {
  const id = url.includes('watch?v=')
    ? url.split('watch?v=')[1].split('&')[0]
    : url.includes('youtu.be/')
    ? url.split('youtu.be/')[1]
    : url;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1`}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  );
}

function MjpegPlayer({ url }: { url: string }) {
  return <img src={url} alt="Webcam" className="w-full rounded-lg" />;
}

export function WebcamPanel() {
  const { data, isLoading } = useWebcam();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<'live' | 'timelapse'>('live');

  const cameras = data ?? [];
  const active = cameras.find((c) => c.id === activeId) ?? cameras[0];

  useEffect(() => {
    if (cameras.length && !cameras.some((c) => c.id === activeId)) {
      setActiveId(cameras[0].id);
    }
  }, [cameras, activeId]);

  // Timelapse mode only applies to SnowCam; drop back to live if the user switches cameras
  useEffect(() => {
    if (active?.id !== TIMELAPSE_CAMERA_ID) setMode('live');
  }, [active?.id]);

  if (isLoading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (!cameras.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Live Camera
      </h2>
      <div className="rounded-xl bg-slate-700 p-4 shadow">
        {cameras.length > 1 && (
          <div className="mb-3 flex gap-2">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveId(cam.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active?.id === cam.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {cam.name}
              </button>
            ))}
          </div>
        )}
        {active?.id === TIMELAPSE_CAMERA_ID && (
          <div className="mb-3 flex gap-2">
            {(['live', 'timelapse'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-sky-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {active && mode === 'timelapse' && active.id === TIMELAPSE_CAMERA_ID && <TimelapsePlayer />}

        {active && (mode === 'live' || active.id !== TIMELAPSE_CAMERA_ID) && (
          <>
            {active.type === 'hls' && <Go2rtcPlayer key={active.id} streamName={active.url} />}
            {active.type === 'youtube' && <YouTubeEmbed key={active.id} url={active.url} />}
            {active.type === 'mjpeg' && <MjpegPlayer key={active.id} url={active.url} />}
          </>
        )}
      </div>
    </section>
  );
}
