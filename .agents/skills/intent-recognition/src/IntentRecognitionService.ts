import { IntentClassifier } from './IntentClassifier';
import { IntentExtractor } from './IntentExtractor';
import { TrainingDataManager } from './TrainingDataManager';
import type {
  IntentRecognitionResult,
  Intent,
  TrainingDataItem,
  RecognitionConfig,
  TokenizedInput,
  Entity,
  Constraint
} from './types';
import { IntentCategory as IC, ActionType } from './types';

/**
 * 意图识别服务
 * 对外暴露的统一接口，整合分类器、提取器和训练数据管理器
 */
export class IntentRecognitionService {
  private classifier: IntentClassifier;
  private extractor: IntentExtractor;
  private trainingManager: TrainingDataManager;
  private isInitialized: boolean;

  constructor(config?: Partial<RecognitionConfig>) {
    this.classifier = new IntentClassifier(config);
    this.extractor = new IntentExtractor();
    this.trainingManager = new TrainingDataManager();
    this.isInitialized = false;
  }

  /**
   * 初始化服务（加载训练数据等）
   */
  async initialize(trainingData?: TrainingDataItem[]): Promise<void> {
    if (trainingData && trainingData.length > 0) {
      await this.trainingManager.loadDataFromJson(trainingData);
    }
    this.isInitialized = true;
  }

  /**
   * 识别意图（主要接口）
   */
  recognizeIntent(input: string): IntentRecognitionResult {
    if (!this.isInitialized) {
      throw new Error('IntentRecognitionService 未初始化，请先调用 initialize() 方法');
    }

    const startTime = Date.now();
    const originalInput = input;
    const processedInput = this.preprocessInput(input);

    if (processedInput.trim().length === 0) {
      return this.createEmptyResult(originalInput, processedInput);
    }

    const language = this.detectLanguage(processedInput);
    const segments = this.extractor.splitCompoundIntents(processedInput);
    const isCompound = segments.length > 1;

    const allIntents: Intent[] = [];
    const allAlternatives: Intent[] = [];

    for (const segment of segments) {
      const tokenized = this.extractor.tokenize(segment);
      const intents = this.classifier.classify(segment, tokenized);

      if (intents.length > 0) {
        const primaryIntent = intents[0];
        primaryIntent.entities = this.extractor.extractEntities(segment);
        primaryIntent.parameters = {
          ...primaryIntent.parameters,
          ...this.extractor.extractParameters(segment, tokenized)
        };
        primaryIntent.constraints = this.extractor.extractConstraints(segment);
        primaryIntent.target = this.extractor.inferTargetFromIntent(segment, primaryIntent);
        allIntents.push(primaryIntent);

        if (intents.length > 1) {
          allAlternatives.push(...intents.slice(1));
        }
      }
    }

    const needsClarification = allIntents.some(intent => intent.category === IC.Unknown) ||
      allIntents.length === 0 ||
      (allIntents.length > 0 && allIntents[0].confidence < 0.6);

    const processingTime = Date.now() - startTime;
    const matchedRules = this.classifier.getRules()
      .filter(rule => {
        const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
        return regex.test(processedInput);
      })
      .map(rule => rule.id);

    const config = this.classifier.getConfig();

    return {
      intents: allIntents,
      originalInput,
      processedInput,
      isCompound,
      needsClarification,
      alternatives: allAlternatives.length > 0 ? allAlternatives : undefined,
      metadata: {
        language,
        processingTime,
        matchedRules,
        confidenceThreshold: config.minConfidence
      }
    };
  }

  /**
   * 预处理输入
   */
  private preprocessInput(input: string): string {
    return input
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 检测语言
   */
  private detectLanguage(input: string): 'zh' | 'en' | 'mixed' {
    const chineseChars = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishChars = (input.match(/[a-zA-Z]/g) || []).length;
    const totalChars = chineseChars + englishChars;

    if (totalChars === 0) return 'en';

    const chineseRatio = chineseChars / totalChars;

    if (chineseRatio > 0.8) return 'zh';
    if (chineseRatio < 0.2) return 'en';
    return 'mixed';
  }

  /**
   * 创建空结果
   */
  private createEmptyResult(originalInput: string, processedInput: string): IntentRecognitionResult {
    return {
      intents: [],
      originalInput,
      processedInput,
      isCompound: false,
      needsClarification: true,
      metadata: {
        language: 'en',
        processingTime: 0,
        matchedRules: [],
        confidenceThreshold: 0.6
      }
    };
  }

  /**
   * 批量识别意图
   */
  batchRecognizeIntents(inputs: string[]): IntentRecognitionResult[] {
    return inputs.map(input => this.recognizeIntent(input));
  }

  /**
   * 添加训练数据
   */
  addTrainingData(items: TrainingDataItem[]): number {
    return this.trainingManager.addBatchTrainingItems(items);
  }

  /**
   * 加载训练数据
   */
  async loadTrainingData(data: TrainingDataItem[]): Promise<void> {
    await this.trainingManager.loadDataFromJson(data);
  }

  /**
   * 获取训练数据统计
   */
  getTrainingDataStats(): {
    totalCount: number;
    categoryStats: Map<IC, number>;
    languageDist: { zh: number; en: number };
    isBalanced: boolean;
  } {
    return {
      totalCount: this.trainingManager.getTotalCount(),
      categoryStats: this.trainingManager.getCategoryStatistics(),
      languageDist: this.trainingManager.getLanguageDistribution(),
      isBalanced: this.trainingManager.isCategoryBalanced()
    };
  }

  /**
   * 扩充训练数据
   */
  augmentTrainingData(): {
    synonymAugmented: TrainingDataItem[];
    transformAugmented: TrainingDataItem[];
    generalizedAugmented: TrainingDataItem[];
  } {
    return {
      synonymAugmented: this.trainingManager.augmentDataBySynonyms(),
      transformAugmented: this.trainingManager.augmentDataBySentenceTransformation(),
      generalizedAugmented: this.trainingManager.augmentDataByParameterGeneralization()
    };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RecognitionConfig>): void {
    this.classifier.updateConfig(config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): RecognitionConfig {
    return this.classifier.getConfig();
  }

  /**
   * 添加自定义规则
   */
  addCustomRule(rule: {
    id: string;
    pattern: RegExp | string;
    category: IC;
    subCategory: string;
    action: ActionType;
    priority: number;
    extractParams?: (match: RegExpExecArray | null) => Record<string, any>;
  }): void {
    this.classifier.addRule(rule);
  }

  /**
   * 移除规则
   */
  removeRule(ruleId: string): boolean {
    return this.classifier.removeRule(ruleId);
  }

  /**
   * 获取所有规则
   */
  getRules(): Array<{ id: string; category: IC; priority: number }> {
    return this.classifier.getRules().map(rule => ({
      id: rule.id,
      category: rule.category,
      priority: rule.priority
    }));
  }

  /**
   * 搜索训练数据
   */
  searchTrainingData(query: string): TrainingDataItem[] {
    return this.trainingManager.searchData(query);
  }

  /**
   * 导出训练数据
   */
  exportTrainingData(): TrainingDataItem[] {
    return this.trainingManager.exportToJson();
  }

  /**
   * 获取服务状态
   */
  getStatus(): {
    initialized: boolean;
    ruleCount: number;
    trainingDataCount: number;
  } {
    return {
      initialized: this.isInitialized,
      ruleCount: this.classifier.getRules().length,
      trainingDataCount: this.trainingManager.getTotalCount()
    };
  }

  /**
   * 分词（暴露给外部使用）
   */
  tokenize(input: string): TokenizedInput {
    return this.extractor.tokenize(input);
  }

  /**
   * 提取实体（暴露给外部使用）
   */
  extractEntities(input: string): Entity[] {
    return this.extractor.extractEntities(input);
  }

  /**
   * 提取约束（暴露给外部使用）
   */
  extractConstraints(input: string): Constraint[] {
    return this.extractor.extractConstraints(input);
  }
}
