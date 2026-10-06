import React, { useState } from 'react'
import Navbar from '../ui/shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
        setInput({ ...input, companyId: selectedCompany._id });
    };

    // AI Job Description Generator Handler
    const generateAiDescriptionHandler = async () => {
        if (!input.title) {
            toast.error("Please enter a Job Title first!");
            return;
        }

        try {
            setAiLoading(true);
            const selectedCompany = companies.find(c => c._id === input.companyId);
            const companyName = selectedCompany ? selectedCompany.name : "";

            const res = await axios.post("http://localhost:8000/api/v1/ai/generate-jd", {
                title: input.title,
                companyName: companyName
            }, { withCredentials: true });

            if (res.data.success) {
                setInput(prev => ({
                    ...prev,
                    description: res.data.data.description,
                    requirements: res.data.data.requirements
                }));
                toast.success("Job Description Generated with AI!");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to generate AI description");
        } finally {
            setAiLoading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/admin/jobs');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md w-full'>
                    
                    <div className='flex items-center justify-between mb-4 pb-2 border-b border-gray-200'>
                        <h1 className='font-bold text-xl text-gray-800'>Post New Job</h1>
                        
                        {/* AI Generator Trigger */}
                        <Button
                            type="button"
                            onClick={generateAiDescriptionHandler}
                            disabled={aiLoading}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2 hover:opacity-90 shadow-md text-sm"
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className='h-4 w-4 animate-spin' /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className='h-4 w-4' /> Generate Details with AI
                                </>
                            )}
                        </Button>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label>Job Title</Label>
                            <Input
                                type="text"
                                name="title"
                                placeholder="e.g. Senior React Developer"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                placeholder="e.g. Delhi, Remote"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        <div className='col-span-2'>
                            <div className='flex items-center justify-between'>
                                <Label>Description</Label>
                                <span className='text-xs text-purple-600 font-medium'>*Can be auto-generated via AI button above</span>
                            </div>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Enter or auto-generate description..."
                                value={input.description}
                                onChange={changeEventHandler}
                                className="w-full p-2 text-sm border border-gray-200 rounded-md focus-visible:outline-none my-1"
                            />
                        </div>

                        <div className='col-span-2'>
                            <Label>Requirements (Comma separated)</Label>
                            <Input
                                type="text"
                                name="requirements"
                                placeholder="e.g. React, Node.js, MongoDB"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        <div>
                            <Label>Salary (in LPA)</Label>
                            <Input
                                type="text"
                                name="salary"
                                placeholder="e.g. 12"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        <div>
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                placeholder="e.g. Full-time, Internship"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        <div>
                            <Label>Experience Level (in yrs)</Label>
                            <Input
                                type="text"
                                name="experience"
                                placeholder="e.g. 2"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        <div>
                            <Label>No of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        {companies.length > 0 && (
                            <div className='col-span-2 mt-2'>
                                <Label className="block mb-1">Select Company</Label>
                                <Select onValueChange={selectChangeHandler}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map((company) => (
                                                <SelectItem key={company._id} value={company?.name?.toLowerCase()}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <Button className="w-full my-6 bg-purple-700">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-6 bg-purple-700 hover:bg-purple-800">
                            Post New Job
                        </Button>
                    )}

                    {companies.length === 0 && (
                        <p className='text-xs text-red-600 font-bold text-center my-3'>
                            *Please register a company first, before posting a job
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default PostJob;