import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  Filter,
  Flag,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskCompletion,
} from "../services/tasksService";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  dueDate: "",
  assignedTo: "",
};

function formatDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function Tasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [editingTaskId, setEditingTaskId] =
    useState(null);
  const [formData, setFormData] =
    useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] =
    useState(false);
  const [updatingTaskId, setUpdatingTaskId] =
    useState(null);
  const [errorMessage, setErrorMessage] =
    useState("");

  const defaultOwner =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadTasks() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await getTasks(user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        setTasks([]);
        setErrorMessage(error.message);
      } else {
        setTasks(data ?? []);
      }

      setLoading(false);
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";
      const description =
        task.description?.toLowerCase() || "";
      const assignedTo =
        task.assigned_to?.toLowerCase() || "";

      const matchesSearch =
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        assignedTo.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function openAddModal() {
    setEditingTaskId(null);

    setFormData({
      ...emptyForm,
      assignedTo: defaultOwner,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTaskId(task.id);

    setFormData({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date ?? "",
      assignedTo:
        task.assigned_to ?? defaultOwner,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setEditingTaskId(null);
    setFormData(emptyForm);
    setErrorMessage("");
    setIsModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      setErrorMessage(
        "The authenticated user is missing."
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const taskPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      assignedTo:
        formData.assignedTo.trim() || defaultOwner,
    };

    if (editingTaskId) {
      const { data, error } = await updateTask(
        editingTaskId,
        taskPayload
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId ? data : task
        )
      );
    } else {
      const { data, error } = await createTask(
        user.id,
        taskPayload
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      setTasks((currentTasks) => [
        data,
        ...currentTasks,
      ]);
    }

    setIsSaving(false);
    setEditingTaskId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  }

  async function handleToggleTask(task) {
    const newCompletedValue = !task.completed;

    setUpdatingTaskId(task.id);
    setErrorMessage("");

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              completed: newCompletedValue,
              status: newCompletedValue
                ? "Completed"
                : "To Do",
            }
          : currentTask
      )
    );

    const { data, error } =
      await updateTaskCompletion(
        task.id,
        newCompletedValue
      );

    if (error) {
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? task
            : currentTask
        )
      );

      setErrorMessage(error.message);
      setUpdatingTaskId(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? data
          : currentTask
      )
    );

    setUpdatingTaskId(null);
  }

  async function handleDelete(
    taskId,
    taskTitle
  ) {
    const shouldDelete = window.confirm(
      `Delete "${taskTitle}"?`
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await deleteTask(taskId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== taskId
      )
    );
  }

  return (
    <AppLayout>
      <section className="tasks-page">
        <div className="tasks-header">
          <div>
            <p className="page-eyebrow">
              Activity management
            </p>

            <h1>Tasks</h1>

            <p>
              Organize follow-ups, meetings and important
              customer actions.
            </p>
          </div>

          <button
            className="primary-button tasks-add-button"
            type="button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add task
          </button>
        </div>

        {errorMessage && !isModalOpen && (
          <div className="tasks-error-message">
            {errorMessage}
          </div>
        )}

        <section className="tasks-summary-grid">
          <article className="tasks-summary-card">
            <div className="tasks-summary-icon">
              <Circle size={21} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
            </div>
          </article>

          <article className="tasks-summary-card">
            <div className="tasks-summary-icon orange">
              <Clock3 size={21} />
            </div>

            <div>
              <span>In progress</span>
              <strong>{inProgressTasks}</strong>
            </div>
          </article>

          <article className="tasks-summary-card">
            <div className="tasks-summary-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>
          </article>

          <article className="tasks-summary-card">
            <div className="tasks-summary-icon purple">
              <Flag size={21} />
            </div>

            <div>
              <span>Total tasks</span>
              <strong>{tasks.length}</strong>
            </div>
          </article>
        </section>

        <article className="tasks-card">
          <div className="tasks-toolbar">
            <div className="tasks-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search tasks or assigned users..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="tasks-filter">
              <Filter size={16} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">
                  All statuses
                </option>
                <option value="To Do">To Do</option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="tasks-loading">
              <div className="route-loading-spinner" />
              <p>Loading tasks...</p>
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <article
                  className={`task-item ${
                    task.completed ? "completed" : ""
                  } ${
                    updatingTaskId === task.id
                      ? "updating"
                      : ""
                  }`}
                  key={task.id}
                >
                  <button
                    className="task-check-button"
                    type="button"
                    disabled={
                      updatingTaskId === task.id
                    }
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} as incomplete`
                        : `Mark ${task.title} as completed`
                    }
                    onClick={() =>
                      handleToggleTask(task)
                    }
                  >
                    {task.completed ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  <div className="task-main">
                    <div className="task-title-row">
                      <div>
                        <h2>{task.title}</h2>

                        <p>
                          {task.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <span
                        className={`task-priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="task-meta">
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(task.due_date)}
                      </span>

                      <span>
                        <User size={14} />
                        {task.assigned_to ||
                          "Unassigned"}
                      </span>

                      <span
                        className={`task-status ${getStatusClass(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {updatingTaskId === task.id && (
                      <div className="task-saving-status">
                        Saving task status...
                      </div>
                    )}
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      aria-label={`Edit ${task.title}`}
                      onClick={() =>
                        openEditModal(task)
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() =>
                        handleDelete(
                          task.id,
                          task.title
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}

              {filteredTasks.length === 0 && (
                <div className="tasks-empty">
                  <Check size={36} />

                  <h3>No tasks found</h3>

                  <p>
                    Add your first task or change the
                    filters.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="tasks-footer">
            Showing {filteredTasks.length} of{" "}
            {tasks.length} tasks
          </div>
        </article>
      </section>

      {isModalOpen && (
        <div
          className="task-modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="task-modal-header">
              <div>
                <p className="page-eyebrow">
                  {editingTaskId
                    ? "Update activity"
                    : "New activity"}
                </p>

                <h2 id="task-modal-title">
                  {editingTaskId
                    ? "Edit task"
                    : "Add task"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                type="button"
                aria-label="Close"
                disabled={isSaving}
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="task-modal-error">
                {errorMessage}
              </div>
            )}

            <form
              className="task-form"
              onSubmit={handleSubmit}
            >
              <label>
                Task title

                <input
                  required
                  name="title"
                  type="text"
                  placeholder="Example: Follow up with customer"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Description

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Add important details..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </label>

              <div className="task-form-grid">
                <label>
                  Priority

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="High">
                      High
                    </option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="Low">Low</option>
                  </select>
                </label>

                <label>
                  Status

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="To Do">
                      To Do
                    </option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </label>

                <label>
                  Due date

                  <input
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Assigned to

                  <input
                    name="assignedTo"
                    type="text"
                    placeholder={defaultOwner}
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="task-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={isSaving}
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingTaskId
                      ? "Save changes"
                      : "Add task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Tasks;