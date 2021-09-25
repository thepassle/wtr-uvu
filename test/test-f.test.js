import { test } from './uvu-fork.js';
import * as assert from 'uvu/assert';

const sum = (a,b) => a+b;

test('sum 1 - fails', () => {
  assert.is(sum(1, 2), 1);
	assert.is(sum(-1, -2), -3);
	assert.is(sum(-1, 1), 0);
  console.log('test 1')
});

test('sum 2', () => {
	assert.is(sum(1, 2), 3);
	assert.is(sum(-1, -2), -3);
	assert.is(sum(-1, 1), 0);
  console.log('test 2')
});

test('sum 2', () => {
	assert.is(sum(1, 2), 3);
	assert.is(sum(-1, -2), -3);
	assert.is(sum(-1, 1), 0);
  console.log('test 2')
});

test.skip('sum 3', () => {
	assert.is(sum(1, 2), 3);
	assert.is(sum(-1, -2), -3);
	assert.is(sum(-1, 1), 0);
  console.log('test 3')
});

// debugger;
// test.run();
export default test
