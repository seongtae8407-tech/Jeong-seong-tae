
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMockExam = async (count: number = 20): Promise<Question[]> => {
  const prompt = `위험물산업기사 필기 시험을 위한 모의고사 문제 ${count}개를 생성해주세요. 
  과목은 '${Subject.GeneralChemistry}', '${Subject.FireProtection}', '${Subject.HazardousMaterials}' 세 가지를 골고루 포함해야 합니다. 
  문제는 한국어로 작성하며, 실제 국가기술자격시험 출제 경향을 반영하세요. 
  각 문제는 4지 선다형이어야 합니다.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            subject: { type: Type.STRING },
            questionText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER, description: "0-based index of the correct option (0 to 3)" },
            explanation: { type: Type.STRING }
          },
          required: ["id", "subject", "questionText", "options", "correctAnswer", "explanation"],
          propertyOrdering: ["id", "subject", "questionText", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    const questions = JSON.parse(response.text);
    return questions;
  } catch (error) {
    console.error("Failed to parse questions:", error);
    throw new Error("시험 문제 생성 중 오류가 발생했습니다.");
  }
};
