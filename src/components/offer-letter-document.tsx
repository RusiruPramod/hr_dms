import logo from "@/assets/logo.png";
import { formatDocDate, durationMonths, firstName, formatNic } from "@/lib/format";
import { COMPANY } from "@/lib/company";
import type { InternRecord } from "@/lib/types";

function Letterhead() {
  return (
    <div className="flex items-center justify-between border-b-2 border-[#1a3a1a] pb-3 mb-6">
      <div>
        <h1 className="text-[20pt] font-bold tracking-tight text-[#1a3a1a] m-0">
          CEYLON COLD STORES PLC
        </h1>
        <p className="text-[9pt] text-neutral-600 m-0">
          No. 117, Sir Chittampalam A. Gardiner Mawatha, Colombo 02, Sri Lanka
        </p>
      </div>
      <img src={logo} alt="Elephant House" className="h-16 w-auto" />
    </div>
  );
}

export function OfferLetterDocument({
  intern,
  letterDate,
}: {
  intern: InternRecord | null;
  letterDate: string;
}) {
  const name = intern?.fullName || "[Intern Full Name]";
  const addr = intern?.address || "[Address]";
  const start = formatDocDate(intern?.startDate);
  const end = formatDocDate(intern?.endDate);
  const dur = durationMonths(intern?.startDate, intern?.endDate);
  const fn = firstName(intern?.fullName) || "[First Name]";
  const nic = formatNic(intern?.nic) || "[NIC]";

  return (
    <div className="doc-canvas">
      <Letterhead />
      <p className="text-right">{formatDocDate(letterDate)}</p>
      <p className="mt-4 mb-0">Mr./Ms. {name}</p>
      <p className="m-0 whitespace-pre-line">{addr}</p>

      <p className="mt-6">Dear {fn},</p>

      <h2 className="text-[13pt] font-bold underline mt-4 mb-2">LETTER OF INTERNSHIP</h2>

      <p className="text-justify">
        We are pleased to offer you a period of internship in the above company from{" "}
        <strong>{start}</strong> to <strong>{end}</strong>. We expect you to make use of this period
        to familiarize yourself with the corporate world by participating in our day-to-day
        operations along with our employees. You should liaise with the undersigned in relation to
        all matters during this period.
      </p>

      <p className="mt-8">Yours faithfully,</p>
      <p className="font-semibold m-0">Ceylon Cold Stores PLC</p>

      <div className="mt-12">
        {intern?.metadata?.signatures?.hr && (
          <img
            src={intern.metadata.signatures.hr}
            alt="HR Signature"
            className="h-10 object-contain mb-1"
          />
        )}
        <div className="h-px w-56 bg-neutral-400" />
        <p className="m-0 font-semibold">{COMPANY.authorizedSignatory.name}</p>
        <p className="m-0 text-[10pt] text-neutral-600">{COMPANY.authorizedSignatory.title}</p>
      </div>

      <hr className="my-8 border-neutral-300" />

      <h3 className="font-bold underline mb-2">INTERN ACCEPTANCE</h3>
      <p className="text-justify">
        I am pleased to accept this offer of <strong>{dur}</strong> internship commencing{" "}
        <strong>{start}</strong> on the basis given above.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-8">
        <div>
          {intern?.metadata?.signatures?.intern && (
            <img
              src={intern.metadata.signatures.intern}
              alt="Intern Signature"
              className="h-10 object-contain mb-1"
            />
          )}
          <div className="h-px w-full bg-neutral-400" />
          <p className="m-0 text-[10pt]">Signature</p>
        </div>
        <div>
          <div className="h-px w-full bg-neutral-400" />
          <p className="m-0 text-[10pt]">Date</p>
        </div>
      </div>

      <p className="mt-6 m-0">
        <strong>Name:</strong> {name}
      </p>
      <p className="m-0">
        <strong>NIC:</strong> {nic}
      </p>
      {intern?.phone ? (
        <p className="m-0">
          <strong>Telephone:</strong> {intern.phone}
        </p>
      ) : null}
    </div>
  );
}
