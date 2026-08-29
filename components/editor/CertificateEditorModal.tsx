"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, RefreshCw } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import CertificateIcon from "@/components/icons/CertificateIcon";

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  credentialUrl?: string;
  images: string[];
}

interface CertificateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates?: CertificateItem[];
  setCertificates?: (certs: CertificateItem[]) => void;
}

export default function CertificateEditorModal({
  isOpen,
  onClose,
  certificates: externalCerts = [],
  setCertificates: externalSetCerts,
}: CertificateEditorModalProps) {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [localCerts, setLocalCerts] =
    useState<CertificateItem[]>(externalCerts);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && user?.id) {
      async function fetchCerts() {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("certificates")
            .eq("user_id", user?.id)
            .single();

          if (
            isMounted &&
            data?.certificates &&
            Array.isArray(data.certificates) &&
            !error
          ) {
            setLocalCerts(data.certificates);
            if (externalSetCerts) externalSetCerts(data.certificates);
          } else if (isMounted && externalCerts.length > 0) {
            setLocalCerts(externalCerts);
          }
        } catch (err) {
          console.error("Failed to load certificates:", err);
        }
      }
      fetchCerts();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddCert = () => {
    const newCert: CertificateItem = {
      id: Date.now().toString(),
      title: "Certificate Title",
      issuer: "Issuing Organization",
      issueDate: "2026",
      description:
        "Brief overview of achievements and accredited competencies...",
      credentialUrl: "",
      images: [],
    };
    setLocalCerts((prev) => [...prev, newCert]);
  };

  const handleCertChange = (
    id: string,
    field: keyof CertificateItem,
    value: any,
  ) => {
    setLocalCerts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const loadedImages: string[] = [];

    fileList.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 2MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          loadedImages.push(reader.result);
          if (loadedImages.length === fileList.length) {
            const cert = localCerts.find((c) => c.id === id);
            if (cert) {
              handleCertChange(id, "images", [...cert.images, ...loadedImages]);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (certId: string, imgIdx: number) => {
    const cert = localCerts.find((c) => c.id === certId);
    if (cert) {
      const updated = cert.images.filter((_, idx) => idx !== imgIdx);
      handleCertChange(certId, "images", updated);
    }
  };

  const handleRemoveCert = (id: string) => {
    setLocalCerts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    if (!user?.id) {
      alert("Please log in to save certificates.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          certificates: localCerts,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("Save error:", error.message);
        alert("Failed to save certificates.");
      } else {
        if (externalSetCerts) externalSetCerts(localCerts);
        window.dispatchEvent(new Event("certificates-updated"));
        onClose();
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-24 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-3xl space-y-6 shadow-2xl relative text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 pr-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CertificateIcon
              size={22}
              className="text-indigo-600 dark:text-indigo-400"
            />
            Edit Certificates & Badges
          </h2>
          <button
            onClick={handleAddCert}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
          >
            <Plus size={14} /> Add Certificate
          </button>
        </div>

        <div className="space-y-6">
          {localCerts.map((cert) => (
            <div
              key={cert.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveCert(cert.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    value={cert.title}
                    onChange={(e) =>
                      handleCertChange(cert.id, "title", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Issuer
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) =>
                      handleCertChange(cert.id, "issuer", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    value={cert.issueDate}
                    onChange={(e) =>
                      handleCertChange(cert.id, "issueDate", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Brief Description
                </label>
                <textarea
                  rows={2}
                  value={cert.description}
                  onChange={(e) =>
                    handleCertChange(cert.id, "description", e.target.value)
                  }
                  className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Credential Verification Link
                </label>
                <input
                  type="text"
                  value={cert.credentialUrl || ""}
                  onChange={(e) =>
                    handleCertChange(cert.id, "credentialUrl", e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full mt-1 p-2 border rounded-lg text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>

              {/* Certificate Image Uploads */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Certificate Images ({cert.images.length})
                </label>
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex flex-col items-center justify-center w-28 h-20 border-2 border-dashed rounded-xl text-xs bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition">
                    <Upload size={18} />
                    <span className="text-[10px] font-medium mt-1">
                      Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(cert.id, e)}
                      className="hidden"
                    />
                  </label>

                  {cert.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group shadow-sm"
                    >
                      <img
                        src={img}
                        alt="Certificate"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(cert.id, idx)}
                          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {localCerts.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-6">
              No certificates listed yet. Click &quot;Add Certificate&quot; to
              showcase credentials.
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition mt-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Certificates Showcase"}
        </button>
      </div>
    </div>
  );
}
