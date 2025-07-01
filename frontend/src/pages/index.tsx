import React, { useEffect, useState } from "react";
import PromptInput from "../components/PromptInput";
import { generateWebsite } from "../utils/api";
import { useRouter } from "next/router";

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Generate website and redirect to first page
  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    try {
      const newPages = await generateWebsite(prompt);
      const pageNames = Object.keys(newPages);
      if (pageNames.length > 0) {
        // Redirect to the first generated page
        router.push(`/${pageNames[0]}`);
      }
    } catch (error) {
      console.error("Failed to generate website:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 style={{ color: "#00fff7", marginBottom: 8 }}>AI Website Generator</h2>
        <PromptInput onSubmit={handleGenerate} loading={loading} />
      </div>
      <div className="main-content">
        <div style={{ color: "#aaa", fontSize: "1.2rem", marginTop: 40, textAlign: "center" }}>
          <p>Describe your website and click <b>Generate</b> to get started!</p>
        </div>
      </div>
    </div>
  );
};

export default Home;