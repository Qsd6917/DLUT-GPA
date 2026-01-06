import React, { useRef, useState } from 'react';
import { X, Download, Share2, Star, Quote, Palette, ToggleLeft, ToggleRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Course, GpaStats } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ShareableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GpaStats;
  courses: Course[];
}

type ThemeType = 'classic' | 'cyberpunk' | 'zen' | 'pixel';

export const ShareableReportModal: React.FC<ShareableReportModalProps> = ({ isOpen, onClose, stats, courses }) => {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('classic');
  const [showRanking, setShowRanking] = useState(true);

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
      // Small delay to ensure rendering and font loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(reportRef.current, {
        useCORS: true,
        scale: 2, // High resolution for mobile screens
        backgroundColor: null,
        logging: false,
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `DLUT-GPA-Report-${currentTheme}-${new Date().toISOString().slice(0,10)}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("生成图片失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  // Theme Styles Configuration
  const getThemeStyles = (theme: ThemeType) => {
      switch(theme) {
          case 'cyberpunk':
              return {
                  container: "bg-zinc-950 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-cyber relative overflow-hidden",
                  bgEffects: (
                      <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-0"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-cyan-500 to-yellow-500"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-pink-500 opacity-50"></div>
                      </>
                  ),
                  textColor: "text-cyan-400",
                  accentColor: "text-pink-500",
                  headerOpacity: "opacity-100",
                  logoFilter: "brightness-100 grayscale contrast-125 sepia hue-rotate-180 saturate-200", // Glitchy look
                  statsBox: "bg-zinc-900/80 border border-cyan-500/30",
                  rankingBadge: "bg-yellow-400 text-black font-bold border-2 border-pink-500 transform -skew-x-12",
                  divider: "border-pink-500/30 border-dashed",
                  fontFamily: "font-cyber",
                  quoteColor: "text-zinc-500"
              };
          case 'zen':
              return {
                  container: "bg-[#F7F5F0] text-zinc-800 font-zen relative overflow-hidden border-8 border-double border-zinc-200",
                  bgEffects: (
                      <>
                         <div className="absolute top-[-10%] right-[-20%] w-[100%] h-[50%] rounded-[100%] bg-radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%) pointer-events-none blur-3xl"></div>
                         <div className="absolute bottom-10 left-[-10%] w-[200px] h-[200px] bg-zinc-200/50 rounded-full blur-2xl opacity-40"></div>
                         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
                      </>
                  ),
                  textColor: "text-zinc-800",
                  accentColor: "text-red-800",
                  headerOpacity: "opacity-70",
                  logoFilter: "grayscale opacity-80",
                  statsBox: "bg-white/60 border border-zinc-200 shadow-sm",
                  rankingBadge: "border border-zinc-800 text-zinc-800 px-4 py-1 tracking-[0.2em] uppercase text-[10px]",
                  divider: "border-zinc-300",
                  fontFamily: "font-zen",
                  quoteColor: "text-zinc-400 italic"
              };
          case 'pixel':
              return {
                  container: "bg-indigo-950 font-pixel text-white relative overflow-hidden border-4 border-white",
                  bgEffects: (
                      <>
                        <div className="absolute top-4 left-4 w-4 h-4 bg-yellow-400 shadow-[20px_0_0_#FACC15,40px_0_0_#FACC15]"></div>
                        <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-400 shadow-[-20px_0_0_#4ADE80,-40px_0_0_#4ADE80]"></div>
                        {/* Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>
                      </>
                  ),
                  textColor: "text-green-400",
                  accentColor: "text-yellow-400",
                  headerOpacity: "opacity-100",
                  logoFilter: "brightness-150 contrast-125 pixelate", 
                  statsBox: "bg-indigo-900 border-2 border-white/20 shadow-[4px_4px_0_rgba(0,0,0,0.5)]",
                  rankingBadge: "bg-red-500 text-white border-2 border-white shadow-[2px_2px_0_black]",
                  divider: "border-white/20 border-dotted",
                  fontFamily: "font-pixel",
                  quoteColor: "text-indigo-300"
              };
          default: // Classic
              return {
                  container: "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white",
                  bgEffects: (
                      <>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                      </>
                  ),
                  textColor: "text-white",
                  accentColor: "text-emerald-400",
                  headerOpacity: "opacity-80",
                  logoFilter: "opacity-90 grayscale brightness-200",
                  statsBox: "bg-white/5 backdrop-blur-sm border border-white/10",
                  rankingBadge: "bg-white/10 backdrop-blur-md border border-white/20 text-purple-200",
                  divider: "border-white/10",
                  fontFamily: "font-sans",
                  quoteColor: "text-gray-400"
              };
      }
  };

  const styles = getThemeStyles(currentTheme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Share2 size={18} className="text-indigo-600"/>
            {t('share_title')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col">
            {/* Theme Controls */}
            <div className="p-4 bg-white border-b border-gray-100 space-y-4">
                <div className="flex flex-col gap-2">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                         <Palette size={12} />
                         {t('theme_select')}
                     </span>
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {(['classic', 'cyberpunk', 'zen', 'pixel'] as ThemeType[]).map(theme => (
                             <button
                                key={theme}
                                onClick={() => setCurrentTheme(theme)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all whitespace-nowrap ${
                                    currentTheme === theme 
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                        : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                             >
                                 {t(`theme_${theme}` as any)}
                             </button>
                         ))}
                     </div>
                </div>
                
                <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-700">{t('show_ranking')}</span>
                     <button 
                        onClick={() => setShowRanking(!showRanking)}
                        className={`text-2xl transition-colors ${showRanking ? 'text-indigo-600' : 'text-gray-300'}`}
                     >
                         {showRanking ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                     </button>
                </div>
            </div>

            {/* The Report Card Preview Area */}
            <div className="p-6 flex justify-center bg-gray-100">
                <div 
                    ref={reportRef}
                    className={`w-full max-w-[320px] aspect-[9/16] rounded-2xl shadow-2xl relative flex flex-col ${styles.container}`}
                >
                    {/* Background Effects */}
                    {styles.bgEffects}
                    
                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col p-6">
                        {/* Header */}
                        <div className={`flex items-center justify-between mb-8 ${styles.headerOpacity}`}>
                            <div className="flex items-center gap-2">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Dalian_University_of_Technology_logo.png/96px-Dalian_University_of_Technology_logo.png" 
                                    alt="Logo" 
                                    className={`w-8 h-8 ${styles.logoFilter}`}
                                />
                                <span className={`text-xs font-bold tracking-widest uppercase ${styles.textColor}`}>DLUT Academic</span>
                            </div>
                            <span className={`text-xs font-mono ${styles.textColor}`}>{new Date().getFullYear()}</span>
                        </div>

                        {/* Main Stats */}
                        <div className="mb-8 text-center">
                            {showRanking && (
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${styles.rankingBadge}`}>
                                    {title}
                                </div>
                            )}
                            <h1 className={`text-6xl font-black tracking-tighter mb-1 ${styles.textColor}`}>
                                {stats.weightedGpa.toFixed(3)}
                            </h1>
                            <p className={`text-sm font-medium uppercase tracking-widest opacity-80 ${styles.textColor}`}>Weighted GPA</p>
                        </div>

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className={`rounded-xl p-4 text-center ${styles.statsBox}`}>
                                <div className={`text-2xl font-bold ${styles.textColor}`}>{stats.totalCredits}</div>
                                <div className={`text-[10px] uppercase mt-1 opacity-70 ${styles.textColor}`}>{t('total_credits')}</div>
                            </div>
                            <div className={`rounded-xl p-4 text-center ${styles.statsBox}`}>
                                <div className={`text-2xl font-bold ${styles.textColor}`}>{stats.weightedAverageScore.toFixed(1)}</div>
                                <div className={`text-[10px] uppercase mt-1 opacity-70 ${styles.textColor}`}>{t('avg_score_short')}</div>
                            </div>
                        </div>

                        {/* Top Courses List */}
                        <div className="flex-1">
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${styles.textColor}`}>
                                <Star size={12} />
                                {t('highlight_courses')}
                            </h4>
                            <div className="space-y-3">
                                {topCourses.map((course, i) => (
                                    <div key={i} className={`flex items-center justify-between text-sm pb-2 border-b last:border-0 ${styles.divider}`}>
                                        <span className={`truncate font-medium pr-2 ${styles.textColor}`}>{course.name}</span>
                                        <span className={`font-bold font-mono ${styles.accentColor}`}>{course.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`mt-6 pt-4 border-t text-center ${styles.divider}`}>
                             <div className={`flex items-center justify-center gap-2 text-[10px] ${styles.quoteColor}`}>
                                 <Quote size={10} />
                                 <span>Stay hungry, stay foolish.</span>
                             </div>
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
                    <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         {t('generating')}
                    </>
                ) : (
                    <>
                        <Download size={18} />
                        {t('save_image')}
                    </>
                )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
                {t('share_hint')}
            </p>
        </div>
      </div>
    </div>
  );
};