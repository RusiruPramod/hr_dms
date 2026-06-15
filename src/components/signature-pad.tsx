import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Check, Upload } from "lucide-react";

interface SignaturePadProps {
  internId: string;
  type: "intern" | "witness" | "hr";
  onSave: (url: string) => void;
}

export function SignaturePad({ internId, type, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000"); // Black default
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas high resolution for sharp drawing
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor;

    // Fill white background so it's not a transparent black void when exported
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = penColor;
    }
  }, [penColor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Support touch events
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    toast.info("Signature cleared");
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setUploading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");

      // Import the server function dynamically to avoid SSR bundles
      const { uploadSignatureServer } = await import("@/lib/api/interns.functions");

      const res = await uploadSignatureServer({
        data: {
          internId,
          type,
          signatureBase64: dataUrl,
        },
      });

      toast.success("Signature saved and uploaded successfully!");
      onSave(res.url);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to upload signature");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file (PNG/JPG).");
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const { uploadSignatureServer } = await import("@/lib/api/interns.functions");

        const res = await uploadSignatureServer({
          data: {
            internId,
            type,
            signatureBase64: base64Data,
          },
        });

        toast.success("Signature uploaded successfully!");
        onSave(res.url);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to upload signature file");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4 bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold capitalize">{type} Signature</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setPenColor("#000000")}
            className={`h-5 w-5 rounded-full border border-border bg-black ${penColor === "#000000" ? "ring-2 ring-primary ring-offset-1" : ""}`}
            title="Black Pen"
          />
          <button
            onClick={() => setPenColor("#0f172a")}
            className={`h-5 w-5 rounded-full border border-border bg-slate-900 ${penColor === "#0f172a" ? "ring-2 ring-primary ring-offset-1" : ""}`}
            title="Navy Pen"
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-md border border-border bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="h-32 w-full cursor-crosshair touch-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <input
            type="file"
            id={`file-upload-${type}`}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-upload-${type}`)?.click()}
            disabled={uploading}
            className="text-xs"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload File
          </Button>
        </div>

        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            disabled={uploading}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={saveSignature}
            disabled={uploading}
            className="text-xs"
          >
            <Check className="mr-1.5 h-3.5 w-3.5" /> {uploading ? "Saving…" : "Save Signature"}
          </Button>
        </div>
      </div>
    </div>
  );
}
