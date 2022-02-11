let canvasTransferable;
let ctx;

onmessage = (ev) => {
    if (ev.data.canvasTransferable) {
        canvasTransferable = ev.data.canvasTransferable;
        ctx = canvasTransferable.getContext("2d", {
            alpha: false,
            antialias: false
        });
    }

    const width = ev.data.width;
    const height = ev.data.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "red";

    const min = 50;
    const x = min + (width - min) * Math.random();
    const y = min + (height - min) * Math.random();

    ctx.fillRect(x, y, min * 2, min * 2);
    requestAnimationFrame(() => {});

    postMessage("ready");
};
