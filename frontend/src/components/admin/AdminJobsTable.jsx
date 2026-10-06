import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableCaption, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, Edit2, Eye } from 'lucide-react'; // Eye icon added here
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const AdminJobsTable = () => {
    const { allAdminJobs = [], searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    useEffect(() => {
        const jobsList = allAdminJobs || [];
        const filteredJobs = jobsList.filter((job) => {
            if (!searchJobByText) return true;
            const text = searchJobByText.toLowerCase();
            return (
                job?.title?.toLowerCase().includes(text) ||
                job?.company?.name?.toLowerCase().includes(text)
            );
        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText]);

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!filterJobs?.length ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                                You haven't posted any jobs yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filterJobs.map(job => (
                            <TableRow key={job._id}>
                                <TableCell>{job?.company?.name || "N/A"}</TableCell>
                                <TableCell>{job?.title || "N/A"}</TableCell>
                                <TableCell>{job?.createdAt ? job.createdAt.split("T")[0] : "N/A"}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            <div
                                                onClick={() => navigate(`/admin/jobs/${job._id}`)}
                                                className='flex items-center gap-2 w-fit cursor-pointer'
                                            >
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                            <div 
                                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} 
                                                className='flex items-center w-fit gap-2 cursor-pointer mt-2'
                                            >
                                                <Eye className='w-4' />
                                                <span>Applicants</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable;