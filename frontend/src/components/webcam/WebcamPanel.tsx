import { useState } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function Go2rtcPlayer({ streamName }: { streamName: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

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
        src={`/go2rtc/api/stream.mjpeg?src=${streamName}`}
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

  if (isLoading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (!data || data.type === 'disabled') return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Live Camera
      </h2>
      <div className="rounded-xl bg-slate-800 p-4 shadow">
        {data.type === 'hls' && <Go2rtcPlayer streamName={data.url} />}
        {data.type === 'youtube' && <YouTubeEmbed url={data.url} />}
        {data.type === 'mjpeg' && <MjpegPlayer url={data.url} />}
      </div>
    </section>
  );
}
