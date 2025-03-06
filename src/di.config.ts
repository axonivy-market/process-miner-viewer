import {
  createIvyDiagramContainer,
  ivyAccessibilityModule,
  ivyChangeBoundsToolModule,
  ivyConnectorModule,
  ivyKeyListenerModule,
  ivyLabelEditModule,
  ivyLabelEditUiModule,
  ivyLaneModule,
  ivyQuickActionModule,
  ivyThemeModule,
  ivyToolBarModule,
  ivyWrapModule,
  overrideIvyViewerOptions
} from '@axonivy/process-editor';
import { type ThemeMode } from '@axonivy/process-editor-protocol';
import {
  type IDiagramOptions,
  createDiagramOptionsModule,
  deletionToolModule,
  edgeEditToolModule,
  nodeCreationToolModule
} from '@eclipse-glsp/client';
import { Container } from 'inversify';
import ivyNavigationModule from './navigate/di.config';
import ivyViewerQuickActionModule from './quick-action/di.config';
import { ivyStartupDiagramModule } from './startup';
import { ivyMiningModule } from './process-mining-visualisation/di.config';

export interface IvyDiagramOptions extends IDiagramOptions {
  highlight: string;
  select: string | null;
  zoom: string;
  theme: ThemeMode;
}

export default function createContainer(options: IvyDiagramOptions): Container {
  // ivyNavigationModule is a replacement for navigationModule but it is already removed in the default IvyDiagramContainer
  const container = createIvyDiagramContainer(
    'sprotty',
    createDiagramOptionsModule(options),
    ivyThemeModule,
    ivyNavigationModule,
    ivyStartupDiagramModule,
    ivyKeyListenerModule,
    ivyMiningModule,
    {
      remove: [
        ivyLabelEditModule,
        ivyLabelEditUiModule,
        ivyChangeBoundsToolModule,
        ivyWrapModule,
        ivyLaneModule,
        ivyConnectorModule,
        deletionToolModule,
        edgeEditToolModule,
        nodeCreationToolModule,
        ivyToolBarModule,
        ivyAccessibilityModule
      ]
    },
    { remove: ivyQuickActionModule, add: ivyViewerQuickActionModule }
  );
  overrideIvyViewerOptions(container, { hideSensitiveInfo: true });
  return container;
}
