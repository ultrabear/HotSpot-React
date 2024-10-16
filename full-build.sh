#!/bin/bash
set -euo pipefail
set -x

cd backend
  pnpm i
  pnpm prisma generate
  pnpm tsc
  pnpm prisma db push --accept-data-loss
cd ..

cd frontend
  pnpm i
  pnpm run build
cd ..
