//TODO test printing for 1 stitch markings
//TODO adjust constants
//TODO adjust labels positions
//TODO update readme
//TODO make a screenshot
//TODO add favicon

const drawDpi = 300
const pdfDpi = 72
const cmPerInch = 2.54
const pxPerCm = drawDpi / cmPerInch

const rulerWidthPx = 3 * pxPerCm
const fontSize = 26
const leftMargin = 30
const rightMargin = 60
const betweenRulers = 100

const gaugeCm = 10

const marking = {
    long: 0.8 * pxPerCm,
    medium: 0.4 * pxPerCm,
    short: 0.2 * pxPerCm,
    micro: 0.075 * pxPerCm,
}

const paperSizes = {
    "A5": {
        short: 11.5,
        long: 17
    },
    "A4": {
        short: 17,
        long: 26
    },
    "A3": {
        short: 26,
        long: 38
    }
}

const canvasElementId = "rulerCanvas"
const paperSizeElementId = "paperSize"
const filenameElementId = "filename"

const stsRuler = {
    unit: "stitches",
    isVertical: false,
    verticalMarkings: false,
    startX: 0,
    startY: 0
}

const rowsRuler = {
    unit: "rows",
    startX: 0
}

const updateVariables = function () {
    const paperSize = document.getElementById(paperSizeElementId).value
    const square = document.getElementById("square").checked

    if (square) {
        stsRuler.square = true
        stsRuler.lengthPx = pxPerCm * paperSizes[paperSize].short

        rowsRuler.square = true
        rowsRuler.isVertical = true
        rowsRuler.verticalMarkings = false
        rowsRuler.lengthPx = pxPerCm * paperSizes[paperSize].long
        rowsRuler.startY = 0
    } else {
        stsRuler.square = false
        stsRuler.lengthPx = pxPerCm * paperSizes[paperSize].long

        rowsRuler.square = false
        rowsRuler.isVertical = false
        rowsRuler.verticalMarkings = true
        rowsRuler.lengthPx = pxPerCm * paperSizes[paperSize].long
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

    document.getElementById(filenameElementId).value = "ruler_"
        + stsRuler.sts.toString().replace(/\./g, "_")
        + "_sts_"
        + rowsRuler.sts.toString().replace(/\./g, "_")
        + "_rows"
        + "_per_10_cm"
        + "_" + paperSize
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

const getMarkingPoints = function (ruler, index, markingLength, spacing) {
    if (ruler.square && (index === 0)) {
        return null
    }

    let x1 = ruler.startX + (spacing * index) + (ruler.square ? 0 : leftMargin)
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
        start: {
            x: x1,
            y: y1
        },
        finish: {
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

const setTextParams = function (text, justification, content, name) {
    text.fillColor = "black"
    text.justification = justification
    text.content = content
    text.name = name
    text.style = {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: fontSize
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

    let textPoint = new paper.Point(point.x + xLabelOffset, point.y + yLabelOffset)
    let text = new paper.PointText(textPoint)
    setTextParams(text, "left", label, ruler.unit + " label no. " + label)

    if (ruler.verticalMarkings) {
        text.rotate(90, textPoint)
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
    let textPoint = ruler.isVertical ? new paper.Point(y, x) : new paper.Point(x, y)

    let text = new paper.PointText(textPoint)
    setTextParams(text, "right",
        "Scale 1/" + ruler.scale + ", " +
            "gauge " + ruler.sts + " " + ruler.unit + " per " + gaugeCm + " cm",
        ruler.unit + " ruler info ")

    if (ruler.isVertical) {
        text.rotate(90, textPoint)
    }
}

const getMarkings = function (ruler) {
    let spacing =  ruler.pxPerSt / ruler.scale
    let distance = (spacing < 10) ? 2 : 1
    let markings = []

    for (let i = 0; i <= ruler.lengthSts; i++) {
        if (i % distance !== 0) {
            markings.push({
                start: null,
                finish: null,
                index: i,
                assignNumber: false
            })
            continue
        }
        let markingLength = marking.long
        let assignNumber = (i % 10 === 0)
        if (!assignNumber) {
            markingLength = (i % 5 === 0) ? marking.medium : marking.short
        }
        let points = getMarkingPoints(ruler, i, markingLength, spacing)
        if (points != null) {
            markings.push({
                start: points.start,
                finish: points.finish,
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
            if (arePointsNearby(stsRulerMarkings[i].finish, rowsRulerMarkings[i].finish)) {
                stsRulerMarkings[i].finish.y = rowsRulerMarkings[i].finish.y
                rowsRulerMarkings[i].finish.x = stsRulerMarkings[i].finish.x
                stsRulerMarkings[i].assignNumber = false
                rowsRulerMarkings[i].assignNumber = false
                if ((i > 0) && (arePointsNearby(stsRulerMarkings[i - 1].finish, rowsRulerMarkings[i].finish))) {
                    stsRulerMarkings[i - 1].finish.y = stsRulerMarkings[i - 1].start.y + marking.micro
                }
                if ((i > 0) && (arePointsNearby(rowsRulerMarkings[i - 1].finish, stsRulerMarkings[i].finish))) {
                    rowsRulerMarkings[i - 1].finish.x = rowsRulerMarkings[i - 1].start.x + marking.micro
                }
            }
        }
    }
    drawRulerMarkings(stsRuler, stsRulerMarkings)
    drawRulerMarkings(rowsRuler, rowsRulerMarkings)
}

const arePointsNearby = function(point1, point2) {
    if ((point1 === null) || (point2 === null)) {
        return false
    }
    const delta = 10
    return (Math.abs(point1.x - point2.x) < delta) || (Math.abs(point1.y - point2.y) < delta)
}

const drawRulerMarkings = function(ruler, rulerMarkings) {
    for (let m of rulerMarkings) {
        drawMarking(ruler, m.start, m.finish, m.index, m.assignNumber)
    }
}

const build = function () {
    const canvas = document.getElementById(canvasElementId)
    paper.setup(canvas)

    const form = document.getElementById('rulerParameters');

    if (form.reportValidity()) {
        updateVariables()
        resizeCanvas()
        drawMarkings(getMarkings(stsRuler), getMarkings(rowsRuler))
        drawBorders()
        addRulerInfo(stsRuler)
        addRulerInfo(rowsRuler)

        paper.view.draw()
    }
}

const exportPdf = function () {
    document.getElementById("exportButton").addEventListener("click", function () {
        const filename = document.getElementById(filenameElementId).value

        const canvas = document.getElementById(canvasElementId)
        const imgData = canvas.toDataURL("image/png")

        const { jsPDF } = window.jspdf

        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? "landscape" : "portrait",
            unit: "pt",
            format: document.getElementById(paperSizeElementId).value
        })

        const ptPerPx = pdfDpi / drawDpi
        const imgWidthPt = canvas.width * ptPerPx
        const imgHeightPt = canvas.height * ptPerPx

        pdf.addImage(imgData, "PNG", 40, 40, imgWidthPt, imgHeightPt)
        pdf.save(filename)
    })
}

document.addEventListener("DOMContentLoaded", function () {
    build();

    document.getElementById("rulerParameters").addEventListener("change", function () {
        build();
    });

    exportPdf();
});

