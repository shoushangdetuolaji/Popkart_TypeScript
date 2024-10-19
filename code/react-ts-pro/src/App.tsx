// 把App组件的数据通过context机制把数据传递给Son
import { createContext, useContext, useState } from 'react'

type ThemeContextType = 'light' | 'dark'

// 通过泛型传入类型
const ThemeContext = createContext<ThemeContextType>('light')

const Son = () => {
  const theme = useContext(ThemeContext)

  return (
    <div
      style={{
        border: '1px solid #ccc',
        color: theme === 'dark' ? '#fff' : '#000',
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
      }}>
      i am son, 当前主题为{theme}
    </div>
  )
}

const Parent = () => {
  const [theme, setTheme] = useState<ThemeContextType>('light')
  const toggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }
  return (
    <>
      {/* 限制数据提供方Provider的value属性类型为 UserContextType  */}
      <ThemeContext.Provider value={theme}>
        <button onClick={toggle}>toggle</button>
        <div>i am parent</div>
        <Son />
      </ThemeContext.Provider>
    </>
  )
}

const App = () => {
  return (
    <>
      this is app
      <Parent />
    </>
  )
}

export default App