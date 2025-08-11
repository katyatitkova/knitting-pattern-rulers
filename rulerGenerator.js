//TODO test printing for 1 stitch markings
//TODO adjust constants
//TODO adjust labels positions
//TODO update readme
//TODO make a screenshot
//TODO add favicon

const leftMargin = 30
const rightMargin = 60
const betweenRulers = 100

const drawDpi = 300
const pdfDpi = 72
const cmPerInch = 2.54
const pxPerCm = drawDpi / cmPerInch
const marking10LengthCm = 0.8
const marking10LengthPx = marking10LengthCm * pxPerCm
const marking5LengthPx = marking10LengthPx / 2
const marking1LengthPx = marking5LengthPx / 2
const markingMicroLengthPx = marking1LengthPx / 3
const fontSize = 26
const rulerShortCm = 17
const rulerLongCm = 26
const rulerWidthPx = 3 * pxPerCm
const gaugeCm = 10

const canvasElementId = "rulerCanvas"

const stsRuler = {
    unit: "stitches",
    isVertical: false,
    verticalMarkings: false,
    startX: 0,
    startY: 0
}

const rowsRuler = {
    unit: "rows",
    startX: 0,
    lengthPx: pxPerCm * rulerLongCm
}

const updateVariables = function () {
    const square = document.getElementById("square").checked

    if (square) {
        stsRuler.square = true
        stsRuler.lengthPx = pxPerCm * rulerShortCm

        rowsRuler.square = true
        rowsRuler.isVertical = true
        rowsRuler.verticalMarkings = false
        rowsRuler.startY = 0
    } else {
        stsRuler.square = false
        stsRuler.lengthPx = pxPerCm * rulerLongCm

        rowsRuler.square = false
        rowsRuler.isVertical = false
        rowsRuler.verticalMarkings = true
        rowsRuler.startY = rulerWidthPx + betweenRulers
    }

    stsRuler.sts = document.getElementById("sts").value
    stsRuler.scale = document.getElementById("scale").value

    stsRuler.gauge = stsRuler.sts / gaugeCm
    stsRuler.lengthCm = stsRuler.lengthPx / pxPerCm * stsRuler.scale
    stsRuler.lengthSts = stsRuler.lengthCm * stsRuler.gauge
    stsRuler.pxPerSt = pxPerCm / stsRuler.gauge

    rowsRuler.sts = document.getElementById("rows").value
    rowsRuler.scale = document.getElementById("scale").value

    rowsRuler.gauge = rowsRuler.sts / gaugeCm
    rowsRuler.lengthCm = rowsRuler.lengthPx / pxPerCm * rowsRuler.scale
    rowsRuler.lengthSts = rowsRuler.lengthCm * rowsRuler.gauge
    rowsRuler.pxPerSt = pxPerCm / rowsRuler.gauge

    document.getElementById("filename").value = "ruler_"
        + stsRuler.sts.toString().replace(/\./g, "_")
        + "_sts_"
        + rowsRuler.sts.toString().replace(/\./g, "_")
        + "_rows"
        + "_per_10_cm"
        + ".pdf"
}

const resizeCanvas = function () {
    let width = stsRuler.lengthPx + rightMargin + 1
    let height = (rowsRuler.isVertical ? rowsRuler.lengthPx + rightMargin : rowsRuler.startY + rulerWidthPx) + 1

    document.getElementById(canvasElementId).width = width
    document.getElementById(canvasElementId).height = height

    document.getElementById(canvasElementId).style.width = (width / 3) + 'px'
    document.getElementById(canvasElementId).style.height = (height / 3) + 'px'
}

const calculateMarking = function (ruler, index, markingLength, spacing) {
    if (ruler.square && (index === 0)) {
        return null
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

    return {
        point1: {
            x: x1,
            y: y1
        },
        point2: {
            x: x2,
            y: y2
        }
    }
}

const drawMarking = function (ruler, point1, point2, index, assignNumber) {
    if ((point1 === null) || (point2 === null)) {
        return
    }
    let line = new paper.Path.Line([point1.x, point1.y], [point2.x, point2.y])
    line.name = ruler.unit + " marking no. " + index
    line.strokeColor = "black"
    line.strokeWidth = "1"

    if (assignNumber) {
        addMarkingLabel(ruler, point2, index)
    }
}

const addMarkingLabel = function (ruler, point, label) {
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

    let startingPoint = new paper.Point(point.x + xLabelOffset, point.y + yLabelOffset)
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
    stsRuler.endX = stsRuler.startX + stsRuler.lengthPx + rightMargin
    stsRuler.endY = stsRuler.startY + rulerWidthPx

    rowsRuler.endX = rowsRuler.startX + (rowsRuler.isVertical ? rulerWidthPx : rowsRuler.lengthPx + rightMargin)
    rowsRuler.endY = rowsRuler.startY + (rowsRuler.isVertical ? rowsRuler.lengthPx + rightMargin : rulerWidthPx)

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
    let x = ruler.lengthPx - 50
    let y = ruler.startY + rulerWidthPx - 100
    let startingPoint = new paper.Point(x, y)
    if (ruler.isVertical) {
        startingPoint = new paper.Point(y, x)
    }

    let text = new paper.PointText(startingPoint)
    text.justification = "right"

    text.fillColor = "black"
    text.content = "Scale 1/" + ruler.scale + ", " +
        "gauge " + ruler.sts + " " + ruler.unit + " per " + gaugeCm + " cm"

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

const getMarkings = function (ruler) {
    let spacing =  ruler.pxPerSt / ruler.scale
    let distance = (spacing < 10) ? 2 : 1
    let markings = []

    for (let i = 0; i <= ruler.lengthSts; i++) {
        if (i % distance !== 0) {
            markings.push({
                point1: null,
                point2: null,
                index: i,
                assignNumber: false
            })
            continue
        }
        let markingLength = marking10LengthPx
        let assignNumber = (i % 10 === 0)
        if (!assignNumber) {
            markingLength = (i % 5 === 0) ? marking5LengthPx : marking1LengthPx
        }
        let points = calculateMarking(ruler, i, markingLength, spacing)
        if (points != null) {
            markings.push({
                point1: points.point1,
                point2: points.point2,
                index: i,
                assignNumber: assignNumber
            })
        }
    }

    return markings
}

const drawMarkings = function(stsRulerMarkings, rowsRulerMarkings) {
    if (stsRuler.square) {
        for (let i = 0; i <= 20; i++) {
            if (pointsNearby(stsRulerMarkings[i].point2, rowsRulerMarkings[i].point2)) {
                stsRulerMarkings[i].point2.y = rowsRulerMarkings[i].point2.y
                rowsRulerMarkings[i].point2.x = stsRulerMarkings[i].point2.x
                stsRulerMarkings[i].assignNumber = false
                rowsRulerMarkings[i].assignNumber = false
                if ((i > 0) && (pointsNearby(stsRulerMarkings[i - 1].point2, rowsRulerMarkings[i].point2))) {
                    stsRulerMarkings[i - 1].point2.y = stsRulerMarkings[i - 1].point1.y + markingMicroLengthPx
                }
                if ((i > 0) && (pointsNearby(rowsRulerMarkings[i - 1].point2, stsRulerMarkings[i].point2))) {
                    rowsRulerMarkings[i - 1].point2.x = rowsRulerMarkings[i - 1].point1.x + markingMicroLengthPx
                }
            }
        }
    }
    drawRulerMarkings(stsRuler, stsRulerMarkings)
    drawRulerMarkings(rowsRuler, rowsRulerMarkings)
}

const pointsNearby = function(point1, point2) {
    if ((point1 === null) || (point2 === null)) {
        return false
    }
    const delta = 10
    return (Math.abs(point1.x - point2.x) < delta) || (Math.abs(point1.y - point2.y) < delta)
}

const drawRulerMarkings = function(ruler, rulerMarkings) {
    for (let m of rulerMarkings) {
        drawMarking(ruler, m.point1, m.point2, m.index, m.assignNumber)
    }
}

const build = function () {
    const canvas = document.getElementById(canvasElementId)
    paper.setup(canvas)

    const form = document.getElementById('rulerParameters');

    if (form.reportValidity()) {
        updateVariables()
        resizeCanvas()
        const stsRulerMarkings = getMarkings(stsRuler)
        const rowsRulerMarkings = getMarkings(rowsRuler)
        drawMarkings(stsRulerMarkings, rowsRulerMarkings)
        drawBorders()
        addRulerInfo(stsRuler)
        addRulerInfo(rowsRuler)

        paper.view.draw()
    }
}

const exportPdf = function () {
    document.getElementById("exportButton").addEventListener("click", function () {
        const filename = document.getElementById("filename").value

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
        pdf.save(filename)
    })
}

$(document).ready(function () {
    build()

    $("#rulerParameters").change(function () {
        build()
    })

    exportPdf()
})
