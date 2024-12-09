const CountryCodes = ['+1', '+91', '+44', '+61']; // Add more as needed
const Roles = ['Admin', 'Inventory Manager', 'Site Supervisor', 'Finance Executive'];
const Languages = ['EN', 'ES', 'FR']; // Add more languages if required
const ProjectCurrencies = ['USD', 'EUR', 'INR', 'GBP', 'AUD']; // Add more as needed
const SiteTypes = ['1BHK', '2BHK', '3BHK'];
const FloorTypes = ['raw', 'standard', 'luxury'];
const SiteStatuses = ['upcoming', 'in progress', 'waiting', 'completed'];
const MaterialCategories = ['furniture interior', 'electrical', 'plumbing']; // Add more as needed
const Units = ['kg', 'nos', 'liters', 'meters']; // Add units as needed
const TaskStatuses = [
    'open',
    'in progress',
    'waiting for approval',
    'closed',
    'waiting',
    'never',
]; // Add more statuses as needed

const TaskPriorities = ['Low', 'Medium', 'High']; // Add more priorities if needed
const PaymentPriorities = ['high', 'medium', 'low'];
const PaymentStatuses = ['approved', 'rejected', 'in review'];
const OrderStatuses = ['in progress', 'approved', 'rejected', 'in transit'];
const OrderPriorities = ['high', 'medium', 'low'];
const ApprovalStatuses = ['in review', 'approved', 'disapproved'];
const ApprovalTypes = ['show progress', 'task completed'];
const UsageTypes = ['used', 'wasted', 'transfer'];

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
    MaterialCategories,
    Units,
    CountryCodes,
    Roles,
    Languages,
    ProjectCurrencies,
    SiteTypes,
    FloorTypes,
    SiteStatuses,
};
