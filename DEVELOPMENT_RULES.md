# SOLBET Development Rules & Standards

## Project Overview
- **Technology Stack**: TypeScript, React, Styled-Components, Gamba Framework
- **Architecture**: Full-stack senior developer approach
- **Design Philosophy**: Professional, responsive, clean code

## Code Standards

### 1. ALIGNMENT & LAYOUT RULES
- **NEVER use arbitrary pixel values** (`-10px`, `-5px`, etc.) for alignment
- **ALWAYS use flexbox properties** (`align-items`, `justify-content`) for proper alignment
- **Consistent heights**: All interactive elements should use standard heights (44px for buttons, inputs)
- **Bottom alignment**: Use `align-items: flex-end` for consistent bottom alignment
- **Center alignment**: Use `align-items: center` for vertical centering

### 2. STYLING APPROACH
- **Use styled-components** for all custom styling
- **Maintain consistent spacing** with standard gap values (0.25rem, 0.5rem, 1rem)
- **Responsive design**: Use relative units (rem, %) over fixed pixels
- **Professional gradients**: Use consistent color schemes and gradients
- **No hacky solutions**: If alignment doesn't work, restructure the layout properly

### 3. COMPONENT STRUCTURE
- **Logical grouping**: Group related elements in proper containers
- **Clear hierarchy**: Use semantic HTML structure
- **Consistent naming**: Use descriptive, professional component names
- **Separation of concerns**: Keep styling, logic, and presentation separate

### 4. WHAT TO EDIT
✅ **DO EDIT:**
- Styled-component properties (`align-items`, `justify-content`, `height`, `gap`)
- Container structure and layout
- Responsive breakpoints and spacing
- Color schemes and gradients
- Component organization and hierarchy

❌ **DON'T EDIT:**
- Core game logic without understanding the full context
- Gamba framework internals
- Third-party library configurations
- Backend API endpoints without proper testing
- Critical state management without thorough analysis

### 5. ALIGNMENT SOLUTIONS
**For bottom alignment:**
```typescript
const Container = styled.div`
  display: flex;
  align-items: flex-end; // Bottom alignment
  gap: 0.5rem;
`
```

**For center alignment:**
```typescript
const Container = styled.div`
  display: flex;
  align-items: center; // Center alignment
  gap: 0.5rem;
`
```

**For consistent heights:**
```typescript
const Button = styled.button`
  height: 44px; // Standard button height
  // other properties...
`
```

### 6. RESPONSIVE DESIGN PRINCIPLES
- **Mobile-first approach**: Design for mobile, enhance for desktop
- **Flexible layouts**: Use flexbox and grid for responsive behavior
- **Consistent spacing**: Use rem units for scalable spacing
- **Touch targets**: Minimum 44px for interactive elements
- **Breakpoint consistency**: Use standard breakpoints (768px, 1024px, 1200px)

### 7. PROFESSIONAL DEVELOPMENT PRACTICES
- **Think before coding**: Understand the layout structure before making changes
- **Systematic approach**: Fix alignment issues at the container level, not individual elements
- **Consistent patterns**: Use the same alignment approach throughout the project
- **Clean code**: No commented-out code, no temporary fixes, no hacky solutions
- **Documentation**: Comment complex logic and layout decisions

### 8. COMMON ALIGNMENT PATTERNS
```typescript
// Horizontal layout with bottom alignment
const HorizontalControls = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
`

// Vertical layout with proper spacing
const VerticalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
`

// Centered content
const CenteredContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
```

### 9. QUALITY ASSURANCE
- **Test alignment**: Verify all elements align properly across different screen sizes
- **Consistent behavior**: Ensure similar elements behave consistently
- **Professional appearance**: No visual inconsistencies or misalignments
- **Performance**: Avoid unnecessary re-renders and complex calculations

### 10. COMMUNICATION STANDARDS
- **Clear explanations**: Explain what changes are being made and why
- **Professional language**: Use technical terminology correctly
- **Systematic approach**: Address issues methodically, not with quick fixes
- **Responsive feedback**: Acknowledge when approaches need adjustment

### 11. DROPDOWN IMPLEMENTATION RULES
- **ALWAYS use existing components first**: Check for existing Dropdown components before creating custom select elements
- **Import existing components**: Look for `src/components/` directory for reusable UI components
- **Avoid browser default elements**: Never use raw `<select>` elements for custom dropdowns - they cause styling issues
- **Use proper state management**: Implement `useState` for dropdown visibility and selection state
- **Make entire container clickable**: Don't just make individual elements clickable - make the whole container area interactive
- **Add smooth transitions**: Always include `transition` properties for smooth animations
- **Test functionality immediately**: Verify dropdown opens/closes and selections work before moving on

### 12. STYLING ORGANIZATION RULES
- **ALWAYS put styling in the right place**: Styled-components MUST go in the dedicated `styles.ts` file, NEVER in the main component file
- **Separate concerns**: Keep all styling logic in `styles.ts`, keep only component logic in `index.tsx`
- **Import all styled components**: Import ALL styled components from `styles.ts` in the main component file
- **No inline styled-components**: Never define `const StyledComponent = styled.div` inside the main component file
- **Consistent file structure**: Every game/component should have its styling in a separate `styles.ts` file
- **Clean imports**: Remove `styled-components` import from main files when all styling is moved to `styles.ts`

### 13. DATABASE MIGRATION RULES
- **NEVER use localStorage for user data**: All user data (username, level, avatar) must be stored in Supabase database
- **Remove localStorage dependencies**: When migrating components, completely remove localStorage calls and replace with Supabase hooks
- **Use proper data types**: Use NUMERIC(20, 9) for SOL amounts, not BIGINT or INTEGER
- **Implement proper error handling**: Always handle Supabase connection errors and loading states
- **Test data persistence**: Verify user data persists across devices and browser sessions

### 14. REACT HOOKS BEST PRACTICES
- **NEVER call hooks conditionally**: All hooks must be called at the top level of components, never inside loops, conditions, or nested functions
- **Consistent hook order**: Hooks must be called in the same order every time a component renders
- **No early returns before hooks**: Never return early from a component before all hooks are called
- **Use useRef for values that don't trigger re-renders**: Use refs for values that need to persist but don't cause re-renders
- **Separate useEffect concerns**: Use multiple useEffect hooks for different concerns instead of one complex effect
- **Avoid circular dependencies**: Don't include state values in useEffect dependencies that are set inside that same effect

### 15. SUPABASE INTEGRATION PATTERNS
- **Use useSupabaseWalletSync hook**: This hook handles wallet connection and profile syncing automatically
- **Handle loading states**: Always check `isInitialized` and `loading` states before rendering user data
- **Implement error boundaries**: Wrap components that use Supabase hooks in error boundaries
- **Use transient props**: Convert styled-components props to transient props (e.g., `$isVisible` instead of `isVisible`)
- **Graceful degradation**: Handle cases where Supabase tables might not exist yet (e.g., chat_messages table)
- **Refresh patterns**: Use `refreshProfile()` to trigger data refresh after mutations

### 16. STYLED-COMPONENTS PROPS RULES
- **Use transient props**: All custom props must be prefixed with `$` (e.g., `$isOpen`, `$isVisible`, `$isConnect`)
- **Never pass DOM props**: Custom props should never be passed to DOM elements
- **Use shouldForwardProp**: For complex prop filtering, use `shouldForwardProp` function
- **Consistent naming**: Use descriptive names for transient props that clearly indicate their purpose

### 17. WALLET BALANCE AND MAX BUTTON IMPLEMENTATION
- **Use useTokenBalance hook**:  always use `useTokenBalance()` from `gamba-react-ui-v2` to get actual wallet balance
- **Import the hook**: Add `useTokenBalance` to imports from `gamba-react-ui-v2`
- **Access balance**: Use `balance.balance` to get the wallet balance in lamports
- **Convert to SOL**: Divide by `1_000_000_000` to convert lamports to SOL
- **Set wager**: Use `setWager(walletBalance)` to set the bet amount
- **Fallback handling**: Always provide fallback to `wager.max` or reasonable amount if wallet balance is 0

## Remember
This is a professional TypeScript/React project. Every change should be:
- **Systematic**: Based on proper CSS principles
- **Responsive**: Works across all screen sizes  
- **Maintainable**: Clean, readable code
- **Professional**: No hacky solutions or arbitrary values

The goal is to create a polished, professional gambling platform that works flawlessly across all devices.
