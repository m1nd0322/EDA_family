# Quick Start Guide

Get started with EDA Family Orchestration in 5 minutes!

## 1️⃣ Prerequisites

- **VSCode**: Latest version
- **Node.js**: v18 or higher
- **Python**: v3.8 or higher with required packages

Install Python packages:
```bash
pip install pandas numpy matplotlib seaborn scipy
```

## 2️⃣ Installation

```bash
# Navigate to the project directory
cd EDA_family

# Install dependencies
npm install

# Compile the project
npm run compile
```

## 3️⃣ Running the Extension

### Option A: Development Mode (Recommended)
1. Open VSCode
2. Press `F5` to launch Extension Development Host
3. In the new window, open `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "EDA Family" and select "Start EDA Family Workflow"

### Option B: Production Mode
```bash
# Package the extension
npm run package

# Install the .vsix file manually in VSCode
```

## 4️⃣ Your First Workflow

### Step 1: Father Creates Instruction
- Select an analysis type (e.g., "Statistical Summary")
- Configure parameters (priority, precision, etc.)
- Click "Create"

### Step 2: Mother Prepares Data
- Choose a data file (try `sample_data/products.csv`)
- Mother extracts metadata and displays info
- Confirm the data is correct

### Step 3: Son Executes EDA
- Son generates Python script automatically
- Script runs in integrated terminal
- Results displayed in webview panel

### Step 4: Daughter Critiques Results
- Daughter analyzes the results
- Provides feedback and identifies issues
- You can approve or request improvements

### Step 5: Completion
- View final report with all stages
- Export results if needed
- Start a new workflow

## 5️⃣ Try Different Analyses

### Statistical Summary
- Basic statistics, percentiles
- Missing value detection

### Distribution Analysis
- Histograms, KDE plots, boxplots
- Skewness and kurtosis

### Correlation Analysis
- Pearson, Spearman, Kendall methods
- Interactive heatmaps

### Outlier Detection
- Z-score, IQR methods
- Visual identification

### Missing Values Analysis
- Pattern visualization
- Imputation suggestions

## 6️⃣ Configuration

Open VSCode settings and search for "edaFamily":

```json
{
  "edaFamily.dataPath": "./sample_data",
  "edaFamily.outputPath": "./eda_output",
  "edaFamily.maxCritiqueIterations": 3,
  "edaFamily.autoProceed": false
}
```

## 7️⃣ Keyboard Shortcuts

Open Command Palette (`Ctrl+Shift+P`):
- `Start EDA Family Workflow` - Begin new analysis
- `Configure Father Role` - Open settings
- `Reset Workflow` - Start fresh
- `Export Results` - Save current results

## 8️⃣ Common Tasks

**Use your own data:**
- Place your CSV/JSON files in `sample_data/` folder
- Or configure `edaFamily.dataPath` to your data directory

**Auto-proceed mode:**
- Set `edaFamily.autoProceed` to `true`
- Workflow runs without manual confirmation

**View previous results:**
- Results are saved in `eda_output/` folder
- Open JSON files to review detailed results

## 9️⃣ Troubleshooting

**Extension not loading:**
- Check Developer Tools console (`Help > Toggle Developer Tools`)
- Ensure all npm dependencies are installed

**Python script errors:**
- Verify Python is in PATH
- Install required packages: `pip install pandas numpy matplotlib seaborn scipy`

**Compilation errors:**
- Run `npm run compile` to see TypeScript errors
- Check `tsconfig.json` settings

**Data file not found:**
- Verify file path is correct
- Use absolute path if relative path fails

## 🔟 Next Steps

- Explore different analysis types
- Customize analysis parameters
- Add your own Python analysis scripts
- Share your workflows with team members
- Contribute to the project!

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for development guide
- Open an issue on GitHub for bugs or questions

---

**Happy Analyzing! 🎉**