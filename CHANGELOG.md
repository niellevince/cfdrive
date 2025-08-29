# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2025-08-29

### Fixed
- Environment file loading issue - now correctly loads .env from project directory instead of hardcoded path
- "Missing required key 'Bucket' in params" error when running cfdrive command
- Better environment configuration handling for different project locations

## [2.0.1] - 2025-08-29

### Fixed
- Terminal display issues with progress bar overlapping text
- Progress bar now properly clears after completion

### Improved
- Better terminal output formatting and cleanup

## [2.0.0] - 2025-08-29

### Added
- Initial release with CLI interface
- Support for Cloudflare R2 uploads
- Progress bar for upload tracking
- Automatic URL generation and clipboard copying
- Custom bucket path support
- Random file name generation for security
- Strict mode for uploads without random prefix
- Custom file naming option
- Option to disable automatic clipboard copying