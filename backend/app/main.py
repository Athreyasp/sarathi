from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import incidents, simulator, actions
from app.db.models import engine, Base
import logging

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sarathi SIEM Backend API")


# Configure CORS for all origins and local dev servers
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Global Exception Handler ensures CORS headers are returned even on 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(actions.router, prefix="/api/actions", tags=["Actions"])
app.include_router(simulator.router, prefix="/api/simulator", tags=["Simulator"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
