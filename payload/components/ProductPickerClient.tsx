"use client";

import { SelectInput, useField, useTranslation } from "@payloadcms/ui";

export function ProductPickerClient({
  path,
  readOnly,
  options,
}: {
  path: string;
  readOnly?: boolean;
  options: { value: string; label: string }[];
}) {
  const { value, setValue, showError } = useField<string>({ path });
  const { i18n } = useTranslation();
  const isThai = i18n.language === "th";

  // A row saved for a product that has since been deleted still shows its id,
  // so the editor can see what it was and remove it.
  const known = options.some((o) => o.value === value);
  const all = value && !known ? [...options, { value, label: `${value} (not in the catalogue)` }] : options;

  return (
    <SelectInput
      name={path}
      path={path}
      label={isThai ? "สินค้า" : "Product"}
      required
      readOnly={readOnly}
      showError={showError}
      options={all}
      value={value ?? ""}
      onChange={(option) => {
        const picked = Array.isArray(option) ? option[0] : option;
        setValue(typeof picked?.value === "string" ? picked.value : "");
      }}
    />
  );
}
