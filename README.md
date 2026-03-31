# GEREGNEWS.MN — Дэлхийн мэдээ, Монголоор

AI-р ажилладаг олон улсын мэдээний агрегатор. 38+ эх сурвалжаас мэдээ татаж, монгол хэл рүү автоматаар орчуулж, нэг дороос хүргэнэ.

---

## Үндсэн статистик

| Үзүүлэлт | Тоо |
|-----------|-----|
| Нийт мэдээ | 600+ |
| Эх сурвалж | 38+ (олон улсын + монгол) |
| Категори | 8 (world, politics, business, tech, science, sports, health, entertainment) |
| Орчуулгын chain | Groq → Gemini → Claude → Google Translate |
| Auto-fetch | 1 цаг тутам |
| Batch translate | 30 мин тутам |

---

## Технологи

| Layer | Stack |
|-------|-------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, SQLite/PostgreSQL |
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **AI орчуулга** | Claude Haiku, Groq Llama 3.3, Google Gemini, Google Translate |
| **Deployment** | Docker Compose, Nginx reverse proxy, PostgreSQL 16 |

---

## Архитектур

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Nginx:80  │────→│ Frontend:3000│     │  Backend:8000 │
│  (reverse   │     │  (Next.js)   │────→│  (FastAPI)    │
│   proxy)    │────→│              │     │               │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                    ┌──────────────┐     ┌────────┴────────┐
                    │  PostgreSQL  │←────│   Scheduler     │
                    │   :5432      │     │  (APScheduler)  │
                    └──────────────┘     └─────────────────┘
                                                  │
                                         ┌────────┴────────┐
                                         │  RSS Feeds (38+)│
                                         │  MN Scrapers (5)│
                                         │  YouTube (3)    │
                                         │  AI Translation │
                                         └─────────────────┘
```

---

## Бүтэц

```
news-aggregator/
├── backend/
│   ├── app/
│   │   ├── main.py              # Entry point + scheduler + startup fetch
│   │   ├── config.py            # Environment тохиргоо
│   │   ├── database.py          # SQLite/PostgreSQL dual support
│   │   ├── auth.py              # JWT + admin auth + bcrypt
│   │   ├── models/
│   │   │   ├── article.py       # Мэдээний загвар (14 талбар)
│   │   │   ├── user.py          # Хэрэглэгч
│   │   │   ├── bookmark.py      # Хавчуурга
│   │   │   ├── ad.py            # Зар сурталчилгаа
│   │   │   ├── push_subscription.py
│   │   │   └── analytics.py     # PageView + DailyStat
│   │   ├── routers/
│   │   │   ├── articles.py      # CRUD + suggest + full-text search
│   │   │   ├── admin.py         # Stats + health
│   │   │   ├── users.py         # Register + login
│   │   │   ├── bookmarks.py     # Save/remove
│   │   │   ├── ads.py           # CRUD
│   │   │   ├── analytics.py     # Track + dashboard
│   │   │   ├── push.py          # Web push notifications
│   │   │   ├── rss.py           # RSS feed export
│   │   │   └── demo.py          # Demo features
│   │   └── services/
│   │       ├── scraper.py       # RSS parse + MN scrape + YouTube
│   │       └── ai_summary.py    # Translation chain + classify + post-process
│   ├── migrate_to_postgres.py   # SQLite → PostgreSQL шилжүүлэх
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js        # Root layout + OG meta + dark mode
│   │   │   ├── page.js          # Нүүр хуудас (hero + categories + widgets)
│   │   │   ├── article/[id]/page.js  # Мэдээний дэлгэрэнгүй + dynamic SEO
│   │   │   ├── admin/page.js    # Админ панел
│   │   │   ├── bookmarks/page.js
│   │   │   ├── login/page.js
│   │   │   ├── register/page.js
│   │   │   ├── sitemap.js       # Auto sitemap.xml
│   │   │   └── robots.js        # robots.txt
│   │   ├── components/
│   │   │   ├── Header.js        # Navigation + user status
│   │   │   ├── CategoryBar.js   # 8 категори шүүлтүүр
│   │   │   ├── SearchBar.js     # Autocomplete + filters
│   │   │   ├── ArticleCard.js   # Мэдээний карт + placeholder image
│   │   │   ├── BookmarkButton.js
│   │   │   ├── AdBanner.js
│   │   │   ├── StockTicker.js
│   │   │   ├── WeatherWidget.js
│   │   │   ├── ZurkhaiWidget.js
│   │   │   ├── GallerySection.js
│   │   │   ├── Footer.js
│   │   │   └── Analytics.js
│   │   ├── lib/api.js           # API helper
│   │   └── context/
│   │       ├── AuthContext.js
│   │       └── ThemeContext.js
│   ├── public/                  # PWA icons + manifest + sw.js
│   ├── next.config.js
│   ├── Dockerfile
│   └── package.json
├── nginx/nginx.conf             # Reverse proxy config
├── docker-compose.yml           # PostgreSQL + Backend + Frontend + Nginx
├── .env.example
├── start.bat / stop.bat         # Windows dev scripts
└── README.md
```

---

## API Endpoints

### Мэдээ
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/articles/` | Жагсаалт (search, category, source, date, lang, region) |
| GET | `/api/articles/{id}` | Дэлгэрэнгүй (on-demand content + орчуулга) |
| GET | `/api/articles/sources` | Эх сурвалжуудын жагсаалт |
| GET | `/api/articles/suggest?q=` | Autocomplete (7 үр дүн, 300ms debounce) |
| POST | `/api/articles/fetch` | Шинэ мэдээ татах (admin) |
| DELETE | `/api/articles/clear` | Бүх мэдээ устгах (admin) |

### Хэрэглэгч
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| POST | `/api/users/register` | Бүртгүүлэх |
| POST | `/api/users/login` | Нэвтрэх (JWT) |
| GET | `/api/users/me` | Профайл |

### Хавчуурга
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/bookmarks/` | Хавчуургын жагсаалт |
| GET | `/api/bookmarks/ids` | ID жагсаалт |
| POST | `/api/bookmarks/{id}` | Хадгалах |
| DELETE | `/api/bookmarks/{id}` | Устгах |

### Админ
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| POST | `/api/admin/login` | Админ нэвтрэх |
| GET | `/api/admin/stats` | Статистик (source, category, translation) |

### Бусад
| Method | Endpoint | Тайлбар |
|--------|----------|---------|
| GET | `/api/ads/all` | Зарууд |
| POST | `/api/analytics/track` | Page view бүртгэх |
| GET | `/api/analytics/dashboard` | Analytics dashboard (admin) |
| GET | `/api/rss` | RSS feed export |
| GET | `/api/push/vapid-key` | Push notification key |

---

## Эх сурвалжууд (38+)

### Олон улсын RSS (30+)
| Бүс | Сурвалж |
|-----|---------|
| **Америк** | NY Times, Google News (7 topic) |
| **Европ** | BBC, The Guardian, DW, France 24, Euronews, TASS, El Pais, RTE, The Local |
| **Ази** | Al Jazeera, SCMP, CNA, Times of India, Yonhap, Japan Times, Japan Today, Korea Times, Bangkok Post, China Daily, Global Times |
| **Ойрхи Дорнод** | Arab News |
| **Латин Америк** | Buenos Aires Times |

### Монгол (6)
| Арга | Сурвалж |
|------|---------|
| RSS | iKon.mn |
| Web scrape | GoGo.mn, News.mn, Montsame, 24tsag.mn, Shuud.mn |

### YouTube (3)
| Суваг | Арга |
|-------|------|
| Eagle News, MNB, TV9 Mongolia | RSS → HTML scrape fallback |

---

## Орчуулгын систем

```
Шинэ мэдээ орж ирэв
        │
        ▼
┌─ Бүтэцтэй орчуулга (structured) ─────────────────────┐
│  Groq (Llama 3.3 70B) ──fail──→ Gemini Flash          │
│         │                            │                  │
│        ok                          fail                 │
│         │                            │                  │
│         ▼                    Claude Haiku               │
│    TITLE + SUMMARY              │                       │
│    KEY_POINTS                 fail                      │
│    FULL_TEXT                    │                        │
│    MONGOLIA_IMPACT             ▼                        │
│                         ┌─ Энгийн орчуулга ──┐         │
│                         │  Google Translate   │         │
│                         │  (fallback, always  │         │
│                         │   works)            │         │
│                         └────────────────────┘         │
└────────────────────────────────────────────────────────┘
        │
        ▼
   Post-processing
   (С.Солонгос → Өмнөд Солонгос, БНСУ → Өмнөд Солонгос, ...)
        │
        ▼
     DB-д хадгалах
```

---

## Features

### Хэрэгжүүлсэн
- [x] 38+ олон улсын + Монгол эх сурвалж
- [x] AI орчуулга (4 fallback chain + post-processing)
- [x] Бүтэцтэй орчуулга (TITLE, SUMMARY, KEY_POINTS, MONGOLIA_IMPACT)
- [x] On-demand content татах (detail хуудас дарахад)
- [x] Autocomplete хайлт (title + summary + ai_summary)
- [x] 8 категорийн ангилал (weight-based keyword matching)
- [x] Хэрэглэгчийн бүртгэл/нэвтрэлт (JWT)
- [x] Хавчуурга
- [x] Push notifications (VAPID)
- [x] Админ панел (stats, ads, analytics, fetch)
- [x] Dark mode
- [x] Responsive design (mobile-first)
- [x] SEO (Open Graph, Twitter Card, sitemap.xml, robots.txt)
- [x] RSS feed export
- [x] Analytics dashboard
- [x] Зар сурталчилгааны систем (4 байрлал)
- [x] Docker Compose deployment (PostgreSQL + Nginx)
- [x] Auto-scheduler (1 цагийн fetch + 30 мин batch translate)
- [x] Startup auto-fetch (сервер асмагц шууд мэдээ татна)

### Тохиргоо шаардлагатай
- [ ] YouTube video (channel ID шинэчлэх)
- [ ] VPS deploy (domain + SSL)
- [ ] Email verification

---

## Эхлүүлэх

### Хөгжүүлэлт (Localhost)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # API key-ээ оруул
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Production (Docker Compose)

```bash
# .env файл бэлтгэх
cp .env.example .env
# ANTHROPIC_API_KEY, SECRET_KEY, POSTGRES_PASSWORD оруул

# Build + Start
docker compose up -d --build

# Хуучин SQLite өгөгдөл шилжүүлэх (хэрэв байвал)
docker compose exec backend python migrate_to_postgres.py

# Хандах
http://localhost        # Nginx → Frontend
http://localhost/api/   # Nginx → Backend
```

---

## Environment Variables

| Variable | Шаардлагатай | Тайлбар |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Тийм | Claude AI орчуулга |
| `SECRET_KEY` | Тийм | JWT token |
| `ADMIN_USERNAME` | Тийм | Админ нэр |
| `ADMIN_PASSWORD_HASH` | Тийм | bcrypt hash |
| `GROQ_API_KEY` | Үгүй | Groq Llama (үнэгүй tier) |
| `GEMINI_API_KEY` | Үгүй | Google Gemini (үнэгүй tier) |
| `POSTGRES_PASSWORD` | Docker | PostgreSQL нууц үг |
| `VAPID_PUBLIC_KEY` | Үгүй | Push notification |
| `VAPID_PRIVATE_KEY` | Үгүй | Push notification |
| `SITE_URL` | Үгүй | Production domain |

---

## Commit түүх (63 commits)

Төслийн хөгжлийн үе шатууд:

1. **MVP** — FastAPI + Next.js, RSS feed, AI summary
2. **Эх сурвалж нэмэх** — 38+ олон улсын + Монгол сурвалж
3. **UI/UX** — BBC/Reuters загвар, responsive, dark mode, gallery
4. **Орчуулга сайжруулалт** — Structured prompt, Groq/Gemini fallback, post-processing
5. **Auth + Features** — JWT, bookmarks, push, ads, analytics, RSS export
6. **Security** — CSP headers, rate limiting, CORS, bcrypt
7. **Deployment** — Docker Compose, PostgreSQL, Nginx, startup fetch
8. **Найдвартай байдал** — Encoding fix, retry logic, per-article commit, logging

---

*Built with Claude Code*
