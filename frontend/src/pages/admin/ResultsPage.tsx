import React, { useMemo, useState } from "react";
import { useData } from "../../contexts/DataContext";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

// get a string id from string | {_id: string} | undefined
const getId = (v: any): string | undefined =>
  typeof v === "string" ? v : v && typeof v === "object" ? v._id : undefined;

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
};

const ResultsPage: React.FC = () => {
  const {
    results,
    registrations,
    students,
    courses,
    addResult,
    updateResult,
    deleteResult,
    loading,
  } = useData();

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<{
    studentId: string;
    courseId: string;
    grade: string;
    semester: string;
    academicYear: string;
    comments: string;
  }>({
    studentId: "",
    courseId: "",
    grade: "A",
    semester: "Fall 2024",
    academicYear: "2024-2025",
    comments: "",
  });

  // Edit modal
  const [editRow, setEditRow] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    grade: string;
    semester?: string;
    academicYear?: string;
    comments?: string;
  }>({ grade: "A" });

  // Delete confirm
  const [deleteRow, setDeleteRow] = useState<any | null>(null);

  const [search, setSearch] = useState("");

  // Maps for quick joins (keys are string _id)
  const sMap = useMemo(
    () => new Map(students.map((s) => [s._id, s] as const)),
    [students]
  );
  const cMap = useMemo(
    () => new Map(courses.map((c) => [c._id, c] as const)),
    [courses]
  );

  // Normalize results to ensure studentId/courseId are strings
  const normalizedResults = useMemo(
    () =>
      results.map((r: any) => ({
        ...r,
        studentId: getId(r.studentId),
        courseId: getId(r.courseId),
      })),
    [results]
  );

  // Table rows joined with details
  const rows = useMemo(() => {
    return normalizedResults.map((r: any) => {
      const s = r.studentId ? sMap.get(r.studentId) : undefined;
      const c = r.courseId ? cMap.get(r.courseId) : undefined;
      return {
        ...r,
        studentName: s?.name ?? "Unknown",
        studentIdDisplay: s?.studentId ?? "Unknown",
        courseCode: c?.code ?? "Unknown",
        courseTitle: c?.title ?? "Unknown",
      };
    });
  }, [normalizedResults, sMap, cMap]);

  // Search filter: student, id, course, grade
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.studentName || "").toLowerCase().includes(q) ||
        (r.studentIdDisplay || "").toLowerCase().includes(q) ||
        (r.courseCode || "").toLowerCase().includes(q) ||
        (r.courseTitle || "").toLowerCase().includes(q) ||
        String(r.grade || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  // Build set of registered course ids for selected student (normalize reg ids)
  const registeredCourseIdsForStudent = useMemo(() => {
    const set = new Set<string>();
    if (!createForm.studentId) return set;
    registrations.forEach((reg: any) => {
      const sid = getId(reg.studentId);
      const cid = getId(reg.courseId);
      if (sid === createForm.studentId && cid) set.add(cid);
    });
    return set;
  }, [registrations, createForm.studentId]);

  const availableStudents = students;
  const availableCourses =
    createForm.studentId && registeredCourseIdsForStudent.size
      ? courses.filter((c) => registeredCourseIdsForStudent.has(c._id))
      : [];

  // Create
  const onCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.studentId || !createForm.courseId || !createForm.grade) return;

    if (!registeredCourseIdsForStudent.has(createForm.courseId)) {
      alert("This student is not registered for the selected course.");
      return;
    }

    setCreating(true);
    try {
      await addResult({
        studentId: createForm.studentId,
        courseId: createForm.courseId,
        grade: createForm.grade,
        semester: createForm.semester,
        academicYear: createForm.academicYear,
        comments: createForm.comments?.trim() || undefined,
      } as any);
      setIsCreateOpen(false);
      setCreateForm({
        studentId: "",
        courseId: "",
        grade: "A",
        semester: "Fall 2024",
        academicYear: "2024-2025",
        comments: "",
      });
    } catch (err: any) {
      alert("Error: " + (err?.message ?? "Failed to add result"));
    } finally {
      setCreating(false);
    }
  };

  // Edit
  const openEdit = (row: any) => {
    setEditRow(row);
    setEditForm({
      grade: row.grade,
      semester: row.semester ?? "",
      academicYear: row.academicYear ?? "",
      comments: row.comments ?? "",
    });
  };

  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRow?._id) return;

    setEditing(true);
    try {
      await updateResult(editRow._id, {
        grade: editForm.grade,
        semester: editForm.semester?.trim() || undefined,
        academicYear: editForm.academicYear?.trim() || undefined,
        comments: editForm.comments?.trim() || undefined,
      });
      setEditRow(null);
    } catch (err: any) {
      alert("Error: " + (err?.message ?? "Failed to update result"));
    } finally {
      setEditing(false);
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteRow?._id) return;
    try {
      await deleteResult(deleteRow._id);
      setDeleteRow(null);
    } catch (err: any) {
      alert("Error: " + (err?.message ?? "Failed to delete result"));
    }
  };

  const columns = [
    { key: "studentName", label: "Student Name" },
    { key: "studentIdDisplay", label: "Student ID" },
    { key: "courseCode", label: "Course Code" },
    { key: "courseTitle", label: "Course Title" },
    { key: "grade", label: "Grade" },
    {
      key: "gradePoints",
      label: "Grade Points",
      render: (v: any) => (v === undefined || v === null ? "—" : v),
    },
    {
      key: "assignedAt",
      label: "Assigned Date",
      render: (date: string) => formatDate(date),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={`Edit result for ${row.studentName} - ${row.courseCode}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteRow(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete result for ${row.studentName} - ${row.courseCode}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Result Management</h1>
          <p className="text-gray-600 mt-2">Assign, update, and manage student grades</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by student, ID, course, or grade..."
        onSearch={setSearch}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Result
          </button>
        }
      />

      {/* Create Result Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Assign Result"
      >
        <form onSubmit={onCreateSubmit} className="space-y-4">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select
              value={createForm.studentId}
              onChange={(e) =>
                setCreateForm((f) => ({
                  ...f,
                  studentId: e.target.value,
                  courseId: "", // reset course when student changes
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              <option value="">Choose a student...</option>
              {availableStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} — {s.name}
                </option>
              ))}
            </select>
            {!createForm.studentId && (
              <p className="text-xs text-gray-500 mt-1">
                Pick a student to see their registered courses.
              </p>
            )}
          </div>

          {/* Course (limited to student's registrations) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={createForm.courseId}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, courseId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-60"
              required
              disabled={!createForm.studentId}
            >
              <option value="">Choose a course...</option>
              {availableCourses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              value={createForm.grade}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, grade: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sem / Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <input
                type="text"
                value={createForm.semester}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, semester: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., Fall 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={createForm.academicYear}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, academicYear: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (optional)
            </label>
            <textarea
              value={createForm.comments}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, comments: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Notes or remarks..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={
                creating ||
                !createForm.studentId ||
                !createForm.courseId ||
                !createForm.grade
              }
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {creating ? "Saving..." : "Add Result"}
            </button>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Result Modal */}
      <Modal
        isOpen={!!editRow}
        onClose={() => setEditRow(null)}
        title="Edit Result"
      >
        <form onSubmit={onEditSubmit} className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
            <div>
              <span className="font-medium">Student:</span>{" "}
              {editRow?.studentIdDisplay} — {editRow?.studentName}
            </div>
            <div>
              <span className="font-medium">Course:</span>{" "}
              {editRow?.courseCode} — {editRow?.courseTitle}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              value={editForm.grade}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, grade: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <input
                type="text"
                value={editForm.semester ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, semester: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., Fall 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={editForm.academicYear ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, academicYear: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (optional)
            </label>
            <textarea
              value={editForm.comments ?? ""}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, comments: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus-border-transparent"
              placeholder="Notes or remarks..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={editing || !editForm.grade}
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {editing ? "Updating..." : "Update Result"}
            </button>
            <button
              type="button"
              onClick={() => setEditRow(null)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title="Delete Result"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the result for{" "}
            <strong>{deleteRow?.studentName}</strong> in{" "}
            <strong>{deleteRow?.courseCode}</strong> —{" "}
            <strong>{deleteRow?.courseTitle}</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              onClick={() => setDeleteRow(null)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResultsPage;
