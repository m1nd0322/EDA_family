import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EDAInstruction, EDAData, EDAExecution } from '../types';

export class SonRole {
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('EDA Son');
  }

  public async executeEDA(instruction: EDAInstruction, data: EDAData, critique?: any): Promise<EDAExecution | undefined> {
    this.outputChannel.appendLine(`Son: Executing EDA - ${instruction.type}`);
    
    const execution: EDAExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      instructionId: instruction.id,
      dataId: data.id,
      results: [],
      status: 'running'
    };

    try {
      const results = await this.performAnalysis(instruction, data, critique);
      execution.results = results;
      execution.status = 'completed';
      
      this.outputChannel.appendLine('Son: EDA execution completed successfully');
      this.displayResults(execution, instruction);
      
      await this.saveResults(execution);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      this.outputChannel.appendLine(`Son: EDA execution failed - ${execution.error}`);
      
      vscode.window.showErrorMessage(`EDA execution failed: ${execution.error}`);
    }

    return execution;
  }

  private async performAnalysis(instruction: EDAInstruction, data: EDAData, critique?: any): Promise<any[]> {
    const results: any[] = [];
    const config = vscode.workspace.getConfiguration('edaFamily');
    const outputPath = config.get<string>('outputPath', './eda_output');
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const analysisResults = await this.runPythonAnalysis(instruction, data, outputPath, critique);
    results.push(...analysisResults);

    return results;
  }

  private async runPythonAnalysis(
    instruction: EDAInstruction, 
    data: EDAData, 
    outputPath: string,
    critique?: any
  ): Promise<any[]> {
    const results: any[] = [];

    const outputFile = path.join(outputPath, `results_${instruction.id}.json`);
    const plotOutputPath = path.join(outputPath, 'plots');

    if (!fs.existsSync(plotOutputPath)) {
      fs.mkdirSync(plotOutputPath, { recursive: true });
    }

    const pythonScript = this.generatePythonScript(instruction, data, outputFile, plotOutputPath, critique);
    
    const tempScriptPath = path.join(outputPath, `temp_analysis_${Date.now()}.py`);
    await fs.promises.writeFile(tempScriptPath, pythonScript);

    try {
      const terminal = vscode.window.createTerminal('EDA Son Execution');
      
      const pythonCommand = `python "${tempScriptPath}"`;
      terminal.sendText(pythonCommand);

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (fs.existsSync(outputFile)) {
        const analysisOutput = JSON.parse(await fs.promises.readFile(outputFile, 'utf-8'));
        results.push(analysisOutput);
      } else {
        results.push({
          type: 'info',
          message: 'Analysis script executed. Check the terminal for results.',
          scriptPath: tempScriptPath
        });
      }

      const plotFiles = fs.readdirSync(plotOutputPath)
        .filter(f => f.endsWith('.png') || f.endsWith('.html'))
        .map(f => path.join(plotOutputPath, f));

      if (plotFiles.length > 0) {
        results.push({
          type: 'plots',
          files: plotFiles
        });
      }

    } catch (error) {
      this.outputChannel.appendLine(`Son: Error running Python script - ${error}`);
      results.push({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  private generatePythonScript(
    instruction: EDAInstruction, 
    data: EDAData, 
    outputFile: string,
    plotOutputPath: string,
    _critique?: any
  ): string {
    const params = instruction.parameters;
    
    let analysisCode = '';

    switch (instruction.type) {
      case 'statistical_summary':
        analysisCode = this.generateStatisticalSummary(params);
        break;
      case 'distribution_analysis':
        analysisCode = this.generateDistributionAnalysis(params, plotOutputPath);
        break;
      case 'correlation_analysis':
        analysisCode = this.generateCorrelationAnalysis(params, plotOutputPath);
        break;
      case 'outlier_detection':
        analysisCode = this.generateOutlierDetection(params, plotOutputPath);
        break;
      case 'missing_values_analysis':
        analysisCode = this.generateMissingValuesAnalysis(params, plotOutputPath);
        break;
      case 'time_series_analysis':
        analysisCode = this.generateTimeSeriesAnalysis(params, plotOutputPath);
        break;
      default:
        analysisCode = this.generateCustomAnalysis(instruction);
    }

    return `
import pandas as pd
import numpy as np
import json
import warnings
warnings.filterwarnings('ignore')

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns
    HAS_PLOT = True
except ImportError:
    HAS_PLOT = False

print(f"Loading data from: ${data.path}")
try:
    if '${data.format}' == 'csv':
        df = pd.read_csv('${data.path}')
    elif '${data.format}' in ['json']:
        df = pd.read_json('${data.path}')
    else:
        df = pd.read_csv('${data.path}')
    
    print(f"Data loaded successfully: {df.shape}")
    
    results = {
        'instruction_type': '${instruction.type}',
        'data_shape': list(df.shape),
        'columns': list(df.columns),
        'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
        'analysis': {}
    }
    
    ${analysisCode}
    
    with open('${outputFile}', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("Analysis completed successfully!")
    
except Exception as e:
    error_result = {
        'error': str(e),
        'traceback': __import__('traceback').format_exc()
    }
    with open('${outputFile}', 'w') as f:
        json.dump(error_result, f, indent=2)
    print(f"Error during analysis: {e}")
`;
  }

  private generateStatisticalSummary(params: any): string {
    return `
from scipy import stats

numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

results['analysis']['summary'] = {
    'numeric_count': len(numeric_cols),
    'categorical_count': len(categorical_cols),
    'numeric_stats': df[numeric_cols].describe().to_dict(),
    'missing_values': df.isnull().sum().to_dict(),
}

${params.include_percentiles ? `
if len(numeric_cols) > 0:
    results['analysis']['percentiles'] = {}
    for col in numeric_cols:
        results['analysis']['percentiles'][col] = {
            'p1': df[col].quantile(0.01),
            'p5': df[col].quantile(0.05),
            'p10': df[col].quantile(0.10),
            'p25': df[col].quantile(0.25),
            'p50': df[col].quantile(0.50),
            'p75': df[col].quantile(0.75),
            'p90': df[col].quantile(0.90),
            'p95': df[col].quantile(0.95),
            'p99': df[col].quantile(0.99),
        }
` : ''}
`;
  }

  private generateDistributionAnalysis(params: any, plotOutputPath: string): string {
    const bins = params.bins || 30;
    
    return `
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

results['analysis']['distributions'] = {}

for col in numeric_cols:
    col_data = df[col].dropna()
    
    results['analysis']['distributions'][col] = {
        'mean': float(col_data.mean()),
        'std': float(col_data.std()),
        'skewness': float(col_data.skew()),
        'kurtosis': float(col_data.kurtosis()),
        'min': float(col_data.min()),
        'max': float(col_data.max()),
    }
    
    if HAS_PLOT:
        plt.figure(figsize=(10, 6))
        
        plot_type = '${params.plot_type || 'histogram'}'
        
        if plot_type == 'histogram':
            plt.hist(col_data, bins=${bins}, alpha=0.7, edgecolor='black')
            plt.xlabel(col)
            plt.ylabel('Frequency')
            plt.title(f'Distribution of {col}')
        elif plot_type == 'kde':
            sns.kdeplot(data=col_data, fill=True)
            plt.xlabel(col)
            plt.ylabel('Density')
            plt.title(f'KDE of {col}')
        elif plot_type == 'boxplot':
            plt.boxplot(col_data)
            plt.ylabel(col)
            plt.title(f'Boxplot of {col}')
        
        plt.tight_layout()
        plt.savefig('${plotOutputPath}/dist_{col}.png')
        plt.close()
`;
  }

  private generateCorrelationAnalysis(params: any, plotOutputPath: string): string {
    return `
numeric_df = df.select_dtypes(include=[np.number]).dropna()

if len(numeric_df.columns) > 1:
    method = '${params.method || 'pearson'}'
    corr_matrix = numeric_df.corr(method=method)
    
    threshold = ${params.threshold || 0.5}
    
    results['analysis']['correlation'] = {
        'method': method,
        'matrix': corr_matrix.to_dict(),
        'high_correlations': []
    }
    
    for i in range(len(corr_matrix.columns)):
        for j in range(i + 1, len(corr_matrix.columns)):
            col1 = corr_matrix.columns[i]
            col2 = corr_matrix.columns[j]
            corr_value = corr_matrix.iloc[i, j]
            
            if abs(corr_value) >= threshold:
                results['analysis']['correlation']['high_correlations'].append({
                    'col1': col1,
                    'col2': col2,
                    'correlation': float(corr_value)
                })
    
    if HAS_PLOT:
        plt.figure(figsize=(12, 10))
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, 
                    fmt='.2f', linewidths=0.5)
        plt.title(f'{method.capitalize()} Correlation Matrix')
        plt.tight_layout()
        plt.savefig('${plotOutputPath}/correlation_heatmap.png')
        plt.close()
else:
    results['analysis']['correlation'] = {
        'message': 'Not enough numeric columns for correlation analysis'
    }
`;
  }

  private generateOutlierDetection(params: any, plotOutputPath: string): string {
    return `
numeric_df = df.select_dtypes(include=[np.number])
method = '${params.method || 'zscore'}'
threshold = ${params.threshold || 3}

results['analysis']['outliers'] = {
    'method': method,
    'threshold': threshold,
    'outliers_by_column': {}
}

for col in numeric_df.columns:
    col_data = numeric_df[col].dropna()
    
    if method == 'zscore':
        z_scores = np.abs(stats.zscore(col_data))
        outlier_mask = z_scores > threshold
    elif method == 'iqr':
        Q1 = col_data.quantile(0.25)
        Q3 = col_data.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - threshold * IQR
        upper_bound = Q3 + threshold * IQR
        outlier_mask = (col_data < lower_bound) | (col_data > upper_bound)
    
    outlier_count = outlier_mask.sum()
    outlier_indices = col_data[outlier_mask].index.tolist()
    
    results['analysis']['outliers']['outliers_by_column'][col] = {
        'count': int(outlier_count),
        'percentage': float(outlier_count / len(col_data) * 100),
        'indices': outlier_indices[:100]
    }
    
    if HAS_PLOT:
        plt.figure(figsize=(10, 6))
        plt.boxplot(col_data)
        plt.ylabel(col)
        plt.title(f'Boxplot with Outlier Detection ({method})')
        plt.savefig('${plotOutputPath}/outliers_{col}.png')
        plt.close()
`;
  }

  private generateMissingValuesAnalysis(params: any, plotOutputPath: string): string {
    return `
missing_counts = df.isnull().sum()
missing_percentages = (missing_counts / len(df) * 100)

results['analysis']['missing_values'] = {
    'columns_with_missing': {},
    'total_missing': int(missing_counts.sum()),
    'overall_percentage': float(missing_counts.sum() / (len(df) * len(df.columns)) * 100)
}

for col in df.columns:
    if missing_counts[col] > 0:
        results['analysis']['missing_values']['columns_with_missing'][col] = {
            'count': int(missing_counts[col]),
            'percentage': float(missing_percentages[col])
        }

if HAS_PLOT and ${params.visualize || false}:
    plt.figure(figsize=(12, 6))
    
    plt.subplot(1, 2, 1)
    missing_counts[missing_counts > 0].plot(kind='bar')
    plt.title('Missing Values by Column')
    plt.xlabel('Columns')
    plt.ylabel('Count')
    plt.xticks(rotation=45)
    
    plt.subplot(1, 2, 2)
    if len(df.select_dtypes(include=[np.number]).columns) > 0:
        sns.heatmap(df.isnull(), cbar=False, yticklabels=False)
        plt.title('Missing Values Heatmap')
    
    plt.tight_layout()
    plt.savefig('${plotOutputPath}/missing_values.png')
    plt.close()
`;
  }

  private generateTimeSeriesAnalysis(params: any, _plotOutputPath: string): string {
    return `
results['analysis']['time_series'] = {
    'note': 'Time series analysis requires proper datetime column configuration',
    'available_columns': list(df.columns),
    'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist()
}

frequency = '${params.frequency || 'D'}'
if ${params.trend_analysis || false}:
    results['analysis']['time_series']['trend_analysis_enabled'] = True
`;
  }

  private generateCustomAnalysis(instruction: EDAInstruction): string {
    return `
results['analysis']['custom'] = {
    'description': '${instruction.description}',
    'parameters': ${JSON.stringify(instruction.parameters)},
    'note': 'Custom analysis type - please implement specific logic in the script'
}
`;
  }

  private displayResults(execution: EDAExecution, instruction: EDAInstruction): void {
    const panel = vscode.window.createWebviewPanel(
      'edaSonResults',
      'EDA Son Results',
      vscode.ViewColumn.Three,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    panel.webview.html = this.getResultsHtml(execution, instruction);
  }

  private getResultsHtml(execution: EDAExecution, instruction: EDAInstruction): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EDA Son Results</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
          h1 { color: var(--vscode-textLink-foreground); }
          .results { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
          .status-${execution.status} { color: ${execution.status === 'completed' ? '#26de81' : '#ff6b6b'}; }
          .result-item { margin: 10px 0; padding: 10px; background: var(--vscode-editor-selectionBackground); border-radius: 3px; }
          pre { background: var(--vscode-textBlockQuote-background); padding: 10px; border-radius: 3px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>👦 Son's EDA Results</h1>
        <div class="results">
          <h2>${instruction.type.replace(/_/g, ' ').toUpperCase()}</h2>
          <p><strong>Status:</strong> <span class="status-${execution.status}">${execution.status.toUpperCase()}</span></p>
          <p><strong>Execution ID:</strong> ${execution.id}</p>
          
          ${execution.error ? `<p style="color: #ff6b6b;"><strong>Error:</strong> ${execution.error}</p>` : ''}
          
          <h3>Results:</h3>
          ${execution.results.map((result, index) => `
            <div class="result-item">
              <h4>Result ${index + 1}</h4>
              <pre>${JSON.stringify(result, null, 2)}</pre>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  }

  private async saveResults(execution: EDAExecution): Promise<void> {
    const config = vscode.workspace.getConfiguration('edaFamily');
    const outputPath = config.get<string>('outputPath', './eda_output');
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const resultsPath = path.join(outputPath, `execution_${execution.id}.json`);
    await fs.promises.writeFile(resultsPath, JSON.stringify(execution, null, 2));
    
    this.outputChannel.appendLine(`Son: Results saved to ${resultsPath}`);
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}