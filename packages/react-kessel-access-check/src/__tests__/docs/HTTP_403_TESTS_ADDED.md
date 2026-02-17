# HTTP 403 Forbidden Tests Added to Phase 1

**Date:** 2026-02-17
**Status:** Complete ✅
**Tests Added:** 4

---

## Summary

Added HTTP 403 (Forbidden) integration tests to Phase 1 test suite. These tests complement the existing HTTP 401 (Unauthorized) tests and validate the SDK's handling of API-level permission errors.

---

## New Tests Added

### 4a. 403 Forbidden Handling (4 tests)

**Location:** `src/__tests__/integration/critical-scenarios.test.tsx`

#### Test 1: Single Check 403 Error
```typescript
it('should handle 403 Forbidden with clear error message', async () => {
  server.use(errorHandlers.forbidden);

  // Expects: error.code === 403
  // Expects: error.message contains "Forbidden" and "Insufficient permissions"
  // Expects: data === undefined
});
```

#### Test 2: Bulk Check 403 Error
```typescript
it('should handle 403 on bulk check', async () => {
  server.use(errorHandlers.forbiddenBulk);

  // Tests bulk endpoint returns 403 correctly
});
```

#### Test 3: Distinguish 403 from allowed=false
```typescript
it('should distinguish 403 forbidden from allowed=false', async () => {
  // Test 403: Returns error, no data
  // Test allowed=false: Returns data with allowed: false, no error

  // Documents important distinction:
  // - HTTP 403: API-level denial (can't use the API)
  // - allowed=false: Resource-level denial (can use API, check denied)
});
```

#### Test 4: Consistent Error Structure
```typescript
it('should return consistent error structure for 403', async () => {
  // Validates error has: code, message, details
  // Ensures consistency with other HTTP errors
});
```

---

## Infrastructure Updates

### New MSW Handler

**File:** `src/api-mocks/handlers/error-handlers.ts`

Added `forbiddenBulk` handler:
```typescript
forbiddenBulk: http.post('/api/kessel/v1beta2/checkselfbulk', () => {
  return HttpResponse.json(
    {
      code: 403,
      message: 'Forbidden: Insufficient permissions',
      details: []
    },
    { status: 403 }
  );
}),
```

**Note:** Single endpoint handler (`forbidden`) already existed from initial Phase 1 implementation.

---

## Important Distinction: 403 vs 401 vs allowed=false

### HTTP 401 Unauthorized
- **Meaning:** User not authenticated
- **Cause:** Missing or expired JWT token
- **Response:** `error: { code: 401, ... }`, `data: undefined`
- **Action:** Redirect to login

### HTTP 403 Forbidden
- **Meaning:** User authenticated but lacks API access
- **Cause:** User doesn't have permission to use the API itself
- **Response:** `error: { code: 403, ... }`, `data: undefined`
- **Action:** Show "Access Denied" message

### allowed=false
- **Meaning:** API call succeeded, but specific permission check denied
- **Cause:** User can use API but doesn't have permission for this specific resource
- **Response:** `data: { allowed: false, resource: ... }`, `error: undefined`
- **Action:** Hide/disable UI element for that resource

### Example Scenarios

**401 Example:**
```
User's session expired → 401 → Redirect to login
```

**403 Example:**
```
User isn't in "api-users" group → 403 → "You don't have access to this API"
```

**allowed=false Example:**
```
User checking "can I delete workspace-123?" → allowed=false → Hide delete button
```

---

## Test Results

### Before Adding 403 Tests
```
Total Tests: 54
- Unit: 36
- Integration: 18
```

### After Adding 403 Tests
```
Total Tests: 58 ✅
- Unit: 36
- Integration: 22
  - Empty array handling: 2
  - Missing reporter validation: 3
  - Component unmount cleanup: 2
  - 401 unauthorized: 3
  - 403 forbidden: 4 (NEW)
  - Invalid JSON: 3
  - XSS/injection security: 5
```

**All tests passing:** 58/58 ✅

---

## Why This Matters

### Better Error Coverage
- Now testing both major auth/permission error codes (401, 403)
- Complete coverage of "access denied" scenarios
- Validates SDK error handling consistency

### Documentation Value
- Test #3 explicitly documents the 403 vs allowed=false distinction
- Serves as living documentation for SDK consumers
- Prevents developer confusion about permission errors

### Real-World Scenarios
- Some backends return 403 for API-level permission failures
- SDK must handle both 401 and 403 gracefully
- Tests validate both paths work correctly

---

## Verification

**Run tests:**
```bash
npx nx test react-kessel-access-check --testPathPattern=403
```

**Expected output:**
```
PASS src/__tests__/integration/critical-scenarios.test.tsx
  4a. 403 Forbidden Handling
    ✓ should handle 403 Forbidden with clear error message
    ✓ should handle 403 on bulk check
    ✓ should distinguish 403 forbidden from allowed=false
    ✓ should return consistent error structure for 403
```

---

## Files Modified

### Tests
- ✅ `src/__tests__/integration/critical-scenarios.test.tsx`
  - Added 4 new tests
  - +130 lines

### Handlers
- ✅ `src/api-mocks/handlers/error-handlers.ts`
  - Added `forbiddenBulk` handler
  - +14 lines

### Documentation
- ✅ `PHASE_1_TEST_RESULTS.md` - Updated test counts
- ✅ `PHASE_1_COMPLETE.md` - Updated metrics
- ✅ `HTTP_403_TESTS_ADDED.md` - This document

---

## Integration with Phase 1

These 403 tests are a natural extension of Phase 1's critical scenarios:

**Original Phase 1 Scope:**
- Critical error handling (401, network errors, invalid JSON)
- Security validation (XSS, injection)
- Component lifecycle
- Common mistakes

**403 Tests Fit Because:**
- ✅ Part of critical error handling (auth/permission errors)
- ✅ Closely related to 401 tests
- ✅ Same test infrastructure (MSW handlers)
- ✅ No new dependencies or patterns
- ✅ Discovered gap during Phase 1 work

**Decision:** Include in Phase 1 commit rather than separate PR.

---

## Next Steps

### Immediate
- [x] Tests written and passing
- [x] MSW handler added
- [x] Documentation updated
- [ ] Include in Phase 1 git commit

### Future (Phase 2+)
- [ ] Test other HTTP error codes (404, 429, 503)
- [ ] Test error recovery flows
- [ ] Test error message customization

---

**Status:** Ready to commit ✅

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
