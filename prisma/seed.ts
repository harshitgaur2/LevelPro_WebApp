import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { CourseEnrollmentStatus, NotificationType, PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Question = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  slug: string;
};

type ModuleSeed = {
  section: string;
  title: string;
  lectureCount: number;
  questions: Question[];
};

const leetcode = (slug: string) => `https://leetcode.com/problems/${slug}/`;

const javaDsaModules: ModuleSeed[] = [
  {
    section: "Basics",
    title: "Getting Started: Input, Loops, Conditions, Data Types",
    lectureCount: 1,
    questions: [
      { title: "Two Sum", difficulty: "Easy", slug: "two-sum" },
      { title: "Fizz Buzz", difficulty: "Easy", slug: "fizz-buzz" },
      { title: "Palindrome Number", difficulty: "Easy", slug: "palindrome-number" },
      { title: "Roman to Integer", difficulty: "Easy", slug: "roman-to-integer" },
      { title: "Plus One", difficulty: "Easy", slug: "plus-one" },
      { title: "Sqrt(x)", difficulty: "Easy", slug: "sqrtx" },
      { title: "Length of Last Word", difficulty: "Easy", slug: "length-of-last-word" },
      { title: "Valid Palindrome", difficulty: "Easy", slug: "valid-palindrome" },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "merge-two-sorted-lists" },
      { title: "Remove Duplicates from Sorted Array", difficulty: "Easy", slug: "remove-duplicates-from-sorted-array" },
    ],
  },
  {
    section: "Basics",
    title: "Patterns",
    lectureCount: 2,
    questions: [
      { title: "Pascal's Triangle", difficulty: "Easy", slug: "pascals-triangle" },
      { title: "Pascal's Triangle II", difficulty: "Easy", slug: "pascals-triangle-ii" },
      { title: "Spiral Matrix", difficulty: "Medium", slug: "spiral-matrix" },
      { title: "Spiral Matrix II", difficulty: "Medium", slug: "spiral-matrix-ii" },
      { title: "Rotate Image", difficulty: "Medium", slug: "rotate-image" },
      { title: "Matrix Diagonal Sum", difficulty: "Easy", slug: "matrix-diagonal-sum" },
      { title: "Set Matrix Zeroes", difficulty: "Medium", slug: "set-matrix-zeroes" },
      { title: "Reshape the Matrix", difficulty: "Easy", slug: "reshape-the-matrix" },
      { title: "Transpose Matrix", difficulty: "Easy", slug: "transpose-matrix" },
      { title: "Toeplitz Matrix", difficulty: "Easy", slug: "toeplitz-matrix" },
    ],
  },
  {
    section: "Basics",
    title: "Number System",
    lectureCount: 1,
    questions: [
      { title: "Number of 1 Bits", difficulty: "Easy", slug: "number-of-1-bits" },
      { title: "Power of Two", difficulty: "Easy", slug: "power-of-two" },
      { title: "Power of Three", difficulty: "Easy", slug: "power-of-three" },
      { title: "Counting Bits", difficulty: "Easy", slug: "counting-bits" },
      { title: "Reverse Bits", difficulty: "Easy", slug: "reverse-bits" },
      { title: "Single Number", difficulty: "Easy", slug: "single-number" },
      { title: "Missing Number", difficulty: "Easy", slug: "missing-number" },
      { title: "Add Binary", difficulty: "Easy", slug: "add-binary" },
      { title: "Sum of Two Integers", difficulty: "Medium", slug: "sum-of-two-integers" },
      { title: "Bitwise AND of Numbers Range", difficulty: "Medium", slug: "bitwise-and-of-numbers-range" },
    ],
  },
  {
    section: "Basics",
    title: "Arrays and Functions",
    lectureCount: 2,
    questions: [
      { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", slug: "best-time-to-buy-and-sell-stock" },
      { title: "Maximum Subarray", difficulty: "Medium", slug: "maximum-subarray" },
      { title: "Contains Duplicate", difficulty: "Easy", slug: "contains-duplicate" },
      { title: "Product of Array Except Self", difficulty: "Medium", slug: "product-of-array-except-self" },
      { title: "Majority Element", difficulty: "Easy", slug: "majority-element" },
      { title: "Move Zeroes", difficulty: "Easy", slug: "move-zeroes" },
      { title: "Rotate Array", difficulty: "Medium", slug: "rotate-array" },
      { title: "Intersection of Two Arrays", difficulty: "Easy", slug: "intersection-of-two-arrays" },
      { title: "Find All Numbers Disappeared in an Array", difficulty: "Easy", slug: "find-all-numbers-disappeared-in-an-array" },
      { title: "Subarray Sum Equals K", difficulty: "Medium", slug: "subarray-sum-equals-k" },
    ],
  },
  {
    section: "Basics",
    title: "2D Arrays",
    lectureCount: 2,
    questions: [
      { title: "Search a 2D Matrix", difficulty: "Medium", slug: "search-a-2d-matrix" },
      { title: "Search a 2D Matrix II", difficulty: "Medium", slug: "search-a-2d-matrix-ii" },
      { title: "Spiral Matrix", difficulty: "Medium", slug: "spiral-matrix" },
      { title: "Rotate Image", difficulty: "Medium", slug: "rotate-image" },
      { title: "Set Matrix Zeroes", difficulty: "Medium", slug: "set-matrix-zeroes" },
      { title: "Matrix Diagonal Sum", difficulty: "Easy", slug: "matrix-diagonal-sum" },
      { title: "Transpose Matrix", difficulty: "Easy", slug: "transpose-matrix" },
      { title: "Lucky Numbers in a Matrix", difficulty: "Easy", slug: "lucky-numbers-in-a-matrix" },
      { title: "Count Negative Numbers in a Sorted Matrix", difficulty: "Easy", slug: "count-negative-numbers-in-a-sorted-matrix" },
      { title: "Reshape the Matrix", difficulty: "Easy", slug: "reshape-the-matrix" },
    ],
  },
  {
    section: "Basics",
    title: "Strings",
    lectureCount: 1,
    questions: [
      { title: "Valid Anagram", difficulty: "Easy", slug: "valid-anagram" },
      { title: "Longest Common Prefix", difficulty: "Easy", slug: "longest-common-prefix" },
      { title: "Reverse String", difficulty: "Easy", slug: "reverse-string" },
      { title: "First Unique Character in a String", difficulty: "Easy", slug: "first-unique-character-in-a-string" },
      { title: "Valid Palindrome", difficulty: "Easy", slug: "valid-palindrome" },
      { title: "Find the Index of the First Occurrence in a String", difficulty: "Easy", slug: "find-the-index-of-the-first-occurrence-in-a-string" },
      { title: "String to Integer (atoi)", difficulty: "Medium", slug: "string-to-integer-atoi" },
      { title: "Group Anagrams", difficulty: "Medium", slug: "group-anagrams" },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "longest-substring-without-repeating-characters" },
      { title: "Longest Palindromic Substring", difficulty: "Medium", slug: "longest-palindromic-substring" },
    ],
  },
  {
    section: "Basics",
    title: "ArrayList & String Builder",
    lectureCount: 1,
    questions: [
      { title: "Add to Array-Form of Integer", difficulty: "Easy", slug: "add-to-array-form-of-integer" },
      { title: "Summary Ranges", difficulty: "Easy", slug: "summary-ranges" },
      { title: "Merge Intervals", difficulty: "Medium", slug: "merge-intervals" },
      { title: "Insert Interval", difficulty: "Medium", slug: "insert-interval" },
      { title: "Find All Duplicates in an Array", difficulty: "Medium", slug: "find-all-duplicates-in-an-array" },
      { title: "Partition Labels", difficulty: "Medium", slug: "partition-labels" },
      { title: "Text Justification", difficulty: "Hard", slug: "text-justification" },
      { title: "Zigzag Conversion", difficulty: "Medium", slug: "zigzag-conversion" },
      { title: "Simplify Path", difficulty: "Medium", slug: "simplify-path" },
      { title: "String Compression", difficulty: "Medium", slug: "string-compression" },
    ],
  },
  {
    section: "Recursion",
    title: "Recursion",
    lectureCount: 4,
    questions: [
      { title: "Climbing Stairs", difficulty: "Easy", slug: "climbing-stairs" },
      { title: "Pow(x, n)", difficulty: "Medium", slug: "powx-n" },
      { title: "Subsets", difficulty: "Medium", slug: "subsets" },
      { title: "Permutations", difficulty: "Medium", slug: "permutations" },
      { title: "Combination Sum", difficulty: "Medium", slug: "combination-sum" },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "letter-combinations-of-a-phone-number" },
      { title: "Generate Parentheses", difficulty: "Medium", slug: "generate-parentheses" },
      { title: "N-Queens", difficulty: "Hard", slug: "n-queens" },
      { title: "K-th Symbol in Grammar", difficulty: "Medium", slug: "k-th-symbol-in-grammar" },
      { title: "Reverse Linked List", difficulty: "Easy", slug: "reverse-linked-list" },
    ],
  },
  {
    section: "Recursion",
    title: "Time & Space Complexity",
    lectureCount: 2,
    questions: [
      { title: "Binary Search", difficulty: "Easy", slug: "binary-search" },
      { title: "First Bad Version", difficulty: "Easy", slug: "first-bad-version" },
      { title: "Search Insert Position", difficulty: "Easy", slug: "search-insert-position" },
      { title: "Valid Perfect Square", difficulty: "Easy", slug: "valid-perfect-square" },
      { title: "Find Peak Element", difficulty: "Medium", slug: "find-peak-element" },
      { title: "Guess Number Higher or Lower", difficulty: "Easy", slug: "guess-number-higher-or-lower" },
      { title: "Arranging Coins", difficulty: "Easy", slug: "arranging-coins" },
      { title: "Capacity To Ship Packages Within D Days", difficulty: "Medium", slug: "capacity-to-ship-packages-within-d-days" },
      { title: "Koko Eating Bananas", difficulty: "Medium", slug: "koko-eating-bananas" },
      { title: "Median of Two Sorted Arrays", difficulty: "Hard", slug: "median-of-two-sorted-arrays" },
    ],
  },
  {
    section: "Recursion",
    title: "Dynamic Programming",
    lectureCount: 2,
    questions: [
      { title: "Climbing Stairs", difficulty: "Easy", slug: "climbing-stairs" },
      { title: "House Robber", difficulty: "Medium", slug: "house-robber" },
      { title: "House Robber II", difficulty: "Medium", slug: "house-robber-ii" },
      { title: "Coin Change", difficulty: "Medium", slug: "coin-change" },
      { title: "Longest Increasing Subsequence", difficulty: "Medium", slug: "longest-increasing-subsequence" },
      { title: "Maximum Subarray", difficulty: "Medium", slug: "maximum-subarray" },
      { title: "Unique Paths", difficulty: "Medium", slug: "unique-paths" },
      { title: "Minimum Path Sum", difficulty: "Medium", slug: "minimum-path-sum" },
      { title: "Edit Distance", difficulty: "Hard", slug: "edit-distance" },
      { title: "Longest Common Subsequence", difficulty: "Medium", slug: "longest-common-subsequence" },
    ],
  },
  {
    section: "Basic DS",
    title: "Stack & Queues",
    lectureCount: 2,
    questions: [
      { title: "Valid Parentheses", difficulty: "Easy", slug: "valid-parentheses" },
      { title: "Min Stack", difficulty: "Medium", slug: "min-stack" },
      { title: "Implement Queue using Stacks", difficulty: "Easy", slug: "implement-queue-using-stacks" },
      { title: "Implement Stack using Queues", difficulty: "Easy", slug: "implement-stack-using-queues" },
      { title: "Daily Temperatures", difficulty: "Medium", slug: "daily-temperatures" },
      { title: "Next Greater Element I", difficulty: "Easy", slug: "next-greater-element-i" },
      { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", slug: "evaluate-reverse-polish-notation" },
      { title: "Simplify Path", difficulty: "Medium", slug: "simplify-path" },
      { title: "Number of Recent Calls", difficulty: "Easy", slug: "number-of-recent-calls" },
      { title: "Sliding Window Maximum", difficulty: "Hard", slug: "sliding-window-maximum" },
    ],
  },
  {
    section: "Basic DS",
    title: "Linked List",
    lectureCount: 2,
    questions: [
      { title: "Reverse Linked List", difficulty: "Easy", slug: "reverse-linked-list" },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "merge-two-sorted-lists" },
      { title: "Linked List Cycle", difficulty: "Easy", slug: "linked-list-cycle" },
      { title: "Remove Nth Node From End of List", difficulty: "Medium", slug: "remove-nth-node-from-end-of-list" },
      { title: "Middle of the Linked List", difficulty: "Easy", slug: "middle-of-the-linked-list" },
      { title: "Palindrome Linked List", difficulty: "Easy", slug: "palindrome-linked-list" },
      { title: "Add Two Numbers", difficulty: "Medium", slug: "add-two-numbers" },
      { title: "Intersection of Two Linked Lists", difficulty: "Easy", slug: "intersection-of-two-linked-lists" },
      { title: "Reorder List", difficulty: "Medium", slug: "reorder-list" },
      { title: "Copy List with Random Pointer", difficulty: "Medium", slug: "copy-list-with-random-pointer" },
    ],
  },
  {
    section: "Basic DS",
    title: "Generic Tree",
    lectureCount: 1,
    questions: [
      { title: "N-ary Tree Preorder Traversal", difficulty: "Easy", slug: "n-ary-tree-preorder-traversal" },
      { title: "N-ary Tree Postorder Traversal", difficulty: "Easy", slug: "n-ary-tree-postorder-traversal" },
      { title: "Maximum Depth of N-ary Tree", difficulty: "Easy", slug: "maximum-depth-of-n-ary-tree" },
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "binary-tree-level-order-traversal" },
      { title: "Find Bottom Left Tree Value", difficulty: "Medium", slug: "find-bottom-left-tree-value" },
      { title: "Average of Levels in Binary Tree", difficulty: "Easy", slug: "average-of-levels-in-binary-tree" },
      { title: "Minimum Depth of Binary Tree", difficulty: "Easy", slug: "minimum-depth-of-binary-tree" },
      { title: "Cousins in Binary Tree", difficulty: "Easy", slug: "cousins-in-binary-tree" },
      { title: "Binary Tree Right Side View", difficulty: "Medium", slug: "binary-tree-right-side-view" },
      { title: "Populating Next Right Pointers in Each Node", difficulty: "Medium", slug: "populating-next-right-pointers-in-each-node" },
    ],
  },
  {
    section: "Basic DS",
    title: "Binary Tree",
    lectureCount: 1,
    questions: [
      { title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "binary-tree-inorder-traversal" },
      { title: "Binary Tree Preorder Traversal", difficulty: "Easy", slug: "binary-tree-preorder-traversal" },
      { title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "binary-tree-postorder-traversal" },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "maximum-depth-of-binary-tree" },
      { title: "Same Tree", difficulty: "Easy", slug: "same-tree" },
      { title: "Invert Binary Tree", difficulty: "Easy", slug: "invert-binary-tree" },
      { title: "Symmetric Tree", difficulty: "Easy", slug: "symmetric-tree" },
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "binary-tree-level-order-traversal" },
      { title: "Path Sum", difficulty: "Easy", slug: "path-sum" },
      { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", slug: "lowest-common-ancestor-of-a-binary-tree" },
    ],
  },
  {
    section: "Basic DS",
    title: "Binary Search Tree",
    lectureCount: 1,
    questions: [
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "validate-binary-search-tree" },
      { title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "search-in-a-binary-search-tree" },
      { title: "Insert into a Binary Search Tree", difficulty: "Medium", slug: "insert-into-a-binary-search-tree" },
      { title: "Delete Node in a BST", difficulty: "Medium", slug: "delete-node-in-a-bst" },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "kth-smallest-element-in-a-bst" },
      { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", slug: "lowest-common-ancestor-of-a-binary-search-tree" },
      { title: "Convert Sorted Array to Binary Search Tree", difficulty: "Easy", slug: "convert-sorted-array-to-binary-search-tree" },
      { title: "Range Sum of BST", difficulty: "Easy", slug: "range-sum-of-bst" },
      { title: "Minimum Absolute Difference in BST", difficulty: "Easy", slug: "minimum-absolute-difference-in-bst" },
      { title: "Two Sum IV - Input is a BST", difficulty: "Easy", slug: "two-sum-iv-input-is-a-bst" },
    ],
  },
  {
    section: "Advance DS",
    title: "Hash Map & Heap",
    lectureCount: 3,
    questions: [
      { title: "Two Sum", difficulty: "Easy", slug: "two-sum" },
      { title: "Group Anagrams", difficulty: "Medium", slug: "group-anagrams" },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements" },
      { title: "Valid Anagram", difficulty: "Easy", slug: "valid-anagram" },
      { title: "Subarray Sum Equals K", difficulty: "Medium", slug: "subarray-sum-equals-k" },
      { title: "Longest Consecutive Sequence", difficulty: "Medium", slug: "longest-consecutive-sequence" },
      { title: "Find Median from Data Stream", difficulty: "Hard", slug: "find-median-from-data-stream" },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "kth-largest-element-in-an-array" },
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "merge-k-sorted-lists" },
      { title: "Task Scheduler", difficulty: "Medium", slug: "task-scheduler" },
    ],
  },
  {
    section: "Advance DS",
    title: "Graph",
    lectureCount: 2,
    questions: [
      { title: "Number of Islands", difficulty: "Medium", slug: "number-of-islands" },
      { title: "Clone Graph", difficulty: "Medium", slug: "clone-graph" },
      { title: "Course Schedule", difficulty: "Medium", slug: "course-schedule" },
      { title: "Course Schedule II", difficulty: "Medium", slug: "course-schedule-ii" },
      { title: "Rotting Oranges", difficulty: "Medium", slug: "rotting-oranges" },
      { title: "Pacific Atlantic Water Flow", difficulty: "Medium", slug: "pacific-atlantic-water-flow" },
      { title: "Network Delay Time", difficulty: "Medium", slug: "network-delay-time" },
      { title: "Cheapest Flights Within K Stops", difficulty: "Medium", slug: "cheapest-flights-within-k-stops" },
      { title: "Word Ladder", difficulty: "Hard", slug: "word-ladder" },
      { title: "Find if Path Exists in Graph", difficulty: "Easy", slug: "find-if-path-exists-in-graph" },
    ],
  },
];

async function seedCourseModules(courseId: string) {
  for (const [moduleIndex, moduleSeed] of javaDsaModules.entries()) {
    const courseModule = await prisma.courseModule.upsert({
      where: {
        courseId_orderIndex: {
          courseId,
          orderIndex: moduleIndex + 1,
        },
      },
      update: {
        section: moduleSeed.section,
        title: moduleSeed.title,
        lectureCount: moduleSeed.lectureCount,
        isPublished: true,
      },
      create: {
        courseId,
        section: moduleSeed.section,
        title: moduleSeed.title,
        lectureCount: moduleSeed.lectureCount,
        orderIndex: moduleIndex + 1,
        isPublished: true,
      },
    });

    for (const [questionIndex, question] of moduleSeed.questions.entries()) {
      await prisma.practiceQuestion.upsert({
        where: {
          moduleId_orderIndex: {
            moduleId: courseModule.id,
            orderIndex: questionIndex + 1,
          },
        },
        update: {
          title: question.title,
          difficulty: question.difficulty,
          leetcodeUrl: leetcode(question.slug),
        },
        create: {
          moduleId: courseModule.id,
          title: question.title,
          difficulty: question.difficulty,
          leetcodeUrl: leetcode(question.slug),
          orderIndex: questionIndex + 1,
        },
      });
    }
  }
}

async function main() {
  console.log("Seeding database...");

  const studentPassword = await hash("student123", 12);
  const adminPassword = await hash("Levelpro@2025", 12);

  const student = await prisma.user.upsert({
    where: { email: "student@levelpro.in" },
    update: {
      role: Role.STUDENT,
      profileCompleted: true,
      studentProfile: {
        upsert: {
          update: {
            phone: "+91 98765 43210",
            college: "IIT Delhi",
            courseEnrolled: "DSA in Java",
            graduationYear: 2026,
            stream: "Computer Science & Engineering",
            linkedinUrl: "https://linkedin.com/in/teststudent",
          },
          create: {
            phone: "+91 98765 43210",
            college: "IIT Delhi",
            courseEnrolled: "DSA in Java",
            graduationYear: 2026,
            stream: "Computer Science & Engineering",
            linkedinUrl: "https://linkedin.com/in/teststudent",
          },
        },
      },
    },
    create: {
      email: "student@levelpro.in",
      name: "Test Student",
      hashedPassword: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
      profileCompleted: true,
      studentProfile: {
        create: {
          phone: "+91 98765 43210",
          college: "IIT Delhi",
          courseEnrolled: "DSA in Java",
          graduationYear: 2026,
          stream: "Computer Science & Engineering",
          linkedinUrl: "https://linkedin.com/in/teststudent",
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@levelproedu.com" },
    update: {
      name: "LevelPro Admin",
      hashedPassword: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profileCompleted: true,
    },
    create: {
      email: "admin@levelproedu.com",
      name: "LevelPro Admin",
      hashedPassword: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profileCompleted: true,
    },
  });

  const javaDsaCourse = await prisma.course.upsert({
    where: { slug: "java-dsa-foundation" },
    update: {
      title: "Data Structure Foundation Course with Java",
      description: "A 30-lecture foundation course covering Java programming fundamentals, recursion, core data structures, advanced data structures, and LeetCode practice.",
      isPublished: true,
    },
    create: {
      slug: "java-dsa-foundation",
      title: "Data Structure Foundation Course with Java",
      description: "A 30-lecture foundation course covering Java programming fundamentals, recursion, core data structures, advanced data structures, and LeetCode practice.",
      isPublished: true,
    },
  });

  await seedCourseModules(javaDsaCourse.id);

  const javaDsaBatch = await prisma.batch.upsert({
    where: { id: "levelpro-java-dsa-batch-1" },
    update: {
      name: "Java DSA Batch 1",
      courseId: javaDsaCourse.id,
      schedule: "Mon, Wed, Fri · 8:00 PM IST",
      startDate: new Date("2026-06-20T14:30:00.000Z"),
      isActive: true,
    },
    create: {
      id: "levelpro-java-dsa-batch-1",
      name: "Java DSA Batch 1",
      courseId: javaDsaCourse.id,
      schedule: "Mon, Wed, Fri · 8:00 PM IST",
      startDate: new Date("2026-06-20T14:30:00.000Z"),
      isActive: true,
    },
  });

  const starterCourses = [
    {
      slug: "github-foundations",
      title: "GitHub Foundations",
      description: "Version control, GitHub workflows, pull requests, portfolio-ready repositories, and collaboration habits.",
    },
    {
      slug: "data-science-foundations",
      title: "Data Science Foundations",
      description: "Python, data cleaning, notebooks, visualization, statistics basics, and beginner machine learning projects.",
    },
    {
      slug: "resume-masterclass",
      title: "Resume Masterclass",
      description: "Build a job-ready resume, LinkedIn profile, project storytelling, and recruiter-friendly portfolio.",
    },
  ];

  for (const course of starterCourses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: { ...course, isPublished: true },
      create: { ...course, isPublished: true },
    });
  }

  await prisma.courseEnrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: javaDsaCourse.id,
      },
    },
    update: { status: CourseEnrollmentStatus.ENROLLED },
    create: {
      userId: student.id,
      courseId: javaDsaCourse.id,
      status: CourseEnrollmentStatus.ENROLLED,
    },
  });

  await prisma.batchStudent.upsert({
    where: {
      batchId_userId: {
        batchId: javaDsaBatch.id,
        userId: student.id,
      },
    },
    update: {},
    create: {
      batchId: javaDsaBatch.id,
      userId: student.id,
    },
  });

  const notificationExists = await prisma.notification.findFirst({
    where: {
      title: "Java DSA orientation class",
      courseId: javaDsaCourse.id,
    },
  });

  if (!notificationExists) {
    await prisma.notification.create({
      data: {
        title: "Java DSA orientation class",
        message: "Welcome to LevelPro. Your first Java DSA class will introduce the roadmap, tools, and practice routine.",
        audience: "batch",
        type: NotificationType.CLASS_UPDATE,
        courseId: javaDsaCourse.id,
        batchId: javaDsaBatch.id,
        createdById: admin.id,
        scheduledAt: new Date(),
      },
    });
  }

  console.log("Created test student:", student.email);
  console.log("Created test admin:", admin.email);
  console.log(`Seeded ${javaDsaModules.length} Java DSA modules with ${javaDsaModules.length * 10} LeetCode practice questions.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
