import { NextRequest, NextResponse } from "next/server";

const PAGESPEED_API_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

interface PageSpeedRequest {
  url: string;
  strategy?: "mobile" | "desktop";
}

export async function POST(request: NextRequest) {
  try {
    const body: PageSpeedRequest = await request.json();

    // Validate required fields
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      const parsedUrl = new URL(body.url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid URL format. Please provide a valid HTTP or HTTPS URL.",
        },
        { status: 400 }
      );
    }

    // Validate strategy
    const strategy = body.strategy || "mobile";
    if (!["mobile", "desktop"].includes(strategy)) {
      return NextResponse.json(
        { error: "Invalid strategy. Must be 'mobile' or 'desktop'." },
        { status: 400 }
      );
    }

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "PageSpeed API key is not configured. Please set PAGESPEED_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Build the PageSpeed API URL
    const params = new URLSearchParams({
      url: body.url,
      strategy: strategy,
      key: apiKey,
    });

    // Make the request to Google PageSpeed Insights API
    const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // Parse the response
    const data = await response.json();

    // Check for API errors
    if (!response.ok) {
      const errorMessage =
        data.error?.message || "Failed to fetch PageSpeed data";
      return NextResponse.json(
        { error: errorMessage, details: data.error },
        { status: response.status }
      );
    }

    // Return the raw PageSpeed response
    return NextResponse.json(data);
  } catch (error) {
    console.error("PageSpeed API error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching PageSpeed data" },
      { status: 500 }
    );
  }
}

// Also support GET requests for convenience
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const strategy = searchParams.get("strategy") as
      | "mobile"
      | "desktop"
      | null;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: "URL query parameter is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid URL format. Please provide a valid HTTP or HTTPS URL.",
        },
        { status: 400 }
      );
    }

    // Validate strategy
    const deviceStrategy = strategy || "mobile";
    if (!["mobile", "desktop"].includes(deviceStrategy)) {
      return NextResponse.json(
        { error: "Invalid strategy. Must be 'mobile' or 'desktop'." },
        { status: 400 }
      );
    }

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "PageSpeed API key is not configured. Please set PAGESPEED_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Build the PageSpeed API URL
    const params = new URLSearchParams({
      url: url,
      strategy: deviceStrategy,
      key: apiKey,
    });

    // Make the request to Google PageSpeed Insights API
    const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // Parse the response
    const data = await response.json();

    // Check for API errors
    if (!response.ok) {
      const errorMessage =
        data.error?.message || "Failed to fetch PageSpeed data";
      return NextResponse.json(
        { error: errorMessage, details: data.error },
        { status: response.status }
      );
    }

    // Return the raw PageSpeed response
    return NextResponse.json(data);
  } catch (error) {
    console.error("PageSpeed API error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching PageSpeed data" },
      { status: 500 }
    );
  }
}
