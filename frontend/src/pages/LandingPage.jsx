import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Radio,
  Users,
  ArrowRight,
} from "lucide-react";
import "./LandingPage.css";

/* ─── Scroll Reveal Hook ──────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing__reveal--visible");
          }
        });
      },
      { threshold: 0.15 },
    );

    const elements = ref.current?.querySelectorAll(".landing__reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Landing Page ────────────────────────────────────────── */
export default function LandingPage() {
  const containerRef = useReveal();

  return (
    <div className="landing" ref={containerRef}>
      {/* ── Navbar ── */}
      <nav className="landing__nav" id="landing-nav">
        <Link to="/" className="landing__nav-logo">
          <span className="landing__nav-logo-icon">
            <LayoutDashboard size={20} />
          </span>
          <span className="landing__nav-logo-text">
            <span>Task</span>Flow
          </span>
        </Link>

        <div className="landing__nav-actions">
          <Link to="/login" className="landing__btn landing__btn--ghost">
            Sign in
          </Link>
          <Link to="/signup" className="landing__btn landing__btn--primary">
            Get started!
          </Link>
        </div>
      </nav>

      {/* ═════════════════════════════════════════════════════
          HERO
          ═════════════════════════════════════════════════════ */}
      <section className="landing__hero" id="hero">
        <div className="landing__hero-content">
          <h1 className="landing__hero-title">
            A better way to <strong>manage your team&apos;s work</strong>
          </h1>
          <p className="landing__hero-desc">
            TaskFlow helps teams organize tasks, track progress, and collaborate
            in real time — all in one simple, beautiful workspace.
          </p>
          <div className="landing__hero-actions">
            <Link
              to="/signup"
              className="landing__btn landing__btn--primary-large"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="landing__btn landing__btn--outline-large"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Board Preview ── */}
      <div className="landing__hero-preview">
        <div className="landing__preview-window">
          <div className="landing__preview-titlebar">
            <span className="landing__preview-dot" />
            <span className="landing__preview-dot" />
            <span className="landing__preview-dot" />
          </div>
          <div className="landing__preview-board">
            {/* To Do */}
            <div className="landing__preview-col">
              <div className="landing__preview-col-title">To Do</div>
              <PreviewCard
                title="Design system tokens"
                tags={[{ label: "Design", type: "design" }]}
                avatar={{ bg: "#8e24aa", initials: "JK" }}
                date="Feb 16"
              />
              <PreviewCard
                title="API auth middleware"
                tags={[{ label: "Backend", type: "api" }]}
                avatar={{ bg: "#1a73e8", initials: "RM" }}
                date="Feb 18"
              />
            </div>

            {/* In Progress */}
            <div className="landing__preview-col">
              <div className="landing__preview-col-title">In Progress</div>
              <PreviewCard
                title="Kanban drag & drop"
                tags={[{ label: "Frontend", type: "frontend" }]}
                avatar={{ bg: "#1e8e3e", initials: "AL" }}
                date="Feb 15"
              />
              <PreviewCard
                title="Fix socket reconnect"
                tags={[{ label: "Bug", type: "bug" }]}
                avatar={{ bg: "#e37400", initials: "TS" }}
                date="Feb 14"
              />
            </div>

            {/* Done */}
            <div className="landing__preview-col">
              <div className="landing__preview-col-title">Done</div>
              <PreviewCard
                title="User authentication"
                tags={[{ label: "Backend", type: "api" }]}
                avatar={{ bg: "#1a73e8", initials: "RM" }}
                date="Feb 12"
              />
              <PreviewCard
                title="Board CRUD operations"
                tags={[{ label: "Frontend", type: "frontend" }]}
                avatar={{ bg: "#8e24aa", initials: "JK" }}
                date="Feb 10"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="landing__divider" style={{ marginTop: "5rem" }} />

      {/* ═════════════════════════════════════════════════════
          FEATURES
          ═════════════════════════════════════════════════════ */}
      <section className="landing__section" id="features">
        <div className="landing__section-header landing__reveal">
          <h2 className="landing__section-title">
            Simple tools, powerful results
          </h2>
          <p className="landing__section-desc">
            Everything you need to keep your projects on track.
          </p>
        </div>

        <div className="landing__features">
          <div className="landing__feature-card landing__reveal landing__reveal-delay-1">
            <div className="landing__feature-icon">
              <Layers size={22} />
            </div>
            <h3 className="landing__feature-title">Kanban Boards</h3>
            <p className="landing__feature-desc">
              Visualize your workflow with drag-and-drop columns and cards.
            </p>
          </div>

          <div className="landing__feature-card landing__reveal landing__reveal-delay-2">
            <div className="landing__feature-icon">
              <Radio size={22} />
            </div>
            <h3 className="landing__feature-title">Real-Time Updates</h3>
            <p className="landing__feature-desc">
              See changes instantly as your team works together.
            </p>
          </div>

          <div className="landing__feature-card landing__reveal landing__reveal-delay-3">
            <div className="landing__feature-icon">
              <Users size={22} />
            </div>
            <h3 className="landing__feature-title">Team Collaboration</h3>
            <p className="landing__feature-desc">
              Assign tasks, track activity, and stay in sync.
            </p>
          </div>
        </div>
      </section>

      <hr className="landing__divider" />

      {/* ═════════════════════════════════════════════════════
          HOW IT WORKS
          ═════════════════════════════════════════════════════ */}
      <section className="landing__section" id="how-it-works">
        <div className="landing__section-header landing__reveal">
          <h2 className="landing__section-title">Get started in minutes</h2>
          <p className="landing__section-desc">
            Three simple steps to a more organized team.
          </p>
        </div>

        <div className="landing__steps">
          <div className="landing__step landing__reveal landing__reveal-delay-1">
            <div className="landing__step-number">1</div>
            <h3 className="landing__step-title">Create a board</h3>
            <p className="landing__step-desc">
              Set up columns that match your workflow.
            </p>
          </div>
          <div className="landing__step landing__reveal landing__reveal-delay-2">
            <div className="landing__step-number">2</div>
            <h3 className="landing__step-title">Add your tasks</h3>
            <p className="landing__step-desc">
              Create cards with descriptions and labels.
            </p>
          </div>
          <div className="landing__step landing__reveal landing__reveal-delay-3">
            <div className="landing__step-number">3</div>
            <h3 className="landing__step-title">Collaborate</h3>
            <p className="landing__step-desc">
              Work together in real time. Track everything.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          CTA
          ═════════════════════════════════════════════════════ */}
      <section className="landing__cta">
        <h2 className="landing__cta-title">Ready to get organized?</h2>
        <p className="landing__cta-desc">
          Start managing your projects better today.
        </p>
        <div className="landing__cta-actions">
          <Link
            to="/signup"
            className="landing__btn landing__btn--primary-large"
          >
            Get started!
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing__footer">
        <p className="landing__footer-text">
          © {new Date().getFullYear()} TaskFlow
        </p>
      </footer>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function PreviewCard({ title, tags, avatar, date }) {
  return (
    <div className="landing__preview-card">
      <div className="landing__preview-card-title">{title}</div>
      <div>
        {tags.map((t) => (
          <span
            key={t.label}
            className={`landing__preview-card-tag landing__preview-card-tag--${t.type}`}
          >
            {t.label}
          </span>
        ))}
      </div>
      <div className="landing__preview-card-meta">
        <div
          className="landing__preview-card-avatar"
          style={{ background: avatar.bg }}
        >
          {avatar.initials}
        </div>
        <span className="landing__preview-card-date">{date}</span>
      </div>
    </div>
  );
}
