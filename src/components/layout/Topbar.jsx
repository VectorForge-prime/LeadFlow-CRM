import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  Clock3,
  Menu,
  Search,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getCustomers } from "../../services/customersService";
import { getEvents } from "../../services/eventsService";
import { getLeads } from "../../services/leadsService";
import { getTasks } from "../../services/tasksService";

const pageTitles = {
  "/": "Dashboard",
  "/customers": "Customers",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

function getInitials(name, email) {
  const source =
    name?.trim() ||
    email?.trim() ||
    "User";

  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getTodayKey() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(
      2,
      "0"
    ),
    String(today.getDate()).padStart(
      2,
      "0"
    ),
  ].join("-");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(
    value.includes("T")
      ? value
      : `${value}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function Topbar({ onOpenMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();

  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);
  const notificationsWrapperRef =
    useRef(null);
  const profileWrapperRef = useRef(null);

  const [searchValue, setSearchValue] =
    useState("");

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [loadingWorkspace, setLoadingWorkspace] =
    useState(false);

  const [workspaceError, setWorkspaceError] =
    useState("");

  const [workspaceData, setWorkspaceData] =
    useState({
      customers: [],
      leads: [],
      tasks: [],
      events: [],
    });

  const [
    readNotificationIds,
    setReadNotificationIds,
  ] = useState([]);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "LeadFlow User";

  const company =
    user?.user_metadata?.company ||
    "VectorForge Prime";

  const title =
    pageTitles[location.pathname] ||
    "LeadFlow CRM";

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  const notificationStorageKey =
    user?.id
      ? `leadflow-read-notifications-${user.id}`
      : "";

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let isMounted = true;

    async function loadWorkspaceData() {
      setLoadingWorkspace(true);
      setWorkspaceError("");

      const [
        customersResponse,
        leadsResponse,
        tasksResponse,
        eventsResponse,
      ] = await Promise.all([
        getCustomers(user.id),
        getLeads(user.id),
        getTasks(user.id),
        getEvents(user.id),
      ]);

      if (!isMounted) {
        return;
      }

      const firstError =
        customersResponse.error ||
        leadsResponse.error ||
        tasksResponse.error ||
        eventsResponse.error;

      if (firstError) {
        setWorkspaceError(
          firstError.message ||
            "Could not load workspace data."
        );
      }

      setWorkspaceData({
        customers:
          customersResponse.data || [],

        leads:
          leadsResponse.data || [],

        tasks:
          tasksResponse.data || [],

        events:
          eventsResponse.data || [],
      });

      setLoadingWorkspace(false);
    }

    loadWorkspaceData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, location.pathname]);

  useEffect(() => {
    if (!notificationStorageKey) {
      return;
    }

    try {
      const storedValue =
        window.localStorage.getItem(
          notificationStorageKey
        );

      setReadNotificationIds(
        storedValue
          ? JSON.parse(storedValue)
          : []
      );
    } catch {
      setReadNotificationIds([]);
    }
  }, [notificationStorageKey]);

  useEffect(() => {
    function handleKeyboardShortcut(event) {
      const commandPressed =
        event.ctrlKey || event.metaKey;

      if (
        !commandPressed ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      event.preventDefault();

      setProfileOpen(false);
      setNotificationsOpen(false);
      setSearchOpen(true);

      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }

    window.addEventListener(
      "keydown",
      handleKeyboardShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(
          event.target
        )
      ) {
        setSearchOpen(false);
      }

      if (
        notificationsWrapperRef.current &&
        !notificationsWrapperRef.current.contains(
          event.target
        )
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileWrapperRef.current &&
        !profileWrapperRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const searchTerm =
      normalizeText(searchValue);

    if (!searchTerm) {
      return [];
    }

    const customers =
      workspaceData.customers
        .filter((customer) =>
          [
            customer.name,
            customer.company,
            customer.email,
            customer.phone,
            customer.status,
          ].some((value) =>
            normalizeText(value).includes(
              searchTerm
            )
          )
        )
        .slice(0, 4)
        .map((customer) => ({
          id: `customer-${customer.id}`,
          type: "Customer",
          title:
            customer.name ||
            customer.company ||
            "Customer",

          subtitle:
            customer.company ||
            customer.email ||
            "Customer record",

          path: "/customers",
          icon: UsersRound,
        }));

    const leads =
      workspaceData.leads
        .filter((lead) =>
          [
            lead.name,
            lead.company,
            lead.email,
            lead.phone,
            lead.deal_title,
            lead.job_title,
            lead.source,
            lead.status,
            lead.priority,
            lead.assigned_to,
            lead.city,
            lead.country,
            lead.notes,
          ].some((value) =>
            normalizeText(value).includes(
              searchTerm
            )
          )
        )
        .slice(0, 4)
        .map((lead) => ({
          id: `lead-${lead.id}`,
          type: "Lead",
          title:
            lead.name ||
            lead.deal_title ||
            "Lead",

          subtitle:
            lead.company ||
            lead.email ||
            lead.status ||
            "Sales opportunity",

          path: "/leads",
          icon: Target,
        }));

    const tasks =
      workspaceData.tasks
        .filter((task) =>
          [
            task.title,
            task.description,
            task.priority,
            task.status,
            task.assigned_to,
          ].some((value) =>
            normalizeText(value).includes(
              searchTerm
            )
          )
        )
        .slice(0, 4)
        .map((task) => ({
          id: `task-${task.id}`,
          type: "Task",
          title:
            task.title || "Task",

          subtitle:
            task.status ||
            task.assigned_to ||
            task.description ||
            "CRM task",

          path: "/tasks",
          icon: CheckCheck,
        }));

    const events =
      workspaceData.events
        .filter((calendarEvent) =>
          [
            calendarEvent.title,
            calendarEvent.event_type,
            calendarEvent.customer,
            calendarEvent.location,
            calendarEvent.notes,
          ].some((value) =>
            normalizeText(value).includes(
              searchTerm
            )
          )
        )
        .slice(0, 4)
        .map((calendarEvent) => ({
          id: `event-${calendarEvent.id}`,
          type: "Event",
          title:
            calendarEvent.title ||
            "Calendar event",

          subtitle: [
            formatDate(
              calendarEvent.event_date
            ),

            calendarEvent.event_time
              ? calendarEvent.event_time.slice(
                  0,
                  5
                )
              : "All day",
          ]
            .filter(Boolean)
            .join(" · "),

          path: "/calendar",
          icon: CalendarDays,
        }));

    return [
      ...customers,
      ...leads,
      ...tasks,
      ...events,
    ].slice(0, 12);
  }, [searchValue, workspaceData]);

  const notifications = useMemo(() => {
    const todayKey = getTodayKey();

    const overdueTasks =
      workspaceData.tasks
        .filter((task) => {
          return (
            task.due_date &&
            task.due_date < todayKey &&
            !task.completed &&
            task.status !== "Completed"
          );
        })
        .map((task) => ({
          id: `overdue-task-${task.id}`,
          type: "warning",
          title: "Overdue task",
          description:
            task.title ||
            "A task is overdue.",

          meta:
            formatDate(task.due_date),

          path: "/tasks",
          icon: CircleAlert,
        }));

    const todayTasks =
      workspaceData.tasks
        .filter((task) => {
          return (
            task.due_date === todayKey &&
            !task.completed &&
            task.status !== "Completed"
          );
        })
        .map((task) => ({
          id: `today-task-${task.id}`,
          type: "task",
          title: "Task due today",
          description:
            task.title ||
            "A task is due today.",

          meta:
            task.priority ||
            "Today",

          path: "/tasks",
          icon: CheckCheck,
        }));

    const todayEvents =
      workspaceData.events
        .filter(
          (calendarEvent) =>
            calendarEvent.event_date ===
            todayKey
        )
        .map((calendarEvent) => ({
          id: `today-event-${calendarEvent.id}`,
          type: "event",
          title: "Event scheduled today",
          description:
            calendarEvent.title ||
            "You have an event today.",

          meta:
            calendarEvent.event_time
              ? calendarEvent.event_time.slice(
                  0,
                  5
                )
              : "All day",

          path: "/calendar",
          icon: CalendarDays,
        }));

    const newLeads =
      workspaceData.leads
        .filter((lead) => {
          if (!lead.created_at) {
            return false;
          }

          const createdTime = new Date(
            lead.created_at
          ).getTime();

          const last24Hours =
            Date.now() -
            24 * 60 * 60 * 1000;

          return createdTime >= last24Hours;
        })
        .map((lead) => ({
          id: `new-lead-${lead.id}`,
          type: "lead",
          title: "New lead added",
          description:
            lead.name ||
            lead.deal_title ||
            "A new lead was added.",

          meta:
            lead.company ||
            lead.source ||
            "New opportunity",

          path: "/leads",
          icon: Target,
        }));

    return [
      ...overdueTasks,
      ...todayTasks,
      ...todayEvents,
      ...newLeads,
    ].slice(0, 20);
  }, [workspaceData]);

  const unreadCount = notifications.filter(
    (notification) =>
      !readNotificationIds.includes(
        notification.id
      )
  ).length;

  function saveReadNotifications(ids) {
    setReadNotificationIds(ids);

    if (notificationStorageKey) {
      window.localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(ids)
      );
    }
  }

  function markNotificationAsRead(
    notificationId
  ) {
    if (
      readNotificationIds.includes(
        notificationId
      )
    ) {
      return;
    }

    saveReadNotifications([
      ...readNotificationIds,
      notificationId,
    ]);
  }

  function markAllNotificationsAsRead() {
    const allIds = notifications.map(
      (notification) => notification.id
    );

    saveReadNotifications(allIds);
  }

  function handleSearchResultClick(result) {
    setSearchValue("");
    setSearchOpen(false);

    navigate(result.path);
  }

  function handleNotificationClick(
    notification
  ) {
    markNotificationAsRead(
      notification.id
    );

    setNotificationsOpen(false);
    navigate(notification.path);
  }

  function toggleNotifications() {
    setNotificationsOpen(
      (currentValue) => !currentValue
    );

    setProfileOpen(false);
    setSearchOpen(false);
  }

  function toggleProfile() {
    setProfileOpen(
      (currentValue) => !currentValue
    );

    setNotificationsOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="topbar-mobile-menu"
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMobile}
        >
          <Menu size={20} />
        </button>

        <div className="topbar-page-copy">
          <div className="topbar-title-row">
            <h2>{title}</h2>

            <span className="topbar-live-badge">
              <Sparkles size={12} />
              Live
            </span>
          </div>

          <p>
            {greeting}, {fullName}. Here&apos;s
            what&apos;s happening today.
          </p>
        </div>
      </div>

      <div className="topbar-actions">
        <div
          className="topbar-search-wrapper"
          ref={searchWrapperRef}
        >
          <div
            className={`topbar-search ${
              searchOpen ? "active" : ""
            }`}
          >
            <Search size={18} />

            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search workspace..."
              value={searchValue}
              onFocus={() => {
                setSearchOpen(true);
                setProfileOpen(false);
                setNotificationsOpen(false);
              }}
              onChange={(event) => {
                setSearchValue(
                  event.target.value
                );

                setSearchOpen(true);
              }}
            />

            {searchValue ? (
              <button
                className="topbar-search-clear"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchValue("");
                  searchInputRef.current?.focus();
                }}
              >
                <X size={15} />
              </button>
            ) : (
              <kbd>Ctrl K</kbd>
            )}
          </div>

          {searchOpen && (
            <div className="topbar-search-results">
              <div className="topbar-dropdown-header">
                <div>
                  <strong>
                    Workspace search
                  </strong>

                  <span>
                    Customers, leads, tasks
                    and events
                  </span>
                </div>
              </div>

              {loadingWorkspace ? (
                <div className="topbar-dropdown-state">
                  <div className="topbar-mini-spinner" />
                  <span>
                    Searching workspace...
                  </span>
                </div>
              ) : workspaceError ? (
                <div className="topbar-dropdown-state error">
                  <CircleAlert size={20} />

                  <span>
                    {workspaceError}
                  </span>
                </div>
              ) : !searchValue.trim() ? (
                <div className="topbar-search-help">
                  <Search size={25} />

                  <strong>
                    Search your CRM
                  </strong>

                  <span>
                    Type a customer, lead,
                    task or event name.
                  </span>
                </div>
              ) : searchResults.length ===
                0 ? (
                <div className="topbar-search-help">
                  <Search size={25} />

                  <strong>
                    No results found
                  </strong>

                  <span>
                    Try another search term.
                  </span>
                </div>
              ) : (
                <div className="topbar-results-list">
                  {searchResults.map(
                    (result) => {
                      const Icon =
                        result.icon;

                      return (
                        <button
                          className="topbar-result-item"
                          type="button"
                          key={result.id}
                          onClick={() =>
                            handleSearchResultClick(
                              result
                            )
                          }
                        >
                          <span className="topbar-result-icon">
                            <Icon size={17} />
                          </span>

                          <span className="topbar-result-copy">
                            <strong>
                              {result.title}
                            </strong>

                            <small>
                              {
                                result.subtitle
                              }
                            </small>
                          </span>

                          <span className="topbar-result-type">
                            {result.type}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="topbar-notifications-wrapper"
          ref={notificationsWrapperRef}
        >
          <button
            className={`topbar-icon-button ${
              notificationsOpen
                ? "active"
                : ""
            }`}
            type="button"
            aria-label="Notifications"
            onClick={toggleNotifications}
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="topbar-notification-count">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="topbar-notifications-menu">
              <div className="topbar-dropdown-header topbar-notifications-header">
                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span>
                    {unreadCount} unread
                  </span>
                </div>

                {notifications.length >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      markAllNotificationsAsRead
                    }
                  >
                    <CheckCheck
                      size={14}
                    />
                    Mark all read
                  </button>
                )}
              </div>

              {loadingWorkspace ? (
                <div className="topbar-dropdown-state">
                  <div className="topbar-mini-spinner" />
                  <span>
                    Loading notifications...
                  </span>
                </div>
              ) : notifications.length ===
                0 ? (
                <div className="topbar-notifications-empty">
                  <Bell size={28} />

                  <strong>
                    You&apos;re all caught up
                  </strong>

                  <span>
                    No overdue tasks or events
                    scheduled today.
                  </span>
                </div>
              ) : (
                <div className="topbar-notifications-list">
                  {notifications.map(
                    (notification) => {
                      const Icon =
                        notification.icon;

                      const isRead =
                        readNotificationIds.includes(
                          notification.id
                        );

                      return (
                        <button
                          className={`topbar-notification-item ${
                            isRead
                              ? "read"
                              : "unread"
                          } ${
                            notification.type
                          }`}
                          type="button"
                          key={
                            notification.id
                          }
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                        >
                          <span className="topbar-notification-icon">
                            <Icon
                              size={17}
                            />
                          </span>

                          <span className="topbar-notification-copy">
                            <strong>
                              {
                                notification.title
                              }
                            </strong>

                            <span>
                              {
                                notification.description
                              }
                            </span>

                            <small>
                              {
                                notification.meta
                              }
                            </small>
                          </span>

                          {!isRead && (
                            <span className="topbar-unread-dot" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="topbar-profile-wrapper"
          ref={profileWrapperRef}
        >
          <button
            className="topbar-profile-button"
            type="button"
            onClick={toggleProfile}
          >
            <div className="topbar-avatar">
              {getInitials(
                fullName,
                user?.email
              )}
            </div>

            <div className="topbar-profile-copy">
              <strong>{fullName}</strong>
              <span>{company}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="topbar-profile-menu">
              <strong>{fullName}</strong>

              <span>{user?.email}</span>

              <div className="topbar-profile-divider" />

              <Link
                to="/settings"
                onClick={() =>
                  setProfileOpen(false)
                }
              >
                Account settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;