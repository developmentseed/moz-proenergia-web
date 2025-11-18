// worker.ts
self.onmessage = (e: MessageEvent) => {
  const { remoteData, range } = e.data;
  const matched: (number | boolean)[] = [];
  
  for (const row of remoteData) {
    const show = row['CurrentMVLineDist'] > range[0] && row['CurrentMVLineDist'] < range[1];
    matched.push(parseInt(row['fid']), show);
  }

  self.postMessage(matched);
};