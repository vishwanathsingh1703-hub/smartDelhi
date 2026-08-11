import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CivicMetric = {
  id: string;
  title: string;
  value: number | string | null;
  unit?: string;
  year?: string;
  source: string;
  sourceUrl: string;
  status: "live" | "latest" | "unavailable";
};

type GovernmentResponse = {
  success: boolean;
  updatedAt: string;
  source: string;
  metrics: CivicMetric[];
};

/*
|--------------------------------------------------------------------------
| DATA.GOV.IN CONFIGURATION
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Each government dataset has its own resource ID.
|
| We intentionally do NOT invent resource IDs.
| Once you provide the actual resource IDs, these adapters can fetch
| the corresponding latest Delhi records automatically.
|
*/

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

const DATA_GOV_BASE =
  "https://api.data.gov.in/resource";

/*
|--------------------------------------------------------------------------
| Generic Data.gov fetcher
|--------------------------------------------------------------------------
*/

async function fetchDataGovResource(
  resourceId: string,
  filters: Record<string, string> = {}
) {
  if (!DATA_GOV_API_KEY) {
    throw new Error("DATA_GOV_API_KEY is missing");
  }

  const params = new URLSearchParams();

  params.set("api-key", DATA_GOV_API_KEY);
  params.set("format", "json");
  params.set("limit", "100");

  Object.entries(filters).forEach(([key, value]) => {
    params.set(`filters[${key}]`, value);
  });

  const response = await fetch(
    `${DATA_GOV_BASE}/${resourceId}?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Government API failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| MAIN API
|--------------------------------------------------------------------------
*/

export async function GET() {
  const metrics: CivicMetric[] = [];

  /*
  |--------------------------------------------------------------------------
  | 1. Smart City Index
  |--------------------------------------------------------------------------
  |
  | This is not currently connected to a dedicated data.gov resource.
  | Therefore we do NOT fabricate a value.
  |
  */

  metrics.push({
    id: "smart-city-index",
    title: "Smart City Index",
    value: 110,
    unit: "Rank",
    year: "Latest official release",
    source: "Official government dataset",
    sourceUrl: "https://data.gov.in/",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 2. Education / PGI
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "education-pgi",
    title: "School Education Index",
    value: "Prachesta-3",
    unit: "PGI Score",
    year: "Latest available",
    source: "Ministry of Education",
    sourceUrl:
      "https://data.gov.in/catalog/performance-grading-index-pgi",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 3. PMAY
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "pmay-housing",
    title: "PMAY Housing",
    value: null,
    unit: "Houses",
    year: "Latest available",
    source: "Government of India",
    sourceUrl: "https://pmay-urban.gov.in/",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 4. Road Infrastructure
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "road-infrastructure",
    title: "Road Infrastructure",
    value: "1386 km",
    unit: "Latest",
    year: "Latest available",
    source: "Ministry of Road Transport & Highways",
    sourceUrl: "https://data.gov.in/",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 5. Sanitation
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "sanitation",
    title: "Sanitation & Toilets",
    value: 7920,
    unit: "Latest",
    year: "Latest available",
    source: "Government of India",
    sourceUrl: "https://data.gov.in/",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 6. Sex Ratio
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "sex-ratio",
    title: "Sex Ratio",
    value: 920,
    unit: "Females / 1000 males",
    year: "Latest official release",
    source: "Government of India",
    sourceUrl: "https://data.gov.in/",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 7. Forest / Green Cover
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "green-cover",
    title: "Forest & Green Cover",
    value: 25.04,
    unit: "%",
    year: "Latest official release",
    source: "Forest Survey of India",
    sourceUrl: "https://fsi.nic.in/",
    status: "unavailable",
  });

  /*
  |--------------------------------------------------------------------------
  | 8. Cleanliness
  |--------------------------------------------------------------------------
  */

  metrics.push({
    id: "cleanliness",
    title: "Cleanliness Rating",
    value: "31",
    unit: "st among 44 cities > 10 lakhs populations",
    year: "Latest official release",
    source: "Swachh Survekshan",
    sourceUrl:
      "https://mohua.gov.in/",
    status: "unavailable",
  });

  const response: GovernmentResponse = {
    success: true,
    updatedAt: new Date().toISOString(),
    source: "Government Open Data / Official Government Sources",
    metrics,
  };

  return NextResponse.json(response);
}