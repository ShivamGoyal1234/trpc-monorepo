declare module "@scalar/nextjs-api-reference" {
  type ApiReferenceConfiguration = {
    url?: string;
    content?: string;
    theme?: string;
    metaData?: { title?: string; description?: string };
    authentication?: { preferredSecurityScheme?: string };
    cdn?: string;
    /** @deprecated Use top-level `url` instead */
    spec?: { url?: string; content?: string };
  };

  export const ApiReference: (
    config: ApiReferenceConfiguration,
  ) => () => Response;
}
