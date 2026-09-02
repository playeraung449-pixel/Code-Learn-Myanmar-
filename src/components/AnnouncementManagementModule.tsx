/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  Send,
  Pin,
  PinOff,
  AlertTriangle,
  Sparkles,
  Layers,
  Users,
  Shield,
  Check,
  X,
  ExternalLink,
  BookOpen,
  Crown,
  Wrench,
  Info,
  Flame,
  Radio,
  FileText
} from "lucide-react";
import {
  UserProfile,
  AdminAnnouncementItem,
  AnnouncementType,
  AnnouncementStatus,
  TargetAudienceType
} from "../types";
import {
  getDetailedAnnouncementsFromDb,
  saveDetailedAnnouncementToDb,
  publishAnnouncementInDb,
  unpublishAnnouncementInDb,
  archiveAnnouncementInDb,
  deleteDetailedAnnouncementFromDb,
  togglePinAnnouncementInDb
} from "../lib/db";

interface AnnouncementManagementModuleProps {
  currentUser: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
}

export const AnnouncementManagementModule: React.FC<AnnouncementManagementModuleProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<AdminAnnouncementItem> | null>(null);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const adminEmail = currentUser?.email || "admin@codelearnmm.com";
  const adminName = currentUser?.fullName || "Code Learn Myanmar Team";

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getDetailedAnnouncementsFromDb();
      setAnnouncements(data);
    } catch (e) {
      console.error("Failed to load announcements:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.titleMm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.contentMm?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || ann.status === statusFilter;

      const matchesType =
        typeFilter === "all" || ann.type === typeFilter;

      const matchesAudience =
        audienceFilter === "all" || ann.targetAudience === audienceFilter;

      return matchesSearch && matchesStatus && matchesType && matchesAudience;
    });
  }, [announcements, searchQuery, statusFilter, typeFilter, audienceFilter]);

  const handleOpenCreateModal = () => {
    setEditingItem({
      title: "",
      titleMm: "",
      content: "",
      contentMm: "",
      type: "General Announcement",
      status: "draft",
      targetAudience: "all",
      isPinned: false,
      publishDate: new Date().toISOString().split("T")[0],
      ctaButtonLabel: "Learn More",
      ctaActionTab: "courses"
    });
    setPreviewMode("edit");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AdminAnnouncementItem) => {
    setEditingItem({ ...item });
    setPreviewMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = async (publishImmediately = false) => {
    if (!editingItem?.title?.trim() || !editingItem?.content?.trim()) {
      showToast("Please provide both Title and Description content.");
      return;
    }

    setSaving(true);
    try {
      const statusToSet: AnnouncementStatus = publishImmediately
        ? "published"
        : (editingItem.status as AnnouncementStatus) || "draft";

      const payload: AdminAnnouncementItem = {
        id: editingItem.id || `ann_${Date.now()}`,
        title: editingItem.title.trim(),
        titleMm: editingItem.titleMm?.trim() || "",
        content: editingItem.content.trim(),
        contentMm: editingItem.contentMm?.trim() || "",
        type: (editingItem.type as AnnouncementType) || "General Announcement",
        status: statusToSet,
        targetAudience: (editingItem.targetAudience as TargetAudienceType) || "all",
        imageUrl: editingItem.imageUrl?.trim() || undefined,
        publishDate: editingItem.publishDate || new Date().toISOString(),
        expirationDate: editingItem.expirationDate?.trim() || undefined,
        isPinned: editingItem.isPinned || false,
        viewsCount: editingItem.viewsCount || 0,
        ctaButtonLabel: editingItem.ctaButtonLabel?.trim() || undefined,
        ctaActionTab: editingItem.ctaActionTab?.trim() || undefined,
        authorDisplayName: "Code Learn Myanmar Team",
        authorAdminEmail: adminEmail,
        createdAt: editingItem.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveDetailedAnnouncementToDb(payload, adminEmail, adminName);
      await loadAnnouncements();
      setIsModalOpen(false);
      setEditingItem(null);
      showToast(
        publishImmediately
          ? "Announcement published and broadcasted to students!"
          : "Announcement draft saved successfully."
      );
    } catch (e) {
      console.error("Save error:", e);
      showToast("Error saving announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishAnnouncementInDb(id, adminEmail, adminName);
      await loadAnnouncements();
      showToast("Announcement published successfully.");
    } catch (e) {
      showToast("Failed to publish announcement.");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishAnnouncementInDb(id, adminEmail, adminName);
      await loadAnnouncements();
      showToast("Announcement moved to unpublished status.");
    } catch (e) {
      showToast("Failed to unpublish announcement.");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAnnouncementInDb(id, adminEmail, adminName);
      await loadAnnouncements();
      showToast("Announcement archived.");
    } catch (e) {
      showToast("Failed to archive announcement.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this announcement?")) {
      return;
    }
    try {
      await deleteDetailedAnnouncementFromDb(id, adminEmail, adminName);
      await loadAnnouncements();
      showToast("Announcement permanently deleted.");
    } catch (e) {
      showToast("Failed to delete announcement.");
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      await togglePinAnnouncementInDb(id, !currentPinned, adminEmail, adminName);
      await loadAnnouncements();
      showToast(!currentPinned ? "Pinned to top!" : "Unpinned from top.");
    } catch (e) {
      showToast("Failed to toggle pin.");
    }
  };

  // Helper for type badges
  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case "New Course":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><BookOpen className="w-3 h-3" /> New Course</span>;
      case "New Lesson":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800"><Sparkles className="w-3 h-3" /> New Lesson</span>;
      case "Premium Announcement":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Crown className="w-3 h-3" /> Premium</span>;
      case "Maintenance Notice":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"><Wrench className="w-3 h-3" /> Maintenance</span>;
      case "Event Announcement":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"><Calendar className="w-3 h-3" /> Event</span>;
      case "Important Update":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"><Info className="w-3 h-3" /> Important</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"><Megaphone className="w-3 h-3" /> General</span>;
    }
  };

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case "published":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"><CheckCircle2 className="w-3 h-3" /> Published</span>;
      case "scheduled":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"><Clock className="w-3 h-3" /> Scheduled</span>;
      case "unpublished":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"><AlertTriangle className="w-3 h-3" /> Unpublished</span>;
      case "archived":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"><Archive className="w-3 h-3" /> Archived</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"><FileText className="w-3 h-3" /> Draft</span>;
    }
  };

  return (
    <div id="announcement_management_module" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-blue-950 dark:via-indigo-950 dark:to-indigo-900 p-6 sm:p-8 rounded-2xl text-white shadow-sm border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide mb-3 border border-white/20">
              <Megaphone className="w-3.5 h-3.5" /> Official Communications Desk
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Announcement Management
            </h2>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl font-light">
              Broadcast course releases, maintenance schedules, and important platform updates to students with privacy and target-audience controls.
            </p>
          </div>
          <button
            id="btn_create_announcement"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-blue-50 font-semibold rounded-xl text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Announcement
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-blue-200 block">Total Announcements</span>
            <span className="text-xl font-bold">{announcements.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-blue-200 block">Currently Active</span>
            <span className="text-xl font-bold text-emerald-300">
              {announcements.filter((a) => a.status === "published").length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-blue-200 block">Scheduled Launches</span>
            <span className="text-xl font-bold text-amber-300">
              {announcements.filter((a) => a.status === "scheduled").length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-blue-200 block">Student Views</span>
            <span className="text-xl font-bold">
              {announcements.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              id="search_announcements_input"
              type="text"
              placeholder="Search announcements in English or မြန်မာဘာသာ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              id="filter_status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
              <option value="archived">Archived</option>
            </select>

            <select
              id="filter_type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="General Announcement">General</option>
              <option value="New Course">New Course</option>
              <option value="New Lesson">New Lesson</option>
              <option value="Premium Announcement">Premium Notice</option>
              <option value="Maintenance Notice">Maintenance</option>
              <option value="Event Announcement">Event</option>
              <option value="Important Update">Important Update</option>
            </select>

            <select
              id="filter_audience"
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Audiences</option>
              <option value="free_users">Free Tier Only</option>
              <option value="premium_users">Premium Students Only</option>
              <option value="course_enrolled">Enrolled Students Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List / Cards */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Clock className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-sm">Loading announcement registry...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Megaphone className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No Announcements Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search criteria or clear your active filters."
              : "Create your first broadcast announcement to reach all Code Learn Myanmar students."}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              id={`announcement_card_${item.id}`}
              className={`bg-white dark:bg-zinc-900 rounded-xl border p-5 transition-all hover:shadow-md ${
                item.isPinned
                  ? "border-amber-400/60 dark:border-amber-600/40 bg-amber-50/20 dark:bg-amber-950/10"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Left: Content and details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(item.type)}
                    {getStatusBadge(item.status)}
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        <Pin className="w-3 h-3 fill-current" /> Pinned
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Target: {item.targetAudience.replace("_", " ")}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(item.publishDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {item.title}
                    </h3>
                    {item.titleMm && (
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mt-0.5">
                        {item.titleMm}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                    {item.content}
                  </p>
                  {item.contentMm && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {item.contentMm}
                    </p>
                  )}

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.viewsCount || 0} student views
                    </span>
                    {item.ctaButtonLabel && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        CTA: "{item.ctaButtonLabel}" &rarr; {item.ctaActionTab || "Tab"}
                      </span>
                    )}
                    <span className="text-zinc-400 text-xs">
                      By: {item.authorDisplayName || "Official Admin"}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                  {item.status !== "published" ? (
                    <button
                      id={`btn_publish_${item.id}`}
                      onClick={() => handlePublish(item.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      title="Publish to students immediately"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish
                    </button>
                  ) : (
                    <button
                      id={`btn_unpublish_${item.id}`}
                      onClick={() => handleUnpublish(item.id)}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Take offline"
                    >
                      <X className="w-3.5 h-3.5" /> Unpublish
                    </button>
                  )}

                  <button
                    id={`btn_pin_${item.id}`}
                    onClick={() => handleTogglePin(item.id, !!item.isPinned)}
                    className={`p-2 rounded-lg text-xs border transition-colors ${
                      item.isPinned
                        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                    }`}
                    title={item.isPinned ? "Unpin announcement" : "Pin to top"}
                  >
                    {item.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    id={`btn_edit_${item.id}`}
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {item.status !== "archived" && (
                    <button
                      id={`btn_archive_${item.id}`}
                      onClick={() => handleArchive(item.id)}
                      className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-xs transition-colors"
                      title="Archive Announcement"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    id={`btn_delete_${item.id}`}
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Announcement Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                  {editingItem.id ? "Edit Announcement" : "Create New Announcement"}
                </h3>
              </div>

              {/* View switch (Edit vs Student Preview) */}
              <div className="flex items-center gap-2">
                <div className="bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg flex text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("edit")}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      previewMode === "edit"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Edit Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("preview")}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      previewMode === "preview"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Student Preview
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {previewMode === "preview" ? (
                /* Student View Simulation */
                <div className="space-y-4">
                  <div className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/80 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    ℹ️ This is how your announcement banner will appear in the student notifications bar and homepage feed:
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white p-6 rounded-2xl border border-indigo-500/30 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {getTypeBadge((editingItem.type as AnnouncementType) || "General Announcement")}
                      {editingItem.isPinned && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned Announcement
                        </span>
                      )}
                      <span className="text-xs text-indigo-300 ml-auto">
                        Official Code Learn Myanmar Notice
                      </span>
                    </div>

                    {editingItem.imageUrl && (
                      <img
                        src={editingItem.imageUrl}
                        alt="Announcement banner"
                        className="w-full h-44 object-cover rounded-xl mb-4 border border-white/10"
                      />
                    )}

                    <h2 className="text-xl font-bold text-white mb-1">
                      {editingItem.title || "Announcement Title"}
                    </h2>
                    {editingItem.titleMm && (
                      <h3 className="text-base font-semibold text-indigo-300 mb-3">
                        {editingItem.titleMm}
                      </h3>
                    )}

                    <p className="text-sm text-zinc-200 mb-2 whitespace-pre-wrap leading-relaxed">
                      {editingItem.content || "Description in English..."}
                    </p>
                    {editingItem.contentMm && (
                      <p className="text-sm text-indigo-100/90 whitespace-pre-wrap leading-relaxed">
                        {editingItem.contentMm}
                      </p>
                    )}

                    {editingItem.ctaButtonLabel && (
                      <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2"
                        >
                          {editingItem.ctaButtonLabel} &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Form Fields */
                <div className="space-y-4">
                  {/* Category & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Announcement Type *
                      </label>
                      <select
                        value={editingItem.type || "General Announcement"}
                        onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as AnnouncementType })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="General Announcement">General Announcement</option>
                        <option value="New Course">New Course</option>
                        <option value="New Lesson">New Lesson</option>
                        <option value="Premium Announcement">Premium Announcement</option>
                        <option value="Maintenance Notice">Maintenance Notice</option>
                        <option value="Event Announcement">Event Announcement</option>
                        <option value="Important Update">Important Update</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Target Audience *
                      </label>
                      <select
                        value={editingItem.targetAudience || "all"}
                        onChange={(e) => setEditingItem({ ...editingItem, targetAudience: e.target.value as TargetAudienceType })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="all">All Students (Public)</option>
                        <option value="free_users">Free Users (Upsell Target)</option>
                        <option value="premium_users">Premium Subscribers</option>
                        <option value="course_enrolled">Enrolled Students</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Publication Status
                      </label>
                      <select
                        value={editingItem.status || "draft"}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as AnnouncementStatus })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="draft">Draft (Private)</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="unpublished">Unpublished</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Title (EN & MM) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Title (English) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. New Course Launch: Python Web Development"
                        value={editingItem.title || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Title (မြန်မာဘာသာ)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. သင်တန်းအသစ် မိတ်ဆက်ခြင်း - Python Web Development"
                        value={editingItem.titleMm || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, titleMm: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  {/* Content (EN & MM) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Content (English) *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Detailed description and announcement message..."
                        value={editingItem.content || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Content (မြန်မာဘာသာ)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="ကျောင်းသား/သူများအတွက် အသေးစိတ် အသိပေးရှင်းလင်းချက်..."
                        value={editingItem.contentMm || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, contentMm: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  {/* Image URL & Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={editingItem.imageUrl || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Publish Date
                      </label>
                      <input
                        type="date"
                        value={editingItem.publishDate ? editingItem.publishDate.split("T")[0] : ""}
                        onChange={(e) => setEditingItem({ ...editingItem, publishDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Expiration Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={editingItem.expirationDate ? editingItem.expirationDate.split("T")[0] : ""}
                        onChange={(e) => setEditingItem({ ...editingItem, expirationDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  {/* CTA Button and Navigation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        CTA Button Label (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Enroll Now / View Course / Upgrade"
                        value={editingItem.ctaButtonLabel || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, ctaButtonLabel: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        CTA Action Tab Destination
                      </label>
                      <select
                        value={editingItem.ctaActionTab || "courses"}
                        onChange={(e) => setEditingItem({ ...editingItem, ctaActionTab: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="courses">Courses Catalog</option>
                        <option value="premium">Premium Membership</option>
                        <option value="community">Community Forum</option>
                        <option value="projects">Interactive Projects</option>
                        <option value="dashboard">Student Dashboard</option>
                      </select>
                    </div>
                  </div>

                  {/* Pin toggle */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingItem.isPinned}
                        onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        Pin this announcement at the very top of student dashboards
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> Publish & Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
