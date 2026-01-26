#!/bin/bash

# Получаем абсолютный путь к директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Загружаем nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "/usr/local/opt/nvm/nvm.sh" ] && \. "/usr/local/opt/nvm/nvm.sh"

# Используем версию из .nvmrc, если файл существует
if [ -f ".nvmrc" ]; then
  nvm use
else
  nvm use default
fi

# Проверяем, что npm доступен
if ! command -v npm &> /dev/null; then
  echo "Ошибка: npm не найден. Убедитесь, что Node.js установлен через nvm."
  exit 1
fi

# Проверяем наличие node_modules
if [ ! -d "./node_modules" ]; then
  echo "Ошибка: node_modules не найден. Запустите 'npm install' для установки зависимостей."
  exit 1
fi

# Проверяем наличие next
if [ ! -f "./node_modules/.bin/next" ]; then
  echo "Ошибка: Next.js не найден. Запустите 'npm install' для установки зависимостей."
  exit 1
fi

# Запускаем dev сервер на порту 3000 напрямую через локальный next
exec ./node_modules/.bin/next dev -p 3000
