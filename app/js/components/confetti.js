/* ==========================================================================
   TINYWINS OS — CONFETTI PARTICLE CELEBRATION
   ========================================================================== */
export function fireConfetti() {
	const count = 35;
	const colors = ["#7b6cf0", "#4fd1a1", "#ffc94d", "#ff6fa8", "#60a5fa"];
	const container = document.createElement("div");
	container.style.cssText =
		"position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
	document.body.appendChild(container);

	for (let i = 0; i < count; i++) {
		const p = document.createElement("div");
		const color = colors[Math.floor(Math.random() * colors.length)];
		const size = Math.floor(Math.random() * 8) + 6;
		const startX = Math.random() * window.innerWidth;
		const duration = Math.random() * 2 + 1.5;
		const delay = Math.random() * 0.4;

		p.style.cssText = `
      position: absolute;
      top: -20px;
      left: ${startX}px;
      width: ${size}px;
      height: ${size * 1.5}px;
      background: ${color};
      border-radius: 3px;
      opacity: 0.9;
      transform: rotate(${Math.random() * 360}deg);
      animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
    `;
		container.appendChild(p);
	}

	setTimeout(() => {
		if (container.parentNode) container.parentNode.removeChild(container);
	}, 4000);
}
