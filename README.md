# Live Syntax & Altern

A unified developer environment featuring:
1. **Live Syntax**: Collaborative, real-time code editor with AI assistant, multi-file/folder support, live compilation, and WebSockets.
2. **Altern**: High-performance AI code translator (between C++, Java, Python, JavaScript, and TypeScript) with AST structural engine, local LLM support, and interactive terminal execution.

---

## 📁 Repository Structure

```
├── client/                     # Live Syntax: React + CodeMirror frontend
│   ├── src/components/         # Editor, FileExplorer, FileTabs, WebRTC
│   └── package.json
├── server/                     # Live Syntax: Node.js + Socket.IO + Express backend
│   ├── index.js                # Collaboration server & compilation API
│   ├── Actions.js
│   └── package.json
├── model_server/               # Altern: Python FastAPI AI translation engine & terminal runner
│   ├── server.py               # FastAPI server & WebSocket execution endpoint
│   ├── engine_v2.py            # High-speed AST/rule-based translation engine
│   ├── model_config.py         # DeepSeek-Coder & PyTorch configuration
│   └── requirements.txt        # Python dependencies
├── frontend/                   # Altern: Standalone web playground interface
│   └── index.html
├── PROJECT_REPORT 2.md
└── README.md
```

---

## 🌟 Component 1: Live Syntax (Collaborative Editor)

### Overview
- Real-time collaborative editor (multiple users can edit simultaneously).
- **File Explorer with folders and multiple files** - Create, delete, rename files and folders.
- **Tab system** - Work with multiple files at once, just like VS Code.
- **Language detection** - Automatic syntax highlighting based on file extension.
- Color-coded cursors and selections per user.
- AI assistant that returns corrected code (structured responses).
- Server-side compilation using the JDoodle API.

### Tech Stack
- Frontend: React, CodeMirror (with multiple language modes), Socket.IO client
- Backend: Node.js, Express, Socket.IO server
- Database: MongoDB (via Mongoose)
- AI: Groq API (`GROQ_API_KEY`)
- Compilation: JDoodle API (`JDOODLE_CLIENT_ID` / `JDOODLE_CLIENT_SECRET`)

### Setup & Running Live Syntax

1. **Install Dependencies:**
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

2. **Configure Environment Variables:**
   - Server (`server/.env`):
     ```env
     PORT=5002
     MONGO_URI=mongodb://localhost:27017/live-syntax
     FRONTEND_URL=http://localhost:3000
     GROQ_API_KEY=your_groq_api_key_here
     JDOODLE_CLIENT_ID=your_jdoodle_client_id
     JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
     ```
   - Client (`client/.env`):
     ```env
     REACT_APP_BACKEND_URL=http://localhost:5002
     ```

3. **Start Servers:**
   ```bash
   # Terminal 1 (Server)
   cd server
   npm start

   # Terminal 2 (Client)
   cd client
   npm start
   ```
   Open `http://localhost:3000`.

---

## 🌟 Component 2: Altern (AI Code Translator & Execution Engine)

### Overview
Altern translates code between **C++**, **Java**, **Python**, **JavaScript**, and **TypeScript**. It combines a structural rule/AST translation engine with local AI model support (`deepseek-ai/deepseek-coder-1.3b-instruct`) and includes an interactive web IDE with live real-time terminal execution via WebSockets.

### System Requirements
- **Python**: Version `3.10` or higher
- **RAM**:
  - Fast Structural Engine: ~150 MB RAM
  - Local AI LLM Mode: ~3 GB RAM (`deepseek-coder-1.3b-instruct` in `bfloat16`)
- **Optional Compilers / Runtimes** (for local execution):
  - Python (installed)
  - Node.js (v16+) for JS/TS
  - GCC/G++ (MinGW-w64 on Windows) for C++
  - JDK (Java 11+) for Java

### Setup & Running Altern

1. **Create and Activate a Virtual Environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r model_server/requirements.txt
   ```

3. **Start the Altern Server:**
   ```bash
   python model_server/server.py
   ```
   The server runs on `http://127.0.0.1:8000`.

4. **Open the Translation UI:**
   Open `frontend/index.html` in your web browser.

### Altern API Reference
- `POST /translate` — Translates source code between supported languages.
- `POST /execute` — Executes code locally and returns stdout, stderr, and run time.
- `WS /ws/execute` — Interactive WebSocket terminal for streaming input/output.
