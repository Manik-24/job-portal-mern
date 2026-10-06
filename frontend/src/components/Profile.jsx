import React, { useState } from 'react'
import Navbar from './ui/shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, FileText, Download } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

const Profile = () => {
    useGetAppliedJobs();
    const { user } = useSelector(store => store.auth);
    const [open, setOpen] = useState(false);

    const skills = user?.profile?.skills || [];
    const hasResume = Boolean(user?.profile?.resume);

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8 shadow-sm'>
                <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-24 w-24 border-2 border-purple-100 shadow-sm">
                            <AvatarImage
                                src={user?.profile?.profilePhoto || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2cpfp_6t9VC9V-fhNoCygxKm6YuLVDDWHvw-0pbOUUz6f-sdT-IfM_6w&s=10"}
                                alt="profile"
                            />
                        </Avatar>
                        <div>
                            <h1 className='font-bold text-2xl text-gray-800'>{user?.fullname}</h1>
                            <p className='text-sm text-gray-600 mt-1'>{user?.profile?.bio || "No bio added yet."}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} className="text-right border-purple-200 hover:bg-purple-50 text-purple-700" variant="outline">
                        <Pen className='w-4 h-4 mr-1' /> Edit
                    </Button>
                </div>

                <div className='my-5 grid grid-cols-2 gap-2 text-sm text-gray-700'>
                    <div className='flex items-center gap-3 my-1'>
                        <Mail className='w-4 h-4 text-purple-600' />
                        <span>{user?.email}</span>
                    </div>
                    <div className='flex items-center gap-3 my-1'>
                        <Contact className='w-4 h-4 text-purple-600' />
                        <span>{user?.phoneNumber || "N/A"}</span>
                    </div>
                </div>

                <div className='my-5'>
                    <h1 className='font-semibold text-gray-800 mb-2'>Skills</h1>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                        {
                            skills.length > 0
                                ? skills.map((item, index) => <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none px-3 py-1 text-xs">{item}</Badge>)
                                : <span className='text-sm text-gray-400'>No skills added</span>
                        }
                    </div>
                </div>

                <div className='grid w-full items-center gap-2 border-t pt-4 border-gray-100'>
                    <Label className="text-md font-bold text-gray-800">Resume</Label>
                    {
                        hasResume ? (
                            <div className='flex items-center gap-2'>
                                <FileText className='w-5 h-5 text-purple-600' />
                                <a
                                    target='_blank'
                                    rel='noreferrer'
                                    href={user?.profile?.resume}
                                    className='text-purple-700 font-medium text-sm hover:underline flex items-center gap-1'
                                >
                                    {user?.profile?.resumeOriginalName || "View Uploaded Resume"}
                                    <Download className='w-3.5 h-3.5 ml-1' />
                                </a>
                            </div>
                        ) : (
                            <span className='text-sm text-red-500 font-medium bg-red-50 p-2 rounded-md border border-red-100 w-fit'>
                                ⚠️ No resume uploaded. Please click Edit to upload your resume before applying.
                            </span>
                        )
                    }
                </div>
            </div>

            <div className='max-w-4xl mx-auto bg-white rounded-2xl p-6 my-6 border border-gray-100 shadow-sm'>
                <h1 className='font-bold text-xl mb-4 text-gray-800'>Applied Jobs</h1>
                <AppliedJobTable />
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile;