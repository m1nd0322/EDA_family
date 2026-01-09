# EDA Family Orchestration VSCode Extension

A VSCode extension that implements a multi-role EDA (Exploratory Data Analysis) orchestration system with a unique family-based workflow.

## 🏠 The EDA Family

The extension organizes EDA tasks through four distinct family roles:

### 👨‍💼 EDA Father (Director)
- Creates EDA instructions and analysis plans
- Determines analysis type, parameters, and priority
- Directs the overall EDA strategy

### 👩‍💼 EDA Mother (Data Provider)
- Selects and prepares data files
- Extracts metadata and information about the dataset
- Delivers data to the EDA Son

### 👦 EDA Son (Executor)
- Executes EDA analyses as instructed by Father
- Uses data provided by Mother
- Implements various statistical and visual analyses
- Responds to Daughter's critiques

### 👧 EDA Daughter (Critic)
- Critiques Son's EDA results
- Identifies issues and provides feedback
- Can trigger re-execution if improvements needed
- Approves results when satisfactory

## 🚀 Features

- **Multi-stage workflow orchestration** with role-based responsibilities
- **Interactive prompting** for analysis parameters
- **Automatic script generation** for EDA analyses
- **Visual feedback** through webview panels
- **Iterative refinement** through critique cycles
- **Configurable settings** for data paths and iteration limits
- **Result export** capabilities

## 📋 Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Compile TypeScript: `npm run compile`
4. Package extension: `npm run package` (or use `vsce package`)
5. Install in VSCode or run in development mode with F5

## 🛠️ Usage

### Starting a Workflow

1. Open VSCode
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Type "EDA Family" and select "Start EDA Family Workflow"

### Workflow Stages

1. **Father Stage**: Select analysis type and configure parameters
2. **Mother Stage**: Choose a data file to analyze
3. **Son Stage**: Execute the EDA analysis
4. **Daughter Stage**: Review and critique results
5. **Completion**: View final report and export results

### Supported Analysis Types

- **Statistical Summary**: Basic statistics and percentiles
- **Distribution Analysis**: Histograms, KDE plots, boxplots
- **Correlation Analysis**: Correlation matrices and heatmaps
- **Outlier Detection**: Z-score, IQR, and isolation forest methods
- **Missing Values Analysis**: Missing value patterns and visualization
- **Time Series Analysis**: Trend analysis and decomposition
- **Custom**: User-defined analysis parameters

## ⚙️ Configuration

The extension can be configured through VSCode settings:

```json
{
  "edaFamily.dataPath": "./data",
  "edaFamily.outputPath": "./eda_output",
  "edaFamily.maxCritiqueIterations": 3,
  "edaFamily.autoProceed": false
}
```

### Settings

- `dataPath`: Default directory for data files
- `outputPath`: Directory for analysis outputs and plots
- `maxCritiqueIterations`: Maximum number of critique-improvement cycles
- `autoProceed`: Automatically proceed through workflow stages without prompts

## 📁 Project Structure

```
EDA_family/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── orchestrator.ts       # Workflow orchestration
│   ├── stateManager.ts       # State management
│   ├── types.ts              # Type definitions
│   └── roles/
│       ├── father.ts         # Father role implementation
│       ├── mother.ts         # Mother role implementation
│       ├── son.ts            # Son role implementation
│       └── daughter.ts       # Daughter role implementation
├── resources/
│   ├── scripts/
│   │   └── eda_analysis.py   # Python analysis script
│   └── icons/                # Role icons
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🐍 Python Dependencies

The Son role generates Python scripts for analysis. Ensure you have these installed:

```bash
pip install pandas numpy matplotlib seaborn scipy
```

For optional features:
```bash
pip install scikit-learn plotly
```

## 🔧 Development

### Compile TypeScript
```bash
npm run compile
```

### Watch for changes
```bash
npm run watch
```

### Run tests
```bash
npm test
```

### Lint code
```bash
npm run lint
```

### Package extension
```bash
npm run package
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [ ] Add more analysis types
- [ ] Support for more data formats (Parquet, HDF5)
- [ ] Integration with popular Python EDA libraries
- [ ] Custom template support
- [ ] Workflow persistence and resume
- [ ] Export to multiple formats (HTML, PDF)
- [ ] Role-specific AI assistance
- [ ] Collaborative workflow features

## 💡 Example Workflow

1. **Father** chooses "Statistical Summary" with high priority
2. **Mother** selects `sales_data.csv` (50MB, 1M rows)
3. **Son** executes analysis, generates statistics and plots
4. **Daughter** reviews results, finds missing values in 3 columns
5. **Son** re-runs with missing value handling
6. **Daughter** approves results as "excellent"
7. Workflow completes with final report

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

Inspired by the concept of role-based workflow orchestration and the importance of thorough exploratory data analysis in data science.