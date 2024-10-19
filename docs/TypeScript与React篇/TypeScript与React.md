---
typora-root-url: ../img
---

# 环境搭建

React和TypeScript配合使用的重点集中在 `和存储数据/状态有关的Hook函数` 以及 `组件接口(Prop)` 的位置，这些地方最需要数据类型校验

![](050.png)

## 使用Vite创建项目

```BASH
npm create vite@latest react-ts-pro -- --template react-ts
```

# Hooks与TypeScript

## useState

### 1.简单场景

> 简单场景下，尤其明确知道状态初始值的场景，可以充分利用TS的自动推断机制，不用特殊编写类型注解，运行良好

```ts
const [val, toggle] = React.useState(false)

// `val` 会被自动推断为`布尔类型`
// `toggle` 方法调用时只能传入`布尔类型`

const [ user, setUser ] = React.useState({ name:'jack'})

// `user` 会被自动推断为对象类型 `{ name:string }`
// `setUser` 方法调用时只能传入类型 `{ name:string }`
```

### 2.复杂场景

> 当不能根据初始值进行自动推断时，比如字段中有可选项或者字段的类型存在联合类型的情况，自动推断无法满足要求，useState也支持通过`泛型参数`指定初始参数类型以及setter函数的入参类型，我们可以先定义类型，然后通过泛型参数传入

```ts
type User = {
  name: string
  age?: number
}

const [user, setUser] = React.useState<User>({
  name: 'jack',
  age: 18
})

// 执行setUser，这里newUser对象只能是User类型
setUser(newUser)
```

### 3.没有具体默认值

> 实际开发时，有些时候useState没有初始值，开发者一般会把初始值设置为null，按照泛型的写法是不能通过类型校验的，此时可以通过`联合类型`解决

```ts
type User = {
  name: string
  age: number
}

// 会类型错误，因为null并不能分配给User类型
const [user, setUser] = React.useState<User>(null)

// user状态变量的类型为 User | null
const [user, setUser] = React.useState<User | null>(null)
```

### 4.小练习

**需求说明**

> **维护一个用户对象数组列表，然后渲染到页面中，列表项中的每一个对象都包含三个字段，id、username、以及framework，其中id为** `**string**` **类型，username为**`**string**`**类型，framework为联合类型** `**Vue | React**` **，一开始列表中有俩项，点击add按钮添加一个新项**

![](/051.png)

```ts
import { useState } from 'react'

// 准备数据列表
const USERLIST: User[] = [
  {
    id: '1001',
    username: 'jack',
    framework: 'React',
  },
  {
    id: '1002',
    username: 'john',
    framework: 'Vue',
  },
]

type User = {
  id: string
  username: string
  framework: 'Vue' | 'React'
}

// 通过useState维护状态列表，控制页面显示
const App = () => {
  const [userList, setUserList] = useState<User[]>(USERLIST)
  const addHandler = () => {
    setUserList([
      ...userList,
      {
        id: '1003',
        username: 'jike',
        framework: 'Vue',
      },
    ])
  }
  return (
    <>
      <ul>
        {userList.map((item) => (
          <li key={item.id}>
            {item.username} - {item.framework}
          </li>
        ))}
      </ul>
      <button onClick={addHandler}>add</button>
    </>
  )
}

export default App
```

## useRef

> 在TypeScript的环境下，`useRef` 函数返回一个`只读` 或者 `可变` 的引用，只读的场景常见于获取真实dom，可变的场景，常见于缓存一些数据，下面分俩种情况说明

![](/052.png)

### 1.获取dom

> 获取DOM时，通过泛型参数指定类型

```ts
import { useEffect, useRef } from 'react'

const App = () => {
  // 将来ref对象的current属性中想要存入哪个dom元素
  // 就把它的元素类型传入泛型参数的位置
  
  const divRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // current属性的类型为只读类型 HTMLDivElement 只可访问，不可修改
    console.log(divRef.current)
  }, [])
  
  return (
    <>
      this is app
      <div ref={divRef}>this is div</div>
    </>
  )
}

export default App
```

### 2.稳定引用存储器

> 当做为可变存储容器使用的时候，可以通过`泛型参数`指定容器存入的数据类型, 初始值一般为null，可以通过联合类型做指定，如下面的例子：

```ts
function App(){
  // 通过泛型指定Ref类型
  const timerRef = useRef<number | null>(null)
  useEffect(()=>{
    timerRef.current = window.setInterval(()=>{
      console.log('定时器开启')
    },1000)
    
    return ()=>{
        // TS类型守卫
    	timeRef.current && clearInterval(timerRef.current)
    }
  })
  return <div> this is app</div>
}
```

### 3.小练习

**需求说明**

**在页面渲染完毕之后，实现Input输入框的自动聚焦**

```ts
import { useEffect, useRef } from 'react'

const App = () => {
  // 1. 获取dom元素
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 2. useEffect + dom.focus()
  useEffect(() => {
    // 类型守卫
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  return (
    <>
      <input type="text" ref={inputRef}/>
    </>
  )
}

export default App
```



注意：有空值可能性的场景，通常都需要添加类型守卫，避免类型错误

## useReducer

![](/053.png)

### 1.基础使用

useReducer在和TypeScript配合使用的时候，重点在于定义好状态数据**State的类型**以及操作描述**Action对象**的类型，然后当成类型参数传递给Reducer函数

1. 定义State类型
2. 定义Action对象类型（通常通过联合类型来做）
3. 把类型State和类型Action传给泛型函数Reducer注解给reducer函数

看一个使用useReducer实现点击计数的小案例：

```ts
import { Reducer, useReducer} from 'react'

// 1. 定义 State类型
type State = number

// 2. 定义Action类型
type Action = {
  type: 'INCREASE'
} | {
  type: 'DECREASE'
}

// 3. 传递Reducer泛型函数注解给reducer函数
const reducer: Reducer<State, Action> = (state, action) => {
  switch(action.type) {
    case 'INCREASE':
      return state + 1
    case 'DECREASE':
      return state - 1
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, 0)
  return (
    <>
      <div>
        <button
          onClick={() => {
            dispatch({
              type: 'DECREASE'
            })
          }}>
            -
      	</button>
        {state}
        <button
          onClick={() => {
            dispatch({
              type: 'INCREASE'
            })
          }}>
            +
      	</button>
      </div>
    </>
  )
}

export default App
```



### 2.添加载荷payload

我们在dispatch提交action对象的时候有时候除了要传递type字段之外，还需要携带载荷操作，可以增加payload字段来做，在reducer函数内部返回新状态时，payload可以作为修改参数使用

```ts
import { Reducer, useReducer } from 'react'

// 定义State类型
type State = number

// 定义Action类型 通常通过联合类型做
type Action =
  | {
      type: 'INCREASE'
    }
  | {
      type: 'DECREASE'
    }
  | {
      type: 'UPDATE'
      payload: number
    }

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'INCREASE':
      return state + 1

    case 'DECREASE':
      return state - 1

    case 'UPDATE':
      return action.payload
  }
}

export default function Counter() {
  // 限制reducer函数初始值,第二个参数的类型必须满足State
  const [state, dispatch] = useReducer(reducer, 0)

  return (
    <>
      <p>Count: {state}</p>
      <button
        onClick={() => {
          dispatch({ type: 'INCREASE' })
        }}>
        +
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'DECREASE' })
        }}>
        -
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'UPDATE', payload: 100 })
        }}>
        update
      </button>
    </>
  )
}
```



### 3.小练习

**需求说明**

**实现购物车的列表渲染、添加购物车、删除购物车核心功能，要求通过 useReducer 进行状态管理**

![](/054.png)

```ts
import { Reducer, useReducer, useState } from 'react'

// 定义购物车单项类型
type CartItem = {
  id: string
  name: string
  price: number
}

// 定义State类型
type State = {
  cart: CartItem[]
  totalPrice: number
}

// 定义Action类型
type Action =
  | {
      type: 'ADD_CART'
      payload: CartItem
    }
  | {
      type: 'DEL_CART'
      payload: CartItem
    }

// 传入泛型
const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'ADD_CART': {
      return {
        cart: [...state.cart, action.payload],
        totalPrice: [...state.cart, action.payload].reduce(
          (a, c) => a + c.price,
          0
        ),
      }
    }
    case 'DEL_CART': {
      return {
        cart: state.cart.filter((item) => item.id !== action.payload.id),
        totalPrice: state.cart
          .filter((item) => item.id !== action.payload.id)
          .reduce((a, c) => a + c.price, 0),
      }
    }
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, {
    cart: [],
    totalPrice: 0,
  })

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  // 加入购物车
  const addCart = () => {
    dispatch({
      type: 'ADD_CART',
      payload: {
        id: new Date().getTime().toString(),
        name: name,
        price: Number(price),
      },
    })
  }

  // 删除购物车
  const delCart = (item: CartItem) => {
    dispatch({
      type: 'DEL_CART',
      payload: item,
    })
  }

  return (
    <>
      this is app
      <ul>
        {state.cart.map((item) => (
          <li key={item.id}>
            {item.name} - {item.price}
            <span onClick={() => delCart(item)}>x</span>
          </li>
        ))}
      </ul>
      <div>总价:{state.totalPrice}</div>
      <div>
        商品名称：
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        商品单价：
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={addCart}>add</button>
      </div>
    </>
  )
}

export default App
```

## useContext

在React中，`useContext` Hook函数主要用于跨层传递数据，可以`由顶层组件向任意底层组件传递数据` 

![](/055.png)

### 1.基础使用

> reateContext是一个泛型函数，支持通过泛型参数传入类型 `createContext<T>`，限制了通过context机制绑定数据的类型以及从context中获取到的数据类型

![](/056.png)

```ts
import { createContext, useContext } from 'react'

// 定义context数据的类型
type UserContextType = {
  name: string
  age: number
}

// 通过泛型传入类型 （限制初始值的类型）
const UserContext = createContext<UserContextType>({
  name: 'jack',
  age: 18,
})

const Parent = () => {
  return (
    <>
      {/* 上层组件提供数据 (限制数据提供方Provider的value属性类型为 UserContextType)  */}
      <UserContext.Provider
        value={{
          name: 'john',
          age: 28,
        }}>
        <div>i am parent</div>
        <Son />
      </UserContext.Provider>
    </>
  )
}

const Son = () => {
  // 底层组件获取数据（userInfo变量的类型为 UserContextType）
  const userInfo = useContext(UserContext)

  return (
    <div>
      i am son {userInfo.name} {userInfo.age}
    </div>
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
```

### 2.没有具体默认值

> 有时候设置context的时候我们没有明确的默认值，会设置为`null` ，我们可以通过具体类型联合null类型 当成参数传入泛型的位置，这样我们可以既可以在设置默认值的时候传入null, 也可以在后续设置具体值的时候满足要求，需要注意的是- **在使用数据的时候要加上类型守卫，防止context内容为空值**

```tsx
import { createContext } from 'react'

type userContextType = {
   name: string
   age: number
}

const ThemeContext = createContext<userContextType | null>(null)


<div>
      i am son {userInfo?.name} {userInfo?.age}
</div>
```

### 3.小练习

**需求说明**

> **在App中维护一个主题样式的状态数据，通过context机制下发到内部的 Son组件中使用，其中状态数据的可选值有** `**light**` **和** `**dark**` **俩种，当为light时，Son组件显示白底黑字，当为dark时，显示黑底白字**

![](/057.png)

```tsx
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
```

# Component与TypeScript

## 为Props添加基础类型

props作为React组件的参数入口，添加了类型之后可以限制参数输入以及在使用props有良好的类型提示

> 需求：为Button组件设计一个 className prop，让它支持自定义类名传入
>
> ```
> <Button className="test"></Button>
> ```

### 1.使用interface接口实现

```TSX
interface Props {
  className: string
}

export const Button = (props:Props)=>{
  const { className } = props
  return <button className={ className }>Test</button>
}
```

### 2. 使用自定义类型Type实现

```TSX
type Props =  {
  className: string
}

export const Button = (props:Props)=>{
  const { className } = props
  return <button className={ className }>Test</button>
}
```

## 为特殊children属性添加类型

概念：children属性和props中其他的属性不同，它是React系统中内置的，其它属性我们可以自由控制其类型，children属性的类型最好由React内置的类型提供，兼容多种类型

> 需求：通过设置children属性让Button组件支持自定义文案传入
>
> ```
> <Button> click me </Button>
> ```

```ts
type Props = {
  children: React.ReactNode
}

export const Button = (props: Props)=>{
   const { children } = props
   return <button>{ children }</button>
}
```

说明：React.ReactNode是一个React内置的联合类型，包括 `React.ReactElement` 、`string`、`number` `React.ReactFragment` 、`React.ReactPortal` 、`boolean`、 `null` 、`undefined`

## 为事件处理回调添加类型

> 需求：给Button组件增加一个名为 `onClick`的prop参数，在组件内部点击按钮时可以调用onClick prop后面的回调，如下所示
>
> ```
> <Button onClick={ (e)=>console.log(e) }> click me </Button>
> ```

React为事件提供了一个支持泛型的 `MouseEventHandler<T>` 内置类型，支持传入具体的事件元素类型，比如，如果我们想给一个button元素绑定点击事件，可以这样来定义类型

```tsx
interface ButtonProps {
  children: React.ReactNode
  // 要给什么元素绑定事件，就把这个元素的类型当成事件参数传递下来
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

export const Button = (props: ButtonProps) => {
  const { children, onClick } = props
  return <button onClick={ onClick }> {children} </button>
}
```

注意：`MouseEventHandler` 泛型参数一旦传入了具体的元素类型，那当前回调就不能绑定给其它元素

## ComponentProps类型辅助函数

### 1.现在的问题

> 到目前为止，我们的Button组件仅支持`className、children、onClick`三个prop的传入，这三个prop是非常常见的prop, 我们可以把它们称为`默认prop`, 事实上Button组件的功能是基于原生button元素的封装，按钮本身还需要支持很多其它默认的prop，**比如常见的disabled属性**，难道我们要一个一个的补充吗？答案是否定的！

![](/058.png)

### 2. 通过ComponentProps解决

> `ComponentProps` 是一个React内置的类型辅助函数，针对于组件元素，可以提取出组件props的类型，针对一般的HTML元素，可以提取出它默认要支持的所有属性组成的对象类型，比如className、disabled、onClick等等

![](/59.png)

```ts
import { ComponentProps } from 'react'

// 获取元素的所有有效prop 包括button元素常见的 className, onClick, children，disabled等
type ButtonBaseType = ComponentProps<'button'>

const Button = ({ className, onClick, children, ...restProps }: ButtonBaseType) => {
  return (
    <button className={className} onClick={onClick} {...restProps}>
      {children}
    </button>
  )
}

function App() {
  return (
    <div>
      {/* 在Button组件身上可以绑定button元素的所有HTML属性 */}
      <Button>test</Button>
    </div>
  )
}

export default App
```

到这里大家可能会觉得，那ComponentProps辅助类型函数如此强大，还需要我们自己定义prop的类型吗，答案是需要的，接着往下看

### 3.组合自定义Prop和默认属性

> 需求：除了我们上面支持的prop属性，如果此时我们想添加一个 `size` 属性来控制按钮的大小该怎么办？
>
> 解决方案：可以通过`ComponentProps类型辅助函数`和`交叉类型&` 解决

```tsx
import { ComponentProps } from 'react'

// 获取原生button支持的所有属性类型 className / onClick / children / disabled 等
type ButtonBaseProps = ComponentProps<'button'>

// 自定义额外的prop size
type CustomProps = {
  size?: 'small' | 'middle' | 'large'
}

// 二者结合起来形成完整的参数类型
type ButtonProps = ButtonBaseProps & CustomProps

const Button = (props: ButtonProps) => {
  const {
    className,
    onClick,
    children,
    size,
    ...restProps
  } = props
  
  return (
    <button className={`${className}${size}`} onClick={onClick} {...restProps}>
      {children}
    </button>
  )
}

function App() {
  return (
    <div>
      {/* 既支持button默认的所有prop也支持自定义的size */}
      <Button size="small"></Button>
    </div>
  )
}

export default App
```

## 覆盖ComponentProps中的默认属性

> 场景：有些时候使用React提供的类型函数ComponentProps`推断出来的某个prop类型不是我们想要的`，我们需要用自定义的prop类型覆盖掉它默认的,我们拿一个基础的Input输入框组件举例

### 1.不使用ComponentProps

```TSX
type Props = {
  value: string
  onChange?: (value: string) => void
}
const Input = (props: Props) => {
  const { value, onChange } = props
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
```

说明：仅支持value和onChange属性，其它属性不支持，需要一一定义



### 2.使用ComponentProps

```TSX
import { ComponentProps } from 'react'

type InputBaseProps = ComponentProps<'input'>

export const Input = (props: InputBaseProps ) => {
  const { onChange, ...restProps } = props
  return (
    <input
      { ...restProps }
      // 类型“string” 的参数不能赋值给类型 “ChangeEvent<HTMLInputElement>”的参数
      // 我们传递的实参是string, 它要求的是ChangeEvent<HTMLInputElement>
      onChange={(e) => onChange && onChange(e.target.value)}></input>
  )
}

export const App = () => {
  return <Input/>
}
```

说明：内置的 `ComponentProps`辅助类型函数推断出来的onChange的参数是一个比较复杂的 `ChangeEvent<HTMLInputElemnet>` 类型，而我们的e.target.value是更加精确的的string类型，这个问题怎么办呢？

### 3.通过类型覆盖解决问题

> 思路：我们可以把ComponentProps给到我们的默认的onChange属性类型去掉，换成我们自己的
>
> 1. 去掉ComponentProps中默认的类型
> 2. 交叉我们自定义的onChange类型

```tsx
import { ComponentProps } from 'react'

type InputProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  onChange?: (value: string) => void
}

export const Input = ({ onChange, ...rest }: InputProps) => {
  return (
    <input
      {...rest}
      // 类型“string” 的参数不能赋值给类型 “ChangeEvent<HTMLInputElement>”的参数
      onChange={(e) => onChange && onChange(e.target.value)}></input>
  )
}

export const App = () => {
  return <Input/>
}
```

# 小节

1. 组件的props本身是一个对象，所以我们通过 接口interface和 定义类型type 都可以为其标注类型，一旦标记了props对象的类型之后，我们既可以在使用组件时校验prop参数传递的是否正确，同时在组件内部使用props时也会有相应的类型提示

2. children属性作为一个特殊的prop参数，我们需要通过React内置的 React.ReactNode类型为其注解，它支持很多种类型，包括 React.ReactElement 、string、number React.ReactFragment 、React.ReactPortal 、boolean、 null 、undefined 多种类型来满足用户在使用组件时传递过来的模版参数

3. ComponentProps作为一个类型辅助函数，它的场景是简化我们维护多种默认prop的成本，可以通过它一次性的生成包含了所有常用prop的类型，避免我们手动书写。如果我们要设计的prop不再它里面，可以采用交叉类型的方式来实现既支持默认也支持自定义

4. 最后我们在开发的时候偶尔会遇到ComponentProps推断出来的类型不是我们想要的，我们可以通过覆盖的手段用自己的类型覆盖掉它默认的类型

```TSX
type InputProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  onChange?: (value: string) => void
}

// Omit<ComponentProps<'input'>, 'onChange'>  去掉默认的onChange类型
```

