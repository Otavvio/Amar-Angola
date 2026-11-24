import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
function check(dir) {
  for (const entry of readdirSync(dir,{withFileTypes:true})) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = join(dir,entry.name);
    if (entry.isDirectory()) check(path);
    else if (entry.isFile() && path.endsWith('.js')) {
      const result = spawnSync(process.execPath,['--check',path],{stdio:'inherit'});
      if (result.status !== 0) process.exit(1);
    }
  }
}
check('.');
console.log('Sintaxe JavaScript aprovada');
