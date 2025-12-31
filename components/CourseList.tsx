import React, { useState, useMemo } from 'react';
import { Trash2, BookOpen, ArrowUpDown, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { Course } from '../types';

interface CourseListProps {
  courses: Course[];
  onRemove: (id: string) => void;
  onEdit: (course: Course) => void;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}

type SortKey = keyof Course;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onRemove, onEdit, onToggle, onToggleAll }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const allChecked = courses.length > 0 && courses.every(c => c.isActive);
  const someChecked = courses.some(c => c.isActive);
  const isIndeterminate = someChecked && !allChecked;

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCourses = useMemo(() => {
    if (!sortConfig) return courses;
    
    return [...courses].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [courses, sortConfig]);

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-indigo-600" />
      : <ArrowDown size={14} className="ml-1 text-indigo-600" />;
  };

  const HeaderCell = ({ label, sortKey, align = 'left', width }: { label: string, sortKey: SortKey, align?: string, width?: string }) => (
      <th 
        className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none text-${align} ${width}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''}`}>
            {label}
            {renderSortIcon(sortKey)}
        </div>
      </th>
  );

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-soft">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <BookOpen className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-medium mb-1">暂无课程数据</h3>
        <p className="text-sm text-gray-500">请使用上方表单添加课程或导入备份。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 w-12 text-center">
                <div className="flex items-center justify-center">
                    <input 
                        type="checkbox"
                        checked={allChecked}
                        ref={input => {
                            if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => onToggleAll(e.target.checked)}
                        className="w-4 h-4 text-dlut-blue bg-white border-gray-300 rounded focus:ring-dlut-blue/20 cursor-pointer transition-all"
                    />
                </div>
              </th>
              {/* Added w-24 to ensure semantic column doesn't wrap */}
              <HeaderCell label="学期" sortKey="semester" width="w-24" />
              <HeaderCell label="课程名称" sortKey="name" />
              <HeaderCell label="学分" sortKey="credits" />
              <HeaderCell label="分数" sortKey="score" />
              <HeaderCell label="GPA" sortKey="gpa" />
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedCourses.map((course) => (
              <tr 
                key={course.id} 
                className={`group hover:bg-blue-50/30 transition-colors duration-150 ${!course.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}
              >
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            checked={course.isActive}
                            onChange={() => onToggle(course.id)}
                            className="w-4 h-4 text-dlut-blue bg-white border-gray-300 rounded focus:ring-dlut-blue/20 cursor-pointer transition-all"
                        />
                    </div>
                </td>
                {/* Added whitespace-nowrap and updated badge styling */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 min-w-[3.5rem] shadow-sm tracking-wide">
                        {course.semester}
                    </span>
                </td>
                <td className="px-6 py-4">
                     <span className={`font-semibold text-sm tracking-tight ${course.isActive ? 'text-gray-800' : 'text-gray-500'}`}>{course.name}</span>
                </td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold tabular-nums border border-indigo-100">
                        {course.credits}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`text-sm font-bold tabular-nums ${course.score >= 90 ? 'text-emerald-600' : course.score < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                        {course.score}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-800 tabular-nums bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {course.gpa.toFixed(2)}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(course)}
                        className="text-gray-400 hover:text-dlut-blue transition-colors p-2 rounded-lg hover:bg-blue-50"
                        title="编辑课程"
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        onClick={() => onRemove(course.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="删除课程"
                    >
                        <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};