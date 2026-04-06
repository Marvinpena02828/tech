import { getSectionSettings } from "./models/section-settings-model";
import SectionSettingsContent from "./SectionSettingsContent";

export default async function SectionSettingsPage() {
  const result = await getSectionSettings();
  const settings = result.success ? result.data : [];

  return <SectionSettingsContent settings={settings} />;
}
