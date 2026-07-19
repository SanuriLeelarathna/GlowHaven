export default function Testimonial() {
  return (
    <section
      id="testimonials"
      style={{
        position: 'relative',
        height: '50vh',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--soft-pink)',
        color: 'var(--text-dark)',
        textAlign: 'center',
        padding: '0 20px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div 
        style={{
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <span 
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold-dark)',
            fontWeight: 600
          }}
        >
          client testimonial
        </span>
        
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
            lineHeight: '1.4',
            color: 'var(--deep-pink)',
            fontWeight: 300
          }}
        >
          "I can't say enough good things about Glow Haven. The atmosphere is relaxing, and my stylist is truly an artist!"
        </h2>
        
        <div style={{ width: '40px', height: '1px', background: 'var(--accent-gold)' }} />
        
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--text-gray)',
            fontWeight: 600
          }}
        >
          — Eleanor Vance, Studio regular
        </p>
      </div>
    </section>
  );
}
