import { getAllCompanies } from "@/actions/company";
import CompanyContent from "./CompanyContent";

export default async function CompaniesPage() {
  const companies = await getAllCompanies();

  return (
    <div>
      <CompanyContent companies={companies} />
    </div>
  );
}
