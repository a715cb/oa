import type { TrainingDataItem, IntentCategory } from './types';
import { ActionType } from './types';

/**
 * 训练数据管理器
 * 管理、加载、验证和扩充训练数据集
 */
export class TrainingDataManager {
  private trainingData: TrainingDataItem[];
  private synonyms: Map<string, string[]>;
  private dataFilePath: string;

  constructor(dataFile?: string) {
    this.trainingData = [];
    this.synonyms = new Map();
    this.dataFilePath = dataFile || './training-data.json';
    this.initializeSynonyms();
  }

  /**
   * 初始化同义词库
   */
  private initializeSynonyms(): void {
    this.synonyms = new Map([
      ['创建', ['新建', '建立', '生成', '添加', 'create', 'make', 'add']],
      ['修改', ['更新', '编辑', '更改', '调整', 'update', 'edit', 'modify']],
      ['删除', ['移除', '清除', 'delete', 'remove']],
      ['读取', ['打开', '查看', '显示', '展示', 'read', 'open', 'show']],
      ['搜索', ['查找', '找', '查询', 'search', 'find']],
      ['运行', ['执行', '跑', '启动', 'run', 'execute']],
      ['测试', ['test', '用例', '单元测试', '集成测试']],
      ['部署', ['发布', '上线', 'deploy', 'publish', 'release']],
      ['文件', ['file', '文档']],
      ['代码', ['code', '逻辑']],
      ['函数', ['方法', 'function', 'method']],
      ['错误', ['报错', 'bug', '异常', '问题', 'error']],
      ['优化', ['改进', 'optimize', 'improve']],
      ['重构', ['重写', '改写', 'refactor']],
      ['配置', ['设置', 'config', 'settings']]
    ]);
  }

  /**
   * 从 JSON 文件加载训练数据
   */
  async loadDataFromJson(jsonData: TrainingDataItem[]): Promise<void> {
    const validatedData = jsonData.filter(item => this.validateTrainingItem(item));
    this.trainingData = validatedData;
  }

  /**
   * 获取所有训练数据
   */
  getAllData(): TrainingDataItem[] {
    return [...this.trainingData];
  }

  /**
   * 根据类别获取训练数据
   */
  getDataByCategory(category: IntentCategory): TrainingDataItem[] {
    return this.trainingData.filter(item => item.category === category);
  }

  /**
   * 根据语言获取训练数据
   */
  getDataByLanguage(language: 'zh' | 'en'): TrainingDataItem[] {
    return this.trainingData.filter(item => item.language === language);
  }

  /**
   * 添加训练数据项
   */
  addTrainingItem(item: TrainingDataItem): boolean {
    if (!this.validateTrainingItem(item)) {
      return false;
    }
    this.trainingData.push(item);
    return true;
  }

  /**
   * 批量添加训练数据
   */
  addBatchTrainingItems(items: TrainingDataItem[]): number {
    let addedCount = 0;
    for (const item of items) {
      if (this.addTrainingItem(item)) {
        addedCount++;
      }
    }
    return addedCount;
  }

  /**
   * 验证训练数据项
   */
  private validateTrainingItem(item: TrainingDataItem): boolean {
    if (!item.text || typeof item.text !== 'string') {
      return false;
    }
    if (!item.category || typeof item.category !== 'string') {
      return false;
    }
    if (!item.action || typeof item.action !== 'string') {
      return false;
    }
    if (item.text.length < 2 || item.text.length > 500) {
      return false;
    }
    if (item.language !== 'zh' && item.language !== 'en') {
      return false;
    }
    return true;
  }

  /**
   * 扩充训练数据（同义词替换）
   */
  augmentDataBySynonyms(): TrainingDataItem[] {
    const augmentedData: TrainingDataItem[] = [];
    for (const item of this.trainingData) {
      const variations = this.generateSynonymVariations(item);
      augmentedData.push(...variations);
    }
    return augmentedData;
  }

  /**
   * 生成同义词变体
   */
  private generateSynonymVariations(item: TrainingDataItem): TrainingDataItem[] {
    const variations: TrainingDataItem[] = [];
    const text = item.text;

    for (const [original, synonyms] of this.synonyms.entries()) {
      if (text.includes(original)) {
        for (const synonym of synonyms.slice(0, 2)) {
          const newText = text.replace(original, synonym);
          if (newText !== text) {
            variations.push({
              ...item,
              text: newText,
              tags: [...(item.tags || []), 'augmented_synonym']
            });
          }
        }
      }
    }

    return variations;
  }

  /**
   * 句式变换扩充数据
   */
  augmentDataBySentenceTransformation(): TrainingDataItem[] {
    const transformedData: TrainingDataItem[] = [];
    for (const item of this.trainingData) {
      const transformations = this.transformSentenceStructure(item.text);
      for (const newText of transformations) {
        if (newText !== item.text) {
          transformedData.push({
            ...item,
            text: newText,
            tags: [...(item.tags || []), 'augmented_transform']
          });
        }
      }
    }
    return transformedData;
  }

  /**
   * 变换句式结构
   */
  private transformSentenceStructure(text: string): string[] {
    const transformations: string[] = [];

    const patterns = [
      {
        match: /^(请|帮|给)(.+?)(创建|新建|修改|删除|搜索|运行|测试|部署)/,
        transform: (match: RegExpMatchArray) => `${match[3]}${match[2]}`
      },
      {
        match: /^(创建|新建|修改|删除|搜索|运行|测试|部署)(.+?)(请|帮|给|我)/,
        transform: (match: RegExpMatchArray) => `${match[3]}${match[1]}${match[2]}`
      },
      {
        match: /^(我要|我想|我需要)(.+?)(创建|新建|修改|删除|搜索|运行|测试|部署)/,
        transform: (match: RegExpMatchArray) => `${match[3]}${match[2]}`
      }
    ];

    for (const { match, transform } of patterns) {
      const result = text.match(match);
      if (result) {
        const transformed = transform(result);
        if (transformed && transformed !== text) {
          transformations.push(transformed);
        }
      }
    }

    return transformations;
  }

  /**
   * 参数泛化扩充
   */
  augmentDataByParameterGeneralization(): TrainingDataItem[] {
    const generalizedData: TrainingDataItem[] = [];
    const parameterPatterns = [
      { pattern: /([用户|商品|订单|产品|客户])/, replacement: '{实体}' },
      { pattern: /(\w+Controller)/, replacement: '{Controller}' },
      { pattern: /(\w+Service)/, replacement: '{Service}' },
      { pattern: /(\w+Model)/, replacement: '{Model}' },
      { pattern: /(\w+Component)/, replacement: '{Component}' },
      { pattern: /(\/api\/\w+)/, replacement: '{API路径}' }
    ];

    for (const item of this.trainingData) {
      let generalizedText = item.text;
      let hasReplacement = false;
      for (const { pattern, replacement } of parameterPatterns) {
        if (pattern.test(generalizedText)) {
          generalizedText = generalizedText.replace(pattern, replacement);
          hasReplacement = true;
        }
      }
      if (hasReplacement) {
        generalizedData.push({
          ...item,
          text: generalizedText,
          tags: [...(item.tags || []), 'augmented_generalized']
        });
      }
    }
    return generalizedData;
  }

  /**
   * 获取类别统计
   */
  getCategoryStatistics(): Map<IntentCategory, number> {
    const stats = new Map<IntentCategory, number>();
    for (const item of this.trainingData) {
      const count = stats.get(item.category) || 0;
      stats.set(item.category, count + 1);
    }
    return stats;
  }

  /**
   * 获取语言分布统计
   */
  getLanguageDistribution(): { zh: number; en: number } {
    let zh = 0;
    let en = 0;
    for (const item of this.trainingData) {
      if (item.language === 'zh') zh++;
      else if (item.language === 'en') en++;
    }
    return { zh, en };
  }

  /**
   * 获取总数据量
   */
  getTotalCount(): number {
    return this.trainingData.length;
  }

  /**
   * 搜索训练数据
   */
  searchData(query: string): TrainingDataItem[] {
    const queryLower = query.toLowerCase();
    return this.trainingData.filter(item =>
      item.text.toLowerCase().includes(queryLower) ||
      item.category.toLowerCase().includes(queryLower) ||
      item.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * 导出训练数据为 JSON
   */
  exportToJson(): TrainingDataItem[] {
    return [...this.trainingData];
  }

  /**
   * 清空训练数据
   */
  clearData(): void {
    this.trainingData = [];
  }

  /**
   * 获取示例数据（用于测试）
   */
  getSampleData(): TrainingDataItem[] {
    return this.trainingData.slice(0, 10);
  }

  /**
   * 随机获取指定数量的训练数据
   */
  getRandomSamples(count: number = 10): TrainingDataItem[] {
    const shuffled = [...this.trainingData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * 检查类别是否平衡
   */
  isCategoryBalanced(threshold: number = 0.3): boolean {
    const stats = this.getCategoryStatistics();
    if (stats.size === 0) return true;
    const counts = Array.from(stats.values());
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (max === 0) return true;
    return (max - min) / max < threshold;
  }

  /**
   * 获取不平衡的类别
   */
  getImbalancedCategories(threshold: number = 0.3): IntentCategory[] {
    const stats = this.getCategoryStatistics();
    const counts = Array.from(stats.values());
    const max = Math.max(...counts);
    const imbalancedCategories: IntentCategory[] = [];

    for (const [category, count] of stats.entries()) {
      if ((max - count) / max >= threshold) {
        imbalancedCategories.push(category);
      }
    }
    return imbalancedCategories;
  }
}
