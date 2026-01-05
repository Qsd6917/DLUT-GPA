import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalculationMethod, Course, CourseType } from './types';
import { calculateCourseGpa, calculateStats } from './services/gpaService';
import { SAMPLE_COURSES, DEFAULT_CALCULATION_METHOD } from './constants';
import { AddCourseForm } from './components/AddCourseForm';
import { CourseList } from './components/CourseList';
import { EditCourseModal } from './components/EditCourseModal';
import { DataManagementModal } from './components/DataManagementModal';
import { ShareableReportModal } from './components/ShareableReportModal';
import { StatsCard } from './components/StatsCard';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AiAdvisor } from './components/AiAdvisor';
import { TargetGpaCalculator } from './components/TargetGpaCalculator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { GraduationCap, Award, Book, Settings, Percent, Search, Database, RotateCcw, Filter, ChevronDown, Check, Sparkles, PieChart as PieChartIcon, Share2 } from 'lucide-react';

const COLORS = ['#10B981', '#005BAC', '#F59E0B', '#EF4444', '#6B7280'];
const STORAGE_KEY = 'dlut_gpa_courses_v3';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [method, setMethod] = useState<CalculationMethod>(DEFAULT_CALCULATION_METHOD);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [logoError, setLogoError] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  
  // Modals State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let initialCourses: Course[] = [];

    if (savedData) {
      try {
        initialCourses = JSON.parse(savedData);
      } catch (e) {
        initialCourses = [];
      }
    }

    if (initialCourses.length === 0) {
        initialCourses = SAMPLE_COURSES.map(c => ({
            ...c,
            gpa: calculateCourseGpa(c.score, DEFAULT_CALCULATION_METHOD),
        }));
    } else {
        // Migration: Ensure 'type' exists for old data
        initialCourses = initialCourses.map(c => ({
            ...c,
            type: c.type || '必修',
            gpa: calculateCourseGpa(c.score, DEFAULT_CALCULATION_METHOD)
        }));
    }

    setCourses(initialCourses);
    setHydrated(true);
  }, []);

  // Persist courses
  useEffect(() => {
    if (hydrated && courses.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    }
  }, [courses, hydrated]);

  // Recalculate individual GPAs when method changes
  useEffect(() => {
    if (!hydrated) return;
    setCourses(prev => prev.map(c => ({
        ...c,
        gpa: calculateCourseGpa(c.score, method)
    })));
  }, [method, hydrated]);

  const handleAddCourse = (name: string, credits: number, score: number, semester: string, type: CourseType) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
      credits,
      score,
      semester,
      type,
      gpa: calculateCourseGpa(score, method),
      isActive: true
    };
    setCourses([...courses, newCourse]);
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleToggleCourse = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };
  
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };
  
  const handleSaveCourse = (id: string, name: string, credits: number, score: number, semester: string, type: CourseType) => {
    setCourses(prev => prev.map(c => {
        if (c.id === id) {
            return {
                ...c,
                name,
                credits,
                score,
                semester,
                type,
                gpa: calculateCourseGpa(score, method)
            };
        }
        return c;
    }));
    setEditingCourse(null);
  };

  const handleToggleAll = (checked: boolean) => {
    if (searchTerm || selectedSemesters.length > 0) {
        const visibleIds = new Set(filteredCourses.map(c => c.id));
        setCourses(courses.map(c => visibleIds.has(c.id) ? { ...c, isActive: checked } : c));
    } else {
        setCourses(courses.map(c => ({ ...c, isActive: checked })));
    }
  };
  
  const handleImportData = (importedCourses: Course[], mode: 'replace' | 'merge') => {
    const processedCourses = importedCourses.map(c => ({
        ...c,
        id: c.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        isActive: c.isActive !== undefined ? c.isActive : true,
        semester: c.semester || '未知学期',
        type: c.type || '必修',
        gpa: calculateCourseGpa(c.score, method)
    }));

    if (mode === 'replace') {
        setCourses(processedCourses);
    } else {
        const newCourses = processedCourses.map(c => ({ 
            ...c, 
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9) 
        }));
        setCourses([...courses, ...newCourses]);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('确定要重置所有数据到初始状态吗？此操作不可恢复。')) {
        localStorage.removeItem(STORAGE_KEY);
        const defaultCourses = SAMPLE_COURSES.map(c => ({
            ...c,
            gpa: calculateCourseGpa(c.score, method),
        }));
        setCourses(defaultCourses);
        setSelectedSemesters([]);
        setSearchTerm('');
    }
  };

  const semesters = useMemo(() => {
      const s = new Set(courses.map(c => c.semester));
      return Array.from(s).sort();
  }, [courses]);

  const toggleSemester = (sem: string) => {
      if (selectedSemesters.includes(sem)) {
          setSelectedSemesters(prev => prev.filter(s => s !== sem));
      } else {
          setSelectedSemesters(prev => [...prev, sem]);
      }
  };

  const filteredCourses = useMemo(() => {
    let result = courses;
    
    if (selectedSemesters.length > 0) {
        result = result.filter(c => selectedSemesters.includes(c.semester));
    }
    
    if (searchTerm.trim()) {
        result = result.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return result;
  }, [courses, searchTerm, selectedSemesters]);

  const activeCourses = useMemo(() => filteredCourses.filter(c => c.isActive), [filteredCourses]);
  const stats = useMemo(() => calculateStats(activeCourses), [activeCourses]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 pb-12 font-sans selection:bg-blue-100 selection:text-dlut-blue">
      <style>{`
        .text-dlut-blue { color: #005BAC; }
        .bg-dlut-blue { background-color: #005BAC; }
        .border-dlut-blue { border-color: #005BAC; }
        .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
        .glass-header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226, 232, 240, 0.8); }
      `}</style>

      {/* Modals */}
      {editingCourse && (
        <EditCourseModal 
            course={editingCourse} 
            isOpen={true} 
            onClose={() => setEditingCourse(null)} 
            onSave={handleSaveCourse} 
            existingSemesters={semesters}
        />
      )}

      <DataManagementModal 
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        courses={courses}
        onImport={handleImportData}
      />
      
      <ShareableReportModal 
         isOpen={isShareModalOpen}
         onClose={() => setIsShareModalOpen(false)}
         stats={stats}
         courses={activeCourses}
      />

      {/* Header */}
      <header className="glass-header sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="flex-shrink-0 relative overflow-hidden rounded-full p-1 bg-white border border-blue-50 shadow-sm transition-transform group-hover:scale-105 duration-300 w-12 h-12 flex items-center justify-center">
               {!logoError ? (
                   <img 
                     src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Dalian_University_of_Technology_logo.png/240px-Dalian_University_of_Technology_logo.png" 
                     alt="DLUT Logo" 
                     className="w-10 h-10 object-contain"
                     onError={() => setLogoError(true)}
                   />
               ) : (
                   <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-full">
                        <GraduationCap className="text-dlut-blue w-6 h-6" />
                   </div>
               )}
            </div>
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  DLUT GPA
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-dlut-blue text-[10px] font-bold uppercase tracking-wider border border-blue-100 hidden sm:inline-block">
                    Pro
                  </span>
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">大连理工大学成绩管理系统</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-2">
                 <button 
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                    <RotateCcw size={14} />
                    初始化
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button 
                    onClick={() => setIsDataModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-dlut-blue px-3 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200"
                >
                    <Database size={14} />
                    数据管理
                </button>
                <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200"
                >
                    <Share2 size={14} />
                    分享
                </button>
            </div>
            
            {/* Mobile Share Button (Only Icon) */}
            <button 
                onClick={() => setIsShareModalOpen(true)}
                className="md:hidden flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-xl transition-all"
            >
                <Share2 size={18} />
            </button>

            <div className="flex items-center gap-2 bg-gray-100/80 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl px-3 py-2 transition-all duration-200 shadow-sm">
                <Settings size={16} className="text-gray-500" />
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as CalculationMethod)}
                    className="text-sm border-none bg-transparent font-semibold text-gray-700 focus:ring-0 cursor-pointer focus:outline-none min-w-[100px] sm:min-w-[120px]"
                >
                    <option value={CalculationMethod.SUBTRACTIVE}>DLUT 5.0 (标准)</option>
                    <option value={CalculationMethod.STD_4_0}>Standard 4.0</option>
                    <option value={CalculationMethod.PKU_4_0}>北大 4.0</option>
                    <option value={CalculationMethod.SCALE_4_5}>4.5 分制</option>
                    <option value={CalculationMethod.LINEAR}>线性 5.0 (/20)</option>
                    <option value={CalculationMethod.WES}>WES 5.0</option>
                </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatsCard
            title="总加权 GPA"
            value={stats.weightedGpa.toFixed(3)}
            icon={<Award className="text-white" size={24} />}
            description={`基于 ${stats.totalCredits} 学分`}
            colorClass="bg-gradient-to-br from-[#005BAC] to-[#004280] text-white shadow-lg shadow-blue-900/20"
          />
          <StatsCard
            title="必修课 GPA"
            value={stats.compulsoryWeightedGpa.toFixed(3)}
            icon={<Book className="text-purple-600" size={24} />}
            description={`基于 ${stats.compulsoryCredits} 学分 (保研核心)`}
            colorClass="bg-white border-l-4 border-purple-500 shadow-soft"
          />
          <StatsCard
            title="加权平均分"
            value={stats.weightedAverageScore.toFixed(2)}
            icon={<Percent className="text-emerald-600" size={24} />}
            description="百分制"
            colorClass="bg-white border-l-4 border-emerald-500 shadow-soft"
          />
          <StatsCard
            title="课程数量"
            value={activeCourses.length}
            icon={<GraduationCap className="text-dlut-blue" size={24} />}
            description={`已选 / 共 ${courses.length} 门`}
            colorClass="bg-white shadow-soft"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Input and List */}
          <div className="lg:col-span-2 space-y-6">
            <AddCourseForm 
                onAdd={handleAddCourse} 
                existingNames={courses.map(c => c.name)}
                existingSemesters={semesters}
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-soft border border-gray-100/50 relative z-20 transition-all hover:shadow-md">
                {/* Multi-select Filter */}
                <div className="relative" ref={filterRef}>
                    <button 
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:text-dlut-blue transition-all duration-200 text-sm font-semibold text-gray-700 shadow-sm"
                    >
                        <Filter size={15} />
                        <span>
                            {selectedSemesters.length === 0 
                                ? "全部学期" 
                                : `已选 ${selectedSemesters.length} 个学期`}
                        </span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFilterDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                             <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">筛选学期</div>
                             <div 
                                onClick={() => setSelectedSemesters([])}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm mb-1 transition-colors ${selectedSemesters.length === 0 ? 'bg-blue-50 text-dlut-blue font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                             >
                                <span>全部显示</span>
                                {selectedSemesters.length === 0 && <Check size={16} />}
                             </div>
                             <div className="h-px bg-gray-100 my-1"></div>
                             <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                 {semesters.map(sem => (
                                     <div 
                                        key={sem}
                                        onClick={() => toggleSemester(sem)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm mb-1 transition-colors ${selectedSemesters.includes(sem) ? 'bg-blue-50 text-dlut-blue font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                                     >
                                         <span className="truncate">{sem}</span>
                                         {selectedSemesters.includes(sem) && <Check size={16} />}
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-dlut-blue transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="搜索课程名称..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-dlut-blue w-full transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>
            </div>
            
            <CourseList 
                courses={filteredCourses} 
                onRemove={handleRemoveCourse} 
                onEdit={handleEditCourse}
                onToggle={handleToggleCourse}
                onToggleAll={handleToggleAll}
            />
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit pb-10">
            
            {/* Score Distribution Chart - MOVED TO TOP */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    成绩等级分布
                  </h3>
              </div>
              
              <div className="h-64 w-full relative">
                {stats.totalCredits > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={stats.scoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                        >
                        {stats.scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <RechartsTooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                            <tspan x="50%" dy="-0.6em" fontSize="28" fontWeight="800" fill="#005BAC" className="tracking-tighter">
                                {stats.weightedGpa.toFixed(3)}
                            </tspan>
                            <tspan x="50%" dy="1.6em" fontSize="12" fontWeight="500" fill="#94A3B8" className="uppercase tracking-widest">
                                GPA
                            </tspan>
                        </text>
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                        <PieChartIcon size={32} className="opacity-20" />
                        请勾选课程以查看分布
                    </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 justify-center px-2">
                  {stats.scoreDistribution.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium">
                          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="text-gray-600">{entry.name}</span>
                          <span className="text-gray-400 ml-0.5">({entry.value})</span>
                      </div>
                  ))}
              </div>
            </div>

            {/* Other Charts */}
            <AnalysisDashboard courses={activeCourses} />
            <TargetGpaCalculator currentGpa={stats.weightedGpa} currentCredits={stats.totalCredits} />
            <AiAdvisor courses={activeCourses} stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;