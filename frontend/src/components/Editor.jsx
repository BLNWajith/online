import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './Editor.css';

const CodeEditor = ({ language, code, setCode, onHighlight, onExplain, onRectify, errorLines }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [toolbarPos, setToolbarPos] = useState(null);
  const [selectedText, setSelectedText] = useState('');

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedText(selection);
      onHighlight(selection);
      if (selection && selection.length > 0) {
        // Get the top position of the selection
        const domNode = editor.getDomNode();
        const rect = domNode.getBoundingClientRect();
        const top = e.position ? editor.getTopForLineNumber(e.selection.startLineNumber) : 0;
        setToolbarPos({ top: top + 40, left: 40 }); // Adjust as needed
      } else {
        setToolbarPos(null);
      }
    });
  };

  // Add error squiggles for errorLines
  useEffect(() => {
    if (editorRef.current && monacoRef.current && errorLines && errorLines.length > 0) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelMarkers(model, 'owner', errorLines.map(line => ({
        startLineNumber: line,
        endLineNumber: line,
        startColumn: 1,
        endColumn: 1000,
        message: 'Syntax Error',
        severity: monacoRef.current.MarkerSeverity.Error,
      })));
    } else if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelMarkers(model, 'owner', []);
    }
  }, [errorLines, code]);

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
      {toolbarPos && selectedText && (
        <div
          className="floating-toolbar"
          style={{ position: 'absolute', top: toolbarPos.top, left: toolbarPos.left, zIndex: 10 }}
        >
          <button onClick={onExplain}>Explain</button>
          <button onClick={onRectify}>Rectify</button>
        </div>
      )}
      <Editor
        height="400px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        onMount={handleEditorDidMount}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
