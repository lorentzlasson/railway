import { pipe } from 'remeda'

import { Result, map, tee, andThen as step, success, failure, match } from '.'

const db: Record<number, string> = { 13: 'supersecretdata' }

type Payload = {
  foo: string
  user: string
  id: number
}

type Payload2 = Payload & {
  retrieved: string
}

const validate = (x: Payload): Result<Payload, string> => {
  if (x.foo !== 'bar') {
    return failure('input must have key foo with value bar')
  }
  return success(x)
}

const authorize = (x: Payload): Result<Payload, string> => {
  const authorizedUser = 'Bob'

  if (x.user !== authorizedUser) {
    return failure('user is not authorized')
  }
  return success(x)
}

const retrieve = (x: Payload): Result<Payload2, string> => {
  const value = db[x.id]

  if (!value) {
    return failure(`${x.id} not found`)
  }

  return success({
    retrieved: value,
    ...x,
  })
}

const sendEmail = ({ user }: Payload2): void => {
  console.log(`emailing ${user}...`)
}

const format = ({ retrieved }: Payload2): string =>
  `${retrieved} was retrieved from the database`

const handleSuccess = (success: string): string =>
  `responding with status 200 and "${success}"`

const handleFail = (failure: string): string =>
  `responding with status 4xx and "${failure}"`

const railway = (input: Payload) =>
  pipe(
    input,
    validate,
    step(authorize),
    step(retrieve),
    tee(sendEmail),
    map(format),
    match(handleSuccess, handleFail),
  )

test('succeeding', () => {
  const input = {
    foo: 'bar',
    user: 'Bob',
    id: 13,
  }

  console.log = jest.fn()

  const output = railway(input)

  expect(console.log).toHaveBeenCalledWith('emailing Bob...')
  expect(output).toBe(
    'responding with status 200 and "supersecretdata was retrieved from the database"',
  )
})

test('failing validation', () => {
  const input = {
    foo: 'baz',
    user: 'Bob',
    id: 13,
  }

  const output = railway(input)

  expect(output).toBe(
    'responding with status 4xx and "input must have key foo with value bar"',
  )
})

test('failing authorization', () => {
  const input = {
    foo: 'bar',
    user: 'Alice',
    id: 13,
  }

  const output = railway(input)

  expect(output).toBe('responding with status 4xx and "user is not authorized"')
})

test('failing retrieval', () => {
  const input = {
    foo: 'bar',
    user: 'Bob',
    id: 12,
  }

  const output = railway(input)

  expect(output).toBe('responding with status 4xx and "12 not found"')
})
