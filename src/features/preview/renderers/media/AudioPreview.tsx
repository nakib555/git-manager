import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

interface AudioPreviewProps {
  blobUrl?: string;
  base64?: string;
  mimeType: string;
  fileName: string;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  blobUrl,
  base64,
  mimeType,
  fileName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioSrc = blobUrl || (base64 ? `data:${mimeType};base64,${base64}` : '');

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Draw simulated waveform bars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 48;
    const barWidth = width / barCount - 2;

    for (let i = 0; i < barCount; i++) {
      const progressRatio = duration > 0 ? currentTime / duration : 0;
      const isPlayed = i / barCount <= progressRatio;
      const seed = Math.sin(i * 0.45) * 0.5 + 0.5;
      const barHeight = Math.max(8, seed * height * 0.85);

      ctx.fillStyle = isPlayed ? '#3E5670' : '#DEDDD8';
      ctx.fillRect(i * (barWidth + 2), (height - barHeight) / 2, barWidth, barHeight);
    }
  }, [currentTime, duration]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-surface-1">
      <audio
        ref={audioRef}
        src={audioSrc}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />

      <div className="w-full max-w-md bg-surface-2/60 border border-border rounded-2xl p-6 flex flex-col items-center shadow-soft">
        <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center text-accent mb-4">
          <Music size={32} />
        </div>

        <h3 className="text-sm font-semibold text-text-primary text-center truncate max-w-xs mb-1">
          {fileName}
        </h3>
        <p className="text-xs text-text-tertiary mb-6 font-mono">{mimeType}</p>

        <canvas
          ref={canvasRef}
          width={380}
          height={64}
          className="w-full h-16 rounded-lg mb-4 pointer-events-none"
        />

        <div className="w-full flex items-center gap-2 mb-4">
          <span className="text-[11px] font-mono text-text-tertiary tabular-nums w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-accent h-1.5 bg-surface-3 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-text-tertiary tabular-nums w-10">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center hover:opacity-95 transition-opacity shadow-medium cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="p-2.5 rounded-full hover:bg-surface-3 transition-colors text-text-secondary cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
