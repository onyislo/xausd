# XAUSD AI Backend (Hugging Face Spaces)

This backend powers the AI Assistant for the XAUSD terminal using Google's Gemini API and Supabase.

## Deployment to Hugging Face Spaces

1.  **Create a New Space**:
    *   Go to [huggingface.co/new-space](https://huggingface.co/new-space).
    *   Name: `xaust-ai-backend` (or your preferred name).
    *   SDK: **Docker**.
    *   Template: **Blank**.
2.  **Upload Files**:
    *   Upload all files from your `backend/` folder (`main.py`, `Dockerfile`, `requirements.txt`).
3.  **Set Environment Variables**:
    *   Go to the **Settings** tab of your Space.
    *   Add the following **Variables and Secrets**:
        *   `GEMINI_API_KEY`: Your Google Gemini API Key.
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
        *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Found in Project Settings > API).
4.  **Connect your Frontend**:
    *   Once the Space is "Running", copy the "App" URL (e.g., `https://username-space-name.hf.space`).
    *   Update your frontend `useChat.ts` hook to point to this URL.

## Local Testing
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The server will run on `http://localhost:7860`.
