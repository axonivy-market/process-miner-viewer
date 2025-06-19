import { IvyBaseJsonrpcGLSPClient, SwitchThemeActionHandler } from '@axonivy/process-editor';
import type { ThemeMode } from '@axonivy/process-editor-protocol';
import { DiagramLoader, EditMode, GLSPActionDispatcher, GLSPWebSocketProvider, MessageAction, StatusAction } from '@eclipse-glsp/client';
import { ApplicationIdProvider, GLSPClient } from '@eclipse-glsp/protocol';
import { Container } from 'inversify';
import type { MessageConnection } from 'vscode-jsonrpc';
import createContainer from './di.config';
import './index.css';
import { getParameters, getServerDomain, isSecureConnection } from './url-helper';
import { MiningUrl, MiningColor, setMiningColor, MiningTextColor, setMiningTextColor } from './process-mining-visualisation/mining-action';

const parameters = getParameters();
const app = parameters.get('app') ?? 'designer';
let server = parameters.get('server');
if (!server) {
  server = getServerDomain().replace(app, '');
}

// read miningUrl from parameters
const miningUrlParam = parameters.get('miningUrl') ?? 'http://localhost:3000/mock.json';
const pmv = parameters.get('pmv') ?? '';
const pid = parameters.get('pid') ?? '';
const sourceUri = parameters.get('file') ?? '';
const highlight = parameters.get('highlight') ?? '';
const select = parameters.get('select');
const zoom = parameters.get('zoom') ?? '';
const theme = (parameters.get('theme') as ThemeMode) ?? SwitchThemeActionHandler.prefsColorScheme();

const id = 'ivy-glsp-process-viewer';
const diagramType = 'ivy-glsp-process';
const clientId = ApplicationIdProvider.get() + '_' + sourceUri + pid;

const webSocketBase = `${isSecureConnection() ? 'wss' : 'ws'}://${server}/`;
const webSocketUrl = `${webSocketBase}${app}/${id}`;

let glspClient: GLSPClient;
let container: Container;
const wsProvider = new GLSPWebSocketProvider(webSocketUrl, { reconnectDelay: 5000, reconnectAttempts: 120 });
wsProvider.listen({ onConnection: initialize, onReconnect: reconnect, logger: console });

async function initialize(connectionProvider: MessageConnection, isReconnecting = false): Promise<void> {
  glspClient = new IvyBaseJsonrpcGLSPClient({ id, connectionProvider });
  container = createContainer({
    clientId,
    diagramType,
    glspClientProvider: async () => glspClient,
    sourceUri,
    editMode: EditMode.READONLY,
    highlight,
    select,
    zoom,
    theme
  });

  // binds the mining url as const to be injected into the MiningCommand
  container.bind(MiningUrl).toConstantValue({ url: miningUrlParam });
  container.bind(MiningColor).toSelf().inSingletonScope();
  container.bind(MiningTextColor).toSelf().inSingletonScope();

  const colorInstance = container.get(MiningColor);
  setMiningColor(colorInstance);
  const textColorInstance = container.get(MiningTextColor);
  setMiningTextColor(textColorInstance);

  const diagramLoader = container.get(DiagramLoader);
  await diagramLoader.load({
    // Our custom server needs the 'readonly' argument here as well and not only set through the edit mode in the diagram options
    requestModelOptions: { isReconnecting, app, pmv, pid, highlight, readonly: true, diagramType },
    initializeParameters: {
      applicationId: ApplicationIdProvider.get(),
      protocolVersion: GLSPClient.protocolVersion
    }
  });

  const actionDispatcher = container.get(GLSPActionDispatcher);
  if (isReconnecting) {
    const message = `Connection to the ${id} glsp server got closed. Connection was successfully re-established.`;
    const timeout = 5000;
    const severity = 'WARNING';
    actionDispatcher.dispatchAll([StatusAction.create(message, { severity, timeout }), MessageAction.create(message, { severity })]);
  }
}

async function reconnect(connectionProvider: MessageConnection): Promise<void> {
  glspClient.stop();
  initialize(connectionProvider, true /* isReconnecting */);
}
