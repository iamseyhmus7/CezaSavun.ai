from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case, extract
from datetime import datetime

from app.db.session import get_db
from app.db.tables.petition import Petition
from app.db.tables.penalty import Penalty
from app.db.tables.user import User
from app.api.v1.deps import get_admin_user

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Platform genelinde istatistikleri döndürür."""

    # Toplam dilekçe
    total_result = await db.execute(select(func.count(Petition.id)))
    total_petitions = total_result.scalar() or 0

    # Toplam kullanıcı
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar() or 0

    # Ortalama kalite skoru
    avg_result = await db.execute(
        select(func.avg(Petition.quality_score)).where(Petition.quality_score.isnot(None))
    )
    avg_score = round(avg_result.scalar() or 0, 1)

    # Onay/red dağılımı
    approved_result = await db.execute(
        select(func.count(Petition.id)).where(Petition.status == "approved")
    )
    approved_count = approved_result.scalar() or 0

    failed_result = await db.execute(
        select(func.count(Petition.id)).where(Petition.status == "failed")
    )
    failed_count = failed_result.scalar() or 0

    generating_result = await db.execute(
        select(func.count(Petition.id)).where(Petition.status == "generating")
    )
    generating_count = generating_result.scalar() or 0

    approval_rate = round((approved_count / total_petitions * 100), 1) if total_petitions > 0 else 0

    # Kategori dağılımı
    cat_result = await db.execute(
        select(Penalty.category, func.count(Penalty.id))
        .group_by(Penalty.category)
    )
    category_distribution = {row[0]: row[1] for row in cat_result.all()}

    # Aylık dilekçe sayısı (son 6 ay)
    monthly_result = await db.execute(
        select(
            func.to_char(Petition.created_at, 'YYYY-MM').label("month"),
            func.count(Petition.id).label("count")
        )
        .group_by("month")
        .order_by("month")
        .limit(12)
    )
    monthly_petitions = [{"month": row[0], "count": row[1]} for row in monthly_result.all()]

    # Son 5 dilekçe
    recent_result = await db.execute(
        select(Petition, Penalty)
        .join(Penalty, Petition.penalty_id == Penalty.id)
        .order_by(Petition.created_at.desc())
        .limit(5)
    )
    recent_petitions = []
    for petition, penalty in recent_result.all():
        recent_petitions.append({
            "id": str(petition.id),
            "client_name": petition.client_name or "—",
            "vehicle_plate": penalty.vehicle_plate or "—",
            "category": penalty.category or "diger",
            "quality_score": petition.quality_score,
            "status": petition.status,
            "created_at": str(petition.created_at) if petition.created_at else None,
        })

    return {
        "total_petitions": total_petitions,
        "total_users": total_users,
        "average_quality_score": avg_score,
        "approved_count": approved_count,
        "failed_count": failed_count,
        "generating_count": generating_count,
        "approval_rate": approval_rate,
        "category_distribution": category_distribution,
        "monthly_petitions": monthly_petitions,
        "recent_petitions": recent_petitions,
    }
