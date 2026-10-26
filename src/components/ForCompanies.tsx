import Link from "next/link";
import { companySteps, contact } from "@/data/site";

// Sekcija 8 (Pitbike „Rennsaison 2026."): naslov + tekst levo, lista redova sa oznakom desno.
export default function ForCompanies() {
  return (
    <section className="container-site grid grid-cols-1 gap-10 pb-16 md:pb-24 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2 className="h-section">Za firme i timove.</h2>
        <p className="p-muted mt-5 max-w-[440px]">
          Opremamo cele ekipe: od jednog radnika do celog pogona. Veličine i brendiranje rešavamo na jednom mestu, isporuka na adresu firme.
        </p>
        <Link href="/kontakt/#ponuda" className="btn-primary mt-6">
          Zatražite ponudu
        </Link>
      </div>
      <div>
        <p className="kicker">Kako naručujete</p>
        <ul className="mt-6">
          {companySteps.map((s) => (
            <li key={s.tag} className="flex items-center justify-between border-b border-subtle py-6">
              <div>
                <p className="text-[16px] font-medium">{s.title}</p>
                <p className="mt-1 text-[13px] text-secondary">{s.meta}</p>
              </div>
              <span className="rounded-full border border-subtle px-3 py-1 text-[12px] text-primary">{s.tag}</span>
            </li>
          ))}
          <li className="flex items-center justify-between border-b border-subtle py-6">
            <div>
              <p className="text-[16px] font-medium">Direktno: {contact.email}</p>
              <p className="mt-1 text-[13px] text-secondary">{contact.phone} · pon-pet 07-15h</p>
            </div>
            <span className="rounded-full border border-subtle px-3 py-1 text-[12px] text-primary">Kontakt</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
