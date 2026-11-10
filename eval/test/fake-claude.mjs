#!/usr/bin/env node
// A stand-in for the `claude` binary in tests. It never calls a model. Generation mode
// (--output-format stream-json): copies the fixture cell into cwd and replays the recorded
// transcript with __WORK__ set to cwd. Judge mode (--output-format json): prints the fixture
// envelope. Either way it records its argv in cwd/.fake-claude-args.json for the tests.
import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const argv = process.argv.slice(2);
const cwd = process.cwd();
writeFileSync(join(cwd, '.fake-claude-args.json'), JSON.stringify({ argv, hasApiKey: 'ANTHROPIC_API_KEY' in process.env }));
const fmt = argv[argv.indexOf('--output-format') + 1];
if (fmt === 'json') {
  process.stdout.write(readFileSync(join(FX, 'judge-envelope.json'), 'utf8'));
} else {
  cpSync(join(FX, 'cell', 'work'), cwd, { recursive: true });
  process.stdout.write(readFileSync(join(FX, 'transcript.jsonl'), 'utf8').replaceAll('__WORK__', cwd));
}
