import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Хук для определения мобильного устройства
 * 
 * Использует matchMedia API для эффективного отслеживания изменений размера экрана.
 * 
 * @returns {boolean} true если ширина экрана меньше MOBILE_BREAKPOINT
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Используем matches из MediaQueryList вместо проверки innerWidth
    const updateIsMobile = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Инициализируем значение
    setIsMobile(mql.matches);

    // Современный API для matchMedia
    if (mql.addEventListener) {
      mql.addEventListener("change", updateIsMobile);
      return () => mql.removeEventListener("change", updateIsMobile);
    } else {
      // Fallback для старых браузеров
      mql.addListener(updateIsMobile);
      return () => mql.removeListener(updateIsMobile);
    }
  }, []);

  return isMobile;
}
