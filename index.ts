type Success<S> = readonly ['success', S]
type Failure<F> = readonly ['failure', F]

export type Result<S, F> = Success<S> | Failure<F>

export const success = <S, F>(value: S): Result<S, F> => ['success', value]
export const failure = <S, F>(value: F): Result<S, F> => ['failure', value]

export const isSuccess = <S>(r: Result<S, unknown>): r is Success<S> =>
  r[0] === 'success'

export const value = <S, F>([, v]: Result<S, F>): S | F => v

export const toString = <S, F>(r: Result<S, F>): string =>
  `${isSuccess(r) ? 'SUCCESS' : 'FAILURE'}: ${JSON.stringify(value(r))}`

export const map =
  <S, S2, F>(f: (s: S) => S2) =>
  (r: Result<S, F>): Result<S2, F> =>
    isSuccess(r) ? success(f(value(r))) : r

export const andThen =
  <S, S2, F>(f: (s: S) => Result<S2, F>) =>
  (r: Result<S, F>): Result<S2, F> =>
    isSuccess(r) ? f(value(r)) : r

export const andThenP =
  <S, S2, F>(f: (s: S) => Promise<Result<S2, F>>) =>
  (rP: Promise<Result<S, F>>): Promise<Result<S2, F>> =>
    rP.then((r) => (isSuccess(r) ? f(value(r)) : r))

export const andThenFromPromise =
  <S, S2, F>(f: (s: S) => Result<S2, F>) =>
  (rP: Promise<Result<S, F>>): Promise<Result<S2, F>> =>
    rP.then((r) => (isSuccess(r) ? f(value(r)) : r))

export const tee =
  <S, F>(f: (s: S) => void) =>
  (r: Result<S, F>): Result<S, F> => {
    if (isSuccess(r)) f(value(r))
    return r
  }

export const match =
  <S, S2, F, F2>(sF: (s: S) => S2, fF: (f: F) => F2) =>
  (r: Result<S, F>): S2 | F2 =>
    isSuccess(r) ? sF(value(r)) : fF(value(r))
