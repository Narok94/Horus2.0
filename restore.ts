import { execSync } from 'child_process';
try {
  console.log(execSync('git restore assets/').toString());
} catch(e) {
  console.error("1:", e.message);
}
try {
  console.log(execSync('git checkout -- assets/').toString());
} catch(e) {
  console.error("2:", e.message);
}
try {
  console.log(execSync('git status').toString());
} catch(e) {
  console.error("3:", e.message);
}
