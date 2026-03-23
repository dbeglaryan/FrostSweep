# Contributing to FrostSweep

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Install prerequisites: Python 3.10+, Node.js 18+
3. Follow the [Quick Start](#quick-start) in README.md

## Code Style

- **Python**: Follow PEP 8. No type stubs required, but type hints are welcome.
- **TypeScript/React**: Use the existing patterns. Functional components with hooks.
- **CSS**: Tailwind utility classes. Custom CSS variables for theming in `index.css`.

## Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run the test suite: `cd backend && python -m pytest tests/ -v`
4. Run the frontend type check: `cd frontend && npx tsc --noEmit`
5. Commit with a clear message describing the change
6. Open a Pull Request

## Adding Features

- **New API endpoint**: Add to `backend/main.py` and the relevant `core/` module. Add tests in `backend/tests/`.
- **New UI component**: Create in `frontend/src/components/`. Wire into `App.tsx`.
- **New file type category**: Update `DEFAULT_CONFIG` in `backend/core/config.py`.

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- OS and Python/Node versions

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Keep PRs focused on a single change
4. Request review from maintainers
