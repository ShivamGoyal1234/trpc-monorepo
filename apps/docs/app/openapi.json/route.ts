const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const response = await fetch(`${apiUrl}/openapi.json`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return Response.json(
        {
          error: "Failed to fetch OpenAPI spec from API",
          status: response.status,
        },
        { status: 502 },
      );
    }

    const spec = (await response.json()) as Record<string, unknown>;

    return Response.json(spec, {
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch {
    return Response.json(
      {
        error: "API is unreachable. Start the API server on port 3001.",
      },
      { status: 503 },
    );
  }
}
