install:
	pnpm install

build:
	pnpm --filter @akssora/search-engine build

demo:
	pnpm --filter demo exec tsx src/index.ts

run: demo
