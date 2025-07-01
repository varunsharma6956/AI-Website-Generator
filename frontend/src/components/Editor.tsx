import React, { useState, useEffect } from "react";

type Props = {
  html: string;
  onSave: (newHtml: string) => void;
};

const Editor: React.FC<Props> = ({ html, onSave }) => {
  const [editHtml, setEditHtml] = useState(html);

  // Pretty-print HTML for readability
  useEffect(() => {
    setEditHtml(formatHtml(html));
  }, [html]);

  function formatHtml(html: string) {
    // Simple pretty print using browser DOM
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      return beautifyHtml(div.innerHTML);
    } catch {
      return html;
    }
  }

  function beautifyHtml(html: string) {
    // Basic indentation for HTML tags
    let formatted = '';
    const lines = html.replace(/></g, '>\n<').split('\n');
    let indent = 0;
    for (let line of lines) {
      if (line.match(/^<\//)) indent--;
      formatted += '  '.repeat(indent) + line + '\n';
      if (line.match(/^<[^!/][^>]*[^/]>/)) indent++;
    }
    return formatted.trim();
  }

  return (
    <div>
      <div className="editor-toolbar">
        <button onClick={() => onSave(editHtml)}>Save Changes</button>
      </div>
      <textarea
        value={editHtml}
        onChange={e => setEditHtml(e.target.value)}
        rows={18}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
      />
    </div>
  );
};

export default Editor;
