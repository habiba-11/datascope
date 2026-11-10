// Teacher dashboard: a button that needs two taps, so nothing is lost by
// accident. The first tap changes it to `warning`; a second tap within
// 4 seconds runs `action`. (Browser confirm() boxes are avoided on purpose.)
import { setIconLine } from '../icon-text.js';
export function twoTapButton(button, warning, action) {
  // The label's own parts (Part 54h: an icon and words), restored as they were.
  const normal = [...button.childNodes].map((n) => n.cloneNode(true));
  const restore = () => button.replaceChildren(...normal.map((n) => n.cloneNode(true)));
  let armed = false;
  button.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      setIconLine(button, warning);
      setTimeout(() => {
        armed = false;
        restore();
      }, 4000);
      return;
    }
    armed = false;
    restore();
    action();
  });
}
