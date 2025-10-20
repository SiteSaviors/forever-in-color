// scripts/optimize-images.js
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '../public/styles'),
  outputDir: path.join(__dirname, '../public/styles'),
  formats: {
    webp: {
      quality: 85,
      effort: 6, // 0-6, higher = better compression but slower
    },
    avif: {
      quality: 80,
      effort: 4, // 0-9, AVIF is slower so use moderate effort
    }
  },
  // Keep originals for fallback
  preserveOriginal: true,
  // Generate manifest for registry
  generateManifest: true
};

// Image processing queue with concurrency control
class ImageProcessor {
  constructor(concurrency = 4) {
    this.concurrency = concurrency;
    this.queue = [];
    this.processing = 0;
  }

  async process(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.processing >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.processing++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing--;
      this.processNext();
    }
  }
}

// Main optimization function
async function optimizeImages() {
  console.log('🎨 Starting Wondertone image optimization...\n');
  
  const processor = new ImageProcessor(4);
  const manifest = {
    timestamp: new Date().toISOString(),
    images: {},
    stats: {
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      savings: {}
    }
  };

  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Find all JPEG images
    const files = await fs.readdir(CONFIG.sourceDir);
    const jpegFiles = files.filter(f => /\.(jpg|jpeg)$/i.test(f));
    
    console.log(`Found ${jpegFiles.length} JPEG images to optimize\n`);

    // Process each image
    const tasks = jpegFiles.map(filename => async () => {
      const basename = path.basename(filename, path.extname(filename));
      const sourcePath = path.join(CONFIG.sourceDir, filename);
      
      // Get original file stats
      const stats = await fs.stat(sourcePath);
      const originalSize = stats.size;
      
      console.log(`Processing: ${filename}`);
      
      const imageData = await fs.readFile(sourcePath);
      const image = sharp(imageData);
      
      // Get image metadata for manifest
      const metadata = await image.metadata();
      
      manifest.images[basename] = {
        original: {
          filename,
          size: originalSize,
          width: metadata.width,
          height: metadata.height,
          format: 'jpeg'
        },
        variants: {}
      };
      
      manifest.stats.totalOriginalSize += originalSize;
      
      // Generate WebP variant
      if (CONFIG.formats.webp) {
        const webpPath = path.join(CONFIG.outputDir, `${basename}.webp`);
        const webpBuffer = await image
          .webp({
            quality: CONFIG.formats.webp.quality,
            effort: CONFIG.formats.webp.effort,
            smartSubsample: true, // Better color preservation
          })
          .toBuffer();
        
        await fs.writeFile(webpPath, webpBuffer);
        const webpSize = webpBuffer.length;
        
        manifest.images[basename].variants.webp = {
          filename: `${basename}.webp`,
          size: webpSize,
          savings: Math.round((1 - webpSize / originalSize) * 100)
        };
        
        manifest.stats.totalOptimizedSize += webpSize;
        
        console.log(`  ✅ WebP: ${formatBytes(webpSize)} (${manifest.images[basename].variants.webp.savings}% smaller)`);
      }
      
      // Generate AVIF variant
      if (CONFIG.formats.avif) {
        const avifPath = path.join(CONFIG.outputDir, `${basename}.avif`);
        const avifBuffer = await image
          .avif({
            quality: CONFIG.formats.avif.quality,
            effort: CONFIG.formats.avif.effort,
            chromaSubsampling: '4:4:4', // Best quality for art
          })
          .toBuffer();
        
        await fs.writeFile(avifPath, avifBuffer);
        const avifSize = avifBuffer.length;
        
        manifest.images[basename].variants.avif = {
          filename: `${basename}.avif`,
          size: avifSize,
          savings: Math.round((1 - avifSize / originalSize) * 100)
        };
        
        manifest.stats.totalOptimizedSize += avifSize;
        
        console.log(`  ✅ AVIF: ${formatBytes(avifSize)} (${manifest.images[basename].variants.avif.savings}% smaller)`);
      }
      
      return basename;
    });

    // Process all images with concurrency control
    const results = await Promise.all(
      tasks.map(task => processor.process(task))
    );
    
    // Calculate total savings
    manifest.stats.savings = {
      bytes: manifest.stats.totalOriginalSize - manifest.stats.totalOptimizedSize,
      percentage: Math.round(
        (1 - manifest.stats.totalOptimizedSize / manifest.stats.totalOriginalSize) * 100
      )
    };
    
    // Write manifest file for registry generator
    if (CONFIG.generateManifest) {
      const manifestPath = path.join(CONFIG.outputDir, 'image-manifest.json');
      await fs.writeFile(
        manifestPath,
        JSON.stringify(manifest, null, 2)
      );
      console.log(`\n📄 Manifest written to: ${manifestPath}`);
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ Optimization Complete!');
    console.log('='.repeat(50));
    console.log(`Images processed: ${results.length}`);
    console.log(`Original size: ${formatBytes(manifest.stats.totalOriginalSize)}`);
    console.log(`Optimized size: ${formatBytes(manifest.stats.totalOptimizedSize)}`);
    console.log(`Total savings: ${formatBytes(manifest.stats.savings.bytes)} (${manifest.stats.savings.percentage}%)`);
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

// Utility function to format bytes
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Run the optimization
optimizeImages();