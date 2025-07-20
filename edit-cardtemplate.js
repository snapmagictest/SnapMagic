/**
 * Edit cardtemplate.jpg to add simple gold header and footer bars
 * Header: AWS logo space
 * Footer: Event name, logos, creator space
 */

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function editCardTemplate() {
    console.log('🎨 Editing cardtemplate.jpg to add gold header and footer bars...');
    
    try {
        // Load the existing cardtemplate.jpg
        const originalImage = await loadImage('cardtemplate.jpg');
        console.log(`✅ Loaded cardtemplate.jpg: ${originalImage.width}x${originalImage.height}`);
        
        // Create canvas with same dimensions
        const canvas = createCanvas(originalImage.width, originalImage.height);
        const ctx = canvas.getContext('2d');
        
        // Draw the original template
        ctx.drawImage(originalImage, 0, 0);
        console.log('✅ Original template drawn');
        
        // Gold color (matching the existing frame)
        const goldColor = '#D4AF37'; // Rich gold to match existing design
        
        // Header bar dimensions
        const headerHeight = 40;
        const headerY = 60; // Position below the top decorative elements
        const headerX = 80; // Start after left decorative elements
        const headerWidth = originalImage.width - 160; // Leave space for decorations
        
        // Footer bar dimensions  
        const footerHeight = 60;
        const footerY = originalImage.height - 120; // Position above bottom decorative elements
        const footerX = 80; // Start after left decorative elements
        const footerWidth = originalImage.width - 160; // Leave space for decorations
        
        // Draw header bar outline only
        ctx.strokeStyle = goldColor; // Gold outline
        ctx.lineWidth = 3;
        ctx.strokeRect(headerX, headerY, headerWidth, headerHeight);
        
        console.log(`✅ Header bar outline added: ${headerWidth}x${headerHeight} at (${headerX}, ${headerY})`);
        
        // Draw footer bar outline only
        ctx.strokeStyle = goldColor; // Gold outline
        ctx.lineWidth = 3;
        ctx.strokeRect(footerX, footerY, footerWidth, footerHeight);
        
        console.log(`✅ Footer bar outline added: ${footerWidth}x${footerHeight} at (${footerX}, ${footerY})`);
        
        // Save the edited template
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
        fs.writeFileSync('cardtemplate-with-bars.jpg', buffer);
        
        console.log('✅ Edited cardtemplate saved as: cardtemplate-with-bars.jpg');
        
        // Also save as PNG for better quality
        const pngBuffer = canvas.toBuffer('image/png');
        fs.writeFileSync('cardtemplate-with-bars.png', pngBuffer);
        
        console.log('✅ High-quality PNG version saved as: cardtemplate-with-bars.png');
        
        return {
            success: true,
            originalSize: { width: originalImage.width, height: originalImage.height },
            headerBar: { x: headerX, y: headerY, width: headerWidth, height: headerHeight },
            footerBar: { x: footerX, y: footerY, width: footerWidth, height: footerHeight },
            files: ['cardtemplate-with-bars.jpg', 'cardtemplate-with-bars.png']
        };
        
    } catch (error) {
        console.error('❌ Error editing cardtemplate:', error);
        throw error;
    }
}

// Run the edit
if (require.main === module) {
    console.log('🎨 CARDTEMPLATE EDITOR - Adding Gold Header & Footer Bars');
    console.log('=====================================================\n');
    
    editCardTemplate()
        .then(result => {
            console.log('\n🎉 SUCCESS! CardTemplate edited successfully');
            console.log('📐 Original size:', `${result.originalSize.width}x${result.originalSize.height}`);
            console.log('📋 Header bar:', `${result.headerBar.width}x${result.headerBar.height} at (${result.headerBar.x}, ${result.headerBar.y})`);
            console.log('📋 Footer bar:', `${result.footerBar.width}x${result.footerBar.height} at (${result.footerBar.x}, ${result.footerBar.y})`);
            console.log('📁 Files created:', result.files.join(', '));
            console.log('\n🚀 Ready for SnapMagic integration!');
        })
        .catch(error => {
            console.error('❌ Failed to edit cardtemplate:', error.message);
            process.exit(1);
        });
}

module.exports = { editCardTemplate };
