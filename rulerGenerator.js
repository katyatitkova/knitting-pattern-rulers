//TODO adjust constants
//TODO adjust labels positions
//TODO draw every marking if it's possible
//TODO vertical labels for row ruler
//TODO square option
//TODO update readme
//TODO make a screenshot
//TODO add favicon

const leftMargin = 30
const rightMargin = 60
const betweenRulers = 100

const drawDpi = 300
const pdfDpi = 72
const cmPerInch = 2.54
const pixelsPerCm = drawDpi / cmPerInch
const markingLengthMultiplier = 0.25
const markingLengthCm = 0.8
const markingLengthPixels = markingLengthCm * pixelsPerCm
const fontSize = 26
const rulerWidthCm = 3
const rulerWidthPixels = pixelsPerCm * rulerWidthCm

const canvasElementId = "rulerCanvas"

const stsRuler = {
    lengthPixels: pixelsPerCm * 25,
    widthPixels: rulerWidthPixels,
    unit: "stitches",
    startX: 0,
    startY: 0,
}

const rowsRuler = {
    lengthPixels: pixelsPerCm * 25,
    widthPixels: rulerWidthPixels,
    unit: "rows",
    startX: 0,
    startY: rulerWidthPixels + betweenRulers,
}

const updateVariables = function () {
    stsRuler.sts = document.getElementById("sts").value
    stsRuler.stsCm = document.getElementById("stsCm").value
    stsRuler.scale = document.getElementById("scale").value

    stsRuler.gauge = stsRuler.sts / stsRuler.stsCm
    stsRuler.lengthCm = stsRuler.lengthPixels / pixelsPerCm * stsRuler.scale
    stsRuler.lengthStitches = stsRuler.lengthCm * stsRuler.gauge
    stsRuler.pixelsPerStitch = pixelsPerCm / stsRuler.gauge

    rowsRuler.sts = document.getElementById("rows").value
    rowsRuler.stsCm = document.getElementById("rowsCm").value
    rowsRuler.scale = document.getElementById("scale").value

    rowsRuler.gauge = rowsRuler.sts / rowsRuler.stsCm
    rowsRuler.lengthCm = rowsRuler.lengthPixels / pixelsPerCm * rowsRuler.scale
    rowsRuler.lengthStitches = rowsRuler.lengthCm * rowsRuler.gauge
    rowsRuler.pixelsPerStitch = pixelsPerCm / rowsRuler.gauge
}

const resizeCanvas = function () {
    let width = stsRuler.lengthPixels + rightMargin + 1
    let height = rowsRuler.startY + rowsRuler.widthPixels + 1

    document.getElementById(canvasElementId).width = width
    document.getElementById(canvasElementId).height = height

    document.getElementById(canvasElementId).style.width = (width / 3) + 'px'
    document.getElementById(canvasElementId).style.height = (height / 3) + 'px'
}

const addMarkingLabel = function (ruler, x, y, isFinal, label) {
    let xLabelOffset = -15
    let yLabelOffset = 30

    if (isFinal) { // last label is right justified
        xLabelOffset = -1 * xLabelOffset
    }

    let text = new paper.PointText(new paper.Point(x + xLabelOffset, y + yLabelOffset))
    text.justification = "left"
    if (isFinal) { // last label is right justified
        text.justification = "right"
    }

    text.fillColor = "black"
    text.content = label

    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: fontSize
    }
    text.name = ruler.unit + " label no. " + label
}

const drawMarking = function (ruler, index, markingLength, spacing, assignNumber, isFinal) {
    let x1 = ruler.startX + leftMargin + (spacing * index)
    let x2 = x1
    let y1 = ruler.startY
    let y2 = ruler.startY + markingLength

    let line = new paper.Path.Line([x1, y1], [x2, y2])
    line.name = ruler.unit + " marking no. " + index
    line.strokeColor = "black"
    line.strokeWidth = "1"

    if (assignNumber) {
        addMarkingLabel(ruler, x1, y2, isFinal, index)
    }
}

const drawBorder = function (name, x1, y1, x2, y2) {
    let topLine = new paper.Path.Line([x1, y1], [x2, y2])
    topLine.name = name + " border line"
    topLine.strokeColor = "black"
    topLine.strokeWidth = "1"
}

const drawBorders = function (ruler) {
    ruler.endX = ruler.startX + ruler.lengthPixels + rightMargin
    ruler.endY = ruler.startY + ruler.widthPixels
    drawBorder(ruler.unit + " top", ruler.startX, ruler.startY, ruler.endX, ruler.startY)
    drawBorder(ruler.unit + " bottom", ruler.startX, ruler.endY, ruler.endX, ruler.endY)
    drawBorder(ruler.unit + " left", ruler.startX, ruler.startY, ruler.startX, ruler.endY)
    drawBorder(ruler.unit + " right", ruler.endX, ruler.startY, ruler.endX, ruler.endY)
}

const addRulerInfo = function (ruler) {
    let text = new paper.PointText(new paper.Point(ruler.startX + 100, ruler.startY + ruler.widthPixels - 100))
    text.justification = "left"

    text.fillColor = "black"
    text.content = "Scale 1/" + ruler.scale + ", gauge " + ruler.sts + " " + ruler.unit + " per " + ruler.stsCm + " cm"

    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: fontSize
    }
    text.name = ruler.unit + " ruler info "
}

const constructRuler = function (ruler) {
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
        drawMarking(ruler, i, markingLength, spacing, assignNumber, isFinal)
    }
    drawBorders(ruler)
    addRulerInfo(ruler)
}

const build = function () {
    const canvas = document.getElementById(canvasElementId)
    paper.setup(canvas)

    const form = document.getElementById('rulerParameters');

    if (form.reportValidity()) {
        updateVariables()
        resizeCanvas()
        constructRuler(stsRuler)
        constructRuler(rowsRuler)

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
