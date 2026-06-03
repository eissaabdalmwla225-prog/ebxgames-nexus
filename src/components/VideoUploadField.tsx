import { Upload, X, Loader2 } from "lucide-react";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  rows?: number;
}

const VideoUploadField = ({ value, onChange, folder = "videos", placeholder, rows = 3 }: Props) => {
  const { upload, uploading, progress, cancel } = useVideoUpload();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, folder);
    if (result) {
      onChange(result.signedUrl);
      toast.success(`Uploaded ${file.name}`);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder ?? `Paste one of:
• Direct link  → https://…/movie.mp4 or .m3u8
• YouTube / Vimeo / Twitch URL
• Full <iframe …></iframe> embed code`}
        className="w-full px-4 py-3 rounded-xl bg-card/60 border border-glass-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />

      {uploading ? (
        <div className="rounded-xl glass-card p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
              <span className="text-xs font-display tracking-widest text-foreground">UPLOADING</span>
              <span className="text-xs font-mono text-primary tabular-nums">{progress}%</span>
            </div>
            <button onClick={cancel} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-150 ease-out shadow-[0_0_12px_hsl(var(--primary))]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-card cursor-pointer text-sm font-display tracking-widest hover:border-primary/40 transition">
          <Upload className="w-4 h-4" /> UPLOAD VIDEO FILE
          <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
        </label>
      )}
    </div>
  );
};

export default VideoUploadField;
