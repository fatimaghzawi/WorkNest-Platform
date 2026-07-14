import "../css/Hero.css";

export interface HeroPhoto {
  src: string;
  alt: string;
}

export interface HeroProps {
  eyebrow?: string;
  /** Plain text before the highlighted word, e.g. "Find the Right". */
  titleLead?: string;
  /** The word rendered in the script accent font, e.g. "Freelancer". */
  titleAccent?: string;
  /** Plain text after the highlighted word, e.g. "Build Amazing Projects." */
  titleTail?: string;
  subtitle?: string;
  /** Trust line under the subtitle, e.g. social proof stats. */
  trustText?: string;
  /** Three circular photos scattered around the headline. Pass [] to hide. */
  photos?: [HeroPhoto?, HeroPhoto?, HeroPhoto?];
  className?: string;
}

const DEFAULT_PHOTOS: [HeroPhoto, HeroPhoto, HeroPhoto] = [
  { src: "https://i.pravatar.cc/200?img=47", alt: "Freelance designer smiling" },
  { src: "https://i.pravatar.cc/200?img=12", alt: "Freelance developer at work" },
  { src: "https://i.pravatar.cc/200?img=32", alt: "Freelance writer smiling" },
];

export default function Hero({
  eyebrow = "🔥 500+ Freelancers Ready to Work",
  titleLead = "Find the Right",
  titleAccent = "Freelancer",
  titleTail = "Build Amazing Projects.",
  subtitle = "WorkNest connects businesses with talented freelancers for secure and efficient project collaboration.",
  trustText = "Trusted by 500+ freelancers · 200+ clients · 800+ projects delivered",
  photos = DEFAULT_PHOTOS,
  className = "",
}: HeroProps) {
  const [photoA, photoB, photoC] = photos;

  return (
    <section className={`wn-hero ${className}`.trim()}>
      <div className="wn-hero__decor" aria-hidden="true">
        <span className="wn-hero__blob wn-hero__blob--accent" />
        <span className="wn-hero__blob wn-hero__blob--secondary" />
        <span className="wn-hero__blob wn-hero__blob--gold" />
        <span className="wn-hero__blob wn-hero__blob--light" />

        {photoA && (
          <span className="wn-hero__photo wn-hero__photo--a">
            <img src={photoA.src} alt={photoA.alt} />
          </span>
        )}
        {photoB && (
          <span className="wn-hero__photo wn-hero__photo--b">
            <img src={photoB.src} alt={photoB.alt} />
          </span>
        )}
        {photoC && (
          <span className="wn-hero__photo wn-hero__photo--c">
            <img src={photoC.src} alt={photoC.alt} />
          </span>
        )}
      </div>

      <div className="wn-hero__content">
        {eyebrow && <span className="wn-hero__eyebrow">{eyebrow}</span>}

        <h1 className="wn-hero__title">
          {titleLead} <span className="wn-hero__script">{titleAccent}</span>
          <br />
          {titleTail}
        </h1>

        <p className="wn-hero__subtitle">{subtitle}</p>

        {trustText && <p className="wn-hero__trust">{trustText}</p>}
      </div>
    </section>
  );
}
