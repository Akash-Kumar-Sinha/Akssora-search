build:
	pnpm --filter @akssora/search-engine build
	
run:
	node packages/engine/dist/index.js

start:
	pnpm --filter @akssora/search-engine build && node packages/engine/dist/index.js