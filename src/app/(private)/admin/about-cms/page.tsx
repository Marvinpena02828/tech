"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  GripVertical,
  ChevronDown,
} from "lucide-react";

export default function AboutSectionsAdmin() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<
    "profile" | "timeline" | "achievements" | "honors" | "marketing"
  >("profile");

  // ===== COMPANY PROFILE =====
  const [profile, setProfile] = useState<any>(null);
  const [editedProfile, setEditedProfile] = useState("");
  const [editedProfileTitle, setEditedProfileTitle] = useState("");

  // ===== TIMELINE =====
  const [timelines, setTimelines] = useState<any[]>([]);
  const [newTimeline, setNewTimeline] = useState({ year: "", details: "" });
  const [editingTimelineId, setEditingTimelineId] = useState<number | null>(
    null
  );

  // ===== ACHIEVEMENTS =====
  const [achievements, setAchievements] = useState<any[]>([]);
  const [newAchievement, setNewAchievement] = useState({
    stats: "",
    label: "",
    description: "",
    image_url: "",
  });
  const [editingAchievementId, setEditingAchievementId] = useState<
    number | null
  >(null);

  // ===== HONORS =====
  const [honors, setHonors] = useState<any[]>([]);
  const [newHonor, setNewHonor] = useState({
    title: "",
    year: "",
    image_url: "",
    icon_type: "trophy",
  });
  const [editingHonorId, setEditingHonorId] = useState<number | null>(null);

  // ===== MARKETING =====
  const [marketing, setMarketing] = useState<any>(null);
  const [editedMarketing, setEditedMarketing] = useState({
    countries_count: 50,
    major_customers_count: 150,
    description: "",
    regions: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        profileData,
        timelinesData,
        achievementsData,
        honorsData,
        marketingData,
      ] = await Promise.all([
        supabase
          .from("company_profile")
          .select("*")
          .eq("is_active", true)
          .single(),
        supabase
          .from("timeline_milestones")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("company_achievements")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("company_honors")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("global_marketing")
          .select("*")
          .eq("is_active", true)
          .single(),
      ]);

      if (profileData.data) {
        setProfile(profileData.data);
        setEditedProfile(profileData.data.content);
        setEditedProfileTitle(profileData.data.title);
      }

      if (timelinesData.data) setTimelines(timelinesData.data);
      if (achievementsData.data) setAchievements(achievementsData.data);
      if (honorsData.data) setHonors(honorsData.data);
      if (marketingData.data) {
        setMarketing(marketingData.data);
        setEditedMarketing(marketingData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== COMPANY PROFILE HANDLERS =====
  const handleSaveProfile = async () => {
    if (!editedProfileTitle.trim() || !editedProfile.trim()) {
      toast.error("Title and content required");
      return;
    }

    try {
      if (profile) {
        await supabase
          .from("company_profile")
          .update({
            title: editedProfileTitle,
            content: editedProfile,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        toast.success("Profile updated");
      }

      fetchAllData();
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  // ===== TIMELINE HANDLERS =====
  const handleAddTimeline = async () => {
    if (!newTimeline.year.trim() || !newTimeline.details.trim()) {
      toast.error("Year and details required");
      return;
    }

    try {
      const maxSort = Math.max(0, ...timelines.map((t) => t.sort_order || 0));
      await supabase.from("timeline_milestones").insert([
        {
          year: newTimeline.year,
          details: newTimeline.details,
          sort_order: maxSort + 1,
          is_active: true,
        },
      ]);

      setNewTimeline({ year: "", details: "" });
      toast.success("Timeline added");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to add timeline");
    }
  };

  const handleDeleteTimeline = async (id: number) => {
    if (!confirm("Delete this timeline?")) return;

    try {
      await supabase.from("timeline_milestones").delete().eq("id", id);
      toast.success("Timeline deleted");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete timeline");
    }
  };

  // ===== ACHIEVEMENTS HANDLERS =====
  const handleAddAchievement = async () => {
    if (!newAchievement.stats || !newAchievement.label) {
      toast.error("Stats and label required");
      return;
    }

    try {
      const maxSort = Math.max(
        0,
        ...achievements.map((a) => a.sort_order || 0)
      );
      await supabase.from("company_achievements").insert([
        {
          ...newAchievement,
          sort_order: maxSort + 1,
          is_active: true,
        },
      ]);

      setNewAchievement({
        stats: "",
        label: "",
        description: "",
        image_url: "",
      });
      toast.success("Achievement added");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to add achievement");
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    if (!confirm("Delete this achievement?")) return;

    try {
      await supabase.from("company_achievements").delete().eq("id", id);
      toast.success("Achievement deleted");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete achievement");
    }
  };

  // ===== HONORS HANDLERS =====
  const handleAddHonor = async () => {
    if (!newHonor.title || !newHonor.year) {
      toast.error("Title and year required");
      return;
    }

    try {
      const maxSort = Math.max(0, ...honors.map((h) => h.sort_order || 0));
      await supabase.from("company_honors").insert([
        {
          ...newHonor,
          sort_order: maxSort + 1,
          is_active: true,
        },
      ]);

      setNewHonor({
        title: "",
        year: "",
        image_url: "",
        icon_type: "trophy",
      });
      toast.success("Honor added");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to add honor");
    }
  };

  const handleDeleteHonor = async (id: number) => {
    if (!confirm("Delete this honor?")) return;

    try {
      await supabase.from("company_honors").delete().eq("id", id);
      toast.success("Honor deleted");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete honor");
    }
  };

  // ===== MARKETING HANDLERS =====
  const handleSaveMarketing = async () => {
    try {
      if (marketing) {
        await supabase
          .from("global_marketing")
          .update({
            countries_count: editedMarketing.countries_count,
            major_customers_count: editedMarketing.major_customers_count,
            description: editedMarketing.description,
            regions: editedMarketing.regions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", marketing.id);

        toast.success("Marketing stats updated");
      }

      fetchAllData();
    } catch (error) {
      toast.error("Failed to save marketing stats");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">About Page CMS</h1>
        <p className="text-gray-600">
          Manage all content sections for the About page
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "profile", label: "Company Profile" },
          { id: "timeline", label: "Timeline" },
          { id: "achievements", label: "Achievements" },
          { id: "honors", label: "Honors" },
          { id: "marketing", label: "Global Marketing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as
                  | "profile"
                  | "timeline"
                  | "achievements"
                  | "honors"
                  | "marketing"
              )
            }
            className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: COMPANY PROFILE */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={editedProfileTitle}
              onChange={(e) => setEditedProfileTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description ({editedProfile.length} characters)
            </label>
            <textarea
              value={editedProfile}
              onChange={(e) => setEditedProfile(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}

      {/* TAB: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* Add New */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add Timeline
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Year"
                value={newTimeline.year}
                onChange={(e) =>
                  setNewTimeline({ ...newTimeline, year: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <textarea
                placeholder="Details"
                value={newTimeline.details}
                onChange={(e) =>
                  setNewTimeline({ ...newTimeline, details: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
              />

              <button
                onClick={handleAddTimeline}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Timeline
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {timelines.map((timeline, idx) => (
              <div
                key={timeline.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-start justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex-1 flex items-start gap-3">
                  <GripVertical size={18} className="text-gray-400 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg">{timeline.year}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {timeline.details}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTimeline(timeline.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          {/* Add New */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add Achievement
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Stats (e.g., 12+, 100%)"
                value={newAchievement.stats}
                onChange={(e) =>
                  setNewAchievement({ ...newAchievement, stats: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="text"
                placeholder="Label (e.g., Years of Industry Mastery)"
                value={newAchievement.label}
                onChange={(e) =>
                  setNewAchievement({ ...newAchievement, label: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <textarea
                placeholder="Description"
                value={newAchievement.description}
                onChange={(e) =>
                  setNewAchievement({
                    ...newAchievement,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
              />

              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newAchievement.image_url}
                onChange={(e) =>
                  setNewAchievement({
                    ...newAchievement,
                    image_url: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <button
                onClick={handleAddAchievement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Achievement
              </button>
            </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-2xl font-bold text-blue-600">
                      {achievement.stats}
                    </h4>
                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {achievement.label}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {achievement.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {achievement.description}
                  </p>
                )}

                {achievement.image_url && (
                  <p className="text-xs text-gray-500 truncate">
                    {achievement.image_url}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: HONORS */}
      {activeTab === "honors" && (
        <div className="space-y-6">
          {/* Add New */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add Honor
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Honor Title"
                value={newHonor.title}
                onChange={(e) =>
                  setNewHonor({ ...newHonor, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="text"
                placeholder="Year"
                value={newHonor.year}
                onChange={(e) => setNewHonor({ ...newHonor, year: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <select
                value={newHonor.icon_type}
                onChange={(e) =>
                  setNewHonor({ ...newHonor, icon_type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="trophy">Trophy</option>
                <option value="star">Star</option>
                <option value="medal">Medal</option>
                <option value="award">Award</option>
              </select>

              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newHonor.image_url}
                onChange={(e) =>
                  setNewHonor({ ...newHonor, image_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <button
                onClick={handleAddHonor}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Honor
              </button>
            </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {honors.map((honor) => (
              <div
                key={honor.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{honor.title}</h4>
                    <p className="text-sm text-blue-600 font-medium">
                      {honor.year}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteHonor(honor.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Icon: {honor.icon_type}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MARKETING */}
      {activeTab === "marketing" && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries Count
              </label>
              <input
                type="number"
                value={editedMarketing.countries_count}
                onChange={(e) =>
                  setEditedMarketing({
                    ...editedMarketing,
                    countries_count: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major Customers Count
              </label>
              <input
                type="number"
                value={editedMarketing.major_customers_count}
                onChange={(e) =>
                  setEditedMarketing({
                    ...editedMarketing,
                    major_customers_count: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regions (comma-separated)
            </label>
            <input
              type="text"
              value={editedMarketing.regions}
              onChange={(e) =>
                setEditedMarketing({
                  ...editedMarketing,
                  regions: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="US, Europe, South America, Australia, Southeast Asia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editedMarketing.description}
              onChange={(e) =>
                setEditedMarketing({
                  ...editedMarketing,
                  description: e.target.value,
                })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>

          <button
            onClick={handleSaveMarketing}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
