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
const OrderStatuses = {
    IN_PROGRESS: 'in progress',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_TRANSIT: 'in transit',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    PARTIALLY_FULFILLED: 'partially fulfilled'
}
const OrderPriorities = ['high', 'medium', 'low'];
const ApprovalStatuses = {
    IN_REVIEW: 'in review',
    APPROVED: 'approved',
    DISAPPROVED: 'disapproved'
};

const ApprovalTypes = {
    SHOW_PROGRESS: 'show progress',
    TASK_COMPLETED: 'task completed'
};
const UsageTypes = {
    USED: 'used',
    WASTED: 'wasted',
    TRANSFER: 'transfer'
};
const PenaltySources = ['treat', 'salary', 'payables'];
const PurchaseRequestPriorities = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };
const PurchaseRequestStatuses = {
    IN_PROGRESS: 'in progress',
    APPROVED: 'approved',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
}
const MessageTypes = {
    STATUS: "status",
    APPROVAL: "approval",
    TEXT: "text"
  };
  const FulfillmentStatuses = {
    IN_PROGRESS: 'in progress',
    IN_TRANSIT: 'in transit',
    RECEIVED: 'received',
    CANCELLED: 'cancelled',
    RETURNED: 'returned'
}
const CarpetAreaUnitType = {
    SQUARE_FEET: 'sq. ft.',
    SQUARE_METER: 'sq. mt.',
};
const PaymentMethods = ['credit_card', 'debit_card', 'paypal', 'upi', 'bank_transfer', 'cash', 'wallet'];
const PaymentTypes = ['credit', 'debit']
const TaskTypes = {
    PAYMENT: 'Payment',
    MATERIALS: 'materials',
    PLUMBING: 'plumbing'
}

const TaskDepartments = {
    INVENTORY: 'Inventory',
    FINANCE: 'Finance',
    SALES: 'Sales',
    SITE: 'Site'
}

const TriggerTask = {
    ONE_TIME: 'ONE_TIME',
    ONE_TIME_FOR_EVERY_LEVEL: 'ONE_TIME_FOR_EVERY_LEVEL'
}

const TransferTypes = {
    SITE_TO_SITE: 'site-site',
    SITE_TO_INVENTORY: 'site-inventory',
    INVENTORY_TO_SITE: 'inventory-site',
    INVENTORY_TO_INVENTORY: 'inventory-inventory',
    FINANCE_TO_SITE: 'finance-site',
    FINANCE_TO_INVENTORY: 'finance-inventory'
}

const StockSources = {
    INVENTORY: 'inventory',
    SITE: 'site'
}

const TransferFromType = {
    SITE: 'site',
    INVENTORY: 'inventory'
}
const TransferToType = {
    SITE: 'site',
    INVENTORY: 'inventory'
}
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
    StatusOrder,
    TransferFromType,
    TransferToType
};
