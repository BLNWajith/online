import React, { useState } from 'react';
import './ExplanationPane.css';

const ExplanationPane = ({ explanation, error }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="explanation-pane">
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide Explanation' : 'Show Explanation'}
      </button>
      {isVisible && (
        <div className="explanation-content">
          <h3>Code Explanation</h3>
          {error && <div className="explanation-error">{error}</div>}
          <p>{explanation || "Highlight code and click 'Explain' to see results."}</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPane;
