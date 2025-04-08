export function initDraw(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if(!context) {
        return;
    }

    // default background is set to black
    context.fillStyle = "rgba(0, 0, 0)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
    });

    // canvas.addEventListener("mouseleave", () => {
    // clicked = false;
    // });


    canvas.addEventListener("mousemove", (e) => {
        if(clicked) {
            const width = e.clientX - startX;                        // this clintX/clientY takes the value of coordinates where mouse mouves
            const height = e.clientY - startY;

            // Clear the canvas before drawing a new rectangle
            context.clearRect(0, 0, canvas.width, canvas.height);           // when cleared it is intialized to starting positions
            context.fillRect(0, 0, canvas.width, canvas.height);

            // drawing rect
            context.strokeStyle  = "rgba(255, 255, 255)";
            context.strokeRect(startX, startY, width, height);
        }
    });
}