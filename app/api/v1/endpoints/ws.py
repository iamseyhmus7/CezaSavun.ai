import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as redis
from app.config import settings

router = APIRouter()

@router.websocket("/petition/{petition_id}")
async def websocket_petition_endpoint(websocket: WebSocket, petition_id: str):
    await websocket.accept()
    
    # Async Redis client for pubsub
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = redis_client.pubsub()
    channel = f"petition_{petition_id}"
    
    try:
        await pubsub.subscribe(channel)
        print(f"[WebSocket] Connected. Listening to {channel}")
        
        while True:
            # Poll for messages
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message:
                data = message["data"]
                # data is expected to be JSON string from tasks.py publish_event
                await websocket.send_text(data)
                
                # if completed or failed, close the loop
                parsed = json.loads(data)
                if parsed.get("status") in ["completed", "failed"]:
                    print(f"[WebSocket] Status '{parsed.get('status')}' received. Closing connection.")
                    break
            else:
                # Add a tiny sleep to yield control
                await asyncio.sleep(0.1)

    except WebSocketDisconnect:
        print(f"[WebSocket] Client disconnected from {channel}")
    except Exception as e:
        print(f"[WebSocket] Error on {channel}: {e}")
    finally:
        await pubsub.unsubscribe(channel)
        await redis_client.close()
        try:
            await websocket.close()
        except:
            pass
