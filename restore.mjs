import { $ } from 'zx';
try {
  await $`git restore assets/`;
  console.log("Restored assets/");
} catch (e) {
  console.log(e);
}
try {
  await $`git checkout HEAD -- assets/`;
  console.log("Checkout assets/");
} catch (e) {
  console.log(e);
}
try {
  await $`git status`;
} catch (e) {
  console.log(e);
}
