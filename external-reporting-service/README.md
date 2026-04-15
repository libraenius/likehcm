# External Reporting Service

Сервис загрузки отчетов от внешних провайдеров с гибкой настройкой видимости на основе иерархии управления.

## Что реализовано

- Загрузка файлов отчетов от провайдера (`multipart/form-data`)
- Поддержка типов отчетов:
  - `INDIVIDUAL`
  - `GROUP`
  - `SUMMARY`
  - `OVERALL`
  - `ANALYTIC`
- Иерархическая модель доступа:
  - сотрудник видит свой индивидуальный отчет
  - руководители видят индивидуальные отчеты подчиненных
  - руководители по иерархии видят агрегированные отчеты подразделений
  - общий отчет ограничивается минимальным уровнем роли
- Гибкая настройка политик видимости через API
- Расширенные аналитические отчеты:
  - доступ заказчикам исследования
  - возможность выдать доступ точечно другим пользователям

## Установка и запуск

```bash
npm install
npm run dev
```

Сервис стартует на порту `4010`.

## Основные API

- `GET /health`
- `GET /api/users`
- `GET /api/policies`
- `PUT /api/policies/:reportType`
- `POST /api/reports/upload` (поле файла: `file`)
- `POST /api/reports/:reportId/grants`
- `GET /api/reports`
- `GET /api/users/:userId/reports`
- `GET /api/reports/:reportId/access/:userId`
- `GET /api/reports/:reportId/download?userId=<id>`

## Пример загрузки отчета

```bash
curl -X POST http://localhost:4010/api/reports/upload \
  -F "file=@report.pdf" \
  -F "providerId=provider-1" \
  -F "type=INDIVIDUAL" \
  -F "title=Индивидуальный отчет сотрудника" \
  -F "ownerUserId=u-employee" \
  -F "unitId=unit-assessment"
```

## Пример изменения политики

```bash
curl -X PUT http://localhost:4010/api/policies/OVERALL \
  -H "Content-Type: application/json" \
  -d "{
    \"allowSelfOwner\": false,
    \"allowOwnerManagerChain\": false,
    \"allowUnitManagerHierarchy\": true,
    \"minimumRoleRankForUnitHierarchy\": 4,
    \"allowResearchCustomers\": false,
    \"additionalViewerRoleRanks\": []
  }"
```
