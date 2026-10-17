import React from 'react'
import { MdClose } from "react-icons/md";

const Search = ({ setToggleSearch }) => {
  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start pt-20 px-4'>
        <div className='w-full max-w-xl bg-gray-900 text-white rounded-2xl p-6 shadow-2xl border border-gray-800 flex flex-col gap-4 relative'>
            <div className='flex justify-between items-center border-b border-gray-800 pb-3'>
                <h3 className='text-xl font-bold'>Search Blogs</h3>
                <button 
                    type="button" 
                    onClick={() => setToggleSearch && setToggleSearch(false)} 
                    className='text-gray-400 hover:text-white p-1'
                >
                    <MdClose className='text-2xl'/>
                </button>
            </div>
            <div className='relative'>
                <input 
                    type="text" 
                    placeholder="Search by title, tag, or content..." 
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-500 transition-all"
                    autoFocus
                />
            </div>
            <p className='text-xs text-gray-400 italic'>Type to search articles across Samir Builds...</p>
        </div>
    </div>
  )
}

export default Search