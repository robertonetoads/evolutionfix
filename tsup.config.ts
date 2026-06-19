import { cpSync } from 'node:fs';

import { defineConfig } from 'tsup';

/**
 * O tsup executa múltiplos itens de `defineConfig([...])` em paralelo — não reduz RAM.
 * `npm run build` chama duas vezes o tsup com TSUP_STAGE=cjs e depois esm (um esbuild por vez).
 *
 * Windows (cmd.exe): `TSUP_STAGE=cjs tsup` direto no script falharia; `build:tsup:*` usa `cross-env`.
 * Git Bash no Windows: `npm run build` também funciona. PowerShell manual:
 *   $env:TSUP_STAGE='cjs'; npx tsup
 *   $env:TSUP_STAGE='esm'; npx tsup
 */
const stage = process.env.TSUP_STAGE;

if (stage !== 'cjs' && stage !== 'esm') {
  throw new Error(
    'Defina TSUP_STAGE=cjs ou TSUP_STAGE=esm. Use `npm run build` (ou build:tsup:cjs / build:tsup:esm).',
  );
}

const shared = {
  entry: ['src'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  minify: true,
  loader: {
    '.json': 'file',
    '.yml': 'file',
  },
};

export default defineConfig({
  ...shared,
  format: [stage],
  clean: stage === 'cjs',
  onSuccess:
    stage === 'esm'
      ? async () => {
          cpSync('src/utils/translations', 'dist/translations', { recursive: true });
        }
      : undefined,
});
