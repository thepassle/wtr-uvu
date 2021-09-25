import {
  getConfig,
  sessionStarted,
  sessionFinished,
  sessionFailed,
} from '@web/test-runner-core/browser/session.js';
import { exec } from './test/uvu-fork.js';


(async () => {
  // notify the test runner that we're alive

  // fetch the config for this test run, this will tell you which file we're testing
  const { testFile, watch, debug, testFrameworkConfig } = await getConfig();

  sessionStarted();

  // load the test file as an es module
  
  let test;
  const failedImports = [];
  try {
    test = (await import(new URL(testFile, document.baseURI).href)).default; 
    test.run();
  } catch(error) {
    console.log('Failed to import', error);
    failedImports.push({ file: testFile, error: { message: error.message, stack: error.stack } });
  }


  try {
    // run the actual tests, this is what you need to implement
    const testResults = await exec();
    // notify tests run finished
    sessionFinished({
      ...testResults,
      passed: failedImports.length === 0 && !!testResults.passed,
      failedImports,
      // @TODO format to what wtr expects
      // testResults,
    });
  } catch (error) {
    console.log('Error executing tests', error);
    // notify an error occurred
    sessionFailed(error);
    return;
  }
})();