import { execSync } from 'child_process';


function versionToArray(version: string): number[] {
  return version.split(/[\.-]/).map(Number);
}

function isVersionGte(current: string, required: string): boolean {
  const c = versionToArray(current);
  const r = versionToArray(required);
  for (let i = 0; i < r.length; i++) {
    if ((c[i] || 0) > r[i]) return true;
    if ((c[i] || 0) < r[i]) return false;
  }
  return true;
}

export function checkNode(required: string): boolean {
  const version = process.version.slice(1);
  return isVersionGte(version, required);
}

export function checkNpm(required: string): boolean {
  try {
    const version = execSync("npm -v").toString().trim();
    return isVersionGte(version, required);
  } catch {
    return false;
  }
}
