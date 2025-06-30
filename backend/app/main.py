from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import WebsiteRequest, WebsiteResponse, PageEditRequest, EditResponse
from .ai import generate_website, edit_page_with_ai

app = FastAPI()

# In-memory storage for generated sites
websites = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate", response_model=WebsiteResponse)
def generate_site(req: WebsiteRequest):
    pages = generate_website(req.prompt)
    websites["current"] = pages
    return WebsiteResponse(pages=pages)

@app.get("/pages", response_model=WebsiteResponse)
def get_pages():
    pages = websites.get("current", {})
    return WebsiteResponse(pages=pages)

@app.get("/page/{page_name}")
def get_page(page_name: str):
    pages = websites.get("current", {})
    html = pages.get(page_name)
    if not html:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"html": html}

@app.post("/edit", response_model=EditResponse)
def edit_page(req: PageEditRequest):
    new_html = edit_page_with_ai(req.page, req.html, req.edit_prompt)
    # Update in-memory
    if "current" in websites and req.page in websites["current"]:
        websites["current"][req.page] = new_html
    return EditResponse(html=new_html)