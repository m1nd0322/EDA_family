import * as vscode from 'vscode';
import { WorkflowState, EDAInstruction, EDAData, EDAExecution, EDACritique } from './types';

export class StateManager {
  private static instance: StateManager;
  private state: WorkflowState;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.state = this.loadState();
  }

  public static getInstance(context?: vscode.ExtensionContext): StateManager {
    if (!StateManager.instance) {
      if (!context) {
        throw new Error('Context required for first initialization');
      }
      StateManager.instance = new StateManager(context);
    }
    return StateManager.instance;
  }

  private loadState(): WorkflowState {
    const stored = this.context.globalState.get<WorkflowState>('edaWorkflowState');
    return stored || {
      currentStage: 'idle',
      iterationCount: 0,
      history: []
    };
  }

  private saveState(): void {
    this.context.globalState.update('edaWorkflowState', this.state);
  }

  public getState(): WorkflowState {
    return { ...this.state };
  }

  public updateState(updates: Partial<WorkflowState>): void {
    this.state = { ...this.state, ...updates };

    if (updates.currentStage) {
      // Exclude history from details to avoid circular reference
      const { history: _history, ...detailsWithoutHistory } = updates;
      this.state.history.push({
        stage: updates.currentStage,
        timestamp: Date.now(),
        details: detailsWithoutHistory
      });
    }

    this.saveState();
    vscode.commands.executeCommand('eda-family.refreshViews');
  }

  public setInstruction(instruction: EDAInstruction): void {
    this.updateState({
      instruction,
      currentStage: 'father_instruction'
    });
  }

  public setData(data: EDAData): void {
    this.updateState({
      data,
      currentStage: 'mother_delivery'
    });
  }

  public setExecution(execution: EDAExecution): void {
    this.updateState({
      execution,
      currentStage: 'son_execution'
    });
  }

  public setCritique(critique: EDACritique): void {
    const newIterationCount = critique.status === 'needs_improvement' 
      ? this.state.iterationCount + 1 
      : this.state.iterationCount;
    
    this.updateState({
      critique,
      iterationCount: newIterationCount,
      currentStage: critique.status === 'needs_improvement' ? 'son_execution' : 'daughter_critique'
    });
  }

  public reset(): void {
    this.updateState({
      currentStage: 'idle',
      instruction: undefined,
      data: undefined,
      execution: undefined,
      critique: undefined,
      iterationCount: 0,
      history: []
    });
  }

  public canProceedToNextStage(): boolean {
    const { currentStage, instruction, data, execution, critique } = this.state;
    
    switch (currentStage) {
      case 'idle':
        return true;
      case 'father_instruction':
        return !!instruction;
      case 'mother_delivery':
        return !!data;
      case 'son_execution':
        return !!execution && execution.status === 'completed';
      case 'daughter_critique':
        return !!critique && critique.status !== 'needs_improvement';
      case 'completed':
        return false;
      default:
        return false;
    }
  }
}