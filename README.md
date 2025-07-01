# 🚀 AI Website Generator MVP

A powerful AI-powered website generator that creates beautiful, modern websites from simple text descriptions. Built with Next.js frontend and FastAPI backend, featuring visual editing capabilities and AI-powered modifications.

## ✨ Features

### ✅ Core Features (Completed)
- **AI-Powered Website Generation**: Describe your website and get a complete multi-page site generated
- **Multi-Page Support**: Generate websites with multiple pages (Home, About, Contact, etc.)
- **Live Preview**: See your generated website in real-time
- **Page Management**: Navigate between different pages like a CMS
- **Modern UI**: Beautiful, transparent, futuristic design

### 🎯 Bonus Features (Completed)
- **Visual Editor**: Click and edit any element on the page
- **AI-Powered Edits**: Make changes using natural language prompts
- **WYSIWYG Editing**: Double-click text elements to edit them directly
- **Real-time Updates**: Changes reflect immediately in the preview




Code Walkthrough: Step by Step --
----------------------------------------

Frontend
-----------
1) PromptInput.tsx: Input for website description, triggers generation.
2) PageList.tsx: Sidebar list of pages, click to select.
3) PreviewPane.tsx: Shows HTML preview in iframe, rewrites internal links, handles WYSIWYG editing and navigation.
4) Editor.tsx: Full HTML editor for advanced editing.
5) index.tsx/[page].tsx: Main logic for state, API calls, page selection, AI edits, and handling navigation events from the preview.



Backend
---------------
main.py: FastAPI endpoints for /generate, /pages, /page/{page_name}, /edit.
ai.py: Handles OpenAI prompt engineering for both generation and AI-powered edits.
models.py: Pydantic models for request/response validation.
requirements.txt: All dependencies listed.


## 🏗️ Architecture

```
ai-website-generator/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py         # API endpoints
│   │   ├── ai.py           # OpenAI integration
│   │   └── models.py       # Data models
│   └── requirements.txt    # Python dependencies
└── frontend/               # Next.js React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Next.js pages
    │   ├── utils/          # API utilities
    │   └── styles/         # CSS styles
    └── package.json        # Node.js dependencies
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI API**: GPT-3.5-turbo or other versions for website generation
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server

### Frontend
- **Next.js**: React framework
- **TypeScript**: Type-safe JavaScript
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with gradients and animations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **OpenAI API Key** (Get one from [OpenAI Platform](https://platform.openai.com/))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ai-website-generator
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🎯 How to Use

1. **Generate a Website**
   - Open the application in your browser
   - Type a description like: *"I want a website for a mindfulness coach with 3 pages: Home, About, Contact"*
   - Click **Generate** and wait for your website to be created

2. **Navigate Between Pages**
   - Use the page list on the left sidebar to switch between pages
   - Click any page name to view its preview

3. **Edit Your Website**
   - **Visual Editor**: Click the "Visual Edit" button to edit HTML directly
   - **AI Edits**: Type commands like "Make the background white" and click "AI Edit"
   - **WYSIWYG**: Double-click any text element to edit it directly



#### API Endpoints

```bash
# Generate a website
POST /generate
{
  "prompt": "Create a website for a coffee shop"
}

# Get all pages
GET /pages

# Get specific page
GET /page/{page_name}

# Edit a page with AI
POST /edit
{
  "page": "Home",
  "html": "<html>...</html>",
  "edit_prompt": "Make the background blue"
}
```

#### Environment Variables

**Backend (.env file)**
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Frontend (.env.local file)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎨 Features in Detail

### AI Website Generation
- Uses GPT-3.5-turbo to generate complete HTML/CSS websites
- Creates modern, responsive designs with transparent/futuristic styling
- Supports multiple pages with navigation between them

### Visual Editing
- **Code Editor**: Full HTML editing with syntax highlighting
- **WYSIWYG**: Double-click text elements to edit them inline
- **Real-time Preview**: See changes immediately in the preview pane

### AI-Powered Modifications
- Natural language editing: "Make the header blue"
- Multi-page editing: "Update all pages with a new color scheme"
- Intelligent parsing of edit instructions

### Page Management
- CMS-like interface for managing multiple pages
- Easy navigation between pages
- Persistent storage of generated content

## 🔧 Development

### Project Structure
```
backend/app/
├── main.py          # FastAPI application and routes
├── ai.py            # OpenAI integration and prompt engineering
└── models.py        # Pydantic models for API requests/responses

frontend/src/
├── components/      # Reusable React components
│   ├── Editor.tsx   # HTML code editor
│   ├── PageList.tsx # Page navigation component
│   └── PreviewPane.tsx # Website preview iframe
├── pages/           # Next.js pages
├── utils/           # API utilities and helpers
└── styles/          # Global CSS styles
```

### Key Components

#### Backend
- **FastAPI**: RESTful API with automatic documentation
- **OpenAI Integration**: Intelligent website generation and editing
- **CORS Support**: Cross-origin requests for development
- **In-Memory Storage**: Temporary storage of generated websites

#### Frontend
- **Next.js**: Server-side rendering and routing
- **TypeScript**: Type safety and better development experience
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live preview of all changes

## 🚀 Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key_here

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```


## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure Python virtual environment is activated
   - Check that all dependencies are installed
   - Verify OpenAI API key is set correctly

2. **Frontend can't connect to backend**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify API_URL in frontend environment

3. **AI generation fails**
   - Check OpenAI API key validity
   - Ensure sufficient API credits
   - Verify internet connection

### Debug Mode
```bash
# Backend with debug logging
uvicorn app.main:app --reload --log-level debug

# Frontend with development tools
npm run dev
```


## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- FastAPI for the excellent Python web framework
- Next.js team for the React framework
- The open-source community for various dependencies

---
