/**
 * 意图识别模块类型定义
 */

/**
 * 意图主类别枚举
 */
export enum IntentCategory {
  FileOperation = 'file_operation',
  CodeModification = 'code_modification',
  FeatureDevelopment = 'feature_development',
  Testing = 'testing',
  Debugging = 'debugging',
  Refactoring = 'refactoring',
  QuerySearch = 'query_search',
  Deployment = 'deployment',
  Configuration = 'configuration',
  Documentation = 'documentation',
  Unknown = 'unknown'
}

/**
 * 意图子类别映射
 */
export interface IntentSubCategories {
  [IntentCategory.FileOperation]:
    | 'create_file'
    | 'read_file'
    | 'update_file'
    | 'delete_file'
    | 'rename_file'
    | 'move_file';
  [IntentCategory.CodeModification]:
    | 'add_function'
    | 'modify_function'
    | 'remove_function'
    | 'change_logic'
    | 'update_dependency';
  [IntentCategory.FeatureDevelopment]:
    | 'create_api'
    | 'create_component'
    | 'create_service'
    | 'create_model'
    | 'add_feature';
  [IntentCategory.Testing]:
    | 'run_test'
    | 'write_test'
    | 'fix_test'
    | 'test_coverage';
  [IntentCategory.Debugging]:
    | 'error_analysis'
    | 'bug_fix'
    | 'trace_issue'
    | 'log_analysis';
  [IntentCategory.Refactoring]:
    | 'optimize_performance'
    | 'simplify_code'
    | 'update_pattern'
    | 'remove_duplicate';
  [IntentCategory.QuerySearch]:
    | 'search_code'
    | 'search_file'
    | 'find_usage'
    | 'check_type';
  [IntentCategory.Deployment]:
    | 'build_project'
    | 'deploy_production'
    | 'deploy_staging'
    | 'rollback';
  [IntentCategory.Configuration]:
    | 'update_config'
    | 'set_env'
    | 'manage_secret'
    | 'update_dependency';
  [IntentCategory.Documentation]:
    | 'write_comment'
    | 'update_readme'
    | 'create_doc'
    | 'update_api_doc';
  [IntentCategory.Unknown]: 'unknown';
}

/**
 * 动作类型
 */
export enum ActionType {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Run = 'run',
  Search = 'search',
  Modify = 'modify',
  Analyze = 'analyze',
  Fix = 'fix',
  Optimize = 'optimize',
  Deploy = 'deploy',
  Build = 'build',
  Configure = 'configure',
  Document = 'document',
  Unknown = 'unknown'
}

/**
 * 实体类型
 */
export interface Entity {
  type: 'file' | 'function' | 'class' | 'module' | 'api' | 'component' | 'variable' | 'type';
  name: string;
  path?: string;
  language?: string;
}

/**
 * 约束条件
 */
export interface Constraint {
  type: 'priority' | 'scope' | 'condition' | 'limit';
  description: string;
  value?: any;
}

/**
 * 意图对象
 */
export interface Intent<T = any> {
  category: IntentCategory;
  subCategory?: keyof IntentSubCategories[IntentCategory];
  confidence: number;
  action: ActionType;
  target: string;
  parameters?: T;
  entities?: Entity[];
  constraints?: Constraint[];
  order?: number;
  rawMatch?: string;
}

/**
 * 意图识别结果
 */
export interface IntentRecognitionResult {
  intents: Intent[];
  originalInput: string;
  processedInput: string;
  isCompound: boolean;
  needsClarification: boolean;
  alternatives?: Intent[];
  metadata?: {
    language: 'zh' | 'en' | 'mixed';
    processingTime: number;
    matchedRules: string[];
    confidenceThreshold: number;
  };
}

/**
 * 训练数据项
 */
export interface TrainingDataItem {
  text: string;
  category: IntentCategory;
  subCategory: string;
  action: ActionType;
  target: string;
  parameters?: Record<string, any>;
  language: 'zh' | 'en';
  tags?: string[];
}

/**
 * 意图规则
 */
export interface IntentRule {
  id: string;
  pattern: RegExp | string;
  category: IntentCategory;
  subCategory: string;
  action: ActionType;
  priority: number;
  extractParams?: (match: RegExpExecArray | null) => Record<string, any>;
}

/**
 * 识别配置
 */
export interface RecognitionConfig {
  minConfidence: number;
  maxIntents: number;
  enableMultiIntent: boolean;
  language: 'auto' | 'zh' | 'en';
  useRuleFirst: boolean;
  confidenceThreshold: number;
}

/**
 * 特征向量
 */
export interface FeatureVector {
  keywords: Map<string, number>;
  categoryScores: Map<IntentCategory, number>;
  actionScores: Map<ActionType, number>;
  hasNegation: boolean;
  hasCondition: boolean;
  hasTimeExpression: boolean;
  sentenceLength: number;
}

/**
 * 分词结果
 */
export interface TokenizedInput {
  tokens: string[];
  keywords: string[];
  entities: string[];
  verbs: string[];
  nouns: string[];
  technicalTerms: string[];
}
