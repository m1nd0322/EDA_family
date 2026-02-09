# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint

# Run tests
npm test

# Package extension for distribution
npm run package
```

To test the extension: Press F5 in VSCode to launch the Extension Development Host.

## Python Environment

The extension generates and executes Python scripts for EDA. Required packages:
```bash
pip install pandas numpy matplotlib seaborn scipy
```

## Architecture Overview

This is a VSCode extension implementing a multi-role EDA (Exploratory Data Analysis) orchestration system using a family-based workflow metaphor.

### Core Workflow

The `WorkflowOrchestrator` (`src/orchestrator.ts`) coordinates four sequential roles:

1. **Father** (`src/roles/father.ts`) - Creates analysis instructions with type, parameters, and priority
2. **Mother** (`src/roles/mother.ts`) - Selects data files and extracts metadata
3. **Son** (`src/roles/son.ts`) - Generates and executes Python EDA scripts
4. **Daughter** (`src/roles/daughter.ts`) - Critiques results, can trigger re-execution loops

The workflow supports iterative refinement: if Daughter finds issues, Son can re-execute with critique feedback. This loops until Daughter approves or `maxCritiqueIterations` is reached.

### State Management

`StateManager` (`src/stateManager.ts`) persists workflow state using VSCode's `globalState`, enabling workflow resume across sessions.

### Key Types (`src/types.ts`)

- `EDAInstruction` - Analysis configuration from Father
- `EDAData` - Data file metadata from Mother
- `EDAExecution` - Analysis results from Son
- `EDACritique` - Feedback from Daughter with status: `needs_improvement`, `acceptable`, `excellent`
- `WorkflowState` - Tracks current stage: `idle` -> `father_instruction` -> `mother_delivery` -> `son_execution` -> `daughter_critique` -> `completed`

### Extension Points

To add new analysis types:
1. Add option to Father's prompt in `src/roles/father.ts`
2. Implement analysis logic in `src/roles/son.ts`
3. Add critique criteria in `src/roles/daughter.ts`

### Configuration

Extension settings (prefix: `edaFamily.`):
- `dataPath` - Default data directory
- `outputPath` - Results output directory
- `maxCritiqueIterations` - Max critique-improvement cycles (default: 3)
- `autoProceed` - Skip manual stage confirmations

### Commands

- `eda-family.startWorkflow` - Main entry point
- `eda-family.resetWorkflow` - Clear state and start fresh
- `eda-family.configureFather` - Open settings
- `eda-family.exportResults` - Export workflow results to JSON
