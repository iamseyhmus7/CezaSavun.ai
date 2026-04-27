import pytest
import asyncio
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.tables.user import User
from app.db.tables.penalty import Penalty

# CATEGORY: integration

@pytest.mark.asyncio
async def test_user_email_unique_constraint(db_session):
    """Scenario: Mükerrer email kaydı denemesi. Expected: IntegrityError."""
    # Arrange
    email = "conflict@test.com"
    # Zorunlu alanlar (name, surname, phone) eklendi
    db_session.add(User(email=email, hashed_password="h", name="Test", surname="User", phone="5550000000"))
    await db_session.commit()

    # Act & Assert
    db_session.add(User(email=email, hashed_password="h", name="Test", surname="User", phone="5550000000"))
    with pytest.raises(IntegrityError):
        await db_session.commit()

@pytest.mark.asyncio
async def test_cascade_delete_user_removes_penalties(db_session):
    """Scenario: User silinince bağlı Penalty kayıtları silinmeli."""
    # Arrange
    user = User(email="cascade@test.com", hashed_password="h", name="Test", surname="User", phone="5550000000")
    db_session.add(user)
    await db_session.flush() 

    db_session.add(Penalty(user_id=user.id, category="hiz_ihlali", amount=500))
    await db_session.commit()

    # Act
    await db_session.delete(user)
    await db_session.commit()

    # Assert
    res = await db_session.execute(select(Penalty).where(Penalty.user_id == user.id))
    assert res.scalars().first() is None

@pytest.mark.asyncio
async def test_concurrent_unique_email_insert(db_engine):
    """
    Scenario: İki farklı bağlantı üzerinden aynı anda insert. 
    Expected: Gerçek race condition testi için bağımsız sessionlar kullanılmalı.
    """
    # Arrange
    email = "race_expert@test.com"
    
    async def task():
        async with AsyncSession(db_engine, expire_on_commit=False) as session:
            try:
                session.add(User(email=email, hashed_password="h", name="Test", surname="User", phone="5550000000"))
                await session.commit()
                return "SUCCESS"
            except IntegrityError:
                await session.rollback()
                return "FAIL"

    # Act
    results = await asyncio.gather(task(), task())
    
    # Assert
    assert "SUCCESS" in results
    assert "FAIL" in results
