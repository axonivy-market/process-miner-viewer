import { svg, GLabelView } from '@eclipse-glsp/client';
import type { VNode } from 'snabbdom';
import { inject, injectable } from 'inversify';
import { MiningLabel } from './MiningLabel';
import { TEST } from './mining-action';

const JSX = { createElement: svg };

/**
 * Called when MiningLabel is rendered
 * Places a circle on the edge containing the mining data
 * Adjusts the circle (size/color) based on provided metrics
 */
@injectable()
export class MiningLabelView extends GLabelView {
  @inject(TEST) protected test: TEST;
  render(label: MiningLabel): VNode | undefined {
    if (label.segments.length < 2) {
      return;
    }
    console.log(this.test.colors);
    const props = this.getCircleProps(label.relativeValue, this.test.colors);
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

  getCircleProps = (value: number, colors: string[]): { r: number; color: string; textColor: string } => {
    
    const props = { r: 10, color: 'white', textColor: 'black' };
    if (value <= 0.1) {
      props.r = 10;
      props.color = colors[0];
      console.warn(props.color);
    } else if (value <= 0.2) {
      props.r = 11;
      props.color = colors[1];
    } else if (value <= 0.3) {
      props.r = 12;
      props.color = colors[2];
    } else if (value <= 0.4) {
      props.r = 13;
      props.color = colors[3];
      props.textColor = '#ffffff';
    } else if (value <= 0.5) {
      props.r = 14;
      props.color = colors[4];
      props.textColor = '#ffffff';
    } else if (value <= 0.6) {
      props.r = 15;
      props.color = colors[5];
      props.textColor = '#ffffff';
    } else if (value <= 0.7) {
      props.r = 16;
      props.color = colors[6];
      props.textColor = '#ffffff';
    } else if (value <= 0.8) {
      props.r = 17;
      props.color = colors[7];
      props.textColor = '#ffffff';
    } else if (value <= 0.9) {
      props.r = 18;
      props.color = colors[8];
      props.textColor = '#ffffff';
    } else if (value <= 1) {
      props.r = 19;
      props.color = colors[9];
      props.textColor = '#ffffff';
    }
    return props;
  };
}
