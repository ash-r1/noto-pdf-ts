#!/bin/bash
set -e

echo "Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

echo "Installing pnpm..."
corepack enable
corepack prepare pnpm@latest --activate

echo "Installing dependencies..."
pnpm install

echo "Post-create setup complete!"
