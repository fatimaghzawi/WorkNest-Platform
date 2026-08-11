import { motion } from 'framer-motion';
import { WN, easeOut } from '../constants';

const GREEN = WN.teal;
const GREEN_SOFT = '#5EEAD4';
const GREEN_GLOW = '#99F6E4';

type Props = {
  /** Lines have met — play multi-beat teal match celebration. */
  active: boolean;
};

/**
 * Teal match celebration when client ↔ freelancer connect.
 */
export function GreenMatchEffect({ active }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Beat 1 — center bloom */}
      <motion.div
        className="absolute left-1/2 top-[48%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${GREEN_SOFT}88 0%, ${GREEN}44 35%, transparent 70%)`,
        }}
        initial={false}
        animate={
          active
            ? { opacity: [0, 1, 0.45, 0.9, 0.35], scale: [0.35, 1.25, 1.05, 1.4, 1.15] }
            : { opacity: 0, scale: 0.35 }
        }
        transition={{ duration: 2.8, ease: easeOut }}
      />

      {/* Beat 2–4 — expanding green rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: 72 + i * 28,
            height: 72 + i * 28,
            borderColor: i % 2 === 0 ? GREEN : GREEN_SOFT,
            boxShadow: `0 0 24px ${GREEN_GLOW}66`,
          }}
          initial={false}
          animate={
            active
              ? {
                  opacity: [0, 0.95, 0],
                  scale: [0.55, 1.55],
                }
              : { opacity: 0, scale: 0.55 }
          }
          transition={{
            duration: 1.35,
            delay: 0.18 + i * 0.28,
            ease: easeOut,
            repeat: active ? 2 : 0,
            repeatDelay: 0.35,
          }}
        />
      ))}

      {/* Beat — spark dots around center */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const dist = 70 + (i % 3) * 18;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-[48%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: i % 2 === 0 ? GREEN : GREEN_GLOW }}
            initial={false}
            animate={
              active
                ? {
                    opacity: [0, 1, 0],
                    x: [0, Math.cos(angle) * dist],
                    y: [0, Math.sin(angle) * dist],
                    scale: [0.4, 1.3, 0.2],
                  }
                : { opacity: 0, x: 0, y: 0 }
            }
            transition={{
              duration: 1.1,
              delay: 0.25 + (i % 5) * 0.12,
              ease: easeOut,
              repeat: active ? 1 : 0,
              repeatDelay: 0.55,
            }}
          />
        );
      })}

      {/* MATCHED chip — pulse beats */}
      <motion.div
        className="absolute left-1/2 top-[33%] -translate-x-1/2"
        initial={false}
        animate={
          active
            ? { opacity: [0, 1, 1, 1, 0.85], y: [16, 0, 0, 0, -4], scale: [0.85, 1.08, 1, 1.06, 1] }
            : { opacity: 0, y: 16, scale: 0.85 }
        }
        transition={{ duration: 2.6, ease: easeOut }}
      >
        <div
          className="flex items-center gap-2.5 rounded-full px-5 py-2.5 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${GREEN}, ${GREEN_SOFT})`,
            boxShadow: `0 12px 40px ${GREEN}55`,
          }}
        >
          <motion.span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black"
            style={{ color: GREEN }}
            animate={active ? { scale: [1, 1.2, 1, 1.15, 1] } : {}}
            transition={{ duration: 1.6, repeat: active ? 2 : 0, ease: 'easeInOut' }}
          >
            ✓
          </motion.span>
          <span className="text-[12px] font-bold tracking-[0.22em] text-white">MATCHED</span>
        </div>
      </motion.div>

      {/* Sub-beats: CONNECTED → TRUSTED */}
      <motion.p
        className="absolute left-1/2 top-[40%] -translate-x-1/2 text-[10px] font-bold tracking-[0.24em]"
        style={{ color: GREEN }}
        initial={false}
        animate={
          active
            ? { opacity: [0, 0, 1, 1, 0], y: [8, 8, 0, 0, -6] }
            : { opacity: 0 }
        }
        transition={{ duration: 2.8, ease: easeOut }}
      >
        CLIENT ↔ FREELANCER
      </motion.p>

      {/* Soft full-screen green wash beats */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 48%, ${GREEN}22 0%, transparent 55%)`,
        }}
        initial={false}
        animate={
          active
            ? { opacity: [0, 0.7, 0.25, 0.55, 0.15, 0.4, 0] }
            : { opacity: 0 }
        }
        transition={{ duration: 3.2, ease: easeOut }}
      />
    </div>
  );
}

export const MATCH_GREEN = GREEN;
