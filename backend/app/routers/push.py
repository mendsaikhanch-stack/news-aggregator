import json
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.push_subscription import PushSubscription
from app.config import settings

router = APIRouter(prefix="/api/push", tags=["push"])
limiter = Limiter(key_func=get_remote_address)


class SubscribeRequest(BaseModel):
    endpoint: str
    keys: dict  # {p256dh, auth}


@router.get("/vapid-key")
def get_vapid_key():
    """VAPID public key авах."""
    return {"publicKey": settings.VAPID_PUBLIC_KEY}


@router.post("/subscribe")
@limiter.limit("10/minute")
def subscribe(request: Request, data: SubscribeRequest, db: Session = Depends(get_db)):
    """Push notification-д бүртгүүлэх."""
    existing = db.query(PushSubscription).filter(
        PushSubscription.endpoint == data.endpoint
    ).first()
    if existing:
        existing.p256dh = data.keys.get("p256dh", "")
        existing.auth = data.keys.get("auth", "")
        db.commit()
        return {"message": "Шинэчлэгдлээ"}

    sub = PushSubscription(
        endpoint=data.endpoint,
        p256dh=data.keys.get("p256dh", ""),
        auth=data.keys.get("auth", ""),
    )
    db.add(sub)
    db.commit()
    return {"message": "Бүртгэгдлээ"}


@router.post("/unsubscribe")
def unsubscribe(data: SubscribeRequest, db: Session = Depends(get_db)):
    """Push notification-оос хасах."""
    sub = db.query(PushSubscription).filter(
        PushSubscription.endpoint == data.endpoint
    ).first()
    if sub:
        db.delete(sub)
        db.commit()
    return {"message": "Хасагдлаа"}


def send_push_notifications(db: Session, title: str, body: str, url: str = "/"):
    """Бүх бүртгэлтэй хэрэглэгчдэд push notification илгээх."""
    try:
        from pywebpush import webpush, WebPushException

        if not settings.VAPID_PRIVATE_KEY:
            return

        subscriptions = db.query(PushSubscription).all()
        payload = json.dumps({
            "title": title,
            "body": body,
            "url": url,
            "icon": "/icon-192.png",
        })

        for sub in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": sub.endpoint,
                        "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                    },
                    data=payload,
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": f"mailto:{settings.VAPID_EMAIL}"},
                )
            except WebPushException:
                # Subscription хүчингүй бол устгах
                db.delete(sub)
        db.commit()
    except Exception as e:
        print(f"[Push] Error: {e}")
