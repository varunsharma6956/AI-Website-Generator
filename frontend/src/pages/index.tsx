import React, { useEffect, useState } from "react";
import PromptInput from "../components/PromptInput";
import PageList from "../components/PageList";
import PreviewPane from "../components/PreviewPane";
import Editor from "../components/Editor";
import { generateWebsite, getPages, getPage, editPage } from "../utils/api";

type Pages = { [key: string]: string };

const Home: React.FC = () => {
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
    const newPages = await generateWebsite(prompt);
    setPages(newPages);
    const firstPage = Object.keys(newPages)[0];
    setSelected(firstPage);
    setLoading(false);
  };

  // Load pages on mount
  useEffect(() => {
    getPages().then(setPages);
  }, []);

  // Load preview when selected changes
  useEffect(() => {
    if (selected) {
      getPage(selected)
        .then(setPreviewHtml)
        .catch(() => {
          // If 404, remove from pages and show message
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
    // Detect if prompt is for all pages
    if (promptLower.includes('all pages')) {
      pagesToEdit = pageNames;
    } else {
      // Find all page names mentioned in the prompt
      pagesToEdit = pageNames.filter(p => promptLower.includes(p.toLowerCase()));
      // If none found, default to selected page
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
      setPages({ ...pages, [selected]: payload });
      setPreviewHtml(payload);
    } else if (selector === 'navigate') {
      // payload is the page name
      if (pages[payload]) {
        setSelected(payload);
        setPreviewHtml(pages[payload]);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 style={{ color: "#00fff7", marginBottom: 8 }}>AI Website Generator</h2>
        <PromptInput onSubmit={handleGenerate} loading={loading} />
        <PageList
          pages={Object.keys(pages)}
          selected={selected}
          onSelect={setSelected}
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

export default Home;