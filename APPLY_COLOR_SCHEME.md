# Инструкция по применению цветовой схемы

## Способ 1: Применить напрямую в globals.css (рекомендуется)

### Шаг 1: Откройте файл `src/app/globals.css`

### Шаг 2: Найдите секцию `:root` (строки 46-78)

### Шаг 3: Замените значения цветов

**Для ЗЕЛЕНОЙ темы (рекомендуется):**
```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  /* ЗАМЕНИТЕ ЭТИ СТРОКИ */
  --primary: oklch(0.50 0.18 145); /* Зеленый */
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.92 0.04 145); /* Светло-зеленый */
  --accent-foreground: oklch(0.30 0.12 145);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.50 0.18 145); /* Зеленый для фокуса */
  /* Обновленные цвета для графиков */
  --chart-1: oklch(0.50 0.18 145);
  --chart-2: oklch(0.55 0.20 160);
  --chart-3: oklch(0.45 0.16 130);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.50 0.18 145); /* Зеленый для sidebar */
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.50 0.18 145);
}
```

### Шаг 4: Обновите темную тему `.dark` (строки 81-113)

**Для ЗЕЛЕНОЙ темы в темном режиме:**
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  /* ЗАМЕНИТЕ ЭТИ СТРОКИ */
  --primary: oklch(0.60 0.18 145); /* Более светлый зеленый для темного режима */
  --primary-foreground: oklch(0.15 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.25 0.06 145); /* Темно-зеленый акцент */
  --accent-foreground: oklch(0.95 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.60 0.18 145); /* Зеленый для фокуса */
  /* Обновленные цвета для графиков */
  --chart-1: oklch(0.60 0.18 145);
  --chart-2: oklch(0.65 0.20 160);
  --chart-3: oklch(0.55 0.16 130);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.60 0.18 145); /* Зеленый для sidebar */
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.60 0.18 145);
}
```

## Способ 2: Использовать классы тем из color-schemes.css

### Шаг 1: Импортируйте color-schemes.css в globals.css
```css
@import "./color-schemes.css";
```

### Шаг 2: Добавьте класс темы в layout.tsx
```tsx
<html lang="ru" className="theme-green">
```

## Другие варианты цветов

### СИНЯЯ тема:
- `--primary: oklch(0.55 0.22 252);`
- `--accent: oklch(0.95 0.02 252);`
- `--ring: oklch(0.55 0.22 252);`

### ФИОЛЕТОВАЯ тема:
- `--primary: oklch(0.50 0.20 300);`
- `--accent: oklch(0.92 0.04 300);`
- `--ring: oklch(0.50 0.20 300);`

### ОРАНЖЕВАЯ тема:
- `--primary: oklch(0.65 0.20 45);`
- `--accent: oklch(0.95 0.05 45);`
- `--ring: oklch(0.65 0.20 45);`

### БИРЮЗОВАЯ тема:
- `--primary: oklch(0.55 0.18 200);`
- `--accent: oklch(0.92 0.04 200);`
- `--ring: oklch(0.55 0.18 200);`

### ИНДИГО тема:
- `--primary: oklch(0.45 0.18 270);`
- `--accent: oklch(0.93 0.03 270);`
- `--ring: oklch(0.45 0.18 270);`

## Проверка результата

После применения схемы проверьте:
1. ✅ Кнопки имеют новый цвет
2. ✅ Активные элементы выделены новым цветом
3. ✅ Графики и прогресс-бары используют новую палитру
4. ✅ Sidebar имеет соответствующий акцентный цвет
5. ✅ Темный режим также обновлен

## Откат изменений

Если нужно вернуть исходную нейтральную тему:
```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
--ring: oklch(0.708 0 0);
```

