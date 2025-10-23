const pSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.35 28.35" width="100" height="100">
  <defs>
    <style>
      .cls-1 {
        fill: #000;
      }
    </style>
  </defs>
  <path class="cls-1" d="M8.38,22.36V5.9h5.33c2.02,0,3.34.08,3.95.25.94.25,1.73.78,2.37,1.61.64.83.96,1.9.96,3.21,0,1.01-.18,1.86-.55,2.55-.37.69-.83,1.23-1.4,1.62-.57.39-1.14.65-1.72.78-.79.16-1.94.24-3.45.24h-2.17v6.21h-3.32ZM11.71,8.68v4.67h1.82c1.31,0,2.19-.09,2.63-.26.44-.17.79-.44,1.04-.81s.38-.79.38-1.28c0-.6-.18-1.09-.53-1.48s-.8-.63-1.34-.73c-.4-.07-1.19-.11-2.39-.11h-1.61Z"/>
</svg>`;

export function getPSvg(): string {
    return "data:image/svg+xml;utf8," + encodeURIComponent(pSvg);
}

const wSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.35 28.35" width="100" height="100">
  <defs>
    <style>
      .cls-1 {
        fill: #000;
      }
    </style>
  </defs>
  <path class="cls-1" d="M7.33,22.36L3.4,5.9h3.4l2.48,11.31,3.01-11.31h3.95l2.89,11.5,2.53-11.5h3.35l-4,16.46h-3.53l-3.28-12.31-3.27,12.31h-3.6Z"/>
</svg>`;

export function getWSvg(): string {
    return "data:image/svg+xml;utf8," + encodeURIComponent(wSvg);
}
