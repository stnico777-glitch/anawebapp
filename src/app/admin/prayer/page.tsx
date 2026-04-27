import { getAudioLayoutForAdmin } from "@/lib/audio-layout";
import PrayerAudioLibraryAdminView from "./PrayerAudioLibraryAdminView";

export default async function AdminPrayerPage() {
  const layout = await getAudioLayoutForAdmin();
  return <PrayerAudioLibraryAdminView layout={{ collections: layout.collections }} />;
}
