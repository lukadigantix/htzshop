/*
  Adresa po pravilima D Express-a (kurirska služba prodavnice): ulica iz njihovog šifarnika (ili upisana), kućni broj kao
  jedna reč (12, 12a, 23a/4/38, 54/lok7, bb) i naseljeno mesto iz šifarnika - pošiljka ide sa šifrom mesta, ne sa poštanskim
  brojem. Deli ga kasa (provera dok kupac kuca) i serverska akcija porudžbine.
*/

export type Mesto = { id: number; name: string; label: string; zipCode: string; municipality: string | null; deliveryDays: string | null };
export type Ulica = { name: string; towns: number };

const KUCNI_BROJ = /^((bb|BB|b\.b\.|B\.B\.)(\/[-a-zžćčđšA-ZĐŠĆŽČ_0-9]+)*|(\d(-\d){0,1}[a-zžćčđšA-ZĐŠĆŽČ_0-9]{0,2})+(\/[-a-zžćčđšA-ZĐŠĆŽČ_0-9]+)*)$/;

/** „12 a" → „12a", „23 / 4" → „23/4"; kućni broj je jedna reč bez razmaka i zareza */
export const sredjenBroj = (broj: string) => broj.trim().replace(/\s*\/\s*/g, "/").replace(/\s+/g, "");

export const ispravanBroj = (broj: string) => {
  const b = sredjenBroj(broj);
  return b.length > 0 && b.length <= 10 && KUCNI_BROJ.test(b);
};

/** „Kneza Miloša 12a" → { ulica: „Kneza Miloša", broj: „12a" }; sačuvana adresa iz naloga se tako deli na dva polja */
export function podeliAdresu(adresa: string | null | undefined): { ulica: string; broj: string } {
  const a = (adresa ?? "").trim().replace(/\s*\/\s*/g, "/").replace(/(\d)\s+([a-zA-Zžćčđš]{1,2})$/, "$1$2");
  const bb = /^(.*?)[\s,]+(bb|b\.b\.)$/i.exec(a);
  if (bb) return { ulica: bb[1].replace(/,$/, "").trim(), broj: "bb" };
  const m = /^(.*\S)[\s,]+(\d\S*)$/.exec(a);
  return m ? { ulica: m[1].replace(/,$/, "").trim(), broj: m[2] } : { ulica: a, broj: "" };
}
