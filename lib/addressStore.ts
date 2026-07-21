import { createClient } from "@/lib/supabase/server";
import { asShipping, validateShipping, type ShippingInfo } from "@/lib/checkout";

const TABLE = "addresses";

export interface SavedAddress extends Omit<ShippingInfo, "note"> {
  id: string;
  label: string;
  isDefault: boolean;
}

interface AddressRow {
  id: string;
  label: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export type AddressInput = Omit<SavedAddress, "id">;

const rowToAddress = (row: AddressRow): SavedAddress => ({
  id: row.id,
  label: row.label,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  district: row.district,
  province: row.province,
  postalCode: row.postal_code,
  isDefault: row.is_default,
});

const addressFields = (input: AddressInput) => ({
  label: input.label,
  full_name: input.fullName,
  email: input.email,
  phone: input.phone,
  address: input.address,
  district: input.district,
  province: input.province,
  postal_code: input.postalCode,
  is_default: input.isDefault,
});

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" ||
  error?.code === "PGRST205" ||
  error?.message?.includes("addresses") === true;

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

export function parseAddressInput(raw: unknown): AddressInput | string {
  if (typeof raw !== "object" || raw === null) return "Invalid address";
  const body = raw as Record<string, unknown>;
  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label || label.length > 60) return "Address label is required";

  const shipping = asShipping(body);
  const errors = validateShipping(shipping);
  if (Object.keys(errors).length > 0) return "Invalid address details";

  return {
    label,
    fullName: shipping.fullName,
    email: shipping.email,
    phone: shipping.phone,
    address: shipping.address,
    district: shipping.district,
    province: shipping.province,
    postalCode: shipping.postalCode,
    isDefault: body.isDefault === true,
  };
}

export async function listOwnAddresses(): Promise<{
  addresses: SavedAddress[];
  setupRequired: boolean;
}> {
  const { supabase, user } = await authenticatedClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (isMissingTable(error)) return { addresses: [], setupRequired: true };
  if (error) throw new Error(`Failed to load addresses: ${error.message}`);
  return {
    addresses: ((data ?? []) as AddressRow[]).map(rowToAddress),
    setupRequired: false,
  };
}

export async function createOwnAddress(input: AddressInput): Promise<SavedAddress> {
  const { supabase, user } = await authenticatedClient();
  const { count, error: countError } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError) throw new Error(`Failed to inspect addresses: ${countError.message}`);
  const shouldDefault = input.isDefault || count === 0;

  if (shouldDefault) {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
    if (error) throw new Error(`Failed to update default address: ${error.message}`);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: user.id, ...addressFields({ ...input, isDefault: shouldDefault }) })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to save address: ${error.message}`);
  return rowToAddress(data as AddressRow);
}

export async function updateOwnAddress(
  id: string,
  input: AddressInput
): Promise<SavedAddress | undefined> {
  const { supabase, user } = await authenticatedClient();
  if (input.isDefault) {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true)
      .neq("id", id);
    if (error) throw new Error(`Failed to update default address: ${error.message}`);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(addressFields(input))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Failed to update address: ${error.message}`);
  return data ? rowToAddress(data as AddressRow) : undefined;
}

export async function deleteOwnAddress(id: string): Promise<boolean> {
  const { supabase, user } = await authenticatedClient();
  const { data: existing, error: findError } = await supabase
    .from(TABLE)
    .select("is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (findError) throw new Error(`Failed to find address: ${findError.message}`);
  if (!existing) return false;

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(`Failed to delete address: ${error.message}`);

  if ((existing as { is_default: boolean }).is_default) {
    const { data: next } = await supabase
      .from(TABLE)
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase
        .from(TABLE)
        .update({ is_default: true })
        .eq("id", next.id)
        .eq("user_id", user.id);
    }
  }
  return true;
}
