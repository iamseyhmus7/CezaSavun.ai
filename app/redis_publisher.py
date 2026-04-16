import json
import redis
from app.config import settings

# Redis client for publishing WS events internally
try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except BaseException:
    redis_client = None

def publish_event(petition_id: str, phase: int, status: str, message: str, is_processing: bool):
    """Helper to broadcast via Redis PubSub to WebSocket listeners."""
    if not redis_client:
        return
    try:
        payload = {
            "petition_id": petition_id,
            "phase": phase,
            "status": status,
            "message": message,
            "is_processing": is_processing
        }
        redis_client.publish(f"petition_{petition_id}", json.dumps(payload))
    except Exception as e:
        print(f"[Redis Publish] Hata: {e}")
