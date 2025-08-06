/* jshint asi: true*/
const ruler = {};

// Left and right canva added margins (px) to show all the vector rule
const leftMarginDisplacement = 10;
const rightMarginExtension = 20;

const dpi = 96;
const unitsAbbr = "cm";
const subUnitBase = 2;
const cmPerInch = 2.54;
const pixelsPerCm =  dpi / cmPerInch;

const limitTickQty = function () {
    // Prevent it from crashing if it tries to render too many lines
    ruler.ticksPerUnit = Math.pow(subUnitBase, ruler.subUnitExponent)
    ruler.masterTickQty = ruler.ticksPerUnit * ruler.width
    if (ruler.height > 100) {
        console.info("Unreasonable ruler height: " + ruler.height + " reducing height")
        ruler.height = 15
        document.getElementById("rulerHeight").value = ruler.height;
    }
    if (ruler.width < 0) {
        console.info("Negative widths are not supported")
        ruler.width = -ruler.width
        document.getElementById("rulerLength").value = ruler.width;
    }
    if (ruler.width > 1000) {
        console.info("Unreasonable tick quantity: " + ruler.masterTickQty + " reducing width")
        ruler.width = 500
        document.getElementById("rulerWidth").value = ruler.width;
    }
    if (ruler.masterTickQty > 10000) {
        console.info("Unreasonable tick quantity: " + ruler.masterTickQty + " reducing exponent")
        if (ruler.subUnitExponent > 1) {
            ruler.subUnitExponent = ruler.subUnitExponent - 1
            document.getElementById("subUnitExponent")[ruler.subUnitExponent].selected = true;
        }
    }
    if (ruler.ticksPerUnit > 100) {
        console.info("Unreasonable exponent: " + ruler.ticksPerUnit + " resetting to reasonable")
        ruler.subUnitExponent = 1
        document.getElementById("subUnitExponent")[ruler.subUnitExponent].selected = true; // selects reasonable
    }
};

const checkSubUnitBase = function () {
    let suffix = " " + unitsAbbr

    ruler.subLabels = [
        "1" + suffix,
    ]
};

const resizeCanvas = function () {
    document.getElementById("paintCanvas").width = ruler.width * pixelsPerCm + rightMarginExtension;
    let heightAdded = 50
    document.getElementById("paintCanvas").height = heightAdded + ruler.heightPixels;
};

const tickLabel = function(x1, y2, finalTick, tickIndex, exponentIndex){
    // label the tick
    let labelTextSize = ruler.fontSize;
    console.log('font size:' + labelTextSize)

    let xLabelOffset = -4    
    let yLabelOffset = 10

    if (finalTick) {xLabelOffset = -1 * xLabelOffset} // last label is right justified

    let text = new paper.PointText(new paper.Point(x1 + xLabelOffset, y2 + yLabelOffset));
    text.justification = 'left';
    if (finalTick) { // last label is right justified
        text.justification = 'right';
    }
    
    text.fillColor = 'black';
    text.content = tickIndex;
    
    text.style = {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: labelTextSize
    }
    text.name = ruler.subLabels[exponentIndex] + " label no. " + tickIndex // label for SVG editor
};

const tick = function(tickHeight, horizPosition, tickIndex, offsetTickIndex, exponentIndex, tickSpacing, finalTick){
    let x1 = leftMarginDisplacement + horizPosition + (tickSpacing * tickIndex)
    let x2 = x1 // x === x because lines are vertical
    let y1 = 0 // all lines start at top of screen
    let y2 = tickHeight // downward

    if (ruler.tickArray[ruler.masterTickIndex]===undefined || ruler.redundant) {
        // if no tick exists already, or if we want redundant lines, draw the tick.
        let line = new paper.Path.Line([x1, y1], [x2, y2]); // actual line instance
        line.name = ruler.subLabels[exponentIndex] + " Tick no. " + tickIndex // label for SVG editor
        line.strokeColor = "black"; // color of ruler line
        line.strokeWidth = "1"; // width of ruler line in pixels

        ruler.tickArray[ruler.masterTickIndex]=true // register the tick so it is not duplicated
        if ((exponentIndex === 0) && (tickIndex % 5 === 0)) { // if is a primary tick, it needs a label
            tickLabel(x1, y2, finalTick, offsetTickIndex, exponentIndex)
        }
    }
};

const constructRuler = function () {
    ruler.tickArray = []; // for prevention of redundancy, a member for each tick
    const layerArray = new Array(ruler.subUnitExponent); // Layers in the SVG file.

    let highestTickDenominatorMultiplier;
    for (let exponentIndex = 0; exponentIndex <= ruler.subUnitExponent; exponentIndex++) {
        // loop through each desired level of ticks, inches, halves, quarters, etc....
        let tickQty = ruler.width * Math.pow(subUnitBase, exponentIndex)
        layerArray[exponentIndex] = new paper.Layer();
        layerArray[exponentIndex].name = ruler.subLabels[exponentIndex] + " Tick Group";

        highestTickDenominatorMultiplier = ruler.ticksPerUnit / Math.pow(subUnitBase, exponentIndex)

        // to prevent redundant ticks, this multiplier is applied to current units to ensure consistent indexing of ticks.
        let finalTick = false
        for (let tickIndex = 0; tickIndex <= tickQty; tickIndex++) {
            ruler.masterTickIndex = highestTickDenominatorMultiplier * tickIndex
            if (tickIndex === tickQty) {
                finalTick = true
            }
            let tickHeight
            tickHeight = ruler.heightPixels * Math.pow(ruler.levelToLevelMultiplier, exponentIndex)

            let tickSpacing = pixelsPerCm / (Math.pow(subUnitBase, exponentIndex))
            // spacing between ticks, the fundamental datum on a ruler :-)
            let offsetTickIndex = parseInt(tickIndex)
            tick(tickHeight, 0, tickIndex, offsetTickIndex, exponentIndex, tickSpacing, finalTick);
            // draws the ticks
        }
    }
};

const debug = function () {
    console.info("--All the variables---")
    console.info(ruler) // prints all attributes of ruler object
};

const updateVariables = function () {
    ruler.redundant = document.getElementById('redundant').checked;
    ruler.width = document.getElementById('rulerLength').value;
    ruler.height = document.getElementById('rulerHeight').value;
    ruler.heightPixels = pixelsPerCm * ruler.height
    ruler.subUnitExponent = 1;
    ruler.levelToLevelMultiplier = 0.5;
    ruler.fontSize = document.getElementById('fontSize').value;
};

const build = function () {
    // Get a reference to the canvas object
    let canvas = document.getElementById('paintCanvas');

    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    updateVariables()
    checkSubUnitBase()
    limitTickQty()
    resizeCanvas()
    constructRuler()

    paper.view.draw();
};

const exportSvg = function () {
    // I referenced the excellent SVG export example here: http://paperjs.org/features/#svg-import-and-export
    document.getElementById("svgexpbutton").onclick =
        function () {
            let exportWidth = document.getElementById("paintCanvas").width
            let exportHeight = document.getElementById("paintCanvas").height

            let downloadLink = document.getElementById('downloadSVG')
            let svgString = paper.project.exportSVG({asString: true, size: {width: exportWidth, height: exportHeight}});

            downloadLink.href = URL.createObjectURL(new Blob([svgString], {
                type: 'image/svg+xml'
            }))
            downloadLink.download = 'myRuler.svg';
        };

};

$(document).ready(function(){ 
    console.log("\t Welcome to the Ruler Generator │╵│╵│╵│╵│╵│╵│")
    build()
    debug()

    $( "#rulerParameters" ).change(function(  ) {
        build()
        debug()
    });

    exportSvg()
});
