import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileJson, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Course } from '../types';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImport: (data: Course[], mode: 'replace' | 'merge') => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose, courses, onImport }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [dragActive, setDragActive] = useState(false);
  const [importData, setImportData] = useState<Course[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(courses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dlut-gpa-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
            // Basic validation
            const valid = json.every((c: any) => c.name && typeof c.score === 'number');
             if (valid) {
                setImportData(json);
                setImportError(null);
             } else {
                setImportError("文件格式错误：缺少必要字段（课程名或分数）。");
                setImportData(null);
             }
        } else {
            setImportError("文件格式错误：请确保是有效的课程数据备份文件（数组格式）。");
            setImportData(null);
        }
      } catch (err) {
        setImportError("JSON 解析失败。文件可能已损坏。");
        setImportData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (importData) {
        onImport(importData, importMode);
        onClose();
        setImportData(null);
        setImportMode('replace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">数据管理</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'export' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <div className="flex items-center justify-center gap-2">
                    <Download size={16} />
                    备份导出
                </div>
                {activeTab === 'export' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'import' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                 <div className="flex items-center justify-center gap-2">
                    <Upload size={16} />
                    恢复导入
                </div>
                {activeTab === 'import' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            {activeTab === 'export' ? (
                <div className="space-y-6 text-center">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <FileJson className="mx-auto text-indigo-500 mb-3" size={48} />
                        <h4 className="text-lg font-semibold text-indigo-900">当前数据概览</h4>
                        <p className="text-indigo-600 text-sm mt-1">
                            包含 {courses.length} 门课程记录
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 px-4">
                        将您的课程数据导出为 JSON 文件。您可以将此文件保存在本地，以防止数据丢失，或用于在其他设备上恢复数据。
                    </p>
                    <button 
                        onClick={handleExport}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        立即导出备份
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {!importData ? (
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])} 
                            />
                            <Upload className={`mx-auto mb-3 transition-colors ${dragActive ? 'text-indigo-600' : 'text-gray-400'}`} size={40} />
                            <p className="text-sm font-medium text-gray-700">
                                点击上传或拖拽 JSON 文件到此处
                            </p>
                            <p className="text-xs text-gray-400 mt-2">支持 .json 格式的备份文件</p>
                            {importError && (
                                <div className="mt-4 p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center justify-center gap-1">
                                    <AlertCircle size={12} />
                                    {importError}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-200">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h5 className="font-semibold text-emerald-900 text-sm">解析成功</h5>
                                    <p className="text-emerald-700 text-xs mt-1">
                                        检测到 {importData.length} 门课程数据。
                                    </p>
                                </div>
                                <button onClick={() => setImportData(null)} className="ml-auto text-emerald-600 text-xs underline">
                                    重新选择
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">导入模式</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setImportMode('replace')}
                                        className={`p-3 rounded-xl border text-left text-sm transition-all ${importMode === 'replace' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-semibold text-gray-900 mb-1">覆盖现有数据</div>
                                        <div className="text-xs text-gray-500">清空当前列表，完全使用导入的数据。</div>
                                    </button>
                                    <button
                                        onClick={() => setImportMode('merge')}
                                        className={`p-3 rounded-xl border text-left text-sm transition-all ${importMode === 'merge' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-semibold text-gray-900 mb-1">合并数据</div>
                                        <div className="text-xs text-gray-500">保留现有数据，添加导入的新课程。</div>
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleConfirmImport}
                                className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                确认导入
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};