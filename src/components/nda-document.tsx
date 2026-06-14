import logo from "@/assets/logo.png";
import { formatDocDate } from "@/lib/format";
import type { InternRecord } from "@/lib/types";

export function NdaDocument({
  intern,
  agreementDate,
}: {
  intern: InternRecord | null;
  agreementDate: string;
}) {
  const name = intern?.fullName || "[First Party Full Name]";
  const nic = intern?.nic || "[NIC]";
  const addr = intern?.address || "[Full Address]";
  const dept = intern?.department || "[Department]";
  const date = formatDocDate(agreementDate);

  return (
    <div className="doc-canvas">
      <div className="flex items-center justify-center gap-3 mb-6">
        <img src={logo} alt="Elephant House" className="h-14 w-auto" />
        <div className="text-center">
          <h1 className="text-[18pt] font-bold m-0 text-[#1a3a1a]">
            NON-DISCLOSURE AGREEMENT
          </h1>
          <p className="text-[9pt] text-neutral-600 m-0">Ceylon Cold Stores PLC</p>
        </div>
      </div>

      <p className="text-justify">
        <strong>THIS AGREEMENT</strong> made on this <strong>{date}</strong>
      </p>

      <p className="text-center font-semibold my-3">BETWEEN</p>

      <p className="text-justify">
        <strong>{name}</strong> (Holder of National Identity Card bearing the number{" "}
        <strong>{nic}</strong>) of <strong>{addr}</strong> (hereinafter referred to as the{" "}
        <strong>"First Party"</strong>) of the one part.
      </p>

      <p className="text-center font-semibold my-3">AND</p>

      <p className="text-justify">
        <strong>CEYLON COLD STORES PLC</strong>, a public limited company duly incorporated
        in Sri Lanka and having its registered office at No. 117, Sir Chittampalam A.
        Gardiner Mawatha, Colombo 02 (hereinafter referred to as the{" "}
        <strong>"Second Party"</strong>) of the other part.
      </p>

      <p className="text-justify mt-3">
        <strong>WHEREAS</strong> the First Party desires to be an outsourced intern in
        Ceylon Cold Stores PLC, in the <strong>{dept}</strong> Department of the Second
        Party and the Second Party has agreed to such outsourced contract subject to the
        terms and conditions set out herein, including the confidentiality of all
        information disclosed during the internship.
      </p>

      <p className="text-justify mt-3">
        The First Party shall not, during the term of internship or at any time
        thereafter, disclose to any third party any confidential information acquired in
        the course of the internship, including but not limited to business processes,
        trade secrets, customer data, financial information and proprietary technology.
      </p>

      <p className="mt-8 font-semibold">IN WITNESS WHEREOF</p>
      <p className="text-justify">
        The parties hereto have set their respective hands on the day and year first above
        written.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-8">
        <div>
          <div className="h-px w-full bg-neutral-500" />
          <p className="m-0 text-[10pt] font-semibold">Signature of the First Party</p>
          <p className="m-0 text-[10pt]">{name}</p>
        </div>
        <div>
          <div className="h-px w-full bg-neutral-500" />
          <p className="m-0 text-[10pt] font-semibold">Date</p>
        </div>
      </div>

      <p className="mt-8 font-semibold">Witness of the First Party:</p>
      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3 text-[10pt]">
        <div>Name: _______________________________</div>
        <div>Designation: _________________________</div>
        <div>Signature: ___________________________</div>
        <div>Date: _______________________________</div>
      </div>

      <hr className="my-6 border-neutral-300" />

      <p className="font-semibold">
        AUTHORIZED SIGNATURE OF THE SECOND PARTY (Ceylon Cold Stores PLC)
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3 text-[10pt]">
        <div>
          <p className="m-0">
            <strong>Name:</strong> Wasantha Mudalige
          </p>
          <p className="m-0">
            <strong>Designation:</strong> Head of Human Resource Operation
          </p>
          <p className="m-0 mt-6">Signature: ____________________</p>
        </div>
        <div>
          <p className="m-0">
            <strong>Date:</strong> {date}
          </p>
        </div>
      </div>

      <p className="mt-6 font-semibold">Witness:</p>
      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3 text-[10pt]">
        <div>
          <p className="m-0">
            <strong>Name:</strong> Kamal Hasan
          </p>
          <p className="m-0">
            <strong>Designation:</strong> Assistant Manager — Human Resource
          </p>
          <p className="m-0 mt-6">Signature: ____________________</p>
        </div>
        <div>
          <p className="m-0">
            <strong>Date:</strong> {date}
          </p>
        </div>
      </div>
    </div>
  );
}
