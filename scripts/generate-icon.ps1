Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
    param(
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $Radius * 2

    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    return $path
}

function Fill-RoundedRect {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.Brush]$Brush,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $path = New-RoundedRectPath -X $X -Y $Y -Width $Width -Height $Height -Radius $Radius
    try {
        $Graphics.FillPath($Brush, $path)
    }
    finally {
        $path.Dispose()
    }
}

function Draw-Node {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$Diameter,
        [System.Drawing.Color]$FillColor,
        [System.Drawing.Color]$BorderColor
    )

    $rect = New-Object System.Drawing.RectangleF ($X - ($Diameter / 2)), ($Y - ($Diameter / 2)), $Diameter, $Diameter
    $fill = New-Object System.Drawing.SolidBrush $FillColor
    $border = New-Object System.Drawing.Pen $BorderColor, 4

    try {
        $Graphics.FillEllipse($fill, $rect)
        $Graphics.DrawEllipse($border, $rect)
    }
    finally {
        $fill.Dispose()
        $border.Dispose()
    }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$imagesDirectory = Join-Path $projectRoot "images"
$iconPath = Join-Path $imagesDirectory "icon.png"

[void](New-Item -ItemType Directory -Force -Path $imagesDirectory)

$size = 256
$bitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $backgroundPath = New-RoundedRectPath -X 12 -Y 12 -Width 232 -Height 232 -Radius 52
    $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF 16, 12),
        (New-Object System.Drawing.PointF 240, 244),
        ([System.Drawing.Color]::FromArgb(255, 29, 33, 44)),
        ([System.Drawing.Color]::FromArgb(255, 47, 81, 148))
    )
    $backgroundBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 220, 230, 248)), 2

    try {
        $graphics.FillPath($backgroundBrush, $backgroundPath)
        $graphics.DrawPath($backgroundBorder, $backgroundPath)
    }
    finally {
        $backgroundBrush.Dispose()
        $backgroundBorder.Dispose()
        $backgroundPath.Dispose()
    }

    $glowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(26, 255, 255, 255))
    try {
        $graphics.FillEllipse($glowBrush, 22, 8, 156, 96)
    }
    finally {
        $glowBrush.Dispose()
    }

    $annotationBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF 26, 32),
        (New-Object System.Drawing.PointF 100, 224),
        ([System.Drawing.Color]::FromArgb(235, 39, 53, 80)),
        ([System.Drawing.Color]::FromArgb(235, 34, 38, 50))
    )
    try {
        Fill-RoundedRect -Graphics $graphics -Brush $annotationBrush -X 26 -Y 32 -Width 74 -Height 192 -Radius 28
    }
    finally {
        $annotationBrush.Dispose()
    }

    $annotationBarBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(108, 210, 218, 230))
    try {
        Fill-RoundedRect -Graphics $graphics -Brush $annotationBarBrush -X 40 -Y 64 -Width 40 -Height 10 -Radius 5
        Fill-RoundedRect -Graphics $graphics -Brush $annotationBarBrush -X 40 -Y 100 -Width 30 -Height 10 -Radius 5
        Fill-RoundedRect -Graphics $graphics -Brush $annotationBarBrush -X 40 -Y 136 -Width 36 -Height 10 -Radius 5
        Fill-RoundedRect -Graphics $graphics -Brush $annotationBarBrush -X 40 -Y 172 -Width 28 -Height 10 -Radius 5
    }
    finally {
        $annotationBarBrush.Dispose()
    }

    $separatorPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(64, 184, 204, 232)), 2
    try {
        $graphics.DrawLine($separatorPen, 106, 42, 106, 214)
    }
    finally {
        $separatorPen.Dispose()
    }

    $codeLineBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(138, 228, 233, 242))
    try {
        Fill-RoundedRect -Graphics $graphics -Brush $codeLineBrush -X 128 -Y 54 -Width 70 -Height 14 -Radius 7
        Fill-RoundedRect -Graphics $graphics -Brush $codeLineBrush -X 128 -Y 188 -Width 58 -Height 14 -Radius 7
    }
    finally {
        $codeLineBrush.Dispose()
    }

    $graphPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(236, 242, 249)), 14
    $graphPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    try {
        $graphics.DrawLine($graphPen, 92, 178, 132, 136)
        $graphics.DrawLine($graphPen, 132, 136, 180, 88)
        $graphics.DrawLine($graphPen, 132, 136, 182, 178)
    }
    finally {
        $graphPen.Dispose()
    }

    Draw-Node -Graphics $graphics -X 92 -Y 178 -Diameter 28 `
        -FillColor ([System.Drawing.Color]::FromArgb(255, 140, 144, 149)) `
        -BorderColor ([System.Drawing.Color]::FromArgb(210, 29, 33, 44))

    Draw-Node -Graphics $graphics -X 132 -Y 136 -Diameter 30 `
        -FillColor ([System.Drawing.Color]::FromArgb(255, 206, 208, 214)) `
        -BorderColor ([System.Drawing.Color]::FromArgb(210, 29, 33, 44))

    Draw-Node -Graphics $graphics -X 180 -Y 88 -Diameter 26 `
        -FillColor ([System.Drawing.Color]::FromArgb(255, 47, 81, 148)) `
        -BorderColor ([System.Drawing.Color]::FromArgb(236, 242, 249))

    Draw-Node -Graphics $graphics -X 182 -Y 178 -Diameter 24 `
        -FillColor ([System.Drawing.Color]::FromArgb(255, 46, 160, 67)) `
        -BorderColor ([System.Drawing.Color]::FromArgb(236, 242, 249))

    $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 12, 15, 22))
    try {
        $graphics.FillEllipse($shadowBrush, 168, 168, 42, 24)
    }
    finally {
        $shadowBrush.Dispose()
    }

    $bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
    $graphics.Dispose()
    $bitmap.Dispose()
}

Write-Output "Generated icon at $iconPath"
