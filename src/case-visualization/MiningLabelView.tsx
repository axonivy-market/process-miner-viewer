import { svg, GLabelView } from '@eclipse-glsp/client';
import type { VNode } from 'snabbdom';
import { inject, injectable } from 'inversify';
import { MiningLabel } from './MiningLabel';
import { frequencyColorForCaseViewer, frequencyTextColorForCaseViewer } from './case-visualization-action';

const JSX = { createElement: svg };

/**
 * Called when MiningLabel is rendered
 * Places a circle on the edge containing the mining data
 * Adjusts the circle (size/color) based on provided metrics
 */
@injectable()
export class MiningLabelView extends GLabelView {
  // @inject(MiningColor) colorSegment: MiningColor;
  // @inject(MiningTextColor) textColor: MiningTextColor;

  render(label: MiningLabel): VNode | undefined {
    console.log(label);

    if (label.segments.length < 2) {
      return;
    }
    console.log(frequencyColorForCaseViewer.color);
    console.log(frequencyTextColorForCaseViewer.textColor);

    // const props = this.getCircleProps(label.relativeValue, miningColor.colors, miningTextColor.textColor);
    const props2 = this.getCircleProps2(label.relativeValue, frequencyColorForCaseViewer.color, frequencyTextColorForCaseViewer.textColor);

    const segments = label.segments;
    const p1 = segments[segments.length - 2];
    const p2 = segments[segments.length - 1];

    // Direction vector from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Total length of the segment
    const length = Math.sqrt(dx * dx + dy * dy);
    //The distance between the number circle and the top of the arrow
    const offset = 20;
    // Unit vector (direction)
    const ux = dx / length;
    const uy = dy / length;

    // Point near the arrow tip, offset back a bit
    const p = {
      x: p2.x - ux * offset,
      y: p2.y - uy * offset
    };

    return (
      // <g>
      //   <circle cy={p.y} cx={p.x} stroke='var(--glsp-border)' fill={props.color} stroke-width='0' r={props.r}></circle>
      //   <text style={{ fill: props.textColor }} text-anchor='middle' dy='0.35em' x={p.x} y={p.y}>
      //     {label.text}
      //   </text>
      // </g>
      <g>
        <circle cy={p.y} cx={p.x} stroke='var(--glsp-border)' fill={props2.color} stroke-width='0' r={props2.r}></circle>
        <text style={{ fill: props2.textColor }} text-anchor='middle' dy='0.35em' x={p.x} y={p.y}>
          {label.text}
        </text>
      </g>
    );
  }

  getCircleProps = (value: number, colors: string[], textColors: string[]): { r: number; color: string; textColor: string } => {
    console.log(colors);

    let index = Math.floor(value * 10);
    index = Math.min(Math.max(index, 0), colors.length - 1);
    const color = colors[index];
    const textColor = textColors[index];
    const roundRatio = 9.4 + index * 0.4;

    return { r: roundRatio, color, textColor };
  };

  getCircleProps2 = (
    value: number,
    frequencyColor: string,
    frequencyTextColor: string
  ): { r: number; color: string; textColor: string } => {
    console.log('Frequency Color: ' + frequencyColor);
    console.log('Frequency Text Color: ' + frequencyTextColor);

    let index = Math.floor(value * 10);
    // index = Math.min(Math.max(index, 0), colors.length - 1);
    const color = frequencyColor;
    const textColor = frequencyTextColor;
    const roundRatio = 9.4 + index * 0.4;

    return { r: roundRatio, color, textColor };
  };
}
