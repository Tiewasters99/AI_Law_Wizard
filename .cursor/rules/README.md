# Cursor Rules for AI Wizard Project

This directory (`.cursor/rules/`) contains Cursor rules that help with codebase navigation and understanding for the AI Wizard project.

## Rule Files

### 1. `ai-wizard-architecture.mdc`
- **Always Applied**: Core project architecture and patterns
- **Purpose**: Provides overview of the document processing system, database schema, and naming conventions
- **Key Topics**: Performance strategy, model selection, key functions, database models

### 2. `document-processing-patterns.mdc`
- **Applies to**: Document processing API files and lib files
- **Purpose**: Specific patterns for the agentic document processing system
- **Key Topics**: Response mode detection, question answering flow, action performance flow, code organization

### 3. `typescript-patterns.mdc`
- **Applies to**: All TypeScript files (*.ts, *.tsx)
- **Purpose**: TypeScript coding patterns and conventions
- **Key Topics**: Interface design, async function structure, error handling, performance patterns

### 4. `ai-integration-patterns.mdc`
- **Applies to**: API routes and lib files
- **Purpose**: AI integration patterns using LangChain and various models
- **Key Topics**: Agent creation, model selection strategy, timeout management, cost management

### 5. `database-patterns.mdc`
- **Applies to**: Prisma schema, lib files, API routes
- **Purpose**: Database patterns and Prisma integration
- **Key Topics**: Schema design, query operations, data patterns, performance considerations

### 6. `component-patterns.mdc`
- **Applies to**: React components (*.tsx)
- **Purpose**: React component patterns and UI conventions
- **Key Topics**: Component structure, state management, UI/UX patterns, accessibility

## Usage

These rules will automatically help Cursor understand:
- The project's architecture and key components
- Coding patterns and best practices
- AI integration strategies
- Database design patterns
- Component development guidelines

The rules are designed to provide context-aware assistance when working on different parts of the codebase.
