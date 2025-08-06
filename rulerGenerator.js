const ruler = {}

// Left and right canva added margins (px)
const leftMarginDisplacement = 10
const rightMarginExtension = 20

const dpi = 96
const cmPerInch = 2.54
const pixelsPerCm = dpi / cmPerInch
const markingHeightMultiplier = 0.75
const markingHeightCm = 1
const markingHeightPixels = markingHeightCm * pixelsPerCm

const canvasElementId = "rulerCanvas"

const updateVariables = function () {
    ruler.widthCm = document.getElementById("rulerLength").value
    ruler.heightCm = document.getElementById("rulerHeight").value
    ruler.fontSize = document.getElementById("fontSize").value
    ruler.scale = document.getElementById("scale14").checked ?
        document.getElementById("scale14").value :
        document.getElementById("scale12").value
    ruler.widthPixels = pixelsPerCm * ruler.widthCm / ruler.scale
    ruler.heightPixels = pixelsPerCm * ruler.heightCm
    ruler.gauge = document.getElementById("gauge").value
    ruler.widthStitches = ruler.widthCm * ruler.gauge
    ruler.pixelsPerStitch = pixelsPerCm / ruler.gauge
}

const resizeCanvas = function () {
    document.getElementById(canvasElementId).width = ruler.widthPixels + rightMarginExtension
    document.getElementById(canvasElementId).height = ruler.heightPixels
}

const addMarkingLabel = function (x1, y2, isFinal, label) {
    let xLabelOffset = -10
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
        fontSize: ruler.fontSize
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

const drawBorder = function (name, x1, y1, x2, y2) {
    let topLine = new paper.Path.Line([x1, y1], [x2, y2])
    topLine.name = name + " border line"
    topLine.strokeColor = "black"
    topLine.strokeColor = "1"
}

const drawBorders = function () {
    let width = ruler.widthPixels + rightMarginExtension
    let height = ruler.heightPixels
    drawBorder("top", 0, 0, width, 0)
    drawBorder("bottom", 0, height, width, height)
    drawBorder("left", 0, 0, 0, height)
    drawBorder("right", width, 0, width, height)
}

const addRulerInfo = function () {
    let text = new paper.PointText(new paper.Point(50, ruler.heightPixels - 30))
    text.justification = "left"

    text.fillColor = "black"
    text.content = "Scale 1/" + ruler.scale + "\nGauge " + ruler.gauge + " sts per 1 cm"

    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: ruler.fontSize
    }
    text.name = "Ruler info"
}

const constructRuler = function () {
    let isFinal = false
    let distance = 2
    for (let i = 0; i <= ruler.widthStitches; i += distance) {
        let height = markingHeightPixels * markingHeightMultiplier
        let spacing =  ruler.pixelsPerStitch / ruler.scale
        let assignNumber = (i % 10 === 0)
        if (!assignNumber) {
            height = height * markingHeightMultiplier
        }
        if (i === ruler.widthStitches) {
            isFinal = true
        }
        draw(i, height, spacing, assignNumber, isFinal)
    }
    drawBorders()
    addRulerInfo()
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
            size: {width: exportWidth, height: exportHeight}
        })

        const blob = new Blob([svgString], {type: "image/svg+xml"})
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
