import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
}

const VideoPlayer = ({ url, poster, autoPlay = true }: VideoPlayerProps) => {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-glass-border">
      <ReactPlayer
        src={url}
        playing={autoPlay}
        controls
        width="100%"
        height="100%"
        light={poster || false}
        config={{
          youtube: { playerVars: { modestbranding: 1 } },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
