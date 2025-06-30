import React, { useState } from "react";

type Props = {
  onSubmit: (prompt: string) => void;
  loading: boolean;
};

const PromptInput: React.FC<Props> = ({ onSubmit, loading }) => {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="prompt-bar" style={{ flexDirection: 'column', gap: 20 }}>
      <input
        type="text"
        placeholder="Describe your website (e.g. 'A 3-page site for a yoga coach')"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && prompt.trim()) {
            onSubmit(prompt);
          }
        }}
        disabled={loading}
        style={{ width: '100%' }}
      />
      <button
        onClick={() => onSubmit(prompt)}
        disabled={loading || !prompt.trim()}
        style={{ width: '100%' }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
};

export default PromptInput;