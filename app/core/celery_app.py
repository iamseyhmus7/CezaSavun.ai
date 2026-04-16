import asyncio
import functools
from celery import Celery
from app.config import settings

celery_app = Celery(
    "traffic_defense_ai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.agents.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Istanbul",
    enable_utc=True,
    task_track_started=True,
)

# Yardımcı: Celery asenkron görevleri senktron context içinde çalıştırmak içindir
def async_to_sync(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return asyncio.run(func(*args, **kwargs))
    return wrapper
