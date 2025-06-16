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
    const toRgb = (hex: string) => {
      const val = hex.replace('#', '');
      const num = parseInt(val, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
      };
    };

    const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const contrast = (hex1: string, hex2: string) => {
      const l1 = luminance(toRgb(hex1));
      const l2 = luminance(toRgb(hex2));
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const black = '#000000';
    const white = '#ffffff';

    return contrast(bgColor, white) >= contrast(bgColor, black) ? white : black;
  }
}
