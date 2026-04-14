import { fetchTrailerKey } from "@/lib/Api_";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!id) {
    return Response.json({ key: null, message: "ID invalido" }, { status: 400 });
  }

  const key = await fetchTrailerKey(id);
  return Response.json({ key });
}
