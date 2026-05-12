// Feature: sbg-portal-redesign, Property 11: Admin Endpoint Authentication
// Validates: Requirements 5.1

import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "../auth";

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

const TEST_SECRET = "test-secret";

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

/** Creates a minimal mock Request with an optional admin_token cookie. */
function makeMockReq(token?: string): Request {
  return {
    cookies: token !== undefined ? { admin_token: token } : {},
  } as unknown as Request;
}

/** Creates a mock Response that captures status + json calls. */
function makeMockRes() {
  const capture = {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
  };

  const res = {
    status(code: number) {
      capture.statusCode = code;
      return res;
    },
    json(data: unknown) {
      capture.body = data;
      return res;
    },
  } as unknown as Response;

  return { res, capture };
}

/** Creates a mock next function that records whether it was called. */
function makeMockNext() {
  const state = { called: false };
  const next: NextFunction = () => {
    state.called = true;
  };
  return { next, state };
}

// ---------------------------------------------------------------------------
// Admin paths (used as documentation / labelling in property tests)
// ---------------------------------------------------------------------------

const adminPaths = fc.constantFrom(
  "/api/admin/members",
  "/api/admin/stats",
  "/api/admin/announcements/send"
);

// ---------------------------------------------------------------------------
// Property 11a — No token → 401
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe("requireAuth — Property 11a: No token returns 401", () => {
  it("returns 401 when req.cookies.admin_token is undefined", () => {
    fc.assert(
      fc.property(adminPaths, (_path) => {
        // _path is for documentation; requireAuth does not use the path
        const req = makeMockReq(undefined);
        const { res, capture } = makeMockRes();
        const { next, state } = makeMockNext();

        requireAuth(req, res, next);

        expect(capture.statusCode).toBe(401);
        expect(state.called).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  it("returns 401 when req.cookies is empty (no admin_token key)", () => {
    const req = { cookies: {} } as unknown as Request;
    const { res, capture } = makeMockRes();
    const { next, state } = makeMockNext();

    requireAuth(req, res, next);

    expect(capture.statusCode).toBe(401);
    expect(state.called).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Property 11b — Invalid token string → 401
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe("requireAuth — Property 11b: Arbitrary invalid token strings return 401", () => {
  it("returns 401 for any string that is not a valid JWT signed with JWT_SECRET", () => {
    fc.assert(
      fc.property(fc.string(), adminPaths, (invalidToken, _path) => {
        // Skip the empty string — the middleware treats falsy tokens as missing
        // (covered by Property 11a). Also skip strings that happen to be valid
        // JWTs (astronomically unlikely with fc.string(), but guard anyway).
        if (invalidToken === "") return;

        let isValid = false;
        try {
          jwt.verify(invalidToken, TEST_SECRET);
          isValid = true;
        } catch {
          isValid = false;
        }
        if (isValid) return;

        const req = makeMockReq(invalidToken);
        const { res, capture } = makeMockRes();
        const { next, state } = makeMockNext();

        requireAuth(req, res, next);

        expect(capture.statusCode).toBe(401);
        expect(state.called).toBe(false);
      }),
      { numRuns: 500 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11c — Malformed JWT (dot-containing strings) → 401
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe("requireAuth — Property 11c: Malformed JWT-like strings return 401", () => {
  it("returns 401 for strings that look like JWTs (contain dots) but are not valid", () => {
    // Generate strings with at least one dot to mimic JWT structure
    const jwtLikeString = fc
      .tuple(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 30 })
      )
      .map(([a, b, c]) => `${a}.${b}.${c}`)
      .filter((s) => {
        // Exclude strings that happen to be valid JWTs
        try {
          jwt.verify(s, TEST_SECRET);
          return false;
        } catch {
          return true;
        }
      });

    fc.assert(
      fc.property(jwtLikeString, adminPaths, (malformedToken, _path) => {
        const req = makeMockReq(malformedToken);
        const { res, capture } = makeMockRes();
        const { next, state } = makeMockNext();

        requireAuth(req, res, next);

        expect(capture.statusCode).toBe(401);
        expect(state.called).toBe(false);
      }),
      { numRuns: 300 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11d — Valid token → next() is called
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe("requireAuth — Property 11d: Valid JWT passes through to next()", () => {
  it("calls next() and attaches adminId when a properly signed JWT is provided", () => {
    const validToken = jwt.sign({ adminId: "admin" }, TEST_SECRET);

    const req = makeMockReq(validToken);
    const { res, capture } = makeMockRes();
    const { next, state } = makeMockNext();

    requireAuth(req, res, next);

    expect(state.called).toBe(true);
    expect(capture.statusCode).toBeUndefined();
    expect((req as Request & { adminId?: string }).adminId).toBe("admin");
  });

  it("calls next() for any valid adminId payload signed with JWT_SECRET", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (adminId) => {
          const token = jwt.sign({ adminId }, TEST_SECRET);
          const req = makeMockReq(token);
          const { res, capture } = makeMockRes();
          const { next, state } = makeMockNext();

          requireAuth(req, res, next);

          expect(state.called).toBe(true);
          expect(capture.statusCode).toBeUndefined();
          expect((req as Request & { adminId?: string }).adminId).toBe(adminId);
        }
      ),
      { numRuns: 200 }
    );
  });
});
