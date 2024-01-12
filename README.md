# Demo Credit

An MVP (Minimum viable product) wallet service where a user can create, fund, withdraw, and transfer funds to another user’s account.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Requirements](#requirements)
4. [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Running the Project](#running-the-project)
5. [Usage](#usage)
6. [API Documentation](#api-documentation)
7. [Contributing](#contributing)
8. [License](#license)

## Introduction

Demo Credit is a Minimum viable product wallet service where a user can create, fund, withdraw, and transfer funds to another user’s account.
It is built on Node and Express while persisting data with MySQL through Knex ORM.

## Features

- Account creation
- Account funding
- Fund transfer
- Fund withdrawal


## Requirements

List any prerequisites or dependencies needed to run your project.

- Node.js (LTS)
- Express
- TypeScript
- MySQL (version 8)
- Knex ORM
- JWT

## Getting Started       
Follow these steps to get started.

### Installation

```bash
# Clone the repository
git clone https://github.com/ChiomaSarah/DemoCredit

# Navigate to the project directory

# Install dependencies
npm install
```
## Database Migration

### Run Migrations

```bash
# Run pending migrations
npx knex migrate:latest

```
# Run seed files
```bash
npx knex seed:run


