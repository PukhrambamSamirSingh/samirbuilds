import React, { useEffect, useRef, useState } from 'react'
import { MdClose } from "react-icons/md";

const AddBlog = ({openAdd, setOpenAdd}) => {
    const modalRef = useRef(null)

    useEffect(()=>{
        if (openAdd) {
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                modalRef.current?.querySelector("input")?.focus()
            }, 0);
        } else {
            document.body.style.overflow = "auto"
        }

        return () => {
            document.body.style.overflow = "auto"
        }
    }, [openAdd])

    useEffect(()=>{
        const handleTab = (e) => {
            if(!openAdd || !modalRef.current) return;

            const focusable = modalRef.current.querySelectorAll(
                "input, button, textarea, select"
            )
            
            if (!focusable.length) return;

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus()
                    }
                }
                else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus()
                    }
                }
            } else if (e.key === "Escape") {
                setOpenAdd(false);
            }
        }
        document.addEventListener("keydown", handleTab)

        return () => {
            document.removeEventListener("keydown", handleTab)
        }
    }, [openAdd, setOpenAdd])
    
    return (
        <>
            {openAdd && (
                <div className='fixed inset-0 flex justify-center items-center text-white bg-black/70 backdrop-blur-sm z-50 p-4 overflow-y-auto'>
                    <div className='relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-auto' ref={modalRef}>
                        <button 
                            type='button' 
                            className='absolute top-4 right-4 text-gray-400 hover:text-white p-1 transition-colors' 
                            onClick={()=>setOpenAdd(false)}
                            aria-label="Close modal"
                        >
                            <MdClose className='text-2xl sm:text-3xl cursor-pointer'/>
                        </button>
                        <h2 className='text-2xl font-bold mb-6 text-gray-100 text-center sm:text-left'>Create New Blog</h2>
                        <form action="" className='w-full flex flex-col gap-5'>
                            <div className='w-full flex flex-col gap-2'>
                                <label htmlFor="title" className='text-sm sm:text-base font-semibold text-gray-300'>Title</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    id="title" 
                                    placeholder="Enter blog title"
                                    className='outline-none border border-gray-700 focus:border-blue-500 bg-gray-800/80 p-3 rounded-xl text-sm sm:text-base w-full transition-colors'
                                />
                            </div>
                            <div className='w-full flex flex-col gap-2'>
                                <label htmlFor="description" className='text-sm sm:text-base font-semibold text-gray-300'>Description</label>
                                <textarea 
                                    rows={4} 
                                    name="description" 
                                    id="description" 
                                    placeholder="Write article content..."
                                    className='outline-none border border-gray-700 focus:border-blue-500 bg-gray-800/80 p-3 rounded-xl text-sm sm:text-base w-full transition-colors resize-none'
                                />
                            </div>
                            <div className='w-full flex flex-col gap-2'>
                                <label htmlFor="tag" className='text-sm sm:text-base font-semibold text-gray-300'>Tag</label>
                                <input 
                                    type="text" 
                                    name="tag" 
                                    id="tag" 
                                    placeholder="e.g. Technology, Design, Coding"
                                    className='outline-none border border-gray-700 focus:border-blue-500 bg-gray-800/80 p-3 rounded-xl text-sm sm:text-base w-full transition-colors'
                                />
                            </div>
                            <div className='w-full flex flex-col gap-2'>
                                <label htmlFor="img" className='text-sm sm:text-base font-semibold text-gray-300'>Image URL</label>
                                <input 
                                    type="text" 
                                    name="img" 
                                    id="img" 
                                    placeholder="https://images.unsplash.com/..."
                                    className='outline-none border border-gray-700 focus:border-blue-500 bg-gray-800/80 p-3 rounded-xl text-sm sm:text-base w-full transition-colors'
                                />
                            </div>
                            <button 
                                className='mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm sm:text-base transition-colors shadow-lg cursor-pointer' 
                                type='button'
                            >
                                Publish Blog
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default AddBlog