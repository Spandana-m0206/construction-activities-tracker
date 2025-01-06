const CountryCodes = ['+1', '+91', '+44', '+61']; // Add more as needed
const Roles = {
    ADMIN : 'Admin',
    INVENTORY_MANAGER : 'Inventory Manager',
    SITE_SUPERVISOR : 'Site Supervisor',
    FINANCE_EXECUTIVE : 'Finance Executive',
  }
const Languages = ['EN', 'ES', 'FR']; // Add more languages if required
const ProjectCurrencies = {
    USD: 'USD',
    EUR: 'EUR',
    INR: 'INR',
    GBP: 'GBP',
    AUD: 'AUD'
};
const SiteTypes = {
    BHK2: '2BHK',
    BHK3: '3BHK',
    BHK4: '4BHK',
    BHK5: '5BHK',
};

const FloorTypes = {
    RAW: 'raw',
    STANDARD: 'standard',
    LUXURY: 'luxury',
};

const SiteStatuses = {
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'in progress',
    WAITING: 'waiting',
    COMPLETED: 'completed',
};

const MaterialCategories = ['furniture interior', 'electrical', 'plumbing', 'cement']; // Add more as needed
const Units = ['kg', 'nos', 'liters', 'meters']; // Add units as needed
const TaskStatuses = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEW: 'REVIEW',
    COMPLETED: 'COMPLETED',
    OPEN: 'OPEN',
    NEVER: 'NEVER',
    UPCOMING:'UPCOMING'
  };
  
const StatusOrder = {
    PENDING: 1,
    IN_PROGRESS: 2,
    REVIEW: 3,
    COMPLETED: 4,
};

const LandType = ["Raw", "Constructed", "Water Filled"];
const TaskPriorities = ['Low', 'Medium', 'High']; // Add more priorities if needed
const PaymentPriorities = ['high', 'medium', 'low'];
const PaymentStatuses = ['approved', 'rejected', 'in review'];
const OrderStatuses = ['in progress', 'approved', 'rejected', 'in transit', 'completed', 'cancelled', 'partially fulfilled'];
const OrderPriorities = ['high', 'medium', 'low'];
const ApprovalStatuses = ['in review', 'approved', 'disapproved'];
const ApprovalTypes = ['show progress', 'task completed'];
const UsageTypes = ['used', 'wasted', 'transfer'];
const PenaltySources = ['treat', 'salary', 'payables'];
const PurchaseRequestPriorities = ['high', 'medium', 'low'];
const PurchaseRequestStatuses = ['in progress', 'approved', 'cancelled'];
const FulfillmentStatuses = ['in progress', 'in transit', 'received', 'cancelled', 'returned'];
const TransferTypes = ['site-site', 'site-inventory', 'inventory-site', 'inventory-inventory', 'finance-site', 'finance-inventory'];
const StockSources = ["inventory", "site"];
const MessageTypes = ["status", "approval"];
const CarpetAreaUnitType = {
    SQUARE_FEET: 'sq. ft.',
    SQUARE_METER: 'sq. mt.',
};
const PaymentMethods = ['credit_card', 'debit_card', 'paypal', 'upi', 'bank_transfer', 'cash', 'wallet'];
const PaymentTypes = ['credit', 'debit']
const TaskTypes = ["Payment", "materials", "plumbing"]
const TaskDepartments =['Inventory', 'Finance', 'Sales', 'Site']
const TriggerTask = ["ONE_TIME", "ONE_TIME_FOR_EVERY_LEVEL"]

module.exports = {
    UsageTypes,
    ApprovalStatuses,
    ApprovalTypes,
    OrderStatuses,
    OrderPriorities,
    PaymentPriorities,
    PaymentStatuses,
    TaskStatuses,
    TaskPriorities,
    TaskTypes,
    TaskDepartments,
    MaterialCategories,
    Units,
    CountryCodes,
    Roles,
    Languages,
    ProjectCurrencies,
    SiteTypes,
    FloorTypes,
    SiteStatuses,
    FulfillmentStatuses,
    PenaltySources,
    PurchaseRequestPriorities,
    PurchaseRequestStatuses,
    FulfillmentStatuses,
    TransferTypes,
    StockSources,
    CarpetAreaUnitType,
    MessageTypes,
    PaymentMethods,
    PaymentTypes,
    TaskTypes,
    TaskDepartments,
    LandType,
    TriggerTask,
    StatusOrder
};
