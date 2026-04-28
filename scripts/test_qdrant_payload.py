import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.qdrant_client import get_qdrant_client
from app.config import settings

async def check():
    client = get_qdrant_client()
    
    # Koleksiyonlari listele
    cols = await client.get_collections()
    print("=== KOLEKSIYONLAR ===")
    for c in cols.collections:
        print("  - " + c.name)
    
    # legal_precedents detay
    info = await client.get_collection(settings.QDRANT_COLLECTION)
    print("")
    print("=== " + settings.QDRANT_COLLECTION + " ===")
    print("  Points count: " + str(info.points_count))
    print("  Vector size: " + str(info.config.params.vectors.size))
    
    # Ilk 3 kaydi payload ile getir
    scroll_result = await client.scroll(
        collection_name=settings.QDRANT_COLLECTION,
        limit=3,
        with_payload=True,
        with_vectors=False
    )
    points, _next = scroll_result
    print("")
    print("=== ILK 3 KAYIT ===")
    for p in points:
        payload = p.payload
        madde = payload.get("madde_no", "ALAN_YOK")
        ozet = str(payload.get("ozet", "ALAN_YOK"))[:150]
        args = payload.get("itiraz_argumanlari", "ALAN_YOK")
        keys = list(payload.keys())
        print("ID: " + str(p.id))
        print("  payload keys: " + str(keys))
        print("  madde_no: " + str(madde))
        print("  ozet: " + ozet)
        print("  itiraz_argumanlari: " + str(args)[:200])
        print("")
    
    await client.close()

asyncio.run(check())
