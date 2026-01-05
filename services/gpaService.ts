import { CalculationMethod, Course, GpaStats, SemesterTrend } from '../types';

export const calculateCourseGpa = (score: number, method: CalculationMethod): number => {
  if (score < 60) return 0;

  switch (method) {
    case CalculationMethod.LINEAR:
      // 5.0: Score / 20
      return Number((score / 20).toFixed(2));
    
    case CalculationMethod.SUBTRACTIVE:
      // DLUT Standard 5.0: (Score - 50) / 10
      return Number(((score - 50) / 10).toFixed(2));

    case CalculationMethod.WES:
      // WES 5.0 Approximation
      if (score >= 90) return 5.0;
      if (score >= 80) return 4.0;
      if (score >= 70) return 3.0;
      if (score >= 60) return 2.0;
      return 0;

    case CalculationMethod.STD_4_0:
      // Standard 4.0 Scale
      if (score >= 90) return 4.0;
      if (score >= 80) return 3.0;
      if (score >= 70) return 2.0;
      if (score >= 60) return 1.0;
      return 0;

    case CalculationMethod.PKU_4_0:
      // Peking University 4.0: 4 - 3 * (100-x)^2 / 1600
      const pku = 4 - (3 * Math.pow(100 - score, 2)) / 1600;
      return Number(Math.max(0, pku).toFixed(2));

    case CalculationMethod.SCALE_4_5:
      // Simple 4.5 Scale (Example: 90+=4.5, 80+=3.5, etc. or linear mapping)
      // Implementation: (Score - 50) / 10 * 0.9 to map 100->4.5, 60->0.9
      // Alternative common: 90-100=4.5, 85-89=4.0, 80-84=3.5 ...
      // Let's use a linear approximation for 4.5 max
      return Number((((score - 50) / 10) * 0.9).toFixed(2));
      
    default:
      return Number(((score - 50) / 10).toFixed(2));
  }
};

export const calculateStats = (courses: Course[]): GpaStats => {
  // Helper for weighted calculations
  const calcWeighted = (list: Course[]) => {
      const credits = list.reduce((sum, c) => sum + c.credits, 0);
      const points = list.reduce((sum, c) => sum + (c.gpa * c.credits), 0);
      return {
          credits,
          gpa: credits > 0 ? Number((points / credits).toFixed(3)) : 0.000
      };
  };

  const allStats = calcWeighted(courses);
  
  // Calculate Compulsory Stats
  const compulsoryCourses = courses.filter(c => c.type === '必修');
  const compulsoryStats = calcWeighted(compulsoryCourses);

  // Calculate Weighted Score (100 scale) for ALL courses
  const totalScorePoints = courses.reduce((sum, course) => sum + (course.score * course.credits), 0);
  const weightedAverageScore = allStats.credits > 0 ? Number((totalScorePoints / allStats.credits).toFixed(2)) : 0.00;

  // Distribution for charts
  let dist = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 };
  
  courses.forEach(c => {
    if (c.score >= 90) dist['90-100']++;
    else if (c.score >= 80) dist['80-89']++;
    else if (c.score >= 70) dist['70-79']++;
    else if (c.score >= 60) dist['60-69']++;
    else dist['<60']++;
  });

  const scoreDistribution = [
    { name: '90-100', value: dist['90-100'] },
    { name: '80-89', value: dist['80-89'] },
    { name: '70-79', value: dist['70-79'] },
    { name: '60-69', value: dist['60-69'] },
    { name: '<60', value: dist['<60'] },
  ];

  return {
    totalCredits: allStats.credits,
    weightedGpa: allStats.gpa,
    weightedAverageScore,
    courseCount: courses.length,
    scoreDistribution,
    
    compulsoryCredits: compulsoryStats.credits,
    compulsoryWeightedGpa: compulsoryStats.gpa
  };
};

export const calculateTrend = (courses: Course[]): SemesterTrend[] => {
    const grouped: Record<string, { totalGpaPoints: number; totalCredits: number }> = {};
    
    // Group by semester
    courses.forEach(c => {
        if (!c.isActive) return;
        if (!grouped[c.semester]) {
            grouped[c.semester] = { totalGpaPoints: 0, totalCredits: 0 };
        }
        grouped[c.semester].totalGpaPoints += c.gpa * c.credits;
        grouped[c.semester].totalCredits += c.credits;
    });

    // Convert to array and sort
    return Object.entries(grouped)
        .map(([semester, data]) => ({
            semester,
            gpa: data.totalCredits > 0 ? Number((data.totalGpaPoints / data.totalCredits).toFixed(3)) : 0,
            credits: data.totalCredits
        }))
        .sort((a, b) => a.semester.localeCompare(b.semester));
};