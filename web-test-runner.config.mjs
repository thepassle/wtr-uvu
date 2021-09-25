import { defaultReporter } from '@web/test-runner';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  /** Test files to run */
  files: 'test/**/*.test.js',

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },
  testFramework: { path: './uvu.js' },
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
  ]
});
