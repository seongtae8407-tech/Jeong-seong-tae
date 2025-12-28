
export enum Subject {
  GeneralChemistry = '일반화학',
  FireProtection = '화재예방 및 소화방법',
  HazardousMaterials = '위험물의 성질 및 취급'
}

export interface Question {
  id: number;
  subject: Subject;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface ExamSession {
  questions: Question[];
  userAnswers: (number | null)[];
  startTime: number;
  endTime: number | null;
  score: number;
}

export enum AppState {
  Home = 'HOME',
  Loading = 'LOADING',
  Exam = 'EXAM',
  Result = 'RESULT',
  Review = 'REVIEW'
}
