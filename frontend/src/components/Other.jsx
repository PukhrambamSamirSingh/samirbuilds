import React from 'react'
import { useTheme } from '../context/ThemeContext'

const Other = () => {
  const { theme } = useTheme()

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 group border ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700 hover:border-gray-600 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900 shadow-md'}`}>
        <div className='overflow-hidden rounded-xl'>
            <img 
              className='w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300' 
              src="https://images.unsplash.com/photo-1599394407175-b6da85464b90?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bmV4dCUyMGdlbmVyYXRpb258ZW58MHx8MHx8fDA%3D" 
              alt="Other item image" 
            />
        </div>
        <h3 className={`text-lg sm:text-xl font-bold text-center group-hover:text-blue-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Title</h3>
        <p className={`text-xs sm:text-sm text-center line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This will be the description text for this topic.</p>
    </div>
  )
}

export default Other