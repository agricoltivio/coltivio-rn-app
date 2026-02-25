# Contributing to Coltivio

Thank you for your interest in contributing! Coltivio is a nonprofit open-source farm management platform.

## Getting started

1. Fork the repository
2. Follow the setup instructions in [README.md](README.md)
3. Create a feature branch from `main`

## Development workflow

```bash
yarn install             # install dependencies
yarn ios                 # run on iOS simulator
yarn android             # run on Android emulator
yarn typecheck           # typecheck (tsc --noEmit)
yarn lint                # lint
```

## Submitting changes

1. Make sure `yarn typecheck` passes with no errors
2. Make sure `yarn lint` passes
3. Open a pull request against `main` -- don't worry about commit history, we squash merge

## Code style

- TypeScript strict mode, no `any` types
- Use `styled-components` for styling
- Feature-based folder structure under `features/`
- Use React Navigation for routing (not expo-router)

## Reporting issues

Open an issue on GitHub. For security vulnerabilities, please email the maintainers directly instead of opening a public issue.

## License

By contributing, you agree that your contributions will be licensed under the same [Commons Clause + AGPL-3.0 license](LICENSE) as the project.
