import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import "./dashboard.css";

type Category = {
  _id: string;
  name: string;
  description?: string;
};

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  category?: Category | string | null;
};

type WorkingHour = {
  day: string;
  startTime: string;
  endTime: string;
};

type Staff = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  image?: string;
  services: Service[] | string[];
  workingHours: WorkingHour[];
};

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

type Appointment = {
  _id: string;
  customerId: Customer | string | null;
  serviceId: Service | null;
  staffId: Staff | null;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: string;
};
type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved";
  createdAt: string;
};

type ActiveTab =
  | "overview"
  | "categories"
  | "services"
  | "staff"
  | "appointments"
  | "reviews";

const emptyCategoryForm = {
  name: "",
  description: "",
};

const emptyServiceForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  image: "",
  category: "",
};

const emptyStaffForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  image: "",
  services: [] as string[],
  workingHours: [
    {
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
    },
  ] as WorkingHour[],
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// A service's `category` field can come back as a populated object or a
// bare id string depending on how the API call was made. These two helpers
// keep that logic in one place instead of repeating it everywhere.
const getCategoryId = (category: Service["category"]): string => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id || (category as any).id || "";
};

// Pulls a service's category id no matter which field name the API used
// (category, categoryId, category_id) and no matter whether it's a raw
// id string or a populated object.
const getServiceCategoryId = (service: any): string => {
  const raw =
    service.category ?? service.categoryId ?? service.category_id ?? null;
  return getCategoryId(raw);
};

const getCategoryName = (
  category: Service["category"],
  categories: Category[]
): string => {
  if (!category) return "Uncategorized";

  if (typeof category === "string") {
    const found = categories.find((c) => c._id === category);
    return found?.name || "Uncategorized";
  }

  const categoryObj = category as Category;
  return categoryObj.name || "Uncategorized";
};

export default function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Filters which category's services are shown in the services table.
  // "all" shows everything, grouped by category heading.
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");

  // Appointment management extra states
  const [appSearch, setAppSearch] = useState("");
  const [appFilterStatus, setAppFilterStatus] = useState("upcoming");
  const [appFilterStylist, setAppFilterStylist] = useState("all");
  const [appFilterDate, setAppFilterDate] = useState("");
  const [appSort, setAppSort] = useState("date-desc");

  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appForm, setAppForm] = useState({
    customerId: "",
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    amount: "",
    status: "",
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchCategories();
    fetchServices();
    fetchStaff();
    fetchAppointments();
    fetchCustomers();
    fetchReviews();
  }, [token, userRole, navigate]);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  const getErrorMessage = (error: any, fallback: string) => {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.categories || res.data || []);
    } catch (error: any) {
      console.log("FETCH CATEGORIES ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to load categories"));
    }
  };

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data.services || res.data || []);
    } catch (error: any) {
      console.log("FETCH SERVICES ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to load services"));
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await API.get("/staff");
      setStaffList(res.data.staff || res.data || []);
    } catch (error: any) {
      console.log("FETCH STAFF ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to load staff"));
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data.appointments || res.data || []);
    } catch (error: any) {
      console.log("FETCH APPOINTMENTS ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to load appointments"));
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      await API.put(`/appointments/${id}/status`, { status: newStatus });
      showMessage(`Appointment status updated to ${newStatus}`);
      await fetchAppointments();
    } catch (error: any) {
      console.log("UPDATE APPOINTMENT STATUS ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to update appointment status"));
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await API.delete(`/appointments/${id}`);
      showMessage("Appointment deleted successfully");
      await fetchAppointments();
    } catch (error: any) {
      console.log("DELETE APPOINTMENT ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to delete appointment"));
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/auth/customers");
      setCustomers(res.data.customers || []);
    } catch (error: any) {
      console.log("FETCH CUSTOMERS ERROR:", error.response?.data || error.message);
    }
  };

  const handleOpenEditModal = (app: Appointment) => {
    setEditingApp(app);
    const custId = app.customerId && typeof app.customerId === "object" ? (app.customerId as Customer)._id : String(app.customerId || "");
    const servId = app.serviceId && typeof app.serviceId === "object" ? (app.serviceId as Service)._id : String(app.serviceId || "");
    const stffId = app.staffId && typeof app.staffId === "object" ? (app.staffId as Staff)._id : String(app.staffId || "");

    setAppForm({
      customerId: custId,
      serviceId: servId,
      staffId: stffId,
      date: app.date || "",
      time: app.time || "",
      amount: String(app.amount || ""),
      status: app.status || "pending",
    });
  };

  const handleAppFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    if (!appForm.customerId || !appForm.serviceId || !appForm.staffId || !appForm.date || !appForm.time) {
      showMessage("All fields except amount are required");
      return;
    }

    try {
      const payload = {
        customerId: appForm.customerId,
        serviceId: appForm.serviceId,
        staffId: appForm.staffId,
        date: appForm.date,
        time: appForm.time,
        amount: appForm.amount ? Number(appForm.amount) : undefined,
        status: appForm.status,
      };

      const res = await API.put(`/appointments/${editingApp._id}`, payload);
      showMessage("Appointment updated successfully");
      setEditingApp(null);
      await fetchAppointments();

      // Update selectedApp if it's currently being viewed
      if (selectedApp && selectedApp._id === editingApp._id) {
        setSelectedApp(res.data.appointment || null);
      }
    } catch (error: any) {
      console.log("UPDATE APPOINTMENT ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Failed to update appointment"));
    }
  };
  const fetchReviews = async () => {
    try {
      const res = await API.get("/reviews/pending");
      setReviews(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ---------- Categories ----------

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name) {
      showMessage("Please enter a category name");
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
    };

    try {
      if (editingCategoryId) {
        console.log("UPDATING CATEGORY ID:", editingCategoryId);
        await API.put(`/categories/${editingCategoryId}`, payload);
        showMessage("Category updated successfully");
      } else {
        await API.post("/categories", payload);
        showMessage("Category added successfully");
      }

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await fetchCategories();
    } catch (error: any) {
      console.log("CATEGORY SAVE ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Category save failed"));
    }
  };

  const editCategory = (category: Category) => {
    setActiveTab("categories");
    setEditingCategoryId(category._id);

    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCategory = async (id: string) => {
    const servicesUsingCategory = services.filter(
      (service) => getServiceCategoryId(service) === id
    ).length;

    const confirmMessage =
      servicesUsingCategory > 0
        ? `${servicesUsingCategory} service(s) currently use this category. Delete anyway?`
        : "Are you sure you want to delete this category?";

    if (!confirm(confirmMessage)) return;

    try {
      await API.delete(`/categories/${id}`);
      showMessage("Category deleted successfully");
      await fetchCategories();
      await fetchServices();

      if (editingCategoryId === id) {
        setEditingCategoryId(null);
        setCategoryForm(emptyCategoryForm);
      }
    } catch (error: any) {
      console.log("CATEGORY DELETE ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Category delete failed"));
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  // ---------- Services ----------

  const handleServiceImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Image is too large. Please upload image below 2MB.");
      return;
    }

    try {
      const imageBase64 = await fileToBase64(file);

      setServiceForm((prev) => ({
        ...prev,
        image: imageBase64,
      }));
    } catch (error: any) {
      console.log("SERVICE IMAGE ERROR:", error);
      showMessage("Service image upload failed");
    }
  };

  const handleStaffImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Image is too large. Please upload image below 2MB.");
      return;
    }

    try {
      const imageBase64 = await fileToBase64(file);

      setStaffForm((prev) => ({
        ...prev,
        image: imageBase64,
      }));
    } catch (error: any) {
      console.log("STAFF IMAGE ERROR:", error);
      showMessage("Staff image upload failed");
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !serviceForm.name ||
      !serviceForm.description ||
      !serviceForm.price ||
      !serviceForm.duration ||
      !serviceForm.category
    ) {
      showMessage("Please fill all service fields, including category");
      return;
    }

    const payload = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      price: Number(serviceForm.price),
      duration: Number(serviceForm.duration),
      image: serviceForm.image,
      category: serviceForm.category,
    };

    try {
      if (editingServiceId) {
        console.log("UPDATING SERVICE ID:", editingServiceId);
        await API.put(`/services/${editingServiceId}`, payload);
        showMessage("Service updated successfully");
      } else {
        await API.post("/services", payload);
        showMessage("Service added successfully");
      }

      setServiceForm(emptyServiceForm);
      setEditingServiceId(null);
      await fetchServices();
    } catch (error: any) {
      console.log("SERVICE SAVE ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Service save failed"));
    }
  };

  const editService = (service: Service) => {
    setActiveTab("services");
    setEditingServiceId(service._id);

    setServiceForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price !== undefined ? String(service.price) : "",
      duration: service.duration !== undefined ? String(service.duration) : "",
      image: service.image || "",
      category: getServiceCategoryId(service),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await API.delete(`/services/${id}`);
      showMessage("Service deleted successfully");
      await fetchServices();

      if (editingServiceId === id) {
        setEditingServiceId(null);
        setServiceForm(emptyServiceForm);
      }
    } catch (error: any) {
      console.log("SERVICE DELETE ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Service delete failed"));
    }
  };

  const resetServiceForm = () => {
    setServiceForm(emptyServiceForm);
    setEditingServiceId(null);
  };

  // ---------- Staff ----------

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !staffForm.name ||
      !staffForm.email ||
      !staffForm.phone ||
      !staffForm.specialization
    ) {
      showMessage("Please fill all staff fields");
      return;
    }

    const payload = {
      name: staffForm.name.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      specialization: staffForm.specialization.trim(),
      image: staffForm.image,
      services: staffForm.services,
      workingHours: staffForm.workingHours,
    };

    try {
      if (editingStaffId) {
        console.log("UPDATING STAFF ID:", editingStaffId);
        await API.put(`/staff/${editingStaffId}`, payload);
        showMessage("Staff updated successfully");
      } else {
        await API.post("/staff", payload);
        showMessage("Staff added successfully");
      }

      setStaffForm(emptyStaffForm);
      setEditingStaffId(null);
      await fetchStaff();
    } catch (error: any) {
      console.log("STAFF SAVE ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Staff save failed"));
    }
  };

  const editStaff = (staff: Staff) => {
    const selectedServiceIds = (staff.services || [])
      .map((service: any) => {
        if (typeof service === "string") return service;
        return service?._id;
      })
      .filter(Boolean);

    setActiveTab("staff");
    setEditingStaffId(staff._id);

    setStaffForm({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      specialization: staff.specialization || "",
      image: staff.image || "",
      services: selectedServiceIds,
      workingHours:
        staff.workingHours && staff.workingHours.length > 0
          ? staff.workingHours
          : [{ day: "Monday", startTime: "09:00", endTime: "17:00" }],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await API.delete(`/staff/${id}`);
      showMessage("Staff deleted successfully");
      await fetchStaff();

      if (editingStaffId === id) {
        setEditingStaffId(null);
        setStaffForm(emptyStaffForm);
      }
    } catch (error: any) {
      console.log("STAFF DELETE ERROR:", error.response?.data || error.message);
      showMessage(getErrorMessage(error, "Staff delete failed"));
    }
  };

  const toggleStaffService = (serviceId: string) => {
    setStaffForm((prev) => {
      const exists = prev.services.includes(serviceId);

      return {
        ...prev,
        services: exists
          ? prev.services.filter((id) => id !== serviceId)
          : [...prev.services, serviceId],
      };
    });
  };

  const updateWorkingHour = (
    index: number,
    field: keyof WorkingHour,
    value: string
  ) => {
    const updated = [...staffForm.workingHours];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setStaffForm({
      ...staffForm,
      workingHours: updated,
    });
  };

  const addWorkingHour = () => {
    setStaffForm({
      ...staffForm,
      workingHours: [
        ...staffForm.workingHours,
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
      ],
    });
  };

  const removeWorkingHour = (index: number) => {
    const updated = staffForm.workingHours.filter((_, i) => i !== index);

    setStaffForm({
      ...staffForm,
      workingHours: updated.length > 0 ? updated : emptyStaffForm.workingHours,
    });
  };

  const getServiceNames = (staff: Staff) => {
    if (!staff.services || staff.services.length === 0) {
      return "No services assigned";
    }

    return staff.services
      .map((service: any) => {
        if (typeof service === "string") {
          const found = services.find((s) => s._id === service);
          return found?.name || "Service";
        }

        return service?.name || "Service";
      })
      .join(", ");
  };

  const resetStaffForm = () => {
    setStaffForm(emptyStaffForm);
    setEditingStaffId(null);
  };

  // Services grouped under each category, for the staff assignment checklist
  // and the "all categories" view of the services table. Services with no
  // matching category land in a final "Uncategorized" bucket.
  const servicesGroupedByCategory: { category: Category | null; services: Service[] }[] =
    (() => {
      const groups: { category: Category | null; services: Service[] }[] = categories.map((category) => ({
        category,
        services: services.filter(
          (service) => getServiceCategoryId(service) === category._id
        ),
      }));

      const uncategorized = services.filter(
        (service) => !getServiceCategoryId(service)
      );

      if (uncategorized.length > 0) {
        groups.push({ category: null, services: uncategorized });
      }

      return groups;
    })();

  const visibleServiceGroups =
    serviceCategoryFilter === "all"
      ? servicesGroupedByCategory
      : servicesGroupedByCategory.filter(
        (group) => (group.category?._id || "uncategorized") === serviceCategoryFilter
      );

  const filteredAppointments = appointments
    .filter((app) => {
      const customerObj = app.customerId && typeof app.customerId === "object" ? (app.customerId as Customer) : null;
      const custName = customerObj ? customerObj.name : "Guest";
      const custEmail = customerObj ? customerObj.email : "";

      const serviceObj = app.serviceId && typeof app.serviceId === "object" ? (app.serviceId as Service) : null;
      const serviceName = serviceObj ? serviceObj.name : "Service";

      const staffObj = app.staffId && typeof app.staffId === "object" ? (app.staffId as Staff) : null;
      const staffName = staffObj ? staffObj.name : "Stylist";

      const searchLower = appSearch.toLowerCase();
      const matchesSearch =
        custName.toLowerCase().includes(searchLower) ||
        custEmail.toLowerCase().includes(searchLower) ||
        serviceName.toLowerCase().includes(searchLower) ||
        staffName.toLowerCase().includes(searchLower);

      const statusVal = (app.status || "pending").toLowerCase();
      let matchesStatus = false;
      if (appFilterStatus === "all") {
        matchesStatus = true;
      } else if (appFilterStatus === "upcoming") {
        matchesStatus = statusVal === "pending" || statusVal === "confirmed";
      } else {
        matchesStatus = statusVal === appFilterStatus.toLowerCase();
      }

      const staffIdVal = staffObj ? staffObj._id : (typeof app.staffId === "string" ? app.staffId : "");
      const matchesStylist = appFilterStylist === "all" || staffIdVal === appFilterStylist;

      const matchesDate = !appFilterDate || app.date === appFilterDate;

      return matchesSearch && matchesStatus && matchesStylist && matchesDate;
    })
    .sort((a, b) => {
      if (appSort === "date-desc") {
        const dtA = `${a.date} ${a.time}`;
        const dtB = `${b.date} ${b.time}`;
        return dtB.localeCompare(dtA);
      } else if (appSort === "date-asc") {
        const dtA = `${a.date} ${a.time}`;
        const dtB = `${b.date} ${b.time}`;
        return dtA.localeCompare(dtB);
      } else if (appSort === "amount-desc") {
        return (b.amount || 0) - (a.amount || 0);
      } else if (appSort === "amount-asc") {
        return (a.amount || 0) - (b.amount || 0);
      }
      return 0;
    });

  return (
    <div className="admin-page">

      <aside className="admin-sidebar">
        <div
          className="admin-brand"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
          title="View Website Homepage"
        >
          <h2>GlowHaven.</h2>
          <span>Admin Panel</span>
        </div>

        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Manage Categories
        </button>

        <button
          className={activeTab === "services" ? "active" : ""}
          onClick={() => setActiveTab("services")}
        >
          Manage Services
        </button>

        <button
          className={activeTab === "staff" ? "active" : ""}
          onClick={() => setActiveTab("staff")}
        >
          Manage Staff
        </button>

        <button
          className={activeTab === "appointments" ? "active" : ""}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>

        <button
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          Manage Reviews
        </button>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Salon Management</span>
            <h1>Admin Dashboard</h1>
          </div>

          <p>Welcome, {userName || "Admin"}</p>
        </div>

        {message && <div className="admin-message">{message}</div>}

        {activeTab === "overview" && (
          <section className="admin-section">
            <div className="overview-grid">
              <div className="overview-card">
                <span>Total Categories</span>
                <h2>{categories.length}</h2>
              </div>

              <div className="overview-card">
                <span>Total Services</span>
                <h2>{services.length}</h2>
              </div>

              <div className="overview-card">
                <span>Total Staff</span>
                <h2>{staffList.length}</h2>
              </div>

              <div className="overview-card">
                <span>Total Appointments</span>
                <h2>{appointments.length}</h2>
                <p>Scheduled appointments</p>
              </div>

              <div className="overview-card">
                <span>Pending Appointments</span>
                <h2>{appointments.filter(app => app.status === "pending").length}</h2>
                <p>Awaiting confirmation</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "categories" && (
          <section className="admin-section">
            <div className="section-heading">
              <h2>Manage Categories</h2>
              <p>Group your services so customers can browse them by type.</p>
            </div>

            <form className="admin-form" onSubmit={handleCategorySubmit}>
              <input
                type="text"
                placeholder="Category Name (e.g. Hair, Nails, Skincare)"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
              />

              <textarea
                placeholder="Description (optional)"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              />

              <div className="form-actions">
                <button type="submit">
                  {editingCategoryId ? "Update Category" : "Add Category"}
                </button>

                {editingCategoryId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetCategoryForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="admin-table">
              <div className="table-row table-head category-table-row">
                <span>Name</span>
                <span>Description</span>
                <span>Services</span>
                <span>Actions</span>
              </div>

              {categories.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "rgba(39, 53, 35, 0.6)" }}>
                  No categories yet. Add one above to start grouping your services.
                </div>
              ) : (
                categories.map((category) => {
                  const serviceCount = services.filter(
                    (service) => getServiceCategoryId(service) === category._id
                  ).length;

                  return (
                    <div className="table-row category-table-row" key={category._id}>
                      <span>{category.name}</span>
                      <span>{category.description || "—"}</span>
                      <span>{serviceCount}</span>

                      <span className="table-actions">
                        <button type="button" onClick={() => editCategory(category)}>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => deleteCategory(category._id)}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {activeTab === "services" && (
          <section className="admin-section">
            <div className="section-heading">
              <h2>Manage Services</h2>
              <p>Add, update, delete salon services and upload images.</p>
            </div>

            <form className="admin-form" onSubmit={handleServiceSubmit}>
              <input
                type="text"
                placeholder="Service Name"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
              />

              <select
                value={serviceForm.category}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, category: e.target.value })
                }
              >
                <option value="">Select a Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price"
                value={serviceForm.price}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, price: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Duration in minutes"
                value={serviceForm.duration}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, duration: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                value={serviceForm.description}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    description: e.target.value,
                  })
                }
              />

              <div className="admin-image-upload">
                <label>Service Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleServiceImageUpload}
                />

                {serviceForm.image && (
                  <img
                    src={serviceForm.image}
                    alt="Service Preview"
                    className="admin-image-preview"
                  />
                )}
              </div>

              <div className="form-actions">
                <button type="submit">
                  {editingServiceId ? "Update Service" : "Add Service"}
                </button>

                {editingServiceId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetServiceForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="service-filter-bar">
              <label>Filter by category:</label>

              <select
                value={serviceCategoryFilter}
                onChange={(e) => setServiceCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
                <option value="uncategorized">Uncategorized</option>
              </select>
            </div>

            {visibleServiceGroups.map((group) => (
              <div className="category-service-group" key={group.category?._id || "uncategorized"}>
                <h3 className="category-group-title">
                  {group.category?.name || "Uncategorized"}
                  <span className="category-group-count">
                    {group.services.length} service{group.services.length === 1 ? "" : "s"}
                  </span>
                </h3>

                {group.services.length === 0 ? (
                  <div style={{ padding: "20px", color: "rgba(39, 53, 35, 0.6)" }}>
                    No services in this category yet.
                  </div>
                ) : (
                  <div className="admin-table">
                    <div className="table-row table-head service-table-row">
                      <span>Image</span>
                      <span>Name</span>
                      <span>Category</span>
                      <span>Price</span>
                      <span>Duration</span>
                      <span>Actions</span>
                    </div>

                    {group.services.map((service) => (
                      <div className="table-row service-table-row" key={service._id}>
                        <span>
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="table-image"
                            />
                          ) : (
                            <div className="table-image empty-image">No Image</div>
                          )}
                        </span>

                        <span>{service.name}</span>
                        <span>{getCategoryName(service.category, categories)}</span>
                        <span>Rs. {service.price}</span>
                        <span>{service.duration} min</span>

                        <span className="table-actions">
                          <button type="button" onClick={() => editService(service)}>
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() => deleteService(service._id)}
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {activeTab === "staff" && (
          <section className="admin-section">
            <div className="section-heading">
              <h2>Manage Staff</h2>
              <p>Add stylists, upload images, assign services and hours.</p>
            </div>

            <form className="admin-form" onSubmit={handleStaffSubmit}>
              <input
                type="text"
                placeholder="Staff Name"
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone"
                value={staffForm.phone}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, phone: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Specialization"
                value={staffForm.specialization}
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    specialization: e.target.value,
                  })
                }
              />

              <div className="admin-image-upload">
                <label>Staff Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStaffImageUpload}
                />

                {staffForm.image && (
                  <img
                    src={staffForm.image}
                    alt="Staff Preview"
                    className="admin-image-preview staff-preview"
                  />
                )}
              </div>

              <div className="checkbox-area">
                <h4>Assign Services</h4>

                {servicesGroupedByCategory.map((group) => (
                  <div
                    className="checkbox-category-group"
                    key={group.category?._id || "uncategorized"}
                  >
                    <h5>{group.category?.name || "Uncategorized"}</h5>

                    <div className="checkbox-grid">
                      {group.services.map((service) => (
                        <label key={service._id}>
                          <input
                            type="checkbox"
                            checked={staffForm.services.includes(service._id)}
                            onChange={() => toggleStaffService(service._id)}
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="working-hours-area">
                <h4>Working Hours</h4>

                {staffForm.workingHours.map((hour, index) => (
                  <div className="working-row" key={index}>
                    <select
                      value={hour.day}
                      onChange={(e) =>
                        updateWorkingHour(index, "day", e.target.value)
                      }
                    >
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>

                    <input
                      type="time"
                      value={hour.startTime}
                      onChange={(e) =>
                        updateWorkingHour(index, "startTime", e.target.value)
                      }
                    />

                    <input
                      type="time"
                      value={hour.endTime}
                      onChange={(e) =>
                        updateWorkingHour(index, "endTime", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeWorkingHour(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={addWorkingHour}
                >
                  Add Working Day
                </button>
              </div>

              <div className="form-actions">
                <button type="submit">
                  {editingStaffId ? "Update Staff" : "Add Staff"}
                </button>

                {editingStaffId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetStaffForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="staff-admin-grid">
              {staffList.map((staff) => (
                <div className="staff-admin-card" key={staff._id}>
                  {staff.image ? (
                    <img
                      src={staff.image}
                      alt={staff.name}
                      className="staff-admin-img"
                    />
                  ) : (
                    <div className="staff-admin-img staff-empty-img">
                      No Image
                    </div>
                  )}

                  <h3>{staff.name}</h3>
                  <p>{staff.specialization}</p>
                  <span>{staff.email}</span>
                  <small>{getServiceNames(staff)}</small>

                  <div className="staff-card-actions">
                    <button type="button" onClick={() => editStaff(staff)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteStaff(staff._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "appointments" && (
          <section className="appointment-management-section">
            <div className="section-heading">
              <h2>Manage Appointments</h2>
              <p>Search, filter, sort, view, edit, and manage client bookings.</p>
            </div>

            {/* Filter and Control Bar */}
            <div className="appointment-controls-bar">
              <div className="control-group search-group">
                <input
                  type="text"
                  placeholder="Search customer, service or stylist..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="luxury-input"
                />
              </div>

              <div className="control-group">
                <select
                  value={appFilterStatus}
                  onChange={(e) => setAppFilterStatus(e.target.value)}
                  className="luxury-select"
                >
                  <option value="upcoming">Upcoming Appointments</option>
                  <option value="completed">Completed Appointments</option>
                  <option value="cancelled">Cancelled Appointments</option>
                  <option value="all">All Statuses</option>
                </select>
              </div>

              <div className="control-group">
                <select
                  value={appFilterStylist}
                  onChange={(e) => setAppFilterStylist(e.target.value)}
                  className="luxury-select"
                >
                  <option value="all">All Stylists</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <input
                  type="date"
                  value={appFilterDate}
                  onChange={(e) => setAppFilterDate(e.target.value)}
                  className="luxury-input date-input"
                />
              </div>

              <div className="control-group">
                <select
                  value={appSort}
                  onChange={(e) => setAppSort(e.target.value)}
                  className="luxury-select"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="amount-desc">Price (High to Low)</option>
                  <option value="amount-asc">Price (Low to High)</option>
                </select>
              </div>

              <button
                type="button"
                className="luxury-reset-btn"
                onClick={() => {
                  setAppSearch("");
                  setAppFilterStatus("upcoming");
                  setAppFilterStylist("all");
                  setAppFilterDate("");
                  setAppSort("date-desc");
                }}
              >
                Reset
              </button>
            </div>

            {/* Quick Stats Summary Bar */}
            <div className="appointment-stats-summary">
              <div className="stat-capsule">
                <span className="label">Filtered Total:</span>
                <span className="value">{filteredAppointments.length}</span>
              </div>
              <div className="stat-capsule upcoming">
                <span className="label">Upcoming:</span>
                <span className="value">
                  {filteredAppointments.filter((a) => (a.status || "pending") === "pending" || a.status === "confirmed").length}
                </span>
              </div>
              <div className="stat-capsule completed">
                <span className="label">Completed:</span>
                <span className="value">
                  {filteredAppointments.filter((a) => a.status === "completed").length}
                </span>
              </div>
              <div className="stat-capsule cancelled">
                <span className="label">Cancelled:</span>
                <span className="value">
                  {filteredAppointments.filter((a) => a.status === "cancelled").length}
                </span>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="admin-table luxury-appointments-table">
              <div className="table-row table-head appointment-table-row">
                <span>Customer</span>
                <span>Service</span>
                <span>Stylist</span>
                <span>Date & Time</span>
                <span>Price</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="no-appointments-placeholder">
                  No appointments match the selected criteria.
                </div>
              ) : (
                filteredAppointments.map((app) => {
                  const customerObj = app.customerId && typeof app.customerId === "object" ? (app.customerId as Customer) : null;
                  const custName = customerObj ? customerObj.name : "Guest";
                  const custContact = customerObj ? `${customerObj.email}${customerObj.phone ? ` / ${customerObj.phone}` : ""}` : "";

                  const serviceObj = app.serviceId && typeof app.serviceId === "object" ? (app.serviceId as Service) : null;
                  const serviceName = serviceObj ? serviceObj.name : "Service";

                  const staffObj = app.staffId && typeof app.staffId === "object" ? (app.staffId as Staff) : null;
                  const staffName = staffObj ? staffObj.name : "Stylist";

                  const appointmentStatus = app.status || "pending";

                  return (
                    <div className="table-row appointment-table-row" key={app._id}>
                      <span>
                        <strong className="cust-name-cell">{custName}</strong>
                        <span className="cust-contact-cell">{custContact}</span>
                      </span>

                      <span>
                        <span className="service-name-cell">{serviceName}</span>
                      </span>
                      <span>
                        <span className="staff-name-cell">{staffName}</span>
                      </span>
                      <span>
                        <strong className="date-cell">{app.date}</strong>
                        <span className="time-cell">{app.time}</span>
                      </span>
                      <span className="amount-cell">Rs. {app.amount || (serviceObj ? serviceObj.price : "")}</span>
                      <span>
                        <span className={`status-badge ${(appointmentStatus === "pending" || appointmentStatus === "confirmed") ? "upcoming" : appointmentStatus.toLowerCase()}`}>
                          {(appointmentStatus === "pending" || appointmentStatus === "confirmed") ? "Upcoming" : appointmentStatus.charAt(0).toUpperCase() + appointmentStatus.slice(1)}
                        </span>
                      </span>

                      <span className="table-actions">
                        <button
                          type="button"
                          className="luxury-action-btn view-btn"
                          onClick={() => setSelectedApp(app)}
                        >
                          View
                        </button>

                        {appointmentStatus === "pending" && (
                          <button
                            type="button"
                            className="luxury-action-btn confirm-btn"
                            onClick={() => handleUpdateAppointmentStatus(app._id, "confirmed")}
                          >
                            Confirm
                          </button>
                        )}
                        {appointmentStatus === "confirmed" && (
                          <button
                            type="button"
                            className="luxury-action-btn complete-btn"
                            onClick={() => handleUpdateAppointmentStatus(app._id, "completed")}
                          >
                            Complete
                          </button>
                        )}
                        {appointmentStatus !== "cancelled" && appointmentStatus !== "completed" && (
                          <button
                            type="button"
                            className="luxury-action-btn cancel-btn"
                            onClick={() => handleUpdateAppointmentStatus(app._id, "cancelled")}
                          >
                            Cancel
                          </button>
                        )}

                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* View Details Modal */}
            {selectedApp && (() => {
              const customerObj = selectedApp.customerId && typeof selectedApp.customerId === "object" ? (selectedApp.customerId as Customer) : null;
              const serviceObj = selectedApp.serviceId && typeof selectedApp.serviceId === "object" ? (selectedApp.serviceId as Service) : null;
              const staffObj = selectedApp.staffId && typeof selectedApp.staffId === "object" ? (selectedApp.staffId as Staff) : null;
              return (
                <div className="luxury-modal-overlay" onClick={() => setSelectedApp(null)}>
                  <div className="luxury-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Appointment Details</h3>
                      <button className="close-modal-btn" onClick={() => setSelectedApp(null)}>&times;</button>
                    </div>
                    <div className="modal-body">
                      <div className="details-section">
                        <h4 className="detail-section-title">Client Details</h4>
                        <div className="detail-row">
                          <span className="lbl">Name:</span>
                          <span className="val">{customerObj ? customerObj.name : "Guest"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Email:</span>
                          <span className="val">{customerObj ? customerObj.email : "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Phone:</span>
                          <span className="val">{customerObj?.phone || "N/A"}</span>
                        </div>
                      </div>

                      <div className="details-section">
                        <h4 className="detail-section-title">Stylist & Service</h4>
                        <div className="detail-row">
                          <span className="lbl">Stylist:</span>
                          <span className="val">{staffObj ? staffObj.name : "Unassigned"} ({staffObj?.specialization || "General Specialist"})</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Service:</span>
                          <span className="val">{serviceObj ? serviceObj.name : "Custom Service"}</span>
                        </div>
                        {serviceObj?.description && (
                          <div className="detail-row">
                            <span className="lbl">Description:</span>
                            <span className="val description-val">{serviceObj.description}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="lbl">Service Price:</span>
                          <span className="val">Rs. {serviceObj ? serviceObj.price : "N/A"}</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Expected Duration:</span>
                          <span className="val">{selectedApp.duration || serviceObj?.duration || 0} mins</span>
                        </div>
                      </div>

                      <div className="details-section">
                        <h4 className="detail-section-title">Booking Details</h4>
                        <div className="detail-row">
                          <span className="lbl">Date:</span>
                          <span className="val">{selectedApp.date}</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Time Slot:</span>
                          <span className="val">{selectedApp.time}</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Total Amount Charged:</span>
                          <span className="val highlight-amount">Rs. {selectedApp.amount}</span>
                        </div>
                        <div className="detail-row">
                          <span className="lbl">Status:</span>
                          <span className="val">
                            <span className={`status-badge ${(selectedApp.status === "pending" || selectedApp.status === "confirmed") ? "upcoming" : selectedApp.status.toLowerCase()}`}>
                              {(selectedApp.status === "pending" || selectedApp.status === "confirmed") ? "Upcoming" : selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="luxury-action-btn edit-btn primary-gold"
                        onClick={() => {
                          handleOpenEditModal(selectedApp);
                          setSelectedApp(null);
                        }}
                      >
                        Edit Appointment
                      </button>

                      {selectedApp.status === "pending" && (
                        <button
                          type="button"
                          className="luxury-action-btn confirm-btn"
                          onClick={() => {
                            handleUpdateAppointmentStatus(selectedApp._id, "confirmed");
                            setSelectedApp(null);
                          }}
                        >
                          Confirm
                        </button>
                      )}

                      {selectedApp.status === "confirmed" && (
                        <button
                          type="button"
                          className="luxury-action-btn complete-btn"
                          onClick={() => {
                            handleUpdateAppointmentStatus(selectedApp._id, "completed");
                            setSelectedApp(null);
                          }}
                        >
                          Complete
                        </button>
                      )}

                      {selectedApp.status !== "cancelled" && selectedApp.status !== "completed" && (
                        <button
                          type="button"
                          className="luxury-action-btn cancel-btn"
                          onClick={() => {
                            handleUpdateAppointmentStatus(selectedApp._id, "cancelled");
                            setSelectedApp(null);
                          }}
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="button"
                        className="luxury-action-btn delete-btn danger-btn"
                        onClick={() => {
                          handleDeleteAppointment(selectedApp._id);
                          setSelectedApp(null);
                        }}
                      >
                        Delete
                      </button>
                      <button type="button" className="luxury-reset-btn" onClick={() => setSelectedApp(null)}>Close</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Edit Modal */}
            {editingApp && (
              <div className="luxury-modal-overlay" onClick={() => setEditingApp(null)}>
                <div className="luxury-modal-content modal-form" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Appointment</h3>
                    <button type="button" className="close-modal-btn" onClick={() => setEditingApp(null)}>&times;</button>
                  </div>
                  <form onSubmit={handleAppFormSubmit}>
                    <div className="modal-body">
                      <div className="form-group-grid">
                        <div className="form-field">
                          <label>Customer Reference</label>
                          <select
                            value={appForm.customerId}
                            onChange={(e) => setAppForm({ ...appForm, customerId: e.target.value })}
                            className="luxury-select"
                            required
                          >
                            <option value="">Select Customer</option>
                            {(() => {
                              const currCustomer = editingApp.customerId && typeof editingApp.customerId === "object" ? (editingApp.customerId as Customer) : null;
                              const isCurrentInList = currCustomer && customers.some(c => c._id === currCustomer._id);
                              return (
                                <>
                                  {currCustomer && !isCurrentInList && (
                                    <option value={currCustomer._id}>{currCustomer.name} ({currCustomer.email})</option>
                                  )}
                                  {customers.map((c) => (
                                    <option key={c._id} value={c._id}>
                                      {c.name} ({c.email})
                                    </option>
                                  ))}
                                </>
                              );
                            })()}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Booked Service</label>
                          <select
                            value={appForm.serviceId}
                            onChange={(e) => {
                              const newServId = e.target.value;
                              const serv = services.find(s => s._id === newServId);
                              setAppForm({
                                ...appForm,
                                serviceId: newServId,
                                amount: serv ? String(serv.price) : appForm.amount
                              });
                            }}
                            className="luxury-select"
                            required
                          >
                            <option value="">Select Service</option>
                            {services.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} (Rs. {s.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Assigned Stylist</label>
                          <select
                            value={appForm.staffId}
                            onChange={(e) => setAppForm({ ...appForm, staffId: e.target.value })}
                            className="luxury-select"
                            required
                          >
                            <option value="">Select Stylist</option>
                            {staffList.map((st) => (
                              <option key={st._id} value={st._id}>
                                {st.name} ({st.specialization})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label>Appointment Date</label>
                          <input
                            type="date"
                            value={appForm.date}
                            onChange={(e) => setAppForm({ ...appForm, date: e.target.value })}
                            className="luxury-input"
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Appointment Time (e.g. 10:00 or 15:30)</label>
                          <input
                            type="text"
                            placeholder="HH:MM"
                            value={appForm.time}
                            onChange={(e) => setAppForm({ ...appForm, time: e.target.value })}
                            className="luxury-input"
                            required
                          />
                        </div>

                        <div className="form-field">
                          <label>Charge Amount (Rs.)</label>
                          <input
                            type="number"
                            value={appForm.amount}
                            onChange={(e) => setAppForm({ ...appForm, amount: e.target.value })}
                            className="luxury-input"
                          />
                        </div>

                        <div className="form-field">
                          <label>Status</label>
                          <select
                            value={appForm.status}
                            onChange={(e) => setAppForm({ ...appForm, status: e.target.value })}
                            className="luxury-select"
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="luxury-action-btn edit-btn primary-gold">Save Changes</button>
                      <button type="button" className="luxury-reset-btn" onClick={() => setEditingApp(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ADD REVIEWS SECTION HERE */}

        {activeTab === "reviews" && (
          <section className="admin-section">

            <h2>Manage Reviews</h2>

            {reviews.map((review) => (
              <div key={review._id}>

                <h3>{review.name}</h3>

                <p>
                  {"★".repeat(review.rating)}
                </p>

                <p>
                  {review.comment}
                </p>

                <button
                  onClick={async () => {

                    await API.put(
                      `/reviews/approve/${review._id}`
                    );

                    fetchReviews();

                  }}
                >
                  Approve
                </button>

              </div>
            ))}

          </section>
        )}

      </main>
    </div>
  );
}
