export interface EDAInstruction {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export interface EDAData {
  id: string;
  path: string;
  format: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface EDAExecution {
  id: string;
  instructionId: string;
  dataId: string;
  results: any[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface EDACritique {
  id: string;
  executionId: string;
  feedback: string;
  issues: Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
  }>;
  status: 'needs_improvement' | 'acceptable' | 'excellent';
  timestamp: number;
}

export interface WorkflowState {
  currentStage: 'idle' | 'father_instruction' | 'mother_delivery' | 'son_execution' | 'daughter_critique' | 'completed';
  instruction?: EDAInstruction;
  data?: EDAData;
  execution?: EDAExecution;
  critique?: EDACritique;
  iterationCount: number;
  history: Array<{
    stage: string;
    timestamp: number;
    details: any;
  }>;
}