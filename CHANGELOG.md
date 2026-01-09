## Changelog

All notable changes to the EDA Family Orchestration extension will be documented in this file.

### [0.0.1] - 2025-01-09

#### Initial Release

**Added:**
- Four-role orchestration system (Father, Mother, Son, Daughter)
- Statistical Summary analysis
- Distribution Analysis with multiple plot types
- Correlation Analysis with heatmap visualization
- Outlier Detection with multiple methods (zscore, iqr)
- Missing Values Analysis
- Time Series Analysis (basic)
- Custom analysis support
- Interactive workflow with user prompts
- Webview-based result visualization
- Iterative critique and improvement cycle
- State persistence across VSCode sessions
- Configuration support for data paths and settings
- Result export functionality
- Comprehensive error handling
- Activity bar with role-specific views
- Command palette integration
- Sample data for testing
- Python script generation for analyses
- Support for CSV and JSON data formats

**Implemented:**
- Father role: Instruction creation with parameter configuration
- Mother role: Data selection and metadata extraction
- Son role: EDA execution with Python script generation
- Daughter role: Result critique with feedback mechanism
- Orchestrator: Multi-stage workflow management
- State Manager: Global state persistence and management

**Features:**
- Auto-proceed mode for automated workflows
- Configurable maximum critique iterations
- Multiple plot types and visualization options
- Customizable analysis parameters
- Real-time progress notifications
- Detailed logging and error reporting

**Documentation:**
- Comprehensive README
- Development guide
- API documentation in code comments
- Sample data for testing
- Installation instructions
- Usage examples