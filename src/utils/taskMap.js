// utils/taskMap.js

const taskMap = {
    "1": {
        "id": 1,
        "title": "Step 1: Land Inspection",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "duration":2,

        "triggerCondition": {},
        "nextTasks": [
            2
        ],
        "raisedToDept": "Site"
    },
    "2": {
        "id": 2,
        "title": "Choose Type of Land",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {},
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "3": {
        "id": 3,
        "title": "Raw Land",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Raw"
        },
        "nextTasks": [8],
        "raisedToDept": "Site"
    },
    "4": {
        "id": 4,
        "title": "Constructed Land",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [6],
        "raisedToDept": "Site"
    },
    "6": {
        "id": 6,
        "title": "Initiate Demolition",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": "Constructed",
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [8],
        "raisedToDept": "Site"
    },
    "5": {
        "id": 5,
        "title": "Water-Filled Land",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Water"
        },
        "nextTasks": [
            7
        ],
        "raisedToDept": "Site"
    },
    "7": {
        "id": 7,
        "title": "Drain Water",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": "Water",
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Water"
        },
        "nextTasks": [8],
        "raisedToDept": "Site"
    },
    "8": {
        "id": 8,
        "title": "Remove Unwanted Objects",
        "parentTask": null,
        "subtasks": [],
        "isParallel": true,
        "trigger": "ONE_TIME",
        "triggerCondition": {},
        "nextTasks": [
            9,10
        ],
        "raisedToDept": "Site"
    },
    "9": {
        "id": 9,
        "title": "Provision of water & electricity supply",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {},
        "nextTasks": [11],
        "raisedToDept": "Site"
    },
    "10": {
        "id": 10,
        "title": "Initiate Soil inspection",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {},
        "nextTasks": [11],
        "raisedToDept": "Site"
    },
    "11": {
        "id": 11,
        "title": "Proceed to Step 2",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "trigger": "ONE_TIME",
        "triggerCondition": {},
        "nextTasks": [
            18
        ],
        "raisedToDept": "Site"
    },
    "18": {
        "id": 18,
        "title": "Step 2 Foundation",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [
            200
        ],
        "raisedToDept": "Site"
    },


    "200": {
        "id": 200,
        "title": "Pre-Foundation",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [
            19
        ],
        "raisedToDept": "Site"
    },
    "19": {
        "id": 19,
        "title": "Marking",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            40,
            41,
            42,
            43
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [
            20
        ],
        "raisedToDept": "Site"
    },
    "40": {
        "id": 40,
        "title": "Marking Centerline",
        "parentTask": 19,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "markingStatus": "Pending"
        },
        "nextTasks": [41],
        "raisedToDept": "Site"
    },
    "41": {
        "id": 41,
        "title": "Pit Excavation",
        "parentTask": 19,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "excavationDepth": "10m"
        },
        "nextTasks": [42],
        "raisedToDept": "Site"
    },
    "42": {
        "id": 42,
        "title": "Steel Cage Insertion",
        "parentTask": 19,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "cageType": "Standard"
        },
        "nextTasks": [43],
        "raisedToDept": "Site"
    },
    "43": {
        "id": 43,
        "title": "Boring",
        "parentTask": 19,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "boringDepth": "15m"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "20": {
        "id": 20,
        "title": "Excavation",
        "parentTask": null,
        "duration": 1,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed",
            "frequency": "Monthly"
        },
        "nextTasks": [
            21
        ],
        "raisedToDept": "Site"
    },
    "21": {
        "id": 21,
        "title": "Foundation Construction",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "foundationStatus": "Weak"
        },
        "nextTasks": [
            22
        ],
        "raisedToDept": "Site"
    },
    "22": {
        "id": 22,
        "title": "Footing",
        "parentTask": null,
        "duration": 8,
        "subtasks": [
            44,
            45,
            46,
            47,
            48,
            49,
            50,
            51
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [
            23
        ],
        "raisedToDept": "Site"
    },
    "44": {
        "id": 44,
        "title": "Upload # of Columns",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "columnsUploaded": "False"
        },
        "nextTasks": [
            45
        ],
        "raisedToDept": "Site"
    },
    "45": {
        "id": 45,
        "title": "Upload Column Marking Image",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "imageUploaded": "False"
        },
        "nextTasks": [
            46
        ],
        "raisedToDept": "Site"
    },
    "46": {
        "id": 46,
        "title": "Column Position Marking",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "markingStatus": "Pending"
        },
        "nextTasks": [
            47
        ],
        "raisedToDept": "Site"
    },
    "47": {
        "id": 47,
        "title": "Footing Mesh Deployment",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "meshType": "Standard"
        },
        "nextTasks": [
            48
        ],
        "raisedToDept": "Site"
    },
    "48": {
        "id": 48,
        "title": "Formwork / Reinforcement",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "reinforcementStatus": "Pending"
        },
        "nextTasks": [
            49
        ],
        "raisedToDept": "Site"
    },
    "49": {
        "id": 49,
        "title": "RCC of Footing",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "rccQuality": "Good"
        },
        "nextTasks": [
            50
        ],
        "raisedToDept": "Site"
    },
    "50": {
        "id": 50,
        "title": "Remove Air Bubbles",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "airBubbleStatus": "Pending"
        },
        "nextTasks": [
            51
        ],
        "raisedToDept": "Site"
    },
    "51": {
        "id": 51,
        "title": "Remove Formwork / Reinforcement",
        "parentTask": 22,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "formworkStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "23": {
        "id": 23,
        "title": "Neck Column",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            52,
            53,
            54,
            202
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "columnType": "Standard"
        },
        "nextTasks": [
            24
        ],
        "raisedToDept": "Site"
    },
    "52": {
        "id": 52,
        "title": "Reinforcement / Formwork",
        "parentTask": 23,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "reinforcementStatus": "Pending"
        },
        "nextTasks": [
            53
        ],
        "raisedToDept": "Site"
    },
    "53": {
        "id": 53,
        "title": "RCC Pouring",
        "parentTask": 23,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "pouringStatus": "Completed"
        },
        "nextTasks": [
            54
        ],
        "raisedToDept": "Site"
    },
    "54": {
        "id": 54,
        "title": "Air Bubble Removal",
        "parentTask": 23,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {},
        "nextTasks": [
            202
        ],
        "raisedToDept": "Site"
    },
    "202": {
        "id": 202,
        "title": "Removal Formwork",
        "parentTask": 23,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "shutteringRemovalStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "24": {
        "id": 24,
        "title": "Foundation Wall",
        "parentTask": null,
        "duration": 5,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed"
        },
        "nextTasks": [
            25
        ],
        "raisedToDept": "Site"
    },
    "25": {
        "id": 25,
        "title": "Backfilling of Land",
        "parentTask": null,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "landType": "Constructed",
            "frequency": "Weekly"
        },
        "nextTasks": [
            26
        ],
        "raisedToDept": "Site"
    },
    "26": {
        "id": 26,
        "title": "Tie Beam",
        "parentTask": null,
        "duration": 1,
        "subtasks": [
            55,
            56,
            57,
            201
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "tieBeamType": "Standard"
        },
        "nextTasks": [
            27
        ],
        "raisedToDept": "Site"
    },
    "55": {
        "id": 55,
        "title": "PCC Bed",
        "parentTask": 26,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "pccStatus": "Pending"
        },
        "nextTasks": [
            56
        ],
        "raisedToDept": "Site"
    },
    "56": {
        "id": 56,
        "title": "Steel Reinforcement",
        "parentTask": 26,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "reinforcementType": "Standard"
        },
        "nextTasks": [
            57
        ],
        "raisedToDept": "Site"
    },
    "57": {
        "id": 57,
        "title": "Formwork",
        "parentTask": 26,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "formworkStatus": "Pending"
        },
        "nextTasks": [
            201
        ],
        "raisedToDept": "Site"
    },
    "201": {
        "id": 201,
        "title": "RCC Work of Plinthbeam",
        "parentTask": 26,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "formworkStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },



    "27": {
        "id": 27,
        "title": "Walls Work",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "wallType": "Brick"
        },
        "nextTasks": [
            58
        ],
        "raisedToDept": "Site"
    },
    "58": {
        "id": 58,
        "title": "Wall Marking (Ranged According to Map)",
        "parentTask": null,
        "duration": 1,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "markingStatus": "Pending"
        },
        "nextTasks": [59],
        "raisedToDept": "Site"
    },
    "59": {
        "id": 59,
        "title": "Column Erection",
        "parentTask": null,
        "duration": 1,
        "subtasks": [
            60
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "erectionStatus": "Completed"
        },
        "nextTasks": [28],
        "raisedToDept": "Site"
    },
    "60": {
        "id": 60,
        "title": "Ring Position Verification of Column Number",
        "parentTask": 59,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "verificationStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "28": {
        "id": 28,
        "title": "Column Casting",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            61,
            62,
            63,
            64,
            65,
            66
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "columnHeight": "10m"
        },
        "nextTasks": [
            29
        ],
        "raisedToDept": "Site"
    },
    "61": {
        "id": 61,
        "title": "Reinforcement",
        "parentTask": 28,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "reinforcementStatus": "Pending"
        },
        "nextTasks": [
            62
        ],
        "raisedToDept": "Site"
    },
    "62": {
        "id": 62,
        "title": "Mixing Ratio",
        "parentTask": 28,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "mixingRatioStatus": "Completed"
        },
        "nextTasks": [
            63
        ],
        "raisedToDept": "Site"
    },
    "63": {
        "id": 63,
        "title": "RCC",
        "parentTask": 28,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "rccStatus": "Pending"
        },
        "nextTasks": [
            64
        ],
        "raisedToDept": "Site"
    },
    "64": {
        "id": 64,
        "title": "Air Bubble Removal",
        "parentTask": 28,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "bubbleStatus": "Present"
        },
        "nextTasks": [
            65
        ],
        "raisedToDept": "Site"
    },
    "65": {
        "id": 65,
        "title": "Removal of Reinforcement",
        "parentTask": 28,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "removalStatus": "Completed"
        },
        "nextTasks": [
            66
        ],
        "raisedToDept": "Site"
    },
    "66": {
        "id": 66,
        "title": "Height of Column Verification",
        "parentTask": 28,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "heightStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "29": {
        "id": 29,
        "title": "5 ft Wall Work",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            67
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "wallHeight": "5ft"
        },
        "nextTasks": [
            30,31,32
        ],
        "raisedToDept": "Site"
    },
    "67": {
        "id": 67,
        "title": "Mixing Ratio 6:1 Subtask",
        "parentTask": 29,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "ratioStatus": "Pending"
        },
        "nextTasks": [
            
        ],
        "raisedToDept": "Site"
    },
    "30": {
        "id": 30,
        "title": "Above 5 ft Wall",
        "duration": 2,
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "wallHeight": ">5ft",
            "frequency": "Monthly"
        },
        "nextTasks": [33],
        "raisedToDept": "Site"
    },
    "31": {
        "id": 31,
        "title": "Chajja / Frame Work",
        "parentTask": null,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "frameType": "Chajja"
        },
        "nextTasks": [33],
        "raisedToDept": "Site"
    },
    "32": {
        "id": 32,
        "title": "Staircase",
        "parentTask": null,
        "subtasks": [
            68,
            69,
            70,
            71
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "stairsType": "Standard"
        },
        "nextTasks": [33],
        "raisedToDept": "Site"
    },
    "68": {
        "id": 68,
        "title": "Shuttering",
        "parentTask": 32,
        "duration": 1,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "shutteringStatus": "Completed"
        },
        "nextTasks": [
            69
        ],
        "raisedToDept": "Site"
    },
    "69": {
        "id": 69,
        "title": "RCC",
        "parentTask": 32,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "rccStatus": "Pending"
        },
        "nextTasks": [
            70
        ],
        "raisedToDept": "Site"
    },
    "70": {
        "id": 70,
        "title": "Air Bubble Removal",
        "parentTask": 32,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "bubbleStatus": "Present"
        },
        "nextTasks": [
            71
        ],
        "raisedToDept": "Site"
    },
    "71": {
        "id": 71,
        "title": "Removal of Shuttering",
        "parentTask": 32,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "removalStatus": "Completed"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "33": {
        "id": 33,
        "title": "Shuttering",
        "parentTask": null,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "shutteringType": "Standard"
        },
        "nextTasks": [
            34
        ],
        "raisedToDept": "Site"
    },
    "34": {
        "id": 34,
        "title": "Pre-Slab Casting",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            72,
            73,
            74
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "castingType": "Pre-Slab"
        },
        "nextTasks": [
            35
        ],
        "raisedToDept": "Site"
    },
    "72": {
        "id": 72,
        "title": "Steel Staging",
        "parentTask": 34,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "stagingStatus": "Pending"
        },
        "nextTasks": [
            73
        ],
        "raisedToDept": "Site"
    },
    "73": {
        "id": 73,
        "title": "Plumber Fitting",
        "parentTask": 34,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "fittingStatus": "Pending"
        },
        "nextTasks": [
            74
        ],
        "raisedToDept": "Site"
    },
    "74": {
        "id": 74,
        "title": "Electrical Fitting",
        "parentTask": 34,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "fittingStatus": "Completed"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "35": {
        "id": 35,
        "title": "Slab Casting",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            75,
            76,
            77
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "castingType": "Slab"
        },
        "nextTasks": [
            36
        ],
        "raisedToDept": "Site"
    },
    "75": {
        "id": 75,
        "title": "Mixing",
        "parentTask": 35,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "mixingStatus": "Pending"
        },
        "nextTasks": [
            76
        ],
        "raisedToDept": "Site"
    },
    "76": {
        "id": 76,
        "title": "Vibration",
        "parentTask": 35,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "vibrationStatus": "Pending"
        },
        "nextTasks": [
            77
        ],
        "raisedToDept": "Site"
    },
    "77": {
        "id": 77,
        "title": "Lenter Presence",
        "parentTask": 35,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "lenterStatus": "Completed"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },

    "36": {
        "id": 36,
        "title": "De Shuttering",
        "parentTask": null,
        "subtasks": [],
        "isParallel": true,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "shutteringRemoval": "Complete"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    }, 

    "127": {
        "id": 127,
        "title": "Floor Work",
        "parentTask": null,
        "subtasks": [

        ],
        "isParallel": true,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "wallWorkStatus": "Ongoing"
        },
        "nextTasks": [
            118,
            129
        ],
        "raisedToDept": "Site"
    },
    "118": {
        "id": 118,
        "title": "Electrical Points",
        "parentTask": null,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "pointStatus": "Pending"
        },
        "nextTasks": [130],
        "raisedToDept": "Site"
    },
    "129": {
        "id": 129,
        "title": "Plumbing Work",
        "parentTask": null,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "plumbingStatus": "Completed"
        },
        "nextTasks": [130],
        "raisedToDept": "Site"
    },
    "130": {
        "id": 130,
        "title": "Wall Plaster",
        "parentTask": null,
        "duration": 4,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "plasterStatus": "Pending"
        },
        "nextTasks": [
            131
        ],
        "raisedToDept": "Site"
    },
    "131": {
        "id": 131,
        "title": "Floor Levelling",
        "parentTask": null,
        "duration": 1,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "levellingStatus": "Pending"
        },
        "nextTasks": [
            132
        ],
        "raisedToDept": "Site"
    },
    "132": {
        "id": 132,
        "title": "Flooring",
        "parentTask": null,
        "duration": 4,
        "subtasks": [
            128
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "flooringStatus": "Completed"
        },
        "nextTasks": [
            133
        ],
        "raisedToDept": "Site"
    },
    "128": {
        "id": 128,
        "title": "Marble Tiles",
        "parentTask": 132,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "tilesStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "133": {
        "id": 133,
        "title": "False Ceiling",
        "parentTask": null,
        "duration": 7,
        "subtasks": [
            135,
            136,
            137
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "ceilingStatus": "Pending"
        },
        "nextTasks": [
            95, 96, 97
        ],
        "raisedToDept": "Site"
    },
    "135": {
        "id": 135,
        "title": "Framing",
        "parentTask": 133,
        "subtasks": [
        
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "framingStatus": "Completed"
        },
        "nextTasks": [
            136
        ],
        "raisedToDept": "Site"
    },
    "136": {
        "id": 136,
        "title": "Lighting",
        "parentTask": 133,
        "subtasks": [
            
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "lightingStatus": "Pending"
        },
        "nextTasks": [
            137
        ],
        "raisedToDept": "Site"
    },
    "137": {
        "id": 137,
        "title": "POP",
        "parentTask": 133,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "popStatus": "Completed"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "95": {
        "id": 95,
        "title": "Electrical Wiring",
        "parentTask": null,
        "duration": 2,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "wiringStatus": "Completed"
        },
        "nextTasks": [
            98
        ],
        "raisedToDept": "Site"
    },
    "96": {
        "id": 96,
        "title": "Carpenter",
        "parentTask": null,
        "duration": 10,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "carpentryStatus": "Pending"
        },
        "nextTasks": [
            98
        ],
        "raisedToDept": "Site"
    },
    "97": {
        "id": 97,
        "title": "Paint Work",
        "parentTask": null,
        "duration": 10,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "paintStatus": "Pending"
        },
        "nextTasks": [98],
        "raisedToDept": "Site"
    },
    "98": {
        "id": 98,
        "title": "Finishing",
        "parentTask": null,
        "duration": 2,
        "subtasks": [
            99
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "finishingStatus": "Completed"
        },
        "nextTasks": [100],
        "raisedToDept": "Site"
    },
    "99": {
        "id": 99,
        "title": "Bath Works",
        "parentTask": 98,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "bathWorkStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "100": {
        "id": 100,
        "title": "Interior Work",
        "parentTask": null,
        "subtasks": [
        
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "interiorStatus": "Ongoing"
        },
        "nextTasks": [
            101
        ],
        "raisedToDept": "Site"
    },
    "101": {
        "id": 101,
        "title": "Upload Progress Image",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "imageUploadStatus": "Pending"
        },
        "nextTasks": [
            102
        ],
        "raisedToDept": "Site"
    },
    "102": {
        "id": 102,
        "title": "Upload Final Image",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME_FOR_EVERY_LEVEL",
        "triggerCondition": {
            "finalImageUploadStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },

    "91": {
        "id": 91,
        "duration": 2,
        "title": "Parafit work",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "parapetType": "Standard"
        },
        "nextTasks": [
            93
        ],
        "raisedToDept": "Site"
    },
    "92": {
        "id": 92,
        "title": "Front elevation",
        "duration": 16,
        "parentTask": null,
        "subtasks": [
            113,
            114,
            115,
            116
        ],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "elevationType": "Front"
        },
        "nextTasks": [
            93
        ],
        "raisedToDept": "Site"
    },
    "113": {
        "id": 113,
        "title": "Outer plaster",
        "parentTask": 92,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "plasterStatus": "Completed"
        },
        "nextTasks": [
            114
        ],
        "raisedToDept": "Site"
    },
    "114": {
        "id": 114,
        "title": "Front tiles",
        "parentTask": 92,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "tileStatus": "Pending"
        },
        "nextTasks": [
            115
        ],
        "raisedToDept": "Site"
    },
    "115": {
        "id": 115,
        "title": "Balcony work",
        "parentTask": 92,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "balconyStatus": "Pending"
        },
        "nextTasks": [
            116
        ],
        "raisedToDept": "Site"
    },
    "116": {
        "id": 116,
        "title": "Railing",
        "parentTask": 92,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "railingStatus": "Completed"
        },
        "nextTasks": [],
        "raisedToDept": "Site"
    },
    "93": {
        "id": 93,
        "title": "Ground Floor flooring",
        "parentTask": null,
        "duration": 5,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "flooringStatus": "Pending"
        },
        "nextTasks": [
            117
        ],
        "raisedToDept": "Site"
    },
    "117": {
        "id": 117,
        "title": "to sales",
        "parentTask": null,
        "subtasks": [],
        "isParallel": false,
        "landType": null,
        "trigger": "ONE_TIME",
        "triggerCondition": {
            "insideStatus": "Pending"
        },
        "nextTasks": [],
        "raisedToDept": "Sales"
    }
}

const TaskIDs = {
    ROOT_IDS : [1],
    DE_SHUTTERING_ORIG_ID: 36,
    WALLS_ORIG_ID: 27,
    FLOOR_WORK_ORIG_ID: 127,
    ROOF_TASK_IDS: [91, 92],
    CHOOSE_TYPE_OF_LAND: 2,
    LAND_TYPES: {
        RAW: 3,
        CONSTRUCTED: 4,
        WATER: 5,
    },
};

const Triggers = {
    ONE_TIME: "ONE_TIME",
    ONE_TIME_FOR_EVERY_LEVEL: "ONE_TIME_FOR_EVERY_LEVEL"
}

module.exports = {taskMap, TaskIDs, Triggers};
  