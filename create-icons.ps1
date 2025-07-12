# PowerShell script to create simple PNG icons
Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param([int]$size, [string]$filename)
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Set high quality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Create gradient brush
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 102, 0), [System.Drawing.Color]::FromArgb(255, 133, 51), 45)
    
    # Draw circle
    $margin = 2
    $graphics.FillEllipse($brush, $margin, $margin, $size - $margin * 2, $size - $margin * 2)
    
    # Draw white border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 2)
    $graphics.DrawEllipse($pen, $margin, $margin, $size - $margin * 2, $size - $margin * 2)
    
    # Draw checkmark
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(2, $size / 16))
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    
    # Checkmark points
    $x1 = $size * 0.25
    $y1 = $size * 0.5
    $x2 = $size * 0.4
    $y2 = $size * 0.65
    $x3 = $size * 0.75
    $y3 = $size * 0.3
    
    $graphics.DrawLine($whitePen, $x1, $y1, $x2, $y2)
    $graphics.DrawLine($whitePen, $x2, $y2, $x3, $y3)
    
    # Add text for larger icons
    if ($size -ge 48) {
        $font = New-Object System.Drawing.Font("Arial", ($size / 10), [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $textFormat = New-Object System.Drawing.StringFormat
        $textFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $textFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        
        $textRect = New-Object System.Drawing.RectangleF(0, $size * 0.75, $size, $size * 0.2)
        $graphics.DrawString("BLOCK", $font, $textBrush, $textRect, $textFormat)
    }
    
    # Save PNG
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $whitePen.Dispose()
    
    Write-Host "Created $filename ($size x $size)"
}

# Create all icon sizes
Create-Icon -size 16 -filename "icons\icon16.png"
Create-Icon -size 32 -filename "icons\icon32.png"
Create-Icon -size 48 -filename "icons\icon48.png"
Create-Icon -size 128 -filename "icons\icon128.png"

Write-Host "All icons created successfully!"
