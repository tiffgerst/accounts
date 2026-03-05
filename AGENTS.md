# zyzz — Agent Guidelines

> **Update after learnings or mistakes** — when a correction, new convention, or hard-won lesson emerges during development, append it to the relevant section of this file immediately. AGENTS.md is the source of truth for project conventions and should grow as the project does.

## TypeScript Conventions

- **Exact optional properties** — `exactOptionalPropertyTypes` is enabled in tsconfig. Optional properties must include `| undefined` in their type if they can be assigned `undefined` (e.g. `foo?: string | undefined`, not `foo?: string`).
- **No `readonly` on properties** — skip `readonly` on type properties.
- **`readonly` arrays** — use `readonly T[]` for array types in type definitions.
- **`type` over `interface`** — always use `type` for type definitions.
- **`.js` extensions** — all imports include `.js` for ESM compatibility.
- **Classes for errors only** — all other APIs use factory functions.
- **No enums** — use `as const` objects for fixed sets.
- **`const` generic modifier** — use to preserve literal types for full inference.
- **camelCase generics** — `<const args extends z.ZodObject<any>>` not `<T>`.
- **Options default `= {}`** — use `options: Options = {}` not `options?: Options`.
- **Namespace params and return types** — place function parameter and return types in a `declare namespace` matching the function name (e.g. `local.Options`, `createAccount.ReturnType`).
- **Minimal variable names** — prefer short, obvious names. Use `options` not `serveOptions`, `fn` not `callbackFunction`, etc. Context makes meaning clear.
- **No redundant type annotations** — if the return type of a function already covers it, don't annotate intermediate variables. Let the return type do the work (e.g. `const cli = { ... }` not `const cli: ReturnType = { ... }`).
- **Return directly** — don't declare a variable just to return it. Use `return { ... }` unless the variable is needed (e.g. self-reference for chaining).
- **Skip braces for single-statement blocks** — omit `{}` for single-statement `if`, `for`, etc.
- **No section separator comments** — don't use `// ---` or `// ===` divider comments. Let JSDoc and whitespace provide structure.
- **No dynamic imports** — use static `import` declarations. No `await import(...)` or `import(...)` expressions.
- **`as never` over `as any`** — when a type assertion is unavoidable, use `as never` instead of `as any`.
- **Destructure when accessing multiple properties** — prefer `const { a, b } = options` over repeated `options.a`, `options.b`.
- **`core_` prefix for import aliases** — when aliasing an import to avoid conflicts, use `core_<name>` (e.g. `import { local as core_local }`), not arbitrary camelCase.
- **`Hex.fromNumber` over `toString(16)`** — use `Hex.fromNumber(n)` from `ox` instead of `` `0x${n.toString(16)}` `` for number-to-hex conversion.

## Type Inference Conventions

- **`z.output<>` over `z.infer<>`** — use `z.output<schema>` for types after transforms/defaults are applied (what `schema.parse()` returns at runtime). Use `z.input<schema>` only when representing pre-validation types.
- **`const` generics on definitions** — any function that accepts Zod schemas and passes them to callbacks must use `const` generic parameters to preserve literal types (e.g. `<const args extends z.ZodObject<any>>`).
- **Flow schemas through generics** — when a factory function accepts Zod schemas, use generics to flow `z.output<>` through to callbacks (`run`, `next`), return types, and constraint types (`alias`). Never fall back to `any` in callback signatures.
- **Type tests in `.test-d.ts`** — use vitest's `expectTypeOf` in colocated `.test-d.ts` files to assert generic inference works. Type tests are first-class — write them alongside implementation, not as an afterthought.
- **No `any` leakage** — Zod schemas may use `z.ZodObject<any>` as a generic bound, but inferred types flowing to user-facing callbacks must be narrowed via `z.output<typeof schema>`. The user should never see `any` in their IDE.
- **Type inference after every feature** — after implementing any feature, check if new types can be narrowed. If a new property, callback, or return type touches a Zod schema, add generics to flow the inferred type through. Add or update `.test-d.ts` type tests alongside.

## Documentation Conventions

- **JSDoc on all exports** — every exported function, type, and constant gets a JSDoc comment. Type properties get JSDoc too. Namespace types (e.g. `declare namespace create { type Options }`) get JSDoc too. Doc-driven development: write the JSDoc before or alongside the implementation, not after.

## Type Conventions

- **No eager type definitions** — don't extract a named type until it's used in more than one place. Inline the shape (e.g. `{ address: Address }[]`) until a shared type is clearly needed.

## Abstraction Conventions

- **Prefer duplication over the wrong abstraction** — duplicated code with a clear bug-fix burden is better than a bad abstraction that is scary to change.
- **Don't abstract until the commonalities scream** — wait for 3+ concrete use cases where the right abstraction becomes obvious. Don't abstract for 1–2 instances.
- **Optimize for change** — code that is easy to change beats code that is cleverly DRY. We don't know future requirements.
- **No flags or mode parameters** — if an abstraction needs `if` branches or boolean params to handle different call sites, it's the wrong abstraction. Inline it.
- **Start concrete, extract later** — begin inline. Extract only when a clear pattern emerges across multiple real usages.

## Testing Conventions

- **Inline snapshots over direct assertions** — prefer `toMatchInlineSnapshot()` over `.toBe()`, `.toEqual()`, etc. for return values. Use `toThrowErrorMatchingInlineSnapshot()` for error assertions. If a value has non-deterministic properties (e.g. `duration`, timestamps), extract and assert those separately, then snapshot the rest.
- **Unit and type tests as you go** — write unit tests and `.test-d.ts` type tests alongside implementation for each module. Save high-level integration tests (with and without browser) for the end.

## Git Conventions

- **Conventional commits** — use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` prefixes. Scope is optional (e.g. `feat(parser): add array coercion`).
