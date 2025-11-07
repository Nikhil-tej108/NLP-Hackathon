from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator
from typing import Dict, Set, Optional
import socketio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.IO instance FIRST
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Allow all origins
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Create FastAPI app
app = FastAPI()

# Add CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Data structures for WebRTC signaling
class RTCConnection:
    def __init__(self, sid: str):
        self.sid = sid
        self.target_language: Optional[str] = None
        self.room: Optional[str] = None

# Store active connections
connections: Dict[str, RTCConnection] = {}
rooms: Dict[str, Set[str]] = {}

class TranslationRequest(BaseModel):
    text: str
    target_lang: str

@app.post("/translate")
async def translate_text(req: TranslationRequest):
    try:
        result = GoogleTranslator(source='auto', target=req.target_lang).translate(req.text)
        return {
            "original_text": req.text,
            "target_lang": req.target_lang,
            "translated_text": result
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    """Handle new Socket.IO connections"""
    connections[sid] = RTCConnection(sid)
    logger.info(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
    """Handle Socket.IO disconnections"""
    if sid in connections:
        room = connections[sid].room
        if room and room in rooms:
            rooms[room].discard(sid)
            if len(rooms[room]) == 0:
                del rooms[room]
        del connections[sid]
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    """Handle room joining"""
    room = data.get('room')
    target_language = data.get('target_language', 'en')
    
    if not room:
        return
    
    if room not in rooms:
        rooms[room] = set()
    
    rooms[room].add(sid)
    connections[sid].room = room
    connections[sid].target_language = target_language
    
    # Notify others in the room
    for other_sid in rooms[room]:
        if other_sid != sid:
            await sio.emit('peer_joined', {'peer': sid}, room=other_sid)
    
    logger.info(f"Client {sid} joined room {room}")

@sio.event
async def relay_sdp(sid, data):
    """Relay WebRTC Session Description Protocol messages"""
    target = data.get('target')
    if target in connections:
        await sio.emit('sdp', {
            'sdp': data.get('sdp'),
            'source': sid
        }, room=target)

@sio.event
async def relay_ice(sid, data):
    """Relay WebRTC ICE candidates"""
    target = data.get('target')
    if target in connections:
        await sio.emit('ice', {
            'ice': data.get('ice'),
            'source': sid
        }, room=target)

@sio.event
async def translate_message(sid, data):
    """Handle real-time message translation"""
    try:
        text = data.get('text', '')
        room = connections[sid].room
        
        if not text or not room:
            return
        
        logger.info(f"Message from {sid}: {text}")
        
        # Get all participants in the room
        for participant_sid in rooms.get(room, []):
            # Get the target language for THIS specific participant
            participant_lang = connections[participant_sid].target_language or 'en'
            
            logger.info(f"Translating to {participant_lang} for {participant_sid}")
            
            # Translate to the participant's preferred language
            translated = GoogleTranslator(source='auto', target=participant_lang).translate(text)
            
            # Send the message translated to this participant's language
            await sio.emit('translated_message', {
                'original': text,
                'translated': translated,
                'source': sid,
                'target_lang': participant_lang,
                'is_sender': sid == participant_sid
            }, room=participant_sid)
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        await sio.emit('error', {'message': 'Translation failed'}, room=sid)

# Create combined ASGI app
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path='socket.io'
)

# Export the socket_app as the main app
app = socket_app