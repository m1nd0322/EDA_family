import * as vscode from 'vscode';
import { EDAInstruction } from '../types';

export class FatherRole {
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('EDA Father');
  }

  public async createInstruction(): Promise<EDAInstruction | undefined> {
    this.outputChannel.appendLine('Father: Creating EDA instruction...');

    const instructionType = await this.promptForInstructionType();
    if (!instructionType) return undefined;

    const description = await vscode.window.showInputBox({
      prompt: 'Describe the EDA task',
      placeHolder: 'e.g., Analyze the distribution of numerical variables',
      ignoreFocusOut: true
    });

    if (!description) return undefined;

    const priority = await this.promptForPriority();
    if (!priority) return undefined;

    const instruction: EDAInstruction = {
      id: this.generateId(),
      type: instructionType,
      description,
      parameters: await this.collectParameters(instructionType),
      priority
    };

    this.outputChannel.appendLine(`Father: Instruction created - ${instruction.type}`);
    this.displayInstruction(instruction);

    return instruction;
  }

  private async promptForInstructionType(): Promise<string | undefined> {
    const types = [
      'statistical_summary',
      'distribution_analysis',
      'correlation_analysis',
      'outlier_detection',
      'missing_values_analysis',
      'categorical_analysis',
      'time_series_analysis',
      'custom'
    ];

    const selected = await vscode.window.showQuickPick(types, {
      placeHolder: 'Select EDA analysis type'
    });

    return selected;
  }

  private async promptForPriority(): Promise<'low' | 'medium' | 'high' | undefined> {
    const priorities: Array<{ label: string; description: string; priority: 'low' | 'medium' | 'high' }> = [
      { label: 'Low', description: 'Non-critical analysis', priority: 'low' },
      { label: 'Medium', description: 'Standard analysis', priority: 'medium' },
      { label: 'High', description: 'Critical analysis', priority: 'high' }
    ];

    const selected = await vscode.window.showQuickPick(priorities, {
      placeHolder: 'Select priority level'
    });

    return selected?.priority;
  }

  private async collectParameters(type: string): Promise<Record<string, any>> {
    const parameters: Record<string, any> = {};

    switch (type) {
      case 'statistical_summary':
        parameters.include_percentiles = await this.askYesNo('Include percentiles?');
        parameters.precision = await this.askNumber('Decimal precision', 2, 0, 10);
        break;

      case 'distribution_analysis':
        parameters.plot_type = await this.askPlotType();
        parameters.bins = await this.askNumber('Number of bins', 30, 5, 100);
        break;

      case 'correlation_analysis':
        parameters.method = await this.askCorrelationMethod();
        parameters.threshold = await this.askNumber('Correlation threshold', 0.5, 0, 1);
        break;

      case 'outlier_detection':
        parameters.method = await this.askOutlierMethod();
        parameters.threshold = await this.askNumber('Outlier threshold', 3, 1, 10);
        break;

      case 'missing_values_analysis':
        parameters.visualize = await this.askYesNo('Visualize missing values?');
        parameters.drop_threshold = await this.askNumber('Drop threshold (%)', 50, 0, 100);
        break;

      case 'time_series_analysis':
        parameters.frequency = await this.askFrequency();
        parameters.trend_analysis = await this.askYesNo('Include trend analysis?');
        break;
    }

    return parameters;
  }

  private async askYesNo(prompt: string): Promise<boolean> {
    const answer = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: prompt
    });
    return answer === 'Yes';
  }

  private async askNumber(prompt: string, defaultValue: number, min: number, max: number): Promise<number> {
    const input = await vscode.window.showInputBox({
      prompt,
      placeHolder: defaultValue.toString(),
      validateInput: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Please enter a valid number';
        if (num < min || num > max) return `Value must be between ${min} and ${max}`;
        return null;
      }
    });

    return input ? parseFloat(input) : defaultValue;
  }

  private async askPlotType(): Promise<string> {
    const options = ['histogram', 'kde', 'boxplot', 'violin'];
    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select plot type'
    });
    return selected || 'histogram';
  }

  private async askCorrelationMethod(): Promise<string> {
    const options = ['pearson', 'spearman', 'kendall'];
    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select correlation method'
    });
    return selected || 'pearson';
  }

  private async askOutlierMethod(): Promise<string> {
    const options = ['zscore', 'iqr', 'isolation_forest'];
    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select outlier detection method'
    });
    return selected || 'zscore';
  }

  private async askFrequency(): Promise<string> {
    const options = ['D', 'W', 'M', 'Q', 'Y'];
    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select frequency (D=Daily, W=Weekly, M=Monthly, Q=Quarterly, Y=Yearly)'
    });
    return selected || 'D';
  }

  private displayInstruction(instruction: EDAInstruction): void {
    const panel = vscode.window.createWebviewPanel(
      'edaFatherInstruction',
      'EDA Father Instruction',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = this.getInstructionHtml(instruction);
  }

  private getInstructionHtml(instruction: EDAInstruction): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EDA Father Instruction</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
          h1 { color: var(--vscode-textLink-foreground); }
          .instruction { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
          .parameter { margin: 5px 0; padding-left: 20px; }
          .priority-${instruction.priority} { color: ${instruction.priority === 'high' ? '#ff6b6b' : instruction.priority === 'medium' ? '#feca57' : '#48dbfb'}; }
        </style>
      </head>
      <body>
        <h1>👨‍💼 Father's EDA Instruction</h1>
        <div class="instruction">
          <h2>${instruction.type.replace(/_/g, ' ').toUpperCase()}</h2>
          <p><strong>Description:</strong> ${instruction.description}</p>
          <p><strong>Priority:</strong> <span class="priority-${instruction.priority}">${instruction.priority.toUpperCase()}</span></p>
          <h3>Parameters:</h3>
          ${Object.entries(instruction.parameters).map(([key, value]) => 
            `<div class="parameter"><strong>${key}:</strong> ${JSON.stringify(value)}</div>`
          ).join('')}
        </div>
      </body>
      </html>
    `;
  }

  private generateId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}