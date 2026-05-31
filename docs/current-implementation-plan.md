# Current Implementation Plan

## Goal

Make the recent multi-scope access work visible, verifiable, and fully polished across Admin, SOPs, Assignments, and Audits.

## Current Status

- The app is currently running with authenticated areas behind sign-in.
- Most recent development is not on the public home page.
- Recent multi-scope access work is implemented in code and needs route-by-route visible QA in the authenticated app.

## Ordered Task Plan

### 1. Expose Current Auth And Visibility State

- Show the current auth mode on the landing page.
- Explain that recent work is mainly inside protected routes.
- Point users to the exact routes where the latest changes live.

### 2. Verify And Polish Admin Users Multi-Scope Flow

- Confirm Add User and Edit User open only from the same page flow.
- Confirm Brands, Departments, and Locations support multi-select.
- Confirm `All` toggles disable individual scope picks correctly.
- Confirm default scope and access scope summaries are easy to read.

### 3. Verify And Polish Scope Access Cards

- Confirm Brands, Departments, Locations, and Owners all render actionable summaries.
- Confirm long lists expand cleanly with scroll containment.
- Remove any remaining runtime warnings or duplicate-key issues.

### 4. Audit Remaining Single-Scope UI Assumptions

- Review SOP, Assignment, and Audit screens for wording or layouts that still imply single-scope access.
- Adjust labels or summaries where the UI no longer matches the new access model.

### 5. Authenticated Route QA Pass

- Validate Admin Users.
- Validate SOP register, SOP create, and SOP detail.
- Validate Assignment register and create.
- Validate Audit register and create.
- Fix any remaining visible regressions found during the pass.

## Definition Of Done

- The landing page clearly explains the current runtime/auth state.
- Protected-route changes are easy to discover.
- Multi-scope access UX is consistent across Admin and workflow pages.
- No known runtime errors remain in the shared scope summary slice.
- Production build passes after each implementation step.