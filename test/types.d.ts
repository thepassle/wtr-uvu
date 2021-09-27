
type VoidOrPromise = void | Promise<void>

type Callback = () => VoidOrPromise

type SkipFn = () => ({skipped: boolean} | Promise<{skipped: boolean}>)
type TestFn = () => VoidOrPromise

export interface TestObject {
  name: string,
  handler: SkipFn | TestFn
}

export interface Suite {
  name: string,
  tests: TestObject[],
  only?: TestObject[],
  before?: Callback,
  beforeEach?: Callback,
  after?: Callback,
  afterEach?: Callback,
}

type Hook = (cb: Callback) => void

export interface Test {
  (name: string, handler: TestFn): void,
  before: Hook,
  beforeEach: Hook,
  after: Hook,
  afterEach: Hook,
  only: (name: string, handler: TestFn) => void,
  skip: (name: string, handler: TestFn) => void,
}

export interface ExecutionOptions {
  renderer: Renderer
}

export interface Renderer {
  /** Runs before the suite starts, can be used for set up */
  suiteStart: (args: {name: string, only: TestObject[], tests: TestObject[]}) => void,
  /** Runs after every ran test, whether it's skipped, passed, or failed */
  renderTest: (TestResult) => void,
  /** Runs after the entire suite has ran */
  suiteEnd: (TestSuiteResult) => void
}

export interface Report {
  status: 'FINISHED',
  total: number,
  skipped: number,
  failed: number,
  passed: boolean,
  duration: string,
  results: TestSuiteResult[]
}

export interface TestSuiteResult {
  name: string,
  tests: TestResult[],
}

export interface TestResult {
  name: string,
  passed: boolean,
  skipped: boolean,
  duration: string,
  error: false | Error
}

export interface Error {

}