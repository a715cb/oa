import type { TokenizedInput, Entity, Constraint, Intent, FeatureVector } from './types';
import { ActionType } from './types';

/**
 * 意图提取器
 * 从输入文本中提取关键信息：实体、参数、约束条件等
 */
export class IntentExtractor {
  private filePatterns: RegExp[];
  private functionPatterns: RegExp[];
  private apiPatterns: RegExp[];
  private componentPatterns: RegExp[];
  private conditionPatterns: RegExp[];
  private negationWords: Set<string>;

  constructor() {
    this.filePatterns = [
      /(?:文件|file)[：:]\s*([^\s,，;；。.!！?？]+)/i,
      /(?:在|from)\s+([^\s]+\.(?:ts|js|tsx|jsx|vue|py|php|java|go|rs|html|css|scss|json|yaml|yml|md))/i,
      /([^\s]+\.(?:ts|js|tsx|jsx|vue|py|php|java|go|rs|html|css|scss|json|yaml|yml|md))/i,
      /(?:src|lib|src\/|components?|views?|pages?|api|utils?|models?|services?)[\/\\][^\s,，;；。.!！?？]+/i
    ];

    this.functionPatterns = [
      /(?:函数|方法|function|method)[：:]\s*([a-zA-Z_][a-zA-Z0-9_]*)/i,
      /(?:调用|call|invoke|use)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:函数|方法)?/i,
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:函数|方法)/i
    ];

    this.apiPatterns = [
      /(?:接口|API|endpoint|route)[：:]\s*([^\s,，;；。.!！?？]+)/i,
      /(?:GET|POST|PUT|DELETE|PATCH)\s+([^\s,，;；。.!！?？]+)/i,
      /\/(?:api|v\d+\/)[^\s,，;；。.!！?？]+/i
    ];

    this.componentPatterns = [
      /(?:组件|component)[：:]\s*([A-Z][a-zA-Z0-9]*)/i,
      /<([A-Z][a-zA-Z0-9]*)/i,
      /(?:创建|新建|添加)\s*([A-Z][a-zA-Z0-9]*(?:Component|View|Page|Modal|Dialog|Form|Table|List)*)/i
    ];

    this.conditionPatterns = [
      /(?:如果|假如|when|if)\s+(.+?)(?:则|就|,|，|$)/i,
      /(?:只有|only if)\s+(.+?)(?:才|,|，|$)/i,
      /(?:除非|unless)\s+(.+?)(?:否则|,|，|$)/i
    ];

    this.negationWords = new Set([
      '不', '别', '没', '不要', '不要', '无法', '不能', '不会',
      'no', 'not', "don't", "doesn't", "didn't", "won't", "can't", "cannot"
    ]);
  }

  /**
   * 分词和特征提取
   */
  tokenize(input: string): TokenizedInput {
    const cleaned = this.cleanInput(input);
    const tokens = this.splitTokens(cleaned);
    const keywords = this.extractKeywords(tokens);
    const entities = this.extractEntityNames(tokens);
    const verbs = this.extractVerbs(tokens);
    const nouns = this.extractNouns(tokens);
    const technicalTerms = this.extractTechnicalTerms(input);

    return {
      tokens,
      keywords,
      entities,
      verbs,
      nouns,
      technicalTerms
    };
  }

  /**
   * 清理输入
   */
  private cleanInput(input: string): string {
    return input
      .replace(/\s+/g, ' ')
      .replace(/[（）()【】\[\]{}]/g, ' ')
      .trim();
  }

  /**
   * 分词（简化版，支持中英文）
   */
  private splitTokens(input: string): string[] {
    const chineseRegex = /[\u4e00-\u9fa5]+/g;
    const englishRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const symbolRegex = /[\/\\.:,，;；!！?？()（）\[\]{}<>]/g;

    const chineseWords = input.match(chineseRegex) || [];
    const englishWords = input.match(englishRegex) || [];
    const symbols = input.match(symbolRegex) || [];

    const allTokens = [...chineseWords, ...englishWords, ...symbols];
    return allTokens.filter(token => token.trim().length > 0);
  }

  /**
   * 提取关键词
   */
  private extractKeywords(tokens: string[]): string[] {
    const stopWords = new Set([
      '的', '了', '在', '是', '我', '有', '和', '就', '都', '而', '及',
      '与', '这', '那', '一个', '这个', '那个', '请', '帮', '给', '想',
      '要', '能', '会', '可以', '把', '被', '让',
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
      'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
      'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
      'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while'
    ]);

    const keywords = tokens.filter(token =>
      token.length > 1 &&
      !stopWords.has(token.toLowerCase()) &&
      !/^[^\w\u4e00-\u9fa5]+$/.test(token)
    );

    return [...new Set(keywords)];
  }

  /**
   * 提取实体名称
   */
  private extractEntityNames(tokens: string[]): string[] {
    const entities: string[] = [];

    const englishWords = tokens.filter(t => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t) && t.length > 2);
    entities.push(...englishWords);

    const camelCaseRegex = /([A-Z][a-z]+(?:[A-Z][a-z]+)+)/g;
    const fullText = tokens.join(' ');
    const camelCaseMatches = fullText.match(camelCaseRegex);
    if (camelCaseMatches) {
      entities.push(...camelCaseMatches);
    }

    return [...new Set(entities)];
  }

  /**
   * 提取动词
   */
  private extractVerbs(tokens: string[]): string[] {
    const actionVerbs = new Set([
      '创建', '新建', '生成', '建立', '修改', '更新', '编辑', '更改', '调整',
      '删除', '移除', '清除', '读取', '打开', '查看', '显示', '展示',
      '搜索', '查找', '找', '查询', '运行', '执行', '测试', '部署', '发布',
      '上线', '构建', '打包', '优化', '重构', '重写', '改写', '改进',
      '添加', '补充', '写', '配置', '设置', '修复', '解决', '排查', '分析',
      'create', 'make', 'update', 'edit', 'modify', 'change', 'delete',
      'remove', 'read', 'open', 'show', 'view', 'check', 'search', 'find',
      'run', 'execute', 'test', 'deploy', 'build', 'optimize', 'refactor',
      'rewrite', 'improve', 'add', 'fix', 'solve', 'debug', 'analyze'
    ]);

    return tokens.filter(token => actionVerbs.has(token.toLowerCase()));
  }

  /**
   * 提取名词
   */
  private extractNouns(tokens: string[]): string[] {
    const technicalNouns = new Set([
      '文件', '代码', '函数', '方法', '类', '接口', '组件', '页面', '路由',
      '配置', '模型', '服务', '模块', '变量', '参数', '属性', '字段', '类型',
      '数据', '记录', '列表', '表单', '表格', '按钮', '输入框', '菜单',
      '测试', '用例', '单元测试', '集成测试', '端对端测试',
      '错误', 'bug', '异常', '问题', '日志',
      '项目', '应用', '系统', '平台', '数据库', '服务器',
      'api', 'file', 'code', 'function', 'method', 'class', 'component',
      'page', 'route', 'config', 'model', 'service', 'module', 'variable',
      'parameter', 'test', 'error', 'bug', 'database', 'server'
    ]);

    return tokens.filter(token => technicalNouns.has(token.toLowerCase()));
  }

  /**
   * 提取技术术语
   */
  private extractTechnicalTerms(input: string): string[] {
    const technicalPatterns = [
      /(?:JWT|OAuth|REST|GraphQL|API|CRUD|MVC|MVVM|SPA|PWA|SSR|CSR)/gi,
      /(?:React|Vue|Angular|Node|Express|Django|Flask|Spring|Laravel)/gi,
      /(?:TypeScript|JavaScript|Python|PHP|Java|Go|Rust)/gi,
      /(?:MySQL|PostgreSQL|MongoDB|Redis|SQLite)/gi,
      /(?:Git|Docker|K8s|Kubernetes|CI\/CD|Jenkins|GitHub)/gi,
      /(?:HTTP|HTTPS|WebSocket|TCP\/IP|DNS|SSL)/gi
    ];

    const terms: string[] = [];
    for (const pattern of technicalPatterns) {
      const matches = input.match(pattern);
      if (matches) {
        terms.push(...matches);
      }
    }

    return [...new Set(terms)];
  }

  /**
   * 提取实体
   */
  extractEntities(input: string): Entity[] {
    const entities: Entity[] = [];

    for (const pattern of this.filePatterns) {
      const match = pattern.exec(input);
      if (match && match[1]) {
        entities.push({
          type: 'file',
          name: match[1],
          path: match[1].includes('/') || match[1].includes('\\') ? match[1] : undefined
        });
      }
    }

    for (const pattern of this.functionPatterns) {
      const match = pattern.exec(input);
      if (match && match[1]) {
        entities.push({
          type: 'function',
          name: match[1]
        });
      }
    }

    for (const pattern of this.apiPatterns) {
      const match = pattern.exec(input);
      if (match && match[1]) {
        entities.push({
          type: 'api',
          name: match[1]
        });
      }
    }

    for (const pattern of this.componentPatterns) {
      const match = pattern.exec(input);
      if (match && match[1]) {
        entities.push({
          type: 'component',
          name: match[1]
        });
      }
    }

    return entities;
  }

  /**
   * 提取参数
   */
  extractParameters(input: string, tokenized: TokenizedInput): Record<string, any> {
    const params: Record<string, any> = {};

    const fileExtensionMatch = input.match(/\.([a-zA-Z0-9]+)(?:\s|$|，|,)/);
    if (fileExtensionMatch) {
      params.fileType = fileExtensionMatch[1];
    }

    const pathMatch = input.match(/(?:在|from|路径|path)[：:]?\s*([^\s,，;；。.!！?？]+)/i);
    if (pathMatch) {
      params.path = pathMatch[1];
    }

    const countMatch = input.match(/(?:所有|全部|每个|each|all|every)/i);
    if (countMatch) {
      params.scope = 'all';
    }

    const priorityMatch = input.match(/(优先|紧急|important|urgent|high priority)/i);
    if (priorityMatch) {
      params.priority = 'high';
    }

    if (tokenized.technicalTerms.length > 0) {
      params.technologies = tokenized.technicalTerms;
    }

    if (tokenized.entities.length > 0) {
      params.entities = tokenized.entities;
    }

    return params;
  }

  /**
   * 提取约束条件
   */
  extractConstraints(input: string): Constraint[] {
    const constraints: Constraint[] = [];

    for (const pattern of this.conditionPatterns) {
      const match = pattern.exec(input);
      if (match && match[1]) {
        constraints.push({
          type: 'condition',
          description: match[1].trim()
        });
      }
    }

    const priorityPatterns = [
      { pattern: /(?:优先|紧急|important|urgent)/i, description: '高优先级' },
      { pattern: /(?:稍后|之后|later)/i, description: '低优先级' },
      { pattern: /(?:仅|只|only)\s+(修改|更新|创建|删除)/i, description: '限定操作范围' }
    ];

    for (const { pattern, description } of priorityPatterns) {
      if (pattern.test(input)) {
        constraints.push({
          type: 'priority',
          description
        });
      }
    }

    const scopePatterns = [
      { pattern: /(?:整个|全部|all|entire)/i, description: '全局范围' },
      { pattern: /(?:当前|this|current)/i, description: '当前范围' },
      { pattern: /(?:仅|只|only)/i, description: '限定范围' }
    ];

    for (const { pattern, description } of scopePatterns) {
      if (pattern.test(input)) {
        constraints.push({
          type: 'scope',
          description
        });
      }
    }

    return constraints;
  }

  /**
   * 检测否定词
   */
  hasNegation(input: string): boolean {
    const words = input.toLowerCase().split(/\s+/);
    return words.some(word => this.negationWords.has(word));
  }

  /**
   * 检测条件表达式
   */
  hasCondition(input: string): boolean {
    return this.conditionPatterns.some(pattern => pattern.test(input));
  }

  /**
   * 检测时间表达式
   */
  hasTimeExpression(input: string): boolean {
    const timePatterns = [
      /(?:现在|稍后|之后|待会|马上|立即|now|later|soon|immediately)/i,
      /(?:今天|明天|后天|下周|下个月|today|tomorrow|next week)/i,
      /(?:\d{1,2}[:]\d{2})/,
      /(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/
    ];
    return timePatterns.some(pattern => pattern.test(input));
  }

  /**
   * 分割复合意图
   */
  splitCompoundIntents(input: string): string[] {
    const segments: string[] = [];

    const conjunctionPatterns = [
      /[,，]\s*(然后|接着|之后|再|并|并且|and\s+then|then)/gi,
      /\s+(然后|接着|之后|and\s+then|then)\s+/gi,
      /;\s*/,
      /。(?=[A-Z\u4e00-\u9fa5])/
    ];

    let lastSplitIndex = 0;
    let earliestSplitIndex = input.length;

    for (const pattern of conjunctionPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(input);
      if (match && match.index < earliestSplitIndex && match.index > lastSplitIndex) {
        earliestSplitIndex = match.index;
      }
    }

    if (earliestSplitIndex < input.length) {
      const firstPart = input.substring(0, earliestSplitIndex).trim();
      const secondPart = input.substring(earliestSplitIndex).trim();

      const conjunctionMatch = secondPart.match(/^(?:[,，;；]?\s*(?:然后|接着|之后|and\s+then|then)\s*)?(.+)$/i);
      if (conjunctionMatch) {
        segments.push(firstPart);
        segments.push(conjunctionMatch[1].trim());
      } else {
        segments.push(firstPart);
        if (secondPart.length > 5) {
          segments.push(secondPart);
        }
      }
    } else {
      segments.push(input);
    }

    return segments.filter(s => s.length > 2);
  }

  /**
   * 构建特征向量
   */
  buildFeatureVector(input: string, tokenized: TokenizedInput): FeatureVector {
    const keywords = new Map<string, number>();
    for (const keyword of tokenized.keywords) {
      const count = tokenized.tokens.filter(t => t === keyword).length;
      keywords.set(keyword, count);
    }

    const categoryScores = new Map();
    const actionScores = new Map();

    const actionVerbs = tokenized.verbs;
    for (const verb of actionVerbs) {
      actionScores.set(verb, (actionScores.get(verb) || 0) + 5);
    }

    return {
      keywords,
      categoryScores,
      actionScores,
      hasNegation: this.hasNegation(input),
      hasCondition: this.hasCondition(input),
      hasTimeExpression: this.hasTimeExpression(input),
      sentenceLength: input.length
    };
  }

  /**
   * 从意图推断目标
   */
  inferTargetFromIntent(input: string, intent: Intent): string {
    if (intent.target && intent.target.length > 0) {
      return intent.target;
    }

    const entities = this.extractEntities(input);
    if (entities.length > 0) {
      return entities[0].name;
    }

    const tokenized = this.tokenize(input);
    if (tokenized.nouns.length > 0) {
      return tokenized.nouns.slice(0, 2).join(' ');
    }

    const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '请', '帮', '给', '要']);
    const words = input.split(/[\s,，、.。!！?？;；:：]+/);
    const filtered = words.filter(w => w.length > 1 && !stopWords.has(w));
    return filtered.slice(0, 2).join(' ') || input.substring(0, 20);
  }
}
