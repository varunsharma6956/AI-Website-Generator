import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PromptInput from "../components/PromptInput";
import PageList from "../components/PageList";
import PreviewPane from "../components/PreviewPane";
import Editor from "../components/Editor";
import { generateWebsite, getPages, getPage, editPage } from "../utils/api";

type Pages = { [key: string]: string };

// Utility to normalize page names
function normalizePageName(name: string): string {
  return name.replace(/\.html$/i, '').replace(/^[\/]+/, '').replace(/\/.*$/, '').replace(/\s+/g, '').replace(/^(.)/, (c) => c.toUpperCase());
}

// Utility to normalize HTML links
function normalizeHtmlLinks(html: string): string {
  return html.replace(/href=\"([A-Za-z0-9]+)\.html\"/g, 'href="/$1"');
}

const DynamicPage: React.FC = () => {
  const router = useRouter();
  const { page } = router.query;
  const [pages, setPages] = useState<Pages>({});
  const [selected, setSelected] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editHtml, setEditHtml] = useState("");
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiEditLoading, setAiEditLoading] = useState(false);

  // Generate website
  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    try {
      const newPages = await generateWebsite(prompt);
      // Normalize page names and HTML
      const normalizedPages: Pages = {};
      Object.entries(newPages).forEach(([key, value]) => {
        const normKey = normalizePageName(String(key));
        normalizedPages[normKey] = normalizeHtmlLinks(String(value));
      });
      setPages(normalizedPages);
      const firstPage = Object.keys(normalizedPages)[0];
      setSelected(firstPage);
      router.push(`/${firstPage}`);
    } catch (error) {
      console.error("Failed to generate website:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load pages on mount
  useEffect(() => {
    getPages().then(pages => {
      // Normalize page names and HTML
      const normalizedPages: Pages = {};
      Object.entries(pages).forEach(([key, value]) => {
        const normKey = normalizePageName(String(key));
        normalizedPages[normKey] = normalizeHtmlLinks(String(value));
      });
      setPages(normalizedPages);
    });
  }, []);

  // Sync selected page with URL - only when page query changes
  useEffect(() => {
    if (page && typeof page === "string") {
      const normalizedPage = normalizePageName(page);
      setSelected(normalizedPage);
    }
  }, [page]);

  // Load preview when selected changes
  useEffect(() => {
    if (selected) {
      getPage(selected)
        .then(html => setPreviewHtml(normalizeHtmlLinks(String(html))))
        .catch(() => {
          const newPages = { ...pages };
          delete newPages[selected];
          setPages(newPages);
          setPreviewHtml('<div style="color: red; text-align: center; margin-top: 40px;">This page was not found or was removed after editing.</div>');
        });
    }
  }, [selected]);

  // Visual edit (bonus)
  const handleSaveEdit = async (newHtml: string) => {
    setPages({ ...pages, [selected]: newHtml });
    setPreviewHtml(newHtml);
    setShowEditor(false);
  };

  // AI edit (bonus)
  const handleAiEdit = async () => {
    setAiEditLoading(true);
    const promptLower = aiEditPrompt.toLowerCase();
    const pageNames = Object.keys(pages);
    let updatedPages = { ...pages };
    let pagesToEdit: string[] = [];
    if (promptLower.includes('all pages')) {
      pagesToEdit = pageNames;
    } else {
      pagesToEdit = pageNames.filter(p => promptLower.includes(p.toLowerCase()));
      if (pagesToEdit.length === 0) pagesToEdit = [selected];
    }
    for (const page of pagesToEdit) {
      const newHtml = await editPage(page, pages[page], aiEditPrompt);
      updatedPages[page] = newHtml;
      if (page === selected) setPreviewHtml(newHtml);
    }
    setPages(updatedPages);
    setAiEditPrompt("");
    setAiEditLoading(false);
  };

  // Add handler for WYSIWYG edit and navigation
  const handleWysiwygEdit = (selector: string, payload: string) => {
    if (selector === 'wysiwyg') {
      setPages({ ...pages, [selected]: normalizeHtmlLinks(payload) });
      setPreviewHtml(normalizeHtmlLinks(payload));
    } else if (selector === 'navigate') {
      const pageNames = Object.keys(pages);
      // Normalize both payload and page names for robust matching
      const normalizedPayload = normalizePageName(payload).replace(/\s+/g, '').toLowerCase();
      const target = pageNames.find(
        p => normalizePageName(p).replace(/\s+/g, '').toLowerCase() === normalizedPayload
      );
      if (target) {
        setSelected(target);
        setPreviewHtml(pages[target]);
        router.push(`/${target}`); // Always update the route
      }
    }
  };

  // Handle page selection from sidebar
  const handlePageSelect = (pageName: string) => {
    setSelected(pageName);
    router.push(`/${pageName}`);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 style={{ color: "#00fff7", marginBottom: 8 }}>AI Website Generator</h2>
        <PromptInput onSubmit={handleGenerate} loading={loading} />
        <PageList
          pages={Object.keys(pages)}
          selected={selected}
          onSelect={handlePageSelect}
        />
      </div>
      <div className="main-content">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <h2 style={{ flex: 1 }}>{selected || "Preview"}</h2>
          <button onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? "Close Editor" : "Visual Edit"}
          </button>
        </div>
        <div style={{ margin: "12px 0" }}>
          <input
            type="text"
            placeholder="AI edit prompt (e.g. 'Make background white')"
            value={aiEditPrompt}
            onChange={e => setAiEditPrompt(e.target.value)}
            style={{ width: 320, marginRight: 8 }}
            disabled={aiEditLoading}
          />
          <button onClick={handleAiEdit} disabled={aiEditLoading || !aiEditPrompt}>
            {aiEditLoading ? "Editing..." : "AI Edit"}
          </button>
        </div>
        {Object.keys(pages).length === 0 ? (
          <div style={{ color: "#aaa", fontSize: "1.2rem", marginTop: 40, textAlign: "center" }}>
            <p>Describe your website and click <b>Generate</b> to get started!</p>
          </div>
        ) : showEditor ? (
          <Editor html={previewHtml} onSave={handleSaveEdit} />
        ) : (
          <PreviewPane html={previewHtml} onElementClick={handleWysiwygEdit} />
        )}
      </div>
    </div>
  );
};

export default DynamicPage; 
