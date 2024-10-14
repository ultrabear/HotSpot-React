#!/bin/bash

set -euo pipefail

set -x

cd backend
  pnpm i
  pnpm dotenv prisma generate
  pnpm tsc
  pnpm dotenv prisma db push --accept-data-loss
cd ..

cd frontend
  pnpm i
  pnpm run build
cd ..
