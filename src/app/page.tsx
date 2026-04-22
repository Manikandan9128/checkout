import CheckoutForm from "./CheckoutForm";

const BASE = "http://13.203.81.21:8000";

async function fetchData() {
  try {
    const [meta, lang, platform] = await Promise.all([
      fetch(`${BASE}/api/senior/create/meta/`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${BASE}/api/administration/language-list/`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${BASE}/api/administration/platform/`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genderOptions: (meta as any)?.data?.meta?.gender ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationshipOptions: (meta as any)?.data?.meta?.relationship ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      languages: (lang as any)?.data?.results ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platforms: (platform as any)?.data?.results ?? [],
    };
  } catch {
    return { genderOptions: [], relationshipOptions: [], languages: [], platforms: [] };
  }
}

export default async function Home() {
  const data = await fetchData();
  return <CheckoutForm {...data} />;
}
