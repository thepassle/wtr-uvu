const timer = (now = Date.now()) => () => (Date.now() - now).toFixed(2) + 'ms';

async function run(suite, {renderer}) {
  const { name, only, tests, before, after, beforeEach, afterEach } = suite;
  const testsToRun = only.length ? only : tests;

  const testSuiteResult = {
    name,
    tests: []
  }

  try {
    await before?.();

    for (const test of testsToRun) {
      const testResult = {
        name: test.name,
        passed: true,
        skipped: false,
        duration: '',
        error: false  
      }

      const time = timer();
      try {
        await beforeEach?.();
        
        const { skipped } = (await test.handler()) || {};
        testResult.duration = time();
        testResult.skipped = !!skipped;

        await afterEach?.();
      } catch (err) {
        testResult.passed = false;
        testResult.duration = time();

        await afterEach?.();
        
        /** @TODO Make sure we can access error.stack, message, actual, etc correctly on this */
        /** @TODO this will currently only work with uvu/assert, because the assert error has an `.expects` property */
        testResult.error = {...err, expected: err.expects};
      } finally {
        renderer?.(testResult);
        testSuiteResult.tests.push(testResult);
      }
    }
  } finally {
    await after?.();

    return testSuiteResult;
  }
}

const queue = [];

const createSuite = (name = '') => {
  const suite = { name, tests:[], only:[] };
  
  const test = (name, handler) => {
    suite.tests.push({name, handler});
  }

  test.before = handler => { suite.before = handler; };
  test.beforeEach = handler => { suite.beforeEach = handler; };
  test.after = handler => { suite.after = handler; };
  test.afterEach = handler => { suite.afterEach = handler; };
  test.only = handler => { suite.only.push(handler); };
  test.skip = name => {
    suite.tests.push({handler: () => ({skipped: true}), name});
  }

  queue.push(suite);

  return test;
}

export const suite = createSuite;
export const test = createSuite();

export async function executeTests({ renderer }) {
  const time = timer();
  const results = [];
  let total = 0;
  let skipped = 0;
  let failed = 0;

  for(const suite of queue) {
    const suiteResult = await run(suite, {renderer});
    results.push(suiteResult);

    for(const test of suiteResult.tests) {
      total++;
      if(test.skipped) skipped++;
      if(test.error) failed++;
    }
  }

  return { 
    status: 'FINISHED',
    total,
    skipped,
    failed,
    passed: failed < 1,
    duration: time(),
    results,

    /** @TODO map `results` to what WTR expects */
    // testResults: {
    //   name: '',
    //   suites: suiteResults,
    // }
  }
}


const suite2 = suite('suite 2');
suite2('hello foo', () => {
  console.log('suite 2');
});

test('hello', () => {
  console.log('test 1');
});

executeTests({
  renderer: (testResult) => {
    const report = document.createElement('test-report');
    report.testResult = testResult;
    document.body.appendChild(report);
  }
}).then(r => {
  console.log(r);
});

