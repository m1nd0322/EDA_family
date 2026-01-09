import * as vscode from 'vscode';
import { EDAExecution, EDACritique } from '../types';

export class DaughterRole {
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('EDA Daughter');
  }

  public async critiqueResults(execution: EDAExecution, previousCritiques: EDACritique[] = []): Promise<EDACritique | undefined> {
    this.outputChannel.appendLine('Daughter: Critiquing EDA results...');
    
    const critique = await this.performCritique(execution, previousCritiques);
    
    this.outputChannel.appendLine(`Daughter: Critique completed - Status: ${critique.status}`);
    this.displayCritique(critique, execution);
    
    return critique;
  }

  private async performCritique(execution: EDAExecution, previousCritiques: EDACritique[]): Promise<EDACritique> {
    const critique: EDACritique = {
      id: `critique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executionId: execution.id,
      feedback: '',
      issues: [],
      status: 'acceptable',
      timestamp: Date.now()
    };

    if (execution.status === 'failed') {
      critique.status = 'needs_improvement';
      critique.feedback = 'The EDA execution failed. Please review and fix the errors.';
      critique.issues.push({
        severity: 'high',
        description: 'Execution failed',
        suggestion: execution.error || 'Check the error logs for details'
      });
      return critique;
    }

    const issues = await this.analyzeResults(execution.results);
    critique.issues.push(...issues);

    const feedbackFromUser = await this.getHumanFeedback(execution, previousCritiques);
    
    if (feedbackFromUser) {
      critique.feedback = feedbackFromUser.feedback;
      if (feedbackFromUser.hasIssues) {
        critique.status = 'needs_improvement';
        critique.issues.push({
          severity: 'medium',
          description: 'User feedback indicates issues with the analysis',
          suggestion: feedbackFromUser.suggestion
        });
      }
    } else {
      if (critique.issues.length === 0) {
        critique.feedback = 'Excellent analysis! The results are comprehensive and well-presented.';
        critique.status = 'excellent';
      } else {
        const hasCriticalIssues = critique.issues.some(issue => issue.severity === 'high');
        const hasMediumIssues = critique.issues.some(issue => issue.severity === 'medium');
        
        if (hasCriticalIssues) {
          critique.status = 'needs_improvement';
          critique.feedback = 'Critical issues found that need to be addressed.';
        } else if (hasMediumIssues) {
          critique.status = 'acceptable';
          critique.feedback = 'Good analysis with some areas for improvement.';
        } else {
          critique.status = 'acceptable';
          critique.feedback = 'Analysis is acceptable with minor suggestions.';
        }
      }
    }

    return critique;
  }

  private async analyzeResults(results: any[]): Promise<Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
  }>> {
    const issues: Array<{ severity: 'low' | 'medium' | 'high'; description: string; suggestion?: string }> = [];

    for (const result of results) {
      if (result.type === 'error') {
        issues.push({
          severity: 'high',
          description: `Error in results: ${result.message}`,
          suggestion: 'Review the error and fix the analysis logic'
        });
      }

      if (result.type === 'info' && result.message) {
        this.outputChannel.appendLine(`Daughter: Info - ${result.message}`);
      }

      if (result.analysis) {
        const analysisIssues = this.analyzeAnalysisSection(result.analysis);
        issues.push(...analysisIssues);
      }

      if (result.plots) {
        const plotIssues = this.analyzePlots(result.plots);
        issues.push(...plotIssues);
      }
    }

    return issues;
  }

  private analyzeAnalysisSection(analysis: any): Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
  }> {
    const issues: Array<{ severity: 'low' | 'medium' | 'high'; description: string; suggestion?: string }> = [];

    if (analysis.summary) {
      if (analysis.summary.numeric_count === 0) {
        issues.push({
          severity: 'medium',
          description: 'No numeric columns found in the dataset',
          suggestion: 'Consider converting categorical variables to numeric or check data types'
        });
      }

      if (analysis.summary.missing_values) {
        const totalMissing = Object.values(analysis.summary.missing_values).reduce((sum: number, val: any) => sum + (val as number), 0);
        if (totalMissing > 0) {
          issues.push({
            severity: 'low',
            description: `Found ${totalMissing} missing values in the dataset`,
            suggestion: 'Consider imputation strategies or report missing value handling'
          });
        }
      }
    }

    if (analysis.correlation) {
      if (!analysis.correlation.high_correlations || analysis.correlation.high_correlations.length === 0) {
        issues.push({
          severity: 'low',
          description: 'No high correlations found between variables',
          suggestion: 'Consider adjusting the correlation threshold or checking for non-linear relationships'
        });
      }
    }

    if (analysis.outliers) {
      const outlierCounts = Object.values(analysis.outliers.outliers_by_column || {});
      const totalOutliers = outlierCounts.reduce((sum: number, val: any) => sum + (val?.count || 0), 0);
      
      if (totalOutliers > 0) {
        issues.push({
          severity: 'low',
          description: `Detected ${totalOutliers} outliers across columns`,
          suggestion: 'Review outliers and consider if they are valid data points or errors'
        });
      }
    }

    return issues;
  }

  private analyzePlots(plots: any): Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
  }> {
    const issues: Array<{ severity: 'low' | 'medium' | 'high'; description: string; suggestion?: string }> = [];

    if (!plots.files || plots.files.length === 0) {
      issues.push({
        severity: 'medium',
        description: 'No plots generated for the analysis',
        suggestion: 'Check if plotting libraries are installed and configured correctly'
      });
    }

    return issues;
  }

  private async getHumanFeedback(
    _execution: EDAExecution, 
    _previousCritiques: EDACritique[]
  ): Promise<{ feedback: string; hasIssues: boolean; suggestion?: string } | undefined> {
    const config = vscode.workspace.getConfiguration('edaFamily');
    const autoProceed = config.get<boolean>('autoProceed', false);

    if (autoProceed) {
      return undefined;
    }

    const action = await vscode.window.showInformationMessage(
      'Daughter: What do you think of the EDA results?',
      { modal: true },
      'Excellent, approve',
      'Needs improvement',
      'Add feedback'
    );

    if (!action) return undefined;

    if (action === 'Excellent, approve') {
      return {
        feedback: 'User approved the results as excellent.',
        hasIssues: false
      };
    }

    if (action === 'Needs improvement') {
      const suggestion = await vscode.window.showInputBox({
        prompt: 'What needs to be improved?',
        placeHolder: 'e.g., Add more visualizations, include additional statistical tests...',
        ignoreFocusOut: true
      });

      return {
        feedback: 'User indicated the results need improvement.',
        hasIssues: true,
        suggestion: suggestion || 'General improvements needed'
      };
    }

    if (action === 'Add feedback') {
      const feedback = await vscode.window.showInputBox({
        prompt: 'Provide your feedback on the results',
        placeHolder: 'e.g., Great analysis! But could you also check...',
        ignoreFocusOut: true
      });

      if (!feedback) return undefined;

      const hasIssues = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Do the results need improvements based on your feedback?'
      });

      return {
        feedback,
        hasIssues: hasIssues === 'Yes',
        suggestion: feedback
      };
    }

    return undefined;
  }

  private displayCritique(critique: EDACritique, execution: EDAExecution): void {
    const panel = vscode.window.createWebviewPanel(
      'edaDaughterCritique',
      'EDA Daughter Critique',
      vscode.ViewColumn.Four,
      { enableScripts: true }
    );

    panel.webview.html = this.getCritiqueHtml(critique, execution);
  }

  private getCritiqueHtml(critique: EDACritique, execution: EDAExecution): string {
    const statusColors = {
      'needs_improvement': '#ff6b6b',
      'acceptable': '#feca57',
      'excellent': '#26de81'
    };

    const severityColors = {
      'low': '#48dbfb',
      'medium': '#feca57',
      'high': '#ff6b6b'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EDA Daughter Critique</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
          h1 { color: var(--vscode-textLink-foreground); }
          .critique { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
          .status-${critique.status} { color: ${statusColors[critique.status]}; font-weight: bold; }
          .issue { margin: 10px 0; padding: 10px; background: var(--vscode-editor-selectionBackground); border-radius: 3px; border-left: 4px solid; }
          .severity-low { border-left-color: ${severityColors.low} !important; }
          .severity-medium { border-left-color: ${severityColors.medium} !important; }
          .severity-high { border-left-color: ${severityColors.high} !important; }
        </style>
      </head>
      <body>
        <h1>👧 Daughter's Critique</h1>
        <div class="critique">
          <h2>Review Status</h2>
          <p><strong>Status:</strong> <span class="status-${critique.status}">${critique.status.replace(/_/g, ' ').toUpperCase()}</span></p>
          <p><strong>Feedback:</strong> ${critique.feedback}</p>
          <p><strong>Execution ID:</strong> ${execution.id}</p>
          
          ${critique.issues.length > 0 ? `
            <h3>Issues Found (${critique.issues.length})</h3>
            ${critique.issues.map(issue => `
              <div class="issue severity-${issue.severity}">
                <p><strong>Severity:</strong> <span style="color: ${severityColors[issue.severity]}">${issue.severity.toUpperCase()}</span></p>
                <p><strong>Description:</strong> ${issue.description}</p>
                ${issue.suggestion ? `<p><strong>Suggestion:</strong> ${issue.suggestion}</p>` : ''}
              </div>
            `).join('')}
          ` : `
            <h3>No Issues Found</h3>
            <p>The analysis appears to be complete and well-executed.</p>
          `}
        </div>
      </body>
      </html>
    `;
  }

  public shouldProceedToFather(critique: EDACritique, _config: vscode.WorkspaceConfiguration): boolean {
    return critique.status !== 'needs_improvement';
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}