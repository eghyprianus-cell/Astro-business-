import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  color: string;
}

export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#e9d5ff', '#a7f3d0'];
    const starCount = Math.floor((width * height) / 9000);
    const stars: Star[] = Array.from({ length: Math.min(starCount, 140) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // Draw static subtle nebulae on the canvas
    let step = 0;
    const render = () => {
      step += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Deep space subtle gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0d1124');
      bgGrad.addColorStop(0.5, '#090a16');
      bgGrad.addColorStop(1, '#05060d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle nebula glow
      const nebula1 = ctx.createRadialGradient(width * 0.8, height * 0.3, 20, width * 0.8, height * 0.3, 340);
      nebula1.addColorStop(0, 'rgba(124, 58, 237, 0.07)');
      nebula1.addColorStop(0.7, 'rgba(124, 58, 237, 0.01)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.15, height * 0.7, 30, width * 0.15, height * 0.7, 380);
      nebula2.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
      nebula2.addColorStop(0.6, 'rgba(14, 165, 233, 0.02)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Render stars with gentle pulse
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const pulse = Math.sin(step * star.speed * 100 + i) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha + pulse));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross shimmer on largest stars
        if (star.size > 1.6) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
