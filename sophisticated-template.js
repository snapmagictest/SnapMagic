/**
 * SOPHISTICATED ART DECO TEMPLATE
 * Focused script for creating and perfecting the sophisticated-art-deco-template.png
 * Perfect for SnapMagic AWS events
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

function createSophisticatedArtDecoTemplate() {
    console.log('🎨 Creating Sophisticated Art Deco Card Template...');
    
    // Template dimensions - Professional card proportions
    const WIDTH = 420;
    const HEIGHT = 680;
    
    // Create canvas
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    
    // Sophisticated Art Deco color palette
    const COLORS = {
        background: '#000000',           // Deep black
        goldPrimary: '#D4AF37',         // Rich gold
        goldSecondary: '#B8860B',       // Darker gold
        goldAccent: '#FFD700',          // Bright gold highlights
        goldMuted: '#CD853F',           // Muted gold for details
        champagne: '#F7E7CE',           // Light champagne
        bronze: '#CD7F32'               // Bronze accents
    };
    
    // Layout areas
    const LAYOUT = {
        // Main image area - centered and proportioned
        imageArea: {
            x: 30,
            y: 90,
            width: 360,
            height: 480
        },
        // Header area for logos/branding
        headerArea: {
            x: 60,
            y: 30,
            width: 300,
            height: 50
        },
        // Footer area for AWS branding
        footerArea: {
            x: 30,
            y: 580,
            width: 360,
            height: 80
        }
    };
    
    // === STEP 1: BACKGROUND ===
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // === STEP 2: OUTER BORDER FRAMEWORK ===
    // Multiple layered borders for depth
    ctx.strokeStyle = COLORS.goldPrimary;
    ctx.lineWidth = 1;
    ctx.strokeRect(3, 3, WIDTH - 6, HEIGHT - 6);
    
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, WIDTH - 16, HEIGHT - 16);
    
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, WIDTH - 24, HEIGHT - 24);
    
    // === STEP 3: SOPHISTICATED CORNER DECORATIONS ===
    function drawArtDecoCorner(x, y, flipX, flipY) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX, flipY);
        
        // Outer geometric frame
        ctx.strokeStyle = COLORS.goldPrimary;
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 15, 50, 50);
        
        // Inner stepped rectangles
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, 40, 40);
        ctx.strokeRect(25, 25, 30, 30);
        ctx.strokeRect(30, 30, 20, 20);
        
        // Art Deco stepped pattern
        ctx.strokeStyle = COLORS.goldAccent;
        ctx.lineWidth = 1;
        
        // Diagonal stepped lines
        ctx.beginPath();
        ctx.moveTo(15, 35);
        ctx.lineTo(25, 25);
        ctx.lineTo(35, 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(45, 15);
        ctx.lineTo(55, 25);
        ctx.lineTo(65, 35);
        ctx.stroke();
        
        // Central diamond accent
        ctx.fillStyle = COLORS.goldAccent;
        ctx.beginPath();
        ctx.moveTo(40, 35);
        ctx.lineTo(45, 40);
        ctx.lineTo(40, 45);
        ctx.lineTo(35, 40);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // Draw all four corners
    drawArtDecoCorner(0, 0, 1, 1);           // Top-left
    drawArtDecoCorner(WIDTH, 0, -1, 1);      // Top-right
    drawArtDecoCorner(0, HEIGHT, 1, -1);     // Bottom-left
    drawArtDecoCorner(WIDTH, HEIGHT, -1, -1); // Bottom-right
    
    // === STEP 4: HEADER PANEL ===
    const header = LAYOUT.headerArea;
    
    // Main header frame
    ctx.strokeStyle = COLORS.goldPrimary;
    ctx.lineWidth = 2;
    ctx.strokeRect(header.x, header.y, header.width, header.height);
    
    // Inner header detail
    ctx.lineWidth = 1;
    ctx.strokeRect(header.x + 3, header.y + 3, header.width - 6, header.height - 6);
    
    // Header corner accents
    ctx.fillStyle = COLORS.goldAccent;
    const accentSize = 6;
    ctx.fillRect(header.x + 2, header.y + 2, accentSize, accentSize);
    ctx.fillRect(header.x + header.width - accentSize - 2, header.y + 2, accentSize, accentSize);
    ctx.fillRect(header.x + 2, header.y + header.height - accentSize - 2, accentSize, accentSize);
    ctx.fillRect(header.x + header.width - accentSize - 2, header.y + header.height - accentSize - 2, accentSize, accentSize);
    
    // === STEP 5: MAIN IMAGE AREA ===
    const imgArea = LAYOUT.imageArea;
    
    // Main image frame
    ctx.strokeStyle = COLORS.goldPrimary;
    ctx.lineWidth = 3;
    ctx.strokeRect(imgArea.x, imgArea.y, imgArea.width, imgArea.height);
    
    // Inner image border
    ctx.lineWidth = 1;
    ctx.strokeRect(imgArea.x + 3, imgArea.y + 3, imgArea.width - 6, imgArea.height - 6);
    
    // Side decorative elements
    function drawSideDecoration(x, y, width, height) {
        ctx.strokeStyle = COLORS.goldSecondary;
        ctx.lineWidth = 1;
        
        // Vertical decorative lines
        for (let i = 0; i < 3; i++) {
            const lineX = x + (width / 4) * (i + 1);
            ctx.beginPath();
            ctx.moveTo(lineX, y + 10);
            ctx.lineTo(lineX, y + height - 10);
            ctx.stroke();
        }
        
        // Horizontal accent lines
        ctx.beginPath();
        ctx.moveTo(x + 5, y + height / 3);
        ctx.lineTo(x + width - 5, y + height / 3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 5, y + (height * 2) / 3);
        ctx.lineTo(x + width - 5, y + (height * 2) / 3);
        ctx.stroke();
    }
    
    // Left and right side decorations
    drawSideDecoration(imgArea.x - 20, imgArea.y + 50, 15, imgArea.height - 100);
    drawSideDecoration(imgArea.x + imgArea.width + 5, imgArea.y + 50, 15, imgArea.height - 100);
    
    // === STEP 6: FOOTER PANEL WITH ART DECO STYLING ===
    const footer = LAYOUT.footerArea;
    
    // Art Deco stepped footer design
    ctx.strokeStyle = COLORS.goldPrimary;
    ctx.lineWidth = 2;
    
    const stepWidth = 40;
    const stepHeight = 25;
    
    // Draw stepped footer shape
    ctx.beginPath();
    // Top edge
    ctx.moveTo(footer.x, footer.y);
    ctx.lineTo(footer.x + footer.width, footer.y);
    // Right edge with step
    ctx.lineTo(footer.x + footer.width, footer.y + stepHeight);
    ctx.lineTo(footer.x + footer.width - stepWidth, footer.y + stepHeight);
    ctx.lineTo(footer.x + footer.width - stepWidth, footer.y + footer.height);
    // Bottom edge
    ctx.lineTo(footer.x + stepWidth, footer.y + footer.height);
    // Left edge with step
    ctx.lineTo(footer.x + stepWidth, footer.y + stepHeight);
    ctx.lineTo(footer.x, footer.y + stepHeight);
    ctx.closePath();
    ctx.stroke();
    
    // Inner footer border
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(footer.x + 3, footer.y + 3);
    ctx.lineTo(footer.x + footer.width - 3, footer.y + 3);
    ctx.lineTo(footer.x + footer.width - 3, footer.y + stepHeight - 3);
    ctx.lineTo(footer.x + footer.width - stepWidth + 3, footer.y + stepHeight - 3);
    ctx.lineTo(footer.x + footer.width - stepWidth + 3, footer.y + footer.height - 3);
    ctx.lineTo(footer.x + stepWidth - 3, footer.y + footer.height - 3);
    ctx.lineTo(footer.x + stepWidth - 3, footer.y + stepHeight - 3);
    ctx.lineTo(footer.x + 3, footer.y + stepHeight - 3);
    ctx.closePath();
    ctx.stroke();
    
    // Footer corner accents
    ctx.fillStyle = COLORS.goldAccent;
    ctx.fillRect(footer.x + 2, footer.y + 2, 8, 8);
    ctx.fillRect(footer.x + footer.width - 10, footer.y + 2, 8, 8);
    ctx.fillRect(footer.x + stepWidth - 4, footer.y + footer.height - 10, 8, 8);
    ctx.fillRect(footer.x + footer.width - stepWidth - 4, footer.y + footer.height - 10, 8, 8);
    
    // === STEP 7: CENTRAL DECORATIVE ACCENTS ===
    // Top center accent
    ctx.fillStyle = COLORS.goldAccent;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, imgArea.y - 15);
    ctx.lineTo(WIDTH / 2 - 8, imgArea.y - 5);
    ctx.lineTo(WIDTH / 2 + 8, imgArea.y - 5);
    ctx.closePath();
    ctx.fill();
    
    // Bottom center accent
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, footer.y - 5);
    ctx.lineTo(WIDTH / 2 - 8, footer.y - 15);
    ctx.lineTo(WIDTH / 2 + 8, footer.y - 15);
    ctx.closePath();
    ctx.fill();
    
    // === SAVE TEMPLATE ===
    const buffer = canvas.toBuffer('image/png');
    const filename = 'sophisticated-art-deco-template.png';
    fs.writeFileSync(filename, buffer);
    
    console.log('✅ Sophisticated Art Deco Template Created!');
    console.log('📁 File:', filename);
    console.log('📐 Dimensions:', `${WIDTH}x${HEIGHT}`);
    console.log('🖼️ Image Area:', `${imgArea.width}x${imgArea.height} at (${imgArea.x}, ${imgArea.y})`);
    console.log('🎨 Style: Professional Art Deco with stepped geometric patterns');
    console.log('🏛️ Features: Layered borders, corner decorations, stepped footer');
    
    return {
        filename,
        dimensions: { width: WIDTH, height: HEIGHT },
        imageArea: imgArea,
        headerArea: header,
        footerArea: footer,
        colors: COLORS,
        layout: LAYOUT
    };
}

// Test and validate the template
function testTemplate() {
    console.log('\n🧪 Testing Sophisticated Art Deco Template...');
    
    const filename = 'sophisticated-art-deco-template.png';
    
    if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename);
        console.log(`✅ ${filename}: ${Math.round(stats.size / 1024)}KB`);
        console.log('📋 Template ready for SnapMagic integration');
        return true;
    } else {
        console.log(`❌ ${filename}: Not found`);
        return false;
    }
}

// Main execution
if (require.main === module) {
    console.log('🎨 SOPHISTICATED ART DECO TEMPLATE GENERATOR');
    console.log('===========================================\n');
    
    try {
        const result = createSophisticatedArtDecoTemplate();
        const testResult = testTemplate();
        
        if (testResult) {
            console.log('\n🎉 SUCCESS! Sophisticated Art Deco Template Ready');
            console.log('🚀 Perfect for SnapMagic AWS events!');
        }
        
    } catch (error) {
        console.error('❌ Error creating template:', error.message);
        process.exit(1);
    }
}

module.exports = {
    createSophisticatedArtDecoTemplate,
    testTemplate
};
