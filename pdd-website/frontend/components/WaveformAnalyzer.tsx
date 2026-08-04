"use client";

import { useState, useRef } from "react";
import { Camera, BrainCircuit, X, Loader2, Image as ImageIcon } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC7RZJ1g1h_y0b0953pnYlz_Bn6qDD1yBU");

export default function WaveformAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64Data = image.split(',')[1];

      const prompt = "This is a clinical waveform (ECG/EEG) from a paper chart. Please digitize the key findings, identify any visible anomalies, and provide a clinical summary.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
      ]);

      setResult(result.response.text());
    } catch (error) {
      console.error("AI Analysis failed", error);
      setResult("Clinical Interpretation Failure: Vision subsystem offline.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h3 className="text-xs font-black uppercase tracking-widest">Paper Chart Digitizing</h3>
        </div>
        {image && (
          <button onClick={() => setImage(null)} className="text-slate-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!image ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Camera className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-xs font-bold text-slate-500">Capture or upload waveform image</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
            <img src={image} className="w-full h-full object-cover" alt="Waveform Preview" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-full text-slate-900">
                  <ImageIcon className="h-5 w-5" />
               </button>
            </div>
          </div>

          <button
            onClick={analyzeImage}
            disabled={analyzing}
            className="w-full h-12 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            <span>{analyzing ? "Synthesizing..." : "Analyze Paper Chart"}</span>
          </button>
        </div>
      )}

      {result && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Neural Interpretation</p>
          <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
