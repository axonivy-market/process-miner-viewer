import { svg, GLabelView } from '@eclipse-glsp/client';
import type { VNode } from 'snabbdom';
import { inject, injectable } from 'inversify';
import { MiningLabel } from './MiningLabel';
import { miningColor, MiningColor } from './mining-action';

const JSX = { createElement: svg };

/**
 * Called when MiningLabel is rendered
 * Places a circle on the edge containing the mining data
 * Adjusts the circle (size/color) based on provided metrics
 */
@injectable()
export class MiningLabelView extends GLabelView {
  @inject(MiningColor) colorSegment: MiningColor;
  render(label: MiningLabel): VNode | undefined {
    if (label.segments.length < 2) {
      return;
    }
    const props = this.getCircleProps(label.relativeValue, miningColor.colors);
    const segments = label.segments;
    const p1 = segments[segments.length - 2];
    const p2 = segments[segments.length - 1];

    // Direction vector from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Total length of the segment
    const length = Math.sqrt(dx * dx + dy * dy);
    //The distance between the number circle and the top of the arrow
    const offset = 20
    // Unit vector (direction)
    const ux = dx / length;
    const uy = dy / length;

    // Point near the arrow tip, offset back a bit
    const p = {
      x: p2.x - ux * offset,
      y: p2.y - uy * offset
    };

    return (
      <g>
        <circle cy={p.y} cx={p.x} stroke='var(--glsp-border)' fill={props.color} stroke-width='0' r={props.r}></circle>
        <text style={{ fill: props.textColor }} text-anchor='middle' dy='0.35em' x={p.x} y={p.y}>
          {label.text}
        </text>
      </g>
    );
  }

  getCircleProps = (
    value: number,
    colors: string[]
  ): { r: number; color: string; textColor: string } => {
    const props = { r: 10, color: 'white', textColor: 'black' };

    let index = Math.floor(value * 10);
    index = Math.min(Math.max(index, 0), colors.length - 1);

    const color = colors[index];
    props.color = color;
    props.r = 9.4 + index * 0.4;
    props.textColor = this.getAccessibleTextColor(color);

    return props;
  };

  getAccessibleTextColor(bgColor: string): string {
    const toRgb = (color: string): { r: number; g: number; b: number } => {
      if (color.startsWith('#')) {
        const val = color.replace('#', '');
        const bigint = parseInt(val, 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255
        };
      } else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (!matches || matches.length < 3) {
          throw new Error(`Invalid rgb() format: ${color}`);
        }
        return {
          r: parseInt(matches[0]),
          g: parseInt(matches[1]),
          b: parseInt(matches[2])
        };
      } else {
        throw new Error(`Unsupported color format: ${color}`);
      }
    };

    const luminance = ({ r, g, b }: { r: number; g: number; b: number }): number => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928
          ? v / 12.92
          : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const contrast = (c1: string, c2: string): number => {
      const l1 = luminance(toRgb(c1));
      const l2 = luminance(toRgb(c2));
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const black = '#000000';
    const white = '#ffffff';

    return contrast(bgColor, white) >= contrast(bgColor, black) ? white : black;
  }
}
