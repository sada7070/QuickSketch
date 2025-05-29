type Shape = {
    type: "rect";
    x: number;
    y: number;
    height: number;
    width: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
}

export function initDraw(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");

    let existingShapes: Shape[] = [];

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
        const width = e.clientX - startX;                        // this clintX/clientY takes the value of coordinates where mouse mouves
        const height = e.clientY - startY;                       // width and hight calculated by taking diff in mouseup and mousedown
        
        existingShapes.push({
            type: "rect",
            x: startX,
            y: startY,
            height,
            width
        });
    });

    canvas.addEventListener("mousemove", (e) => {
        if(clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;

            clearCanvas(existingShapes, canvas, context);

            // drawing rect
            context.strokeStyle  = "rgba(255, 255, 255)";
            context.strokeRect(startX, startY, width, height);
        }
    });
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement ,context: CanvasRenderingContext2D) {
    // Clear the canvas before drawing a new rectangle
    context.clearRect(0, 0, canvas.width, canvas.height);           // when cleared it is intialized to starting positions
    context.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
        if(shape.type == "rect") {
            // drawing rect
            context.strokeStyle  = "rgba(255, 255, 255)";
            context.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    }); 
}