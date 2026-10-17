import React from 'react'
import Navbar from '../components/Navbar'
import Other from '../components/Other'
import { useTheme } from '../context/ThemeContext'

const Others = () => {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-slate-100 text-gray-900'} flex flex-col justify-between transition-colors duration-300`}>
        <div>
          <Navbar/>
          <main className='max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-8'>
            <div className={`flex justify-center border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} pb-6 mb-8`}>
              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                  Others
              </h1>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8'>
                <Other/>
                <Other/>
                <Other/>
                <Other/>
                <Other/>
                <Other/>
                <Other/>
                <Other/>
            </div>
          </main>
        </div>
    </div>
  )
}

export default Others