import { getAllAddresses } from "@/actions/address";
import { getAllCompanies } from "@/actions/company";
import AddressContent from "./AddressContent";

export default async function AddressPage() {
  const addresses = await getAllAddresses();
  const companies = await getAllCompanies();

  return (
    <div>
      <AddressContent addresses={addresses} companies={companies} />
    </div>
  );
}
