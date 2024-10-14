#!/bin/bash

set -euo pipefail

set -x

cd backend
  pnpm i
  dotenv prisma generate
  tsc
  dotenv prisma db push --accept-data-loss
cd ..

cd frontend
  pnpm i
  pnpm run build
cd ..
