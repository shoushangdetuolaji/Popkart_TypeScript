// 定义类型
type SecondParameter<T extends (...args: any[]) => any> = T extends (
  arg1: any,
  arg2: infer P,
 ...rest: any[]
) => any
 ? P
  : unknown;

// type FirstParameter<T extends (...args: any[]) => any> = T extends (
//   arg1: infer P,
//   ...rest: any[]
// ) => any
//   ? P
//   : unknown

// foo函数满足类型结构
function foo(name: string, age: number): void {
  console.log(`Hello, ${name}. You are ${age} years old.`);
}
// AType计算出最终类型为string
type AType = SecondParameter<typeof foo> // string


// bar函数不满足类型结构
function bar(){}
// BType最终计算得到的类型为unknown
type BType = SecondParameter<typeof bar> // unknown