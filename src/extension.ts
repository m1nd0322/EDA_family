import * as vscode from 'vscode';
import { WorkflowOrchestrator } from './orchestrator';
import { StateManager } from './stateManager';

let orchestrator: WorkflowOrchestrator | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('EDA Family Orchestration extension is now active');

  StateManager.getInstance(context);
  orchestrator = new WorkflowOrchestrator(context);

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
      vscode.commands.executeCommand('workbench.action.reloadWindow');
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