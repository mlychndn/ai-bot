from mangum import Mangum
from main import app

# Mangum adapter converts API Gateway events to ASGI
handler = Mangum(app, lifespan='off')