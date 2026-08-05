import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Edit3,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services/customersService";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Prospect",
  revenue: "",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function Customers() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    async function loadCustomers() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await getCustomers(user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
        setCustomers([]);
      } else {
        setCustomers(data ?? []);
      }

      setLoading(false);
    }

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch) ||
        customer.company.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const totalRevenue = customers.reduce(
    (total, customer) => total + Number(customer.revenue || 0),
    0
  );

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function openAddModal() {
    setEditingCustomerId(null);
    setFormData(emptyForm);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomerId(customer.id);

    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      company: customer.company,
      status: customer.status,
      revenue: customer.revenue ?? "",
    });

    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setEditingCustomerId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    const customerPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      status: formData.status,
      revenue: Number(formData.revenue) || 0,
    };

    if (editingCustomerId) {
      const { data, error } = await updateCustomer(
        editingCustomerId,
        customerPayload
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === editingCustomerId ? data : customer
        )
      );
    } else {
      const { data, error } = await createCustomer(
        user.id,
        customerPayload
      );

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      setCustomers((currentCustomers) => [
        data,
        ...currentCustomers,
      ]);
    }

    setIsSaving(false);
    closeModal();
  }

  async function handleDelete(customerId, customerName) {
    const shouldDelete = window.confirm(
      `Delete ${customerName} from your customers?`
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await deleteCustomer(customerId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCustomers((currentCustomers) =>
      currentCustomers.filter(
        (customer) => customer.id !== customerId
      )
    );
  }

  return (
    <AppLayout>
      <section className="customers-page">
        <div className="customers-header">
          <div>
            <p className="page-eyebrow">Customer management</p>

            <h1>Customers</h1>

            <p>
              Manage customer information, relationships and revenue.
            </p>
          </div>

          <button
            className="primary-button customer-add-button"
            type="button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add customer
          </button>
        </div>

        {errorMessage && !isModalOpen && (
          <div className="customers-error-message">
            {errorMessage}
          </div>
        )}

        <section className="customer-summary-grid">
          <article className="customer-summary-card">
            <div className="customer-summary-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Total customers</span>
              <strong>{customers.length}</strong>
            </div>
          </article>

          <article className="customer-summary-card">
            <div className="customer-summary-icon purple">
              <Building2 size={21} />
            </div>

            <div>
              <span>Active customers</span>
              <strong>{activeCustomers}</strong>
            </div>
          </article>

          <article className="customer-summary-card">
            <div className="customer-summary-icon green">
              <span>$</span>
            </div>

            <div>
              <span>Customer revenue</span>
              <strong>{formatCurrency(totalRevenue)}</strong>
            </div>
          </article>
        </section>

        <article className="customers-table-card">
          <div className="customers-toolbar">
            <div className="customers-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search by customer, company or email..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="customers-filter">
              <Filter size={17} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Prospect">Prospect</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="customers-table-wrapper">
            {loading ? (
              <div className="customers-loading">
                <div className="route-loading-spinner" />
                <p>Loading customers...</p>
              </div>
            ) : (
              <>
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Revenue</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="customer-identity">
                            <div className="customer-avatar">
                              {getInitials(customer.name)}
                            </div>

                            <div>
                              <strong>{customer.name}</strong>
                              <span>{customer.email}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="customer-company">
                            <Building2 size={16} />
                            {customer.company}
                          </div>
                        </td>

                        <td>
                          <div className="customer-contact">
                            <span>
                              <Mail size={14} />
                              {customer.email}
                            </span>

                            <span>
                              <Phone size={14} />
                              {customer.phone || "No phone"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`customer-status ${customer.status.toLowerCase()}`}
                          >
                            {customer.status}
                          </span>
                        </td>

                        <td className="customer-revenue">
                          {formatCurrency(customer.revenue)}
                        </td>

                        <td>
                          <div className="customer-actions">
                            <button
                              type="button"
                              aria-label={`Edit ${customer.name}`}
                              onClick={() =>
                                openEditModal(customer)
                              }
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              aria-label={`Delete ${customer.name}`}
                              onClick={() =>
                                handleDelete(
                                  customer.id,
                                  customer.name
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </button>

                            <button
                              type="button"
                              aria-label={`More actions for ${customer.name}`}
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                  <div className="customers-empty">
                    <Users size={34} />
                    <h3>No customers found</h3>

                    <p>
                      Add your first customer or change the filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="customers-table-footer">
            Showing {filteredCustomers.length} of{" "}
            {customers.length} customers
          </div>
        </article>
      </section>

      {isModalOpen && (
        <div
          className="customer-modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="customer-modal-header">
              <div>
                <p className="page-eyebrow">
                  {editingCustomerId
                    ? "Update record"
                    : "New record"}
                </p>

                <h2 id="customer-modal-title">
                  {editingCustomerId
                    ? "Edit customer"
                    : "Add customer"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                type="button"
                aria-label="Close"
                onClick={closeModal}
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="customer-modal-error">
                {errorMessage}
              </div>
            )}

            <form
              className="customer-form"
              onSubmit={handleSubmit}
            >
              <div className="customer-form-grid">
                <label>
                  Full name

                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Example: Daniel Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Company

                  <input
                    required
                    name="company"
                    type="text"
                    placeholder="Example: Nova Digital"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Email address

                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="daniel@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Phone

                  <input
                    name="phone"
                    type="tel"
                    placeholder="+1 202 555 0100"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Status

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <label>
                  Revenue

                  <input
                    min="0"
                    name="revenue"
                    type="number"
                    placeholder="10000"
                    value={formData.revenue}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="customer-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
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
                    : editingCustomerId
                      ? "Save changes"
                      : "Add customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Customers;