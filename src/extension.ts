import * as vscode from 'vscode';
import { WorkflowOrchestrator } from './orchestrator';
import { StateManager } from './stateManager';

let orchestrator: WorkflowOrchestrator | undefined;

// Simple TreeDataProvider for views
class EDAViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private roleName: string, private stateManager: StateManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    const state = this.stateManager.getState();
    const items: vscode.TreeItem[] = [];

    switch (this.roleName) {
      case 'Father':
        if (state.instruction) {
          items.push(new vscode.TreeItem(`Type: ${state.instruction.type}`));
          items.push(new vscode.TreeItem(`Priority: ${state.instruction.priority}`));
          items.push(new vscode.TreeItem(`Description: ${state.instruction.description}`));
        } else {
          items.push(new vscode.TreeItem('No instruction yet'));
        }
        break;
      case 'Mother':
        if (state.data) {
          items.push(new vscode.TreeItem(`File: ${state.data.path}`));
          items.push(new vscode.TreeItem(`Format: ${state.data.format}`));
          items.push(new vscode.TreeItem(`Size: ${(state.data.size / 1024).toFixed(2)} KB`));
        } else {
          items.push(new vscode.TreeItem('No data yet'));
        }
        break;
      case 'Son':
        if (state.execution) {
          items.push(new vscode.TreeItem(`Status: ${state.execution.status}`));
          items.push(new vscode.TreeItem(`Results: ${state.execution.results.length}`));
        } else {
          items.push(new vscode.TreeItem('No execution yet'));
        }
        break;
      case 'Daughter':
        if (state.critique) {
          items.push(new vscode.TreeItem(`Status: ${state.critique.status}`));
          items.push(new vscode.TreeItem(`Issues: ${state.critique.issues.length}`));
        } else {
          items.push(new vscode.TreeItem('No critique yet'));
        }
        break;
    }

    items.push(new vscode.TreeItem(`Stage: ${state.currentStage}`));
    return items;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('EDA Family Orchestration extension is now active');

  const stateManager = StateManager.getInstance(context);
  orchestrator = new WorkflowOrchestrator(context);

  // Register TreeDataProviders for each view
  const fatherView = new EDAViewProvider('Father', stateManager);
  const motherView = new EDAViewProvider('Mother', stateManager);
  const sonView = new EDAViewProvider('Son', stateManager);
  const daughterView = new EDAViewProvider('Daughter', stateManager);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('edaFatherView', fatherView),
    vscode.window.registerTreeDataProvider('edaMotherView', motherView),
    vscode.window.registerTreeDataProvider('edaSonView', sonView),
    vscode.window.registerTreeDataProvider('edaDaughterView', daughterView)
  );

  const startWorkflowCommand = vscode.commands.registerCommand(
    'eda-family.startWorkflow',
    async () => {
      if (orchestrator) {
        await orchestrator.startWorkflow();
      }
    }
  );

  const configureFatherCommand = vscode.commands.registerCommand(
    'eda-family.configureFather',
    async () => {
      await vscode.commands.executeCommand('workbench.action.openSettings', 'edaFamily');
    }
  );

  const resetWorkflowCommand = vscode.commands.registerCommand(
    'eda-family.resetWorkflow',
    () => {
      if (orchestrator) {
        orchestrator.resetWorkflow();
      }
    }
  );

  const exportResultsCommand = vscode.commands.registerCommand(
    'eda-family.exportResults',
    async () => {
      if (orchestrator) {
        await vscode.commands.executeCommand('eda-family.showFinalReport');
      }
    }
  );

  const refreshViewsCommand = vscode.commands.registerCommand(
    'eda-family.refreshViews',
    () => {
      fatherView.refresh();
      motherView.refresh();
      sonView.refresh();
      daughterView.refresh();
    }
  );

  context.subscriptions.push(
    startWorkflowCommand,
    configureFatherCommand,
    resetWorkflowCommand,
    exportResultsCommand,
    refreshViewsCommand
  );

  vscode.commands.executeCommand('setContext', 'eda-family:enabled', true);

  vscode.window.showInformationMessage(
    'EDA Family Orchestration extension activated! Use the command palette to start a workflow.'
  );
}

export function deactivate() {
  if (orchestrator) {
    orchestrator.dispose();
  }
}