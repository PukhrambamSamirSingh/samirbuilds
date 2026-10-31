import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      return saved === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {}

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.style.backgroundColor = '#000000'
      document.documentElement.style.colorScheme = 'dark'
      if (document.body) {
        document.body.classList.add('dark')
        document.body.classList.remove('light')
        document.body.style.backgroundColor = '#000000'
      }
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.style.backgroundColor = '#f8fafc'
      document.documentElement.style.colorScheme = 'light'
      if (document.body) {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
        document.body.style.backgroundColor = '#f8fafc'
      }
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
