import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Sparkles, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

// Change this when you deploy your backend
const API_URL = "http://localhost:8000/api/v1/ai/check-ats";
const MAX_FILE_SIZE_MB = 5;

const AtsCheckerModal = ({ isOpen, onClose, jobId }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const handleClose = () => {
        if (loading) return; // don't close while analyzing
        setFile(null);
        setResult(null);
        onClose();
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) {
            setFile(null);
            return;
        }

        if (selected.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            e.target.value = "";
            setFile(null);
            return;
        }

        if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File is too large. Max size is ${MAX_FILE_SIZE_MB} MB`);
            e.target.value = "";
            setFile(null);
            return;
        }

        setFile(selected);
        setResult(null); // clear old result when a new file is chosen
    };

    const getFriendlyError = (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || "";

        if (
            status === 503 ||
            message.includes("503") ||
            message.includes("high demand") ||
            message.includes("overloaded")
        ) {
            return "AI servers are busy right now. Please try again in a minute.";
        }

        if (status === 429 || message.includes("429")) {
            return "Too many requests. Please wait a bit and try again.";
        }

        if (error.code === "ERR_NETWORK") {
            return "Cannot reach the server. Check that your backend is running.";
        }

        return message || "Something went wrong during ATS check.";
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please upload a PDF resume");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobId", jobId);

        try {
            setLoading(true);
            setResult(null);
            const res = await axios.post(API_URL, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });

            if (res.data.success) {
                setResult(res.data.analysis);
                toast.success("ATS Analysis Complete!");
            }
        } catch (error) {
            console.error(error);
            toast.error(getFriendlyError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-purple-100">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                        <h2 className="text-xl font-bold text-gray-800">AI ATS Resume Score Checker</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleAnalyze} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload your Resume (PDF format, max {MAX_FILE_SIZE_MB} MB)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing Resume with AI...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Check ATS Match Score
                            </>
                        )}
                    </button>
                </form>

                {/* Analysis Result */}
                {result && (
                    <div className="mt-6 space-y-5 bg-purple-50/50 p-5 rounded-xl border border-purple-100">
                        {/* Score Circle */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">ATS Match Score</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Based on Gemini AI analysis</p>
                            </div>
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xl shadow-lg">
                                {result.matchPercentage}%
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Evaluation Summary</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                                {result.summary}
                            </p>
                        </div>

                        {/* Matching Skills */}
                        {result.matchingSkills?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-green-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Matching Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.matchingSkills.map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Missing Skills */}
                        {result.missingSkills?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-red-700">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    Missing / Desired Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingSkills.map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Improvement Tips */}
                        {result.improvementTips?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-amber-700">
                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                    AI Improvement Recommendations
                                </h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                                    {result.improvementTips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsCheckerModal;