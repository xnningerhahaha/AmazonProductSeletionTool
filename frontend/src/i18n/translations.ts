export type Language = 'zh' | 'en'

export const translations = {
  zh: {
    // App
    appTitle: '亚马逊选品分析工具',
    appSubtitle: '输入产品ASIN码，快速获取选品分析报告',
    guideTitle: '使用指南',
    guide1: '在亚马逊产品页面找到ASIN码（通常在产品详情部分）',
    guide2: 'ASIN是10位字母数字组合，例如：B08N5WRWNW',
    guide3: '系统将分析产品的竞争程度、价格空间和市场需求',
    guide4: '分析结果会给出明确的推荐或不推荐建议',

    // AsinInput
    asinLabel: '输入ASIN码',
    asinPlaceholder: '例如: B08N5WRWNW',
    asinHint: 'ASIN是10位字母数字组合，可在亚马逊产品页面找到',
    clearInput: '清空输入',

    // AnalyzeButton
    analyzeButton: '开始分析',
    analyzing: '分析中...',

    // LoadingSpinner
    loadingMessage: '正在分析产品...',

    // ProductReport
    reportTitle: '选品分析报告',
    newAnalysis: '新建分析',
    backHome: '返回首页',

    // ProductBasicInfo
    reviews: '条评论',
    salesRank: '销售排名',
    inCategory: '在',
    imageLoading: '加载中...',
    imageError: '图片加载失败',

    // AnalysisConclusion
    overallScore: '综合评分',
    vetoTriggered: '触发一票否决机制',
    conclusions: {
      highly_recommended: { title: '强烈推荐', subtitle: '这是一个优质选品机会，市场条件良好' },
      recommended: { title: '推荐', subtitle: '该产品有一定机会，但需要策略' },
      neutral: { title: '谨慎做', subtitle: '机会一般，风险和收益并存' },
      not_recommended: { title: '不推荐', subtitle: '该产品存在较大风险，建议谨慎' },
    },

    // AnalysisDetails
    keyDimensions: '关键维度',
    basicDimensions: '基础维度',
    deepAnalysis: '深度分析',
    professionalAdvice: '专业建议',
    dimensionExplanation: '维度说明（点击展开）',
    dimensionNote: '* 括号内为该维度在综合评分中的权重占比',

    // Dimension titles
    dimMonopoly: '头部垄断度',
    dimPriceCollapse: '价格带塌陷',
    dimSurvivalRate: '新品存活率',
    dimDemand: '需求分析',
    dimPricing: '价格分析',
    dimCompetition: '竞争分析',
    dimReviewDefect: '评论集中缺陷',
    dimAdDependency: '广告依赖度',
    dimHomogeneity: '同质化程度',

    // Dimension explanations
    dimExplMonopoly: '头部垄断度 (25%): 评估市场是否被少数卖家垄断',
    dimExplDemand: '需求分析 (15%): 基于销售排名评估市场需求',
    dimExplPriceCollapse: '价格带塌陷 (10%): 检测价格竞争是否白热化',
    dimExplReviewDefect: '评论缺陷 (10%): 识别产品的隐藏质量问题',
    dimExplCompetition: '竞争分析 (10%): 评估市场竞争激烈程度',
    dimExplPricing: '价格分析 (10%): 评估利润空间和定价策略',
    dimExplAdDependency: '广告依赖 (8%): 评估广告成本和自然流量',
    dimExplHomogeneity: '同质化 (7%): 评估产品差异化程度',
    dimExplSurvivalRate: '存活率 (5%): 评估新品成功概率',

    // Risk levels
    levelLow: '低风险',
    levelMedium: '中等风险',
    levelHigh: '高风险',
    levelCritical: '极高风险',
    levelKey: '关键',
    score: '分',

    // WarningList
    riskWarning: '风险警告',

    // ErrorMessage
    retryButton: '重试',
    unknownError: '发生未知错误，请稍后重试',
    analysisFailed: '分析失败，请重试',

    // Veto messages
    'VETO:MONOPOLY': '⛔ 一票否决：头部垄断严重，市场已被少数卖家垄断，新手几乎没有机会',
    'VETO:PRICE': '⛔ 一票否决：价格带已塌陷，没有利润空间，只能拼成本',
    'VETO:SURVIVAL': '⛔ 一票否决：新品死亡率极高，这是"尸横遍野型类目"',
    'VETO:QUALITY': '⛔ 一票否决：产品存在严重质量问题，风险极高',

    // Warning messages
    'WARN:MONOPOLY': '⚠️ 头部垄断风险：市场被少数头部卖家主导，新手突围难度极大',
    'WARN:PRICE': '⚠️ 价格竞争风险：价格竞争激烈，利润空间受到严重压缩',
    'WARN:QUALITY': '⚠️ 质量问题风险：产品存在明显质量缺陷，影响长期经营',
    'WARN:ADS': '⚠️ 广告成本风险：广告依赖度高，CPC成本居高不下',
    'WARN:HOMOGENEITY': '⚠️ 同质化风险：产品高度同质化，差异化难度大',
    'WARN:SURVIVAL': '⚠️ 新品存活风险：新品存活率低，市场对新卖家不友好',

    // Recommendation messages
    'REC:HIGHLY_1': '✅ 这是一个优质选品机会，市场条件良好',
    'REC:HIGHLY_2': '💡 建议：快速进入市场，建立品牌优势',
    'REC:HIGHLY_3': '💡 市场分散，可以通过差异化快速占领细分市场',
    'REC:HIGHLY_4': '💡 利润空间充足，可以投入更多资源做品牌和服务',
    'REC:REC_1': '✅ 这个产品有一定机会，但需要策略',
    'REC:REC_2': '💡 建议：做好差异化定位，控制成本',
    'REC:REC_3': '💡 竞争较激烈，需要找到独特卖点',
    'REC:REC_4': '💡 需要准备充足的广告预算',
    'REC:NEUTRAL_1': '⚠️ 这个产品机会一般，风险和收益并存',
    'REC:NEUTRAL_2': '💡 建议：谨慎评估自身资源，做好风险控制',
    'REC:NEUTRAL_3': '💡 头部卖家优势明显，需要强大的差异化策略',
    'REC:NEUTRAL_4': '💡 价格竞争激烈，需要严格控制成本',
    'REC:NOT_1': '❌ 不建议进入这个产品类目',
    'REC:NOT_2': '💡 建议：寻找其他机会，避免资源浪费',
    'REC:NOT_3': '💡 市场已被垄断，新手很难突围',
    'REC:NOT_4': '💡 新品死亡率高，成功概率低',
  } as const,

  en: {
    // App
    appTitle: 'Amazon Product Selection Analyzer',
    appSubtitle: 'Enter a product ASIN to get a quick selection analysis report',
    guideTitle: 'How to Use',
    guide1: 'Find the ASIN on the Amazon product page (usually in the product details section)',
    guide2: 'ASIN is a 10-character alphanumeric code, e.g.: B08N5WRWNW',
    guide3: 'The system will analyze competition level, price margin, and market demand',
    guide4: 'Results will give a clear recommendation or not-recommended verdict',

    // AsinInput
    asinLabel: 'Enter ASIN',
    asinPlaceholder: 'e.g.: B08N5WRWNW',
    asinHint: 'ASIN is a 10-character alphanumeric code found on the Amazon product page',
    clearInput: 'Clear input',

    // AnalyzeButton
    analyzeButton: 'Analyze',
    analyzing: 'Analyzing...',

    // LoadingSpinner
    loadingMessage: 'Analyzing product...',

    // ProductReport
    reportTitle: 'Product Selection Report',
    newAnalysis: 'New Analysis',
    backHome: 'Back to Home',

    // ProductBasicInfo
    reviews: 'reviews',
    salesRank: 'Sales Rank',
    inCategory: 'in',
    imageLoading: 'Loading...',
    imageError: 'Image failed to load',

    // AnalysisConclusion
    overallScore: 'Overall Score',
    vetoTriggered: 'Veto Mechanism Triggered',
    conclusions: {
      highly_recommended: { title: 'Highly Recommended', subtitle: 'Excellent product opportunity with favorable market conditions' },
      recommended: { title: 'Recommended', subtitle: 'This product has potential, but requires strategy' },
      neutral: { title: 'Proceed with Caution', subtitle: 'Average opportunity with balanced risks and rewards' },
      not_recommended: { title: 'Not Recommended', subtitle: 'This product carries significant risks' },
    },

    // AnalysisDetails
    keyDimensions: 'Key Dimensions',
    basicDimensions: 'Basic Dimensions',
    deepAnalysis: 'Deep Analysis',
    professionalAdvice: 'Professional Advice',
    dimensionExplanation: 'Dimension Explanations (click to expand)',
    dimensionNote: '* Percentages indicate each dimension\'s weight in the overall score',

    // Dimension titles
    dimMonopoly: 'Market Monopoly',
    dimPriceCollapse: 'Price Collapse',
    dimSurvivalRate: 'New Product Survival',
    dimDemand: 'Demand Analysis',
    dimPricing: 'Price Analysis',
    dimCompetition: 'Competition Analysis',
    dimReviewDefect: 'Review Defects',
    dimAdDependency: 'Ad Dependency',
    dimHomogeneity: 'Homogeneity',

    // Dimension explanations
    dimExplMonopoly: 'Market Monopoly (25%): Assesses whether the market is dominated by a few sellers',
    dimExplDemand: 'Demand Analysis (15%): Evaluates market demand based on sales rank',
    dimExplPriceCollapse: 'Price Collapse (10%): Detects whether price competition is extreme',
    dimExplReviewDefect: 'Review Defects (10%): Identifies hidden quality issues in products',
    dimExplCompetition: 'Competition Analysis (10%): Evaluates market competition intensity',
    dimExplPricing: 'Price Analysis (10%): Evaluates profit margin and pricing strategy',
    dimExplAdDependency: 'Ad Dependency (8%): Evaluates ad costs and organic traffic',
    dimExplHomogeneity: 'Homogeneity (7%): Evaluates product differentiation level',
    dimExplSurvivalRate: 'Survival Rate (5%): Evaluates new product success probability',

    // Risk levels
    levelLow: 'Low Risk',
    levelMedium: 'Medium Risk',
    levelHigh: 'High Risk',
    levelCritical: 'Critical Risk',
    levelKey: 'Key',
    score: 'pts',

    // WarningList
    riskWarning: 'Risk Warnings',

    // ErrorMessage
    retryButton: 'Retry',
    unknownError: 'An unknown error occurred, please try again later',
    analysisFailed: 'Analysis failed, please try again',

    // Veto messages
    'VETO:MONOPOLY': '⛔ Veto: Severe market monopoly — market dominated by a few sellers, almost no chance for newcomers',
    'VETO:PRICE': '⛔ Veto: Price collapse — no profit margin left, pure cost competition',
    'VETO:SURVIVAL': '⛔ Veto: Extremely high new product failure rate — graveyard category',
    'VETO:QUALITY': '⛔ Veto: Serious product quality issues — extremely high risk',

    // Warning messages
    'WARN:MONOPOLY': '⚠️ Monopoly Risk: Market dominated by a few top sellers, very hard for newcomers to break through',
    'WARN:PRICE': '⚠️ Price Risk: Intense price competition, profit margins severely compressed',
    'WARN:QUALITY': '⚠️ Quality Risk: Noticeable product quality defects affecting long-term operations',
    'WARN:ADS': '⚠️ Ad Cost Risk: High ad dependency with persistently elevated CPC costs',
    'WARN:HOMOGENEITY': '⚠️ Homogeneity Risk: Highly homogeneous products, very hard to differentiate',
    'WARN:SURVIVAL': '⚠️ Survival Risk: Low new product survival rate, market unfriendly to new sellers',

    // Recommendation messages
    'REC:HIGHLY_1': '✅ Excellent product opportunity with favorable market conditions',
    'REC:HIGHLY_2': '💡 Move quickly to establish brand advantage',
    'REC:HIGHLY_3': '💡 Fragmented market — differentiation can quickly capture a niche',
    'REC:HIGHLY_4': '💡 Strong margins — invest more in brand building and service',
    'REC:REC_1': '✅ This product has potential, but requires a clear strategy',
    'REC:REC_2': '💡 Focus on differentiation and cost control',
    'REC:REC_3': '💡 Competitive market — find a unique selling point',
    'REC:REC_4': '💡 Prepare a sufficient advertising budget',
    'REC:NEUTRAL_1': '⚠️ Average opportunity — risks and rewards are balanced',
    'REC:NEUTRAL_2': '💡 Carefully assess your resources and manage risk',
    'REC:NEUTRAL_3': '💡 Top sellers have a clear edge — strong differentiation required',
    'REC:NEUTRAL_4': '💡 Intense price competition — strict cost control is essential',
    'REC:NOT_1': '❌ Not recommended to enter this product category',
    'REC:NOT_2': '💡 Look for better opportunities to avoid wasting resources',
    'REC:NOT_3': '💡 Market is monopolized — very hard for newcomers to break through',
    'REC:NOT_4': '💡 High new product failure rate — low probability of success',
  } as const,
}

export type Translations = typeof translations.zh
