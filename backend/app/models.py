from pydantic import BaseModel
from typing import List, Dict, Optional

class WebsiteRequest(BaseModel):
    prompt: str

class PageEditRequest(BaseModel):
    page: str
    edit_prompt: str
    html: str

class WebsiteResponse(BaseModel):
    pages: Dict[str, str]  # {page_name: html}

class EditResponse(BaseModel):
    html: str