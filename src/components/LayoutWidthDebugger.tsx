
import React, { useState, useEffect } from 'react';

interface WidthInfo {
  width: number;
  maxWidth: string;
  margin: string;
  padding: string;
  boxSizing: string;
}

export default function LayoutWidthDebugger() {
  const [widths, setWidths] = useState<Record<string, WidthInfo>>({});
  
  useEffect(() => {
    const checkWidths = () => {
      const elements = document.querySelectorAll('body, #root, main, header');
      const widthInfo: Record<string, WidthInfo> = {};
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        widthInfo[el.tagName + (el.id ? `#${el.id}` : '')] = {
          width: rect.width,
          maxWidth: computed.maxWidth,
          margin: computed.marginLeft + ' ' + computed.marginRight,
          padding: computed.paddingLeft + ' ' + computed.paddingRight,
          boxSizing: computed.boxSizing
        };
      });
      
      setWidths(widthInfo);
    };
    
    checkWidths();
    window.addEventListener('resize', checkWidths);
    return () => window.removeEventListener('resize', checkWidths);
  }, []);
  
  return (
    <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2 text-yellow-400">Width Debug Info:</h3>
      <div className="text-green-400 mb-2">Window: {window.innerWidth}px</div>
      {Object.entries(widths).map(([key, info]) => (
        <div key={key} className="mt-2 border-b border-gray-600 pb-2">
          <div className="font-bold text-blue-300">{key}:</div>
          <div>Width: {info.width}px</div>
          <div>Max-width: {info.maxWidth}</div>
          <div>Margin: {info.margin}</div>
          <div className={info.width < window.innerWidth * 0.9 ? 'text-red-400' : 'text-green-400'}>
            {info.width < window.innerWidth * 0.9 ? '⚠️ CONSTRAINED' : '✅ Full Width'}
          </div>
        </div>
      ))}
    </div>
  );
}
