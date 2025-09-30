from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set

router = APIRouter()
rooms: Dict[str, Set[WebSocket]] = {}

@router.websocket("/ws")
async def ws_endpoint(ws: WebSocket, project_id: str):
  await ws.accept()
  room = rooms.setdefault(project_id, set())
  room.add(ws)
  try:
    while True:
      # we echo pings from client; server mainly broadcasts on change
      await ws.receive_text()
  except WebSocketDisconnect:
    room.remove(ws)

async def broadcast(project_id: str, event: str, payload: dict):
  for ws in list(rooms.get(project_id, [])):
    try:
      await ws.send_json({"event": event, "payload": payload})
    except Exception:
      rooms[project_id].discard(ws)
