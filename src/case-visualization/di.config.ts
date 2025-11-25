import {
  FeatureModule,
  SetModelAction,
  UpdateModelAction,
  configureActionHandler,
  configureCommand
} from '@eclipse-glsp/client';
import { CaseVisualizationCommand } from './case-visualization-action';
import { CaseVisualizationActionHandler } from './action';

// registers CaseVisualizationActionHandler, CaseVisualizationCommand and Views
export const ivyCaseVisualizationModule = new FeatureModule((bind, _unbind, isBound) => {
  configureActionHandler({ bind, isBound }, UpdateModelAction.KIND, CaseVisualizationActionHandler);
  configureActionHandler({ bind, isBound }, SetModelAction.KIND, CaseVisualizationActionHandler);
  configureCommand({ bind, isBound }, CaseVisualizationCommand);
});
