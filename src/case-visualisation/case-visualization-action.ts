import { ActivityNode, Edge, EventNode, GatewayNode } from '@axonivy/process-editor';
import {
  Action,
  type Args,
  Command,
  type CommandExecutionContext,
  type CommandReturn,
  TYPES
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { EdgeRouterRegistry, SModelRootImpl } from 'sprotty';

export interface CaseVisualizationAction extends Action {
  kind: typeof CaseVisualizationAction.KIND;
}

/**
 * interface used to define the properties of the fetched mining-data
 */
export interface ProcessData {
  processName: string;
  nodes: Node[];
  activeElementIds: string[];
  passedColor: string;
  activeColor: string;
}

export interface Node {
  type: string;
  id: string;
  passed: boolean;
}

@injectable()
export class ProcessUrl {
  readonly url: string;
}

/**
 * Action which is fired when the Mining-Data is to be displayed
 */
export namespace CaseVisualizationAction {
  export const KIND = 'caseVisualizationCommand';
  export function create(): CaseVisualizationAction {
    return {
      kind: KIND
    };
  }

  export function is(object: unknown): object is CaseVisualizationAction {
    return Action.hasKind(object, KIND);
  }
}

/**
 * Command which is executed when a MiningAction is fired
 */
@injectable()
export class CaseVisualizationCommand extends Command {
  static readonly KIND = CaseVisualizationAction.KIND;
  @inject(ProcessUrl) protected processData: ProcessUrl;
  constructor(@inject(TYPES.Action) protected readonly action: CaseVisualizationAction) {
    super();
  }

  @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    return this.populate(model);
  }

  async populate(model: SModelRootImpl) {
    // fetches case process data from the provided url
    const data: ProcessData = await (await fetch(this.processData.url)).json();
    const passedElementArgs: Args = { "color": data.passedColor };
    const activedElementArgs: Args = { "color": data.activeColor };
    data.nodes.forEach(node => {
      const element = model.index.getById(node.id);
      if (element instanceof Edge || element instanceof ActivityNode || element instanceof EventNode || element instanceof GatewayNode) {
        // Handle for passed element
        if (node.passed) {
          element.args = passedElementArgs;
          element.cssClasses = ["passed"];
        }

        // Handle for active element
        if (data.activeElementIds.includes(node.id)) {
          element.args = activedElementArgs;
          element.cssClasses = ["active"];
        }
      }
    });

    return model;
  }

  undo(context: CommandExecutionContext): CommandReturn {
    return context.root;
  }

  redo(context: CommandExecutionContext): CommandReturn {
    return this.execute(context);
  }
}
