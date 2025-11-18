import { useState, useEffect } from 'react';
// @ts-expect-error ts can't find d3 module and I am not sure what is going on
import * as d3 from 'd3';

export function useRemoteData(path:string) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (data.length) return;
    async function loadData() {
      const result = await d3.csv(path)
      setData(result);
    }
    loadData()
  },[])
  return {
    data
  }
}