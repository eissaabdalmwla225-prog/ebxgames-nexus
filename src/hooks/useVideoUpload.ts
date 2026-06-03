import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VideoUploadResult {
  path: string;
  signedUrl: string;
}

/**
 * Fast video upload with real-time progress.
 *
 * Uses Supabase signed-upload-URL flow + manual XHR PUT so we can hook
 * `xhr.upload.onprogress` for true byte-level percentage. Supabase JS
 * `.upload()` does not expose progress today.
 */
export const useVideoUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancel = () => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setUploading(false);
    setProgress(0);
  };

  const upload = async (file: File, folder = "videos"): Promise<VideoUploadResult | null> => {
    setUploading(true);
    setProgress(0);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // 1. Get signed upload URL
      const { data: signed, error: sErr } = await supabase
        .storage
        .from("media-videos")
        .createSignedUploadUrl(path);
      if (sErr || !signed) throw sErr || new Error("Could not create upload URL");

      // 2. PUT with XHR for real progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", signed.signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.setRequestHeader("x-upsert", "true");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));
        xhr.send(file);
      });

      // 3. Get long-lived signed URL for playback
      const { data: playback, error: pErr } = await supabase
        .storage
        .from("media-videos")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (pErr || !playback) throw pErr || new Error("Could not get playback URL");

      setProgress(100);
      return { path, signedUrl: playback.signedUrl };
    } catch (err: any) {
      if (err?.message !== "Upload cancelled") toast.error(err.message || "Upload failed");
      return null;
    } finally {
      setUploading(false);
      xhrRef.current = null;
    }
  };

  return { upload, uploading, progress, cancel };
};
