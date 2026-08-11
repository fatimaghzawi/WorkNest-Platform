import { BrowserFrame } from '../components/BrowserFrame';
import { Eyebrow, Scene } from '../components/Scene';
import { shots } from '../data/story';

export function ClientMoment({ step = 0 }: { step?: number }) {
  const publishing = step < 1;
  return (
    <Scene tone="soft" className="justify-center gap-4 !py-[2.2vh]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Act I · Client</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1A1224] md:text-4xl">
            {publishing ? 'Post the work once.' : 'The job is live.'}
          </h2>
          <p className="mt-2 max-w-xl text-base text-[#5B5268] md:text-lg">
            {publishing
              ? 'Sarah knows what she needs — a business website — and publishes a clear brief.'
              : 'Freelancers can now discover the opportunity and propose.'}
          </p>
        </div>
        <span className="rounded-full bg-[#49225B] px-4 py-1.5 text-[11px] font-bold tracking-[0.16em] text-white">
          CLIENT VIEW
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <BrowserFrame
          src={shots.createJob}
          alt="Post a new job"
          url="app.worknest.com/client/jobs/new"
          imgClassName="max-h-[min(56vh,520px)]"
        />
        <div className="flex flex-col justify-center gap-3">
          {[
            { n: '01', t: 'Title + brief', d: 'Scope in one place' },
            { n: '02', t: 'Budget', d: 'Full project amount' },
            { n: '03', t: 'Publish', d: 'Invite proposals' },
            { n: '04', t: 'Live preview', d: 'See how freelancers see it' },
          ].map((item) => (
            <div
              key={item.n}
              className="rounded-2xl border border-[#E8E0F0] bg-white px-4 py-3.5 shadow-sm"
            >
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#49225B]">{item.n}</p>
              <p className="mt-1 font-display text-lg font-bold text-[#1A1224]">{item.t}</p>
              <p className="text-sm text-[#5B5268]">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
}
