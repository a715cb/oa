/**
 * 意图识别模块导出入口
 * 提供完整的意图识别功能，包括分类、提取、训练数据管理和服务接口
 */

export { IntentClassifier } from './IntentClassifier';
export { IntentExtractor } from './IntentExtractor';
export { TrainingDataManager } from './TrainingDataManager';
export { IntentRecognitionService } from './IntentRecognitionService';

export type {
  IntentCategory,
  IntentSubCategories,
  ActionType,
  Entity,
  Constraint,
  Intent,
  IntentRecognitionResult,
  TrainingDataItem,
  IntentRule,
  RecognitionConfig,
  FeatureVector,
  TokenizedInput
} from './types';

export { IntentCategory as IC } from './types';
