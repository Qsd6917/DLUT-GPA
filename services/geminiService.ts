import { GoogleGenAI, Type } from "@google/genai";
import { Course, GpaStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAcademicAdvice = async (
  courses: Course[],
  stats: GpaStats
): Promise<{ analysis: string; suggestions: string[]; }> => {
  try {
    const courseSummary = courses
      .map((c) => `${c.name}: 成绩 ${c.score} (学分: ${c.credits})`)
      .join("\n");

    const prompt = `
      你是一位专业的学业导师。请根据以下学生的成绩单和GPA数据进行分析。
      GPA 计算采用 5.0 分制。
      
      当前统计:
      加权 GPA: ${stats.weightedGpa}
      总学分: ${stats.totalCredits}
      
      课程列表:
      ${courseSummary}
      
      请提供一个 JSON 格式的回复，包含两个字段 (请使用简体中文回答):
      1. "analysis": 一段简短的段落，分析学生的表现，指出优势和劣势。
      2. "suggestions": 一个包含 3-5 个具体的建议列表，说明如何提高 GPA 或保持优异成绩。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                analysis: { type: Type.STRING },
                suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      analysis: result.analysis || "无法生成分析。",
      suggestions: result.suggestions || ["继续加油！"],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("获取学业建议失败。");
  }
};