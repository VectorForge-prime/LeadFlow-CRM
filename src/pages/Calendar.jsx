import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../services/eventsService";

const emptyForm = {
  title: "",
  date: "",
  time: "",
  type: "Meeting",
  customer: "",
  location: "",
  notes: "",
};

const weekDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days = [];

  for (
    let index = 0;
    index < startOffset;
    index += 1
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    days.push(day);
  }

  return days;
}

function getTodayKey() {
  const today = new Date();

  return formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

function normalizeEvent(databaseEvent) {
  return {
    id: databaseEvent.id,
    title: databaseEvent.title,
    date: databaseEvent.event_date,
    time: databaseEvent.event_time
      ? databaseEvent.event_time.slice(0, 5)
      : "",
    type: databaseEvent.event_type,
    customer: databaseEvent.customer ?? "",
    location: databaseEvent.location ?? "",
    notes: databaseEvent.notes ?? "",
    createdAt: databaseEvent.created_at,
  };
}

function getEventClass(type) {
  return type
    .toLowerCase()
    .replaceAll(" ", "-");
}

function formatSelectedDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function Calendar() {
  const { user } = useAuth();

  const todayKey = getTodayKey();
  const todayDate = new Date();

  const [events, setEvents] = useState([]);

  const [currentDate, setCurrentDate] = useState(
    new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      1
    )
  );

  const [selectedDate, setSelectedDate] =
    useState(todayKey);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingEventId, setEditingEventId] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadEvents() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await getEvents(
        user.id
      );

      if (!isMounted) {
        return;
      }

      if (error) {
        setEvents([]);
        setErrorMessage(error.message);
      } else {
        setEvents(
          (data ?? []).map(normalizeEvent)
        );
      }

      setLoading(false);
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const calendarDays = useMemo(
    () =>
      getMonthDays(
        currentYear,
        currentMonth
      ),
    [currentYear, currentMonth]
  );

  const selectedEvents = useMemo(
    () =>
      events
        .filter(
          (calendarEvent) =>
            calendarEvent.date === selectedDate
        )
        .sort((firstEvent, secondEvent) =>
          (firstEvent.time || "").localeCompare(
            secondEvent.time || ""
          )
        ),
    [events, selectedDate]
  );

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(
        (calendarEvent) =>
          calendarEvent.date >= todayKey
      )
      .sort((firstEvent, secondEvent) => {
        const firstValue = `${
          firstEvent.date
        }T${firstEvent.time || "00:00"}`;

        const secondValue = `${
          secondEvent.date
        }T${secondEvent.time || "00:00"}`;

        return firstValue.localeCompare(
          secondValue
        );
      })
      .slice(0, 5);
  }, [events, todayKey]);

  const monthLabel =
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(currentDate);

  const meetingCount = events.filter(
    (calendarEvent) =>
      calendarEvent.type === "Meeting"
  ).length;

  function changeMonth(offset) {
    setCurrentDate(
      (previousDate) =>
        new Date(
          previousDate.getFullYear(),
          previousDate.getMonth() + offset,
          1
        )
    );
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function openAddEventModal() {
    setEditingEventId(null);

    setFormData({
      ...emptyForm,
      date: selectedDate,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditEventModal(calendarEvent) {
    setEditingEventId(calendarEvent.id);

    setFormData({
      title: calendarEvent.title,
      date: calendarEvent.date,
      time: calendarEvent.time,
      type: calendarEvent.type,
      customer: calendarEvent.customer,
      location: calendarEvent.location,
      notes: calendarEvent.notes,
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setEditingEventId(null);
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

    const eventPayload = {
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time,
      type: formData.type,
      customer: formData.customer.trim(),
      location: formData.location.trim(),
      notes: formData.notes.trim(),
    };

    if (editingEventId) {
      const { data, error } =
        await updateEvent(
          editingEventId,
          eventPayload
        );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      const updatedEvent =
        normalizeEvent(data);

      setEvents((currentEvents) =>
        currentEvents.map(
          (calendarEvent) =>
            calendarEvent.id ===
            editingEventId
              ? updatedEvent
              : calendarEvent
        )
      );

      setSelectedDate(updatedEvent.date);
    } else {
      const { data, error } =
        await createEvent(
          user.id,
          eventPayload
        );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      const newEvent = normalizeEvent(data);

      setEvents((currentEvents) => [
        ...currentEvents,
        newEvent,
      ]);

      setSelectedDate(newEvent.date);
    }

    const savedDate = new Date(
      `${eventPayload.date}T12:00:00`
    );

    setCurrentDate(
      new Date(
        savedDate.getFullYear(),
        savedDate.getMonth(),
        1
      )
    );

    setIsSaving(false);
    setEditingEventId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  }

  async function handleDelete(
    eventId,
    eventTitle
  ) {
    const shouldDelete = window.confirm(
      `Delete "${eventTitle}"?`
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await deleteEvent(
      eventId
    );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter(
        (calendarEvent) =>
          calendarEvent.id !== eventId
      )
    );
  }

  function goToToday() {
    const today = new Date();

    setCurrentDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(todayKey);
  }

  function openUpcomingEvent(
    calendarEvent
  ) {
    const eventDate = new Date(
      `${calendarEvent.date}T12:00:00`
    );

    setCurrentDate(
      new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        1
      )
    );

    setSelectedDate(calendarEvent.date);
  }

  return (
    <AppLayout>
      <section className="calendar-page">
        <div className="calendar-page-header">
          <div>
            <p className="page-eyebrow">
              Schedule management
            </p>

            <h1>Calendar</h1>

            <p>
              Manage meetings, customer calls
              and follow-up activities.
            </p>
          </div>

          <button
            className="primary-button calendar-add-button"
            type="button"
            onClick={openAddEventModal}
          >
            <Plus size={18} />
            Add event
          </button>
        </div>

        {errorMessage && !isModalOpen && (
          <div className="calendar-error-message">
            {errorMessage}
          </div>
        )}

        <section className="calendar-summary-grid">
          <article className="calendar-summary-card">
            <div className="calendar-summary-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>Total events</span>
              <strong>{events.length}</strong>
            </div>
          </article>

          <article className="calendar-summary-card">
            <div className="calendar-summary-icon purple">
              <User size={21} />
            </div>

            <div>
              <span>Customer meetings</span>
              <strong>{meetingCount}</strong>
            </div>
          </article>

          <article className="calendar-summary-card">
            <div className="calendar-summary-icon orange">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Selected day</span>
              <strong>
                {selectedEvents.length}
              </strong>
            </div>
          </article>
        </section>

        {loading ? (
          <div className="calendar-loading">
            <div className="route-loading-spinner" />

            <p>Loading calendar...</p>
          </div>
        ) : (
          <section className="calendar-main-grid">
            <article className="calendar-card">
              <div className="calendar-toolbar">
                <div>
                  <h2>{monthLabel}</h2>

                  <p>
                    Select a date to view
                    scheduled activities.
                  </p>
                </div>

                <div className="calendar-navigation">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() =>
                      changeMonth(-1)
                    }
                  >
                    <ChevronLeft size={19} />
                  </button>

                  <button
                    className="calendar-today-button"
                    type="button"
                    onClick={goToToday}
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() =>
                      changeMonth(1)
                    }
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
              </div>

              <div className="calendar-weekdays">
                {weekDays.map((weekDay) => (
                  <span key={weekDay}>
                    {weekDay}
                  </span>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map(
                  (day, index) => {
                    if (!day) {
                      return (
                        <div
                          className="calendar-day calendar-day-empty"
                          key={`empty-${index}`}
                        />
                      );
                    }

                    const dateKey =
                      formatDateKey(
                        currentYear,
                        currentMonth,
                        day
                      );

                    const dayEvents =
                      events.filter(
                        (calendarEvent) =>
                          calendarEvent.date ===
                          dateKey
                      );

                    const isSelected =
                      selectedDate === dateKey;

                    const isToday =
                      todayKey === dateKey;

                    return (
                      <button
                        className={`calendar-day ${
                          isSelected
                            ? "selected"
                            : ""
                        } ${
                          isToday
                            ? "today"
                            : ""
                        }`}
                        type="button"
                        key={dateKey}
                        onClick={() =>
                          setSelectedDate(
                            dateKey
                          )
                        }
                      >
                        <span className="calendar-day-number">
                          {day}
                        </span>

                        <div className="calendar-day-events">
                          {dayEvents
                            .slice(0, 2)
                            .map(
                              (
                                calendarEvent
                              ) => (
                                <span
                                  className={`calendar-event-dot ${getEventClass(
                                    calendarEvent.type
                                  )}`}
                                  key={
                                    calendarEvent.id
                                  }
                                >
                                  {calendarEvent.time ||
                                    "All day"}{" "}
                                  {
                                    calendarEvent.title
                                  }
                                </span>
                              )
                            )}

                          {dayEvents.length >
                            2 && (
                            <small>
                              +
                              {dayEvents.length -
                                2}{" "}
                              more
                            </small>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </article>

            <aside className="calendar-sidebar">
              <article className="calendar-side-card">
                <div className="calendar-side-card-header">
                  <div>
                    <h2>Selected date</h2>

                    <p>
                      {formatSelectedDate(
                        selectedDate
                      )}
                    </p>
                  </div>

                  <button
                    className="calendar-small-add"
                    type="button"
                    onClick={
                      openAddEventModal
                    }
                    aria-label="Add event"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="selected-events-list">
                  {selectedEvents.map(
                    (calendarEvent) => (
                      <article
                        className="selected-event-item"
                        key={calendarEvent.id}
                      >
                        <div
                          className={`selected-event-type ${getEventClass(
                            calendarEvent.type
                          )}`}
                        />

                        <div className="selected-event-content">
                          <div className="selected-event-title-row">
                            <h3>
                              {
                                calendarEvent.title
                              }
                            </h3>

                            <div className="calendar-event-actions">
                              <button
                                type="button"
                                aria-label={`Edit ${calendarEvent.title}`}
                                onClick={() =>
                                  openEditEventModal(
                                    calendarEvent
                                  )
                                }
                              >
                                <Edit3
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                aria-label={`Delete ${calendarEvent.title}`}
                                onClick={() =>
                                  handleDelete(
                                    calendarEvent.id,
                                    calendarEvent.title
                                  )
                                }
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>
                            </div>
                          </div>

                          <p>
                            <Clock3 size={13} />

                            {calendarEvent.time ||
                              "All day"}
                          </p>

                          <p>
                            <User size={13} />

                            {calendarEvent.customer ||
                              "No participant"}
                          </p>

                          <p>
                            <MapPin size={13} />

                            {calendarEvent.location ||
                              "No location"}
                          </p>

                          {calendarEvent.notes && (
                            <p className="calendar-event-notes">
                              {
                                calendarEvent.notes
                              }
                            </p>
                          )}
                        </div>
                      </article>
                    )
                  )}

                  {selectedEvents.length ===
                    0 && (
                    <div className="calendar-no-events">
                      <CalendarDays
                        size={30}
                      />

                      <h3>
                        No events scheduled
                      </h3>

                      <p>
                        Add a new activity
                        for this date.
                      </p>
                    </div>
                  )}
                </div>
              </article>

              <article className="calendar-side-card">
                <div className="calendar-side-card-header">
                  <div>
                    <h2>Upcoming events</h2>

                    <p>
                      Next scheduled activities
                    </p>
                  </div>
                </div>

                <div className="upcoming-events-list">
                  {upcomingEvents.map(
                    (calendarEvent) => (
                      <button
                        className="upcoming-event-item"
                        type="button"
                        key={calendarEvent.id}
                        onClick={() =>
                          openUpcomingEvent(
                            calendarEvent
                          )
                        }
                      >
                        <div className="upcoming-event-date">
                          <strong>
                            {new Date(
                              `${calendarEvent.date}T12:00:00`
                            ).getDate()}
                          </strong>

                          <span>
                            {new Intl.DateTimeFormat(
                              "en-US",
                              {
                                month:
                                  "short",
                              }
                            ).format(
                              new Date(
                                `${calendarEvent.date}T12:00:00`
                              )
                            )}
                          </span>
                        </div>

                        <div>
                          <strong>
                            {
                              calendarEvent.title
                            }
                          </strong>

                          <span>
                            {calendarEvent.time ||
                              "All day"}{" "}
                            ·{" "}
                            {calendarEvent.customer ||
                              calendarEvent.type}
                          </span>
                        </div>
                      </button>
                    )
                  )}

                  {upcomingEvents.length ===
                    0 && (
                    <div className="calendar-no-events">
                      <CalendarDays
                        size={30}
                      />

                      <h3>
                        No upcoming events
                      </h3>
                    </div>
                  )}
                </div>
              </article>
            </aside>
          </section>
        )}
      </section>

      {isModalOpen && (
        <div
          className="calendar-modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="calendar-modal-header">
              <div>
                <p className="page-eyebrow">
                  {editingEventId
                    ? "Update activity"
                    : "New activity"}
                </p>

                <h2 id="calendar-modal-title">
                  {editingEventId
                    ? "Edit event"
                    : "Add event"}
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
              <div className="calendar-modal-error">
                {errorMessage}
              </div>
            )}

            <form
              className="calendar-form"
              onSubmit={handleSubmit}
            >
              <label>
                Event title

                <input
                  required
                  name="title"
                  type="text"
                  placeholder="Example: Meeting with customer"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </label>

              <div className="calendar-form-grid">
                <label>
                  Date

                  <input
                    required
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={
                      handleInputChange
                    }
                  />
                </label>

                <label>
                  Time

                  <input
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={
                      handleInputChange
                    }
                  />
                </label>

                <label>
                  Activity type

                  <select
                    name="type"
                    value={formData.type}
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value="Meeting">
                      Meeting
                    </option>

                    <option value="Call">
                      Call
                    </option>

                    <option value="Follow-up">
                      Follow-up
                    </option>

                    <option value="Internal">
                      Internal
                    </option>
                  </select>
                </label>

                <label>
                  Customer or participant

                  <input
                    name="customer"
                    type="text"
                    placeholder="Customer name"
                    value={
                      formData.customer
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </label>
              </div>

              <label>
                Location

                <input
                  name="location"
                  type="text"
                  placeholder="Google Meet, phone, office..."
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Notes

                <textarea
                  name="notes"
                  rows="4"
                  placeholder="Add event details..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </label>

              <div className="calendar-form-actions">
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
                    : editingEventId
                      ? "Save changes"
                      : "Add event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Calendar;