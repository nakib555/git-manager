import React, { useState, useRef } from 'react';
import { VideoOff, Film } from 'lucide-react';

interface VideoPreviewProps {
  blobUrl?: string;
  base64?: string;
  mimeType: string;
  fileName: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  blobUrl,
  base64,
  mimeType,
  fileName,
}) => {
  const [hasError, setHasError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoSrc = blobUrl || (base64 ? `data:${mimeType};base64,${base64}` : '');

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  if (hasError || !videoSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <VideoOff size={44} className="mb-3 text-text-tertiary opacity-60" />
        <p className="text-sm font-medium text-text-primary">Unable to play video format</p>
        <p className="text-xs text-text-tertiary mt-1 max-w-sm">
          {fileName} may use an unsupported video container or codec (e.g. MKV or HEVC). Download the file to view in a desktop player.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-surface-1">
      <div className="relative w-full max-w-4xl max-h-[75vh] flex flex-col items-center">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          onError={() => setHasError(true)}
          className="w-full max-h-[68vh] rounded-xl shadow-medium border border-border bg-black object-contain"
        />

        <div className="mt-3 flex items-center gap-2 self-end">
          <span className="text-[11px] text-text-tertiary font-medium">Speed:</span>
          {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer transition-colors ${
                playbackRate === speed
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-2 text-text-secondary hover:text-text-primary'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
