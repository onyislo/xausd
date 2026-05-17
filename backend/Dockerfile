# Use the official Python image
FROM python:3.9

# Set the working directory
WORKDIR /code

# Copy requirements and install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Create a non-root user (Hugging Face requirement)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory for the user
WORKDIR $HOME/app

# Copy the application code
COPY --chown=user . $HOME/app

# Expose the port FastAPI will run on
EXPOSE 7860

# Start the application
CMD ["python", "main.py"]
