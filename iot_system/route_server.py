"""HTTP API — serves GPX route waypoints for the EquipTrack backend / mobile map."""
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from routes import get_waypoints, list_routes

app = FastAPI(title="EquipTrack IoT Routes", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "iot-routes"}


@app.get("/routes")
def available_routes():
    return {"success": True, "routes": list_routes()}


@app.get("/routes/{route_name}")
def route_waypoints(route_name: str):
    waypoints = get_waypoints(route_name)
    if not waypoints:
        raise HTTPException(status_code=404, detail=f"Route not found: {route_name}")
    return {
        "success": True,
        "routeName": route_name,
        "count": len(waypoints),
        "waypoints": waypoints,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
