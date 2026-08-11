import { motion } from 'framer-motion';
import { WN, easeOut } from '../constants';

const GREEN = WN.teal;
const GREEN_SOFT = '#5EEAD4';

type Props = {
  partial: boolean;
  full: boolean;
  morphing?: boolean;
  showMatchHint?: boolean;
};

export function ConnectionLine({ partial, full, morphing, showMatchHint }: Props) {
  const active = partial || full;
  const strokeA = full ? GREEN : WN.purple;
  const strokeB = full ? GREEN_SOFT : WN.orange;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M 18 38 C 34 38, 40 48, 50 48"
          fill="none"
          stroke={strokeA}
          strokeWidth={full ? 0.42 : 0.28}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            morphing
              ? { pathLength: 0, opacity: 0 }
              : full
                ? { pathLength: 1, opacity: [0.55, 1, 0.75, 1, 0.8] }
                : partial
                  ? { pathLength: 0.72, opacity: 0.45 }
                  : { pathLength: 0, opacity: 0 }
          }
          transition={{
            pathLength: { duration: 0.9, ease: easeOut },
            opacity: full
              ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.75 },
          }}
        />
        <motion.path
          d="M 82 38 C 66 38, 60 48, 50 48"
          fill="none"
          stroke={strokeB}
          strokeWidth={full ? 0.42 : 0.28}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            morphing
              ? { pathLength: 0, opacity: 0 }
              : full
                ? { pathLength: 1, opacity: [0.55, 1, 0.75, 1, 0.8] }
                : partial
                  ? { pathLength: 0.72, opacity: 0.45 }
                  : { pathLength: 0, opacity: 0 }
          }
          transition={{
            pathLength: { duration: 0.9, ease: easeOut },
            opacity: full
              ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }
              : { duration: 0.75 },
          }}
        />

        {full && !morphing ? (
          <>
            <motion.circle
              cx="50"
              cy="48"
              r="1.4"
              fill={GREEN}
              animate={{ r: [1.2, 2.2, 1.2], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="30"
              cy="40"
              r="0.65"
              fill={GREEN}
              animate={{ cx: [18, 50], opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="70"
              cy="40"
              r="0.65"
              fill={GREEN_SOFT}
              animate={{ cx: [82, 50], opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
            />
          </>
        ) : null}
      </svg>

      <motion.p
        className="absolute left-1/2 top-[29%] -translate-x-1/2 text-[10px] font-semibold tracking-[0.22em] text-[#8B8298]"
        initial={false}
        animate={
          showMatchHint && active && !full && !morphing
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 6 }
        }
        transition={{ duration: 0.55 }}
      >
        LOOKING FOR THE RIGHT MATCH
      </motion.p>
    </div>
  );
}
