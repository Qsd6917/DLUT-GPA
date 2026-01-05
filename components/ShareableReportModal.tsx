import React, { useRef, useState } from 'react';
import { X, Download, Share2, Award, Star, BookOpen, Quote } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Course, GpaStats } from '../types';

interface ShareableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GpaStats;
  courses: Course[];
}

export const ShareableReportModal: React.FC<ShareableReportModalProps> = ({ isOpen, onClose, stats, courses }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const topCourses = [...courses]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const getTitle = (gpa: number) => {
    if (gpa >= 3.9) return "Academic Legend";
    if (gpa >= 3.7) return "Top Scholar";
    if (gpa >= 3.5) return "Excellent Achiever";
    if (gpa >= 3.0) return "Solid Performer";
    return "Rising Star";
  };
  
  const title = getTitle(stats.weightedGpa);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        scale: 2, // High resolution for mobile screens
        backgroundColor: null,
        logging: false,
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `DLUT-GPA-Report-${new Date().getFullYear()}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("生成图片失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Share2 size={18} className="text-indigo-600"/>
            生成成绩单海报
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex justify-center">
            {/* The Report Card - Designed to look like a mobile screen / Instagram story */}
            <div 
                ref={reportRef}
                className="w-full max-w-[320px] aspect-[9/16] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
            >
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                
                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 opacity-80">
                        <div className="flex items-center gap-2">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Dalian_University_of_Technology_logo.png/96px-Dalian_University_of_Technology_logo.png" 
                                alt="Logo" 
                                className="w-8 h-8 opacity-90 grayscale brightness-200"
                            />
                            <span className="text-xs font-bold tracking-widest uppercase">DLUT Academic</span>
                        </div>
                        <span className="text-xs font-mono">{new Date().getFullYear()}</span>
                    </div>

                    {/* Main Stats */}
                    <div className="mb-8 text-center">
                        <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium mb-4 text-purple-200">
                            {title}
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-200 drop-shadow-sm">
                            {stats.weightedGpa.toFixed(3)}
                        </h1>
                        <p className="text-sm font-medium text-purple-200 uppercase tracking-widest mt-1 opacity-80">Weighted GPA</p>
                    </div>

                    {/* Grid Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                            <div className="text-2xl font-bold">{stats.totalCredits}</div>
                            <div className="text-[10px] text-gray-300 uppercase mt-1">Total Credits</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                            <div className="text-2xl font-bold">{stats.weightedAverageScore.toFixed(1)}</div>
                            <div className="text-[10px] text-gray-300 uppercase mt-1">Avg Score</div>
                        </div>
                    </div>

                    {/* Top Courses List */}
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Star size={12} />
                            Highlight Courses
                        </h4>
                        <div className="space-y-3">
                            {topCourses.map((course, i) => (
                                <div key={i} className="flex items-center justify-between text-sm border-b border-white/10 pb-2 last:border-0">
                                    <span className="truncate font-medium text-gray-100 pr-2">{course.name}</span>
                                    <span className="font-bold text-emerald-400 font-mono">{course.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                         <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                             <Quote size={10} />
                             <span>Stay hungry, stay foolish.</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
             <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
                {isGenerating ? (
                    <>生成中...</>
                ) : (
                    <>
                        <Download size={18} />
                        保存图片到相册
                    </>
                )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
                图片生成后可长按保存或分享
            </p>
        </div>
      </div>
    </div>
  );
};