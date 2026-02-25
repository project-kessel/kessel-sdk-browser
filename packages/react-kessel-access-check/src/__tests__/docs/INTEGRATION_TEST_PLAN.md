# Integration Test Coverage Plan
## Kessel SDK Browser - React Access Check

**Date:** 2026-02-17
**Version:** 1.0
**Status:** Draft for Review

---

## Executive Summary

This document outlines a comprehensive integration test plan for the `@project-kessel/react-kessel-access-check` SDK. The plan identifies coverage gaps, common developer pitfalls, potential security concerns, and quality-of-life issues that should be addressed through integration testing.

### Current Test Coverage Assessment

**Strengths:**
- Good unit test coverage for individual components (hooks, API client, transformers)
- MSW (Mock Service Worker) already in use for some tests
- Basic happy path scenarios covered
- Bulk request chunking well tested

**Gaps:**
- Limited end-to-end integration scenarios
- Missing tests for common developer mistakes
- Insufficient edge case coverage
- No tests for component lifecycle edge cases
- Limited error recovery scenario testing
- Missing tests for React-specific behavior (re-renders, concurrent updates, etc.)

---

## 1. Happy Path Integration Tests

### 1.1 Complete User Flows

**Test: Single Check Flow**
- **Scenario:** User mounts component → hook executes → data loads → component renders result
- **Coverage:** End-to-end single resource permission check
- **Current Status:** ✅ Covered in `hooks.test.tsx`
- **Recommendation:** Expand with real component integration test

**Test: Bulk Check Flow - Same Relation**
- **Scenario:** User checks multiple resources with same permission
- **Coverage:** Bulk API call, chunking, result aggregation
- **Current Status:** ✅ Covered in `hooks.test.tsx` and `hooks.bulkConfig.test.tsx`
- **Recommendation:** Add real-world scenario with 100+ resources

**Test: Bulk Check Flow - Nested Relations**
- **Scenario:** User checks different permissions on different resources
- **Coverage:** Mixed permission checks in single request
- **Current Status:** ✅ Covered in `hooks.test.tsx`
- **Recommendation:** Add test with realistic UI interaction (e.g., permissions matrix)

**Test: Consistency Token Chaining**
- **Scenario:** User performs action → gets token → uses token in next check
- **Coverage:** Read-your-writes consistency flow
- **Current Status:** ⚠️ Partially covered (consistency options tested, but not chaining)
- **Recommendation:** **ADD** - Test token preservation across multiple checks

### 1.2 Provider Configuration

**Test: Multiple Provider Configurations**
- **Scenario:** Different parts of app use different API endpoints
- **Coverage:** Provider nesting, context isolation
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test nested providers with different configs

**Test: Dynamic Configuration Changes**
- **Scenario:** User switches environment, baseUrl/apiPath change
- **Coverage:** Provider reconfiguration, hook re-execution
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test config updates trigger re-checks

---

## 2. Common Developer Mistakes

### 2.1 Hook Usage Errors

**Test: Hook Used Outside Provider**
- **Scenario:** Developer forgets to wrap app in `<AccessCheck.Provider>`
- **Coverage:** Clear error message guides developer
- **Current Status:** ✅ Covered in `hooks.test.tsx:250-266`
- **Recommendation:** Ensure error message is developer-friendly

**Test: Empty Resources Array**
- **Scenario:** Developer passes `resources: []` to bulk check
- **Coverage:** Graceful handling, no API call
- **Current Status:** ⚠️ Partially covered (empty array tested in api-client)
- **Recommendation:** **ADD** - Test hook behavior with empty array

**Test: Missing Required Fields**
- **Scenario:** Developer forgets `reporter` field on resource
- **Coverage:** TypeScript prevents, but test runtime behavior
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test what happens if reporter is undefined/null

**Test: Incorrect Resource Type**
- **Scenario:** Developer passes wrong type (e.g., `resources: resource` instead of array)
- **Coverage:** TypeScript prevents, but test runtime behavior
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test type coercion edge cases

**Test: Mixing Overloads Incorrectly**
- **Scenario:** Developer passes `{ relation, resources }` expecting nested relations result
- **Coverage:** TypeScript should catch, verify runtime behavior
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test overload disambiguation

### 2.2 Resource Configuration Mistakes

**Test: Missing Reporter Field**
- **Scenario:** Resource missing `reporter: { type: 'rbac' }`
- **Coverage:** API error, clear error message returned
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test API validation errors

**Test: Malformed Reporter**
- **Scenario:** `reporter: { type: null }` or `reporter: { instanceId: 'x' }` (missing type)
- **Coverage:** API error handling
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test reporter validation

**Test: Resource ID Edge Cases**
- **Scenario:** Empty string, very long string, special characters, unicode
- **Coverage:** API handles gracefully
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test ID sanitization/validation

**Test: Additional Resource Properties**
- **Scenario:** Developer adds custom properties to resource objects
- **Coverage:** Extra properties preserved through check lifecycle
- **Current Status:** ✅ Covered in `hooks.test.tsx:219-248`
- **Recommendation:** Add more edge cases (nested objects, arrays, functions)

### 2.3 State Management Mistakes

**Test: Stale Closure in useEffect**
- **Scenario:** Developer uses hook result in useEffect without proper dependencies
- **Coverage:** Hook updates trigger effect re-run
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test hook re-execution behavior

**Test: Conditional Hook Calls (Rules of Hooks)**
- **Scenario:** Developer conditionally calls `useSelfAccessCheck`
- **Coverage:** React throws error, test framework catches
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test Rules of Hooks violations

**Test: Rapid Re-renders**
- **Scenario:** Parent component re-renders rapidly, hook called multiple times
- **Coverage:** Abort previous requests, only show latest result
- **Current Status:** ⚠️ Partially (AbortController in code, not tested)
- **Recommendation:** **ADD** - Test request cancellation on unmount/re-render

---

## 3. Security & Abuse Concerns

### 3.1 Request Flooding

**Test: Bulk Request Size Limits**
- **Scenario:** Attacker sends 10,000 resources in bulk check
- **Coverage:** Chunking prevents overwhelming backend
- **Current Status:** ✅ Covered in `api-client.test.ts:106-324`
- **Recommendation:** Add test for 100,000+ resources, verify performance

**Test: Rapid Sequential Requests**
- **Scenario:** Attacker triggers hook re-execution 100 times/second
- **Coverage:** Request deduplication (future), rate limiting
- **Current Status:** ❌ Not covered (deduplication not implemented)
- **Recommendation:** **FUTURE** - Add when caching/deduplication implemented

**Test: Malicious Consistency Tokens**
- **Scenario:** Attacker injects crafted token to probe backend
- **Coverage:** Token passed through, backend validates
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test invalid/malformed tokens

### 3.2 XSS & Injection Risks

**Test: XSS in Resource IDs**
- **Scenario:** Resource ID contains `<script>alert('xss')</script>`
- **Coverage:** SDK doesn't render untrusted data, passes safely to API
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test HTML/script injection in all string fields

**Test: SQL Injection in Resource Fields**
- **Scenario:** Resource type is `'; DROP TABLE users; --`
- **Coverage:** SDK treats as opaque string, backend validates
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test SQL injection patterns

**Test: JSON Injection in Reporter**
- **Scenario:** Reporter contains `{"type": "rbac", "__proto__": {"isAdmin": true}}`
- **Coverage:** SDK serializes safely, no prototype pollution
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test prototype pollution vectors

### 3.3 Data Leakage

**Test: Cross-User Permission Checks**
- **Scenario:** Developer tries to check permissions for another user
- **Coverage:** SDK design prevents (self-checks only), document limitation
- **Current Status:** ✅ Documented in README, but not tested
- **Recommendation:** **ADD** - Test that JWT in cookie determines user

**Test: Sensitive Data in Errors**
- **Scenario:** API error includes sensitive info (PII, internal IDs)
- **Coverage:** SDK passes through errors, backend responsibility
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test error sanitization expectations

**Test: Console Logging Leaks**
- **Scenario:** SDK logs sensitive data in development mode
- **Coverage:** No sensitive data logged
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Audit and test logging behavior

---

## 4. Error Handling & Resilience

### 4.1 Network Errors

**Test: Network Timeout**
- **Scenario:** API takes 60+ seconds to respond
- **Coverage:** Fetch timeout, user sees error
- **Current Status:** ❌ Not covered (no timeout configured)
- **Recommendation:** **ADD** - Configure and test request timeout

**Test: Network Disconnection**
- **Scenario:** User loses internet mid-request
- **Coverage:** Fetch fails, error state set
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Simulate offline mode

**Test: Flaky Network (Intermittent Failures)**
- **Scenario:** Request fails, then succeeds on retry
- **Coverage:** User can manually retry (re-render)
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test retry behavior

**Test: CORS Errors**
- **Scenario:** API doesn't include CORS headers
- **Coverage:** Fetch fails, error message indicates CORS
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test CORS error handling

### 4.2 API Error Responses

**Test: 400 Bad Request**
- **Scenario:** SDK sends malformed request
- **Coverage:** Error parsed, displayed to user
- **Current Status:** ✅ Covered in `api-client.test.ts:37-48`
- **Recommendation:** Add more 400 variants (missing fields, invalid JSON)

**Test: 401 Unauthorized**
- **Scenario:** User's JWT expired
- **Coverage:** Error indicates auth failure, app can redirect to login
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test 401 handling, auth refresh flow

**Test: 403 Forbidden**
- **Scenario:** User authenticated but lacks permission
- **Coverage:** Error distinguishes from allowed=false
- **Current Status:** ✅ Covered in `hooks.test.tsx:123-156`
- **Recommendation:** Document difference between 403 and allowed=false

**Test: 404 Not Found**
- **Scenario:** Resource doesn't exist
- **Coverage:** Error indicates resource missing
- **Current Status:** ✅ Covered in `hooks.test.tsx:158-187`
- **Recommendation:** Test bulk check with mix of 404s and successes

**Test: 429 Rate Limit**
- **Scenario:** User exceeds API rate limit
- **Coverage:** Error includes retry-after header
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test rate limiting, retry logic

**Test: 500 Internal Server Error**
- **Scenario:** Backend service failure
- **Coverage:** Error message indicates server issue
- **Current Status:** ✅ Covered in `hooks.test.tsx:189-217`
- **Recommendation:** Test 502/503/504 variants

**Test: 503 Service Unavailable**
- **Scenario:** Backend in maintenance mode
- **Coverage:** Error indicates temporary unavailability
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test maintenance mode handling

### 4.3 Response Parsing Errors

**Test: Invalid JSON Response**
- **Scenario:** API returns HTML error page instead of JSON
- **Coverage:** JSON parsing fails gracefully, error state set
- **Current Status:** ⚠️ Partially (api-client handles, not tested)
- **Recommendation:** **ADD** - Test non-JSON responses

**Test: Unexpected Response Shape**
- **Scenario:** API returns `{ data: ... }` instead of `{ allowed: ... }`
- **Coverage:** Transformation handles gracefully
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test schema mismatch scenarios

**Test: Missing Required Fields**
- **Scenario:** Response missing `allowed` field
- **Coverage:** Default to false, log warning
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test partial response handling

**Test: Null/Undefined Values**
- **Scenario:** API returns `{ allowed: null }`
- **Coverage:** Transformed to false
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test null safety

### 4.4 Bulk Check Partial Failures

**Test: Mixed Success/Failure in Bulk**
- **Scenario:** Some resources succeed, others fail (per-item errors)
- **Coverage:** Successful checks returned, errors attached to failed items
- **Current Status:** ✅ Covered in `hooks.test.tsx:491-536`
- **Recommendation:** Add test with 50/50 success/failure split

**Test: Chunk Failure During Bulk**
- **Scenario:** First chunk succeeds, second chunk fails
- **Coverage:** Entire request fails (current behavior)
- **Current Status:** ✅ Covered in `api-client.test.ts:285-323`
- **Recommendation:** **CONSIDER** - Partial success handling strategy

**Test: Out-of-Order Chunk Responses**
- **Scenario:** Chunk 2 returns before chunk 1 (concurrent requests)
- **Coverage:** Results assembled in correct order
- **Current Status:** ⚠️ Assumed (Promise.all maintains order)
- **Recommendation:** **ADD** - Explicitly test ordering

---

## 5. React Component Lifecycle Issues

### 5.1 Mount/Unmount Edge Cases

**Test: Component Unmounts Before Response**
- **Scenario:** User navigates away during loading
- **Coverage:** AbortController cancels request, no state update
- **Current Status:** ⚠️ Code includes abort logic, not explicitly tested
- **Recommendation:** **ADD** - Test cleanup on unmount

**Test: Rapid Mount/Unmount Cycles**
- **Scenario:** Component mounts, unmounts, remounts quickly (routing)
- **Coverage:** Each instance independent, no state leaks
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test component instance isolation

**Test: Hook Called During Render Phase**
- **Scenario:** Developer calls hook conditionally or in render
- **Coverage:** React throws warning/error
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test hook call timing violations

### 5.2 Re-render Optimization

**Test: Stable Resource References**
- **Scenario:** Parent re-renders but resource object stable
- **Coverage:** Hook doesn't re-execute (dependency check)
- **Current Status:** ⚠️ Hook uses `resource?.id, resource?.type` dependencies
- **Recommendation:** **ADD** - Test unnecessary re-execution prevention

**Test: Resource Object Re-creation**
- **Scenario:** Parent creates new resource object on every render
- **Coverage:** Hook re-executes on every render (expected)
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Document and test memoization recommendations

**Test: Bulk Resources Array Changes**
- **Scenario:** Resources array recreated but content same
- **Coverage:** Hook uses stable key (JSON.stringify), doesn't re-execute
- **Current Status:** ✅ Code uses `useBulkResourcesKey` memoization
- **Recommendation:** **ADD** - Test memoization effectiveness

### 5.3 Concurrent Rendering (React 18+)

**Test: Concurrent Mode Re-renders**
- **Scenario:** React renders component multiple times concurrently
- **Coverage:** Hook handles concurrent renders gracefully
- **Current Status:** ❌ Not covered
- **Recommendation:** **ADD** - Test with React 18 concurrent features

**Test: Suspense Integration**
- **Scenario:** Component wrapped in Suspense boundary
- **Coverage:** Loading state works with Suspense
- **Current Status:** ❌ Not covered (no Suspense support)
- **Recommendation:** **FUTURE** - Consider Suspense API support

**Test: Transition API**
- **Scenario:** Permission check wrapped in startTransition
- **Coverage:** Updates marked as non-urgent
- **Current Status:** ❌ Not covered
- **Recommendation:** **FUTURE** - Test with useTransition

---

## 6. Quality of Life Issues

### 6.1 Developer Experience Problems

**Issue: Unclear Error Messages**
- **Scenario:** Developer sees generic "Request failed" error
- **Problem:** Can't determine root cause (network, auth, validation)
- **Current State:** API errors passed through, some generic fallbacks
- **Recommendation:** **IMPROVE** - Add error categorization (network, auth, validation, server)

**Issue: No TypeScript Autocomplete for Relations**
- **Scenario:** Developer doesn't know valid relations (view, edit, delete)
- **Problem:** Typos lead to runtime errors
- **Current State:** Relation is `string` type
- **Recommendation:** **CONSIDER** - Add `RelationType` union type for autocomplete

**Issue: No TypeScript Autocomplete for Resource Types**
- **Scenario:** Developer doesn't know valid resource types (workspace, inventory_group)
- **Problem:** Inconsistent naming across app
- **Current State:** Type is `string`
- **Recommendation:** **CONSIDER** - Add `ResourceType` union type or generics

**Issue: Silent Failures in Development**
- **Scenario:** Hook fails but developer doesn't notice
- **Problem:** No console warnings in dev mode
- **Current State:** Provider warns about empty config
- **Recommendation:** **ADD** - Console.error on API failures in dev mode

**Issue: Difficult to Debug Bulk Checks**
- **Scenario:** One resource in bulk check fails, unclear which
- **Problem:** No per-item debug info
- **Current State:** Errors attached to results
- **Recommendation:** **ADD** - Better bulk check debugging tools/logging

### 6.2 Testing Challenges for Consumers

**Issue: Hard to Mock Provider in Tests**
- **Scenario:** Consumer wants to test component using hook
- **Problem:** Need to set up provider, mock fetch
- **Current State:** No test utilities provided
- **Recommendation:** **ADD** - Export test utilities (MockAccessCheckProvider, createMockResult)

**Issue: No Deterministic Testing Mode**
- **Scenario:** Consumer wants consistent test results
- **Problem:** Real API calls in tests
- **Current State:** Consumer must mock fetch manually
- **Recommendation:** **ADD** - Documentation on testing strategies

**Issue: Difficult to Test Error States**
- **Scenario:** Consumer wants to test error UI
- **Problem:** Hard to trigger specific errors
- **Current State:** Must mock fetch with error responses
- **Recommendation:** **ADD** - Test utilities for common error scenarios

### 6.3 Performance Concerns

**Issue: No Request Deduplication**
- **Scenario:** Multiple components check same resource simultaneously
- **Problem:** Multiple identical API calls
- **Current State:** Each hook call makes separate request
- **Recommendation:** **FUTURE** - Implement request deduplication cache

**Issue: No Response Caching**
- **Scenario:** Same check performed multiple times
- **Problem:** Repeated API calls for same data
- **Current State:** No caching
- **Recommendation:** **FUTURE** - Implement TTL-based cache

**Issue: Large Bulk Requests Block UI**
- **Scenario:** User checks 10,000 resources
- **Problem:** UI freezes during processing
- **Current State:** Synchronous processing
- **Recommendation:** **CONSIDER** - Streaming/progressive results

**Issue: No Loading Progress for Bulk**
- **Scenario:** User waits for 100 chunk requests
- **Problem:** No indication of progress
- **Current State:** Binary loading state
- **Recommendation:** **CONSIDER** - Progress indication (50/100 chunks complete)

### 6.4 Documentation Gaps

**Issue: Missing Migration Guide**
- **Scenario:** Developer upgrading from old SDK
- **Problem:** Breaking changes unclear
- **Current State:** CHANGELOG only
- **Recommendation:** **ADD** - Migration guide document

**Issue: No Troubleshooting Guide**
- **Scenario:** Developer encounters error, searches docs
- **Problem:** No troubleshooting section
- **Current State:** README has best practices
- **Recommendation:** **ADD** - Troubleshooting section with common errors

**Issue: Inconsistent Examples**
- **Scenario:** Developer copies example from README
- **Problem:** Some examples incomplete or outdated
- **Current State:** Examples generally good
- **Recommendation:** **VERIFY** - All examples tested/working

**Issue: No Performance Guidelines**
- **Scenario:** Developer doesn't know when to use bulk vs single
- **Problem:** Suboptimal API usage
- **Current State:** README mentions bulk is better
- **Recommendation:** **ADD** - Performance best practices section

---

## 7. Testing Strategy Recommendations

### 7.1 MSW (Mock Service Worker) Adoption

**Current State:**
- MSW already used in `api-client.test.ts` and `hooks.bulkConfig.test.tsx`
- Some tests still use jest.fn() to mock fetch

**Recommendation:**
- ✅ **Standardize on MSW** for all integration tests
- MSW provides more realistic mocking (intercepts at network level)
- Better for testing error scenarios, timeouts, retries
- Easier to maintain (handlers shared between tests)

**Migration Plan:**
1. Convert all `jest.fn()` fetch mocks to MSW handlers
2. Create comprehensive MSW handler library in `src/api-mocks/`
3. Add handlers for all error scenarios (401, 403, 404, 429, 500, etc.)
4. Add handlers for edge cases (malformed JSON, timeouts, partial responses)

### 7.2 Test Organization

**Recommended Structure:**
```
packages/react-kessel-access-check/src/
├── __tests__/
│   ├── integration/
│   │   ├── happy-paths.test.tsx           # All happy path scenarios
│   │   ├── error-handling.test.tsx        # Network and API errors
│   │   ├── developer-mistakes.test.tsx    # Common pitfalls
│   │   ├── security.test.tsx              # XSS, injection, abuse
│   │   ├── react-lifecycle.test.tsx       # Mount/unmount, re-renders
│   │   ├── performance.test.tsx           # Large datasets, chunking
│   │   └── edge-cases.test.tsx            # Unusual inputs, corner cases
│   └── unit/
│       ├── hooks.test.tsx                 # (existing)
│       ├── api-client.test.ts             # (existing)
│       └── transformers.test.ts           # (new)
├── api-mocks/
│   ├── handlers/
│   │   ├── success-handlers.ts            # Happy path handlers
│   │   ├── error-handlers.ts              # Error scenario handlers
│   │   ├── edge-case-handlers.ts          # Edge case handlers
│   │   └── index.ts                       # Export all
│   ├── msw-server.ts                      # (existing)
│   └── test-utils.ts                      # (new) Test helpers
```

### 7.3 Testing Tools & Utilities

**Recommended Test Utilities:**

```typescript
// src/api-mocks/test-utils.ts

/**
 * Creates a test wrapper with AccessCheck.Provider
 */
export function createTestWrapper(config?: Partial<ApiConfig>) {
  return ({ children }: { children: React.ReactNode }) => (
    <AccessCheck.Provider
      baseUrl={config?.baseUrl ?? 'https://test.example.com'}
      apiPath={config?.apiPath ?? '/api/kessel/v1beta2'}
      bulkCheckConfig={config?.bulkCheckConfig}
    >
      {children}
    </AccessCheck.Provider>
  );
}

/**
 * Creates mock resource with defaults
 */
export function createMockResource(overrides?: Partial<SelfAccessCheckResource>) {
  return {
    id: 'test-resource-id',
    type: 'workspace',
    reporter: { type: 'rbac' },
    ...overrides,
  };
}

/**
 * Creates array of mock resources for bulk testing
 */
export function createMockResources(count: number) {
  return Array.from({ length: count }, (_, i) => createMockResource({ id: `resource-${i}` }));
}

/**
 * Waits for hook to finish loading
 */
export async function waitForHookResult() {
  await waitFor(() => expect(result.current.loading).toBe(false));
}
```

### 7.4 Test Coverage Goals

**Target Coverage:**
- Unit Tests: 90%+ code coverage
- Integration Tests: All user-facing scenarios
- Error Scenarios: All HTTP status codes, network errors
- Edge Cases: All identified security/abuse vectors

**Coverage Metrics:**
- Lines: 90%+
- Branches: 85%+
- Functions: 95%+
- Statements: 90%+

---

## 8. Prioritized Test Implementation Plan

### Phase 1: Critical Gaps (Week 1-2)

**Priority: CRITICAL**

1. ✅ **Empty Resources Array Handling** - Prevent runtime errors
2. ✅ **Missing Reporter Field** - API validation
3. ✅ **Component Unmount Cleanup** - Memory leak prevention
4. ✅ **401 Unauthorized Handling** - Auth error flow
5. ✅ **Invalid JSON Response** - Parsing error handling
6. ✅ **XSS in Resource IDs** - Security validation

### Phase 2: Developer Experience (Week 3-4)

**Priority: HIGH**

7. ✅ **Dynamic Configuration Changes** - Provider updates
8. ✅ **Network Timeout** - Request timeout configuration
9. ✅ **CORS Errors** - Cross-origin error handling
10. ✅ **Rapid Re-renders** - Request cancellation
11. ✅ **Malformed Reporter** - Input validation
12. ✅ **Better Error Messages** - Error categorization

### Phase 3: Edge Cases & Security (Week 5-6)

**Priority: MEDIUM**

13. ✅ **Resource ID Edge Cases** - Special characters, unicode
14. ✅ **SQL Injection Patterns** - Security testing
15. ✅ **JSON Injection** - Prototype pollution
16. ✅ **Out-of-Order Chunks** - Concurrent request ordering
17. ✅ **Flaky Network** - Retry behavior
18. ✅ **Null/Undefined Values** - Null safety

### Phase 4: Quality of Life (Week 7-8)

**Priority: LOW**

19. ✅ **Test Utilities Package** - Consumer testing support
20. ✅ **Error Categorization** - DX improvement
21. ✅ **Console Logging Audit** - Security audit
22. ✅ **Stable Resource References** - Performance optimization
23. ✅ **Documentation Updates** - Troubleshooting guide
24. ✅ **Migration Guide** - Upgrade support

### Phase 5: Future Enhancements (Backlog)

**Priority: FUTURE**

25. 🔮 **Request Deduplication** - Performance
26. 🔮 **Response Caching** - Performance
27. 🔮 **Suspense Support** - React 18+
28. 🔮 **Progress Indication** - UX improvement
29. 🔮 **Streaming Results** - Large dataset handling

---

## 9. Success Metrics

### Test Quality Metrics

- **Coverage:** 90%+ code coverage maintained
- **Reliability:** <1% flaky test rate
- **Performance:** All tests complete in <30 seconds
- **Clarity:** Every test has descriptive name and purpose comment

### Developer Experience Metrics

- **Onboarding:** New developer can use SDK in <1 hour
- **Error Resolution:** Errors provide actionable guidance
- **Documentation:** 90%+ of questions answered in docs
- **Testing:** Consumers can test their code without mocking internals

### Production Metrics (Post-Release)

- **Error Rate:** <0.1% of API calls result in SDK errors
- **Performance:** P95 latency <200ms for single checks, <500ms for bulk
- **Adoption:** 80%+ of consumers use recommended patterns
- **Issues:** <5 bug reports per month

---

## 10. Open Questions & Decisions Needed

### 10.1 Error Handling Strategy

**Question:** Should SDK retry failed requests automatically?
- **Pros:** Better UX, handles transient failures
- **Cons:** Complexity, potential for masking real errors
- **Recommendation:** No automatic retries (consumer responsibility)

**Question:** Should bulk check fail entirely or return partial results on chunk failure?
- **Current:** Fails entirely
- **Alternative:** Return successful chunks, mark failed chunks
- **Recommendation:** Keep current behavior (simpler, more predictable)

### 10.2 Performance Trade-offs

**Question:** Should SDK implement request deduplication cache?
- **Pros:** Reduces API load, improves performance
- **Cons:** Added complexity, cache invalidation challenges
- **Recommendation:** Add in future version with opt-in flag

**Question:** Should chunking be sequential or parallel?
- **Current:** Parallel (Promise.all)
- **Alternative:** Sequential (reduce backend load)
- **Recommendation:** Keep parallel, let backend handle rate limiting

### 10.3 TypeScript Strictness

**Question:** Should relations/resource types be typed unions?
- **Pros:** Better autocomplete, compile-time validation
- **Cons:** Less flexible, requires SDK updates for new types
- **Recommendation:** Keep strings, add optional discriminated unions via generics

### 10.4 Testing Scope

**Question:** Should integration tests cover backend behavior?
- **Scope:** Test SDK correctly calls API, not API correctness
- **Recommendation:** Mock API completely, document expected backend behavior

**Question:** Should tests verify React DevTools integration?
- **Scope:** Ensure hooks show proper names/values in DevTools
- **Recommendation:** Out of scope (React's responsibility)

---

## 11. Conclusion

This integration test plan identifies 50+ test scenarios across 6 major categories. The current test suite covers approximately 40% of these scenarios well, with significant gaps in:

1. **Error handling** - Network errors, timeouts, CORS
2. **Security** - XSS, injection, abuse vectors
3. **React lifecycle** - Mount/unmount, re-renders, concurrent mode
4. **Developer mistakes** - Common pitfalls and misconfigurations
5. **Edge cases** - Unusual inputs, malformed data, race conditions

**Immediate Action Items:**
1. ✅ Adopt MSW for all integration tests
2. ✅ Implement Phase 1 critical tests (6 tests)
3. ✅ Create test utilities package for consumers
4. ✅ Add error categorization and improved error messages
5. ✅ Document troubleshooting guide and testing strategies

**Success Criteria:**
- 90%+ code coverage
- All critical paths tested
- Zero known security vulnerabilities
- <1 hour developer onboarding time
- <5 bug reports per month post-launch

---

## Appendix A: Test Template

```typescript
/**
 * Integration Test Template
 *
 * Test: [Descriptive name]
 * Category: [Happy Path | Error Handling | Security | etc.]
 * Priority: [Critical | High | Medium | Low]
 *
 * Scenario: [User action or condition]
 * Expected: [Expected behavior]
 * Coverage: [What this test validates]
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSelfAccessCheck } from '../hooks';
import { server } from '../api-mocks/msw-server';
import { http, HttpResponse } from 'msw';
import { createTestWrapper, createMockResource } from '../api-mocks/test-utils';

describe('[Category] - [Test Group]', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should [expected behavior]', async () => {
    // Arrange
    const resource = createMockResource();
    server.use(
      http.post('/api/kessel/v1beta2/checkself', () => {
        return HttpResponse.json({ allowed: 'ALLOWED_TRUE' });
      })
    );

    // Act
    const { result } = renderHook(
      () => useSelfAccessCheck({ relation: 'view', resource }),
      { wrapper: createTestWrapper() }
    );

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.allowed).toBe(true);
  });
});
```

---

## Appendix B: MSW Handler Examples

```typescript
// src/api-mocks/handlers/error-handlers.ts

export const errorHandlers = {
  // 401 Unauthorized
  unauthorized: http.post('/api/kessel/v1beta2/checkself', () => {
    return HttpResponse.json(
      { code: 401, message: 'Unauthorized', details: [] },
      { status: 401 }
    );
  }),

  // Network timeout
  timeout: http.post('/api/kessel/v1beta2/checkself', async () => {
    await delay(60000); // Never resolves (timeout)
  }),

  // CORS error (not possible to fully simulate in MSW, document expected behavior)
  cors: http.post('/api/kessel/v1beta2/checkself', () => {
    return new Response(null, {
      status: 0, // CORS errors have status 0
    });
  }),

  // Invalid JSON
  invalidJson: http.post('/api/kessel/v1beta2/checkself', () => {
    return new Response('<html>Error</html>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }),
};
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-17
**Next Review:** 2026-03-17
**Owner:** Engineering Team
