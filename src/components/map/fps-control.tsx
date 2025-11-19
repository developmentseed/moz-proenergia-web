import { useControl } from 'react-map-gl/maplibre';
import type { ControlPosition } from 'maplibre-gl';
import type { MapInstance } from 'react-map-gl/maplibre';

interface FPSControlOptions {
  background?: string;
  barWidth?: number;
  color?: string;
  font?: string;
  graphHeight?: number;
  graphWidth?: number;
  graphTop?: number;
  graphRight?: number;
  width?: number;
}

interface FPSStats {
  frames: number;
  totalTime: number;
  totalFrames: number;
  time: number | null;
}

class FPSControl {
  private map: MapInstance | null = null;
  private container: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private readOutput: HTMLDivElement | null = null;
  private options: Required<FPSControlOptions>;
  private stats: FPSStats = {
    frames: 0,
    totalTime: 0,
    totalFrames: 0,
    time: null
  };

  constructor(options: FPSControlOptions = {}) {
    const dpr = window.devicePixelRatio || 1;

    this.options = {
      background: options.background ?? 'rgba(0,0,0,0.9)',
      barWidth: options.barWidth ?? 4 * dpr,
      color: options.color ?? '#7cf859',
      font: options.font ?? 'Monaco, Consolas, Courier, monospace',
      graphHeight: options.graphHeight ?? 60 * dpr,
      graphWidth: options.graphWidth ?? 90 * dpr,
      graphTop: options.graphTop ?? 0,
      graphRight: options.graphRight ?? 5 * dpr,
      width: options.width ?? 100 * dpr
    };
  }

  onAdd = (map: MapInstance): HTMLElement => {
    this.map = map;

    const dpr = window.devicePixelRatio || 1;
    const {
      width,
      graphHeight,
      color,
      background,
      font
    } = this.options;

    // Create container
    const el = document.createElement('div');
    el.className = 'maplibregl-ctrl maplibregl-ctrl-fps';
    el.style.backgroundColor = background;
    el.style.borderRadius = '6px';
    this.container = el;

    // Create text output
    this.readOutput = document.createElement('div');
    this.readOutput.style.color = color;
    this.readOutput.style.fontFamily = font;
    this.readOutput.style.padding = '0 5px 5px';
    this.readOutput.style.fontSize = '9px';
    this.readOutput.style.fontWeight = 'bold';
    this.readOutput.textContent = 'Waiting…';

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'maplibregl-ctrl-canvas';
    this.canvas.width = width;
    this.canvas.height = graphHeight;
    this.canvas.style.cssText = `width: ${width / dpr}px; height: ${graphHeight / dpr}px;`;

    el.appendChild(this.readOutput);
    el.appendChild(this.canvas);

    // Attach event listeners
    this.map.on('movestart', this.onMoveStart);
    this.map.on('moveend', this.onMoveEnd);

    return this.container;
  };

  onRemove = (): void => {
    if (this.map) {
      this.map.off('render', this.onRender);
      this.map.off('movestart', this.onMoveStart);
      this.map.off('moveend', this.onMoveEnd);
    }

    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.map = null;
    this.container = null;
    this.canvas = null;
    this.readOutput = null;
  };

  private onMoveStart = (): void => {
    this.stats.frames = 0;
    this.stats.time = performance.now();
    this.map?.on('render', this.onRender);
  };

  private onMoveEnd = (): void => {
    const now = performance.now();
    this.updateGraph(this.getFPS(now));
    this.stats.frames = 0;
    this.stats.time = null;
    this.map?.off('render', this.onRender);
  };

  private onRender = (): void => {
    this.stats.frames++;
    const now = performance.now();

    if (this.stats.time !== null && now >= this.stats.time + 1000) {
      this.updateGraph(this.getFPS(now));
      this.stats.frames = 0;
      this.stats.time = now;
    }
  };

  private getFPS = (now: number): number => {
    if (this.stats.time === null) return 0;

    this.stats.totalTime += now - this.stats.time;
    this.stats.totalFrames += this.stats.frames;

    return Math.round((1000 * this.stats.frames) / (now - this.stats.time)) || 0;
  };

  private updateGraph = (fpsNow: number): void => {
    if (!this.canvas || !this.readOutput) return;

    const {
      barWidth,
      graphRight,
      graphTop,
      graphWidth,
      graphHeight,
      background,
      color
    } = this.options;

    const context = this.canvas.getContext('2d');
    if (!context) return;

    const fps = Math.round((1000 * this.stats.totalFrames) / this.stats.totalTime) || 0;
    const rect = barWidth;

    // Clear background
    context.fillStyle = background;
    context.globalAlpha = 1;
    context.fillRect(0, 0, graphWidth, graphTop);
    context.fillStyle = color;

    // Update text
    this.readOutput.textContent = `${fpsNow} FPS (${fps} Avg)`;

    // Shift graph left
    context.drawImage(
      this.canvas,
      graphRight + rect,
      graphTop,
      graphWidth - rect,
      graphHeight,
      graphRight,
      graphTop,
      graphWidth - rect,
      graphHeight
    );

    // Draw new bar
    context.fillRect(
      graphRight + graphWidth - rect,
      graphTop,
      rect,
      graphHeight
    );

    // Draw fps indicator
    context.fillStyle = background;
    context.globalAlpha = 0.75;
    context.fillRect(
      graphRight + graphWidth - rect,
      graphTop,
      rect,
      (1 - fpsNow / 100) * graphHeight
    );
  };

  getDefaultPosition(): ControlPosition {
    return 'top-right';
  }
}

export interface FPSControlProps extends FPSControlOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function FPSControlComponent({ position = 'top-right', ...options }: FPSControlProps) {
  useControl<FPSControl>(
    () => new FPSControl(options),
    {
      position: position
    }
  );
 
  return null;
}

export default FPSControlComponent;
