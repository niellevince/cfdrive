import S3 from 'aws-sdk/clients/s3.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import clipboardy from 'clipboardy';
import cliProgress from 'cli-progress';

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

function generateRandomString(length = 5) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
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

async function upload(filePath, bucketPath = '', customName = null, strict = false) {
    // Resolve the file path relative to the current working directory
    const resolvedPath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${filePath} (resolved to ${resolvedPath})`);
    }

    const fileName = path.basename(resolvedPath);
    const fileExtension = path.extname(resolvedPath);
    const randomString = strict ? '' : generateRandomString();

    // Use custom name if provided, otherwise use original filename
    const finalFileName = customName
        ? `${customName}${fileExtension}`
        : fileName;

    // Combine bucket path with filename, ensuring proper path formatting
    const key = bucketPath
        ? `${bucketPath.replace(/^\/+|\/+$/g, '')}/${strict ? finalFileName : `${randomString}-${finalFileName}`}`
        : strict ? finalFileName : `${randomString}-${finalFileName}`;

    const fileContent = fs.readFileSync(resolvedPath);
    const contentType = getContentType(resolvedPath);
    const fileSize = fs.statSync(resolvedPath).size;

    // Create a new progress bar
    const progressBar = new cliProgress.SingleBar({
        format: 'Uploading [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} bytes',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType
    };

    try {
        console.log(`Starting upload of ${fileName} (${(fileSize / 1024).toFixed(2)} KB)`);

        // Start the progress bar
        progressBar.start(fileSize, 0);

        // Create a managed upload
        const managedUpload = s3.upload(params);

        // Add event listener for upload progress
        managedUpload.on('httpUploadProgress', (progress) => {
            progressBar.update(progress.loaded);
        });

        // Wait for the upload to complete
        await managedUpload.promise();

        // Stop the progress bar
        progressBar.stop();

        console.log(`File uploaded successfully: ${key}`);
        return key;
    } catch (error) {
        // Stop the progress bar in case of error
        progressBar.stop();
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
        .usage('Usage: cfdrive --path <file> [options]')
        .option('path', {
            alias: 'p',
            describe: 'File path to upload',
            type: 'string',
            demandOption: true
        })
        .option('bucket-path', {
            alias: 'b',
            describe: 'Bucket path where the file should be stored',
            type: 'string',
            default: 'temp'
        })
        .option('name', {
            alias: 'n',
            describe: 'Custom name for the uploaded file (without extension)',
            type: 'string'
        })
        .option('no-copy', {
            describe: 'Disable automatic copying of URL to clipboard',
            type: 'boolean',
            default: false
        })
        .option('strict', {
            alias: 's',
            describe: 'Upload without generating random string prefix',
            type: 'boolean',
            default: false
        })
        .example('cfdrive --path ./image.jpg', 'Upload image.jpg to the default "temp" path')
        .example('cfdrive --path ./document.pdf --bucket-path documents/2023', 'Upload document.pdf to documents/2023 path')
        .example('cfdrive --path ./image.jpg --name my-photo', 'Upload with custom name "my-photo"')
        .example('cfdrive --path ./image.jpg --no-copy', 'Upload without copying the URL to clipboard')
        .example('cfdrive --path ./image.jpg --strict', 'Upload without random string prefix')
        .help('h')
        .alias('h', 'help')
        .version()
        .epilog('For more information, visit https://github.com/yourusername/cfdrive')
        .argv;

    try {
        const key = await upload(argv.path, argv.bucketPath, argv.name, argv.strict);
        const downloadUrl = generateDownloadUrl(key);
        console.log(`\nFile uploaded successfully: ${key}`);
        console.log('\nPermanent Download URL:');
        console.log(downloadUrl);

        // Copy the URL to clipboard unless --no-copy flag is used
        if (!argv.noCopy) {
            await clipboardy.write(downloadUrl);
            console.log('\nURL copied to clipboard!');
        }
    } catch (error) {
        console.error('Operation failed:', error);
        process.exit(1);
    }
}

// Only run main() if this file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { main, upload, generateDownloadUrl };