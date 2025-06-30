import React, { useRef, useEffect } from "react";

type Props = {
  html: string;
  onElementClick?: (selector: string, content: string) => void;
  editableSelector?: string;
};

const PreviewPane: React.FC<Props> = ({ html, onElementClick, editableSelector }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        // Prevent all link navigation
        const links = doc.querySelectorAll("a");
        links.forEach(link => {
          link.addEventListener("click", (e) => {
            const href = (link as HTMLAnchorElement).getAttribute('href');
            if (href && (href.endsWith('.html') || href.startsWith('/'))) {
              e.preventDefault();
              // Extract page name (e.g., about.html -> About)
              let pageName = href.replace('.html', '').replace('/', '');
              pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
              window.parent.postMessage({ type: 'navigate-page', page: pageName }, '*');
              return;
            }
            e.preventDefault();
          });
        });
        // Intercept form submissions
        const forms = doc.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            window.parent.postMessage({ type: 'form-submit' }, '*');
            alert('Message sent! (simulated)');
          });
        });
        // Enable WYSIWYG editing for text elements
        const editableTags = ["h1", "h2", "p", "button"];
        editableTags.forEach(tag => {
          doc.querySelectorAll(tag).forEach(el => {
            el.addEventListener('dblclick', (e) => {
              e.preventDefault();
              e.stopPropagation();
              (el as HTMLElement).setAttribute('contenteditable', 'true');
              (el as HTMLElement).focus();
            });
            el.addEventListener('blur', () => {
              (el as HTMLElement).removeAttribute('contenteditable');
              // Save the updated HTML back to parent
              if (iframe && iframe.contentDocument) {
                const updatedHtml = iframe.contentDocument.documentElement.outerHTML;
                window.parent.postMessage({ type: 'wysiwyg-edit', html: updatedHtml }, '*');
              }
            });
            el.addEventListener('keydown', (e) => {
              const ke = e as KeyboardEvent;
              if (ke.key === 'Enter') {
                (el as HTMLElement).blur();
              }
            });
          });
        });
      }
    };
    iframe.addEventListener("load", handleLoad);
    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [html]);

  useEffect(() => {
    // Listen for WYSIWYG edit events and navigation from iframe
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'wysiwyg-edit' && typeof event.data.html === 'string') {
        if (onElementClick) onElementClick('wysiwyg', event.data.html);
      }
      if (event.data && event.data.type === 'navigate-page' && typeof event.data.page === 'string') {
        if (onElementClick) onElementClick('navigate', event.data.page);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onElementClick]);

  // For bonus: allow clicking elements to edit
  const handleClick = (e: React.MouseEvent) => {
    if (!onElementClick) return;
    let target = e.target as HTMLElement;
    if (target && (target.tagName === "H1" || target.tagName === "H2" || target.tagName === "BUTTON" || target.tagName === "P")) {
      e.preventDefault();
      e.stopPropagation();
      const selector = target.tagName.toLowerCase();
      onElementClick(selector, target.innerText);
    }
  };

  return (
    <div className="preview-pane" onClick={handleClick}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 16,
          background: "transparent"
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default PreviewPane;