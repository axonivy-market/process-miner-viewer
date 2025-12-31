import { EdgeLabel } from '@axonivy/process-editor';
import { type RoutedPoint } from '@eclipse-glsp/client';

/**
 * Used to display mining-label (green circles)
 * @param text: text to display inside the circle
 * @param relativeValue: value which determines the size and color
 * @param segments: segments of the edge used to calculate the location of the circle
 */
export class MiningLabel extends EdgeLabel {
  static readonly TYPE = 'edge:label:mining';
  constructor(
    public readonly text: string = '',
    public readonly relativeValue: number = 0,
    public readonly segments: Array<RoutedPoint> = [],
    public readonly type: string = MiningLabel.TYPE
  ) {
    super();
  }
}
