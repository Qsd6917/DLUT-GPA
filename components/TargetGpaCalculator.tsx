import React, { useState, useEffect } from 'react';
import { Calculator, Target, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface TargetGpaCalculatorProps {
  currentGpa: number;
  currentCredits: number;
}

export const TargetGpaCalculator: React.FC<TargetGpaCalculatorProps> = ({ currentGpa, currentCredits }) => {
  const { t } = useTranslation();
  const [targetGpa, setTargetGpa] = useState<string>('');
  const [remainingCredits, setRemainingCredits] = useState<string>('20');
  const [result, setResult] = useState<{ requiredGpa: number; requiredScore: number; status: 'possible' | 'impossible' | 'easy' } | null>(null);

  useEffect(() => {
    const target = parseFloat(targetGpa);
    const remaining = parseFloat(remainingCredits);

    if (isNaN(target) || isNaN(remaining) || remaining <= 0) {
      setResult(null);
      return;
    }

    // Formula: (Target * (CurrentCredits + Remaining) - (CurrentGPA * CurrentCredits)) / Remaining
    const totalCredits = currentCredits + remaining;
    const currentPoints = currentGpa * currentCredits;
    const targetPoints = target * totalCredits;
    
    const requiredPoints = targetPoints - currentPoints;
    const requiredGpa = requiredPoints / remaining;
    
    // Estimate score based on DLUT standard: GPA = (Score - 50) / 10  =>  Score = GPA * 10 + 50
    const requiredScore = requiredGpa * 10 + 50;

    let status: 'possible' | 'impossible' | 'easy' = 'possible';
    
    if (requiredScore > 100) status = 'impossible';
    else if (requiredScore <= currentGpa * 10 + 50) status = 'easy'; // Easier than current performance

    setResult({
      requiredGpa,
      requiredScore,
      status
    });
  }, [targetGpa, remainingCredits, currentGpa, currentCredits]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Target size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{t('target_calculator')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('set_target')}</label>
          <div className="relative">
             <input
                type="number"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                placeholder={(currentGpa + 0.1).toFixed(2)}
                step="0.01"
                min="0"
                max="5"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 font-semibold"
             />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                 <Target size={14} />
             </div>
          </div>
        </div>

        <div>
           <label className="block text-xs font-medium text-gray-500 mb-1">{t('remaining_credits')}</label>
           <input
              type="number"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(e.target.value)}
              placeholder="20"
              min="1"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 font-semibold"
           />
        </div>

        {/* Results Display */}
        <div className={`mt-6 p-4 rounded-xl border transition-all duration-300 ${
            !result ? 'bg-gray-50 border-gray-100 opacity-50' :
            result.status === 'impossible' ? 'bg-red-50 border-red-100' :
            result.status === 'easy' ? 'bg-emerald-50 border-emerald-100' :
            'bg-indigo-50 border-indigo-100'
        }`}>
           {!result ? (
               <div className="text-center text-xs text-gray-400 py-2">
                   {t('calc_input_hint')}
               </div>
           ) : (
               <>
                  <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                          result.status === 'impossible' ? 'text-red-600' : 
                          result.status === 'easy' ? 'text-emerald-600' : 'text-indigo-600'
                      }`}>
                          {result.status === 'impossible' ? t('target_impossible') : 
                           result.status === 'easy' ? t('target_easy') : t('target_challenge')}
                      </span>
                      {result.status === 'impossible' ? <AlertCircle size={16} className="text-red-500"/> : <Calculator size={16} className="text-indigo-500"/>}
                  </div>
                  
                  <div className="flex items-end gap-2 mb-1">
                      <span className="text-2xl font-extrabold text-gray-900">
                          {result.requiredGpa.toFixed(3)}
                      </span>
                      <span className="text-xs text-gray-500 mb-1.5 font-medium">{t('required_gpa')}</span>
                  </div>

                  <div className="w-full h-px bg-current opacity-10 my-2"></div>
                  
                  <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">{t('required_score')}:</span>
                      <span className={`font-bold font-mono ${
                          result.requiredScore > 100 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                          {result.requiredScore.toFixed(1)}
                      </span>
                  </div>
               </>
           )}
        </div>
      </div>
    </div>
  );
};