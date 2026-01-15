#!/bin/bash
set -e

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

echo "Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

echo "Installing pnpm..."
corepack enable --install-directory /home/node/.local/bin
corepack prepare --activate

echo "Installing dependencies..."
pnpm install

echo "Post-create setup complete!"
