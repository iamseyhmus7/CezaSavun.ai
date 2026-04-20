from app.db.base import Base
from app.db.tables.user import User
from app.db.tables.penalty import Penalty
from app.db.tables.petition import Petition
from app.db.tables.notification import Notification

# Bu dosya, alembic veya Base.metadata.create_all() çağrıldığında
# tüm modellerin memory'ye yüklenmesi için kullanılır.
