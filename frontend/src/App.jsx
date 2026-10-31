import React from 'react'
import {
    Routes, Route
} from "react-router-dom"
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import About from './pages/About'
import Experience from './pages/Experience'
import Blogs from './pages/Blogs'
import Footer from './components/Footer'
import Blog from './pages/Blog'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Notes from './pages/Notes'
import NoteSingle from './pages/NoteSingle'
import Projects from './pages/Projects'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
    return (
        <ThemeProvider>
            <div className='min-h-screen flex flex-col justify-between font-sans antialiased bg-slate-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300'>
                <div className='flex-1 flex flex-col'>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/about' element={<About />} />
                        <Route path='/experience' element={<Experience />} />
                        <Route path='/blogs' element={<Blogs />} />
                        <Route path='/blogs/:slug' element={<Blog />} />
                        <Route path='/notes' element={<Notes />} />
                        <Route path='/notes/:slug' element={<NoteSingle />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path='/signin' element={<SignIn />} />
                        <Route path='/projects' element={<Projects />} />
                        <Route path='/admin' element={<AdminDashboard />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    )
}

export default App
