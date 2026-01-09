import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'zh' | 'en';

const translations = {
  zh: {
    app_title: 'DLUT GPA',
    app_desc: '大连理工大学成绩管理系统',
    reset: '初始化',
    data_mgmt: '数据管理',
    share: '分享',
    total_gpa: '总加权 GPA',
    based_on_credits: '基于 {0} 学分',
    compulsory_gpa: '必修课 GPA',
    compulsory_desc: '基于 {0} 学分 (保研核心)',
    avg_score: '加权平均分',
    hundred_scale: '百分制',
    course_count: '课程数量',
    selected_total: '已选 / 共 {0} 门',
    filter_semester: '筛选学期',
    all_semesters: '全部学期',
    selected_semesters: '已选 {0} 个学期',
    search_placeholder: '搜索课程名称...',
    add_course: '添加新课程',
    semester: '学期',
    course_name: '课程名称',
    type: '属性',
    credits: '学分',
    score: '分数',
    gpa: 'GPA',
    action: '操作',
    save: '保存修改',
    cancel: '取消',
    edit_course: '编辑课程',
    no_data: '暂无课程数据',
    no_data_desc: '请使用上方表单添加课程或导入备份。',
    type_compulsory: '必修',
    type_elective: '选修',
    type_optional: '任选',
    score_dist: '成绩等级分布',
    gpa_trend: 'GPA 变化走势',
    credits_accum: '学期学分积累',
    target_calculator: '目标 GPA 计算器',
    set_target: '设定目标 GPA',
    remaining_credits: '剩余学分',
    required_gpa: '需要达到的 GPA',
    required_score: '平均分需达到',
    target_impossible: '目标过高',
    target_easy: '轻松达成',
    target_challenge: '挑战目标',
    calc_input_hint: '输入目标和学分以查看计算结果',
    ai_advisor: 'Gemini 智能学业导师',
    ai_desc: '基于您的成绩提供个性化分析',
    ai_btn: '分析我的成绩单',
    ai_analyzing: '正在分析您的学业表现...',
    ai_clear: '清除分析',
    import_export: '导入/导出',
    confirm_reset: '确定要重置所有数据到初始状态吗？此操作不可恢复。',
    sandbox_mode: '模拟模式',
    enter_sandbox: '进入模拟',
    exit_sandbox_save: '保存模拟结果',
    exit_sandbox_discard: '退出并不保存',
    sandbox_active: '正在模拟...',
    sandbox_banner: '您处于沙盒模式。所有更改仅为预览，不会自动保存。',
    simulated: '模拟',
    original: '原始',
    diff: '变化',
    grad_tracker: '毕业进度追踪',
    grad_settings: '设置毕业要求',
    grad_total_req: '总学分要求',
    grad_compulsory_req: '必修要求',
    grad_elective_req: '选修要求',
    grad_optional_req: '任选要求',
    grad_progress: '进度',
    grad_prediction: '预测毕业时间',
    grad_prediction_desc: '基于当前平均每学期 {0} 学分的速度，预计还需要 {1} 个学期。',
    grad_done: '恭喜！您已达到总学分要求。',
    grad_milestone_50: '已完成一半！',
    grad_milestone_80: '最后的冲刺！',
    save_settings: '保存设置',
    close: '关闭',
    
    // Theme & Share
    share_title: '生成成绩单海报',
    theme_select: '选择主题',
    theme_classic: '经典蓝',
    theme_cyberpunk: '赛博朋克',
    theme_zen: '极简水墨',
    theme_pixel: '像素复古',
    show_ranking: '显示头衔',
    save_image: '保存图片到相册',
    generating: '生成中...',
    share_hint: '图片生成后可长按保存或分享',
    highlight_courses: '高光时刻',
    total_credits: '总学分',
    avg_score_short: '平均分',
    
    // QR & App Calc
    qr_sync: '跨设备同步',
    qr_send: '生成同步码',
    qr_scan: '扫码导入',
    qr_desc: '在另一台设备上扫描此二维码以传输数据。',
    qr_scan_instruction: '将摄像头对准二维码',
    qr_too_large: '数据量过大，无法通过二维码传输。请使用文件导出。',
    app_calc_title: '保研/留学 核心算法',
    app_calc_open: '打开高级筛选',
    app_filters: '筛选条件',
    filter_sports: '排除体育课',
    filter_politics: '排除思政课',
    filter_optional: '排除任选课',
    filter_core_only: '仅计算核心课',
    mark_core: '标记核心',
    is_core: '核心课',
    app_gpa: '申请 GPA',
    app_gpa_desc: '基于筛选后的课程',
    original_gpa_short: '原始 GPA',
    wes_sim: 'WES 模拟算法',
    wes_desc: 'WES 认证常用算法预览',
    apply_filters: '应用筛选',
    course_list: '课程列表',

    // Default Settings
    tab_settings: '默认设置',
    set_as_default: '设为系统默认',
    set_default_desc: '将当前课程列表保存为“初始化”时的默认状态。',
    set_default_success: '设置成功！点击“初始化”按钮时将恢复到当前状态。',
    clear_default: '恢复出厂默认',
    clear_default_desc: '清除自定义的默认状态，恢复到 DLUT 演示数据。',
    clear_default_success: '已恢复到出厂默认设置。',
    
    // Filters
    all_types: '全部属性',
    filter_type: '筛选属性',
    core_only: '只看核心'
  },
  en: {
    app_title: 'DLUT GPA',
    app_desc: 'DLUT Grade Management System',
    reset: 'Reset',
    data_mgmt: 'Data',
    share: 'Share',
    total_gpa: 'Total Weighted GPA',
    based_on_credits: 'Based on {0} credits',
    compulsory_gpa: 'Compulsory GPA',
    compulsory_desc: '{0} credits (Core)',
    avg_score: 'Weighted Avg Score',
    hundred_scale: '0-100 Scale',
    course_count: 'Course Count',
    selected_total: 'Active / Total {0}',
    filter_semester: 'Filter Semester',
    all_semesters: 'All Semesters',
    selected_semesters: '{0} selected',
    search_placeholder: 'Search courses...',
    add_course: 'Add New Course',
    semester: 'Semester',
    course_name: 'Course Name',
    type: 'Type',
    credits: 'Credits',
    score: 'Score',
    gpa: 'GPA',
    action: 'Actions',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit_course: 'Edit Course',
    no_data: 'No Course Data',
    no_data_desc: 'Please add courses above or import data.',
    type_compulsory: 'Compulsory',
    type_elective: 'Elective',
    type_optional: 'Optional',
    score_dist: 'Score Distribution',
    gpa_trend: 'GPA Trend',
    credits_accum: 'Credits Accumulation',
    target_calculator: 'Target GPA Calc',
    set_target: 'Target GPA',
    remaining_credits: 'Remaining Credits',
    required_gpa: 'Required GPA',
    required_score: 'Req. Avg Score',
    target_impossible: 'Impossible',
    target_easy: 'Easy Reach',
    target_challenge: 'Challenging',
    calc_input_hint: 'Enter target & credits to calculate',
    ai_advisor: 'Gemini AI Advisor',
    ai_desc: 'Personalized analysis based on your grades',
    ai_btn: 'Analyze My Transcript',
    ai_analyzing: 'Analyzing your performance...',
    ai_clear: 'Clear Analysis',
    import_export: 'Import/Export',
    confirm_reset: 'Are you sure you want to reset all data? This cannot be undone.',
    sandbox_mode: 'Sandbox Mode',
    enter_sandbox: 'Simulate',
    exit_sandbox_save: 'Apply Changes',
    exit_sandbox_discard: 'Discard Changes',
    sandbox_active: 'Simulating...',
    sandbox_banner: 'You are in Sandbox Mode. Changes are for preview only.',
    simulated: 'Simulated',
    original: 'Original',
    diff: 'Diff',
    grad_tracker: 'Graduation Tracker',
    grad_settings: 'Graduation Requirements',
    grad_total_req: 'Total Req.',
    grad_compulsory_req: 'Compulsory Req.',
    grad_elective_req: 'Elective Req.',
    grad_optional_req: 'Optional Req.',
    grad_progress: 'Progress',
    grad_prediction: 'Estimation',
    grad_prediction_desc: 'Based on avg {0} credits/sem, estimated {1} semesters left.',
    grad_done: 'Congrats! You met the total requirement.',
    grad_milestone_50: 'Halfway There!',
    grad_milestone_80: 'Almost There!',
    save_settings: 'Save Settings',
    close: 'Close',
    
    // Theme & Share
    share_title: 'Generate Grade Report',
    theme_select: 'Select Theme',
    theme_classic: 'DLUT Classic',
    theme_cyberpunk: 'Cyberpunk',
    theme_zen: 'Zen Ink',
    theme_pixel: 'Pixel Retro',
    show_ranking: 'Show Title',
    save_image: 'Save Image',
    generating: 'Generating...',
    share_hint: 'Long press to save or share after generation',
    highlight_courses: 'Highlights',
    total_credits: 'Credits',
    avg_score_short: 'Avg Score',
    
    // QR & App Calc
    qr_sync: 'Device Sync',
    qr_send: 'Show QR Code',
    qr_scan: 'Scan QR Code',
    qr_desc: 'Scan this code on another device to transfer data.',
    qr_scan_instruction: 'Point camera at QR code',
    qr_too_large: 'Data too large for QR transfer. Please use File Export.',
    app_calc_title: 'Grad School / WES Calculator',
    app_calc_open: 'Open Application Filter',
    app_filters: 'Filters',
    filter_sports: 'Exclude PE',
    filter_politics: 'Exclude Politics',
    filter_optional: 'Exclude Optional',
    filter_core_only: 'Core Only',
    mark_core: 'Mark Core',
    is_core: 'Core',
    app_gpa: 'Application GPA',
    app_gpa_desc: 'Based on filtered courses',
    original_gpa_short: 'Original',
    wes_sim: 'WES Simulation',
    wes_desc: 'WES-like calculation preview',
    apply_filters: 'Apply Filters',
    course_list: 'Course List',

    // Default Settings
    tab_settings: 'Default Settings',
    set_as_default: 'Set as Default',
    set_default_desc: 'Save current list as the restore point for Reset.',
    set_default_success: 'Saved! Resetting will now restore this state.',
    clear_default: 'Restore Factory Default',
    clear_default_desc: 'Clear custom default and revert to demo data.',
    clear_default_success: 'Restored to factory defaults.',
    
    // Filters
    all_types: 'All Types',
    filter_type: 'Filter Type',
    core_only: 'Core Only'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['zh'], ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    const savedLang = localStorage.getItem('dlut_gpa_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dlut_gpa_lang', lang);
  };

  const t = (key: keyof typeof translations['zh'], ...args: any[]) => {
    let text = translations[language][key] || key;
    if (args.length > 0) {
      args.forEach((arg: any, index: number) => {
        text = text.replace(`{${index}}`, String(arg));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};