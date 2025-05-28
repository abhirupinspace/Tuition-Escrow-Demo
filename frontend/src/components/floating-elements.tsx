"use client"

import { useEffect, useRef } from "react"

export function FloatingElements() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Minimal floating elements
    const elements: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    // Create subtle floating elements
    for (let i = 0; i < 20; i++) {
      elements.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      elements.forEach((element) => {
        element.x += element.vx
        element.y += element.vy

        // Wrap around edges
        if (element.x < 0) element.x = canvas.width
        if (element.x > canvas.width) element.x = 0
        if (element.y < 0) element.y = canvas.height
        if (element.y > canvas.height) element.y = 0

        // Draw subtle element
        ctx.beginPath()
        ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${element.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />
}
