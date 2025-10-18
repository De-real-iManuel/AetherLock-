# AetherLock Development Guidelines

## Code Quality Standards

### Component Structure (100% adherence)
- **React.forwardRef Pattern**: All UI components use forwardRef for proper ref forwarding
- **Named Exports**: Components exported with explicit names using destructuring
- **DisplayName Assignment**: All forwardRef components have displayName set for debugging

```jsx
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("base-classes", className)} {...props} />
))
Card.displayName = "Card"
```

### Import Conventions (100% adherence)
- **React Imports**: Use `import * as React from "react"` for UI components
- **Named Imports**: Use destructuring for specific imports
- **Relative Paths**: Consistent relative path structure (`../../lib/utils`)

### State Management Patterns (100% adherence)
- **useState Hook**: Primary state management with descriptive names
- **State Initialization**: Clear initial values (empty strings, null, false, {})
- **State Updates**: Direct setter functions with validation

```jsx
const [buyerOffer, setBuyerOffer] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});
```

## Styling Standards

### Tailwind CSS Patterns (100% adherence)
- **cn() Utility**: Universal use of `cn()` function for className merging
- **Conditional Classes**: Object-based conditional styling in components
- **Design Tokens**: Consistent color palette (slate-900, slate-800, blue-600)
- **Responsive Design**: Mobile-first approach with responsive utilities

```jsx
className={cn(
  "base-classes",
  {
    "conditional-class": condition,
    "another-class": anotherCondition
  },
  className
)}
```

### Component Variants (100% adherence)
- **Default Props**: Explicit default values for variant and size props
- **Variant Mapping**: Object-based variant to className mapping
- **Size Variations**: Consistent sizing system (sm, default, lg, icon)

## Semantic Patterns

### Async Operations (100% adherence)
- **Loading States**: Boolean loading flags with UI feedback
- **Error Handling**: Structured error objects with field-specific messages
- **Promise Delays**: Simulated API delays using setTimeout promises
- **Status Management**: Complex state objects for multi-field status

```jsx
const startEscrow = async () => {
  if (!validateInputs()) return;
  setIsLoading(true);
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Process logic
  setIsLoading(false);
};
```

### Form Validation (100% adherence)
- **Input Validation**: Separate validation functions returning boolean
- **Error Display**: Field-specific error messages with conditional rendering
- **Real-time Feedback**: onChange handlers for immediate state updates

### Utility Functions (100% adherence)
- **Pure Functions**: Stateless utility functions for reusable logic
- **Random Generation**: Custom functions for hash and ID generation
- **String Manipulation**: Consistent character sets and length parameters

## Internal API Usage

### Component Composition (100% adherence)
- **Prop Spreading**: Use `{...props}` for flexible component APIs
- **Ref Forwarding**: Consistent ref passing through forwardRef
- **Children Pattern**: Implicit children support in layout components

### Event Handling (100% adherence)
- **Arrow Functions**: Inline arrow functions for simple event handlers
- **Event Object**: Direct access to `e.target.value` for form inputs
- **Async Handlers**: Proper async/await in event handler functions

## Code Idioms

### Conditional Rendering (100% adherence)
- **Logical AND**: Use `&&` for conditional component rendering
- **Ternary Operators**: Use for simple conditional text/classes
- **Early Returns**: Validation functions use early returns for clarity

### Array/Object Operations (100% adherence)
- **Object.keys()**: Check object emptiness with `Object.keys(obj).length === 0`
- **Template Literals**: Use for dynamic string construction
- **Destructuring**: Consistent destructuring in function parameters

## Configuration Standards

### ESLint Rules (100% adherence)
- **Unused Variables**: Allow unused variables with uppercase/underscore pattern
- **React Hooks**: Latest recommended rules for hooks usage
- **ECMAScript**: ES2020+ features with module support
- **JSX Support**: Explicit JSX feature enablement

### Build Configuration (100% adherence)
- **ES Modules**: `"type": "module"` in package.json
- **Vite Integration**: React plugin with fast refresh support
- **PostCSS Pipeline**: Tailwind CSS with autoprefixer processing

## Naming Conventions

### Variables (100% adherence)
- **camelCase**: All variable and function names
- **Descriptive Names**: Clear, intention-revealing names
- **Boolean Prefixes**: `is`, `has`, `should` for boolean variables
- **Handler Prefixes**: Event handlers start with action verbs

### Components (100% adherence)
- **PascalCase**: All component names
- **Descriptive Suffixes**: UI components grouped by type (Card, Button, Input)
- **Feature Names**: Main components named after primary feature