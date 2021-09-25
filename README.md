# wtr uvu integration

Run with `npm run test -- --watch`, press `D` in terminal, check browser logs. You should see:

```json
{
    "status": "FINISHED",
    "total": 2,
    "passed": false,
    "errors": [],
    "testResults": [],
    "skips": 0,
    "code": 0,
    "duration": "2.00ms"
}
```

(1 test should have failed, 1 test should have passed)

## TODOS:
- correctly collect and gather groups/suites/suiteResults
- The default reporter seems to always output 0 tests passed, and 1 failed, figure out why
- Figure out how tests are skipped, and to mark the testResult as being skipped