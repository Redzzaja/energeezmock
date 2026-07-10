export interface Question {
  id: number;
  text: string;
  icon: string;
  category: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Do you feel more energized in the morning than in the evening?",
    icon: "wb_twilight",
    category: "Chronotype",
  },
  {
    id: 2,
    text: "Do social interactions typically drain your energy?",
    icon: "group",
    category: "Social Energy",
  },
  {
    id: 3,
    text: "Do you prefer planning your day ahead rather than being spontaneous?",
    icon: "event_note",
    category: "Planning Style",
  },
  {
    id: 4,
    text: "Does physical exercise boost your mental energy?",
    icon: "fitness_center",
    category: "Exercise Impact",
  },
  {
    id: 5,
    text: "Do you find it hard to focus when your environment is cluttered or noisy?",
    icon: "psychology",
    category: "Environment",
  },
  {
    id: 6,
    text: "Do you often feel mentally exhausted after long meetings?",
    icon: "meeting_room",
    category: "Meeting Fatigue",
  },
  {
    id: 7,
    text: "Do you recharge better through solitude than through social activities?",
    icon: "self_improvement",
    category: "Recharge Style",
  },
  {
    id: 8,
    text: "Does caffeine significantly affect your energy levels?",
    icon: "coffee",
    category: "Caffeine",
  },
  {
    id: 9,
    text: "Do you experience energy crashes in the afternoon?",
    icon: "trending_down",
    category: "Afternoon Crash",
  },
  {
    id: 10,
    text: "Do you prefer working on one task at a time rather than multitasking?",
    icon: "checklist",
    category: "Focus Style",
  },
];
