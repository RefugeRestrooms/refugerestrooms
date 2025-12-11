# REFUGE Restrooms - React Frontend

A modern React TypeScript frontend application for the REFUGE Restrooms service, providing safe restroom access information for transgender, intersex, and gender nonconforming individuals.

## Features

- **Modern Stack**: React 18, TypeScript, Vite
- **GraphQL Integration**: Apollo Client for API communication
- **Testing**: Vitest with React Testing Library and Property-Based Testing
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Component Architecture**: Designed for React Native compatibility

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shared UI components (React Native compatible)
│   ├── search/         # Search-related components
│   ├── restroom/       # Restroom display components
│   ├── feedback/       # Feedback system components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test setup and utilities
```

## Development Guidelines

### Component Architecture

Components are organized by feature and designed with React Native compatibility in mind:

- **UI Components**: Platform-agnostic, reusable components
- **Feature Components**: Specific to restroom functionality
- **Layout Components**: Application structure and navigation

### Testing Strategy

The project uses a dual testing approach:

- **Unit Tests**: Specific examples and edge cases
- **Property-Based Tests**: Universal properties across all inputs
- **Integration Tests**: Component interactions and API integration

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Consistent code formatting
- **Vitest**: Fast unit testing with React Testing Library

## API Integration

The frontend connects to the AWS GraphQL API for:

- Restroom search and filtering
- Restroom details and feedback
- New restroom submissions
- User feedback and ratings

## Contributing

1. Follow the established project structure
2. Write tests for new functionality
3. Ensure code passes linting and formatting
4. Maintain React Native compatibility where possible

## License

This project is part of the REFUGE Restrooms open-source initiative.
