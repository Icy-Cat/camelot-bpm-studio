import math
import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = "/Users/icycat/Code/github/tools/camelot-bpm-studio/public"
os.makedirs(ASSETS_DIR, exist_ok=True)

# 12 Camelot wheel colors (standard harmonic mixing wheel spectrum)
CAMELOT_COLORS = [
    (0, 200, 180),    # 1: Aqua / Cyan-Green
    (0, 180, 240),    # 2: Cyan / Sky Blue
    (40, 130, 255),   # 3: Royal Blue
    (110, 80, 255),   # 4: Indigo / Violet
    (170, 60, 240),   # 5: Purple
    (230, 40, 180),   # 6: Magenta
    (240, 50, 90),    # 7: Crimson / Rose
    (245, 90, 40),    # 8: Red-Orange (8A/8B Am/C)
    (250, 150, 30),   # 9: Orange (9A/9B Em/G)
    (245, 210, 40),   # 10: Yellow (10A/10B Bm/D)
    (150, 220, 50),   # 11: Lime (11A/11B F#m/A)
    (40, 210, 110),   # 12: Emerald (12A/12B C#m/E)
]

def create_logo_image(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size / 2, size / 2
    r_outer = size * 0.46
    r_inner = size * 0.36
    r_vinyl = size * 0.34
    
    # Draw 12 Camelot segments
    for i in range(12):
        start_angle = i * 30 - 90
        end_angle = (i + 1) * 30 - 90
        color = CAMELOT_COLORS[i]
        
        # Arc segment polygon approximation
        pts = []
        steps = 16
        for s in range(steps + 1):
            rad = math.radians(start_angle + (end_angle - start_angle) * (s / steps))
            pts.append((cx + r_outer * math.cos(rad), cy + r_outer * math.sin(rad)))
        for s in range(steps, -1, -1):
            rad = math.radians(start_angle + (end_angle - start_angle) * (s / steps))
            pts.append((cx + r_inner * math.cos(rad), cy + r_inner * math.sin(rad)))
        
        draw.polygon(pts, fill=(color[0], color[1], color[2], 240))
    
    # Gap dividers between segments
    for i in range(12):
        rad = math.radians(i * 30 - 90)
        x1 = cx + (r_inner - 2) * math.cos(rad)
        y1 = cy + (r_inner - 2) * math.sin(rad)
        x2 = cx + (r_outer + 2) * math.cos(rad)
        y2 = cy + (r_outer + 2) * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=(15, 23, 42, 255), width=int(size * 0.015))
    
    # Vinyl record background
    draw.ellipse([cx - r_vinyl, cy - r_vinyl, cx + r_vinyl, cy + r_vinyl], fill=(15, 23, 42, 255), outline=(30, 41, 59, 255), width=int(size * 0.01))
    
    # Vinyl grooves
    for groove_r in [size * 0.31, size * 0.28, size * 0.25, size * 0.22]:
        draw.ellipse([cx - groove_r, cy - groove_r, cx + groove_r, cy + groove_r], fill=None, outline=(30, 41, 59, 140), width=1)
        
    # Center turntable spindle & label disc
    r_center = size * 0.17
    draw.ellipse([cx - r_center, cy - r_center, cx + r_center, cy + r_center], fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=int(size * 0.012))
    
    # Neon audio waveform bars cutting through center
    bars = [0.35, 0.65, 0.95, 0.55, 0.85, 1.0, 0.75, 0.45]
    bar_width = size * 0.02
    gap = size * 0.012
    total_w = len(bars) * bar_width + (len(bars) - 1) * gap
    start_x = cx - total_w / 2
    
    for idx, h_factor in enumerate(bars):
        bx = start_x + idx * (bar_width + gap)
        bh = size * 0.13 * h_factor
        by1 = cy - bh
        by2 = cy + bh
        color = CAMELOT_COLORS[(idx * 2) % 12]
        draw.rounded_rectangle([bx, by1, bx + bar_width, by2], radius=int(bar_width / 2), fill=(color[0], color[1], color[2], 255))
        
    # Small center spindle dot
    r_dot = size * 0.028
    draw.ellipse([cx - r_dot, cy - r_dot, cx + r_dot, cy + r_dot], fill=(255, 255, 255, 240))
    
    return img

def create_preview_card(w=1200, h=630):
    img = Image.new("RGBA", (w, h), (11, 15, 25, 255))
    draw = ImageDraw.Draw(img)
    
    # Background subtle radial grid / ambient glow
    for r in range(400, 50, -50):
        alpha = int(35 * (r / 400))
        draw.ellipse([300 - r, 315 - r, 300 + r, 315 + r], fill=None, outline=(59, 130, 246, alpha), width=1)
        
    # Draw logo on left
    logo = create_logo_image(380)
    img.paste(logo, (90, int((h - 380) / 2)), logo)
    
    # Right-side text layout
    tx = 530
    
    # Badge: 100% IN-BROWSER DJ ENGINE
    draw.rounded_rectangle([tx, 120, tx + 290, 156], radius=18, fill=(30, 41, 59, 230), outline=(59, 130, 246, 200), width=1)
    
    # Draw simulated clean modern title
    # Title: CAMELOT BPM STUDIO
    # Subtitle: Free In-Browser Key & BPM Finder for DJs
    # Feature Pills: Zero Uploads / Privacy • Batch MP3/WAV • Camelot 8A/8B • CSV Export
    
    # Feature badges
    pills = [
        ("100% Private (No Upload)", (34, 197, 94)),
        ("Instant Batch Drop", (59, 130, 246)),
        ("Camelot 8A / 8B Wheels", (249, 115, 22)),
        ("Half/Double Fix (70-140)", (168, 85, 247)),
    ]
    
    py = 370
    for text, pill_color in pills:
        draw.rounded_rectangle([tx, py, tx + 460, py + 42], radius=8, fill=(15, 23, 42, 200), outline=(pill_color[0], pill_color[1], pill_color[2], 180), width=1)
        draw.ellipse([tx + 16, py + 16, tx + 26, py + 26], fill=pill_color)
        py += 54
        
    return img

# Generate all icons and logos
logo_512 = create_logo_image(512)
logo_512.save(f"{ASSETS_DIR}/logo.png", "PNG")
logo_512.save(f"{ASSETS_DIR}/icon.png", "PNG")

apple_icon = create_logo_image(180)
apple_icon.save(f"{ASSETS_DIR}/apple-icon.png", "PNG")

# Generate multi-size favicon.ico
fav_16 = create_logo_image(16)
fav_32 = create_logo_image(32)
fav_48 = create_logo_image(48)
fav_32.save(f"{ASSETS_DIR}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# Generate preview.png
preview = create_preview_card(1200, 630)
preview.save(f"{ASSETS_DIR}/preview.png", "PNG")

print("Generated logo.png, icon.png, apple-icon.png, favicon.ico, and preview.png successfully!")
