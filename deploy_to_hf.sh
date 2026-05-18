#!/bin/bash
# This script pushes ONLY the backend files to Hugging Face
# Run: bash deploy_to_hf.sh

set -e

HF_URL="https://huggingface.co/spaces/Onyiso/Xaus-ai-backend"

echo "📦 Backing up backend files..."
cp main.py /tmp/hf_main.py
cp app.py /tmp/hf_app.py
cp Dockerfile /tmp/hf_Dockerfile
cp requirements.txt /tmp/hf_requirements.txt
cp README.md /tmp/hf_README.md

echo "🌿 Creating isolated deploy branch..."
git checkout --orphan hf-deploy
git rm -rf . --quiet

echo "📂 Restoring only backend files..."
cp /tmp/hf_main.py main.py
cp /tmp/hf_app.py app.py
cp /tmp/hf_Dockerfile Dockerfile
cp /tmp/hf_requirements.txt requirements.txt
cp /tmp/hf_README.md README.md

echo "💾 Committing backend-only snapshot..."
git add main.py app.py Dockerfile requirements.txt README.md
git commit -m "Deploy: AI backend to Hugging Face"

echo "🚀 Pushing to Hugging Face (you will be asked for credentials)..."
git push "$HF_URL" hf-deploy:main --force

echo "🔙 Switching back to main branch..."
git checkout main
git branch -D hf-deploy

echo "✅ Done! Your backend is live on Hugging Face."
