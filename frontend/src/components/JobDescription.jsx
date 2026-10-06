import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import AtsCheckerModal from './AtsCheckerModal';

const JobDescription = () => {
    const params = useParams();
    const jobId = params.id;
    const navigate = useNavigate();

    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const [isApplied, setIsApplied] = useState(false);
    const [isAtsOpen, setIsAtsOpen] = useState(false);

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [...(singleJob?.applications || []), { applicant: user?._id }]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(
                        res.data.job?.applications?.some(
                            application => application.applicant === user?._id
                        ) || false
                    );
                }
            } catch (error) {
                console.log(error);
                if (error.response?.status === 401) {
                    toast.error("Please login to view job details");
                    navigate("/login");
                } else {
                    toast.error(error.response?.data?.message || "Failed to load job");
                }
            }
        }

        dispatch(setSingleJob(null)); // purana job data clear
        fetchSingleJob();
    }, [jobId, dispatch, user?._id, navigate]);

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType || singleJob?.jobtype}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary} LPA</Badge>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    {/* AI ATS Resume Score Checker Button */}
                    <Button
                        onClick={() => setIsAtsOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:opacity-90 transition shadow-md"
                    >
                        <Sparkles className="w-4 h-4" />
                        Check ATS Score with AI
                    </Button>

                    {/* Apply Now Button */}
                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                        {isApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                </div>
            </div>

            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experienceLevel || singleJob?.experience || 0} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary} LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length || 0}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "N/A"}</span></h1>
            </div>

            {/* ATS Checker Modal */}
            <AtsCheckerModal
                isOpen={isAtsOpen}
                onClose={() => setIsAtsOpen(false)}
                jobId={jobId}
            />
        </div>
    )
}

export default JobDescription;