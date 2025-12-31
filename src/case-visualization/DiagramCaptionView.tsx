import { svg, GLabelView } from '@eclipse-glsp/client';
import { DiagramCaption } from './DiagramCaption';
import { injectable } from 'inversify';

const JSX = { createElement: svg };

/**
 * Called when DiagramCaption is rendered
 * Places the provided text above/below the diagram based on 'DiagramCaption.location'
 */
@injectable()
export class DiagramCaptionView extends GLabelView {
  render(node: DiagramCaption) {
    const x = node.canvasBounds.x;
    let y = node.canvasBounds.y - 20;
    if (node.location === 'end') {
      y = node.canvasBounds.height + 40;
    }
    return (
      <g>
        <text class-diagram-caption={true} class-sprotty-label={true} x={x} y={y}>
          {node.caption}
        </text>
      </g>
    );
  }
}
