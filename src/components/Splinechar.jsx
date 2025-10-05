import React, { useEffect } from 'react';

export default function Splinechar() {
  useEffect(() => {
    // Load Spline Viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.74/build/spline-viewer.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <spline-viewer 
      url="https://prod.spline.design/qaEKsV6bWm2kppKa/scene.splinecode"
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
}
