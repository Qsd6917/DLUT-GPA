import { GoogleGenAI, Type } from "@google/genai";
import { Course, GpaStats } from "../types";

// Initialize the Gemini API client using the process.env.API_KEY as required by guidelines.
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

export const parseTranscriptFromImage = async (base64Image: string): Promise<Course[]> => {
  try {
    const prompt = `
      请分析这张成绩单图片，并提取所有课程信息。
      请仔细识别每一行，提取以下字段：
      - semester (学期，格式如 "1-1", "2023-2024-1" 或 "大一上"，请统一标准化为类似 "1-1", "1-2", "2-1" 的格式，如果图片中没有明确学期，请根据上下文推断或标记为"未知")
      - name (课程名称)
      - credits (学分，数字)
      - score (成绩/分数)。如果成绩是等级制（如"优"、"良"、"通过"），请按以下规则转换：优=95, 良=85, 中=75, 及格=65, 通过=80 (或者设为0并不计算GPA)。如果是数字，直接提取数字。
      
      请返回一个 JSON 数组。不要包含 markdown 格式标记。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Clean up response text in case model adds markdown code blocks
    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const rawData = JSON.parse(jsonStr);
    
    // Validate and map to Course type
    if (Array.isArray(rawData)) {
        return rawData.map((item: any) => ({
            id: '', // ID will be assigned by the importer
            name: item.name || "未命名课程",
            credits: Number(item.credits) || 0,
            score: Number(item.score) || 0,
            semester: item.semester || "未知学期",
            gpa: 0,
            isActive: true
        }));
    }
    
    return [];

  } catch (error) {
    console.error("Gemini Image Parse Error:", error);
    throw new Error("无法识别图片中的成绩单，请确保图片清晰。");
  }
};

export const parseTranscriptFromText = async (textData: string): Promise<Course[]> => {
  try {
    const prompt = `
      我将提供一段来自教务系统的文本内容（可能是直接复制的网页文本，也可能是 HTML 源码）。
      请你从中提取所有课程成绩信息。
      
      请仔细识别，忽略无关的导航栏、页脚等信息，只提取课程列表。
      对于每一门课程，提取以下字段：
      - semester (学期，格式如 "2023-2024-1", "2023秋", "1-1"。请统一标准化格式，例如 "1-1", "1-2" 或 "2023-2024-1")
      - name (课程名称)
      - credits (学分，数字)
      - score (成绩/分数)。如果成绩是等级制，请按规则转换：优=95, 良=85, 中=75, 及格=65, 通过=80。如果是数字，直接提取。

      待解析的文本/HTML内容如下:
      ${textData.substring(0, 30000)} 
      // 截取前30000字符以防止超出Token限制，通常足够包含成绩表
      
      请返回一个 JSON 数组。不要包含 markdown 格式标记。如果无法提取任何课程，返回空数组 []。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Flash model is great for large context (HTML) handling
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const rawData = JSON.parse(jsonStr);
    
    if (Array.isArray(rawData)) {
        return rawData.map((item: any) => ({
            id: '', 
            name: item.name || "未命名课程",
            credits: Number(item.credits) || 0,
            score: Number(item.score) || 0,
            semester: item.semester || "未知学期",
            gpa: 0,
            isActive: true
        }));
    }
    
    return [];

  } catch (error) {
    console.error("Gemini Text Parse Error:", error);
    throw new Error("解析失败，请确保您粘贴了包含成绩表格的文本或 HTML 源码。");
  }
};