// Helpful ambient declarations for mixed Deno + npm import specifiers
// This reduces TypeScript noise in the editor/CI when the project mixes Deno remote/npm imports

declare const Deno: any;

// declare generic modules for Deno npm: specifiers used in the server code (e.g. "npm:hono")
declare module 'npm:*' {
  const value: any;
  export default value;
}

// declare generic modules for jsr: specifiers (used for supabase remote import shims)
declare module 'jsr:*' {
  const value: any;
  export default value;
}

// Allow absolute-style imports used in some files (e.g. '/utils/...') to be accepted by TS
declare module '/utils/*' {
  const value: any;
  export default value;
}

// Raw imports
declare module '*?raw' {
  const content: string;
  export default content;
}

export {};
