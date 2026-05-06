"use server";

import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Simple hash function (for demo purposes - in production use bcrypt)
export function simpleHash(password: string): string {
  // Simple base64 encoding for demo - NOT SECURE FOR PRODUCTION
  return Buffer.from(password + "energeez-salt").toString("base64");
}

// Register new user
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = simpleHash(data.password);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        avatar: null,
        preferences: {},
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    revalidatePath("/auth");

    return {
      success: true,
      user: newUser,
      message: "Registration successful! Please login.",
    };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

// Login user
export async function loginUser(data: {
  email: string;
  password: string;
}) {
  try {
    // Hash input password
    const hashedPassword = simpleHash(data.password);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      return { success: false, error: "Email not found" };
    }

    // Check password
    if (user.password !== hashedPassword) {
      return { success: false, error: "Invalid password" };
    }

    // Return user data (without password)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Failed to login:", error);
    return { success: false, error: "Login failed" };
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        preferences: users.preferences,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Failed to get user:", error);
    return { success: false, error: "Failed to get user" };
  }
}

// Get current user from localStorage (client-side helper info)
export async function checkUserExists(email: string) {
  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return { success: true, exists: !!user };
  } catch (error) {
    console.error("Failed to check user:", error);
    return { success: false, error: "Failed to check user" };
  }
}
