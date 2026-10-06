import { Job } from "../models/job.model.js";

// Admin post karega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || experience === undefined || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        // Parse salary safely to pure number
        const parsedSalary = Number(String(salary).replace(/[^0-9.]/g, ''));
        // Parse experience safely to pure number (e.g. "1 year" -> 1)
        const parsedExperience = Number(String(experience).replace(/[^0-9.]/g, ''));
        // Parse position safely to pure number
        const parsedPosition = Number(String(position).replace(/[^0-9.]/g, ''));

        if (isNaN(parsedSalary) || isNaN(parsedExperience) || isNaN(parsedPosition)) {
            return res.status(400).json({
                message: "Salary, Experience, and Position must be valid numbers.",
                success: false
            });
        }

        // Requirements formatting handling (Array or Comma-separated string)
        const formattedRequirements = Array.isArray(requirements)
            ? requirements
            : String(requirements).split(",").map(req => req.trim());

        const job = await Job.create({
            title,
            description,
            requirements: formattedRequirements,
            salary: parsedSalary,
            location,
            jobType: jobType,
            jobtype: jobType,
            experience: parsedExperience,
            position: parsedPosition,
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });

    } catch (error) {
        console.log("Error in postJob:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// For Student - Get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        const jobs = await Job.find(query).populate({ 
            path: "company"
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.log("Error in getAllJobs:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// For Student - Get job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log("Error in getJobById:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Admin kitne job create kiya abhi tak
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        if (!adminId) {
            return res.status(401).json({
                message: "User not authenticated / Missing Token",
                success: false
            });
        }

        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company'
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.log("Error in getAdminJobs:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};