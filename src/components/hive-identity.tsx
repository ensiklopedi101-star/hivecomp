import { Hexagon } from "lucide-react";

/** Reuses the existing identity until an administrator explicitly applies a concept. */
export default function HiveIdentity({ logo = "" }: { logo?: string }) {
  return (
    <>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
      ) : (
        <span className="clip-hex grid h-9 w-9 shrink-0 place-items-center bg-hive text-ink transition-transform duration-500 group-hover:rotate-[30deg]">
          <Hexagon className="h-4 w-4" strokeWidth={2.75} />
        </span>
      )}
      <span className="font-display text-lg font-bold tracking-[0.18em]">HIVE<span className="text-hive">COMP</span></span>
    </>
  );
}
