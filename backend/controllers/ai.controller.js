import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse-fixed";
import { Job } from "../models/job.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Models are tried in this order. If one is missing (404) or busy, the next one is used.
// You can set GEMINI_MODEL in .env to make your preferred model go first.
const MODEL_LIST = [
    process.env.GEMINI_MODEL,
    "gemini-3.5-flash-lite", // Google's error message recommends this one
    "gemini-3.5-flash",
    "gemini-3.8-flash"
].filter(Boolean);

const BUSY_MESSAGE = "AI servers are busy right now. Please try again in a minute.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isBusyError = (error) => {
    const msg = String(error?.message || "");
    return (
        msg.includes("503") ||
        msg.includes("429") ||
        msg.includes("overloaded") ||
        msg.includes("high demand") ||
        msg.includes("Service Unavailable")
    );
};

// Model doesn't exist / not supported for generateContent
const isModelNotFound = (error) => {
    const msg = String(error?.message || "");
    return msg.includes("404") || msg.includes("not found");
};

// Retries on 503/429, skips to next model on 404 or if still busy
const generateWithRetry = async (prompt) => {
    let lastError;

    for (const modelName of MODEL_LIST) {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
        });

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (error) {
                lastError = error;

                if (isModelNotFound(error)) {
                    console.warn(`${modelName} not available, trying next model...`);
                    break; // leave this model, go to the next one
                }

                if (!isBusyError(error)) throw error; // real error, don't retry

                console.warn(`${modelName} busy (attempt ${attempt}/3), retrying...`);
                await sleep(1500 * attempt); // 1.5s, 3s, 4.5s
            }
        }
    }

    throw lastError;
};

const parseJsonResponse = (text) => {
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    return JSON.parse(cleaned);
};

// 1. AI ATS Resume Score Checker
export const checkAtsScore = async (req, res) => {
    try {
        const { jobId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Please upload a resume PDF.",
                success: false
            });
        }

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        // Fetch job description from DB
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Parse PDF file buffer to extract plain text safely
        const pdfData = await pdfParse(file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({
                message: "Could not extract text from PDF. Ensure it is not an image-only scan.",
                success: false
            });
        }

        // Safe handling for requirements array or string
        let reqSkills = "";
        if (Array.isArray(job.requirements)) {
            reqSkills = job.requirements.join(", ");
        } else if (typeof job.requirements === "string") {
            reqSkills = job.requirements;
        }

        const prompt = `
        You are an expert Application Tracking System (ATS) evaluator.
        Compare the following candidate resume with the given job details.

        Job Title: ${job.title || "N/A"}
        Job Description: ${job.description || "N/A"}
        Job Requirements/Skills: ${reqSkills || "N/A"}

        Candidate Resume Content:
        ${resumeText}

        Please analyze and return a strictly VALID JSON object with NO markdown syntax or backticks. Format must be exactly like:
        {
            "matchPercentage": 75,
            "summary": "Candidate matches frontend skills well but lacks backend experience.",
            "matchingSkills": ["React", "JavaScript", "HTML", "CSS"],
            "missingSkills": ["Node.js", "Express"],
            "improvementTips": ["Add Node.js projects to resume", "Highlight API integration experience"]
        }
        `;

        const responseText = await generateWithRetry(prompt);
        const analysis = parseJsonResponse(responseText);

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("Error in checkAtsScore Details:", error);
        const busy = isBusyError(error);
        return res.status(busy ? 503 : 500).json({
            message: busy
                ? BUSY_MESSAGE
                : error.message || "Failed to evaluate ATS Score via AI.",
            success: false
        });
    }
};

// 2. AI Job Description Generator (For Admin)
export const generateJobDescription = async (req, res) => {
    try {
        const { title, companyName } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Job title is required to generate description.",
                success: false
            });
        }

        const prompt = `
        Generate a professional job posting detail for the role of "${title}" ${companyName ? `at company "${companyName}"` : ""}.
        Provide a JSON output strictly without markdown syntax:
        {
            "description": "Professional paragraph overview",
            "requirements": "React, Node.js, MongoDB"
        }
        `;

        const responseText = await generateWithRetry(prompt);
        const data = parseJsonResponse(responseText);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Error in generateJobDescription:", error);
        const busy = isBusyError(error);
        return res.status(busy ? 503 : 500).json({
            message: busy
                ? BUSY_MESSAGE
                : error.message || "Failed to generate Job Description via AI.",
            success: false
        });
    }
};