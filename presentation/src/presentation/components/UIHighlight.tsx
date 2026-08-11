import { motion } from 'framer-motion';

export function UIHighlight({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute rounded-xl border-2 border-wn-orange/80 bg-wn-orange/10 shadow-[0_0_0_6px_rgba(249,115,22,0.12)] ${className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span className="absolute -top-3 left-3 rounded-full bg-wn-orange px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
        {label}
      </span>
    </motion.div>
  );
}
