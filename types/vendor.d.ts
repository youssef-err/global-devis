declare module '@react-pdf/renderer' {
  import type { ComponentType, ReactNode } from 'react';

  export const Document: ComponentType<{ children?: ReactNode }>;
  export const Page: ComponentType<Record<string, unknown>>;
  export const Text: ComponentType<Record<string, unknown>>;
  export const View: ComponentType<Record<string, unknown>>;
  export const Image: ComponentType<Record<string, unknown>>;
  export const Font: {
    register: (config: Record<string, unknown>) => void;
  };
  export const StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T) => T;
  };
  export const pdf: (input: ReactNode) => {
    toBlob: () => Promise<Blob>;
  };
}

declare module 'gray-matter' {
  const matter: (source: string) => {
    data: Record<string, unknown>;
    content: string;
  };

  export default matter;
}

declare module 'remark' {
  export function remark(): {
    use: (plugin: unknown) => ReturnType<typeof remark>;
    process: (content: string) => Promise<{ toString: () => string }>;
  };
}

declare module 'remark-html' {
  const html: unknown;
  export default html;
}
