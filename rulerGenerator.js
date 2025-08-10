//TODO adjust constants
//TODO adjust labels positions
//TODO adjust labels for square
//TODO adjust marking lengths for square
//TODO draw every marking if it's possible
//TODO adjust pdf name for gauge
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
const rulerShortCm = 17
const rulerLongCm = 26
const rulerWidthCm = 3
const rulerWidthPixels = pixelsPerCm * rulerWidthCm

const canvasElementId = "rulerCanvas"

const stsRuler = {
    widthPixels: rulerWidthPixels,
    unit: "stitches",
    verticalMarkings: false,
}

const rowsRuler = {
    widthPixels: rulerWidthPixels,
    unit: "rows",
    verticalMarkings: true,
}

const updateVariables = function () {
    const square = document.getElementById("square").checked

    if (square) {
        stsRuler.square = true
        stsRuler.isVertical = false
        stsRuler.verticalMarkings = false
        stsRuler.lengthPixels = pixelsPerCm * rulerShortCm
        stsRuler.startX = 0
        stsRuler.startY = 0

        rowsRuler.square = true
        rowsRuler.isVertical = true
        rowsRuler.verticalMarkings = false
        rowsRuler.lengthPixels = pixelsPerCm * rulerLongCm
        rowsRuler.startX = 0
        rowsRuler.startY = 0
    } else {
        stsRuler.square = false
        stsRuler.isVertical = false
        stsRuler.verticalMarkings = false
        stsRuler.lengthPixels = pixelsPerCm * rulerLongCm
        stsRuler.startX = 0
        stsRuler.startY = 0

        rowsRuler.square = false
        rowsRuler.isVertical = false
        rowsRuler.verticalMarkings = true
        rowsRuler.lengthPixels = pixelsPerCm * rulerLongCm
        rowsRuler.startX = 0
        rowsRuler.startY = rulerWidthPixels + betweenRulers
    }

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
    let height = (rowsRuler.isVertical ? rowsRuler.lengthPixels + rightMargin : rowsRuler.startY + rowsRuler.widthPixels) + 1

    document.getElementById(canvasElementId).width = width
    document.getElementById(canvasElementId).height = height

    document.getElementById(canvasElementId).style.width = (width / 3) + 'px'
    document.getElementById(canvasElementId).style.height = (height / 3) + 'px'
}

const drawMarking = function (ruler, index, markingLength, spacing, assignNumber) {
    if (ruler.square && (index === 0)) {
        return
    }

    let x1 = ruler.startX + (spacing * index) + (ruler.square? 0 : leftMargin)
    let x2 = x1
    let y1 = ruler.startY
    let y2 = ruler.startY + markingLength

    if (ruler.isVertical) {
        x1 = ruler.startX
        x2 = x1 + markingLength
        y1 = ruler.startY + (spacing * index)
        y2 = y1
    }

    let line = new paper.Path.Line([x1, y1], [x2, y2])
    line.name = ruler.unit + " marking no. " + index
    line.strokeColor = "black"
    line.strokeWidth = "1"

    if (assignNumber) {
        addMarkingLabel(ruler, x2, y2, index)
    }
}

const addMarkingLabel = function (ruler, x, y, label) {
    let xLabelOffset = -15
    let yLabelOffset = 30

    if (ruler.verticalMarkings) {
        xLabelOffset = -10
        yLabelOffset = 10
    }

    if (ruler.isVertical) {
        xLabelOffset = 10
        yLabelOffset = 10
    }

    let startingPoint = new paper.Point(x + xLabelOffset, y + yLabelOffset)
    let text = new paper.PointText(startingPoint)
    text.justification = "left"

    text.fillColor = "black"
    text.content = label

    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: fontSize
    }
    text.name = ruler.unit + " label no. " + label

    if (ruler.verticalMarkings) {
        text.rotate(90, startingPoint)
    }
}

const drawBorder = function (name, x1, y1, x2, y2) {
    let topLine = new paper.Path.Line([x1, y1], [x2, y2])
    topLine.name = name + " border line"
    topLine.strokeColor = "black"
    topLine.strokeWidth = "1"
}

const drawRulerBorders = function (ruler) {
    drawBorder(ruler.unit + " top", ruler.startX, ruler.startY, ruler.endX, ruler.startY)
    drawBorder(ruler.unit + " bottom", ruler.startX, ruler.endY, ruler.endX, ruler.endY)
    drawBorder(ruler.unit + " left", ruler.startX, ruler.startY, ruler.startX, ruler.endY)
    drawBorder(ruler.unit + " right", ruler.endX, ruler.startY, ruler.endX, ruler.endY)
}

const drawBorders = function () {
    stsRuler.endX = stsRuler.startX + stsRuler.lengthPixels + rightMargin
    stsRuler.endY = stsRuler.startY + stsRuler.widthPixels

    rowsRuler.endX = rowsRuler.startX + (rowsRuler.isVertical ? rowsRuler.widthPixels : rowsRuler.lengthPixels + rightMargin)
    rowsRuler.endY = rowsRuler.startY + (rowsRuler.isVertical ? rowsRuler.lengthPixels + rightMargin : rowsRuler.widthPixels)

    if (stsRuler.square) {
        drawBorder("top", stsRuler.startX, stsRuler.startY, stsRuler.endX, stsRuler.startY)
        drawBorder("left", rowsRuler.startX, rowsRuler.startY, rowsRuler.startX, rowsRuler.endY)
        drawBorder("outer right", stsRuler.endX, stsRuler.startY, stsRuler.endX, stsRuler.endY)
        drawBorder("inner right", rowsRuler.endX, stsRuler.endY, rowsRuler.endX, rowsRuler.endY)
        drawBorder("outer bottom", rowsRuler.startX, rowsRuler.endY, rowsRuler.endX, rowsRuler.endY)
        drawBorder("inner bottom", rowsRuler.endX, stsRuler.endY, stsRuler.endX, stsRuler.endY)
    } else {
        drawRulerBorders(stsRuler)
        drawRulerBorders(rowsRuler)
    }
}

const addRulerInfo = function (ruler) {
    let x = ruler.lengthPixels - 50
    let y = ruler.startY + ruler.widthPixels - 100
    let startingPoint = new paper.Point(x, y)
    if (ruler.isVertical) {
        startingPoint = new paper.Point(y, x)
    }

    let text = new paper.PointText(startingPoint)
    text.justification = "right"

    text.fillColor = "black"
    text.content = "Scale 1/" + ruler.scale + ", gauge " + ruler.sts + " " + ruler.unit + " per " + ruler.stsCm + " cm"

    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: fontSize
    }
    text.name = ruler.unit + " ruler info "

    if (ruler.isVertical) {
        text.rotate(90, startingPoint)
    }
}

const constructRuler = function (ruler) {
    let distance = 2
    for (let i = 0; i <= ruler.lengthStitches; i += distance) {
        let markingLength = markingLengthPixels
        let spacing =  ruler.pixelsPerStitch / ruler.scale
        let assignNumber = (i % 10 === 0)
        if (!assignNumber) {
            markingLength = markingLength * markingLengthMultiplier
        }
        drawMarking(ruler, i, markingLength, spacing, assignNumber)
    }
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
        drawBorders()
        addRulerInfo(stsRuler)
        addRulerInfo(rowsRuler)

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
            orientation: canvas.width > canvas.height ? "landscape" : "portrait",
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
