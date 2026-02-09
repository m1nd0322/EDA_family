import * as vscode from 'vscode';
import * as path from 'path';
import { StateManager } from './stateManager';
import { FatherRole } from './roles/father';
import { MotherRole } from './roles/mother';
import { SonRole } from './roles/son';
import { DaughterRole } from './roles/daughter';
import { EDACritique } from './types';

export class WorkflowOrchestrator {
  private stateManager: StateManager;
  private father: FatherRole;
  private mother: MotherRole;
  private son: SonRole;
  private daughter: DaughterRole;
  private previousCritiques: EDACritique[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.stateManager = StateManager.getInstance(context);
    this.father = new FatherRole(context);
    this.mother = new MotherRole(context);
    this.son = new SonRole(context);
    this.daughter = new DaughterRole(context);
  }

  public async startWorkflow(): Promise<void> {
    const state = this.stateManager.getState();
    
    if (state.currentStage !== 'idle') {
      const choice = await vscode.window.showWarningMessage(
        'A workflow is already in progress. Do you want to reset and start a new one?',
        'Yes, reset',
        'No, continue'
      );
      
      if (choice === 'Yes, reset') {
        this.resetWorkflow();
      } else if (choice === 'No, continue') {
        await this.continueWorkflow();
        return;
      } else {
        return;
      }
    }

    await this.runWorkflow();
  }

  private async runWorkflow(): Promise<void> {
    const config = vscode.workspace.getConfiguration('edaFamily');
    const autoProceed = config.get<boolean>('autoProceed', false);
    const maxIterations = config.get<number>('maxCritiqueIterations', 3);

    try {
      await this.executeFatherStage();
      
      if (!autoProceed && !await this.shouldContinue('Mother stage')) return;
      await this.executeMotherStage();
      
      if (!autoProceed && !await this.shouldContinue('Son stage')) return;
      
      let iterationCount = 0;
      
      while (iterationCount <= maxIterations) {
        await this.executeSonStage(this.previousCritiques.length > 0 ? this.previousCritiques[this.previousCritiques.length - 1] : undefined);
        
        if (!autoProceed && !await this.shouldContinue('Daughter stage')) break;
        
        const critique = await this.executeDaughterStage();
        if (!critique) break;
        
        if (this.daughter.shouldProceedToFather(critique, config)) {
          await this.completeWorkflow(critique);
          return;
        }
        
        this.previousCritiques.push(critique);
        iterationCount++;
        
        if (iterationCount > maxIterations) {
          vscode.window.showWarningMessage(
            `Maximum iterations (${maxIterations}) reached. Proceeding with current results.`
          );
          await this.completeWorkflow(critique);
          return;
        }
        
        if (!autoProceed) {
          const continueChoice = await vscode.window.showInformationMessage(
            `Iteration ${iterationCount}: Daughter found issues. Continue with Son's improvements?`,
            'Yes, continue',
            'Stop workflow'
          );
          
          if (continueChoice !== 'Yes, continue') {
            break;
          }
        }
      }
      
      await this.completeWorkflow(this.previousCritiques[this.previousCritiques.length - 1]);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Workflow error: ${error}`);
      this.resetWorkflow();
    }
  }

  private async continueWorkflow(): Promise<void> {
    const state = this.stateManager.getState();
    
    switch (state.currentStage) {
      case 'father_instruction':
        if (state.instruction) {
          await this.executeMotherStage();
        } else {
          vscode.window.showInformationMessage('No instruction found. Starting from Father.');
          await this.runWorkflow();
        }
        break;
        
      case 'mother_delivery':
        if (state.data) {
          await this.executeSonStage();
        } else {
          await this.executeMotherStage();
        }
        break;
        
      case 'son_execution':
        if (state.execution) {
          await this.executeDaughterStage();
        } else {
          await this.executeSonStage();
        }
        break;
        
      case 'daughter_critique':
        if (state.critique && state.critique.status === 'needs_improvement') {
          this.previousCritiques.push(state.critique);
          await this.executeSonStage(state.critique);
        } else if (state.critique) {
          await this.completeWorkflow(state.critique);
        } else {
          await this.executeDaughterStage();
        }
        break;
        
      default:
        await this.runWorkflow();
    }
  }

  private async executeFatherStage(): Promise<void> {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '👨‍💼 Father: Creating EDA instruction...',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0 });
      
      const instruction = await this.father.createInstruction();
      
      if (!instruction) {
        throw new Error('Father failed to create instruction');
      }
      
      this.stateManager.setInstruction(instruction);
      
      progress.report({ increment: 100 });
    });
  }

  private async executeMotherStage(): Promise<void> {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '👩‍💼 Mother: Preparing data...',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0 });
      
      const data = await this.mother.selectAndPrepareData();
      
      if (!data) {
        throw new Error('Mother failed to prepare data');
      }
      
      this.stateManager.setData(data);
      
      progress.report({ increment: 100 });
    });
  }

  private async executeSonStage(critique?: any): Promise<void> {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '👦 Son: Executing EDA...',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0 });
      
      const state = this.stateManager.getState();
      
      if (!state.instruction || !state.data) {
        throw new Error('Missing instruction or data');
      }
      
      const execution = await this.son.executeEDA(state.instruction, state.data, critique);
      
      if (!execution) {
        throw new Error('Son failed to execute EDA');
      }
      
      this.stateManager.setExecution(execution);
      
      progress.report({ increment: 100 });
    });
  }

  private async executeDaughterStage(): Promise<EDACritique | undefined> {
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: '👧 Daughter: Critiquing results...',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0 });
      
      const state = this.stateManager.getState();
      
      if (!state.execution) {
        throw new Error('No execution results to critique');
      }
      
      const critique = await this.daughter.critiqueResults(state.execution, this.previousCritiques);
      
      if (!critique) {
        throw new Error('Daughter failed to critique results');
      }
      
      this.stateManager.setCritique(critique);
      
      progress.report({ increment: 100 });
      
      return critique;
    });
  }

  private async completeWorkflow(critique: EDACritique): Promise<void> {
    this.stateManager.updateState({
      currentStage: 'completed'
    });

    const message = `🎉 Workflow completed! Daughter's status: ${critique.status.toUpperCase()}`;
    
    const action = await vscode.window.showInformationMessage(
      message,
      'View final report',
      'Export results',
      'Start new workflow'
    );

    if (action === 'View final report') {
      await this.showFinalReport();
    } else if (action === 'Export results') {
      await this.exportResults();
    } else if (action === 'Start new workflow') {
      this.resetWorkflow();
      await this.startWorkflow();
    }
  }

  private async showFinalReport(): Promise<void> {
    const state = this.stateManager.getState();
    
    const panel = vscode.window.createWebviewPanel(
      'edaFinalReport',
      'EDA Family Final Report',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = this.getFinalReportHtml(state);
  }

  private getFinalReportHtml(state: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EDA Family Final Report</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
          h1 { color: var(--vscode-textLink-foreground); text-align: center; }
          .section { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
          .role-header { font-size: 1.5em; margin: 10px 0; }
          pre { background: var(--vscode-textBlockQuote-background); padding: 10px; border-radius: 3px; overflow-x: auto; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
          .stat-box { background: var(--vscode-editor-selectionBackground); padding: 10px; border-radius: 5px; text-align: center; }
          .stat-value { font-size: 2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>🏠 EDA Family Final Report</h1>
        
        <div class="stats">
          <div class="stat-box">
            <div class="stat-value">${state.iterationCount}</div>
            <div>Iterations</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${state.history.length}</div>
            <div>Stages</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${state.critique?.status?.toUpperCase() || 'N/A'}</div>
            <div>Final Status</div>
          </div>
        </div>

        ${state.instruction ? `
          <div class="section">
            <div class="role-header">👨‍💼 Father's Instruction</div>
            <p><strong>Type:</strong> ${state.instruction.type}</p>
            <p><strong>Description:</strong> ${state.instruction.description}</p>
            <p><strong>Priority:</strong> ${state.instruction.priority}</p>
          </div>
        ` : ''}

        ${state.data ? `
          <div class="section">
            <div class="role-header">👩‍💼 Mother's Data</div>
            <p><strong>Path:</strong> ${state.data.path}</p>
            <p><strong>Format:</strong> ${state.data.format}</p>
            <p><strong>Size:</strong> ${(state.data.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ` : ''}

        ${state.execution ? `
          <div class="section">
            <div class="role-header">👦 Son's Execution</div>
            <p><strong>Status:</strong> ${state.execution.status}</p>
            <p><strong>Results:</strong> ${state.execution.results.length} result(s)</p>
            ${state.execution.error ? `<p style="color: #ff6b6b;"><strong>Error:</strong> ${state.execution.error}</p>` : ''}
          </div>
        ` : ''}

        ${state.critique ? `
          <div class="section">
            <div class="role-header">👧 Daughter's Critique</div>
            <p><strong>Status:</strong> ${state.critique.status}</p>
            <p><strong>Feedback:</strong> ${state.critique.feedback}</p>
            ${state.critique.issues.length > 0 ? `
              <p><strong>Issues:</strong> ${state.critique.issues.length}</p>
              <pre>${JSON.stringify(state.critique.issues, null, 2)}</pre>
            ` : '<p>No issues found!</p>'}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private async exportResults(): Promise<void> {
    const state = this.stateManager.getState();
    const config = vscode.workspace.getConfiguration('edaFamily');
    const outputPath = config.get<string>('outputPath', './eda_output');
    
    const exportPath = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(path.join(outputPath, `eda_export_${Date.now()}.json`)),
      filters: {
        'JSON Files': ['json'],
        'All Files': ['*']
      }
    });

    if (exportPath) {
      const exportData = {
        timestamp: new Date().toISOString(),
        workflow: state,
        exportVersion: '1.0'
      };

      await vscode.workspace.fs.writeFile(exportPath, Buffer.from(JSON.stringify(exportData, null, 2)));
      
      vscode.window.showInformationMessage(`Results exported to ${exportPath.fsPath}`);
    }
  }

  private async shouldContinue(stageName: string): Promise<boolean> {
    const choice = await vscode.window.showInformationMessage(
      `Proceed to ${stageName}?`,
      'Yes',
      'No'
    );
    
    return choice === 'Yes';
  }

  public resetWorkflow(): void {
    this.stateManager.reset();
    this.previousCritiques = [];
    vscode.window.showInformationMessage('Workflow reset successfully');
  }

  public dispose(): void {
    this.father.dispose();
    this.mother.dispose();
    this.son.dispose();
    this.daughter.dispose();
  }
}