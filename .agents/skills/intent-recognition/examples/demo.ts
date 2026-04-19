import { IntentRecognitionService } from '../src/IntentRecognitionService';
import type { TrainingDataItem } from '../src/types';

async function runDemo(): Promise<void> {
  const service = new IntentRecognitionService({
    minConfidence: 0.5,
    maxIntents: 3,
    enableMultiIntent: true,
    language: 'auto',
    useRuleFirst: true,
    confidenceThreshold: 0.4
  });

  await service.initialize();

  console.log('=== 意图识别模块演示 ===\n');

  const testCases: string[] = [
    '创建一个用户登录接口',
    '修改用户模型的字段，然后运行测试',
    '这个报错了，帮我看看',
    '搜索所有使用axios的地方',
    '部署到生产环境',
    '给这个函数写注释',
    '优化数据库查询性能',
    '我想添加一个新的用户权限模块',
    '把所有的console.log替换为logger',
    'create a user authentication API',
    'run all unit tests and fix any failures',
    'find all places where we use deprecated APIs'
  ];

  for (const [index, input] of testCases.entries()) {
    console.log(`--- 测试用例 ${index + 1} ---`);
    console.log(`输入: "${input}"`);

    const result = service.recognizeIntent(input);

    console.log(`意图数量: ${result.intents.length}`);
    console.log(`是否复合意图: ${result.isCompound}`);
    console.log(`需要澄清: ${result.needsClarification}`);
    console.log(`处理时间: ${result.metadata?.processingTime}ms`);
    console.log(`语言: ${result.metadata?.language}`);

    if (result.intents.length > 0) {
      console.log('主要意图:');
      for (const intent of result.intents) {
        console.log(`  - 类别: ${intent.category}`);
        console.log(`    子类别: ${intent.subCategory || 'N/A'}`);
        console.log(`    动作: ${intent.action}`);
        console.log(`    目标: ${intent.target}`);
        console.log(`    置信度: ${(intent.confidence * 100).toFixed(1)}%`);
        if (intent.entities && intent.entities.length > 0) {
          console.log(`    实体: ${intent.entities.map(e => `${e.type}:${e.name}`).join(', ')}`);
        }
        if (intent.constraints && intent.constraints.length > 0) {
          console.log(`    约束: ${intent.constraints.map(c => c.description).join(', ')}`);
        }
      }
    }

    if (result.alternatives && result.alternatives.length > 0) {
      console.log('备选意图:');
      for (const alt of result.alternatives) {
        console.log(`  - ${alt.category} (${(alt.confidence * 100).toFixed(1)}%)`);
      }
    }

    console.log('');
  }

  console.log('=== 训练数据统计 ===');
  const stats = service.getTrainingDataStats();
  console.log(`总数据量: ${stats.totalCount}`);
  console.log(`语言分布: 中文 ${stats.languageDist.zh}, 英文 ${stats.languageDist.en}`);
  console.log(`类别平衡: ${stats.isBalanced ? '是' : '否'}`);

  console.log('\n=== 服务状态 ===');
  const status = service.getStatus();
  console.log(`已初始化: ${status.initialized}`);
  console.log(`规则数量: ${status.ruleCount}`);
  console.log(`训练数据: ${status.trainingDataCount}`);

  console.log('\n=== 演示完成 ===');
}

runDemo().catch(console.error);
