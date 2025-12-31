import { ActivityNode, Edge, EventNode, GatewayNode } from '@axonivy/process-editor';
import { Action, type Args, Command, type CommandExecutionContext, type CommandReturn, GLabel, TYPES } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { EdgeRouterRegistry, SModelRootImpl, type RoutedPoint } from 'sprotty';
import { MiningLabel } from './MiningLabel';

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
  numberOfInstances: number;
  colors: string[];
}

export interface Node {
  type: string;
  id: string;
  passed: boolean;
  relativeValue: number;
  labelValue: number;
}

@injectable()
export class ProcessUrl {
  readonly url: string;
}

@injectable()
export class MiningColor {
  colors: string[];
}

export let miningColor: MiningColor;

export function setMiningColor(color: MiningColor) {
  miningColor = color;
}

@injectable()
export class MiningTextColor {
  textColor: string[];
}

export let miningTextColor: MiningTextColor;

export function setMiningTextColor(textColor: MiningTextColor) {
  miningTextColor = textColor;
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
    const passedElementArgs: Args = { color: data.passedColor };
    const activedElementArgs: Args = { color: data.activeColor };
    data.nodes.forEach(node => {
      const element = model.index.getById(node.id);
      if (element instanceof Edge || element instanceof ActivityNode || element instanceof EventNode || element instanceof GatewayNode) {
        // Handle for passed element
        if (node.passed) {
          element.args = passedElementArgs;
          element.cssClasses = ['passed'];
        }

        // Handle for active element
        if (data.activeElementIds.includes(node.id)) {
          element.args = activedElementArgs;
          element.cssClasses = ['active'];
        }
      }

      if (element instanceof Edge) {
        const segments = this.edgeRouterRegistry.route(element, element.args);
        const miningLabel = new MiningLabel(node.labelValue.toString(), node.relativeValue, segments);
        this.moveExistingLabel(element.editableLabel as GLabel, segments);
        element.add(miningLabel);
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

  // moves exisitng edge-label in regard to edge-segment orientation to avoid overlap
  moveExistingLabel = (label: GLabel, segments: Array<RoutedPoint>) => {
    if (!label || label.text === '' || segments.length < 2) {
      return;
    }
    const p1 = segments[segments.length - 2];
    const p2 = segments[segments.length - 1];
    const p = { ...label.position };
    const pM = {
      x: p2.x - (p2.x - p1.x) / 2,
      y: p2.y - (p2.y - p1.y) / 2
    };
    const distance = Math.sqrt(Math.pow(p.x - pM.x, 2) + Math.pow(p.y - pM.y, 2));
    if (distance < 30) {
      const xOffset = p2.x - p1.x;
      const yOffset = p2.y - p1.y;
      if (xOffset > yOffset) {
        p.y += 30 - distance;
      } else {
        p.x += 30 - distance;
      }
      label.position = p;
    }
  };
}
