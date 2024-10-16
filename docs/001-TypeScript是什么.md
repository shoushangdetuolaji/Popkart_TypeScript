---
typora-root-url: ./img
---

# TypeScript是什么

TypeScript 是一种基于JavaScript构建的强类型编程语言， 是带有类型语法的JavaScript

也就是说 JavaScript的超集，JS能做的TS都能，且有类型支持

| JavaScript | 运行时才校验类型 |
| ---------- | ---------------- |
| TypeScript | 编译时就校验类型 |

# TypeScript带来的好处

## 1.类型检查提前避免错误

静态类型检查有助于我们提前发现错误

```JS
function arrToStr(arr) {
    return arr.join(',')
}

arrToStr('123') // Uncaught TypeError: arr.join is not a function
```

JS在代码实际运行时才能发现错误，时机晚

TypeScript可以在我们编写代码时就能提前发现错误，时机早

![](.\001.png) 



## 2.代码自动补全提升开发体验

开发过程中的代码提示可以很大程度上提升我们的开发效率