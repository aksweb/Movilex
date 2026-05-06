# Movilex

<p align="center">
  Fast, focused file movement for power users.
</p>

<p align="center">
 <p align="center">
  <a href="https://github.com/aksweb/movilex/releases/latest">
    <img alt="Latest Release" src="https://img.shields.io/github/v/release/aksweb/movilex?style=flat-square">
  </a>

  <img alt="Platforms" src="https://img.shields.io/badge/platforms-linux%20%7C%20macOS%20%7C%20windows-blue?style=flat-square">

  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/aksweb/movilex?style=flat-square">
  </a>
</p>

---

## Overview

Movilex is a desktop file movement engine designed for workflows where files are constantly reorganized across multiple destinations.

Traditional file managers optimize for browsing.  
Movilex optimizes for execution.

It reduces repetitive navigation, shortens movement workflows, and provides a focused environment for high-frequency file organization tasks.

---

## Why Movilex

Moving files repeatedly between deeply nested folders is slow in conventional file managers.

Common friction points:

- Repeated directory traversal
- Multiple windows and tabs
- Excessive drag distance
- Poor destination accessibility
- Context switching between source and target locations

Movilex addresses this by introducing persistent destination-based movement workflows with rapid navigation and direct transfer operations.

---

## Core Features

### Multi-Destination Workflow

Pin frequently used directories and switch instantly between them.

---

### Tree-Based Navigation

Navigate complex directory structures efficiently using expandable tree navigation.

---

### Fast File Operations

- Move
- Copy
- Paste
- Delete
- Create folders

All optimized around minimizing interaction cost.

---

### Integrated Preview System

Preview supported files directly inside the application without opening external tools.

Current preview support includes:

- PDF documents
- Images

---

### Drag and Drop Support

Native drag-and-drop workflows for rapid organization.

---

### Persistent Workspace State

Movilex restores workspace state between sessions, allowing users to continue workflows without reconfiguration.

---

## Platform Support

Movilex is available for:

- Linux
- macOS
- Windows

---

# Installation

## Latest Release

Download the latest version from:

### → [Latest Release](https://github.com/aksweb/movilex/releases/latest)

---

## Linux

### AppImage

```bash
chmod +x Movilex-*.AppImage
./Movilex-*.AppImage --no-sandbox
```

### DEB Package

```bash
sudo dpkg -i Movilex-*.deb
sudo apt-get install -f
```

---

## macOS

1. Open the `.dmg`
2. Drag `Movilex.app` into `Applications`

If macOS blocks launch:

```bash
xattr -cr /Applications/Movilex.app
```

---

## Windows

Run the installer:

```text
Movilex Setup *.exe
```

and follow the installation steps.

---

# Development

## Clone Repository

```bash
git clone https://github.com/aksweb/movilex.git
cd movilex
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Environment

```bash
npm run dev
```

---

# Build

## Linux

```bash
npm run linux
```

---

## macOS

```bash
npm run mac
```

---

## Windows

```bash
npm run win
```

---

# Technology Stack

- Electron
- React
- Vite
- PDF.js

---

# Project Structure

```text
app/
├── main/        Electron main process
├── preload/     Secure IPC bridge
└── renderer/    React frontend
```

---

# Design Goals

Movilex is designed around:

- Minimal interaction overhead
- Fast movement workflows
- Reduced navigation repetition
- Persistent operational context
- Low cognitive friction

---

# Security

Movilex operates locally on the user's machine and does not depend on cloud infrastructure for file operations.

---

# Roadmap

Planned improvements include:

- Advanced filtering and sorting
- Smart grouping
- Undo history
- Batch movement pipelines
- Search indexing
- Cross-device synchronization

---

# Contributing

Contributions are welcome.

Please open an issue before submitting major architectural or workflow changes.

---

# License

MIT License

---

# Author

Abhishekh

---

<p align="center">
  Built for users who move files constantly.
</p>
