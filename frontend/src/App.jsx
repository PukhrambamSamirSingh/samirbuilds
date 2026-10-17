import React from 'react'
import {
    Routes, Route
} from "react-router-dom"
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import About from './pages/About'
import Blogs from './pages/Blogs'
import Footer from './components/Footer'
import Blog from './pages/Blog'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Notes from './pages/Notes'
import Projects from './pages/Projects'

const App = () => {
    return (
        <ThemeProvider>
            <div className='min-h-screen flex flex-col justify-between font-sans antialiased'>
                <div className='flex-1 flex flex-col'>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/about' element={<About />} />
                        <Route path='/blogs' element={<Blogs />} />
                        <Route path='/blogs/:slug' element={<Blog/>}/>
                        <Route path='/notes' element={<Notes/>}/>
                        <Route path="/signup" element={<SignUp/>}/>
                        <Route path='/signin' element={<SignIn/>}/>
                        <Route path='/projects' element={<Projects/>}/>
                    </Routes>
                </div>
                <Footer />
            </div>
        </ThemeProvider>
    )
}

export default App