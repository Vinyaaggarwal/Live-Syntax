import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "./Translator.css";

const SAMPLES = {
  python: `def greet(name: str) -> str:
    return f"Hello, {name}!"

names = ["Alice", "Bob", "Charlie"]
for name in names:
    print(greet(name))`,

  javascript: `const nums = [10, 20, 30];

function double(n) {
    return n * 2;
}

nums.map(double).forEach(n => console.log(n));`,

  typescript: `interface User {
    name: string;
    age: number;
}

function greet(user: User): string {
    return \`Hello, \${user.name}!\`;
}

const user: User = { name: "Alice", age: 30 };
console.log(greet(user));`,

  cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {10, 20, 30};
    for (int n : nums) {
        std::cout << n << std::endl;
    }
    return 0;
}`,

  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(10, 20, 30);
        for (int n : nums) {
            System.out.println(n);
        }
    }
}`
};

const LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
];

function Translator() {
  const [sourceLang, setSourceLang] = useState("python");
  const [targetLang, setTargetLang] = useState("javascript");
  const [sourceCode, setSourceCode] = useState(SAMPLES.python);
  const [convertedCode, setConvertedCode] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [useModel, setUseModel] = useState(false); // False = AST Engine, True = DeepSeek
  const [executionOutput, setExecutionOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [stdinInput, setStdinInput] = useState("");

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5002";

  // Load sample code for selected source language
  const handleLoadSample = () => {
    if (SAMPLES[sourceLang]) {
      setSourceCode(SAMPLES[sourceLang]);
      toast.success(`Loaded ${sourceLang} sample`);
    }
  };

  // Swap languages and code
  const handleSwap = () => {
    const prevSrc = sourceLang;
    const prevTgt = targetLang;
    setSourceLang(prevTgt);
    setTargetLang(prevSrc);
    if (convertedCode) {
      setSourceCode(convertedCode);
      setConvertedCode("");
    }
    toast.success("Swapped languages");
  };

  // Perform translation
  const handleTranslate = async () => {
    if (!sourceCode.trim()) {
      toast.error("Please enter code to translate");
      return;
    }
    if (sourceLang === targetLang) {
      toast.error("Source and Target languages must be different");
      return;
    }

    setIsTranslating(true);
    try {
      const response = await axios.post(`${backendUrl}/api/translate`, {
        source_code: sourceCode,
        source_lang: sourceLang,
        target_lang: targetLang,
        use_model: useModel,
      });

      if (response.data?.converted_code) {
        setConvertedCode(response.data.converted_code);
        toast.success(`Translated to ${targetLang}!`);
      } else {
        toast.error("Translation returned empty code");
      }
    } catch (err) {
      console.error("Translation error:", err);
      const msg = err.response?.data?.details || err.response?.data?.error || err.message;
      toast.error(`Translation failed: ${msg}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Execute code via local Altern engine
  const handleRun = async (codeToRun, langToRun) => {
    if (!codeToRun.trim()) {
      toast.error("No code to run");
      return;
    }

    setIsRunning(true);
    setExecutionOutput("Executing code locally via Altern runner...\n");
    try {
      const response = await axios.post(`${backendUrl}/api/execute`, {
        code: codeToRun,
        language: langToRun,
        stdin: stdinInput,
      });

      const { stdout, stderr, exit_code, execution_time_ms } = response.data;
      let outputText = "";
      if (stdout) outputText += stdout;
      if (stderr) outputText += (stdout ? "\n" : "") + stderr;
      if (!outputText) outputText = "(Process exited with no output)";

      outputText += `\n\n[Process completed in ${execution_time_ms} ms with exit code ${exit_code}]`;
      setExecutionOutput(outputText);
    } catch (err) {
      console.error("Run error:", err);
      const msg = err.response?.data?.details || err.response?.data?.error || err.message;
      setExecutionOutput(`[Execution Error]: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <div className="translator-container">
      {/* Header */}
      <header className="translator-header">
        <div className="translator-brand">
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", color: "#f0f6fc" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px" }}>Live Syntax</span>
            <span className="brand-badge">Altern AI Translator</span>
          </Link>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link to="/" className="translator-nav-btn">
            <i className="bi bi-people-fill"></i>
            Collaborative Rooms
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="translator-main">
        {/* Controls Bar */}
        <div className="translator-controls-bar">
          <div className="controls-left">
            <div className="lang-select-group">
              <label style={{ fontSize: "12px", color: "#8b949e" }}>Source:</label>
              <select
                className="translator-select"
                value={sourceLang}
                onChange={(e) => {
                  setSourceLang(e.target.value);
                  if (SAMPLES[e.target.value]) {
                    setSourceCode(SAMPLES[e.target.value]);
                  }
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <button className="btn-icon-action" onClick={handleSwap} title="Swap languages">
              <i className="bi bi-arrow-left-right"></i> Swap
            </button>

            <div className="lang-select-group">
              <label style={{ fontSize: "12px", color: "#8b949e" }}>Target:</label>
              <select
                className="translator-select"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <button className="btn-icon-action" onClick={handleLoadSample}>
              <i className="bi bi-file-code"></i> Load Sample
            </button>
          </div>

          <div className="controls-right">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: "#8b949e" }}>Engine:</label>
              <select
                className="translator-select"
                value={useModel ? "llm" : "ast"}
                onChange={(e) => setUseModel(e.target.value === "llm")}
              >
                <option value="ast">Fast Structural Engine (Instant)</option>
                <option value="llm">DeepSeek AI Model (1.3B)</option>
              </select>
            </div>

            <button
              className="btn-translate"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Translating...
                </>
              ) : (
                <>
                  <i className="bi bi-cpu-fill"></i>
                  Translate Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Grid */}
        <div className="editor-grid">
          {/* Source Code Panel */}
          <div className="editor-panel">
            <div className="panel-header">
              <span>Source ({LANGUAGES.find((l) => l.id === sourceLang)?.name})</span>
              <div className="panel-actions">
                <button
                  className="btn-icon-action"
                  onClick={() => handleRun(sourceCode, sourceLang)}
                  disabled={isRunning}
                  style={{ color: "#3fb950" }}
                  title="Run source code"
                >
                  <i className="bi bi-play-fill"></i> Run
                </button>
                <button
                  className="btn-icon-action"
                  onClick={() => copyToClipboard(sourceCode, "Source Code")}
                  title="Copy"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
                <button
                  className="btn-icon-action"
                  onClick={() => setSourceCode("")}
                  title="Clear"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <textarea
              className="panel-textarea"
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste or write your source code here..."
              spellCheck="false"
            />
          </div>

          {/* Converted Code Panel */}
          <div className="editor-panel">
            <div className="panel-header">
              <span>Converted ({LANGUAGES.find((l) => l.id === targetLang)?.name})</span>
              <div className="panel-actions">
                <button
                  className="btn-icon-action"
                  onClick={() => handleRun(convertedCode, targetLang)}
                  disabled={isRunning || !convertedCode}
                  style={{ color: "#3fb950" }}
                  title="Run converted code"
                >
                  <i className="bi bi-play-fill"></i> Run
                </button>
                <button
                  className="btn-icon-action"
                  onClick={() => copyToClipboard(convertedCode, "Converted Code")}
                  disabled={!convertedCode}
                  title="Copy"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
                <button
                  className="btn-icon-action"
                  onClick={() => setConvertedCode("")}
                  disabled={!convertedCode}
                  title="Clear"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <textarea
              className="panel-textarea"
              value={convertedCode}
              onChange={(e) => setConvertedCode(e.target.value)}
              placeholder={isTranslating ? "Translating code..." : "Translated code will appear here..."}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Local Execution Terminal */}
        <div className="terminal-section">
          <div className="terminal-header">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="bi bi-terminal-fill" style={{ color: "#58a6ff" }}></i>
              Execution Terminal (Local Altern Runner)
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Optional stdin input..."
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                style={{
                  background: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "4px",
                  color: "#e6edf3",
                  padding: "2px 8px",
                  fontSize: "11px",
                  width: "180px",
                }}
              />
              <button
                className="btn-icon-action"
                style={{ padding: "2px 8px", fontSize: "11px" }}
                onClick={() => setExecutionOutput("")}
              >
                Clear Terminal
              </button>
            </div>
          </div>
          <div className="terminal-body">
            {executionOutput || "Terminal ready. Click 'Run' on either panel to execute code locally."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Translator;

