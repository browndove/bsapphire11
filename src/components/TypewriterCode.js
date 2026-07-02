'use client';

import { useEffect, useRef } from 'react';

export default function TypewriterCode() {
  const codeLinesRef = useRef([]);

  useEffect(() => {
    const lines = codeLinesRef.current;
    if (lines.length === 0) return;
    
    let lineIndex = 0;
    let timeoutId;
    
    function resetLines() {
      lines.forEach(line => {
        if (line) line.style.opacity = '0';
      });
      lineIndex = 0;
      timeoutId = setTimeout(typeNextLine, 200);
    }
    
    function typeNextLine() {
      if (lineIndex < lines.length) {
        if (lines[lineIndex]) {
          lines[lineIndex].style.opacity = '1';
        }
        lineIndex++;
        timeoutId = setTimeout(typeNextLine, 80 + Math.random() * 50); // Much faster
      } else {
        timeoutId = setTimeout(resetLines, 3000); // Wait 3s before looping
      }
    }
    
    lines.forEach(line => {
      if (line) {
        line.style.animation = 'none';
        line.style.transition = 'opacity 0.05s';
        line.style.opacity = '0';
      }
    });
    
    resetLines();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const setLineRef = (index) => (el) => {
    codeLinesRef.current[index] = el;
  };

  return (
    <div className="code-editor-mock">
      <div className="code-editor-header">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
      </div>
      <div className="code-editor-body" style={{ height: 'auto', minHeight: '250px' }}>
        <pre className="typewriter-line" ref={setLineRef(0)}><span className="hljs-keyword">import</span> flvcon</pre>
        <pre className="typewriter-line" ref={setLineRef(1)}>flvcon.<span className="hljs-property">api_key</span> = <span className="hljs-string">"YOUR_API_KEY"</span></pre>
        <pre className="typewriter-line" ref={setLineRef(2)}><span className="hljs-comment"># Load the object detection model</span></pre>
        <pre className="typewriter-line" ref={setLineRef(3)}>model = flvcon.<span className="hljs-function">load_model</span>(<span className="hljs-string">"flvcon_vision_pro_v2"</span>)</pre>
        <pre className="typewriter-line" ref={setLineRef(4)}></pre>
        <pre className="typewriter-line" ref={setLineRef(5)}><span className="hljs-keyword">proc function</span> <span className="hljs-function">image_detect</span>() {'{'}</pre>
        <pre className="typewriter-line" ref={setLineRef(6)}>    image = flvcon.<span className="hljs-function">image</span>(<span className="hljs-string">"test_image.jpg"</span>)</pre>
        <pre className="typewriter-line" ref={setLineRef(7)}>    detections = <span className="hljs-function">modect</span>(image)</pre>
        <pre className="typewriter-line" ref={setLineRef(8)}>    <span className="hljs-built_in">print</span>(<span className="hljs-string">"Object: "</span> + <span className="hljs-built_in">str</span>(label) + <span className="hljs-string">", Confidence: "</span> + <span className="hljs-built_in">str</span>(score))</pre>
        <pre className="typewriter-line" ref={setLineRef(9)}>{'}'}</pre>
        <pre className="typewriter-line" ref={setLineRef(10)}></pre>
        <pre className="typewriter-line" ref={setLineRef(11)}><span className="hljs-built_in">print</span>(<span className="hljs-string">{`f"Processing initialized..."`}</span>)</pre>
        <pre className="typewriter-line" ref={setLineRef(12)}><span className="hljs-comment"># Initialize live video stream</span></pre>
        <pre className="typewriter-line" ref={setLineRef(13)}>cap = flvcon.<span className="hljs-function">VideoCapture</span>(<span className="hljs-string">0</span>)</pre>
        <pre className="typewriter-line" ref={setLineRef(14)}><span className="hljs-keyword">while</span> cap.<span className="hljs-function">isOpened</span>():</pre>
        <pre className="typewriter-line" ref={setLineRef(15)}>    ret, frame = cap.<span className="hljs-function">read</span>()</pre>
        <pre className="typewriter-line" ref={setLineRef(16)}>    <span className="hljs-keyword">if not</span> ret:</pre>
        <pre className="typewriter-line" ref={setLineRef(17)}>        <span className="hljs-keyword">break</span></pre>
        <pre className="typewriter-line" ref={setLineRef(18)}></pre>
        <pre className="typewriter-line" ref={setLineRef(19)}>    <span className="hljs-comment"># Run real-time inference</span></pre>
        <pre className="typewriter-line" ref={setLineRef(20)}>    results = <span className="hljs-function">model</span>(frame)</pre>
        <pre className="typewriter-line" ref={setLineRef(21)}><span className="hljs-built_in">print</span>(<span className="hljs-string">{`f"Frame processed: {len(results)} objects detected."`}</span>)</pre>
        <pre className="typewriter-line" ref={setLineRef(22)}>    </pre>
        <pre className="typewriter-line" ref={setLineRef(23)}><span className="hljs-built_in">print</span>(<span className="hljs-string">"Processing complete. System shutting down."</span>)</pre>
      </div>
    </div>
  );
}
