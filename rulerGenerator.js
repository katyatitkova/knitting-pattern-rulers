const ruler = {}

// Left and right canva added margins (px)
const leftMarginDisplacement = 10
const rightMarginExtension = 20

const dpi = 96
const cmPerInch = 2.54
const pixelsPerCm = dpi / cmPerInch
const markingHeightMultiplier = 0.75

const rulerLengthElementId = "rulerLength"
const rulerHeightElementId = "rulerHeight"
const fontSizeElementId = "fontSize"
const scale14ElementId = "scale14"
const scale12ElementId = "scale12"
const filenameElementId = "filename"
const exportButtonElementId = "exportButton"
const canvasElementId = "rulerCanvas"

// Don't divide intervals
const parts = 1
// Divide each interval only once
const times = 1

const updateVariables = function () {
    ruler.width = document.getElementById(rulerLengthElementId).value
    ruler.widthPixels = pixelsPerCm * ruler.width
    ruler.height = document.getElementById(rulerHeightElementId).value
    ruler.heightPixels = pixelsPerCm * ruler.height
    ruler.fontSize = document.getElementById(fontSizeElementId).value
    ruler.markingsPerCm = Math.pow(parts, times)
    ruler.scale = document.getElementById(scale14ElementId).checked ?
        document.getElementById(scale14ElementId).value :
        document.getElementById(scale12ElementId).value;
}

const checkLimits = function () {
    //TODO modify checks
    if (ruler.height > 100) {
        console.info("Unreasonable ruler height")
        ruler.height = 15
        document.getElementById(rulerHeightElementId).value = ruler.height
    }
    if (ruler.width < 0) {
        console.info("Negative widths are not supported")
        ruler.width = -ruler.width
        document.getElementById(rulerLengthElementId).value = ruler.width
    }
    if (ruler.width > 1000) {
        console.info("Too long")
        ruler.width = 500
        document.getElementById(rulerLengthElementId).value = ruler.width
    }
}

const resizeCanvas = function () {
    document.getElementById(canvasElementId).width = ruler.widthPixels + rightMarginExtension
    let heightAdded = 50
    document.getElementById(canvasElementId).height = heightAdded + ruler.heightPixels
}

const addMarkingLabel = function (x1, y2, isFinal, label) {
    // label the marking
    let labelTextSize = ruler.fontSize

    let xLabelOffset = -4
    let yLabelOffset = 15

    if (isFinal) { // last label is right justified
        xLabelOffset = -1 * xLabelOffset
    }

    let text = new paper.PointText(new paper.Point(x1 + xLabelOffset, y2 + yLabelOffset))
    text.justification = "left"
    if (isFinal) { // last label is right justified
        text.justification = "right"
    }

    text.fillColor = "black"
    text.content = label

    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: labelTextSize
    }
    text.name = "Label no. " + label
}

const draw = function (index, arrayIndex, height, spacing, assignNumber, isFinal) {
    let x1 = leftMarginDisplacement + (spacing * index)
    let x2 = x1 // lines are vertical
    let y1 = 0 // all lines start at top of screen
    let y2 = height // downward

    if (ruler.markings[arrayIndex] === undefined) {
        // Draw a marking if it doesn't exist already
        let line = new paper.Path.Line([x1, y1], [x2, y2])
        line.name = "Marking no. " + index
        line.strokeColor = "black"
        line.strokeWidth = assignNumber ? "2" : "1"

        ruler.markings[arrayIndex] = true
        if (assignNumber) {
            addMarkingLabel(x1, y2, isFinal, index)
        }
    }
}

const constructRuler = function () {
    ruler.markings = [] // store all added markings so they are not re-added
    const layers = new Array(times) // layers in the SVG file

    for (let level = 0; level <= times; level++) {
        // The number of markings to draw on this level
        let toDraw = ruler.width * Math.pow(parts, level)
        layers[level] = new paper.Layer()
        layers[level].name = "Marking Group"

        // How many markings of the smallest size are between this level's neighbouring markings
        let markingsBetween = ruler.markingsPerCm / Math.pow(parts, level)

        let isFinal = false
        for (let i = 0; i <= toDraw; i++) {
            let markingsIndex = markingsBetween * i
            let height = ruler.heightPixels * Math.pow(markingHeightMultiplier, level)
            let spacing = pixelsPerCm / (Math.pow(parts, level)) / ruler.scale
            let assignNumber = (((level === 0) && (i % 5 === 0)) || isFinal)
            if (!assignNumber) {
                height = height * markingHeightMultiplier
            }
            if (i === toDraw) {
                isFinal = true
            }
            draw(i, markingsIndex, height, spacing, assignNumber, isFinal)
        }
    }
}

const build = function () {
    let canvas = document.getElementById(canvasElementId)

    // Create an empty project and a view for the canvas
    paper.setup(canvas)

    updateVariables()
    checkLimits()
    resizeCanvas()
    constructRuler()

    paper.view.draw()
}

const exportSvg = function () {
    document.getElementById(exportButtonElementId).addEventListener("click", function () {
        const filename = document.getElementById(filenameElementId).value

        let exportWidth = document.getElementById(canvasElementId).width
        let exportHeight = document.getElementById(canvasElementId).height
        paper.view.viewSize = new paper.Size(exportWidth, exportHeight)
        const svgString = paper.project.exportSVG({
            asString: true,
            size: { width: exportWidth, height: exportHeight }
        })

        const blob = new Blob([svgString], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)

        const downloadLink = document.createElement("a")
        downloadLink.href = url
        downloadLink.download = filename
        downloadLink.click()

        setTimeout(() => URL.revokeObjectURL(url), 1000)
    });
}

$(document).ready(function () {
    console.log("\t Welcome to the Ruler Generator │╵│╵│╵│╵│╵│╵│")
    build()

    $("#rulerParameters").change(function () {
        build()
    })

    exportSvg()
})
