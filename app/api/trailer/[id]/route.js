import { fetchTrailerKey } from "@/lib/Api_";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return Response.json({ key: null }, { status: 400 });
  }

  try {
    const key = await fetchTrailerKey(id);
    return Response.json(
      { key },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return Response.json({ key: null }, { status: 500 });
  }
}
