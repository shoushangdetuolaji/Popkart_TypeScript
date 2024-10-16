interface Person {
  name: string
  gender: string
}

function getPersonInfo(person: Person, key: string): string {
  return person[key] // Ok
}

const p = { name: 'jack', gender: '男' }

getPersonInfo(p, 'name') // Ok
getPersonInfo(p, 'height') // 类型校验通过，但是取不到值