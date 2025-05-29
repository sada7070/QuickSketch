"use client"
import { initDraw } from "@/components/draw";
import { useEffect, useRef } from "react"

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        // If the window gets resized (user resizes browser), run resize() again.”
        window.addEventListener("resize", resize);

        initDraw(canvas);

        // Stop listening to resize events when the component is gone — avoid memory leaks.
        return () => window.removeEventListener("resize", resize);
    }, [canvasRef])

    return <div>
        <canvas ref={canvasRef} className="fixed top-0 left-0 w-screen h-screen block"></canvas>

        <div className="fixed bottom-0 right-2">
            <button className="bg-amber-50 text-black pr">Rect</button>
            <button className="bg-amber-50 text-black">circle</button>
        </div>
    </div>
}