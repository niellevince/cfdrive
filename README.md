# CFDrive

A simple CLI tool for uploading files to Cloudflare R2 Storage and generating shareable URLs.

## Features

- Quick file uploads to Cloudflare R2 Storage
- Automatic content type detection
- Generates permanent download URLs
- Customizable bucket paths
- Random file name generation for security

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cfdrive.git
cd cfdrive

# Install dependencies
npm install

# Link the command globally
npm link
```

## Configuration

Create a `.env` file in the project root with the following variables:

```
ACCOUNT_ID=your_cloudflare_account_id
ACCESS_KEY_ID=your_r2_access_key_id
ACCESS_KEY_SECRET=your_r2_access_key_secret
BUCKET_NAME=your_r2_bucket_name
CUSTOM_BUCKET_URL=https://your-public-bucket-url.com
```

## Usage

```bash
# Upload a file to the default 'temp' path
cfdrive --path ./file.jpg
# or using the short alias
cf --path ./file.jpg

# Upload a file to a custom bucket path
cfdrive --path ./file.jpg --bucket-path documents/2023

# Upload with a custom name
cfdrive --path ./file.jpg --name my-photo

# Upload without random string prefix (strict mode)
cfdrive --path ./file.jpg --strict

# Upload without copying URL to clipboard
cfdrive --path ./file.jpg --no-copy

# Get help
cfdrive --help
```

## API

This package can also be imported and used programmatically:

```javascript
import { upload, generateDownloadUrl } from "cfdrive";

async function uploadFile() {
  const key = await upload("path/to/file.jpg", "custom/path");
  const url = generateDownloadUrl(key);
  console.log(url);
}
```

## Changelog

### v2.0.1 (August 2025)
- **Fixed**: Terminal display issues with progress bar overlapping text
- **Improved**: Progress bar now properly clears after completion
- **Enhanced**: Better terminal output formatting and cleanup

### v2.0.0
- Initial release with CLI interface
- Support for Cloudflare R2 uploads
- Progress bar for upload tracking
- Automatic URL generation and clipboard copying

## License

MIT
