export default function Testimonial() {
  return (
    <section
      id="testimonials"
      style={{
        position: 'relative',
        height: '60vh',
        minHeight: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        textAlign: 'center',
        padding: '0 20px'
      }}
    >
      <div 
        style={{
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        <span 
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold)'
          }}
        >
          client love
        </span>
        
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            lineHeight: '1.3',
            color: 'var(--text-primary)',
            fontWeight: 400
          }}
        >
          "I can't say enough good things about Glow Haven. The atmosphere is relaxing, and my stylist is truly an artist!"
        </h2>
        
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          — Eleanor Vance, Studio regular
        </p>
      </div>
    </section>
  );
}
