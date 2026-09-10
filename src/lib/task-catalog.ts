export type TaskItem = {
  code: string;
  title: string;
  description: string;
  fixedPrice: number;
};

export const TASK_CATALOG: Record<string, TaskItem[]> = {
  Plumber: [
    {
      code: "kitchen_sink_leak",
      title: "Kitchen Sink Leak Fix",
      description: "Leak from tap base, joints, or under-sink pipe.",
      fixedPrice: 499,
    },
    {
      code: "drain_blocked",
      title: "Bathroom/Kitchen Drain Unclog",
      description: "Slow or blocked drainage in sink, wash area, or bathroom.",
      fixedPrice: 549,
    },
    {
      code: "flush_repair",
      title: "Toilet Flush Repair",
      description: "Flush tank repair, low flow, or internal valve replacement.",
      fixedPrice: 649,
    },
  ],
  Electrician: [
    {
      code: "switch_socket_repair",
      title: "Switch/Socket Repair",
      description: "Faulty switch board, loose socket, sparking point.",
      fixedPrice: 399,
    },
    {
      code: "fan_install_repair",
      title: "Ceiling Fan Install/Repair",
      description: "Fan wobble, capacitor issue, install or replacement.",
      fixedPrice: 599,
    },
    {
      code: "mcb_tripping",
      title: "MCB Tripping Diagnosis",
      description: "Frequent tripping, overload checks, basic rewiring fix.",
      fixedPrice: 699,
    },
  ],
  "Pest Control": [
    {
      code: "cockroach_control",
      title: "Cockroach Control (Kitchen + Bathroom)",
      description: "Gel and spray treatment in high-risk areas.",
      fixedPrice: 899,
    },
    {
      code: "ant_control",
      title: "Ant Infestation Control",
      description: "Entry-point treatment and colony reduction.",
      fixedPrice: 799,
    },
    {
      code: "termite_inspection",
      title: "Termite Inspection + Spot Treatment",
      description: "Inspection with localized anti-termite treatment.",
      fixedPrice: 1199,
    },
  ],
  "Home Tutor": [
    {
      code: "math_science_trial",
      title: "Math/Science Trial Session (90 mins)",
      description: "Assessment + customized study roadmap.",
      fixedPrice: 699,
    },
    {
      code: "board_exam_revision",
      title: "Board Exam Revision Session",
      description: "Focused revision with doubt-solving for boards.",
      fixedPrice: 899,
    },
    {
      code: "homework_support",
      title: "Homework Support Session",
      description: "Guided homework completion and concept clarity.",
      fixedPrice: 599,
    },
  ],
};

export function getTaskCatalog(serviceType: string): TaskItem[] {
  return TASK_CATALOG[serviceType] || [];
}
