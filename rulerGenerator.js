//TODO adjust constants
//TODO adjust labels positions
//TODO draw every marking if it's possible
//TODO fix right border
//TODO add a second ruler for row gauge
//TODO vertical labels for row ruler
//TODO square option
//TODO update readme
//TODO make a screenshot
//TODO add favicon

const leftMargin = 30
const rightMargin = 60

const drawDpi = 300
const pdfDpi = 72
const cmPerInch = 2.54
const pixelsPerCm = drawDpi / cmPerInch
const markingLengthMultiplier = 0.25
const markingLengthCm = 0.8
const markingLengthPixels = markingLengthCm * pixelsPerCm

const canvasElementId = "rulerCanvas"

const ruler = {
    lengthPixels: pixelsPerCm * 18,
    widthPixels: pixelsPerCm * 3,
    fontSize: 26
}

const updateVariables = function () {
    ruler.scale = document.getElementById("scale").value
    ruler.sts = document.getElementById("sts").value
    ruler.stsCm = document.getElementById("stsCm").value
    ruler.gauge = ruler.sts / ruler.stsCm
    ruler.lengthCm = ruler.lengthPixels / pixelsPerCm * ruler.scale
    ruler.lengthStitches = ruler.lengthCm * ruler.gauge
    ruler.pixelsPerStitch = pixelsPerCm / ruler.gauge
}

const resizeCanvas = function () {
    let width = ruler.lengthPixels + rightMargin
    let height = ruler.widthPixels

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

const drawMarking = function (index, markingLength, spacing, assignNumber, isFinal) {
    let x1 = leftMargin + (spacing * index)
    let x2 = x1
    let y1 = 0
    let y2 = markingLength

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
    let width = ruler.lengthPixels + rightMargin
    let height = ruler.widthPixels
    drawBorder("top", 0, 0, width, 0)
    drawBorder("bottom", 0, height, width, height)
    drawBorder("left", 0, 0, 0, height)
    drawBorder("right", width, 0, width, height)
}

const addRulerInfo = function () {
    let text = new paper.PointText(new paper.Point(100, ruler.widthPixels - 100))
    text.justification = "left"

    text.fillColor = "black"
    text.content = "Scale 1/" + ruler.scale + ", gauge " + ruler.sts + " sts per " + ruler.stsCm + " cm"

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
    for (let i = 0; i <= ruler.lengthStitches; i += distance) {
        let markingLength = markingLengthPixels
        let spacing =  ruler.pixelsPerStitch / ruler.scale
        let assignNumber = (i % 10 === 0)
        if (!assignNumber) {
            markingLength = markingLength * markingLengthMultiplier
        }
        if (i === ruler.lengthStitches) {
            isFinal = true
        }
        drawMarking(i, markingLength, spacing, assignNumber, isFinal)
    }
    drawBorders()
    addRulerInfo()
}

const build = function () {
    const canvas = document.getElementById(canvasElementId)
    paper.setup(canvas)

    const form = document.getElementById('rulerParameters');

    if (form.reportValidity()) {
        updateVariables()
        resizeCanvas()
        constructRuler()

        paper.view.draw()
    }
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
