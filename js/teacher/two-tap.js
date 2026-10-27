// Teacher dashboard: a button that needs two taps, so nothing is lost by
// accident. The first tap changes it to `warning`; a second tap within
// 4 seconds runs `action`. (Browser confirm() boxes are avoided on purpose.)
export function twoTapButton(button, warning, action) {
  const normalText = button.textContent;
  let armed = false;
  button.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      button.textContent = warning;
      setTimeout(() => {
        armed = false;
        button.textContent = normalText;
      }, 4000);
      return;
    }
    armed = false;
    button.textContent = normalText;
    action();
  });
}
