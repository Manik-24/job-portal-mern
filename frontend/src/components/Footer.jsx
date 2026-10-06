import React from 'react'

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H7.9V12h2.6V9.8c0-2.6 1.5-4 3.9-4 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z" />
  </svg>
)

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23 4.8c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.7 3.7a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6v.1a4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 1 19.5a12.7 12.7 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.3-2.3z" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.6v1.7h.05c.5-.95 1.75-1.95 3.6-1.95 3.85 0 4.55 2.5 4.55 5.8V21h-4v-5.5c0-1.3 0-3-1.85-3s-2.15 1.4-2.15 2.9V21H9z" />
  </svg>
)

const Footer = () => {
    return (
        <footer className='border-t border-t-gray-200 py-8'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row justify-between items-center'>
                    <div className='mb-4 md:mb-0'>
                        <h2 className='text-xl font-bold'>Job Hunt</h2>
                        <p className='text-sm text-gray-500'>&copy; 2026 Your Company. All rights reserved.</p>
                    </div>
                    <div className='flex space-x-4 mt-4 md:mt-0'>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                           className='text-gray-800 hover:text-gray-600 transition-colors' aria-label="Facebook">
                            <FacebookIcon className='w-5 h-5' />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                           className='text-gray-800 hover:text-gray-600 transition-colors' aria-label="Twitter">
                            <TwitterIcon className='w-5 h-5' />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                           className='text-gray-800 hover:text-gray-600 transition-colors' aria-label="LinkedIn">
                            <LinkedinIcon className='w-5 h-5' />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer