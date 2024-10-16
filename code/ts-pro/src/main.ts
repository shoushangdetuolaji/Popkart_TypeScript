type NumberOrString = number | string
type OnlyNumber = Exclude<NumberOrString, string>

const numberValue: OnlyNumber = 123