from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

print("🔥 BACKEND FINAL FUNCIONANDO 🔥")

# 🔓 CORS para que Netlify pueda hacer requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 💣 Base de datos nueva (para evitar basura vieja)
conn = sqlite3.connect("db_final.db", check_same_thread=False)
cursor = conn.cursor()

# 📦 Tabla correcta
cursor.execute("""
CREATE TABLE IF NOT EXISTS puntos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL,
    lng REAL,
    tipo TEXT,
    descripcion TEXT,
    rating INTEGER
)
""")

# 📥 Modelo
class Punto(BaseModel):
    lat: float
    lng: float
    tipo: str
    descripcion: str
    rating: int

# 📤 GET (AQUÍ estaba el bug antes)
@app.get("/puntos")
def obtener_puntos():
    cursor.execute("SELECT lat, lng, tipo, descripcion, rating FROM puntos")
    filas = cursor.fetchall()

    return [
        {
            "lat": row[0],
            "lng": row[1],
            "tipo": row[2],
            "descripcion": row[3],
            "rating": row[4]
        }
        for row in filas
    ]

# 📥 POST
@app.post("/puntos")
def agregar_punto(p: Punto):
    print("RECIBIDO:", p)

    cursor.execute(
        "INSERT INTO puntos (lat, lng, tipo, descripcion, rating) VALUES (?, ?, ?, ?, ?)",
        (p.lat, p.lng, p.tipo, p.descripcion, p.rating)
    )
    conn.commit()

    return {"ok": True}