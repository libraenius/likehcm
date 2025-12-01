"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Свойства компонента AuroraBackground
 */
interface AuroraBackgroundProps {
  /** Дополнительные CSS классы */
  className?: string;
  /** Дочерние компоненты */
  children?: React.ReactNode;
  /** Показывать ли радиальный градиент поверх canvas анимации */
  showRadialGradient?: boolean;
}

/**
 * Компонент фоновой анимации "Северное сияние"
 * 
 * Создаёт анимированный фон с эффектом северного сияния используя Canvas API.
 * Анимация автоматически адаптируется к теме (светлая/тёмная) и оптимизирована
 * для производительности (пауза при скрытии вкладки, использование ResizeObserver).
 * 
 * @param {AuroraBackgroundProps} props - Свойства компонента
 * @returns {JSX.Element} Компонент с анимированным фоном
 */
export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Проверяем тему
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let isPaused = false;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Используем ResizeObserver для отслеживания изменений размеров контейнера
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    // Пауза при скрытии вкладки для экономии ресурсов
    const handleVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const draw = () => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Цвета в зависимости от темы
      const colors = isDark
        ? [
            { color: "rgba(96, 165, 250, 0.2)", x: 0.2, y: 0.3 }, // Синий для темной темы
            { color: "rgba(251, 146, 60, 0.15)", x: 0.7, y: 0.5 }, // Оранжевый
            { color: "rgba(139, 92, 246, 0.12)", x: 0.5, y: 0.7 }, // Фиолетовый
          ]
        : [
            { color: "rgba(59, 130, 246, 0.12)", x: 0.2, y: 0.3 }, // Синий для светлой темы
            { color: "rgba(251, 146, 60, 0.1)", x: 0.7, y: 0.5 }, // Оранжевый
            { color: "rgba(99, 102, 241, 0.08)", x: 0.5, y: 0.7 }, // Фиолетово-синий
          ];

      // Создаем несколько слоев для эффекта северного сияния
      const layers = colors.map((baseColor, index) => ({
        x: width * baseColor.x + Math.sin(time + index) * (80 + index * 20),
        y: height * baseColor.y + Math.cos(time * (0.7 + index * 0.1)) * (60 + index * 15),
        radius: width * (0.4 + index * 0.1),
        color: baseColor.color,
      }));

      layers.forEach((layer) => {
        const gradient = ctx.createRadialGradient(
          layer.x,
          layer.y,
          0,
          layer.x,
          layer.y,
          layer.radius
        );
        
        const opacity = parseFloat(layer.color.match(/[\d.]+(?=\))/)?.[0] || "0.1");
        gradient.addColorStop(0, layer.color);
        gradient.addColorStop(0.4, layer.color.replace(/[\d.]+(?=\))/, String(opacity * 0.5)));
        gradient.addColorStop(0.7, layer.color.replace(/[\d.]+(?=\))/, String(opacity * 0.2)));
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {showRadialGradient && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: isDark
              ? `
                  radial-gradient(at 20% 30%, rgba(96, 165, 250, 0.15) 0px, transparent 50%),
                  radial-gradient(at 70% 50%, rgba(251, 146, 60, 0.12) 0px, transparent 50%),
                  radial-gradient(at 50% 70%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)
                `
              : `
                  radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
                  radial-gradient(at 70% 50%, rgba(251, 146, 60, 0.06) 0px, transparent 50%),
                  radial-gradient(at 50% 70%, rgba(99, 102, 241, 0.05) 0px, transparent 50%)
                `,
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

