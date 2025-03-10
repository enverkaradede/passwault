# Changelog

All notable changes to Passwault will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.1.0 - 2025-02-27

### Added
- Password generation with customizable options
  - Adjustable password length
  - Toggle for numbers, symbols, and uppercase letters
- Modern user interface with dark/light mode support
- localStorage integration for storage (will change later)
- Basic CRUD operations for passwords
- Simple authentication system
- Password visibility toggle
- Copy to clipboard functionality
- Search functionality for saved passwords (bugged)

### Changed
- Implemented TypeScript for better type safety

## 0.1.2 - 2025-03-10

### Added
- Existing credential addition option
- Copy to clipboard functionality for username
- IV generation for encryption
- Handlers to generate IV encryption to store credentials in database
- Handlers to generate IV decryption to retrieve credentials from database


### Changed
- localStorage with SQLite for storage

### Fixed
- Search functionality for saved credentials