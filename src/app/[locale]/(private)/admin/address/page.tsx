import { getAllAddresses } from "@/actions/address";
import AddressContent from "./AddressContent";

export const metadata = {
  title: "Address Management | Admin",
  description: "Manage company addresses",
};

export default async function AddressPage() {
  const addresses = await getAllAddresses();

  return <AddressContent addresses={addresses} />;
}
