# Icon Assets Needed for Electron Build

The following icon files are required to build the Electron desktop app for each platform.
Place these files in this directory (`electron/assets/`) before running the build.

## Required Files

| File | Platform | Size | Format |
|------|----------|------|--------|
| `icon.ico` | Windows | 256×256 (multi-resolution) | ICO |
| `icon.icns` | macOS | 512×512 | ICNS |
| `icon.png` | Linux / Tray | 512×512 | PNG |
| `installerHeader.bmp` | Windows NSIS installer header | 150×57 | BMP |

## Design Guidelines

- Use the **JewelMS / Shrigar Jewellers** gem/diamond motif (💎)
- Primary color: `#D4AF37` (gold) on a dark background (`#1a1a2e` or `#6B0F1A`)
- The icon should be legible at small sizes (16×16 tray icon)

## Generating Icons

You can generate platform icons from a single high-resolution PNG using:

```bash
# Install icon generation tool
npm install -g electron-icon-builder

# From a 1024×1024 source PNG
electron-icon-builder --input=source-icon.png --output=electron/assets/
```

Or use online converters:
- ICO: https://icoconvert.com
- ICNS: https://cloudconvert.com/png-to-icns

## NSIS Installer Header

The `installerHeader.bmp` is displayed at the top of the Windows installer.
Dimensions: **150 × 57 pixels** (BMP format, 24-bit color).
