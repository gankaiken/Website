export type Question = {
  id: string;
  text: string;
  options: string[];
};

export const questions: Question[] = [
  {
    id: "itch",
    text: "Is the affected area itchy?",
    options: ["Yes", "No"],
  },
  {
    id: "duration",
    text: "How long have you had this condition?",
    options: ["< 3 days", "1 week", "More than 2 weeks"],
  },
  {
    id: "spread",
    text: "Is it spreading?",
    options: ["Yes", "No"],
  },
  {
    id: "pain",
    text: "Is there pain or burning sensation?",
    options: ["Yes", "No"],
  },
];