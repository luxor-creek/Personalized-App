import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoId?: string;
  thumbnailUrl?: string;
}

const VideoPlayer = ({ videoId = "1153753885", thumbnailUrl }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden card-elevated border border-border/50 bg-card">
      {!isPlaying && thumbnailUrl ? (
        <div 
          className="absolute inset-0 cursor-pointer group"
          onClick={() => setIsPlaying(true)}
        >
          <img 
            src={thumbnailUrl} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/40 group-hover:bg-background/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-pulse-glow group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>
      ) : (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=${isPlaying ? 1 : 0}&title=0&byline=0&portrait=0`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Police Recruitment Video Demo"
        />
      )}
    </div>
  );
};

export default VideoPlayer;
