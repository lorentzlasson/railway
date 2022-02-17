type Success<S> = { readonly _type: 'success'; readonly value: S }
type Failure<F> = { readonly _type: 'failure'; readonly value: F }

export type Result<S, F> = Success<S> | Failure<F>

export const success = <S, F>(value: S): Result<S, F> => ({
  _type: 'success',
  value,
})

export const failure = <S, F>(value: F): Result<S, F> => ({
  _type: 'failure',
  value,
})

export const isSuccess = <S>(r: Result<S, unknown>): r is Success<S> =>
  r._type === 'success'

export const value = <S, F>({ value: v }: Result<S, F>): S | F => v

export const toString = <S, F>(r: Result<S, F>): string =>
  `${isSuccess(r) ? 'SUCCESS' : 'FAILURE'}: ${JSON.stringify(value(r))}`

export const map =
  <S, S2, F>(f: (s: S) => S2) =>
  (r: Result<S, F>): Result<S2, F> => {
    if (isSuccess(r)) return success(f(value(r)))
    return r
  }

export const andThen =
  <S, S2, F>(f: (s: S) => Result<S2, F>) =>
  (r: Result<S, F>): Result<S2, F> => {
    if (isSuccess(r)) return f(value(r))
    return r
  }

export const tee =
  <S, F>(f: (s: S) => void) =>
  (r: Result<S, F>): Result<S, F> => {
    if (isSuccess(r)) f(value(r))
    return r
  }

export const match =
  <S, S2, F, F2>(sF: (s: S) => S2, fF: (f: F) => F2) =>
  (r: Result<S, F>): S2 | F2 => {
    if (isSuccess(r)) return sF(value(r))
    return fF(value(r))
  }
