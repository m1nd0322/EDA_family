# EDA Family Extension Development

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Compile TypeScript:
```bash
npm run compile
```

3. Press F5 to launch extension in debug mode

## Testing

Use the sample data in `sample_data/products.csv` to test the extension.

## Python Environment

Make sure you have Python installed with required packages:

```bash
pip install pandas numpy matplotlib seaborn scipy
```

## Development Workflow

1. Make changes to TypeScript files
2. Run `npm run watch` for automatic compilation
3. Press F5 to test in VSCode Extension Development Host
4. Use `Ctrl+Shift+P` -> "Start EDA Family Workflow" to test

## Common Issues

- **Python not found**: Ensure Python is in PATH and has required packages
- **Compilation errors**: Run `npm run compile` to check TypeScript errors
- **Extension not loading**: Check Developer Tools console (Help > Toggle Developer Tools)

## Project Structure Notes

- `src/extension.ts`: Main entry point
- `src/orchestrator.ts`: Workflow orchestration logic
- `src/roles/`: Individual role implementations
- `src/types.ts`: Shared type definitions
- `src/stateManager.ts`: State persistence
- `resources/scripts/`: Python analysis scripts
- `resources/icons/`: SVG icons for roles

## Next Steps

- Add more analysis types to Son role
- Implement custom templates
- Add unit tests
- Improve error handling