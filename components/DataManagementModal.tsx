import React, { useState, useRef, useMemo, useEffect } from 'react';
import { X, Download, Upload, FileJson, AlertCircle, CheckCircle2, RefreshCw, FileSpreadsheet, ChevronDown, AlertTriangle, ArrowRight, XCircle, Image as ImageIcon, Loader2, Sparkles, Code, ClipboardCopy, QrCode, Scan, FileText, Settings, Save, Trash2 } from 'lucide-react';
import { Course } from '../types';
import { parseTranscriptFromImage, parseTranscriptFromText, parseTranscriptFromPdf } from '../services/geminiService';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import LZString from 'lz-string';
import { useTranslation } from '../contexts/LanguageContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImport: (data: Course[], mode: 'replace' | 'merge') => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose, courses, onImport }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'sync'>('export');
  const [dragActive, setDragActive] = useState(false);
  const [importData, setImportData] = useState<Course[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  
  // QR Sync State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Conflict Resolution State
  const [showConflictUI, setShowConflictUI] = useState(false);
  const [conflictStats, setConflictStats] = useState({ duplicates: 0, new: 0 });
  
  // Export State
  const [exportSemester, setExportSemester] = useState<string>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Get unique semesters for export dropdown
  const semesters = useMemo(() => {
    const s = new Set(courses.map(c => c.semester));
    return Array.from(s).sort();
  }, [courses]);

  // Calculate stats for the export preview
  const exportPreviewStats = useMemo(() => {
    const targetCourses = exportSemester === 'all' 
      ? courses 
      : courses.filter(c => c.semester === exportSemester);
    return {
      count: targetCourses.length,
      credits: targetCourses.reduce((sum, c) => sum + c.credits, 0)
    };
  }, [courses, exportSemester]);

  useEffect(() => {
      // Generate QR Code when switching to Sync tab
      if (activeTab === 'sync' && courses.length > 0) {
          generateQRCode();
      }
      // Stop scanner when switching away
      if (activeTab !== 'sync' && isScanning) {
          stopScanner();
      }
  }, [activeTab, courses]);

  // Cleanup scanner on close
  useEffect(() => {
      if (!isOpen) {
          stopScanner();
      }
  }, [isOpen]);

  const generateQRCode = async () => {
      try {
          // Serialize and Compress
          const json = JSON.stringify(courses);
          const compressed = LZString.compressToEncodedURIComponent(json);
          
          if (compressed.length > 2500) {
              setImportError(t('qr_too_large'));
              setQrCodeDataUrl(null);
              return;
          }

          const url = await QRCode.toDataURL(compressed, { 
              errorCorrectionLevel: 'L',
              width: 300,
              margin: 2
          });
          setQrCodeDataUrl(url);
          setImportError(null);
      } catch (e) {
          console.error("QR Generation failed", e);
          setImportError("QR generation failed");
      }
  };

  const startScanner = async () => {
      setIsScanning(true);
      setImportError(null);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.setAttribute("playsinline", "true");
              videoRef.current.play();
              requestAnimationFrame(tick);
          }
      } catch (err) {
          setImportError("无法访问摄像头，请检查权限。");
          setIsScanning(false);
      }
  };

  const stopScanner = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
      }
      setIsScanning(false);
  };

  const tick = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
              });

              if (code) {
                  try {
                      // Attempt to decompress
                      let jsonStr = LZString.decompressFromEncodedURIComponent(code.data);
                      if (!jsonStr) jsonStr = code.data; // Maybe it wasn't compressed?

                      const parsed = JSON.parse(jsonStr);
                      if (Array.isArray(parsed)) {
                          stopScanner();
                          // Normalize
                          const normalized = parsed.map((c: any) => ({
                             ...c,
                             score: Number(c.score),
                             credits: Number(c.credits || 0),
                             type: c.type || '必修',
                             isCore: c.isCore || false
                          }));
                          setImportData(normalized);
                          return;
                      }
                  } catch (e) {
                      // Not valid JSON or bad data, keep scanning
                  }
              }
          }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
  };

  if (!isOpen) return null;

  const resetImportState = () => {
    setImportData(null);
    setImportMode('replace');
    setImportError(null);
    setShowConflictUI(false);
    setConflictStats({ duplicates: 0, new: 0 });
    setIsAnalyzing(false);
    setPasteContent('');
    stopScanner();
  };

  const handleClose = () => {
    resetImportState();
    onClose();
  };

  const handleExportJSON = () => {
    const coursesToExport = exportSemester === 'all'
      ? courses
      : courses.filter(c => c.semester === exportSemester);

    const dataStr = JSON.stringify(coursesToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const semesterSuffix = exportSemester === 'all' ? 'all' : exportSemester.replace(/[^a-zA-Z0-9]/g, '-');
    link.download = `dlut-gpa-backup-${semesterSuffix}-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const coursesToExport = exportSemester === 'all'
      ? courses
      : courses.filter(c => c.semester === exportSemester);

    // Header
    const headers = ['学期', '课程名称', '学分', '成绩', 'GPA', '属性'];
    
    // Rows
    const rows = coursesToExport.map(c => [
        `"\t${c.semester}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        c.credits,
        c.score,
        c.gpa,
        c.type || '必修'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    // Add BOM for Excel Chinese compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const semesterSuffix = exportSemester === 'all' ? 'all' : exportSemester.replace(/[^a-zA-Z0-9]/g, '-');
    link.download = `dlut-gpa-export-${semesterSuffix}-${dateStr}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): Course[] | null => {
    const lines = content.split(/\r\n|\n/).filter(line => line.trim());
    if (lines.length < 2) return null;

    // Detect headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    
    // Header mapping heuristics
    const getIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));
    
    const nameIdx = getIndex(['name', '课程', '名称', 'course']);
    const creditIdx = getIndex(['credit', '学分']);
    const scoreIdx = getIndex(['score', '成绩', '分数', 'grade']);
    const semesterIdx = getIndex(['semester', '学期']);
    const typeIdx = getIndex(['type', '属性', '性质']);

    if (nameIdx === -1 || scoreIdx === -1) {
        throw new Error("CSV 必须包含包含“课程名称”和“成绩”的表头");
    }

    const result: Course[] = [];
    
    // Parse rows
    for (let i = 1; i < lines.length; i++) {
        // Simple CSV split (handling simple commas, not complex quoted CSVs for now)
        const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, '').trim());
        if (row.length < headers.length) continue;

        const name = row[nameIdx];
        const scoreStr = row[scoreIdx];
        const creditStr = creditIdx !== -1 ? row[creditIdx] : '0';
        const semester = semesterIdx !== -1 ? row[semesterIdx] : '未知学期';
        const typeStr = typeIdx !== -1 ? row[typeIdx] : '必修';
        
        // Normalize type
        let type: any = '必修';
        if (typeStr.includes('选') && !typeStr.includes('必')) {
             if (typeStr.includes('任')) type = '任选';
             else type = '选修';
        }

        if (name && scoreStr) {
            const score = parseFloat(scoreStr);
            const credits = parseFloat(creditStr);
            
            if (!isNaN(score)) {
                result.push({
                    id: '', // Will be generated by importer
                    name,
                    score,
                    credits: isNaN(credits) ? 0 : credits,
                    semester: semester || '未知学期',
                    type: type,
                    gpa: 0, // Will be calculated
                    isActive: true,
                    isCore: false
                });
            }
        }
    }
    return result;
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsedData: any[] = [];
        
        if (file.name.endsWith('.csv')) {
             const result = parseCSV(content);
             if (!result) throw new Error("CSV 解析失败或为空");
             parsedData = result;
        } else {
             // Assume JSON
             parsedData = JSON.parse(content);
        }

        if (Array.isArray(parsedData)) {
            // Basic validation
            const valid = parsedData.every((c: any) => c.name && (typeof c.score === 'number' || !isNaN(parseFloat(c.score))));
             if (valid) {
                // Normalize data structure
                const normalized = parsedData.map(c => ({
                    ...c,
                    score: Number(c.score),
                    credits: Number(c.credits || 0),
                    type: c.type || '必修',
                    isCore: c.isCore || false
                }));
                setImportData(normalized);
                setImportError(null);
                setShowConflictUI(false); // Reset UI on new file
             } else {
                setImportError("文件格式错误：缺少必要字段（课程名或分数）。");
                setImportData(null);
             }
        } else {
            setImportError("文件格式错误：请确保是有效的课程数据文件（数组格式）。");
            setImportData(null);
        }
      } catch (err: any) {
        setImportError(err.message || "文件解析失败。文件可能已损坏。");
        setImportData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleAiFileUpload = (file: File) => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          setImportError("请上传有效的图片或 PDF 文件");
          return;
      }

      setIsAnalyzing(true);
      setImportError(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const base64Data = (e.target?.result as string).split(',')[1];
              let courses: Course[] = [];
              
              if (file.type === 'application/pdf') {
                   courses = await parseTranscriptFromPdf(base64Data);
              } else {
                   courses = await parseTranscriptFromImage(base64Data);
              }
              
              if (courses.length === 0) {
                  throw new Error("未能识别出有效的课程数据，请确保文件清晰且包含成绩表格。");
              }

              setImportData(courses);
              setShowConflictUI(false);
          } catch (err: any) {
              setImportError(err.message || "AI 识别失败，请重试。");
              setImportData(null);
          } finally {
              setIsAnalyzing(false);
          }
      };
      reader.readAsDataURL(file);
  };
  
  const handleTextParse = async () => {
      if (!pasteContent.trim()) {
          setImportError("请先粘贴内容");
          return;
      }
      
      setIsAnalyzing(true);
      setImportError(null);
      
      try {
          const courses = await parseTranscriptFromText(pasteContent);
          if (courses.length === 0) {
              throw new Error("未能从粘贴内容中识别出课程信息。请尝试复制更多内容或直接复制 HTML 源码。");
          }
          setImportData(courses);
          setShowConflictUI(false);
      } catch (err: any) {
          setImportError(err.message || "解析失败，请重试。");
          setImportData(null);
      } finally {
          setIsAnalyzing(false);
      }
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
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            handleAiFileUpload(file);
        } else {
            parseFile(file);
        }
    }
  };

  // Pre-check for conflicts
  const handlePreImportCheck = () => {
      if (!importData) return;

      if (importMode === 'replace') {
          // Replace mode doesn't have conflicts, it just nukes everything
          onImport(importData, 'replace');
          handleClose();
          return;
      }

      // Merge Mode: Check duplicates
      const duplicates = importData.filter(newItem => 
          courses.some(existingItem => 
              existingItem.name === newItem.name && 
              existingItem.semester === newItem.semester
          )
      );

      if (duplicates.length > 0) {
          setConflictStats({
              duplicates: duplicates.length,
              new: importData.length - duplicates.length
          });
          setShowConflictUI(true);
      } else {
          // No duplicates, just merge
          onImport(importData, 'merge');
          handleClose();
      }
  };

  const resolveConflicts = (strategy: 'overwrite' | 'skip') => {
      if (!importData) return;

      let finalCourses = [...courses];
      
      // Separate imports into duplicates and purely new items
      const newItems: Course[] = [];
      const duplicateMap = new Map<string, Course>();

      importData.forEach(item => {
          const key = `${item.semester}-${item.name}`;
          const isDup = courses.some(c => c.name === item.name && c.semester === item.semester);
          if (isDup) {
              duplicateMap.set(key, item);
          } else {
              // Ensure strictly new items have new IDs
              newItems.push({
                  ...item, 
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
              });
          }
      });

      if (strategy === 'overwrite') {
          // Update existing courses with data from imports
          finalCourses = finalCourses.map(existing => {
              const key = `${existing.semester}-${existing.name}`;
              if (duplicateMap.has(key)) {
                  const update = duplicateMap.get(key)!;
                  return {
                      ...existing,
                      score: update.score,
                      credits: update.credits,
                      type: update.type, // Update Type
                      // We keep the existing ID and active status
                      isActive: existing.isActive,
                      isCore: update.isCore
                  };
              }
              return existing;
          });
      }
      // If 'skip', we just leave finalCourses as is (ignoring duplicateMap)

      // Add the strictly new items
      const combined = [...finalCourses, ...newItems];

      // Send as 'replace' because we have manually constructed the full state
      onImport(combined, 'replace');
      handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{t('data_mgmt')}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs - Only show if not in conflict UI */}
        {!showConflictUI && (
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('export')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'export' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Download size={16} />
                        备份
                    </div>
                    {activeTab === 'export' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('import')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'import' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Upload size={16} />
                        导入
                    </div>
                    {activeTab === 'import' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                </button>
                 <button 
                    onClick={() => setActiveTab('sync')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'sync' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <QrCode size={16} />
                        {t('qr_sync')}
                    </div>
                    {activeTab === 'sync' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
                </button>
            </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {activeTab === 'sync' && !showConflictUI ? (
                 <div className="space-y-6">
                    {!isScanning ? (
                        <>
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                {qrCodeDataUrl ? (
                                    <>
                                        <div className="text-sm font-bold text-gray-800 mb-4">{t('qr_send')}</div>
                                        <img src={qrCodeDataUrl} alt="Sync QR Code" className="w-64 h-64 object-contain rounded-lg border border-gray-100 shadow-sm" />
                                        <p className="text-xs text-gray-500 mt-4 max-w-xs">{t('qr_desc')}</p>
                                    </>
                                ) : (
                                    <div className="text-gray-400 py-10">
                                         {t('qr_too_large')}
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-xs text-gray-500 font-medium">OR</span>
                                </div>
                            </div>

                            <button 
                                onClick={startScanner}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Scan size={20} />
                                {t('qr_scan')}
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden mb-4 border-2 border-indigo-500">
                                <video ref={videoRef} className="w-full h-full object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-64 h-64 border-2 border-white/50 rounded-xl relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 w-full text-center text-white text-sm font-medium drop-shadow-md">
                                    {t('qr_scan_instruction')}
                                </div>
                            </div>
                            <button 
                                onClick={stopScanner}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-sm"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    )}
                 </div>
            ) : activeTab === 'export' && !showConflictUI ? (
                <div className="space-y-6">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                        <FileJson className="mx-auto text-indigo-500 mb-3" size={48} />
                        <h4 className="text-lg font-semibold text-indigo-900">当前导出预览</h4>
                        <div className="flex justify-center gap-4 mt-2">
                            <span className="text-indigo-700 text-sm font-medium px-3 py-1 bg-indigo-100/50 rounded-full">
                                {exportPreviewStats.count} 门课程
                            </span>
                            <span className="text-indigo-700 text-sm font-medium px-3 py-1 bg-indigo-100/50 rounded-full">
                                {exportPreviewStats.credits} 学分
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">选择导出范围</label>
                        <div className="relative">
                            <select 
                                value={exportSemester}
                                onChange={(e) => setExportSemester(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer font-medium"
                            >
                                <option value="all">所有学期 (完整备份)</option>
                                <option disabled>──────────</option>
                                {semesters.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 px-1">
                        您可以导出 JSON 备份（用于恢复数据）或 CSV 表格（用于 Excel 分析）。
                    </p>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleExportJSON}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FileJson size={18} />
                            导出 JSON
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FileSpreadsheet size={18} />
                            导出 CSV
                        </button>
                    </div>
                </div>
            ) : showConflictUI ? (
                // CONFLICT RESOLUTION UI
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-3 text-amber-800 mb-2">
                            <AlertTriangle size={24} className="text-amber-500" />
                            <h4 className="font-bold text-lg">发现重复课程</h4>
                        </div>
                        <p className="text-sm text-amber-700 mb-4">
                            在您的导入文件中，检测到部分课程与现有记录（学期+课程名）重复。
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/60 p-3 rounded-xl flex-1 text-center border border-amber-200">
                                <div className="text-xl font-bold text-amber-900">{conflictStats.duplicates}</div>
                                <div className="text-xs text-amber-700">重复课程</div>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl flex-1 text-center border border-amber-200">
                                <div className="text-xl font-bold text-emerald-700">{conflictStats.new}</div>
                                <div className="text-xs text-emerald-600">新增课程</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">请选择如何处理重复项：</label>
                        
                        <button
                            onClick={() => resolveConflicts('overwrite')}
                            className="w-full p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-start gap-3 group"
                        >
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <RefreshCw size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 group-hover:text-indigo-900">更新并覆盖</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    使用导入文件中的分数和学分覆盖现有记录。新增课程将被添加。
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => resolveConflicts('skip')}
                            className="w-full p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-start gap-3 group"
                        >
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-indigo-200 group-hover:text-indigo-600 transition-colors">
                                <XCircle size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 group-hover:text-indigo-900">保留现有 (跳过)</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    忽略重复的课程，保留您现有的成绩记录。仅添加完全新增的课程。
                                </div>
                            </div>
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowConflictUI(false)}
                        className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                        返回上一步
                    </button>
                </div>
            ) : (
                // IMPORT UI
                <div className="space-y-6">
                    {!importData ? (
                        <>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {/* Image/PDF Import (Left) */}
                            <div 
                                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative overflow-hidden group flex flex-col items-center justify-center ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''} border-purple-200 hover:border-purple-400 hover:bg-purple-50`}
                                onClick={() => !isAnalyzing && aiFileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={aiFileInputRef} 
                                    className="hidden" 
                                    accept="image/*,application/pdf" 
                                    onChange={(e) => e.target.files?.[0] && handleAiFileUpload(e.target.files[0])} 
                                />
                                <div className="bg-purple-100 p-2 rounded-full mb-2 text-purple-600 group-hover:scale-110 transition-transform flex items-center gap-1">
                                    <ImageIcon size={18} />
                                    <span className="text-purple-300">/</span>
                                    <FileText size={18} />
                                </div>
                                <h4 className="text-sm font-bold text-purple-900">成绩单文件</h4>
                                <p className="text-[10px] text-purple-600 mt-1">支持 图片/PDF 识别</p>
                            </div>

                            {/* Standard File Import (Right) */}
                            <div 
                                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''} ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".json,.csv" 
                                    onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])} 
                                />
                                <div className="bg-gray-100 p-2 rounded-full mb-2 text-gray-600 group-hover:text-indigo-600 transition-colors">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-gray-800">导入备份/CSV</h4>
                                <p className="text-[10px] text-gray-500 mt-1">支持 JSON/CSV</p>
                            </div>
                        </div>

                        {/* Paste Import (Bottom / Full Width) */}
                        <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                            <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-sm">
                                <ClipboardCopy size={16} className="text-blue-600" />
                                智能网页/文本导入
                            </div>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                打开教务系统成绩页面，按 <kbd className="bg-gray-200 px-1 rounded font-mono text-gray-700">Ctrl+A</kbd> 全选并复制，粘贴到下方。AI 将自动提取课程。
                            </p>
                            <textarea
                                value={pasteContent}
                                onChange={(e) => setPasteContent(e.target.value)}
                                placeholder="在此处粘贴教务系统网页内容或 HTML 源码..."
                                className="w-full h-24 p-3 rounded-xl border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none bg-white font-mono"
                                disabled={isAnalyzing}
                            />
                            <button
                                onClick={handleTextParse}
                                disabled={isAnalyzing || !pasteContent.trim()}
                                className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} />
                                        正在 AI 分析中...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} />
                                        开始智能识别
                                    </>
                                )}
                            </button>
                        </div>
                         
                         {importError && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center justify-center gap-2 border border-red-100">
                                <AlertCircle size={14} className="shrink-0" />
                                {importError}
                            </div>
                        )}
                        </>
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
                                        <div className="text-xs text-gray-500">清空列表，使用新数据。</div>
                                    </button>
                                    <button
                                        onClick={() => setImportMode('merge')}
                                        className={`p-3 rounded-xl border text-left text-sm transition-all ${importMode === 'merge' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-semibold text-gray-900 mb-1">合并数据</div>
                                        <div className="text-xs text-gray-500">保留现有，添加新课程。</div>
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handlePreImportCheck}
                                className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                {importMode === 'merge' ? (
                                    <>
                                        下一步
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={18} />
                                        确认导入
                                    </>
                                )}
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