from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import incidents, simulator, actions
from app.db.models import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpsPilot Backend API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(actions.router, prefix="/api/actions", tags=["Actions"])
app.include_router(simulator.router, prefix="/api/simulator", tags=["Simulator"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
