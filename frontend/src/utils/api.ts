import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const generateWebsite = async (prompt: string) => {
  const res = await axios.post(`${API_URL}/generate`, { prompt });
  return res.data.pages;
};

export const getPages = async () => {
  const res = await axios.get(`${API_URL}/pages`);
  return res.data.pages;
};

export const getPage = async (page: string) => {
  const res = await axios.get(`${API_URL}/page/${encodeURIComponent(page)}`);
  return res.data.html;
};

export const editPage = async (page: string, html: string, edit_prompt: string) => {
  const res = await axios.post(`${API_URL}/edit`, { page, html, edit_prompt });
  return res.data.html;
};