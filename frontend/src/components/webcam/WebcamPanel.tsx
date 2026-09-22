import { useState, useEffect } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <LoadingSpinner size="lg" />
          <span className="text-xs">Connecting to camera…</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
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

  const cameras = data ?? [];
  const active = cameras.find((c) => c.id === activeId) ?? cameras[0];

  useEffect(() => {
    if (cameras.length && !cameras.some((c) => c.id === activeId)) {
      setActiveId(cameras[0].id);
    }
  }, [cameras, activeId]);

  if (isLoading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (!cameras.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
        Live Camera
      </h2>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        {cameras.length > 1 && (
          <div className="mb-3 flex gap-2">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveId(cam.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active?.id === cam.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cam.name}
              </button>
            ))}
          </div>
        )}
        {active && (
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
