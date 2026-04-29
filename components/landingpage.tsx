type Feature = {
  title: string;
  description: string;
};

type Step = {
  title: string;
  description: string;
};

type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

const features: Feature[] = [
  {
    title: "Employee Management",
    description: "Centralize employee records, documents, and lifecycle updates in one place.",
  },
  {
    title: "Attendance Tracking",
    description: "Monitor attendance in real time with smart logs, shifts, and approvals.",
  },
  {
    title: "Leave Management",
    description: "Automate leave requests, approvals, policies, and team calendar visibility.",
  },
  {
    title: "Payroll Automation",
    description: "Run compliant payroll with deductions, bonuses, and pay slip generation.",
  },
  {
    title: "Recruitment System",
    description: "Track candidates from job posting to onboarding with a streamlined pipeline.",
  },
  {
    title: "Performance Evaluation",
    description: "Set goals, run reviews, and measure performance with actionable insights.",
  },
];

const steps: Step[] = [
  {
    title: "Step 1: Add employees",
    description: "Import your team details and create organized employee profiles in minutes.",
  },
  {
    title: "Step 2: Track attendance & leaves",
    description: "Track time, attendance, and leave requests with automated workflows.",
  },
  {
    title: "Step 3: Manage payroll & reports",
    description: "Process payroll and access powerful reports for smarter HR decisions.",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Sarah Khan",
    role: "HR Manager",
    company: "NovaTech Solutions",
    quote:
      "SmartHR reduced our HR admin workload by nearly 40%. Payroll and leave approvals are finally effortless.",
  },
  {
    name: "Daniel Lee",
    role: "People Operations Lead",
    company: "BrightWave Digital",
    quote:
      "The dashboard gives us instant visibility into our workforce, helping us make faster and better decisions.",
  },
  {
    name: "Ayesha Rahman",
    role: "COO",
    company: "PeakRetail",
    quote:
      "From recruitment to performance reviews, SmartHR helped us scale our team without scaling complexity.",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    price: "$19",
    description: "For small teams starting with HR automation.",
    features: ["Up to 25 employees", "Attendance & leave tracking", "Email support"],
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing teams that need advanced workflows.",
    features: [
      "Up to 150 employees",
      "Payroll automation",
      "Performance evaluation",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex HR needs.",
    features: ["Unlimited employees", "Advanced analytics", "Dedicated success manager"],
  },
];

function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        {badge}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{subtitle}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-blue-50/60">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              Trusted by modern HR teams
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Manage Your Workforce Smarter with SmartHR
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              SmartHR automates your core HR operations so your team can focus on people, growth, and
              better workplace experiences.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg">
                Get Started
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
                Request Demo
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">HR Dashboard Overview</p>
                  <p className="text-xs text-slate-500">Workforce status - This month</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  +18% efficiency
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total Employees</p>
                  <p className="mt-2 text-2xl font-semibold">248</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">On Leave</p>
                  <p className="mt-2 text-2xl font-semibold">12</p>
                </div>
                <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Attendance Trend</p>
                  <div className="mt-3 flex items-end gap-2">
                    {[35, 50, 42, 58, 64, 54, 70].map((height, idx) => (
                      <div
                        key={idx}
                        className="w-full rounded-md bg-blue-400/80"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          badge="Features"
          title="Everything You Need to Run HR Efficiently"
          subtitle="Designed to simplify operations, increase visibility, and improve employee experiences."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            badge="How It Works"
            title="A Simple 3-Step HR Workflow"
            subtitle="Get started quickly and manage the full employee lifecycle from one platform."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          badge="Dashboard Preview"
          title="Insights That Keep HR Proactive"
          subtitle="A clean analytics workspace that helps your team monitor trends and take action."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Monthly Payroll</p>
            <p className="mt-2 text-3xl font-bold">$184,200</p>
            <p className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
              +6.2% from last month
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Active Recruitments</p>
            <p className="mt-2 text-3xl font-bold">18</p>
            <p className="mt-2 text-xs text-slate-500">Across engineering, sales, and operations</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Review Completion</p>
            <p className="mt-2 text-3xl font-bold">91%</p>
            <p className="mt-2 text-xs text-slate-500">Quarterly evaluations completed on time</p>
          </div>
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Department Performance</p>
              <span className="text-xs text-slate-500">Q2 Snapshot</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: "Engineering", value: 92 },
                { label: "Sales", value: 88 },
                { label: "Operations", value: 84 },
                { label: "Support", value: 90 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading
            badge="Testimonials"
            title="Teams Love Using SmartHR"
            subtitle="Hear what HR leaders say about switching to SmartHR."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-md"
              >
                <blockquote className="text-sm leading-6 text-slate-700">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-slate-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          badge="Pricing"
          title="Simple Pricing for Every Team"
          subtitle="Choose a plan that matches your business stage and scale with confidence."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${
                plan.highlighted
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white">
                    Most Popular
                  </span>
                )}
              </div>
              <p className="mt-4 text-3xl font-bold">
                {plan.price}
                {plan.price !== "Custom" && <span className="text-base font-medium">/mo</span>}
              </p>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-blue-100" : "text-slate-600"}`}>
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-slate-900 text-white hover:bg-slate-700"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-white sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-200">Ready to scale HR smarter?</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Start managing your team efficiently today
              </h2>
            </div>
            <button className="inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-blue-50">
              Get Started
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-lg font-bold text-slate-900">SmartHR</p>
            <p className="text-sm text-slate-500">Modern HRMS for growing companies.</p>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <a className="transition hover:text-slate-900" href="#">
              About
            </a>
            <a className="transition hover:text-slate-900" href="#">
              Contact
            </a>
            <a className="transition hover:text-slate-900" href="#">
              Privacy Policy
            </a>
          </nav>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SmartHR by <span className="font-medium">SmartHR Inc.</span>
        </div>
      </footer>
    </main>
  );
}
