import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FolderArchive, 
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'index.html' | 'style.css' | 'script.js'>('preview');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadFile = (filename: string, path: string) => {
    fetch(path)
      .then((res) => res.text())
      .then((content) => {
        const mimeType = filename.endsWith('.html')
          ? 'text/html;charset=utf-8'
          : filename.endsWith('.css')
          ? 'text/css;charset=utf-8'
          : filename.endsWith('.js')
          ? 'application/javascript;charset=utf-8'
          : 'text/plain;charset=utf-8';
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
  };

  const downloadAllThree = () => {
    downloadFile('index.html', '/standalone/index.html');
    setTimeout(() => downloadFile('style.css', '/standalone/style.css'), 300);
    setTimeout(() => downloadFile('script.js', '/standalone/script.js'), 600);
  };

  const handleCopy = (filename: string, path: string) => {
    fetch(path)
      .then((res) => res.text())
      .then((content) => {
        navigator.clipboard.writeText(content);
        setCopied(filename);
        setTimeout(() => setCopied(null), 2000);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch',sans-serif] text-lg font-bold text-white tracking-tight">
                Browser Prototype: 3 Standalone Files (HTML, CSS, JS)
              </h3>
              <p className="text-xs text-slate-400">
                Pure Vanilla Web Stack: <code className="text-amber-300 font-mono">index.html</code>, <code className="text-amber-300 font-mono">style.css</code>, <code className="text-amber-300 font-mono">script.js</code> (+ Chart.js CDN).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Download Toolbar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Tab Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'preview' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Standalone Preview
            </button>
            <button
              onClick={() => setActiveTab('index.html')}
              className={`px-3 py-1 rounded-md font-medium font-mono transition-colors ${
                activeTab === 'index.html' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              index.html
            </button>
            <button
              onClick={() => setActiveTab('style.css')}
              className={`px-3 py-1 rounded-md font-medium font-mono transition-colors ${
                activeTab === 'style.css' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              style.css
            </button>
            <button
              onClick={() => setActiveTab('script.js')}
              className={`px-3 py-1 rounded-md font-medium font-mono transition-colors ${
                activeTab === 'script.js' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              script.js
            </button>
          </div>

          {/* Quick Action Download Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadFile('mineguard.html', '/mineguard.html')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm transition-colors"
              title="Downloads a single self-contained HTML file containing HTML + CSS + JS in 1 file (Zero setup, opens immediately in Chrome)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Single HTML File</span>
            </button>

            <a
              href="/mineguard_project.zip"
              download="mineguard_project.zip"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
              title="Download full project pre-packaged as a genuine .zip archive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project ZIP</span>
            </a>

            <button
              onClick={downloadAllThree}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 shadow-sm transition-colors"
              title="Downloads all three files (index.html, style.css, script.js) to your downloads folder"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 3 Files</span>
            </button>
          </div>
        </div>

        {/* ZIP & Chrome Helper Notice */}
        <div className="mx-4 sm:mx-5 mt-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <div>
              <strong className="text-amber-300 font-semibold">Saved as ZIP and index.html won't open?</strong>{' '}
              Windows prevents browsers from running web apps directly from inside a compressed ZIP archive.
            </div>
            <div className="text-slate-300">
              <strong>How to fix:</strong> Right-click the downloaded <code className="bg-amber-950/60 text-amber-300 px-1 py-0.5 rounded font-mono text-[11px]">mineguard_project.zip</code> → Click <strong>"Extract All..."</strong> (or Unzip) → Open the extracted folder and double-click <code className="bg-amber-950/60 text-amber-300 px-1 py-0.5 rounded font-mono text-[11px]">index.html</code>.
              Or simply download the <strong>Single HTML File</strong> above which doesn't require any unzipping!
            </div>
          </div>
        </div>

        {/* Modal Main View */}
        <div className="flex-1 overflow-hidden p-4 sm:p-5 flex flex-col">
          {activeTab === 'preview' ? (
            <div className="flex-1 flex flex-col h-[520px]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Rendering standalone <strong className="text-white">/standalone/index.html</strong> using Vanilla HTML5, CSS3, JS, &amp; Chart.js</span>
                </span>
                <a
                  href="/standalone/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                >
                  <span>Open Standalone in Full Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
                <iframe
                  src="/standalone/index.html"
                  title="MineGuard Standalone HTML Prototype"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber-300 font-semibold">
                  Source: /{activeTab} (Available in project root &amp; /MineGuard/{activeTab})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeTab, `/standalone/${activeTab}`)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    {copied === activeTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => downloadFile(activeTab, `/standalone/${activeTab}`)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download {activeTab}</span>
                  </button>
                </div>
              </div>
              <FileViewerContent path={`/standalone/${activeTab}`} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Created per Project Development Plan Phase 1 specification: <code className="text-slate-300">MineGuard/index.html, style.css, script.js</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Inline helper to fetch and display file content
function FileViewerContent({ path }: { path: string }) {
  const [content, setContent] = React.useState<string>('Loading code...');

  React.useEffect(() => {
    fetch(path)
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => setContent(`Error loading file: ${err}`));
  }, [path]);

  return (
    <pre className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs overflow-auto select-all leading-relaxed">
      <code>{content}</code>
    </pre>
  );
}
