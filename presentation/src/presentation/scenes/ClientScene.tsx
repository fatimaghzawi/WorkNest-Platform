import { LIVE_APP_URL } from '../data/presentationContent';
import { PerspectiveBadge } from '../components/PerspectiveBadge';
import { BrowserFrame } from '../components/BrowserFrame';
import { SceneContainer } from '../components/SceneContainer';

export function ClientScene({ live = false }: { live?: boolean }) {
  return (
    <SceneContainer className="justify-center gap-4 !py-[3vh]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <PerspectiveBadge perspective="client" />
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-wn-ink md:text-5xl">
            I know what I need.
          </h2>
          <p className="mt-2 max-w-xl text-lg text-wn-muted">
            Publish the project once — then wait for the right person.
          </p>
        </div>
        {live ? (
          <span className="rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-white">
            LIVE DEMO
          </span>
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        {live ? (
          <div className="overflow-hidden rounded-2xl border border-wn-line bg-white shadow-lift">
            <iframe
              title="WorkNest client"
              src={`${LIVE_APP_URL}/login`}
              className="h-[min(62vh,580px)] w-full border-0"
            />
          </div>
        ) : (
          <BrowserFrame
            src="/screenshots/client-create-job.png"
            alt="Client creating a job"
            url="app.worknest.com/client/jobs/create"
            className="shadow-lift [&_img]:h-[min(58vh,540px)]"
          />
        )}

        <div className="flex flex-col justify-center gap-3">
          {[
            { n: '01', t: 'Describe the work', d: 'Clear requirements in one brief' },
            { n: '02', t: 'Set the budget', d: 'Full project amount, up front' },
            { n: '03', t: 'Publish', d: 'Invite real proposals' },
          ].map((item) => (
            <div
              key={item.n}
              className="rounded-2xl border border-wn-line/80 bg-white/90 px-5 py-4 shadow-card"
            >
              <p className="text-[11px] font-bold tracking-[0.16em] text-wn-primary">{item.n}</p>
              <p className="mt-1 font-display text-xl font-bold text-wn-ink">{item.t}</p>
              <p className="mt-1 text-sm text-wn-muted">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </SceneContainer>
  );
}
