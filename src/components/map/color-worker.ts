// color-worker.ts
self.onmessage = (e: MessageEvent) => {
  const { remoteData } = e.data;
  const matched: (number | string)[] = [];
  
  // Viridis color palette for 5 ranges
  const getColor = (value: number): string => {
    if (value < 0.5) return '#440154';
    if (value < 1.0) return '#3b528b';
    if (value < 1.5) return '#21918c';
    if (value < 2.0) return '#5ec962';
    return '#fde725';
  };
  
  for (const row of remoteData) {
    const color = getColor(row['MinimumOverallLCOE2027']);
    matched.push(parseInt(row['fid']), color);
  }
  self.postMessage(matched);
};