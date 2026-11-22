import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'worker/public');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, '__protected'), { recursive: true });

for (const item of ['assets', 'nutrichef-assets-v2', 'nutrichef-auth.css', 'nutrichef-auth.js', 'nutrichef-profile-clarity.css', 'nutrichef-profile-clarity.js', 'nutrichef-responsive.css', 'manifest.webmanifest', 'nutrichef-icon.svg']) {
  await cp(resolve(root, item), resolve(output, item), { recursive: true });
}
await cp(resolve(root, 'nutrichef-app-20261023-e.html'), resolve(output, '__protected/nutrichef.html'));
