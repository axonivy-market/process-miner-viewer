import {
  FeatureModule,
  SetModelAction,
  UpdateModelAction,
  configureActionHandler,
  configureCommand,
  configureModelElement
} from '@eclipse-glsp/client';
import { CaseVisualizationCommand } from './case-visualization-action';
import { CaseVisualizationActionHandler } from './action';
import { MiningLabel } from './MiningLabel';
import { MiningLabelView } from './MiningLabelView';

// registers CaseVisualizationActionHandler, CaseVisualizationCommand and Views
export const ivyCaseVisualizationModule = new FeatureModule((bind, _unbind, isBound) => {
  configureActionHandler({ bind, isBound }, UpdateModelAction.KIND, CaseVisualizationActionHandler);
  configureActionHandler({ bind, isBound }, SetModelAction.KIND, CaseVisualizationActionHandler);
  configureCommand({ bind, isBound }, CaseVisualizationCommand);
  configureModelElement({ bind, isBound }, MiningLabel.TYPE, MiningLabel, MiningLabelView);
});
