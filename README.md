# Orbitto Frontend Challenge

Frontend-реализация auth-флоу Orbitto под реальный backend fork на базе Ory Kratos.

Решение покрывает 3 пользовательских сценария:

- регистрация
- авторизация
- восстановление пароля

Дизайн сохранён в рамках исходного направления челленджа; основной акцент сделан на устойчивую клиентскую интеграцию с backend-контрактом, UX-состояния и архитектурную читаемость.

## Выбранный backend

- Backend fork: `engineer-challenge`
- Chosen backend fork: `https://github.com/yudin7324/engineer-challenge`
- Original upstream: `https://github.com/kfreiman/engineer-challenge`
- Локально фронт разрабатывался и проверялся против выбранного backend fork

Почему выбран именно этот fork:

- в нём уже есть реальный auth-контур на Ory Kratos
- контракт ближе к production-сценарию, чем моковый backend
- можно показать не только верстку, но и работу с flow, cookies, session-check и ошибками IAM

## Что реализовано

- `sign-up` c реальным browser registration flow
- `sign-in` c реальным browser login flow
- `recovery` c экраном отправки email, success/error состояниями и экраном смены пароля
- server-side защита приватного маршрута `/dashboard`
- logout через завершение browser session
- loading / error / success состояния в auth-сценариях
- адаптивные auth-экраны под desktop и mobile
- базовая защита от повторных submit во время pending-состояния
- обработка edge-cases Ory Kratos: истёкший flow, неполный flow, промежуточный `400` на registration step, ошибки аутентификации
- unit/integration тесты для критичных auth-сценариев

## Как запустить

### 1. Поднять backend

```bash
git clone https://github.com/yudin7324/engineer-challenge.git
cd engineer-challenge
cp .env.example .env
make dev
```

После запуска Kratos доступен локально через Docker на `http://localhost:4433`.

### 2. Установить зависимости и поднять frontend

```bash
git clone https://github.com/yudin7324/frontend-engineer-challenge.git
cd frontend-engineer-challenge
cp .env.example .env.local
npm install
npm run dev
```

По умолчанию приложение стартует на `http://localhost:3000`.

Если порт `3000` уже занят другим локальным приложением, Next.js автоматически выберет следующий свободный порт, например `3001`.

Основные маршруты:

- `http://localhost:3000/sign-in`
- `http://localhost:3000/sign-up`
- `http://localhost:3000/recovery`

### 3. Переменные окружения

Если Kratos доступен не по дефолтному адресу, можно переопределить значения в `.env.local`:

```bash
KRATOS_INTERNAL_URL=http://localhost:4433
NEXT_PUBLIC_KRATOS_URL=http://localhost:4433
```

Назначение переменных:

- `KRATOS_INTERNAL_URL` используется на server-side: proxy route, session check, logout
- `NEXT_PUBLIC_KRATOS_URL` оставлен как публичный fallback и для согласованности конфигурации

## Как запустить тесты

```bash
cd frontend-engineer-challenge
npm test -- --runInBand
```

## Архитектура frontend

Проект намеренно не собран в формате “всё в `components/` и `services/`”. Вместо этого код разделён по ответственности.

### `src/app`

Слой маршрутов и page composition.

- auth-страницы
- recovery-страницы
- защищённый `dashboard`
- server routes для same-origin proxy к Kratos и session/logout сценариев

### `src/modules/auth`

Прикладной auth-модуль.

- `api/`: orchestration Ory browser flows
- `model/`: схемы валидации и типы форм
- `ui/`: сценарные формы и auth-компоненты
- `__tests__/`: тесты критичных сценариев

### `src/shared`

Переиспользуемые строительные блоки.

- `ui/`: базовые UI-компоненты
- `lib/`: Ory client, session helper и инфраструктурные утилиты

## Ключевые инженерные решения

### 1. Next.js App Router

Почему:

- удобно держать рядом UI, серверные маршруты и session-oriented логику
- проще построить same-origin proxy до Kratos
- защищённые страницы можно валидировать на сервере, а не только клиентским стейтом

Рассматривались альтернативы:

- Vite + React Router
- отдельный BFF поверх SPA

Выбран App Router как более короткий путь до production-подобной auth-интеграции в рамках объёма челленджа.

### 2. Same-origin proxy до Kratos

Почему:

- browser flows Ory чувствительны к cookies и CSRF
- same-origin proxy упрощает работу с browser session и снижает риск CORS/CSRF проблем
- фронт взаимодействует с Docker-backed backend в модели, близкой к реальному deployment

### 3. Cookie-based browser session вместо хранения токена в localStorage

Почему:

- сессия следует реальной модели Kratos browser auth
- приватные страницы можно проверять через `sessions/whoami`
- решение безопаснее и ближе к production, чем ручное хранение auth-токена в браузере

Trade-off:

- интеграция сложнее, чем “сохранить токен и считать пользователя залогиненным”
- зато видно, как frontend работает с реальным IAM-контрактом

### 4. Auth-flow проектировался вокруг нестабильных состояний, а не только happy path

Что обработано:

- загрузка и инициализация flow
- повторные submit
- истёкшие и неполные flow
- ошибки backend
- промежуточный `400 Bad Request` на первом шаге registration flow в Kratos
- redirect при уже активной сессии

## Предположения по backend-контрактам

Во время реализации были зафиксированы такие assumptions:

- backend использует Ory Kratos browser flows, а не native/mobile flows
- регистрация является двухшаговой:
  - сначала `method=profile` c `traits.email`
  - затем `method=password`
- Kratos использует cookie-based browser session
- email пользователя хранится в `identity.traits.email`
- проверка текущей сессии строится через `GET /sessions/whoami`
- при первом шаге registration flow Kratos может вернуть `400`, но вместе с этим прислать обновлённый flow для следующего шага
- часть ошибок удобно маппить по известным `ui.messages[].id`, но текст ответа backend всё равно остаётся fallback-источником истины

Все эти предположения отражены в текущем коде фронта и описаны здесь, чтобы было понятно, где именно frontend чувствителен к изменению контракта.

## Надёжность и UX-защита

Что сделано в рамках устойчивости сценариев:

- submit-кнопки блокируются во время pending
- форма не отправляется, пока flow не инициализирован
- повторные запросы не плодятся во время текущего submit
- ошибка backend отображается пользователю в человекочитаемом виде
- приватный экран не полагается только на клиентское состояние и повторно валидирует сессию

## Тестовая стратегия

Сейчас в проекте есть unit/integration тесты на критичные части auth-flow:

- валидация схем
- sign-in форма
- sign-up форма
- recovery форма
- edge-case двухшаговой регистрации Kratos, где первый шаг возвращает `400`, а flow должен продолжиться

Почему такой уровень тестов:

- для объёма челленджа этого достаточно, чтобы покрыть основной orchestration и UX-состояния
- следующий логичный production-шаг здесь уже e2e на живом окружении

## Принятые trade-offs

- Не добавлялся отдельный state manager вроде Redux или Zustand: для локальных auth-flow достаточно state на уровне формы и модуля.
- Не строился тяжёлый UI-kit: вместо этого сделан компактный слой `shared/ui`, достаточный для текущего объёма.
- После логина не разворачивался полноценный кабинет: добавлен минимальный `dashboard`, подтверждающий успешную session-based интеграцию.
- Не внедрялся codegen для контрактов Kratos: в рамках челленджа важнее было корректно собрать orchestration поверх существующего SDK и реальных flow.

## Что бы я сделал следующим шагом в production-версии

- добавил бы e2e-тесты поверх живого Docker-окружения
- вынес бы mapping ошибок и flow-orchestration в отдельный typed adapter-слой
- добавил бы telemetry на auth-ошибки и recovery conversion
- усилил бы observability вокруг нестабильных backend-ответов
- расширил бы protected area до account/settings сценариев

## Demo / дополнительные материалы

- Скринкаст основных сценариев: https://disk.yandex.ru/i/eWLoTNevEFri0Q

## Использование ИИ

ИИ-инструменты использовались как инженерный ассистент для:

- диагностики контрактных edge-cases Kratos
- рефакторинга структуры frontend-модулей
- ускорения подготовки README и тестовых сценариев

Прозрачность процесса зафиксирована в папке `.agents`.
