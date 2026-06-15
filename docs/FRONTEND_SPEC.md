# Frontend Specification

## Pages

- Dashboard: counts and quick actions
- Records List: search, suggestions, filters
- Record Detail: preview documents, download, generate
- Record Edit / Create: `InternForm`

## Key Components

- `InternForm` — canonical form for all input fields (validation client-side)
- `OfferLetterDocument` & `NdaDocument` — preview & print templates
- `SignaturePad` — capture signatures (canvas) and upload

## Canonical Fields

- `fullName`, `nameWithInitials`, `nic`, `address`, `department`, `startDate`, `endDate`, `supervisor`, `phone`, `internSignature`, `witnessName`, `witnessSignature`, `agreementDate`

## UX Flows

- Autocomplete existing records while typing (`InternForm` suggestions)
- Inline validation with clear messages
- Preview modal before generation
- Signature capture: allow file upload or draw; display preview
