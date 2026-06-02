import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
}

// Detects whether the source is an HTML embed snippet (e.g. <iframe ...>)
const isEmbedHtml = (s: string) => /<\s*(iframe|script|embed|video)/i.test(s);

// Source kinds ReactPlayer handles well via its built-in players.
const isDirectMedia = (url: string) => /\.(mp4|m3u8|webm|mov|mkv|ogv)(\?|$)/i.test(url);
const isNativeStreamHost = (url: string) =>
  /(youtube\.com|youtu\.be|vimeo\.com|soundcloud\.com|twitch\.tv|facebook\.com\/.+\/videos|wistia\.com|dailymotion\.com|mixcloud\.com|kick\.com)/i.test(
    url,
  );

const VideoPlayer = ({ url, poster, autoPlay = true }: VideoPlayerProps) => {
  const src = (url || "").trim();

  // 1. Raw HTML embed snippet pasted by admin (iframe / script / video)
  if (isEmbedHtml(src)) {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><style>
      html,body{margin:0;padding:0;background:#000;height:100%;width:100%;overflow:hidden}
      iframe,video,embed{position:absolute;inset:0;width:100%!important;height:100%!important;border:0}
    </style></head><body>${src}</body></html>`;
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-glass-border">
        <iframe
          title="Embedded player"
          srcDoc={html}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        />
      </div>
    );
  }

  // 2. Direct media file or supported streaming host — use ReactPlayer
  if (isDirectMedia(src) || isNativeStreamHost(src)) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-glass-border">
        <ReactPlayer
          src={src}
          playing={autoPlay}
          controls
          width="100%"
          height="100%"
          light={poster || false}
          config={{ youtube: { rel: 0 } }}
        />
      </div>
    );
  }

  // 3. Anything else (custom embed URL, third-party player page) — load as an iframe
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-glass-border">
      <iframe
        title="Stream player"
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
        allowFullScreen
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default VideoPlayer;
