import React, { useState } from 'react';
import './App.css';
import CodeEditor from './components/Editor.jsx';
import OutputTerminal from './components/OutputTerminal.jsx';
import ExplanationPane from './components/ExplanationPane.jsx';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [highlighted, setHighlighted] = useState('');
  const [output, setOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [runError, setRunError] = useState('');
  const [explainError, setExplainError] = useState('');
  const [errorLines, setErrorLines] = useState([]);

  const handleRun = async () => {
    setLoading(true);
    setRunError('');
    setErrorLines([]);
    try {
      const res = await fetch('http://localhost:8000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setOutput(data.output || '');
      if (data.output && data.output.startsWith('Error:')) {
        setRunError(data.output);
      }
      // Detect syntax error lines
      let lines = [];
      if (data.output && /SyntaxError|Traceback|Exception|error/i.test(data.output)) {
        // Python: File "<string>", line X
        const pyMatches = [...data.output.matchAll(/File ".*", line (\d+)/g)];
        lines = pyMatches.map(m => parseInt(m[1], 10));
        // Java: at line X
        const javaMatches = [...data.output.matchAll(/at line (\d+)/g)];
        lines = lines.concat(javaMatches.map(m => parseInt(m[1], 10)));
      }
      setErrorLines(lines);
    } catch (err) {
      setRunError('Failed to run code.');
    }
    setLoading(false);
  };

  const handleExplain = async () => {
    setLoading(true);
    setExplainError('');
    try {
      const res = await fetch('http://localhost:8000/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: highlighted || code }),
      });
      const data = await res.json();
      setExplanation(data.explanation || '');
      if (data.explanation && data.explanation.startsWith('Error:')) {
        setExplainError(data.explanation);
      }
    } catch (err) {
      setExplainError('Failed to get explanation.');
    }
    setLoading(false);
  };

  const handleRectify = async () => {
    setLoading(true);
    setExplainError('');
    try {
      const res = await fetch('http://localhost:8000/rectify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: highlighted || code }),
      });
      const data = await res.json();
      if (data.corrected_code) {
        if (data.corrected_code.startsWith('Error:')) {
          setExplainError(data.corrected_code);
        } else {
          setCode(data.corrected_code);
        }
      }
    } catch (err) {
      setExplainError('Failed to rectify code.');
    }
    setLoading(false);
  };

  // Language/version options
  const languageOptions = [
    { value: 'python', label: 'Python 3.10' },
    { value: 'java', label: 'Java 17' },
  ];

  return (
    <div className="App app-bg">
      <h1 className="app-title">🧠 Online Compiler</h1>
      <div className="toolbar-row">
        <select
          className="language-dropdown"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          {languageOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button onClick={handleRun} disabled={loading} className="run-btn">Run</button>
        {/* Only show Explain/Rectify buttons if no code is selected */}
        {!highlighted && (
          <>
            <button onClick={handleExplain} disabled={loading}>Explain</button>
            <button onClick={handleRectify} disabled={loading}>Rectify</button>
          </>
        )}
        {loading && <span className="spinner" />}
      </div>
      <div className="main-content">
        <CodeEditor
          language={language}
          code={code}
          setCode={setCode}
          onHighlight={setHighlighted}
          onExplain={handleExplain}
          onRectify={handleRectify}
          errorLines={errorLines}
        />
        <div className="side-panes">
          <ExplanationPane explanation={explanation} error={explainError} />
          <OutputTerminal output={output} error={runError} />
        </div>
      </div>
    </div>
  );
}

export default App;
