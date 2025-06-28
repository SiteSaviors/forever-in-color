
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

**REMINDER**: This document exists because previous attempts failed to deliver results. Every future interaction must either advance the file reduction goal or explicitly explain technical barriers preventing progress.

**NO MORE STAGNATION WITH A SMILE.**
