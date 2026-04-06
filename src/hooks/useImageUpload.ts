import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, path: string): Promise<string | null> => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${path}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
};
