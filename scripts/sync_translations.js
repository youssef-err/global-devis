const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const EN_PATH = path.join(MESSAGES_DIR, 'en.json');

function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                if (!(key in target)) {
                    output[key] = source[key];
                }
            }
        });
    }
    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function sync() {
    console.log('Starting translation sync...');
    
    if (!fs.existsSync(EN_PATH)) {
        console.error('en.json not found!');
        process.exit(1);
    }

    const enContent = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
    const files = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');

    files.forEach(file => {
        const filePath = path.join(MESSAGES_DIR, file);
        console.log(`Syncing ${file}...`);
        
        let content;
        try {
            content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error parsing ${file}, skipping.`);
            return;
        }

        // Special handling for Invoice.share (string vs object)
        if (content.Invoice && typeof content.Invoice.share === 'string') {
            console.log(`  Renaming Invoice.share to Invoice.shareLabel in ${file}`);
            content.Invoice.shareLabel = content.Invoice.share;
            delete content.Invoice.share;
        }

        // Merge with EN as reference
        const syncedContent = deepMerge(content, enContent);

        // Final sanitation/ordering (optional, but keeps it neat)
        const ordered = {};
        Object.keys(enContent).sort().forEach(key => {
            ordered[key] = syncedContent[key] || enContent[key];
        });

        fs.writeFileSync(filePath, JSON.stringify(syncedContent, null, 2), 'utf8');
    });

    console.log('Sync complete!');
}

sync();
