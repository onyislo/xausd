---
title: Xaus AI Backend
emoji: 🤖
colorFrom: yellow
colorTo: orange
sdk: docker
pinned: false
---

# 🤖 XAUSD AI Intel Core — Backend

> A specialized AI market analyst for XAU/USD (Gold), powered by Google Gemini and deployed on Hugging Face Spaces.

This is the Python/FastAPI backend that powers the **AI Intel Core** assistant inside the XAUSD trading terminal. It receives chat messages from the frontend, generates professional gold market analysis using Gemini AI, and saves the AI's responses back to Supabase in real-time.

---

## 🏗️ Architecture

```
Next.js Frontend (Vercel)
        │
        │  POST /ai/chat
        ▼
FastAPI Backend (Hugging Face Spaces)
        │
        ├──► Google Gemini 1.5 Flash  (generates AI response)
        │
        └──► Supabase (saves AI message to messages table)
```

---

## 🚀 API Endpoints

### `POST /ai/chat`
Sends a conversation history and gets back an AI-generated gold market analysis.

**Request Body:**
```json
{
  "channel_id": "uuid-of-channel",
  "user_id": "uuid-of-user",
  "messages": [
    { "role": "user", "content": "What is gold doing today?" }
  ]
}
```

**Response:**
```json
{
  "response": "Gold is currently trading near key resistance at $2,380..."
}
```

---

### `GET /health`
Health check to confirm the backend is running and services are connected.

**Response:**
```json
{
  "status": "ok",
  "gemini_active": true,
  "supabase_active": true
}
```

---

## ⚙️ Environment Variables

Set these in your Hugging Face Space **Settings → Variables and Secrets** tab:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (not the anon key!) |

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create a .env file with your keys
echo "GEMINI_API_KEY=your_key_here" >> .env
echo "NEXT_PUBLIC_SUPABASE_URL=your_url_here" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" >> .env

# 3. Run the server
python main.py
```

The server will start at `http://localhost:7860`

---

## 📦 Deploying to Hugging Face

From the main project repository, run:

```bash
bash deploy_to_hf.sh
```

This script pushes **only** the backend files to Hugging Face, skipping all frontend assets.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | Python web framework |
| **Google Gemini 1.5 Flash** | AI response generation |
| **Supabase** | Database for storing messages |
| **Docker** | Containerization for HF Spaces |
| **Uvicorn** | ASGI server, runs on port 7860 |
