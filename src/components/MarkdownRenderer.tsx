/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Play, ExternalLink } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedBlockIdx, setCopiedBlockIdx] = useState<number | null>(null);

  // Simple and highly effective XSS sanitation
  const sanitizeText = (text: string): string => {
    return text
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "");
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockIdx(index);
    setTimeout(() => setCopiedBlockIdx(null), 2000);
  };

  // Check if a line is a video link and render video player
  const renderVideoIfPresent = (line: string): React.ReactNode | null => {
    const trimmed = line.trim();
    
    // YouTube links: matches watch?v=... or share link youtu.be/...
    const ytWatchRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/i;
    const ytMatch = trimmed.match(ytWatchRegex);
    if (ytMatch) {
      const videoId = ytMatch[1];
      return (
        <div key={line} className="relative w-full aspect-video rounded-2xl overflow-hidden my-6 border border-slate-800 shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }

    // Local Video links (.mp4, .webm, .ogg)
    if (trimmed.endsWith(".mp4") || trimmed.endsWith(".webm") || trimmed.endsWith(".ogg") || trimmed.includes("/assets/videos/")) {
      return (
        <div key={line} className="w-full my-6 border border-slate-800 rounded-2xl overflow-hidden bg-black shadow-lg">
          <video
            controls
            preload="metadata"
            className="w-full aspect-video"
          >
            <source src={trimmed} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  // Highlight inline formatting (Bold, Italic, Link, Inline Code, Image)
  const renderInlineFormat = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Sanitize first
    const sanitized = sanitizeText(text);

    // Matches `code`, **bold**, *italic*, ![alt](src), [text](href)
    const regex = /(!?\[[^\]]*\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g;
    let match;

    while ((match = regex.exec(sanitized)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      // Add preceding plain text
      if (matchIndex > currentIndex) {
        parts.push(sanitized.substring(currentIndex, matchIndex));
      }

      if (matchText.startsWith("`") && matchText.endsWith("`")) {
        // Inline code
        const code = matchText.slice(1, -1);
        parts.push(
          <code key={matchIndex} className="bg-slate-900 text-pink-400 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-800">
            {code}
          </code>
        );
      } else if (matchText.startsWith("**") && matchText.endsWith("**")) {
        // Bold
        parts.push(<strong key={matchIndex} className="font-extrabold text-white">{matchText.slice(2, -2)}</strong>);
      } else if ((matchText.startsWith("*") && matchText.endsWith("*")) || (matchText.startsWith("_") && matchText.endsWith("_"))) {
        // Italic
        parts.push(<em key={matchIndex} className="italic text-slate-300">{matchText.slice(1, -1)}</em>);
      } else if (matchText.startsWith("![")) {
        // Image
        const alt = matchText.match(/\[([^\]]*)\]/)?.[1] || "";
        const src = matchText.match(/\(([^)]+)\)/)?.[1] || "";
        parts.push(
          <img
            key={matchIndex}
            src={src}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="rounded-xl border border-slate-800 my-4 max-h-[400px] object-cover mx-auto shadow-md"
          />
        );
      } else if (matchText.startsWith("[")) {
        // Link
        const label = matchText.match(/\[([^\]]*)\]/)?.[1] || "";
        const href = matchText.match(/\(([^)]+)\)/)?.[1] || "";
        parts.push(
          <a
            key={matchIndex}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center space-x-1 font-medium"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        );
      }

      currentIndex = regex.lastIndex;
    }

    if (currentIndex < sanitized.length) {
      parts.push(sanitized.substring(currentIndex));
    }

    return parts.length > 0 ? parts : [sanitized];
  };

  // Highlight block coding (HTML, CSS, JS, SQL, Bash etc.)
  const highlightCode = (code: string, language: string): React.ReactNode => {
    const trimmedCode = code.trim();
    if (!language) return <pre>{trimmedCode}</pre>;

    const words = trimmedCode.split(/(\s+|[()\[\]{}.,:;'"=+\-*\/<>!&|?^~#`])/);
    
    // Keywords for programming languages
    const keywords = new Set([
      "def", "import", "from", "as", "return", "if", "else", "elif", "for", "while", "print", "in", "True", "False", "None",
      "let", "const", "var", "function", "class", "extends", "constructor", "super", "this", "new", "try", "catch", "throw",
      "import", "export", "default", "from", "async", "await", "null", "undefined", "true", "false",
      "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "JOIN", "ON", "CREATE", "TABLE", "PRIMARY", "KEY",
      "val", "fun", "object", "interface", "public", "private", "protected", "package"
    ]);

    return (
      <pre className="text-slate-300 font-mono text-xs text-left leading-relaxed">
        {words.map((part, index) => {
          if (keywords.has(part)) {
            return <span key={index} className="text-purple-400 font-bold">{part}</span>;
          }
          if (part.startsWith("#") || part.startsWith("//") || (part.startsWith("/*") && part.endsWith("*/"))) {
            return <span key={index} className="text-slate-500 italic">{part}</span>;
          }
          if (part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) {
            return <span key={index} className="text-emerald-400">{part}</span>;
          }
          if (/^\d+$/.test(part)) {
            return <span key={index} className="text-amber-400">{part}</span>;
          }
          return part;
        })}
      </pre>
    );
  };

  // Main Markdown parsing logic
  const parseMarkdown = (markdownText: string): React.ReactNode[] => {
    const lines = markdownText.split("\n");
    const elements: React.ReactNode[] = [];
    
    let isInsideCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = "";
    
    let isInsideList = false;
    let listItems: string[] = [];
    let isOrderedList = false;

    let isInsideTable = false;
    let tableRows: string[][] = [];

    const flushList = (key: number) => {
      if (listItems.length === 0) return;
      elements.push(
        isOrderedList ? (
          <ol key={`ol-${key}`} className="list-decimal list-inside pl-5 my-4 space-y-2 text-sm text-slate-300 text-left">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormat(item)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={`ul-${key}`} className="list-disc list-inside pl-5 my-4 space-y-2 text-sm text-slate-300 text-left">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormat(item)}
              </li>
            ))}
          </ul>
        )
      );
      listItems = [];
      isInsideList = false;
    };

    const flushTable = (key: number) => {
      if (tableRows.length === 0) return;
      const headers = tableRows[0];
      const bodyRows = tableRows.slice(1);
      
      elements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto my-6 border border-slate-800 rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-slate-800 bg-slate-900/40 text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 font-semibold text-slate-200">
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 border-r border-slate-800 last:border-r-0">
                    {renderInlineFormat(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-transparent">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/20 transition-all">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 border-r border-slate-800/40 last:border-r-0">
                      {renderInlineFormat(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      isInsideTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Video matches check
      const videoNode = renderVideoIfPresent(line);
      if (videoNode && !isInsideCodeBlock) {
        flushList(i);
        flushTable(i);
        elements.push(videoNode);
        continue;
      }

      // Handle Code Blocks
      if (trimmedLine.startsWith("```")) {
        if (isInsideCodeBlock) {
          // Close Code Block
          const rawCode = codeBlockContent.join("\n");
          const blockIdx = i;
          elements.push(
            <div key={`code-${i}`} className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden my-6 shadow-inner relative group text-left">
              <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">{codeBlockLanguage || "code"}</span>
                <button
                  onClick={() => copyToClipboard(rawCode, blockIdx)}
                  className="p-1 rounded hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all"
                  title="Copy code"
                >
                  {copiedBlockIdx === blockIdx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="p-5 font-mono text-xs overflow-x-auto max-w-full">
                {highlightCode(rawCode, codeBlockLanguage)}
              </div>
            </div>
          );
          codeBlockContent = [];
          codeBlockLanguage = "";
          isInsideCodeBlock = false;
        } else {
          // Open Code Block
          flushList(i);
          flushTable(i);
          isInsideCodeBlock = true;
          codeBlockLanguage = trimmedLine.slice(3).trim();
        }
        continue;
      }

      if (isInsideCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle Headers
      if (trimmedLine.startsWith("#")) {
        flushList(i);
        flushTable(i);
        
        const hLevel = line.match(/^#+/)?.[0].length || 1;
        const hText = line.replace(/^#+\s*/, "");
        
        if (hLevel === 1) {
          elements.push(
            <h1 key={`h1-${i}`} className="text-2xl md:text-3xl font-display font-extrabold text-white mt-8 mb-4 border-b border-slate-800/60 pb-2 text-left">
              {renderInlineFormat(hText)}
            </h1>
          );
        } else if (hLevel === 2) {
          elements.push(
            <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-display font-bold text-white mt-6 mb-3 flex items-center space-x-2 text-left">
              <span className="h-4 w-1 bg-blue-500 rounded-full inline-block"></span>
              <span>{renderInlineFormat(hText)}</span>
            </h2>
          );
        } else {
          elements.push(
            <h3 key={`h3-${i}`} className="text-base md:text-lg font-display font-bold text-slate-200 mt-4 mb-2 text-left">
              {renderInlineFormat(hText)}
            </h3>
          );
        }
        continue;
      }

      // Handle Blockquotes
      if (trimmedLine.startsWith(">")) {
        flushList(i);
        flushTable(i);
        const quoteText = line.replace(/^>\s*/, "");
        elements.push(
          <blockquote key={`quote-${i}`} className="border-l-4 border-blue-500 bg-blue-950/20 px-5 py-4 my-5 rounded-r-xl text-sm italic text-slate-300 text-left leading-relaxed">
            {renderInlineFormat(quoteText)}
          </blockquote>
        );
        continue;
      }

      // Handle Tables
      if (trimmedLine.startsWith("|")) {
        flushList(i);
        isInsideTable = true;
        
        // Parse row cells
        const cells = trimmedLine
          .split("|")
          .map((c) => c.trim())
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1); // skip outer borders

        // Skip separator rows (e.g., |---|---|)
        if (cells.every((cell) => cell.replace(/[-:\s]/g, "") === "")) {
          continue;
        }

        tableRows.push(cells);
        continue;
      } else {
        if (isInsideTable) {
          flushTable(i);
        }
      }

      // Handle Lists
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
      if (listMatch) {
        flushTable(i);
        isInsideList = true;
        const bullet = listMatch[2];
        const itemContent = listMatch[3];
        isOrderedList = /^\d+\./.test(bullet);
        listItems.push(itemContent);
        continue;
      } else {
        if (isInsideList) {
          flushList(i);
        }
      }

      // Handle Plain Paragraphs
      if (trimmedLine !== "") {
        elements.push(
          <p key={`p-${i}`} className="text-sm text-slate-300 text-left leading-relaxed my-3.5">
            {renderInlineFormat(line)}
          </p>
        );
      }
    }

    // Flush remaining
    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  return (
    <div className="space-y-1 select-text">
      {parseMarkdown(content)}
    </div>
  );
}
