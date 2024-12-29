#!/bin/bash

# Project root directory
PROJECT_NAME="dropclip"
ROOT_DIR="$PROJECT_NAME"

# Create main project directory
mkdir -p $ROOT_DIR

# Create directory structure
directories=(
    ".github/workflows"
    ".vscode"
    "docs"
    "public"
    "src/__tests__"
    "src/assets"
    "src/components/auth"
    "src/components/layout"
    "src/components/player"
    "src/components/shared"
    "src/components/upload"
    "src/config"
    "src/contexts"
    "src/features/events"
    "src/features/playlists"
    "src/features/profile"
    "src/features/search"
    "src/hooks"
    "src/lib"
    "src/pages"
    "src/services"
    "src/styles"
    "src/types"
    "src/utils"
)

# Create directories
for dir in "${directories[@]}"; do
    mkdir -p "$ROOT_DIR/$dir"
    echo "Created directory: $dir"
done

# Copy documentation files
if [ -d "../docs" ]; then
    cp -r ../docs/* "$ROOT_DIR/docs/"
    echo "Copied documentation files"
fi

if [ -f "../.cursorrules" ]; then
    mv ../.cursorrules "$ROOT_DIR/docs/DEVELOPMENT_RULES.md"
    echo "Moved .cursorrules to DEVELOPMENT_RULES.md"
fi

# Create essential files
touch "$ROOT_DIR/.env.example"
touch "$ROOT_DIR/.gitignore"
touch "$ROOT_DIR/README.md"
touch "$ROOT_DIR/package.json"
touch "$ROOT_DIR/tsconfig.json"
touch "$ROOT_DIR/vite.config.ts"

# Create .gitignore content with merged rules
cat > "$ROOT_DIR/.gitignore" << 'EOL'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage
*.lcov
.nyc_output

# Production
/build
/dist
/out

# Development
*.log*
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# IDE
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
*.sublime-project
*.sublime-workspace
*.swp
*.swo

# AWS
aws-exports.js
/amplify
.amplify/
aws-exports-es5.js

# Misc
*.pem
.cache
.temp
.tmp
*.tgz
.node_repl_history
.npm
.eslintcache
.stylelintcache
.yarn-integrity

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
debug.log

# TypeScript
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
EOL

# Create package.json content
cat > "$ROOT_DIR/package.json" << EOL
{
  "name": "dropclip",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@aws-amplify/ui-react": "^5.0.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.13.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "@types/jest": "^29.5.0",
    "@types/node": "^18.16.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "aws-amplify": "^5.0.0",
    "firebase": "^10.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "typescript": "^5.3.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "jest",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.38.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "prettier": "^2.8.8",
    "vite": "^4.3.9"
  }
}
EOL

# Create tsconfig.json content
cat > "$ROOT_DIR/tsconfig.json" << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Create vite.config.ts content
cat > "$ROOT_DIR/vite.config.ts" << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
EOL

# Create README.md content
cat > "$ROOT_DIR/README.md" << EOL
# DropClip

A video sharing platform connecting performers/artists with their fans through event-based content sharing.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Documentation

See the \`docs\` directory for detailed documentation:

- \`PROJECT_OVERVIEW.md\`: Project overview and goals
- \`ROADMAP.md\`: Development roadmap
- \`FRONTEND_GUIDE.md\`: Frontend development guidelines
- \`DEPLOYMENT_STRATEGY.md\`: Deployment and infrastructure guide

## License

Private and Confidential
EOL

echo "Project structure created successfully!"
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. npm install"
echo "3. npm run dev" 