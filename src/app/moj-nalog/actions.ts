"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { pozovi, PORUKA_SERVER } from "@/lib/api";
import { getToken, sesijaOpcije } from "@/lib/nalog";
import { inicijali, PRIJAVLJEN, SESIJA, sigurnoNazad, type Korisnik } from "@/lib/nalog-deo";

/*
  Akcije naloga (po uzoru na klikdogume components/nalog/*-actions.ts). Svaka vraća grešku i polja koja treba označiti;
  forme ih šalju preko useForma (components/nalog/Polja.tsx), pa upisano ostaje u poljima i posle greške.
  Korpa ostaje u kolačiću i posle prijave (HTZ backend porudžbinu pravi iz poslatih stavki, ne iz korpe na serveru).
*/

export type Stanje = { ok: true; poruka?: string } | { ok: false; greska: string; polja?: string[] } | undefined;

const tekst = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const greska = (r: { status: number; message: string }) => (r.status === 0 ? PORUKA_SERVER : r.status === 429 ? "Previše pokušaja zaredom. Sačekajte nekoliko minuta pa pokušajte ponovo." : r.message);

/** Sesija (httpOnly token) i inicijali za zaglavlje - isti rok. */
async function upisiSesiju(token: string, k: Korisnik) {
  const c = await cookies();
  c.set(SESIJA, token, sesijaOpcije());
  c.set(PRIJAVLJEN, inicijali(k), { ...sesijaOpcije(), httpOnly: false });
}

/** POST /auth/login → sesija → nazad na stranu odakle je kupac došao (ili Moj nalog). */
export async function prijava(_: Stanje, fd: FormData): Promise<Stanje> {
  const email = tekst(fd, "email");
  const password = String(fd.get("password") ?? "");
  const polja = [...(EMAIL.test(email) ? [] : ["email"]), ...(password ? [] : ["password"])];
  if (polja.length) return { ok: false, greska: "Upišite e-mail i lozinku.", polja };

  const r = await pozovi<{ user: Korisnik; token: string }>("/auth/login", { method: "POST", body: { email, password } });
  if (!r.ok) {
    if (r.status === 401 && /deaktiv/i.test(r.message)) return { ok: false, greska: "Nalog je isključen. Pozovite nas da proverimo." };
    return { ok: false, greska: r.status === 401 ? "Pogrešan e-mail ili lozinka." : greska(r), polja: r.status === 401 ? ["email", "password"] : undefined };
  }
  await upisiSesiju(r.data.token, r.data.user);
  redirect(sigurnoNazad(tekst(fd, "nazad")));
}

/** POST /auth/register: backend odmah vraća i token, kupac je prijavljen bez potvrde mejla. */
export async function registracija(_: Stanje, fd: FormData): Promise<Stanje> {
  const v = { firstName: tekst(fd, "firstName"), lastName: tekst(fd, "lastName"), email: tekst(fd, "email"), phone: tekst(fd, "phone") };
  const password = String(fd.get("password") ?? "");
  const confirmPassword = String(fd.get("confirmPassword") ?? "");
  const polja: string[] = [];
  if (v.firstName.length < 2) polja.push("firstName");
  if (v.lastName.length < 2) polja.push("lastName");
  if (!EMAIL.test(v.email)) polja.push("email");
  if (!/^\+?[\d\s\-()/]{7,20}$/.test(v.phone) || v.phone.replace(/\D/g, "").length < 8) polja.push("phone");
  if (password.length < 8) polja.push("password");
  if (confirmPassword !== password) polja.push("confirmPassword");
  if (fd.get("termsAccepted") !== "1") polja.push("termsAccepted");
  if (polja.length) {
    const poruka =
      polja.length === 1 && polja[0] === "confirmPassword" ? "Lozinke se ne poklapaju." : polja.length === 1 && polja[0] === "termsAccepted" ? "Potrebno je da prihvatite uslove korišćenja." : "Proverite označena polja.";
    return { ok: false, greska: poruka, polja };
  }

  const r = await pozovi<{ user: Korisnik; token: string }>("/auth/register", {
    method: "POST",
    body: { ...v, phone: v.phone.replace(/\//g, " "), password, confirmPassword, termsAccepted: true },
  });
  if (!r.ok) return { ok: false, greska: /postoji|registrovan|exists/i.test(r.message) ? "Nalog sa ovim e-mailom već postoji. Prijavite se ili obnovite lozinku." : greska(r), polja: /mail/i.test(r.message) ? ["email"] : undefined };
  await upisiSesiju(r.data.token, r.data.user);
  redirect(sigurnoNazad(tekst(fd, "nazad")));
}

/** Briše sesiju (backend nema odjavu, JWT važi do isteka - ali bez kolačića ga niko ne šalje). */
export async function odjava() {
  const c = await cookies();
  c.delete(SESIJA);
  c.delete(PRIJAVLJEN);
  redirect("/");
}

/** Zaboravljena lozinka u tri koraka, jedna forma: 1 e-mail → 2 kod iz mejla → 3 nova lozinka. */
export type ResetStanje = { korak: 1 | 2 | 3; email: string; otp?: string; greska?: string };

export async function resetLozinke(prev: ResetStanje, fd: FormData): Promise<ResetStanje> {
  const korak = prev.korak;
  const email = tekst(fd, "email") || prev.email;

  if (korak === 1) {
    if (!EMAIL.test(email)) return { korak: 1, email, greska: "Upišite e-mail sa kojim ste otvorili nalog." };
    // backend uvek odgovori isto (ne otkriva koji mejlovi postoje); kod važi 15 minuta
    const r = await pozovi("/auth/forgot-password", { method: "POST", body: { email } });
    return r.ok ? { korak: 2, email } : { korak: 1, email, greska: greska(r) };
  }

  if (korak === 2) {
    const otp = tekst(fd, "otp").replace(/\s+/g, "");
    if (!/^\d{6}$/.test(otp)) return { korak: 2, email, greska: "Kod ima 6 cifara." };
    const r = await pozovi("/auth/verify-otp", { method: "POST", body: { email, otp } });
    return r.ok ? { korak: 3, email, otp } : { korak: 2, email, greska: r.status === 400 ? "Kod nije ispravan ili je istekao." : greska(r) };
  }

  const otp = prev.otp ?? "";
  const newPassword = String(fd.get("newPassword") ?? "");
  const confirmPassword = String(fd.get("confirmPassword") ?? "");
  if (newPassword.length < 8) return { ...prev, greska: "Lozinka mora imati najmanje 8 znakova." };
  if (newPassword !== confirmPassword) return { ...prev, greska: "Lozinke se ne poklapaju." };
  const r = await pozovi("/auth/reset-password", { method: "POST", body: { email, otp, newPassword, confirmPassword } });
  if (!r.ok) return { ...prev, greska: r.status === 400 ? "Kod je istekao. Zatražite novi kod." : greska(r) };
  redirect("/prijava/?poruka=nova-lozinka");
}

/** PUT /users/profile - ime, prezime i telefon (e-mail je prijava i ne menja se). */
export async function izmeniProfil(_: Stanje, fd: FormData): Promise<Stanje> {
  const token = await getToken();
  if (!token) redirect("/prijava/?nazad=/moj-nalog/podaci/");
  const v = { firstName: tekst(fd, "firstName"), lastName: tekst(fd, "lastName"), phone: tekst(fd, "phone") };
  const polja: string[] = [];
  if (v.firstName.length < 2) polja.push("firstName");
  if (v.lastName.length < 2) polja.push("lastName");
  if (v.phone.replace(/\D/g, "").length < 8) polja.push("phone");
  if (polja.length) return { ok: false, greska: "Proverite označena polja.", polja };
  const r = await pozovi<Korisnik>("/users/profile", { method: "PUT", body: v, token });
  if (!r.ok) return { ok: false, greska: greska(r) };
  // novi inicijali u zaglavlju
  (await cookies()).set(PRIJAVLJEN, inicijali({ ...v, email: r.data?.email ?? "" }), { ...sesijaOpcije(), httpOnly: false });
  refresh();
  return { ok: true, poruka: "Podaci su sačuvani." };
}

/** PUT /users/change-password - backend proverava trenutnu lozinku (400). */
export async function promeniLozinku(_: Stanje, fd: FormData): Promise<Stanje> {
  const token = await getToken();
  if (!token) redirect("/prijava/?nazad=/moj-nalog/podaci/");
  const currentPassword = String(fd.get("currentPassword") ?? "");
  const newPassword = String(fd.get("newPassword") ?? "");
  const confirm = String(fd.get("confirmPassword") ?? "");
  const polja: string[] = [];
  if (!currentPassword) polja.push("currentPassword");
  if (newPassword.length < 8) polja.push("newPassword");
  if (confirm !== newPassword) polja.push("confirmPassword");
  if (polja.length) return { ok: false, greska: polja.length === 1 && polja[0] === "confirmPassword" ? "Nova lozinka i potvrda se ne poklapaju." : "Proverite označena polja. Nova lozinka ima najmanje 8 znakova.", polja };
  const r = await pozovi("/users/change-password", { method: "PUT", body: { currentPassword, newPassword }, token });
  if (!r.ok) return { ok: false, greska: r.status === 400 ? "Trenutna lozinka nije tačna." : greska(r), polja: r.status === 400 ? ["currentPassword"] : undefined };
  return { ok: true, poruka: "Lozinka je promenjena." };
}

/** Nova (POST /addresses, najviše 3) ili izmena (PUT /addresses/{id}); skriveno polje `id` odlučuje. */
export async function sacuvajAdresu(_: Stanje, fd: FormData): Promise<Stanje> {
  const token = await getToken();
  if (!token) redirect("/prijava/?nazad=/moj-nalog/adrese/");
  const id = tekst(fd, "id");
  const v = { fullName: tekst(fd, "fullName"), phone: tekst(fd, "phone"), address: tekst(fd, "address"), city: tekst(fd, "city"), zipCode: tekst(fd, "zipCode") };
  const polja: string[] = [];
  if (v.fullName.length < 3) polja.push("fullName");
  if (v.phone.replace(/\D/g, "").length < 8) polja.push("phone");
  if (v.address.length < 3) polja.push("address");
  if (!/^\d{5}$/.test(v.zipCode)) polja.push("zipCode");
  if (v.city.length < 2) polja.push("city");
  if (polja.length) return { ok: false, greska: "Proverite označena polja.", polja };
  const body = { ...v, country: "Srbija", isDefault: fd.get("isDefault") === "1" };
  const r = UUID.test(id) ? await pozovi(`/addresses/${id}`, { method: "PUT", body, token }) : await pozovi("/addresses", { method: "POST", body, token });
  if (!r.ok) return { ok: false, greska: /najvise|najviše/i.test(r.message) ? "Možete sačuvati najviše tri adrese." : greska(r) };
  refresh();
  return { ok: true };
}

export async function obrisiAdresu(id: string) {
  const token = await getToken();
  if (!token || !UUID.test(id)) return;
  await pozovi(`/addresses/${id}`, { method: "DELETE", token });
  refresh();
}

export async function postaviPodrazumevanu(id: string) {
  const token = await getToken();
  if (!token || !UUID.test(id)) return;
  await pozovi(`/addresses/${id}/set-default`, { method: "PATCH", token });
  refresh();
}

/** POST /complaints - naslov ≥ 5 i opis ≥ 20 znakova; rok i „jedna po porudžbini" proverava backend i javlja poruku. */
export async function podnesiReklamaciju(_: Stanje, fd: FormData): Promise<Stanje> {
  const token = await getToken();
  if (!token) redirect("/prijava/?nazad=/moj-nalog/reklamacije/nova/");
  const v = { orderId: tekst(fd, "orderId"), subject: tekst(fd, "subject"), description: tekst(fd, "description") };
  const polja: string[] = [];
  if (!UUID.test(v.orderId)) polja.push("orderId");
  if (v.subject.length < 5) polja.push("subject");
  if (v.description.length < 20) polja.push("description");
  if (polja.length) return { ok: false, greska: "Proverite označena polja.", polja };
  const r = await pozovi<{ id: string }>("/complaints", { method: "POST", body: v, token });
  if (!r.ok) return { ok: false, greska: greska(r) };
  redirect(`/moj-nalog/reklamacije/${r.data.id}/?nova=1`);
}
