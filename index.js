import S3 from 'aws-sdk/clients/s3.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from hardcoded path
dotenv.config({ path: 'D:\\Utils\\cfdrive\\.env' });

const s3 = new S3({
    endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_KEY_SECRET,
    signatureVersion: "v4",
});

function generateRandomString(length = 10) {
    return crypto.randomBytes(length).toString('hex');
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.csv': 'text/csv',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.7z': 'application/x-7z-compressed',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

async function upload(filePath, bucketPath = '') {
    // Resolve the file path relative to the current working directory
    const resolvedPath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${filePath} (resolved to ${resolvedPath})`);
    }

    const fileName = path.basename(resolvedPath);
    const randomString = generateRandomString();

    // Combine bucket path with filename, ensuring proper path formatting
    const key = bucketPath
        ? `${bucketPath.replace(/^\/+|\/+$/g, '')}/${randomString}-${fileName}`
        : `${randomString}-${fileName}`;

    const fileContent = fs.readFileSync(resolvedPath);
    const contentType = getContentType(resolvedPath);

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType
    };

    try {
        await s3.upload(params).promise();
        console.log(`File uploaded successfully: ${key}`);
        return key;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

function generateDownloadUrl(key) {
    if (!process.env.CUSTOM_BUCKET_URL) {
        throw new Error('CUSTOM_BUCKET_URL environment variable is required for permanent download URLs');
    }

    const customUrl = process.env.CUSTOM_BUCKET_URL.replace(/\/$/, '');
    return `${customUrl}/${key}`;
}

async function main() {
    // Use yargs to parse command line arguments
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: cfdrive <command> [options]')
        .command('upload <file>', 'Upload a file to Cloudflare R2', (yargs) => {
            return yargs
                .positional('file', {
                    describe: 'File path to upload',
                    type: 'string',
                    demandOption: true
                })
                .option('path', {
                    alias: 'p',
                    describe: 'Bucket path where the file should be stored',
                    type: 'string',
                    default: 'temp'
                });
        })
        .example('cfdrive upload ./image.jpg', 'Upload image.jpg to the default "temp" path')
        .example('cfdrive upload ./document.pdf --path documents/2023', 'Upload document.pdf to documents/2023 path')
        .demandCommand(1, 'You need to specify a command.')
        .help('h')
        .alias('h', 'help')
        .version()
        .epilog('For more information, visit https://github.com/yourusername/cfdrive')
        .argv;

    if (argv._[0] === 'upload') {
        try {
            const key = await upload(argv.file, argv.path);
            const downloadUrl = generateDownloadUrl(key);
            console.log(`\nFile uploaded successfully: ${key}`);
            console.log('\nPermanent Download URL:');
            console.log(downloadUrl);
        } catch (error) {
            console.error('Operation failed:', error);
            process.exit(1);
        }
    }
}

// Only run main() if this file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { main, upload, generateDownloadUrl };