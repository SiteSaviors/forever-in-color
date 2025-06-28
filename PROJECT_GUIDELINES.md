
# Project Guidelines - Strict Adherence Required

## CRITICAL PROJECT OBJECTIVES
- **PRIMARY GOAL**: Reduce file count from 450 to 250 files (44% reduction target)
- **CURRENT STATUS**: No meaningful progress made toward file reduction
- **DEADLINE APPROACH**: Implementation over discussion

## STRICT RULES FOR ALL CODE CHANGES

### 1. FILE REDUCTION MANDATE
- **BEFORE** making any changes: Count current files and state the number
- **AFTER** any changes: Show actual file count reduction with proof
- **NO EXCEPTIONS**: Every edit session must either reduce file count or explicitly state why it cannot
- **CONSOLIDATION REQUIRED**: Combine related functionality instead of creating new files

### 2. ZERO TOLERANCE FOR BREAKING CHANGES
- **TEST BEFORE COMMIT**: Every change must maintain existing functionality
- **NO PARTIAL IMPLEMENTATIONS**: Complete all changes in one edit session
- **INTERFACE COMPATIBILITY**: Never change function signatures without updating all callers
- **ROLLBACK READY**: If anything breaks, immediately revert and explain why

### 3. BANNED RESPONSES
- ❌ "This looks good" without actual changes
- ❌ Percentage claims without file deletion proof
- ❌ "We could" or "I suggest" - DO OR DON'T
- ❌ Adding complexity while claiming simplification
- ❌ Breaking changes disguised as improvements

### 4. REQUIRED RESPONSES
- ✅ "Deleted X files, count reduced from Y to Z"
- ✅ "Cannot safely delete these files because [specific technical reason]"
- ✅ "Found X unused files, deleting now"
- ✅ "Consolidating A, B, C into single file D"

### 5. ANALYSIS REQUIREMENTS
When analyzing code for deletion:
- Use actual file content, not assumptions
- Identify import/export relationships
- Check for runtime dependencies
- Verify no dynamic imports or string-based requires
- Confirm no test files or documentation references

### 6. CONSOLIDATION STRATEGY
Priority order for file reduction:
1. **Dead code elimination** - Delete unused files first
2. **Duplicate functionality** - Merge identical/similar components
3. **Related components** - Combine small related files
4. **Utility consolidation** - Merge utility functions
5. **Type definitions** - Combine related types

### 7. EVIDENCE REQUIREMENTS
Every file reduction claim must include:
- Exact file count before/after
- List of deleted files
- Explanation of why each file was safe to delete
- Verification that all imports still resolve

## CURRENT PROBLEM AREAS

### Orientation Folder Structure
- **44+ files** in orientation-related folders
- Many appear to be duplicates or variations
- Immediate consolidation target
- Requires thorough dependency analysis

### Component Sprawl
- Too many single-purpose components
- Opportunity for logical grouping
- Focus on functionality over file organization

## ACCOUNTABILITY MEASURES

### Before Every Edit Session
1. State current file count
2. Identify specific files to be deleted/consolidated
3. Explain the consolidation strategy
4. Commit to measurable reduction

### After Every Edit Session
1. Provide new file count with proof
2. List exactly what was deleted/consolidated
3. Confirm all functionality still works
4. Report actual progress toward 250 file target

## FAILURE SCENARIOS TO AVOID
- Making interface changes without testing
- Claiming progress without file deletion
- Adding files while claiming reduction
- Breaking functionality for cosmetic changes
- Providing estimates instead of results

## SUCCESS METRICS
- **Quantitative**: File count reduction (target: 200 files deleted)
- **Qualitative**: Zero breaking changes
- **Functional**: All existing features work identically
- **Maintainable**: Cleaner, more consolidated codebase

---

# Lovable Collaboration Guidelines

## 🎯 Project Overview

I'm building a complex AI art platform that transforms user photos into various art styles and guides them through a purchase flow. The codebase is large (500+ files) and I need incremental improvements without breaking existing functionality.

## 🚀 Key Goals

**Maintain Stability**: Avoid regressions or large-scale rewrites that introduce new bugs.

**Incremental Progress**: Propose small, testable changes in clear phases.

**Clarity & Simplicity**: Use plain language and high-level descriptions; I'll handle any technical details under the hood.

**Conversion-Focused**: All UI/UX suggestions should improve user flow and conversion rates.

**Collaboration**: Communicate each proposal clearly, with rationale and next steps.

## 🎯 Phase-Based Workflow

### Phase 1: Audit & Report
**What**: Analyze current project flow (upload → crop → style → customization → checkout).

**Deliverable**: A short report listing:
- Top 5 friction points
- Which areas are most error-prone or confusing
- Estimated impact on conversion

### Phase 2: Quick Wins
**What**: Fix 2–3 critical bugs or UX pain points that block the purchase flow.

**Deliverable**: Actionable list of changes (e.g., "Make the 'Next' button sticky on mobile", "Add a fallback for failed image generation").

### Phase 3: UX Polish & Optimization
**What**: Refine style cards, refine hero section, improve accessibility and mobile responsiveness.

**Deliverable**: High-level design suggestions (wireframe sketches or text descriptions) and prioritized list of improvements.

### Phase 4: Performance & Testing
**What**: Recommend any automated tests or monitoring to catch future regressions.

**Deliverable**: Suggested test scenarios and simple performance checks (e.g., "Ensure upload step renders under 1 second").

## ✅ Collaboration Do's

**Ask Clarifying Questions**: If something is unclear, ask before making changes.

**Keep It Small**: Propose limited-scope changes per phase.

**Explain Rationale**: For each recommendation, share why it matters.

**Use My Terminology**: Stick to the language I've used (e.g., "upload step", "style cards").

## 🚫 Collaboration Don'ts

**No Big Rewrites**: Don't suggest rewriting the entire codebase.

**No Unsolicited Refactoring**: Avoid refactoring areas outside the current phase.

**No Technical Jargon**: Use simple terms; I'll interpret technical details.

## 📬 Communication & Checkpoints

**Phase Kickoff**: Confirm and refine goals before starting.

**Mid-Phase Check**: Share interim findings or drafts for feedback.

**Final Review**: Deliver report or plan, then we schedule the next phase.

---

**REMINDER**: This document exists because previous attempts failed to deliver results. Every future interaction must either advance the file reduction goal or explicitly explain technical barriers preventing progress.

**NO MORE STAGNATION WITH A SMILE.**
