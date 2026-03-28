"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SignaturePadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function SignaturePad({ label, value, onChange, disabled = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [hasStroke, setHasStroke] = useState(Boolean(value));

  useEffect(() => {
    setHasStroke(Boolean(value));
  }, [value]);

  const prepareCanvas = useCallback((imageValue?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = Math.max(window.innerWidth - 32, 320);
    const height = Math.max(window.innerHeight - 120, 260);
    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#0f172a";

    if (imageValue) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, width, height);
        setHasStroke(true);
      };
      image.src = imageValue;
    } else {
      setHasStroke(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    prepareCanvas(value);
  }, [open, prepareCanvas, value]);

  function getPoint(event: PointerEvent | React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getPoint(event);
    if (!canvas || !ctx || !point) return;

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getPoint(event);
    if (!canvas || !ctx || !point) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasStroke(true);
  }

  function finishDrawing() {
    drawingRef.current = false;
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.closePath();
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.beginPath();
    setHasStroke(false);
  }

  function openPad() {
    if (disabled) return;
    setOpen(true);
  }

  function closePad() {
    setOpen(false);
    setHasStroke(Boolean(value));
  }

  function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
    setOpen(false);
  }

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={openPad}
          disabled={disabled}
          className="w-full overflow-hidden rounded-2xl border border-slate-300 bg-white text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {value ? (
            <div className="p-3">
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <img src={value} alt={label} className="h-24 w-full object-contain" />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Toque para editar a assinatura</p>
            </div>
          ) : (
            <div className="px-4 py-5 text-sm font-semibold text-slate-500">Toque para assinar em tela cheia</div>
          )}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">Assine com o dedo, mouse ou caneta.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSignature}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={closePad}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={saveSignature}
                disabled={!hasStroke}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Salvar
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={finishDrawing}
                onPointerCancel={finishDrawing}
                onPointerLeave={finishDrawing}
                className={`block w-full touch-none bg-white ${disabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair"}`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
