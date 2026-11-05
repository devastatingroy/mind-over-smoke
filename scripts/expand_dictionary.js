import fs from 'fs';
import path from 'path';

const extraVocab = {
  // Frequently occurring core words
  vulnerable: { phonetic: '/ˈvʌlnərəbl/', pos: 'adj.', def: '脆弱的，易受攻击侵害的' },
  multinational: { phonetic: '/ˌmʌltiˈnæʃnəl/', pos: 'adj./n.', def: '跨国的；跨国大企业集团' },
  tobacco: { phonetic: '/təˈbækəʊ/', pos: 'n.', def: '烟草，烟草业' },
  neurological: { phonetic: '/ˌnjʊərəˈlɒdʒɪkl/', pos: 'adj.', def: '神经系统的，神经生物学的' },
  depletes: { phonetic: '/dɪˈpliːts/', pos: 'v.', def: '严重损耗，枯竭掏空' },
  deplete: { phonetic: '/dɪˈpliːt/', pos: 'v.', def: '消耗，耗尽' },
  artificially: { phonetic: '/ˌɑːtɪˈfɪʃəli/', pos: 'adv.', def: '人工地，人为地，不自然地' },
  masterclass: { phonetic: '/ˈmɑːstəklɑːs/', pos: 'n.', def: '大师课，教科书式经典范例' },
  generously: { phonetic: '/ˈdʒenərəsli/', pos: 'adv.', def: '慷慨大度地，毫不吝啬地' },
  fleeting: { phonetic: '/ˈfliːtɪŋ/', pos: 'adj.', def: '稍纵即逝的，极短暂的' },
  anguish: { phonetic: '/ˈæŋɡwɪʃ/', pos: 'n.', def: '极度痛苦，焦虑煎熬' },
  economic: { phonetic: '/ˌiːkəˈnɒmɪk/', pos: 'adj.', def: '经济学的，经济上的' },
  rational: { phonetic: '/ˈræʃnəl/', pos: 'adj.', def: '理性的，清醒合理的' },
  consumers: { phonetic: '/kənˈsjuːməz/', pos: 'n.', def: '消费者，大众客户' },
  privilege: { phonetic: '/ˈprɪvəlɪdʒ/', pos: 'n.', def: '特权，特殊待遇' },
  temporarily: { phonetic: '/ˈtemprərəli/', pos: 'adv.', def: '暂时地，临时性地' },
  resolves: { phonetic: '/rɪˈzɒlvz/', pos: 'v.', def: '解决，缓解，化解' },
  acute: { phonetic: '/əˈkjuːt/', pos: 'adj.', def: '急性的，剧烈的，尖锐的' },
  chemical: { phonetic: '/ˈkemɪkl/', pos: 'adj./n.', def: '化学的；化学合成物质' },
  heroically: { phonetic: '/həˈrəʊɪkli/', pos: 'adv.', def: '英勇地，逞英雄般地' },
  marketing: { phonetic: '/ˈmɑːkɪtɪŋ/', pos: 'n.', def: '市场营销策划' },
  gurus: { phonetic: '/ˈɡʊruːz/', pos: 'n.', def: '行业大师，营销宗师' },
  inhale: { phonetic: '/ɪnˈheɪl/', pos: 'v.', def: '吸入，深吸气' },
  nicotine: { phonetic: '/ˈnɪkətiːn/', pos: 'n.', def: '尼古丁（剧烈成瘾的神经性毒素）' },
  withdrawal: { phonetic: '/wɪðˈdrɔːəl/', pos: 'n.', def: '戒断反应，断瘾痛苦' },
  pipeline: { phonetic: '/ˈpaɪplaɪn/', pos: 'n.', def: '输送管道，利润流水线' },
  cathedral: { phonetic: '/kəˈθiːdrəl/ ', pos: 'n.', def: '大教堂，宏大殿堂' },
  sanctuary: { phonetic: '/ˈsæŋktʃuəri/', pos: 'n.', def: '避难所，宁静圣地' },
  monument: { phonetic: '/ˈmɒnjumənt/', pos: 'n.', def: '纪念碑，历史丰碑' },
  circulatory: { phonetic: '/ˌsɜːkjəˈleɪtəri/', pos: 'adj.', def: '血液循环系统的' },
  cerebral: { phonetic: '/ˈserəbrəl/', pos: 'adj.', def: '大脑的，脑部的' },
  cortex: { phonetic: '/ˈkɔːteks/', pos: 'n.', def: '大脑皮层' },
  prefrontal: { phonetic: '/ˌpriːˈfrʌntl/', pos: 'adj.', def: '前额叶的（负责理性自控）' },
  neurotransmitter: { phonetic: '/ˌnjʊərəʊtrænzˈmɪtə(r)/', pos: 'n.', def: '神经递质（脑化学信使）' },
  craving: { phonetic: '/ˈkreɪvɪŋ/', pos: 'n.', def: '剧烈渴求，烟瘾冲动' },
  interception: { phonetic: '/ˌɪntəˈsepʃn/', pos: 'n.', def: '拦截，阻断' },
  psychological: { phonetic: '/ˌsaɪkəˈlɒdʒɪkl/', pos: 'adj.', def: '心理学的，心理机制的' },
  physiological: { phonetic: '/ˌfɪziəˈlɒdʒɪkl/', pos: 'adj.', def: '生理机能的，肉体层面的' },
  cardiovascular: { phonetic: '/ˌkɑːdiəʊˈvæskjələ(r)/', pos: 'adj.', def: '心血管系统的' },
  equilibrium: { phonetic: '/ˌekwɪˈlɪbriəm/', pos: 'n.', def: '动态平衡，心智稳态' },
  lobby: { phonetic: '/ˈlɒbi/', pos: 'v./n.', def: '游说，买通政策' },
  fiercely: { phonetic: '/ˈfɪəsli/', pos: 'adv.', def: '凶猛顽固地，极力地' },
  underfunded: { phonetic: '/ˌʌndəˈfʌndɪd/', pos: 'adj.', def: '资金匮乏短缺的' },
  domestic: { phonetic: '/dəˈmestɪk/', pos: 'adj.', def: '本国的，家庭的' },
  shoulder: { phonetic: '/ˈʃəʊldə(r)/', pos: 'v.', def: '挑起，默默承担负荷' },
  cancer: { phonetic: '/ˈkænsə(r)/', pos: 'n.', def: '恶性肿瘤，癌症' },
  convincing: { phonetic: '/kənˈvɪnsɪŋ/', pos: 'adj.', def: '令人信服的，极具说服力的' },
  contract: { phonetic: '/ˈkɒntrækt/', pos: 'n.', def: '契约，不可逆合约' },
  ultimate: { phonetic: '/ˈʌltɪmət/', pos: 'adj.', def: '终极的，最根本的' },
  smokers: { phonetic: '/ˈsməʊkəz/', pos: 'n.', def: '吸烟人群' },
  swapping: { phonetic: '/ˈswɒpɪŋ/', pos: 'v.', def: '交换，偷梁换柱' },
  flavored: { phonetic: '/ˈfleɪvəd/', pos: 'adj.', def: '带口味调味的，水果味的' },
  lifestyle: { phonetic: '/ˈlaɪfstaɪl/', pos: 'n.', def: '生活方式，生活格调' },
  wellness: { phonetic: '/ˈwelnəs/', pos: 'n.', def: '健康保健' },
  vapor: { phonetic: '/ˈveɪpə(r)/', pos: 'n.', def: '蒸汽，电子烟雾' },
  tar: { phonetic: '/tɑː(r)/', pos: 'n.', def: '焦油（肺部黏黑致癌物）' },
  soot: { phonetic: '/sʊt/', pos: 'n.', def: '煤烟，黑灰污垢' },
  locking: { phonetic: '/ˈlɒkɪŋ/', pos: 'v.', def: '牢牢锁死，禁锢' },
  fragments: { phonetic: '/ˈfræɡmənts/', pos: 'v./n.', def: '碎片化，严重撕裂' },
  architecture: { phonetic: '/ˈɑːkɪtektʃə(r)/', pos: 'n.', def: '睡眠结构，生理架构' },
  disturbed: { phonetic: '/dɪˈstɜːbd/', pos: 'adj.', def: '紊乱受干扰的' },
  restorative: { phonetic: '/rɪˈstɔːrətɪv/', pos: 'adj.', def: '恢复精力的，修复性的' },
  rem: { phonetic: '/rem/', pos: 'n.', def: '快速眼动睡眠期（深层造梦修复）' },
  benign: { phonetic: '/bɪˈnaɪn/', pos: 'adj.', def: '良性的，无害温和的' },
  relaxes: { phonetic: '/rɪˈlæksɪz/', pos: 'v.', def: '放松，假性缓解' },
  microscopic: { phonetic: '/ˌmaɪkrəˈskɒpɪk/', pos: 'adj.', def: '显微镜下的，微观纤细的' },
  bronchial: { phonetic: '/ˈbrɒŋkiəl/', pos: 'adj.', def: '支气管的' },
  cilia: { phonetic: '/ˈsɪliə/', pos: 'n.', def: '呼吸道纤毛（吸烟首个瘫痪器官）' },
  epithelium: { phonetic: '/ˌepɪˈθiːliəm/', pos: 'n.', def: '上皮组织细胞' },
  paralysed: { phonetic: '/ˈpærəlaɪzd/', pos: 'adj.', def: '陷入麻痹瘫痪的' },
  paralyzed: { phonetic: '/ˈpærəlaɪzd/', pos: 'adj.', def: '陷入麻痹瘫痪的' },
  defenseless: { phonetic: '/dɪˈfensləs/', pos: 'adj.', def: '毫无防备的，丧失防线的' },
  airborne: { phonetic: '/ˈeəbɔːn/', pos: 'adj.', def: '空气中漂浮传播的' },
  bacteria: { phonetic: '/bækˈtɪəriə/', pos: 'n.', def: '细菌，病原微生物' }
};

const dictFile = path.resolve('src/utils/phoneticDict.js');
let content = fs.readFileSync(dictFile, 'utf-8');

// Insert extra words before '};' of phoneticDict
let inserted = 0;
for (const [word, data] of Object.entries(extraVocab)) {
  if (!content.includes(`  ${word}: {`)) {
    const entry = `  ${word}: { phonetic: '${data.phonetic}', pos: '${data.pos}', def: '${data.def}' },\n`;
    content = content.replace('};\n\n/**', entry + '};\n\n/**');
    inserted++;
  }
}

fs.writeFileSync(dictFile, content, 'utf-8');
console.log(`Successfully added ${inserted} high-frequency academic words with full IPA to phoneticDict.js!`);
