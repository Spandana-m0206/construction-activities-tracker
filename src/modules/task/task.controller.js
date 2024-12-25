const BaseController = require('../base/BaseController');
const TaskService = require('./task.service');

class TaskController extends BaseController {
    constructor() {
        super(TaskService); // Pass TaskService to the BaseController
    }

    // Custom controller method: get tasks by site
    async getTasksBySite(req, res, next) {
        try {
            const tasks = await this.service.findTasksBySite(req.params.siteId);
            return res.status(200).json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    }

    // Custom controller method: process a task (parallel or sequential)
    // async processTask(req, res, next) {
    //     try {
    //         const taskId = req.params.id;
    //         const processed = await this.service.processTask(taskId);
    //         return res.status(200).json({ success: true, data: processed });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // New method: Import tasks from JSON
    async importTasks(req, res, next) {
        try {
        const jsonData=  {
                "organization": {
                    "name": "ABC Construction Pvt Ltd",
                    "email": "contact@abcconstruction.com",
                    "admin": "6765c1194e43c3d3737312ba",
                    "address": "123 Main Street, Cityville, Country"
                },
                "sites": [
                    {
                        "name": "Site A",
                        "location": "Cityville - Zone 1",
                        "startDate": "2024-01-01",
                        "endDate": "2024-12-31",
                        "projectCurrency": "USD",
                        "projectValue": 5000000,
                        "type": "3BHK",
                        "level": 3,
                        "floors": 10,
                        "basements": 2,
                        "balcony": 20,
                        "washroom": 30,
                        "storeReq": true,
                        "parkingReq": true,
                        "floorType": "standard",
                        "supervisor": "6765c1194e43c3d3737312ba",
                        "org": "6765c17f4e43c3d3737312bd",
                        "status": "in progress",
                        "tasks": [
                            {
                                "title": "Foundation Work",
                                "description": "Excavation and foundation preparation.",
                                "startDate": "2024-01-01",
                                "endDate": "2024-01-31",
                                "status": "in progress",
                                "progressPercentage": 40,
                                "isSystemGenerated": false,
                                "assignedTo": [
                                    "6765c1194e43c3d3737312ba"
                                ],
                                "priority": "High",
                                "createdBy": "6765c1194e43c3d3737312ba",
                                "attachments": [],
                                "changeHistory": [],
                                "type": "materials",
                                "raisedByDept": "Inventory",
                                "raisedToDept": "Finance",
                                "penalty": null,
                                "isParallel": true,
                                "subtasks": [
                                    {
                                        "title": "Excavation",
                                        "description": "Digging trenches as per blueprint.",
                                        "startDate": "2024-01-01",
                                        "endDate": "2024-01-15",
                                        "status": "closed",
                                        "progressPercentage": 100,
                                        "isSystemGenerated": false,
                                        "assignedTo": [
                                            "6765c1194e43c3d3737312ba"
                                        ],
                                        "priority": "Medium",
                                        "createdBy": "6765c1194e43c3d3737312ba",
                                        "attachments": [],
                                        "changeHistory": [],
                                        "type": "materials",
                                        "raisedByDept": "Inventory",
                                        "raisedToDept": "Finance",
                                        "penalty": null,
                                        "isParallel": false
                                    },
                                    {
                                        "title": "Foundation Preparation",
                                        "description": "Laying foundation base and compacting soil.",
                                        "startDate": "2024-01-16",
                                        "endDate": "2024-01-31",
                                        "status": "waiting",
                                        "progressPercentage": 0,
                                        "isSystemGenerated": false,
                                        "assignedTo": [
                                            "6765c1194e43c3d3737312ba"
                                        ],
                                        "priority": "High",
                                        "createdBy": "6765c1194e43c3d3737312ba",
                                        "attachments": [],
                                        "changeHistory": [],
                                        "type": "plumbing",
                                        "raisedByDept": "Inventory",
                                        "raisedToDept": "Finance",
                                        "penalty": null,
                                        "isParallel": false
                                    }
                                ]
                            },
                            {
                                "title": "Structural Work",
                                "description": "Erecting columns and beams.",
                                "startDate": "2024-02-01",
                                "endDate": "2024-03-31",
                                "status": "open",
                                "progressPercentage": 0,
                                "isSystemGenerated": false,
                                "assignedTo": [
                                    "6765c1194e43c3d3737312ba"
                                ],
                                "priority": "High",
                                "createdBy": "6765c1194e43c3d3737312ba",
                                "attachments": [],
                                "changeHistory": [],
                                "type": "Payment",
                                "raisedByDept": "Finance",
                                "raisedToDept": "Sales",
                                "penalty": null,
                                "isParallel": false
                            },
                            {
                                "title": "Roofing Work",
                                "description": "Installing roofing structures.",
                                "startDate": "2024-04-01",
                                "endDate": "2024-04-30",
                                "status": "waiting",
                                "progressPercentage": 0,
                                "isSystemGenerated": false,
                                "assignedTo": [
                                    "6765c1194e43c3d3737312ba"
                                ],
                                "priority": "Medium",
                                "createdBy": "6765c1194e43c3d3737312ba",
                                "attachments": [],
                                "changeHistory": [],
                                "type": "materials",
                                "raisedByDept": "Sales",
                                "raisedToDept": "Inventory",
                                "penalty": null,
                                "isParallel": false
                            }
                        ]
                    }
                ]
            }
            const importedData = await this.service.importTasks(jsonData);
            return res.status(201).json({ success: true, data: importedData });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
