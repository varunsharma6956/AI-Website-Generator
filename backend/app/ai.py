import os
from dotenv import load_dotenv
import openai
import google.generativeai as genai
import json
import re

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use new OpenAI client
openai_client = openai.OpenAI(api_key=openai_api_key)

def extract_json(text):
    # Try to find the first {...} block
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return match.group(0)
    return None

def sanitize_html(html: str) -> str:
    # Remove triple backticks and code block language tags
    html = re.sub(r'```[a-zA-Z]*', '', html)
    html = re.sub(r'```', '', html)
    # Remove lines that look like filenames (e.g., **hihello.html**)
    html = re.sub(r'\*\*.*?\.html\*\*', '', html)
    # Remove stray backticks
    html = html.replace('`', '')
    return html.strip()

def generate_website(prompt: str) -> dict:
    system_prompt = (
        "You are a website generator AI. Given a description, generate a JSON object "
        "with page names as keys and HTML+CSS as values. Each page should be a complete HTML document. "
        "Use modern, transparent, futuristic UI styles. "
        "Respond ONLY with valid JSON, no explanations, no markdown, no code blocks, no filenames, no extra text. "
        "Do NOT use triple backticks, do NOT use ```html, do NOT use any markdown formatting, and do NOT include any filenames."
    )
    user_prompt = (
        f"Description: {prompt}\n"
        "Respond ONLY with JSON like this: {\"Home\": \"<html>...</html>\", \"About\": \"<html>...</html>\"}. "
        "Do NOT use markdown, code blocks, or filenames. Only pure JSON."
    )
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    content = response.choices[0].message.content
    try:
        json_str = extract_json(content)
        if json_str:
            pages = json.loads(json_str)
            # Sanitize all HTML values
            pages = {k: sanitize_html(v) for k, v in pages.items()}
        else:
            pages = {"Home": "<html><body>Error: No JSON found in AI response.</body></html>"}
    except Exception as e:
        pages = {"Home": f"<html><body>Error parsing AI response: {str(e)}</body></html>"}
    return pages

def edit_page_with_ai(page: str, html: str, edit_prompt: str) -> str:
    system_prompt = (
        "You are an expert web developer AI. Given a page's HTML and an edit instruction, "
        "return the full updated HTML. Use modern, transparent, futuristic UI styles. "
        "Do NOT use markdown, code blocks, or filenames. Only return pure HTML."
    )
    user_prompt = (
        f"Page: {page}\n"
        f"Edit instruction: {edit_prompt}\n"
        f"Current HTML:\n{html}\n"
        "Return only the full updated HTML. Do NOT use markdown, code blocks, or filenames. Only pure HTML."
    )
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    result = sanitize_html(response.choices[0].message.content.strip())
    if not result or len(result) < 20:
        return html  # fallback to old HTML if AI returns empty or too short
    return result