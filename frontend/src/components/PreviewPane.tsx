import React, { useRef, useEffect } from "react";

type Props = {
  html: string;
  onElementClick?: (selector: string, content: string) => void;
  editableSelector?: string;
};

function rewriteLinks(html: string) {
  // Replace <a href="About.html"> or <a href="/About.html"> or <a href="About"> or <a href="/About"> with <a href="#" data-target="About">
  html = html.replace(/<a\s+href=["']\/?([A-Za-z0-9_-]+)(?:\.html)?["']/gi, (match, p1) => {
    return `<a href="#" data-target="${p1}"`;
  });
  // Replace <button ... onclick="location.href='About.html'"> or <button ... onclick="location.href='About'">
  html = html.replace(/<button([^>]*)onclick=["']location\.href=['"]\/?([A-Za-z0-9_-]+)(?:\.html)?['"][^>]*>/gi, (match, attrs, p1) => {
    return `<button${attrs} data-target="${p1}">`;
  });
  // Remove all inline onclicks that navigate to .html or plain page
  html = html.replace(/onclick=["']location\.href=['"][^'"]+(?:\.html)?['"]["']/gi, '');
  return html;
}

const PreviewPane: React.FC<Props> = ({ html, onElementClick, editableSelector }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        // Global click interception for all data-target elements
        doc.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target && target.hasAttribute('data-target')) {
            e.preventDefault();
            e.stopPropagation();
            const page = target.getAttribute('data-target');
            if (page) {
              window.parent.postMessage({ type: 'navigate-page', page }, '*');
            }
          }
        }, true); // Use capture phase
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

  // Rewrite links before passing to iframe
  const rewrittenHtml = rewriteLinks(html);

  return (
    <div className="preview-pane" onClick={handleClick}>
      <iframe
        ref={iframeRef}
        srcDoc={rewrittenHtml}
        key={rewrittenHtml}
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