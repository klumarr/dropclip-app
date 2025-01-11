# File Protection System

This document outlines our system for protecting stable code from accidental overwrites during development.

## Overview

The protection system works in three ways:

1. **Documentation (.protect file)**:

   - Lists all protected files
   - Explains why each file is protected
   - Serves as documentation for the team
   - Makes it easy to see what's considered stable

2. **Git Protection (.gitattributes)**:

   - Marks files as protected in Git
   - Helps prevent merge conflicts
   - Makes these files require special attention during merges

3. **Pre-commit Hook**:
   - Automatically checks files before commits
   - Blocks commits that would substantially modify protected files (>50% changes)
   - Forces developers to explicitly remove protection if major changes are needed
   - Still allows minor updates and improvements

## File Structure

### 1. .protect File

```
# Protected Files - DO NOT OVERWRITE
# Format: path/to/file.tsx - reason for protection

# Core Pages
src/pages/DashboardPage.tsx - Stable implementation with working features
src/pages/LoginPage.tsx - Stable auth flow
src/pages/SignUpPage.tsx - Stable registration flow

# Core Components
src/components/auth/ProtectedRoute.tsx - Critical auth protection
src/components/layout/AppLayout.tsx - Core layout structure
src/components/layout/MobileNavigation.tsx - Stable navigation

# Configuration
src/theme/theme.ts - Finalized theme configuration
src/config/aws/amplify.config.ts - Critical AWS setup
```

### 2. .gitattributes File

```
# Protected files (read from .protect file)
src/pages/DashboardPage.tsx merge=protected
src/pages/LoginPage.tsx merge=protected
src/pages/SignUpPage.tsx merge=protected
src/components/auth/ProtectedRoute.tsx merge=protected
src/components/layout/AppLayout.tsx merge=protected
src/components/layout/MobileNavigation.tsx merge=protected
src/theme/theme.ts merge=protected
src/config/aws/amplify.config.ts merge=protected
```

### 3. Pre-commit Hook (.husky/pre-commit)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for protected files
protected_files=$(cat .protect | grep -v '^#' | grep -v '^$' | cut -d' ' -f1)
staged_files=$(git diff --cached --name-only)

for file in $protected_files; do
  if echo "$staged_files" | grep -q "^$file$"; then
    # Get the number of lines changed
    lines_changed=$(git diff --cached "$file" | grep -E "^[+-]" | grep -v "^[+-]{3}" | wc -l)

    # If more than 50% of the file is changed, block the commit
    total_lines=$(wc -l < "$file")
    if [ $lines_changed -gt $((total_lines / 2)) ]; then
      echo "Error: $file is protected and cannot be substantially modified."
      echo "The changes affect more than 50% of the file."
      echo "If you need to make major changes to this file, please remove it from .protect first."
      exit 1
    fi
  fi
done

# Run other pre-commit hooks
npm run lint
```

## Usage Instructions

### Adding Protection to a File

When a component or page is stable:

```bash
# Add it to .protect with a reason
echo "path/to/file.tsx - reason for protection" >> .protect
```

### Modifying Protected Files

1. Small changes (<50% of file) are allowed automatically
2. For major changes:
   - Remove the file from `.protect` first
   - Make your changes
   - Add it back to `.protect` when done

### Checking Protection Status

To check if a file is protected:

```bash
grep "filename" .protect
```

## Benefits

1. Protected files can only be enhanced, not overwritten
2. Major changes require explicit acknowledgment
3. Stable code remains stable
4. The system is flexible but protective

## Protection Thresholds

- Changes affecting less than 50% of a file are allowed
- Changes affecting more than 50% of a file are blocked
- This threshold can be adjusted in the pre-commit hook

## Important Notes

1. Always check `.protect` before making substantial changes to any file
2. If you need to make major changes to a protected file:
   - Discuss with the team first
   - Document the reason for removing protection
   - Re-protect the file after changes
3. The pre-commit hook can be bypassed with `git commit --no-verify` but this should be used sparingly and with good reason

## Maintenance

1. Regularly review the `.protect` file to ensure it's up to date
2. Consider adding new files as they become stable
3. Document any changes to the protection system in this file

## Troubleshooting

If you encounter issues with the protection system:

1. **Pre-commit Hook Not Running**:

   ```bash
   chmod +x .husky/pre-commit
   ```

2. **False Positives**:

   - Check the file path in `.protect` matches exactly
   - Ensure line endings are consistent (LF)

3. **Need to Force a Change**:
   - Remove protection temporarily
   - Make changes
   - Re-add protection
   - Document why this was necessary
