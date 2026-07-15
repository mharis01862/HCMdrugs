# HCMdrugs Database

Welcome to the HCMdrugs Database repository. This project provides a structured and accessible collection of drug data, designed to be easily searchable and maintainable for researchers, developers, and professionals.

## Overview

The HCMdrugs database offers a web-based interface to interact with the underlying drug data. It is built to be fast, responsive, and easy to deploy.

## Citation

If you use this database in your research, please cite our published manuscript:

> Haris, M., Rahman, S., Qamar, M. T. u., & Azeem, F. (2026). HCMdrugs: A Web-Based Database Cataloging the Drugs Available for the Treatment of Hypertrophic Cardiomyopathy. *Journal of Computational Biophysics and Chemistry*, 25(09), 1341-1350. DOI: 10.1142/S2737416525500954

[![DOI](https://img.shields.io/badge/DOI-10.1142%2FS2737416525500954-blue.svg)](https://doi.org/10.1142/S2737416525500954)

## Getting Started

### Prerequisites

To run this project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/hcmdrugs.git
   ```
2. Navigate into the project directory:
   ```bash
   cd hcmdrugs
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Server

To launch the database interface locally in development mode, run:

```bash
npm run dev
```
This will start a local server where you can view and interact with the database.

### Building for Production

To create an optimized production build of the database interface:

```bash
npm run build
```
The compiled assets will be generated in the `dist` directory, ready to be deployed to your preferred hosting environment.

### Deploying to GitHub Pages

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions whenever you push to the `main` branch.

To enable this:
1. Push this repository to GitHub.
2. Go to your repository **Settings** > **Pages** on GitHub.
3. Under **Build and deployment**, set the **Source** to **GitHub Actions**.
4. The `.github/workflows/deploy.yml` workflow will automatically run and publish your site!

*Note: In `vite.config.js`, the `base` is set to `'/hcmdrugs/'`. If your GitHub repository has a different name, make sure to update that base path to match.*

## Data Scripts

The project includes several built-in scripts to help manage the database data:
- `npm run extract:sql`: Extracts drug data from SQL.
- `npm run export:csv`: Exports the drug JSON data to a CSV format.
- `npm run import:csv`: Imports drug data from a CSV file into JSON.
- `npm run import:sheet`: Imports data from a Google Sheet CSV.

## License

This project is open-source and available under the [MIT License](LICENSE).
