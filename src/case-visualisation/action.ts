import { GLSPActionDispatcher, type IActionHandler } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { CaseVisualizationAction } from './case-visualization-action';

@injectable()
export class CaseVisualizationActionHandler implements IActionHandler {
  @inject(GLSPActionDispatcher) protected actionDispatcher: GLSPActionDispatcher;
  handle = (): void => {
    this.actionDispatcher.dispatch(CaseVisualizationAction.create());
  };
}
