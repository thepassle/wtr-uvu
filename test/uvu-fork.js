globalThis.UVU_QUEUE = [[]];

let hrtime = (now = Date.now()) => () => (Date.now() - now).toFixed(2) + 'ms';
const into = (ctx, key) => (name, handler) => ctx[key].push({ name, handler });
const hook = (ctx, key) => handler => ctx[key].push(handler);
const context = (state) => ({ tests:[], before:[], after:[], bEach:[], aEach:[], only:[], skips:0, state });

async function startTestRunner(ctx, name, renderer) {
	let { only, tests, before, after, bEach, aEach, state } = ctx;
	let hook, test, arr = only.length ? only : tests;
  const resultTemplate = {
    name: '',
    passed: true,
    skipped: false,
    duration: '',
    error: false
  }

  const testSuiteResult = {
    name: state.__suite__,
    suites: [],
    tests: []
  }

	try {
		for (hook of before) await hook(state);

		for (test of arr) {
      const result = {...resultTemplate};
      result.name = test.name;
      const time = hrtime();
			try {
				for (hook of bEach) await hook(state);
        
				const { skipped } = (await test.handler(state)) || {};
        result.duration = time();
        result.skipped = !!skipped;

				for (hook of aEach) await hook(state);
			} catch (err) {
        result.passed = false;
        for (hook of aEach) await hook(state);
        
        result.error = {
          stack: err.stack,
          actual: err.actual,
          expects: err.expects,
          operator: err.operator,
          message: err.message,
          details: err.details,
          generated: err.generated,
        }
			} finally {
        renderer?.(result);
        testSuiteResult.tests.push(result);
      }
		}
	} finally {
		for (hook of after) await hook(state);

    return testSuiteResult;
	}
}

function setup(ctx, name = '') {
	ctx.state.__test__ = '';
	ctx.state.__suite__ = name;

	const test = into(ctx, 'tests');
  
	test.before = hook(ctx, 'before');
	test.before.each = hook(ctx, 'bEach');
	test.after = hook(ctx, 'after');
	test.after.each = hook(ctx, 'aEach');
	test.only = into(ctx, 'only');
	test.skip = (name) => { 
    ctx.tests.push({ handler: () => ({skipped: true}), name});
  };
	test.queue = () => {
		let copy = { ...ctx };
		let run = startTestRunner.bind(0, copy, name);
		Object.assign(ctx, context(copy.state));
		UVU_QUEUE[0].push(run);
	};
	return test;
}

export const suite = (name = '', state = {}) => setup(context(state), name);
export const test = suite();

export async function exec({renderer}) {
	let timer = hrtime();
	let totalTests=0, skippedTests=0, failedTests=0, errors=[];
  let hasErrored = false;

  const groupResults = [];

	for (let group of UVU_QUEUE) {

		for (let startTestRunner of group) {

      const testSuiteResult = await startTestRunner(renderer);
      groupResults.push(testSuiteResult);

      totalTests += testSuiteResult.tests.length;
      skippedTests += testSuiteResult.tests.filter(test => test.skipped).length;
      errors = testSuiteResult.tests.filter(test => test.error).map(test => test.error);
      failedTests += testSuiteResult.tests.filter(test => test.error).length;
      
      if(!hasErrored) {
        hasErrored = !testSuiteResult.tests.some(test => test.error);
      }
		}
	}

  return {
    status: 'FINISHED',
    totalTests,
    skippedTests,
    failedTests,
    duration: timer(),
    passed: hasErrored,
    errors,
    testResults: {
      name: '',
      suites: [],
      tests: groupResults,
    },
  }
}