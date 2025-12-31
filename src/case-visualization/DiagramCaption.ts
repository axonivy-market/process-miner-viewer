import { Bounds, GLabel } from '@eclipse-glsp/client';

/**
 * Used to display DiagramCaption
 * @param canvasBounds: size of the diagram
 * @param caption: text to display
 * @param location: wheter the caption is to be displayed above or below
 */
export class DiagramCaption extends GLabel {
  static readonly TYPE = 'diagram-caption';
  constructor(
    public readonly canvasBounds: Bounds = Bounds.EMPTY,
    public readonly caption: string = '',
    public readonly location: 'start' | 'end' = 'start',
    public readonly type: string = DiagramCaption.TYPE
  ) {
    super();
  }
}
