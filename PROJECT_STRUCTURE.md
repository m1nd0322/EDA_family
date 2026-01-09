# EDA Family Project Structure

```
EDA_family/
│
├── 📁 .vscode/                      # VSCode configuration
│   ├── launch.json                  # Debug configurations
│   ├── settings.json                # Workspace settings
│   └── tasks.json                   # Build tasks
│
├── 📁 resources/                     # Extension resources
│   ├── 📁 scripts/                  # Python analysis scripts
│   │   └── eda_analysis.py          # Template for EDA analyses
│   │
│   ├── 📁 icons/                    # SVG icons for roles
│   │   ├── icon.svg                 # Main extension icon
│   │   ├── father-icon.svg          # Father role icon
│   │   ├── mother-icon.svg          # Mother role icon
│   │   ├── son-icon.svg             # Son role icon
│   │   └── daughter-icon.svg        # Daughter role icon
│   │
│   └── README.md                    # Resources documentation
│
├── 📁 sample_data/                   # Sample datasets for testing
│   └── products.csv                 # Product sales data
│
├── 📁 src/                          # Source code
│   │
│   ├── extension.ts                 # 🚀 Extension entry point
│   │   └── Activates extension and registers commands
│   │
│   ├── orchestrator.ts              # 🎭 Workflow orchestration
│   │   └── Manages multi-role workflow stages
│   │
│   ├── stateManager.ts              # 💾 State persistence
│   │   └── Manages global state and history
│   │
│   ├── types.ts                     # 📝 Type definitions
│   │   └── TypeScript interfaces for all roles
│   │
│   ├── 📁 roles/                    # Role implementations
│   │   │
│   │   ├── father.ts                # 👨‍💼 EDA Father
│   │   │   ├── Creates analysis instructions
│   │   │   ├── Determines parameters
│   │   │   └── Sets priorities
│   │   │
│   │   ├── mother.ts                # 👩‍💼 EDA Mother
│   │   │   ├── Selects data files
│   │   │   ├── Extracts metadata
│   │   │   └── Prepares data for Son
│   │   │
│   │   ├── son.ts                   # 👦 EDA Son
│   │   │   ├── Generates Python scripts
│   │   │   ├── Executes EDA analyses
│   │   │   ├── Creates visualizations
│   │   │   └── Handles critiques
│   │   │
│   │   └── daughter.ts              # 👧 EDA Daughter
│   │       ├── Reviews results
│   │       ├── Provides critiques
│   │       ├── Identifies issues
│   │       └── Approves final results
│   │
│   └── 📁 test/                     # Test suite
│       └── suite/
│           ├── extension.test.ts    # Extension tests
│           └── index.ts             # Test runner
│
├── 📄 Configuration Files
│   ├── package.json                 # 📦 Extension manifest
│   ├── tsconfig.json                # ⚙️ TypeScript config
│   ├── .eslintrc.js                 # 🔍 Linting rules
│   └── .vscodeignore                # 🚫 Package ignore list
│
├── 📄 Documentation
│   ├── README.md                    # 📖 Main documentation
│   ├── QUICKSTART.md                # ⚡ Quick start guide
│   ├── DEVELOPMENT.md               # 🛠️ Development guide
│   ├── CHANGELOG.md                 # 📋 Version history
│   ├── LICENSE                      # ⚖️ MIT License
│   └── PROJECT_STRUCTURE.md         # 🏗️ This file
│
└── 📄 Development Files
    ├── .gitignore                   # Git ignore patterns
    └── test_sample.py               # Sample Python test script
```

## Workflow Flow

```
┌─────────────────────────────────────────────────────────┐
│                    VSCode Extension                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Orchestrator (Workflow Manager)            │
│  • Manages stages                                        │
│  • Coordinates roles                                    │
│  • Handles state transitions                            │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Father    │   │   Mother    │   │    Son      │
│ (Director)  │   │ (Data Prov) │   │ (Executor)  │
│             │   │             │   │             │
│ • Instructions│  • File Select│  • Python Gen │
│ • Parameters │  • Metadata   │  • Analysis   │
│ • Priority   │  • Preparation│  • Plots      │
└─────────────┘   └─────────────┘   └─────────────┘
                                            │
                                            ▼
                                    ┌─────────────┐
                                    │  Daughter   │
                                    │  (Critic)   │
                                    │             │
                                    │ • Review    │
                                    │ • Critique  │
                                    │ • Feedback  │
                                    └─────────────┘
                                            │
                                            ▼
                                    ┌─────────────┐
                                    │  Complete   │
                                    │  / Iterate  │
                                    └─────────────┘
```

## Key Files Explained

### Core Architecture
- **extension.ts**: Entry point - registers all VSCode commands
- **orchestrator.ts**: Brain of the extension - coordinates all roles
- **stateManager.ts**: Memory - saves and loads workflow state

### Role Implementations
- **father.ts**: Creates user-friendly prompts for analysis configuration
- **mother.ts**: Handles file I/O and data metadata extraction
- **son.ts**: Generates and executes Python scripts for EDA
- **daughter.ts**: Analyzes results and provides constructive feedback

### Type System
- **types.ts**: Central type definitions shared across all modules

### Configuration
- **package.json**: VSCode extension manifest
- **tsconfig.json**: TypeScript compilation options
- **settings.json**: VSCode workspace settings

### Resources
- **scripts/eda_analysis.py**: Python script template
- **icons/**: Visual representation of each role

## Data Flow

```
User Input
    │
    ▼
Father: Creates EDA instruction
    │
    ▼
Mother: Selects & prepares data
    │
    ▼
Son: Generates Python script
    │
    ▼
Terminal: Executes analysis
    │
    ▼
Son: Collects results & plots
    │
    ▼
Daughter: Reviews & critiques
    │
    ▼
User: Approves or iterate
    │
    ▼
Final Report
```

## Extension Points

### Adding New Analysis Types
1. Add type to `father.ts` prompt options
2. Implement analysis logic in `son.ts`
3. Add critique logic in `daughter.ts`

### Customizing Roles
- Father: Modify prompts and parameter collection
- Mother: Add support for new data formats
- Son: Enhance Python script generation
- Daughter: Customize critique criteria

### Integrating New Tools
- Add dependencies to `package.json`
- Import and use in relevant role files
- Update documentation

## State Persistence

The extension uses VSCode's `globalState` to persist:
- Current workflow stage
- All role outputs (instructions, data, results, critiques)
- Workflow history
- Iteration count

State is automatically saved and restored between sessions.

## Output Structure

```
eda_output/
├── results_inst_xxx.json           # Analysis results
├── plots/                          # Generated visualizations
│   ├── dist_column1.png
│   ├── correlation_heatmap.png
│   └── outliers_column2.png
└── execution_exec_xxx.json         # Full execution record
```