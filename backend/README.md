# Morph Canvas Backend

FastAPI backend service for Morph Canvas, providing image processing capabilities including background removal and tinting.

## Features

- Background removal using rembg (U²-Net)
- Image tinting
- RESTful API with FastAPI
- Proper Python packaging
- Development tools configuration (black, isort, mypy, pytest)

## Installation

1. **Prerequisites**
   - Python 3.9 or higher
   - [uv](https://github.com/astral-sh/uv) - A fast Python package installer and resolver

2. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/morph-canvas.git
   cd morph-canvas/backend
   ```

3. **Set up the project**
   ```bash
   # Install dependencies using uv
   uv pip install -e ".[dev]"
   
   # Or for production (without dev dependencies)
   # uv pip install -e .
   ```

4. **Sync the virtual environment** (optional, if you want to use a virtualenv with uv)
   ```bash
   # Create a virtual environment
   uv venv
   
   # Activate the virtual environment
   # On Windows:
   .venv\Scripts\activate
   # On Unix/macOS:
   source .venv/bin/activate
   
   # Install dependencies
   uv pip install -e ".[dev]"
   ```

## Running the Server

```bash
uvicorn morph_canvas_backend.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /health`: Health check endpoint
- `POST /remove-background`: Remove background from an image
- `POST /tint`: Apply tint to an image

## Development

### Code Style

We use:
- Black for code formatting
- isort for import sorting
- mypy for type checking

Run the following commands before committing:

```bash
black .
isort .
mypy .
```

### Testing

Run tests with:

```bash
pytest --cov=morph_canvas_backend tests/
```

## License

MIT
