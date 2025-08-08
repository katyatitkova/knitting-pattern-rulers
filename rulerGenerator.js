//TODO adjust constants
//TODO adjust labels positions
//TODO remove font size selector
//TODO selector for scale (1/1, 1/2, 1/4)
//TODO selector for gauge (1 cm / 10 cm)
//TODO draw every marking if it's possible
//TODO add a second ruler for row gauge
//TODO vertical labels for row ruler
//TODO update readme
//TODO make a screenshot
//TODO add favicon

const ruler = {}

const leftMargin = 30
const rightMargin = 60

const drawDpi = 300
const pdfDpi = 72
const cmPerInch = 2.54
const pixelsPerCm = drawDpi / cmPerInch
const markingHeightMultiplier = 0.25
const markingHeightCm = 0.8
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
    let width = ruler.widthPixels + rightMargin
    let height = ruler.heightPixels

    document.getElementById(canvasElementId).width = width
    document.getElementById(canvasElementId).height = height

    document.getElementById(canvasElementId).style.width = (width / 3) + 'px'
    document.getElementById(canvasElementId).style.height = (height / 3) + 'px'
}

const addMarkingLabel = function (x1, y2, isFinal, label) {
    let xLabelOffset = -15
    let yLabelOffset = 30

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
    let x1 = leftMargin + (spacing * index)
    let x2 = x1
    let y1 = 0
    let y2 = height

    let line = new paper.Path.Line([x1, y1], [x2, y2])
    line.name = "Marking no. " + index
    line.strokeColor = "black"
    line.strokeWidth = "1"

    if (assignNumber) {
        addMarkingLabel(x1, y2, isFinal, index)
    }
}

const drawBorder = function (name, x1, y1, x2, y2) {
    let topLine = new paper.Path.Line([x1, y1], [x2, y2])
    topLine.name = name + " border line"
    topLine.strokeColor = "black"
    topLine.strokeWidth = "1"
}

const drawBorders = function () {
    let width = ruler.widthPixels + rightMargin
    let height = ruler.heightPixels
    drawBorder("top", 0, 0, width, 0)
    drawBorder("bottom", 0, height, width, height)
    drawBorder("left", 0, 0, 0, height)
    drawBorder("right", width, 0, width, height)
}

const addRulerInfo = function () {
    let text = new paper.PointText(new paper.Point(100, ruler.heightPixels - 100))
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
        let height = markingHeightPixels
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

    paper.setup(canvas)

    updateVariables()
    resizeCanvas()
    constructRuler()

    paper.view.draw()
}

const exportPdf = function () {
    document.getElementById("exportButton").addEventListener("click", function () {
        const filename = document.getElementById("filename").value || "ruler.pdf"

        const canvas = document.getElementById(canvasElementId)
        const imgData = canvas.toDataURL("image/png")

        const { jsPDF } = window.jspdf

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: "a4"
        })

        const ptPerPx = pdfDpi / drawDpi
        const imgWidthPt = canvas.width * ptPerPx
        const imgHeightPt = canvas.height * ptPerPx

        pdf.addImage(imgData, "PNG", 40, 40, imgWidthPt, imgHeightPt)
        pdf.save(filename.endsWith(".pdf") ? filename : filename + ".pdf")
    })
}

$(document).ready(function () {
    build()

    $("#rulerParameters").change(function () {
        build()
    })

    exportPdf()
})
