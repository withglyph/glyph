#!/bin/bash

if [[ "$VERCEL_GIT_COMMIT_REF" == gh-readonly-queue/* ]]; then
  echo "🛑 - Build cancelled"
  exit 0
fi

if npx turbo-ignore --fallback=HEAD^ 2> /dev/null; then
  echo "🛑 - Build cancelled"
  exit 0
fi

echo "✅ - Build can proceed"
exit 1
