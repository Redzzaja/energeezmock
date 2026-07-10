"use server";

import { db } from "../../db";
import { questionnaireAnswers } from "../../db/schema";
import { eq } from "drizzle-orm";
import { QUESTIONS, type Question } from "../../lib/questionnaireData";
export type { Question } from "../../lib/questionnaireData";

// Get all questions
export async function getQuestions(): Promise<Question[]> {
  return QUESTIONS;
}

// Save questionnaire answers
export async function saveQuestionnaire(
  userId: number,
  answers: { questionId: number; answer: boolean }[]
) {
  try {
    // Check if user already has answers
    const existing = await db
      .select()
      .from(questionnaireAnswers)
      .where(eq(questionnaireAnswers.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(questionnaireAnswers)
        .set({
          answers,
          completedAt: new Date(),
        })
        .where(eq(questionnaireAnswers.userId, userId));
    } else {
      // Insert new
      await db.insert(questionnaireAnswers).values({
        userId,
        answers,
        completedAt: new Date(),
      });
    }

    return { success: true, message: "Questionnaire saved successfully" };
  } catch (error) {
    console.error("Failed to save questionnaire:", error);
    return { success: false, error: "Failed to save questionnaire" };
  }
}

// Check if user has completed questionnaire
export async function getQuestionnaire(userId: number) {
  try {
    const [result] = await db
      .select()
      .from(questionnaireAnswers)
      .where(eq(questionnaireAnswers.userId, userId))
      .limit(1);

    if (!result) {
      return { success: true, completed: false, answers: null };
    }

    return {
      success: true,
      completed: true,
      answers: result.answers,
      completedAt: result.completedAt,
    };
  } catch (error) {
    console.error("Failed to get questionnaire:", error);
    return { success: false, error: "Failed to get questionnaire", completed: false };
  }
}
