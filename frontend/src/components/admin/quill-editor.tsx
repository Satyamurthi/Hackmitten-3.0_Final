"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function QuillEditor({
  value,
  onChange,
  placeholder = "Write styled problem statement description, guidelines, expected deliverables...",
  readOnly = false,
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isUpdatingFromProps = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container if previously initialized
    containerRef.current.innerHTML = "";
    const editorDiv = document.createElement("div");
    containerRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
      placeholder,
      readOnly,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          ["link", "clean"],
        ],
      },
    });

    quillRef.current = quill;

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on("text-change", () => {
      if (!isUpdatingFromProps.current) {
        const html = quill.root.innerHTML;
        // If empty quill content, pass empty string
        onChange(html === "<p><br></p>" ? "" : html);
      }
    });

    return () => {
      quillRef.current = null;
    };
  }, []); // Run on mount

  // Sync external value updates (e.g., when editing an existing problem statement)
  useEffect(() => {
    if (quillRef.current) {
      const currentHtml = quillRef.current.root.innerHTML;
      const normalizedCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;
      const normalizedProp = value === "<p><br></p>" ? "" : value;

      if (normalizedCurrent !== normalizedProp) {
        isUpdatingFromProps.current = true;
        quillRef.current.root.innerHTML = normalizedProp || "";
        isUpdatingFromProps.current = false;
      }
    }
  }, [value]);

  return (
    <div className="quill-dark-wrapper rounded-lg border border-white/10 bg-[#080808] overflow-hidden">
      <style jsx global>{`
        .quill-dark-wrapper .ql-toolbar.ql-snow {
          background-color: #121212;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
        }
        .quill-dark-wrapper .ql-container.ql-snow {
          border: none;
          background-color: #080808;
          color: #f2f2f2;
          font-family: inherit;
          font-size: 14px;
          min-height: 200px;
          max-height: 420px;
          overflow-y: auto;
        }
        .quill-dark-wrapper .ql-editor {
          min-height: 200px;
          line-height: 1.6;
          padding: 14px 16px;
        }
        .quill-dark-wrapper .ql-editor.ql-blank::before {
          color: #666666;
          font-style: normal;
        }
        .quill-dark-wrapper .ql-stroke {
          stroke: #a8a8a8 !important;
        }
        .quill-dark-wrapper .ql-fill {
          fill: #a8a8a8 !important;
        }
        .quill-dark-wrapper .ql-picker {
          color: #a8a8a8 !important;
        }
        .quill-dark-wrapper .ql-picker-options {
          background-color: #151515 !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
        }
        .quill-dark-wrapper .ql-picker-item:hover,
        .quill-dark-wrapper .ql-picker-label:hover {
          color: #ffffff !important;
        }
        .quill-dark-wrapper button:hover .ql-stroke {
          stroke: #ffffff !important;
        }
        .quill-dark-wrapper button:hover .ql-fill {
          fill: #ffffff !important;
        }
        .quill-dark-wrapper button.ql-active .ql-stroke {
          stroke: #d83a43 !important;
        }
        .quill-dark-wrapper button.ql-active .ql-fill {
          fill: #d83a43 !important;
        }
        .quill-dark-wrapper .ql-snow .ql-editor pre.ql-syntax {
          background-color: #030303;
          border: 1px solid rgba(216, 58, 67, 0.3);
          border-radius: 6px;
          color: #00ffaa;
          padding: 10px;
          font-family: 'JetBrains Mono', monospace;
        }
        .quill-dark-wrapper .ql-snow .ql-editor blockquote {
          border-left: 3px solid #b52a32;
          padding-left: 12px;
          color: #a8a8a8;
        }
      `}</style>
      <div ref={containerRef} />
    </div>
  );
}
