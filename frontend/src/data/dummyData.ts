export const services = [
  {
    id: 1,
    name: "Haircut",
    price: 1500,
    duration: 30,
  },
  {
    id: 2,
    name: "Hair Coloring",
    price: 5000,
    duration: 60,
  },
  {
    id: 3,
    name: "Hair Treatment",
    price: 3500,
    duration: 45,
  },
  {
    id: 4,
    name: "Facial",
    price: 3000,
    duration: 45,
  },
];

export const staffList = [
  {
    id: 1,
    name: "Anu",
    experience: "5 years experience",
    services: [1, 2],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    bookedSlots: [
      { date: "2026-05-20", time: "10:00" },
      { date: "2026-05-21", time: "14:00" },
    ],
  },
  {
    id: 2,
    name: "Nimali",
    experience: "4 years experience",
    services: [1, 3, 4],
    workingDays: ["Monday", "Wednesday", "Friday"],
    bookedSlots: [{ date: "2026-05-20", time: "09:00" }],
  },
  {
    id: 3,
    name: "Kasun",
    experience: "3 years experience",
    services: [2, 3],
    workingDays: ["Tuesday", "Thursday", "Saturday"],
    bookedSlots: [],
  },
];

export const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];