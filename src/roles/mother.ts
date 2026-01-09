import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EDAData } from '../types';

export class MotherRole {
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('EDA Mother');
  }

  public async selectAndPrepareData(): Promise<EDAData | undefined> {
    this.outputChannel.appendLine('Mother: Preparing data...');

    const dataPath = await this.selectDataFile();
    if (!dataPath) return undefined;

    const data = await this.prepareData(dataPath);
    if (!data) return undefined;

    this.outputChannel.appendLine(`Mother: Data prepared - ${data.path}`);
    this.displayDataInfo(data);

    return data;
  }

  private async selectDataFile(): Promise<string | undefined> {
    const config = vscode.workspace.getConfiguration('edaFamily');
    const defaultPath = config.get<string>('dataPath');

    const options: vscode.OpenDialogOptions = {
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'Data Files': ['csv', 'json', 'xlsx', 'parquet', 'feather', 'pkl', 'h5', 'hdf5'],
        'CSV Files': ['csv'],
        'JSON Files': ['json'],
        'Excel Files': ['xlsx', 'xls'],
        'All Files': ['*']
      }
    };

    if (defaultPath && fs.existsSync(defaultPath)) {
      options.defaultUri = vscode.Uri.file(defaultPath);
    }

    const fileUri = await vscode.window.showOpenDialog(options);
    return fileUri?.[0]?.fsPath;
  }

  private async prepareData(filePath: string): Promise<EDAData | undefined> {
    const extension = path.extname(filePath).toLowerCase();
    
    const stats = await fs.promises.stat(filePath);
    
    const data: EDAData = {
      id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      path: filePath,
      format: extension.replace('.', ''),
      size: stats.size,
      metadata: await this.extractMetadata(filePath, extension)
    };

    return data;
  }

  private async extractMetadata(filePath: string, format: string): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      filename: path.basename(filePath),
      directory: path.dirname(filePath),
      format,
      last_modified: (await fs.promises.stat(filePath)).mtime
    };

    if (format === '.csv') {
      await this.extractCSVMetadata(filePath, metadata);
    } else if (format === '.json') {
      await this.extractJSONMetadata(filePath, metadata);
    }

    return metadata;
  }

  private async extractCSVMetadata(filePath: string, metadata: Record<string, any>): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      metadata.row_count = lines.length - 1;
      metadata.columns = lines[0].split(',').map(col => col.trim());
      metadata.column_count = metadata.columns.length;
      
      const config = vscode.workspace.getConfiguration('edaFamily');
      const sampleSize = config.get<number>('sampleRows', 5);
      metadata.sample_rows = lines.slice(1, 1 + sampleSize);
    } catch (error) {
      this.outputChannel.appendLine(`Mother: Error extracting CSV metadata - ${error}`);
    }
  }

  private async extractJSONMetadata(filePath: string, metadata: Record<string, any>): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      metadata.is_array = Array.isArray(data);
      metadata.structure = Array.isArray(data) ? 'array' : typeof data;
      
      if (Array.isArray(data)) {
        metadata.record_count = data.length;
        if (data.length > 0) {
          metadata.fields = Object.keys(data[0]);
          metadata.field_count = Object.keys(data[0]).length;
          metadata.sample_record = data[0];
        }
      } else {
        metadata.keys = Object.keys(data);
        metadata.key_count = Object.keys(data).length;
      }
    } catch (error) {
      this.outputChannel.appendLine(`Mother: Error extracting JSON metadata - ${error}`);
    }
  }

  private displayDataInfo(data: EDAData): void {
    const panel = vscode.window.createWebviewPanel(
      'edaMotherData',
      'EDA Mother Data',
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    panel.webview.html = this.getDataHtml(data);
  }

  private getDataHtml(data: EDAData): string {
    const sizeInMB = (data.size / (1024 * 1024)).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EDA Mother Data</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
          h1 { color: var(--vscode-textLink-foreground); }
          .data-info { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
          .metadata { margin: 10px 0; padding-left: 20px; }
          .field { display: inline-block; background: var(--vscode-editor-selectionBackground); padding: 3px 8px; margin: 2px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>👩‍💼 Mother's Data Package</h1>
        <div class="data-info">
          <h2>Data File</h2>
          <p><strong>Path:</strong> ${data.path}</p>
          <p><strong>Format:</strong> ${data.format.toUpperCase()}</p>
          <p><strong>Size:</strong> ${sizeInMB} MB</p>
          
          <h3>Metadata:</h3>
          <div class="metadata">
            ${data.metadata ? Object.entries(data.metadata).map(([key, value]) => {
              if (key === 'sample_rows' || key === 'sample_record') {
                return `<p><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></p>`;
              } else if (key === 'columns' || key === 'fields' || key === 'keys') {
                const fields = Array.isArray(value) ? value : [];
                return `<p><strong>${key}:</strong><br>${fields.map(f => `<span class="field">${f}</span>`).join('')}</p>`;
              } else {
                return `<p><strong>${key}:</strong> ${JSON.stringify(value)}</p>`;
              }
            }).join('') : 'No metadata available'}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }
}