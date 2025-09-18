import {home, mental, medical} from '../utils/Icons'
export const menuItems = [
    {
        id: 1,
        title: 'Home',
        icon: home,
        link: '/dashboard',
    },
    {
        id: 2,
        title: "Symptom Analysis",
        icon: medical,
        link: "/SymptomAnalysis",
    },
    {   
        id: 3,
        title: "Mind-Bot",
        icon: mental,
        link: '/MentalWellness',
    },
    {
        id: 4,
        title: "Find Doctor",
        icon: medical,
        link: '/FindDoctor',
    },
    {
        id: 6,
        title: "Mind Check",
        icon: mental,
        link: '/MindCheck',
    },
    
    {
        id: 9,
        title: "Coach Suite",
        icon: medical,
        link: '/CoachSuite',
    }
]