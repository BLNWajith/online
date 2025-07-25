import React, { useEffect, useRef } from 'react';
import './OutputTerminal.css';

const OutputTerminal = ({ output, error }) => {
  const preRef = useRef(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="terminal-container">
      <h3>Terminal Output:</h3>
      {error && <div className="terminal-error">{error}</div>}
      <pre ref={preRef}>{output}</pre>
    </div>
  );
};

export default OutputTerminal;
