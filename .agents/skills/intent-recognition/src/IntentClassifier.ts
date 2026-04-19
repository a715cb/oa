import type { IntentRule, TokenizedInput, RecognitionConfig, Intent } from './types';
import { IntentCategory as IC, ActionType } from './types';

/**
 * 意图分类器
 * 实现基于规则、关键词和语义相似度的多层级意图分类
 */
export class IntentClassifier {
  private rules: IntentRule[];
  private keywordIndex: Map<string, IC[]>;
  private config: RecognitionConfig;
  private id: number;

  constructor(config: Partial<RecognitionConfig> = {}) {
    this.id = Date.now();
    this.rules = [];
    this.keywordIndex = new Map();
    this.config = {
      minConfidence: config.minConfidence ?? 0.6,
      maxIntents: config.maxIntents ?? 5,
      enableMultiIntent: config.enableMultiIntent ?? true,
      language: config.language ?? 'auto',
      useRuleFirst: config.useRuleFirst ?? true,
      confidenceThreshold: config.confidenceThreshold ?? 0.5
    };
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    const defaultRules: IntentRule[] = [
      {
        id: `rule_${this.id}_file_create`,
        pattern: /(创建|新建|生成|建立|make|create|add|new).*(文件|组件|接口|模型|服务|页面|路由|配置)/i,
        category: IC.FileOperation,
        subCategory: 'create_file',
        action: ActionType.Create,
        priority: 10,
        extractParams: (match) => this.extractTarget(match)
      },
      {
        id: `rule_${this.id}_file_read`,
        pattern: /(读取|打开|查看|显示|展示|read|open|show|view|check).*(文件|代码|内容|配置|日志)/i,
        category: IC.FileOperation,
        subCategory: 'read_file',
        action: ActionType.Read,
        priority: 10
      },
      {
        id: `rule_${this.id}_file_update`,
        pattern: /(修改|更新|编辑|更改|调整|update|edit|modify|change).*(文件|配置|字段|字段名|参数)/i,
        category: IC.FileOperation,
        subCategory: 'update_file',
        action: ActionType.Update,
        priority: 10
      },
      {
        id: `rule_${this.id}_file_delete`,
        pattern: /(删除|移除|清除|delete|remove).*(文件|代码|记录|数据)/i,
        category: IC.FileOperation,
        subCategory: 'delete_file',
        action: ActionType.Delete,
        priority: 10
      },
      {
        id: `rule_${this.id}_code_modify`,
        pattern: /(修改|调整|优化|改进|重构|重写|改写).*(代码|逻辑|函数|方法|类)/i,
        category: IC.CodeModification,
        subCategory: 'change_logic',
        action: ActionType.Modify,
        priority: 9
      },
      {
        id: `rule_${this.id}_debug_error`,
        pattern: /(报错|错误|bug|问题|异常|出错|失败|无法|不工作|error|fix|debug|修复).*/i,
        category: IC.Debugging,
        subCategory: 'error_analysis',
        action: ActionType.Analyze,
        priority: 9
      },
      {
        id: `rule_${this.id}_test_run`,
        pattern: /(运行|执行|跑|测试|test|run).*(测试|用例|单元测试|集成测试)/i,
        category: IC.Testing,
        subCategory: 'run_test',
        action: ActionType.Run,
        priority: 9
      },
      {
        id: `rule_${this.id}_search_code`,
        pattern: /(搜索|查找|找|查询|search|find|look for).*(代码|文件|函数|引用|用法)/i,
        category: IC.QuerySearch,
        subCategory: 'search_code',
        action: ActionType.Search,
        priority: 8
      },
      {
        id: `rule_${this.id}_deploy`,
        pattern: /(部署|发布|上线|构建|打包|build|deploy|publish|release).*/i,
        category: IC.Deployment,
        subCategory: 'build_project',
        action: ActionType.Build,
        priority: 8
      },
      {
        id: `rule_${this.id}_doc_write`,
        pattern: /(写|添加|补充|生成).*(注释|文档|说明|README|API文档|注释)/i,
        category: IC.Documentation,
        subCategory: 'write_comment',
        action: ActionType.Document,
        priority: 8
      }
    ];
    this.rules = defaultRules;
    this.buildKeywordIndex();
  }

  /**
   * 构建关键词索引
   */
  private buildKeywordIndex(): void {
    this.keywordIndex.clear();
    const keywordMap: Record<string, IC[]> = {
      '创建': [IC.FileOperation, IC.FeatureDevelopment],
      '新建': [IC.FileOperation],
      '修改': [IC.CodeModification, IC.FileOperation],
      '删除': [IC.FileOperation],
      '搜索': [IC.QuerySearch],
      '查找': [IC.QuerySearch],
      '运行': [IC.Testing, IC.Deployment],
      '测试': [IC.Testing],
      '部署': [IC.Deployment],
      '报错': [IC.Debugging],
      '错误': [IC.Debugging],
      '优化': [IC.Refactoring],
      '重构': [IC.Refactoring],
      '配置': [IC.Configuration],
      '注释': [IC.Documentation],
      'create': [IC.FileOperation, IC.FeatureDevelopment],
      'update': [IC.CodeModification, IC.FileOperation],
      'delete': [IC.FileOperation],
      'search': [IC.QuerySearch],
      'test': [IC.Testing],
      'deploy': [IC.Deployment],
      'error': [IC.Debugging],
      'fix': [IC.Debugging],
      'refactor': [IC.Refactoring]
    };
    for (const [keyword, categories] of Object.entries(keywordMap)) {
      this.keywordIndex.set(keyword.toLowerCase(), categories);
    }
  }

  /**
   * 分类输入文本
   */
  classify(input: string, tokenized: TokenizedInput): Intent[] {
    const intents: Intent[] = [];

    if (this.config.useRuleFirst) {
      const ruleBasedIntents = this.matchRules(input);
      intents.push(...ruleBasedIntents);
    }

    if (intents.length === 0 || intents[0].confidence < this.config.confidenceThreshold) {
      const keywordIntents = this.matchKeywords(input, tokenized);
      if (intents.length === 0 || keywordIntents[0]?.confidence > intents[0]?.confidence) {
        intents.length = 0;
        intents.push(...keywordIntents);
      }
    }

    if (intents.length === 0 || intents[0].confidence < this.config.confidenceThreshold) {
      const semanticIntents = this.semanticMatch(input, tokenized);
      if (intents.length === 0 || semanticIntents[0]?.confidence > intents[0]?.confidence) {
        intents.length = 0;
        intents.push(...semanticIntents);
      }
    }

    intents.sort((a, b) => b.confidence - a.confidence);

    if (!this.config.enableMultiIntent && intents.length > 1) {
      intents.splice(1);
    }

    if (intents.length > this.config.maxIntents) {
      intents.splice(this.config.maxIntents);
    }

    intents.forEach((intent, index) => {
      if (intents.length > 1) {
        intent.order = index + 1;
      }
    });

    intents.forEach(intent => {
      if (intent.confidence < this.config.minConfidence) {
        intent.category = IC.Unknown;
        intent.confidence = Math.max(intent.confidence, 0.3);
      }
    });

    return intents;
  }

  /**
   * 规则匹配
   */
  private matchRules(input: string): Intent[] {
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);
    const intents: Intent[] = [];
    for (const rule of sortedRules) {
      const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
      const match = regex.exec(input);
      if (match) {
        const confidence = this.calculateRuleConfidence(match[0], input, rule.priority);
        const intent: Intent = {
          category: rule.category,
          subCategory: rule.subCategory as Intent['subCategory'],
          confidence,
          action: rule.action,
          target: this.extractTargetText(input, match),
          parameters: rule.extractParams ? rule.extractParams(match) : {},
          rawMatch: match[0]
        };
        intents.push(intent);
        if (rule.priority >= 9) {
          break;
        }
      }
    }
    return intents;
  }

  /**
   * 关键词匹配
   */
  private matchKeywords(input: string, tokenized: TokenizedInput): Intent[] {
    const intents: Intent[] = [];
    const categoryScores = new Map<IC, number>();
    const inputLower = input.toLowerCase();

    for (const [keyword, categories] of this.keywordIndex.entries()) {
      if (inputLower.includes(keyword)) {
        const score = this.calculateKeywordScore(keyword, input);
        for (const category of categories) {
          const currentScore = categoryScores.get(category) || 0;
          categoryScores.set(category, currentScore + score);
        }
      }
    }

    for (const [category, score] of categoryScores.entries()) {
      const maxPossibleScore = tokenized.keywords.length * 10;
      const confidence = Math.min(score / maxPossibleScore, 1);
      if (confidence >= this.config.confidenceThreshold) {
        intents.push({
          category,
          confidence: confidence * 0.8,
          action: this.inferActionFromCategory(category),
          target: this.extractTargetFromKeywords(input, tokenized)
        });
      }
    }

    intents.sort((a, b) => b.confidence - a.confidence);
    return intents;
  }

  /**
   * 语义相似度匹配（简化版）
   */
  private semanticMatch(input: string, tokenized: TokenizedInput): Intent[] {
    const categoryIntentMap: Array<{ category: IC; keywords: string[]; action: ActionType }> = [
      { category: IC.FileOperation, keywords: ['文件', '创建', '读取', '修改', '删除', 'file'], action: ActionType.Create },
      { category: IC.CodeModification, keywords: ['修改', '调整', '优化', '代码', '逻辑'], action: ActionType.Modify },
      { category: IC.FeatureDevelopment, keywords: ['开发', '添加', '功能', '接口', '实现'], action: ActionType.Create },
      { category: IC.Testing, keywords: ['测试', '运行', '用例', 'unit', 'test'], action: ActionType.Run },
      { category: IC.Debugging, keywords: ['错误', 'bug', '修复', '排查', 'error'], action: ActionType.Fix },
      { category: IC.Refactoring, keywords: ['重构', '优化', '性能', '简化'], action: ActionType.Optimize },
      { category: IC.QuerySearch, keywords: ['搜索', '查找', '查询', '找', 'search'], action: ActionType.Search },
      { category: IC.Deployment, keywords: ['部署', '发布', '构建', '打包', 'deploy'], action: ActionType.Deploy },
      { category: IC.Configuration, keywords: ['配置', '环境变量', '设置'], action: ActionType.Configure },
      { category: IC.Documentation, keywords: ['文档', '注释', '说明', 'readme'], action: ActionType.Document }
    ];

    const intents: Intent[] = [];
    const inputLower = input.toLowerCase();

    for (const mapping of categoryIntentMap) {
      let matchCount = 0;
      for (const keyword of mapping.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        const confidence = (matchCount / mapping.keywords.length) * 0.7;
        intents.push({
          category: mapping.category,
          confidence,
          action: mapping.action,
          target: this.extractTargetFromSemantic(input, tokenized)
        });
      }
    }

    intents.sort((a, b) => b.confidence - a.confidence);
    return intents;
  }

  /**
   * 计算规则匹配置信度
   */
  private calculateRuleConfidence(matchText: string, fullInput: string, priority: number): number {
    const matchRatio = matchText.length / fullInput.length;
    const priorityWeight = priority / 10;
    const confidence = (matchRatio * 0.3 + priorityWeight * 0.7);
    return Math.min(Math.max(confidence, 0.5), 1.0);
  }

  /**
   * 计算关键词得分
   */
  private calculateKeywordScore(keyword: string, input: string): number {
    const isExactMatch = input.toLowerCase().includes(keyword.toLowerCase());
    const keywordLength = keyword.length;
    return isExactMatch ? Math.min(keywordLength * 2, 10) : 0;
  }

  /**
   * 从类别推断动作
   */
  private inferActionFromCategory(category: IC): ActionType {
    const categoryActionMap: Record<IC, ActionType> = {
      [IC.FileOperation]: ActionType.Create,
      [IC.CodeModification]: ActionType.Modify,
      [IC.FeatureDevelopment]: ActionType.Create,
      [IC.Testing]: ActionType.Run,
      [IC.Debugging]: ActionType.Fix,
      [IC.Refactoring]: ActionType.Optimize,
      [IC.QuerySearch]: ActionType.Search,
      [IC.Deployment]: ActionType.Deploy,
      [IC.Configuration]: ActionType.Configure,
      [IC.Documentation]: ActionType.Document,
      [IC.Unknown]: ActionType.Unknown
    };
    return categoryActionMap[category] || ActionType.Unknown;
  }

  /**
   * 提取目标文本
   */
  private extractTargetText(_input: string, match: RegExpExecArray | null): string {
    if (!match) return '';
    const fullMatch = match[0];
    const patterns = [
      /(?:创建|新建|生成|建立|修改|更新|删除|读取|搜索|查找|运行|部署|配置).*(文件|组件|接口|模型|服务|页面|配置|代码|函数|方法|测试|错误|bug)/i,
      /(?:create|update|delete|read|search|find|run|deploy|configure).*(file|component|api|model|service|page|config|code|function|test|error)/i
    ];
    for (const pattern of patterns) {
      const result = pattern.exec(fullMatch);
      if (result) {
        return result[0];
      }
    }
    return fullMatch.length > 50 ? fullMatch.substring(0, 50) + '...' : fullMatch;
  }

  /**
   * 提取目标（规则参数）
   */
  private extractTarget(match: RegExpExecArray | null): Record<string, any> {
    if (!match) return {};
    return { matchedText: match[0], timestamp: Date.now() };
  }

  /**
   * 从关键词提取目标
   */
  private extractTargetFromKeywords(input: string, tokenized: TokenizedInput): string {
    const stopWords = ['的', '了', '一个', '这个', '那个', '我', '你', '他', '她', '它', '请', '帮', '给'];
    const filteredTokens = tokenized.nouns.filter(noun => !stopWords.includes(noun));
    if (filteredTokens.length > 0) {
      return filteredTokens.slice(0, 3).join(' ');
    }
    const words = input.split(/[\s,，、.。!！?？;；:：]+/);
    const filtered = words.filter(w => w.length > 1 && !stopWords.includes(w));
    return filtered.slice(0, 3).join(' ') || input.substring(0, 30);
  }

  /**
   * 从语义提取目标
   */
  private extractTargetFromSemantic(input: string, tokenized: TokenizedInput): string {
    return this.extractTargetFromKeywords(input, tokenized);
  }

  /**
   * 获取当前配置
   */
  getConfig(): RecognitionConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RecognitionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 添加自定义规则
   */
  addRule(rule: IntentRule): void {
    this.rules.push(rule);
    this.buildKeywordIndex();
  }

  /**
   * 移除规则
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取所有规则
   */
  getRules(): IntentRule[] {
    return [...this.rules];
  }
}
