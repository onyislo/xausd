import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="XAUSD AI Backend")

# Enable CORS for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None

# Initialize Supabase client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY else None

# FORCE THE CORRECT ID HERE
AI_SYSTEM_ID = "14a09105-4817-44a5-afae-f2fc26441d13"
print(f"DEBUG: AI_SYSTEM_ID is set to {AI_SYSTEM_ID}")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    channel_id: str
    user_id: str
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str

async def generate_ai_response(messages: List[Message]):
    """
    Generates a response using Google's Gemini API.
    """
    if not gemini_client:
        return "Gemini API key not configured. Please check backend environment variables."

    try:
        # Prepare history for Gemini
        contents = []
        for msg in messages:
            role = "user" if msg.role == "user" else "model"
            contents.append(
                types.Content(role=role, parts=[types.Part.from_text(text=msg.content)])
            )
        
        system_prompt = (
            "You are the AI Intel Core, a specialized market analyst for XAU/USD (Gold). "
            "Provide professional, concise technical and fundamental analysis. "
            "Focus on price levels, institutional flow, and geopolitical impact. "
            "Current context: Gold trading terminal."
        )
        
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "I'm having trouble processing that right now. Please check my connectivity."

async def save_ai_message(channel_id: str, content: str):
    """Saves the AI's response back to Supabase."""
    if not supabase:
        print("Supabase client not initialized")
        return

    try:
        data = {
            "channel_id": channel_id,
            "user_id": AI_SYSTEM_ID,
            "content": content
        }
        supabase.table("messages").insert(data).execute()
    except Exception as e:
        print(f"Error saving AI message: {e}")

@app.post("/ai/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks):
    try:
        # 1. Generate response from Gemini
        ai_text = await generate_ai_response(request.messages)
        
        # 2. Save response to Supabase in background
        background_tasks.add_task(save_ai_message, request.channel_id, ai_text)
        
        return ChatResponse(response=ai_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "gemini_active": gemini_client is not None, "supabase_active": supabase is not None}

if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces uses port 7860 by default
    uvicorn.run(app, host="0.0.0.0", port=7860)
