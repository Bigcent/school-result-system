"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [schoolId, setSchoolId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentCounts, setStudentCounts] = useState({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: user } = await supabase
        .from("users")
        .select("school_id, role")
        .eq("id", session.user.id)
        .single();

      if (!user || user.role !== "admin") { router.push("/dashboard"); return; }
      setSchoolId(user.school_id);
      await loadClasses(user.school_id);
      setLoading(false);
    };
    init();
  }, []);

  const loadClasses = async (sId) => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("school_id", sId)
      .order("sort_order");
    setClasses(data || []);

    const counts = {};
    for (const cls of (data || [])) {
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("class_id", cls.id)
        .eq("is_active", true);
      counts[cls.id] = count || 0;
    }
    setStudentCounts(counts);
  };

  const addClass = async () => {
    if (!newClassName.trim()) return;

    const { error } = await supabase.from("classes").insert({
      school_id: schoolId,
      name: newClassName.trim(),
      sort_order: classes.length + 1,
    });

    if (error) {
      alert("Error adding class.");
    } else {
      setNewClassName("");
      await loadClasses(schoolId);
    }
  };

  const updateClass = async (id) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("classes")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      alert("Error updating class.");
    } else {
      setEditingId(null);
      setEditName("");
      await loadClasses(schoolId);
    }
  };

  const deleteClass = async (id, name) => {
    const count = studentCounts[id] || 0;
    const msg = count > 0
      ? `"${name}" has ${count} students. Deleting will remove all students and their scores. Are you sure?`
      : `Delete "${name}"? This cannot be undone.`;

    if (!confirm(msg)) return;

    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) {
      alert("Error deleting class.");
    } else {
      await loadClasses(schoolId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      <div className="bg-gradient-to-br from-forest-800 to-forest-700 text-white px-5 pt-4 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Classes</h1>
            <p className="text-xs text-white/60">{classes.length} classes</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Add new class */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Add New Class</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addClass()}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none focus:border-forest-700 transition-colors"
              placeholder="e.g. Primary 1"
            />
            <button
              onClick={addClass}
              className="px-5 py-2.5 bg-forest-800 text-white rounded-xl text-sm font-bold hover:bg-forest-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Class list */}
        <div className="space-y-2">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl shadow-sm p-4">
              {editingId === cls.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && updateClass(cls.id)}
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-forest-700 bg-sand-50 text-sm font-medium focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => updateClass(cls.id)}
                    className="px-3 py-2 bg-forest-800 text-white rounded-lg text-xs font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditName(""); }}
                    className="px-3 py-2 bg-sand-200 text-gray-600 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center text-forest-800 font-bold text-sm">
                      {cls.name.replace("Primary ", "P")}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{cls.name}</div>
                      <div className="text-xs text-gray-400">{studentCounts[cls.id] || 0} students</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(cls.id); setEditName(cls.name); }}
                      className="px-3 py-1.5 bg-sand-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-sand-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteClass(cls.id, cls.name)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {classes.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No classes yet. Add your first class above.
          </div>
        )}
      </div>
    </div>
  );
}