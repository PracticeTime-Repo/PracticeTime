import firebaseServices from "../firebase/firebaseSetup"; // your firebase config
const { db, ref, set, push, remove, get, child } = firebaseServices;

const gradeTopics = [
  {
    id: 1,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Number System",
    topic_description:
      "Introduction to numbers and understanding their values and sequences.",
    subtopic_description:
      "Covers counting, comparing, place value, and basic number sense.",
  },
  {
    id: 2,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Operations (Addition, Subtraction ...)",
    topic_description:
      "Learning to use basic operations to solve simple mathematical problems.",
    subtopic_description:
      "Focus on understanding and applying addition and subtraction in real-life contexts.",
  },
  {
    id: 3,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Shapes and Geometry",
    topic_description:
      "Understanding the properties of 2D and 3D shapes and their spatial relationships.",
    subtopic_description:
      "Identifying shapes, symmetry, and position through visual and hands‑on activities.",
  },
  {
    id: 4,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Measurement",
    topic_description:
      "Measuring and comparing objects using different units and tools.",
    subtopic_description:
      "Explores length, weight, time, and volume through practical examples.",
  },
  {
    id: 5,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Data Handling",
    topic_description:
      "Collecting, organizing, and interpreting simple sets of data.",
    subtopic_description:
      "Using pictographs, bar charts, and tally marks to represent and understand data.",
  },
  {
    id: 6,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Maths Puzzles",
    topic_description:
      "Enhancing logical thinking through fun and challenging math problems.",
    subtopic_description:
      "Includes number patterns, missing numbers, and simple logic puzzles.",
  },
  {
    id: 7,
    grade: "Grade 1",
    topic: "Maths",
    subtopic: "Real Life all concept sums",
    topic_description:
      "Applying math concepts to everyday situations to enhance problem‑solving skills.",
    subtopic_description:
      "Solving word problems and scenarios based on real‑world applications.",
  },
];

const insertTopicsToFirebase = async () => {
  try {
    const topicsRef = ref(db, "grade_topics");

    // Remove all existing records
    await remove(topicsRef);

    // Insert only once
    for (const topic of gradeTopics) {
      const newRef = push(topicsRef);
      await set(newRef, topic);
    }

    console.log("Deleted old data and inserted new topics successfully");
  } catch (error) {
    console.error("Error resetting and inserting data:", error);
  }
};

export default insertTopicsToFirebase();
