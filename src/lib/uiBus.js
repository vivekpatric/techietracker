let handlers = { render: () => {}, navigate: () => {}, confirm: (msg, onYes) => { if (window.confirm(msg)) onYes(); } };
export function configureUI(next) { handlers = { ...handlers, ...next }; }
export function requestRender() { handlers.render(); }
export function navigate(screen, param) { handlers.navigate(screen, param); }
export function requestConfirm(msg, onYes) { handlers.confirm(msg, onYes); }
