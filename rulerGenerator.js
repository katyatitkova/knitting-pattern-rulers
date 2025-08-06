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
const canvasElementId = "rulerCanvas"

const updateVariables = function () {
    ruler.width = document.getElementById(rulerLengthElementId).value
    ruler.widthPixels = pixelsPerCm * ruler.width
    ruler.height = document.getElementById(rulerHeightElementId).value
    ruler.heightPixels = pixelsPerCm * ruler.height
    ruler.fontSize = document.getElementById("fontSize").value
    ruler.scale = document.getElementById("scale14").checked ?
        document.getElementById("scale14").value :
        document.getElementById("scale12").value;
    ruler.gauge = document.getElementById("gauge").value
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

const draw = function (index, height, spacing, assignNumber, isFinal) {
    let x1 = leftMarginDisplacement + (spacing * index)
    let x2 = x1 // lines are vertical
    let y1 = 0 // all lines start at top of screen
    let y2 = height // downward

    // Draw a marking if it doesn't exist already
    let line = new paper.Path.Line([x1, y1], [x2, y2])
    line.name = "Marking no. " + index
    line.strokeColor = "black"
    line.strokeWidth = assignNumber ? "2" : "1"

    if (assignNumber) {
        addMarkingLabel(x1, y2, isFinal, index)
    }
}

const constructRuler = function () {
    let isFinal = false
    for (let i = 0; i <= ruler.width; i++) {
        let height = ruler.heightPixels * markingHeightMultiplier
        let spacing = pixelsPerCm / ruler.scale
        if (i === ruler.width) {
            isFinal = true
        }
        let assignNumber = ((i % 5 === 0) || isFinal)
        if (!assignNumber) {
            height = height * markingHeightMultiplier
        }
        draw(i, height, spacing, assignNumber, isFinal)
    }
}

const build = function () {
    let canvas = document.getElementById(canvasElementId)

    // Create an empty project and a view for the canvas
    paper.setup(canvas)

    updateVariables()
    resizeCanvas()
    constructRuler()

    paper.view.draw()
}

const exportSvg = function () {
    document.getElementById("exportButton").addEventListener("click", function () {
        const filename = document.getElementById("filename").value

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
