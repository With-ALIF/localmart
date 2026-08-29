import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (dataUrl: string) => void;
  maxSizeKB?: number;
}

function resizeImageToMaxKB(file: File, maxKB: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length / 1024 > maxKB && quality > 0.05) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length / 1024 > maxKB) {
          const scale = Math.sqrt((maxKB * 1024) / (dataUrl.length));
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ value, onChange, maxSizeKB = 100 }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [resizing, setResizing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    setResizing(true);
    try {
      const dataUrl = await resizeImageToMaxKB(file, maxSizeKB);
      onChange(dataUrl);
    } catch {
      // silent
    } finally {
      setResizing(false);
    }
  };

  const sizeKB = value ? Math.round(value.length / 1024) : 0;

  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-3">
          <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover" />
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">{sizeKB} KB</span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
            >
              <X className="size-3" /> মুছুন
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={resizing}
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-dashed border-border px-4 text-xs font-semibold transition hover:bg-secondary disabled:opacity-50"
        >
          {resizing ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Resizing...
            </>
          ) : (
            <>
              <Upload className="size-3.5" />
              ছবি আপলোড করুন (max {maxSizeKB}KB)
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
