/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { AIEditInstruction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeEditingPrompt = async (prompt: string): Promise<AIEditInstruction[]> => {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    You are an expert AI Video Editor. Your task is to take a user prompt and translate it into a series of technical editing instructions.
    The response must be a JSON array of objects with the following structure:
    {
      "timestamp": number (in seconds),
      "action": string (e.g., "cut", "zoom", "effect", "voice_match", "overlay"),
      "parameters": object (any relevant settings),
      "reasoning": string (why this edit was made)
    }
    
    Handle requests for:
    - Voice matching (matching voiceover tone to content)
    - Effect matching (adding visual styles or transitions - e.g., "glitch", "film grain", "retro")
    - Anime effect/filter (specifically requested: apply hand-drawn anime style, cell-shading, dynamic light streaks)
    - Audio editing (syncing volume, noise reduction, beat matching)
    - Formatting (9:16 vertical vs 16:9 widescreen)
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    const text = result.text;
    if (!text) throw new Error("Empty response from AI");

    // Clean potential markdown formatting
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
};
