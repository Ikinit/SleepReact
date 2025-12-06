import React, { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }){
  const [scheme, setScheme] = useState('system')

  function toggleScheme(){
    setScheme(s => s === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ scheme, setScheme, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(){
  const ctx = useContext(ThemeContext)
  if(!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeProvider
