globalThis.UVU_QUEUE = [[]];

let hrtime = (now = Date.now()) => () => (Date.now() - now).toFixed(2) + 'ms';
const into = (ctx, key) => (name, handler) => ctx[key].push({ name, handler });
const hook = (ctx, key) => handler => ctx[key].push(handler);
const context = (state) => ({ tests:[], before:[], after:[], bEach:[], aEach:[], only:[], skips:0, state });

async function runner(ctx) {
	let { only, tests, before, after, bEach, aEach, state } = ctx;
	let hook, test, arr = only.length ? only : tests;
	let num=0, errors=[], total=arr.length;

	try {
		for (hook of before) await hook(state);

		for (test of arr) {
			state.__test__ = test.name;
			try {
				for (hook of bEach) await hook(state);
				await test.handler(state);
				for (hook of aEach) await hook(state);
				num++;
			} catch (err) {
				for (hook of aEach) await hook(state);

        errors.push({
          stack: err.stack,
          actual: err.actual,
          expects: err.expects,
          operator: err.operator,
          message: err.message,
          details: err.details,
          generated: err.generated,
        })
			}
		}
	} finally {
		state.__test__ = '';
		for (hook of after) await hook(state);
		let skipped = (only.length ? tests.length : 0) + ctx.skips;
    // @TODO can we give back more valuable information? instead of numbers?
		return [errors || true, num, skipped, total];
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
	test.skip = () => { ctx.skips++ };
	test.run = () => {
		let copy = { ...ctx };
		let run = runner.bind(0, copy, name);
		Object.assign(ctx, context(copy.state));
		UVU_QUEUE[0].push(run);
	};
	return test;
}

export const suite = (name = '', state = {}) => setup(context(state), name);
export const test = suite();

export async function exec() {
	let timer = hrtime();
	let total=0, skips=0, code=0, amountOfErrors=0, errors=[];

  // @TODO currently everything gets pushed to groupResults, fix that
  let groupIndex = 0;
  const groupResults = [];

	for (let group of UVU_QUEUE) {
    groupIndex++;
    let testIndex = 0;
    const testResults = [];
		for (let test of group) {
      testIndex++;
      const testResult = {
        name: '',
        passed: false,
        // @TODO: figure out how skips work
        skipped: false,
        duration: '',
        error: {}
      }

      let time = hrtime();
      let [errs, ran, skip, max] = await test();
      testResult.duration = time();
      testResult.error = errs[0];

      total += max; skips += skip;


      if (errs.length) {
        errs?.forEach(e => { errors.push(e)});
        // Errors object that contains the expects/actual/message/details etc
        amountOfErrors += 1;
      }
      testResults.push(testResult);
		}
    groupResults.push(testResults);
	}

  return {
    status: 'FINISHED',
    total,
    passed: amountOfErrors < 1,
    errors: errors.map(e => ({
      message: e.message,
      name: '',
      stack: e.stack,
      expected: e.expects,
      actual: e.actual,
    })),
    testResults: {
      name: '',
      suites: [],
      tests: groupResults,
    },
    skips,
    code,
    duration: timer()
  }
}