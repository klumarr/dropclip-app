#!/bin/bash

# Create temporary directory for reorganization
mkdir -p temp_reorganize

# Move existing documentation files to project docs directory
mv docs/PROJECT_OVERVIEW.md dropclip/docs/
mv docs/FRONTEND_GUIDE.md dropclip/docs/
mv docs/ROADMAP.md dropclip/docs/
mv docs/DEPLOYMENT_STRATEGY.md dropclip/docs/
mv .cursorrules dropclip/docs/DEVELOPMENT_RULES.md

# Clean up
rm -rf docs
rm -f .gitignore

echo "Files have been reorganized into the dropclip project structure" 