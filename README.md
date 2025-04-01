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
cfdrive upload ./path/to/file.jpg

# Upload a file to a custom path
cfdrive upload ./path/to/file.jpg --path custom/path

# Get help
cfdrive --help

# Get command-specific help
cfdrive upload --help
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

## License

MIT
