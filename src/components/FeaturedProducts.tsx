import { getIzdvojeno } from "@/lib/katalog";
import FeaturedTabs from "./FeaturedTabs";

// Izdvojeni artikli sa pravim cenama iz kataloga (po grupama); bez artikala u ponudi se sekcija ne prikazuje
export default async function FeaturedProducts() {
  const tabs = await getIzdvojeno();
  if (!tabs.length) return null;
  return <FeaturedTabs tabs={tabs} />;
}
