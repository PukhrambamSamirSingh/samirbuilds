import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const userSet = localStorage.getItem('theme_user_set')
      if (userSet === 'true') {
        const saved = localStorage.getItem('theme')
        return saved === 'light' ? 'light' : 'dark'
      }
      // Default to dark for all visitors and clear legacy light default
      localStorage.setItem('theme', 'dark')
      return 'dark'
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
        document.body.style.color = '#ffffff'
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
        document.body.style.color = '#0f172a'
      }
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', nextTheme)
        localStorage.setItem('theme_user_set', 'true')
      } catch (e) {}
      return nextTheme
    })
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
