import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useWebcam } from '../../hooks/useWebcam';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function HlsPlayer({ url }: { url: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }, [url]);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      controls
      className="w-full rounded-lg"
    />
  );
}

function YouTubeEmbed({ url }: { url: string }) {
  // Accept both full URLs and video IDs
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
  return (
    <img src={url} alt="Webcam" className="w-full rounded-lg" />
  );
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
        {data.type === 'hls' && <HlsPlayer url={data.url} />}
        {data.type === 'youtube' && <YouTubeEmbed url={data.url} />}
        {data.type === 'mjpeg' && <MjpegPlayer url={data.url} />}
      </div>
    </section>
  );
}
