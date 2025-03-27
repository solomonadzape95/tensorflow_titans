# Contributing to TensorFlow Project

Thank you for investing your time in contributing to this project! 

Read the [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## Project Overview
To get an overview of the project, read the [README](./README.md) file.

---

## Getting Started

### 1. Clone the Repo

Open your terminal and run:

```sh
git clone https://github.com/solomonadzape95/tensorflow_titans.git
```

### 2. Navigate into the Project Directory

```sh
cd tensorflow_titans
```

### 3. Install Dependencies

install dependencies:

```sh
npm install
```

## Branch Naming & Workflow

You'll be working on **feature branches** based on the task you're handling. To keep things organized, follow this branch naming convention:

### Branch Naming

#### For new features:

```
feature/task-name  (e.g., feature/add-user-authentication)
```

#### For bug fixes:

```
fix/bug-description  (e.g., fix/navbar-responsive-issue)
```

## Steps to Work on a Task

### Pull the Latest Changes

Ensure your local repository is up to date:

```sh
git checkout master
git pull origin master
```

### Create a Feature Branch

Create a new branch from `master`:

```sh
git checkout -b feature/task-name
```

### Work on Your Task & Commit Changes

Make your changes, then stage and commit them with clear messages:

```sh
git add .
git commit -m "feat: add user authentication feature"
```

### Push Your Branch to GitHub

```sh
git push origin feature/task-name
```

### Create a Pull Request (PR)

- Go to the **GitHub repository**.
- Open a **Pull Request** from your **feature branch** into `master`.
- Fill out the PR template properly, explaining your changes and how they can be tested.

### Wait for Review & Merge

- If required, make any requested changes.
- Once approved, your PR will be merged into `master`.

## ‼️Important Notes

- **Do not push directly to `master`**. Always work on a feature branch.
- **Keep your branch up to date** with `master` before making a PR:
- **Fix any conflict** you have before pushing
- **Write meaningful commit messages**. Use the format:
  ```
  feat: short description of feature
  fix: short description of fix
  ```
- **Test your changes** before pushing to avoid breaking the project.

Happy contributing!