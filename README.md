# News Aggregator MVP

AI-р ажилладаг мэдээний агрегатор. FastAPI (backend) + Next.js (frontend).

## Бүтэц

```
news-aggregator/
├── backend/          # FastAPI API сервер
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── config.py        # Тохиргоо
│   │   ├── database.py      # SQLite DB
│   │   ├── models/          # Өгөгдлийн загварууд
│   │   ├── routers/         # API endpoints
│   │   └── services/        # Scraper, AI хураангуй
│   └── requirements.txt
├── frontend/         # Next.js UI
│   └── src/
│       ├── app/             # Pages (App Router)
│       ├── components/      # UI компонентууд
│       └── lib/             # API helper
└── README.md
```

## Эхлүүлэх

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # API key-ээ оруул
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

## API Endpoints

| Method | URL | Тайлбар |
|--------|-----|---------|
| GET | `/api/articles` | Мэдээнүүдийн жагсаалт (search, category filter) |
| GET | `/api/articles/{id}` | Нэг мэдээний дэлгэрэнгүй |
| POST | `/api/articles/fetch` | RSS feed-ээс шинэ мэдээ татах |

## Технологи

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, feedparser
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **AI**: Claude API (мэдээний хураангуй)
