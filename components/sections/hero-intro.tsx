/**
 * The headline, revealed on load rather than on scroll.
 *
 * Each line sits in its own clipped box and rises out of it. The motion is CSS
 * (.k-intro in globals.css), so it starts with the first paint instead of
 * waiting for the JavaScript bundle — this is the page's largest text. The
 * period after "GYERE" is the whole point of the line break: two sentences, not
 * one slogan.
 */
const LINES = ['Gyere.', 'Tartozz közénk.'] as const;

export function HeroIntro(): React.JSX.Element {
  return (
    <h1
      className="k-display-hero k-intro"
      style={{ '--k-intro-delay': '0.12s' } as React.CSSProperties}
    >
      {LINES.map((line, index) => (
        <span className="k-line" key={line}>
          <span
            className="k-line-inner"
            style={{ '--k-line-index': index } as React.CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </h1>
  );
}
