"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function StudentsPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [loading, setLoading] = useState(true);

  // New student form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", gender: "M", admission_number: "", fees_paid: false });

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

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

      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", user.school_id)
        .order("sort_order");
      setClasses(classData || []);

      setLoading(false);
    };
    init();
  }, []);

  const loadStudents = async (classId) => {
    setSelectedClassId(classId);
    setShowForm(false);
    setEditingId(null);
    if (!classId) { setStudents([]); return; }

    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .eq("is_active", true)
      .order("last_name");
    setStudents(data || []);
  };

  const addStudent = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      alert("First name and last name are required.");
      return;
    }

    const { error } = await supabase.from("students").insert({
      school_id: schoolId,
      class_id: selectedClassId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      gender: form.gender,
      admission_number: form.admission_number.trim() || null,
      fees_paid: form.fees_paid,
    });

    if (error) {
      alert("Error adding student.");
    } else {
      setForm({ first_name: "", last_name: "", gender: "M", admission_number: "", fees_paid: false });
      setShowForm(false);
      await loadStudents(selectedClassId);
    }
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditForm({
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      admission_number: student.admission_number || "",
      fees_paid: student.fees_paid,
    });
  };

  const saveEdit = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      alert("First name and last name are required.");
      return;
    }

    const { error } = await supabase
      .from("students")
      .update({
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        gender: editForm.gender,
        admission_number: editForm.admission_number.trim() || null,
        fees_paid: editForm.fees_paid,
      })
      .eq("id", editingId);

    if (error) {
      alert("Error updating student.");
    } else {
      setEditingId(null);
      await loadStudents(selectedClassId);
    }
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(`Remove "${name}"? Their scores will also be deleted.`)) return;

    const { error } = await supabase
      .from("students")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      alert("Error removing student.");
    } else {
      await loadStudents(selectedClassId);
    }
  };

  const toggleFees = async (id, currentStatus) => {
    await supabase.from("students").update({ fees_paid: !currentStatus }).eq("id", id);
    await loadStudents(selectedClassId);
  };

  const renderStudentForm = (formData, setFormData, onSave, onCancel) => (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">First Name</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none focus:border-forest-700"
            placeholder="Adaeze"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Last Name</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none focus:border-forest-700"
            placeholder="Okonkwo"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none focus:border-forest-700"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Admission No.</label>
          <input
            type="text"
            value={formData.admission_number}
            onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none focus:border-forest-700"
            placeholder="BFA/001"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFormData({ ...formData, fees_paid: !formData.fees_paid })}
          className={`w-10 h-6 rounded-full transition-colors ${formData.fees_paid ? "bg-forest-500" : "bg-sand-300"}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.fees_paid ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <span className="text-xs font-semibold text-gray-600">Fees Paid</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 py-2.5 bg-forest-800 text-white rounded-xl text-sm font-bold hover:bg-forest-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-sand-200 text-gray-600 rounded-xl text-sm font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  );

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
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Students</h1>
            <p className="text-xs text-white/60">Register & manage students</p>
          </div>
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => loadStudents(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none"
        >
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id} className="text-gray-800">{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && (
        <div className="px-4 py-5">
          {/* Add student button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 py-3 bg-forest-800 text-white rounded-2xl font-bold text-sm hover:bg-forest-700 transition-colors"
            >
              + Add Student
            </button>
          )}

          {/* New student form */}
          {showForm && renderStudentForm(
            form,
            setForm,
            addStudent,
            () => setShowForm(false)
          )}

          {/* Student count */}
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            Students ({students.length})
          </div>

          {/* Student list */}
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id}>
                {editingId === student.id ? (
                  renderStudentForm(
                    editForm,
                    setEditForm,
                    saveEdit,
                    () => setEditingId(null)
                  )
                ) : (
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                          student.fees_paid ? "bg-forest-100 text-forest-800" : "bg-red-100 text-red-700"
                        }`}>
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            {student.last_name} {student.first_name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400">{student.gender === "M" ? "Male" : "Female"}</span>
                            {student.admission_number && (
                              <span className="text-[10px] text-gray-400">• {student.admission_number}</span>
                            )}
                            <button
                              onClick={() => toggleFees(student.id, student.fees_paid)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                student.fees_paid ? "bg-forest-100 text-forest-800" : "bg-red-100 text-red-600"
                              }`}
                            >
                              {student.fees_paid ? "PAID" : "OWES"} ↻
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(student)}
                          className="px-2.5 py-1.5 bg-sand-100 text-gray-600 rounded-lg text-[10px] font-semibold hover:bg-sand-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStudent(student.id, `${student.first_name} ${student.last_name}`)}
                          className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-semibold hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {students.length === 0 && !showForm && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No students in this class. Click "Add Student" above.
            </div>
          )}
        </div>
      )}

      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          Select a class to manage students.
        </div>
      )}
    </div>
  );
}